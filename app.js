// ============================================================
// KaaroPercussion - Application Logic
// ============================================================

(function() {
  'use strict';

  // ============================================================
  // STATE
  // ============================================================
  const State = {
    progress: null,
    currentView: 'dashboard',
    currentPhaseId: null,
    currentLessonId: null,
    currentExerciseId: null,
    expandedLessons: new Set()
  };

  // ============================================================
  // STORAGE
  // ============================================================
  const STORAGE_KEY = 'kaaro_percussion_progress';

  const DEFAULT_PROGRESS = {
    version: 1,
    totalXP: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastPracticeDate: null,
    completedExercises: {},
    metronomeSettings: { bpm: 70, timeSig: 4, subdivision: 1 }
  };

  const Storage = {
    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        State.progress = raw ? { ...DEFAULT_PROGRESS, ...JSON.parse(raw) } : { ...DEFAULT_PROGRESS };
      } catch {
        State.progress = { ...DEFAULT_PROGRESS };
      }
    },
    save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(State.progress));
      } catch { /* storage full, silently fail */ }
    },
    reset() {
      State.progress = { ...DEFAULT_PROGRESS };
      Storage.save();
    }
  };

  // ============================================================
  // GAMIFICATION
  // ============================================================
  const Gamification = {
    getLevel(xp) {
      let result = LEVELS[0];
      for (const lvl of LEVELS) {
        if (xp >= lvl.xpMin) result = lvl;
        else break;
      }
      return result;
    },

    getNextLevel(xp) {
      for (const lvl of LEVELS) {
        if (xp < lvl.xpMin) return lvl;
      }
      return null;
    },

    addXP(amount) {
      const oldLevel = this.getLevel(State.progress.totalXP);
      State.progress.totalXP += amount;
      const newLevel = this.getLevel(State.progress.totalXP);

      // Update practice date for streaks
      const today = new Date().toISOString().split('T')[0];
      if (State.progress.lastPracticeDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (State.progress.lastPracticeDate === yesterday) {
          State.progress.currentStreak++;
        } else if (State.progress.lastPracticeDate !== today) {
          State.progress.currentStreak = 1;
        }
        if (State.progress.currentStreak > State.progress.longestStreak) {
          State.progress.longestStreak = State.progress.currentStreak;
        }
        State.progress.lastPracticeDate = today;
      }

      Storage.save();
      UI.showToast(`+${amount} XP`, 'xp');

      if (newLevel.level > oldLevel.level) {
        setTimeout(() => UI.showLevelUp(newLevel), 500);
      }

      // Check for phase unlocks
      for (const phase of COURSE_DATA.phases) {
        if (phase.xpRequired > 0 && State.progress.totalXP >= phase.xpRequired) {
          // Check if newly unlocked
          const wasLocked = (State.progress.totalXP - amount) < phase.xpRequired;
          if (wasLocked) {
            setTimeout(() => UI.showToast(`Phase ${phase.id} Unlocked: ${phase.title}!`, 'unlock'), 1000);
          }
        }
      }

      UI.updateHeader();
    },

    completeExercise(exerciseId) {
      if (State.progress.completedExercises[exerciseId]) return false;
      const exercise = this.findExercise(exerciseId);
      if (!exercise) return false;

      State.progress.completedExercises[exerciseId] = {
        completedAt: new Date().toISOString()
      };
      Storage.save();
      this.addXP(exercise.xpReward || 50);
      return true;
    },

    isExerciseComplete(id) {
      return !!State.progress.completedExercises[id];
    },

    isPhaseUnlocked(phaseId) {
      const phase = COURSE_DATA.phases.find(p => p.id === phaseId);
      return phase && State.progress.totalXP >= phase.xpRequired;
    },

    getPhaseProgress(phaseId) {
      const phase = COURSE_DATA.phases.find(p => p.id === phaseId);
      if (!phase) return 0;
      let total = 0, done = 0;
      for (const lesson of phase.lessons) {
        for (const ex of lesson.exercises) {
          total++;
          if (this.isExerciseComplete(ex.id)) done++;
        }
      }
      return total === 0 ? 0 : Math.round((done / total) * 100);
    },

    isLessonComplete(lessonId) {
      for (const phase of COURSE_DATA.phases) {
        const lesson = phase.lessons.find(l => l.id === lessonId);
        if (lesson) {
          return lesson.exercises.every(ex => this.isExerciseComplete(ex.id));
        }
      }
      return false;
    },

    getLessonStatus(lessonId) {
      for (const phase of COURSE_DATA.phases) {
        const lesson = phase.lessons.find(l => l.id === lessonId);
        if (lesson) {
          const done = lesson.exercises.filter(ex => this.isExerciseComplete(ex.id)).length;
          if (done === 0) return 'not-started';
          if (done === lesson.exercises.length) return 'completed';
          return 'in-progress';
        }
      }
      return 'not-started';
    },

    findExercise(exerciseId) {
      for (const phase of COURSE_DATA.phases) {
        for (const lesson of phase.lessons) {
          const ex = lesson.exercises.find(e => e.id === exerciseId);
          if (ex) return ex;
        }
      }
      return null;
    },

    findExerciseContext(exerciseId) {
      for (const phase of COURSE_DATA.phases) {
        for (const lesson of phase.lessons) {
          const ex = lesson.exercises.find(e => e.id === exerciseId);
          if (ex) return { phase, lesson, exercise: ex };
        }
      }
      return null;
    },

    getTotalExercises() {
      let total = 0;
      for (const phase of COURSE_DATA.phases) {
        for (const lesson of phase.lessons) {
          total += lesson.exercises.length;
        }
      }
      return total;
    },

    getCompletedCount() {
      return Object.keys(State.progress.completedExercises).length;
    }
  };

  // ============================================================
  // METRONOME (Web Audio API)
  // ============================================================
  const Metro = {
    audioCtx: null,
    isPlaying: false,
    bpm: 70,
    timeSig: 4,
    subdivision: 1,
    currentBeat: 0,
    currentSubBeat: 0,
    nextNoteTime: 0,
    schedulerTimer: null,
    lookahead: 25,      // ms - how often scheduler runs
    scheduleAhead: 0.1, // seconds - how far ahead to schedule

    init() {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      // Load saved settings
      const s = State.progress.metronomeSettings;
      if (s) {
        this.bpm = s.bpm || 70;
        this.timeSig = s.timeSig || 4;
        this.subdivision = s.subdivision || 1;
      }
    },

    start() {
      this.init();
      this.isPlaying = true;
      this.currentBeat = 0;
      this.currentSubBeat = 0;
      this.nextNoteTime = this.audioCtx.currentTime;
      this.scheduler();
      document.getElementById('metro-play').innerHTML = '&#9724; Stop';
      document.getElementById('metro-play').classList.add('playing');
      document.getElementById('metronome-toggle').classList.add('active');
    },

    stop() {
      this.isPlaying = false;
      clearTimeout(this.schedulerTimer);
      document.getElementById('metro-play').innerHTML = '&#9654; Play';
      document.getElementById('metro-play').classList.remove('playing');
      document.getElementById('metronome-toggle').classList.remove('active');
      // Clear pulse dots
      document.querySelectorAll('.pulse-dot').forEach(d => d.classList.remove('active'));
    },

    toggle() {
      if (this.isPlaying) this.stop();
      else this.start();
    },

    scheduler() {
      while (this.nextNoteTime < this.audioCtx.currentTime + this.scheduleAhead) {
        this.scheduleNote(this.nextNoteTime, this.currentBeat, this.currentSubBeat);
        this.advanceBeat();
      }
      this.schedulerTimer = setTimeout(() => this.scheduler(), this.lookahead);
    },

    scheduleNote(time, beat, subBeat) {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      let freq, duration, vol;
      if (subBeat === 0 && beat === 0) {
        // Downbeat accent
        freq = 1000; duration = 0.05; vol = 0.6;
      } else if (subBeat === 0) {
        // Beat
        freq = 800; duration = 0.04; vol = 0.4;
      } else {
        // Subdivision
        freq = 600; duration = 0.03; vol = 0.2;
      }

      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
      osc.start(time);
      osc.stop(time + duration);

      // Schedule UI update
      const msUntil = (time - this.audioCtx.currentTime) * 1000;
      if (subBeat === 0) {
        setTimeout(() => this.updatePulseUI(beat), Math.max(0, msUntil));
      }
    },

    advanceBeat() {
      const secondsPerBeat = 60.0 / this.bpm;
      const secondsPerSubBeat = secondsPerBeat / this.subdivision;
      this.nextNoteTime += secondsPerSubBeat;

      this.currentSubBeat++;
      if (this.currentSubBeat >= this.subdivision) {
        this.currentSubBeat = 0;
        this.currentBeat++;
        if (this.currentBeat >= this.timeSig) {
          this.currentBeat = 0;
        }
      }
    },

    updatePulseUI(beat) {
      const dots = document.querySelectorAll('.pulse-dot');
      dots.forEach((d, i) => {
        d.classList.toggle('active', i === beat);
        d.classList.toggle('downbeat', i === 0);
      });
    },

    setBPM(bpm) {
      this.bpm = Math.max(30, Math.min(300, bpm));
      document.getElementById('bpm-display').textContent = this.bpm;
      document.getElementById('bpm-slider').value = this.bpm;
      State.progress.metronomeSettings.bpm = this.bpm;
      Storage.save();
    },

    setTimeSig(ts) {
      this.timeSig = ts;
      State.progress.metronomeSettings.timeSig = ts;
      Storage.save();
      this.renderPulseDots();
      if (this.isPlaying) { this.stop(); this.start(); }
    },

    setSubdivision(sub) {
      this.subdivision = sub;
      State.progress.metronomeSettings.subdivision = sub;
      Storage.save();
      if (this.isPlaying) { this.stop(); this.start(); }
    },

    renderPulseDots() {
      const container = document.getElementById('metronome-pulse');
      container.innerHTML = '';
      for (let i = 0; i < this.timeSig; i++) {
        const dot = document.createElement('div');
        dot.className = 'pulse-dot';
        container.appendChild(dot);
      }
    },

    // Tap Tempo
    tapTimes: [],
    tap() {
      const now = Date.now();
      this.tapTimes.push(now);
      if (this.tapTimes.length > 5) this.tapTimes.shift();
      if (this.tapTimes.length >= 2) {
        let total = 0;
        for (let i = 1; i < this.tapTimes.length; i++) {
          total += this.tapTimes[i] - this.tapTimes[i - 1];
        }
        const avg = total / (this.tapTimes.length - 1);
        const bpm = Math.round(60000 / avg);
        this.setBPM(bpm);
      }
      // Reset if gap > 2s
      if (this.tapTimes.length >= 2) {
        const last2 = this.tapTimes.slice(-2);
        if (last2[1] - last2[0] > 2000) {
          this.tapTimes = [now];
        }
      }
    }
  };

  // ============================================================
  // PRACTICE TIMER
  // ============================================================
  const Timer = {
    interval: null,
    remaining: 0,
    total: 0,
    isRunning: false,

    start(minutes) {
      this.total = minutes * 60;
      this.remaining = this.total;
      this.isRunning = true;
      this.updateDisplay();
      this.interval = setInterval(() => {
        this.remaining--;
        this.updateDisplay();
        if (this.remaining <= 0) {
          this.stop();
          UI.showToast('Timer complete!', 'streak');
        }
      }, 1000);
    },

    pause() {
      this.isRunning = false;
      clearInterval(this.interval);
    },

    resume() {
      this.isRunning = true;
      this.interval = setInterval(() => {
        this.remaining--;
        this.updateDisplay();
        if (this.remaining <= 0) {
          this.stop();
          UI.showToast('Timer complete!', 'streak');
        }
      }, 1000);
    },

    stop() {
      this.isRunning = false;
      clearInterval(this.interval);
      this.remaining = 0;
    },

    reset(minutes) {
      this.stop();
      this.total = minutes * 60;
      this.remaining = this.total;
      this.updateDisplay();
    },

    updateDisplay() {
      const el = document.getElementById('timer-display');
      if (!el) return;
      const mins = Math.floor(this.remaining / 60);
      const secs = this.remaining % 60;
      el.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    },

    formatMinutes(m) {
      return `${String(m).padStart(2, '0')}:00`;
    }
  };

  // ============================================================
  // RHYTHM DISPLAY
  // ============================================================
  const RhythmDisplay = {
    renderAccentGrid(pattern) {
      const labels = ['1', 'e', '&', 'a'];
      let html = '<div class="rhythm-grid">';
      for (let beat = 0; beat < pattern.beats; beat++) {
        html += '<div class="rhythm-beat">';
        for (let sub = 0; sub < pattern.subdivision; sub++) {
          const idx = beat * pattern.subdivision + sub;
          const isAccent = pattern.accents.includes(idx);
          const label = sub === 0 ? (beat + 1) : labels[sub] || '';
          html += `<div class="rhythm-note ${isAccent ? 'accent' : ''}">
            ${isAccent ? '>' : ''} ${label}
            <span class="rhythm-note-label">${isAccent ? 'ACC' : 'tap'}</span>
          </div>`;
        }
        html += '</div>';
      }
      html += '</div>';
      return html;
    },

    renderSticking(pattern) {
      const sticking = pattern.sticking;
      const accents = pattern.accents || [];
      let html = '<div class="sticking-display">';
      for (let i = 0; i < sticking.length; i++) {
        const ch = sticking[i];
        const isAccent = accents.includes(i);
        const isGrace = ch === ch.toLowerCase() && 'rl'.includes(ch.toLowerCase());
        let cls = '';

        if (ch.toUpperCase() === 'R') cls = 'right';
        else if (ch.toUpperCase() === 'L') cls = 'left';
        else if (ch.toUpperCase() === 'K') cls = 'kick';
        else if (ch.toUpperCase() === 'H') cls = 'hihat';
        else if (ch.toUpperCase() === 'S') cls = 'right';
        else if (ch === 'g') cls = 'ghost left';

        if (isAccent) cls += ' accent';
        if (isGrace && ch === ch.toLowerCase() && !isAccent) cls += ' grace';

        let display = ch.toUpperCase();
        if (ch === 'g') display = '(L)';
        if (ch === 'K') display = 'K';
        if (ch === 'H') display = 'H';
        if (ch === 'S') display = 'S';

        html += `<div class="stick ${cls}">${display}</div>`;

        // Add divider at halfway point
        if (i === Math.floor(sticking.length / 2) - 1 && sticking.length > 4) {
          html += '<div class="sticking-divider"></div>';
        }
      }
      html += '</div>';
      return html;
    },

    renderPolyrhythmCircle(polyrhythm) {
      const { a, b } = polyrhythm;
      const size = 240;
      const outerR = size / 2 - 10;
      const innerR = outerR * 0.65;
      const cx = size / 2;
      const cy = size / 2;

      let html = `<div class="polyrhythm-container">
        <div class="polyrhythm-circle" style="width:${size}px;height:${size}px">
          <div class="polyrhythm-ring outer"></div>
          <div class="polyrhythm-ring inner" style="width:${innerR*2}px;height:${innerR*2}px;top:${cy-innerR}px;left:${cx-innerR}px"></div>`;

      // Outer dots (rhythm A)
      for (let i = 0; i < a; i++) {
        const angle = (i / a) * Math.PI * 2 - Math.PI / 2;
        const x = cx + outerR * Math.cos(angle);
        const y = cy + outerR * Math.sin(angle);
        html += `<div class="polyrhythm-dot rhythm-a" style="left:${x}px;top:${y}px" data-rhythm="a" data-index="${i}"></div>`;
      }

      // Inner dots (rhythm B)
      for (let i = 0; i < b; i++) {
        const angle = (i / b) * Math.PI * 2 - Math.PI / 2;
        const x = cx + innerR * Math.cos(angle);
        const y = cy + innerR * Math.sin(angle);
        html += `<div class="polyrhythm-dot rhythm-b" style="left:${x}px;top:${y}px" data-rhythm="b" data-index="${i}"></div>`;
      }

      html += `</div>
        <div class="polyrhythm-label">${a}:${b}</div>
        <div class="polyrhythm-sublabel">Outer: ${a} beats &middot; Inner: ${b} beats &middot; LCM: ${lcm(a,b)} pulses</div>
      </div>`;
      return html;
    },

    renderClavePattern(pattern) {
      // 16 slots for 2 bars of eighth notes
      const totalSlots = pattern.beats * pattern.subdivision;
      let html = '<div class="clave-grid">';
      for (let i = 0; i < totalSlots; i++) {
        const isHit = pattern.accents.includes(i);
        const isBarDivide = i === totalSlots / 2;
        html += `<div class="clave-slot ${isHit ? 'hit' : ''} ${isBarDivide ? 'bar-divider' : ''}"></div>`;
      }
      html += '</div>';
      return html;
    }
  };

  // Math helpers
  function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
  function lcm(a, b) { return (a * b) / gcd(a, b); }

  // ============================================================
  // UI
  // ============================================================
  const UI = {
    updateHeader() {
      const xp = State.progress.totalXP;
      const level = Gamification.getLevel(xp);
      const next = Gamification.getNextLevel(xp);

      // XP bar
      let pct = 100;
      let label = `${xp} XP (MAX)`;
      if (next) {
        const range = next.xpMin - level.xpMin;
        const progress = xp - level.xpMin;
        pct = Math.round((progress / range) * 100);
        label = `${xp} / ${next.xpMin} XP`;
      }
      document.getElementById('xp-bar-fill').style.width = `${pct}%`;
      document.getElementById('xp-label').textContent = label;
      document.getElementById('level-label').textContent = `Lvl ${level.level}`;

      // Level badge
      const badge = document.getElementById('level-badge');
      badge.textContent = level.title;
      badge.style.borderColor = level.color;
      badge.style.color = level.color;

      // Streak
      document.getElementById('streak-value').textContent = State.progress.currentStreak;

      // Phase nav
      this.renderPhaseNav();
    },

    renderPhaseNav() {
      const container = document.getElementById('phase-nav-inner');
      container.innerHTML = '';

      // Dashboard link
      const dashBtn = document.createElement('button');
      dashBtn.className = `phase-nav-item ${State.currentView === 'dashboard' ? 'active' : ''}`;
      dashBtn.innerHTML = '<span class="nav-num">&#8962;</span> Home';
      dashBtn.onclick = () => Router.navigate('dashboard');
      container.appendChild(dashBtn);

      for (const phase of COURSE_DATA.phases) {
        const unlocked = Gamification.isPhaseUnlocked(phase.id);
        const progress = Gamification.getPhaseProgress(phase.id);
        const isActive = State.currentView === 'phase' && State.currentPhaseId === phase.id;
        const isCompleted = progress === 100;

        const btn = document.createElement('button');
        btn.className = `phase-nav-item ${isActive ? 'active' : ''} ${!unlocked ? 'locked' : ''} ${isCompleted ? 'completed' : ''}`;

        if (unlocked) {
          btn.innerHTML = `<span class="nav-num">${phase.id}</span> ${phase.title}`;
          btn.onclick = () => Router.navigate('phase', { phaseId: phase.id });
        } else {
          btn.innerHTML = `<span class="nav-lock">&#128274;</span> Phase ${phase.id}`;
        }
        container.appendChild(btn);
      }
    },

    showToast(message, type = 'xp') {
      const container = document.getElementById('toast-container');
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;

      const icons = { xp: '&#11088;', 'level-up': '&#127942;', streak: '&#128293;', unlock: '&#128275;' };
      toast.innerHTML = `<span class="toast-icon">${icons[type] || '&#11088;'}</span> ${message}`;
      container.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    },

    showLevelUp(level) {
      const overlay = document.createElement('div');
      overlay.className = 'level-up-overlay';
      overlay.innerHTML = `
        <div class="level-up-content">
          <div class="level-label">LEVEL UP</div>
          <div class="level-num" style="color:${level.color}">${level.level}</div>
          <div class="level-title">${level.title}</div>
          <button class="level-up-dismiss" onclick="this.closest('.level-up-overlay').remove()">Continue</button>
        </div>`;
      document.body.appendChild(overlay);
      setTimeout(() => overlay.remove(), 5000);
    },

    embedYouTube(videoId, title) {
      return `<div class="video-card">
        <div class="video-embed">
          <iframe src="https://www.youtube-nocookie.com/embed/${videoId}"
            loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
            allowfullscreen title="${title || ''}"></iframe>
        </div>
        <div class="video-title">${title || ''}</div>
      </div>`;
    },

    progressBar(pct, height = 4) {
      return `<div class="phase-card-progress" style="height:${height}px">
        <div class="phase-card-progress-fill" style="width:${pct}%"></div>
      </div>`;
    }
  };

  // ============================================================
  // ROUTER / VIEW RENDERING
  // ============================================================
  const Router = {
    navigate(view, params = {}) {
      State.currentView = view;
      State.currentPhaseId = params.phaseId || null;
      State.currentExerciseId = params.exerciseId || null;

      const content = document.getElementById('app-content');

      switch (view) {
        case 'dashboard': content.innerHTML = this.renderDashboard(); break;
        case 'phase': content.innerHTML = this.renderPhase(params.phaseId); break;
        case 'exercise': content.innerHTML = this.renderExercise(params.exerciseId); break;
      }

      UI.updateHeader();
      window.scrollTo(0, 0);
      this.bindEvents();
    },

    renderDashboard() {
      const xp = State.progress.totalXP;
      const level = Gamification.getLevel(xp);
      const completed = Gamification.getCompletedCount();
      const total = Gamification.getTotalExercises();
      const overallPct = total > 0 ? Math.round((completed / total) * 100) : 0;

      let html = `
        <div class="dashboard-hero">
          <h1>Master the <span>Silence Between the Beats</span></h1>
          <p>A comprehensive, self-paced journey from foundational rhythm to advanced temporal architecture.</p>
        </div>

        <div class="dashboard-stats">
          <div class="dashboard-stat-card">
            <div class="stat-value text-gold">${xp}</div>
            <div class="stat-label">Total XP</div>
          </div>
          <div class="dashboard-stat-card">
            <div class="stat-value text-accent">${level.level}</div>
            <div class="stat-label">${level.title}</div>
          </div>
          <div class="dashboard-stat-card">
            <div class="stat-value text-teal">${completed}/${total}</div>
            <div class="stat-label">Exercises</div>
          </div>
          <div class="dashboard-stat-card">
            <div class="stat-value" style="color:var(--danger)">${State.progress.currentStreak}</div>
            <div class="stat-label">Day Streak</div>
          </div>
        </div>

        ${UI.progressBar(overallPct, 6)}
        <div class="text-muted mt-1" style="font-size:0.8rem;text-align:center">${overallPct}% overall completion</div>

        <div class="phase-grid mt-3">`;

      for (const phase of COURSE_DATA.phases) {
        const unlocked = Gamification.isPhaseUnlocked(phase.id);
        const progress = Gamification.getPhaseProgress(phase.id);
        const isCompleted = progress === 100;
        const totalEx = phase.lessons.reduce((sum, l) => sum + l.exercises.length, 0);
        const doneEx = phase.lessons.reduce((sum, l) => sum + l.exercises.filter(e => Gamification.isExerciseComplete(e.id)).length, 0);

        html += `
          <div class="phase-card ${!unlocked ? 'locked' : ''} ${isCompleted ? 'completed' : ''}"
               data-phase-id="${phase.id}" ${unlocked ? '' : ''}>
            ${!unlocked ? `<div class="phase-lock-overlay">&#128274;</div>` : ''}
            <div class="phase-card-header">
              <div class="phase-card-icon">${phase.icon}</div>
              <div>
                <div class="phase-card-number">Phase ${phase.id}</div>
                <div class="phase-card-title">${phase.title}</div>
              </div>
            </div>
            <div class="phase-card-desc">${phase.description}</div>
            ${UI.progressBar(progress)}
            <div class="phase-card-footer">
              <span>${doneEx}/${totalEx} exercises</span>
              <span>${unlocked ? (isCompleted ? '&#10003; Complete' : `${progress}%`) : `Requires ${phase.xpRequired} XP`}</span>
            </div>
          </div>`;
      }

      html += '</div>';
      return html;
    },

    renderPhase(phaseId) {
      const phase = COURSE_DATA.phases.find(p => p.id === phaseId);
      if (!phase) return '<p>Phase not found.</p>';

      const progress = Gamification.getPhaseProgress(phaseId);

      let html = `
        <div class="phase-detail-header">
          <div class="back-btn" data-action="back-to-dashboard">&larr; Back to Dashboard</div>
          <div class="phase-subtitle">Phase ${phase.id}</div>
          <h2>${phase.title}</h2>
          <div class="phase-desc">${phase.description}</div>
          <div class="phase-progress-bar mt-2">
            ${UI.progressBar(progress, 6)}
            <div class="text-muted mt-1" style="font-size:0.8rem">${progress}% complete</div>
          </div>
        </div>

        <div class="lesson-list">`;

      for (const lesson of phase.lessons) {
        const status = Gamification.getLessonStatus(lesson.id);
        const isExpanded = State.expandedLessons.has(lesson.id);
        const doneCount = lesson.exercises.filter(e => Gamification.isExerciseComplete(e.id)).length;

        html += `
          <div class="lesson-item ${status} ${isExpanded ? 'expanded' : ''}" data-lesson-id="${lesson.id}">
            <div class="lesson-header" data-action="toggle-lesson" data-lesson="${lesson.id}">
              <div class="lesson-status-icon">${status === 'completed' ? '&#10003;' : (status === 'in-progress' ? '&#9679;' : '')}</div>
              <div class="lesson-title">${lesson.title}</div>
              <div class="lesson-meta">${doneCount}/${lesson.exercises.length}</div>
              <div class="lesson-chevron">&#9660;</div>
            </div>
            <div class="lesson-body">
              <div class="lesson-content">${lesson.content}</div>`;

        // Videos
        if (lesson.videos && lesson.videos.length > 0) {
          html += `<div class="lesson-videos">
            <h4>&#9654; Video Lessons</h4>
            <div class="video-grid">`;
          for (const v of lesson.videos) {
            html += UI.embedYouTube(v.id, v.title);
          }
          html += '</div></div>';
        }

        // Resources
        if (lesson.resources && lesson.resources.length > 0) {
          html += `<div class="lesson-resources">
            <h4>&#128279; Resources</h4>`;
          for (const r of lesson.resources) {
            html += `<a href="${r.url}" target="_blank" rel="noopener" class="resource-link">&#128279; ${r.title}</a>`;
          }
          html += '</div>';
        }

        // Exercises
        html += `<div class="exercise-list">
          <h4>&#127919; Exercises</h4>`;
        for (const ex of lesson.exercises) {
          const isDone = Gamification.isExerciseComplete(ex.id);
          const typeLabel = ex.type.replace(/-/g, ' ');
          html += `
            <div class="exercise-card ${isDone ? 'completed' : ''}" data-action="open-exercise" data-exercise="${ex.id}">
              <div class="exercise-status">${isDone ? '&#10003;' : ''}</div>
              <div class="exercise-info">
                <h5>${ex.title}</h5>
                <span class="exercise-type-tag">${typeLabel}</span>
              </div>
              <div class="exercise-xp">${isDone ? 'Done' : `+${ex.xpReward} XP`}</div>
            </div>`;
        }
        html += '</div></div></div>';
      }

      html += '</div>';
      return html;
    },

    renderExercise(exerciseId) {
      const ctx = Gamification.findExerciseContext(exerciseId);
      if (!ctx) return '<p>Exercise not found.</p>';

      const { phase, lesson, exercise } = ctx;
      const isDone = Gamification.isExerciseComplete(exercise.id);
      const typeLabel = exercise.type.replace(/-/g, ' ');

      let html = `
        <div class="exercise-view">
          <div class="back-btn" data-action="back-to-phase" data-phase="${phase.id}">&larr; Back to ${phase.title}</div>
          <div class="exercise-type-label">${typeLabel}</div>
          <h2>${exercise.title}</h2>
          <div class="exercise-instructions">${exercise.instructions}</div>

          <div class="exercise-tools">`;

      // Type-specific rendering
      switch (exercise.type) {
        case 'metronome-practice':
        case 'metronome-challenge':
        case 'tempo-ladder':
          if (exercise.targetBPM) {
            html += `<div class="mb-2">
              <button class="metro-btn" data-action="set-bpm" data-bpm="${exercise.targetBPM}">
                &#9834; Set Metronome to ${exercise.targetBPM} BPM
              </button>
            </div>`;
          }
          if (exercise.durationMinutes) {
            html += this.renderTimer(exercise.durationMinutes);
          }
          break;

        case 'rhythm-notation':
          if (exercise.pattern) {
            html += RhythmDisplay.renderAccentGrid(exercise.pattern);
          }
          if (exercise.targetBPM) {
            html += `<div class="mt-2"><button class="metro-btn" data-action="set-bpm" data-bpm="${exercise.targetBPM}">
              &#9834; Set Metronome to ${exercise.targetBPM} BPM</button></div>`;
          }
          break;

        case 'sticking-display':
          if (exercise.pattern) {
            html += RhythmDisplay.renderSticking(exercise.pattern);
          }
          if (exercise.targetBPM) {
            html += `<div class="mt-2"><button class="metro-btn" data-action="set-bpm" data-bpm="${exercise.targetBPM}">
              &#9834; Set Metronome to ${exercise.targetBPM} BPM</button></div>`;
          }
          break;

        case 'polyrhythm-visual':
          if (exercise.polyrhythm) {
            html += RhythmDisplay.renderPolyrhythmCircle(exercise.polyrhythm);
          }
          if (exercise.targetBPM) {
            html += `<div class="mt-2"><button class="metro-btn" data-action="set-bpm" data-bpm="${exercise.targetBPM}">
              &#9834; Set Metronome to ${exercise.targetBPM} BPM</button></div>`;
          }
          break;

        case 'self-assessment':
          if (exercise.checklist) {
            html += '<ul class="checklist">';
            for (let i = 0; i < exercise.checklist.length; i++) {
              html += `<li class="checklist-item" data-action="check-item" data-index="${i}">
                <div class="checklist-checkbox"></div>
                <span>${exercise.checklist[i]}</span>
              </li>`;
            }
            html += '</ul>';
          }
          break;

        case 'timed-practice':
          if (exercise.durationMinutes) {
            html += this.renderTimer(exercise.durationMinutes);
          }
          break;

        case 'video-study':
          // Videos are shown from the parent lesson
          html += `<p class="text-muted">Watch the video lessons above in the lesson content, then mark this exercise complete.</p>`;
          break;
      }

      html += `</div>

        <button class="complete-btn ${isDone ? 'completed' : ''}"
                data-action="complete-exercise" data-exercise="${exercise.id}">
          ${isDone ? '&#10003; Completed' : `&#10003; Mark Complete (+${exercise.xpReward} XP)`}
        </button>
      </div>`;

      return html;
    },

    renderTimer(minutes) {
      return `
        <div class="practice-timer">
          <div class="timer-display" id="timer-display">${String(minutes).padStart(2,'0')}:00</div>
          <div class="timer-controls">
            <button class="timer-btn start" data-action="timer-start" data-minutes="${minutes}">Start</button>
            <button class="timer-btn pause" data-action="timer-pause">Pause</button>
            <button class="timer-btn reset" data-action="timer-reset" data-minutes="${minutes}">Reset</button>
          </div>
        </div>`;
    },

    bindEvents() {
      const content = document.getElementById('app-content');

      // Use event delegation
      content.onclick = (e) => {
        const target = e.target.closest('[data-action]');
        if (!target) {
          // Check for phase card click
          const card = e.target.closest('.phase-card:not(.locked)');
          if (card) {
            const phaseId = parseInt(card.dataset.phaseId);
            Router.navigate('phase', { phaseId });
          }
          return;
        }

        const action = target.dataset.action;

        switch (action) {
          case 'back-to-dashboard':
            Router.navigate('dashboard');
            break;

          case 'back-to-phase':
            Router.navigate('phase', { phaseId: parseInt(target.dataset.phase) });
            break;

          case 'toggle-lesson': {
            const lessonId = target.dataset.lesson;
            if (State.expandedLessons.has(lessonId)) {
              State.expandedLessons.delete(lessonId);
            } else {
              State.expandedLessons.add(lessonId);
            }
            const item = target.closest('.lesson-item');
            item.classList.toggle('expanded');
            break;
          }

          case 'open-exercise':
            Router.navigate('exercise', { exerciseId: target.dataset.exercise });
            break;

          case 'complete-exercise': {
            const exId = target.dataset.exercise;
            if (!Gamification.isExerciseComplete(exId)) {
              Gamification.completeExercise(exId);
              target.classList.add('completed');
              target.innerHTML = '&#10003; Completed';
            }
            break;
          }

          case 'set-bpm': {
            const bpm = parseInt(target.dataset.bpm);
            Metro.setBPM(bpm);
            // Open metronome panel
            document.getElementById('metronome-panel').classList.add('open');
            break;
          }

          case 'timer-start': {
            const mins = parseInt(target.dataset.minutes);
            Timer.start(mins);
            break;
          }

          case 'timer-pause':
            if (Timer.isRunning) Timer.pause();
            else Timer.resume();
            break;

          case 'timer-reset': {
            const mins = parseInt(target.dataset.minutes);
            Timer.reset(mins);
            break;
          }

          case 'check-item': {
            target.classList.toggle('checked');
            const cb = target.querySelector('.checklist-checkbox');
            if (target.classList.contains('checked')) {
              cb.innerHTML = '&#10003;';
            } else {
              cb.innerHTML = '';
            }
            break;
          }
        }
      };
    }
  };

  // ============================================================
  // METRONOME UI BINDINGS
  // ============================================================
  function initMetronomeUI() {
    const panel = document.getElementById('metronome-panel');
    const toggle = document.getElementById('metronome-toggle');
    const close = document.getElementById('metronome-close');
    const playBtn = document.getElementById('metro-play');
    const slider = document.getElementById('bpm-slider');
    const bpmDown = document.getElementById('bpm-down');
    const bpmUp = document.getElementById('bpm-up');
    const tapBtn = document.getElementById('tap-tempo');
    const timeSig = document.getElementById('time-sig');
    const subdivision = document.getElementById('subdivision');

    toggle.onclick = () => {
      panel.classList.toggle('open');
      Metro.init();
    };

    close.onclick = () => panel.classList.remove('open');

    playBtn.onclick = () => Metro.toggle();

    slider.oninput = () => Metro.setBPM(parseInt(slider.value));

    bpmDown.onclick = () => Metro.setBPM(Metro.bpm - 5);
    bpmUp.onclick = () => Metro.setBPM(Metro.bpm + 5);

    tapBtn.onclick = () => Metro.tap();

    timeSig.onchange = () => Metro.setTimeSig(parseInt(timeSig.value));
    subdivision.onchange = () => Metro.setSubdivision(parseInt(subdivision.value));

    // Set initial values
    slider.value = Metro.bpm;
    document.getElementById('bpm-display').textContent = Metro.bpm;
    timeSig.value = Metro.timeSig;
    subdivision.value = Metro.subdivision;

    Metro.renderPulseDots();
  }

  // ============================================================
  // KEYBOARD SHORTCUTS
  // ============================================================
  document.addEventListener('keydown', (e) => {
    // Space to toggle metronome (only if not typing)
    if (e.code === 'Space' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
      e.preventDefault();
      Metro.toggle();
    }
    // Escape to go back
    if (e.code === 'Escape') {
      if (State.currentView === 'exercise') {
        const ctx = Gamification.findExerciseContext(State.currentExerciseId);
        if (ctx) Router.navigate('phase', { phaseId: ctx.phase.id });
      } else if (State.currentView === 'phase') {
        Router.navigate('dashboard');
      }
      document.getElementById('metronome-panel').classList.remove('open');
    }
  });

  // ============================================================
  // INITIALIZATION
  // ============================================================
  document.addEventListener('DOMContentLoaded', () => {
    Storage.load();

    // Load metronome settings
    const s = State.progress.metronomeSettings;
    Metro.bpm = s.bpm || 70;
    Metro.timeSig = s.timeSig || 4;
    Metro.subdivision = s.subdivision || 1;

    initMetronomeUI();
    UI.updateHeader();
    Router.navigate('dashboard');
  });

})();
