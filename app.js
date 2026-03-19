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
  // METRONOME (Web Audio API) — with ghost beat modes
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
    lookahead: 25,
    scheduleAhead: 0.1,

    // Ghost beat system
    ghostMode: 'all',      // 'all', '2-4', '1-3', 'synco-e', 'synco-and', 'silent-bars'
    currentBar: 0,         // bar counter for silent-bars mode
    silentBarPattern: [true, true, false, false],  // true=audible, false=silent (alternating 2 on / 2 off)

    // Beat timestamps for accuracy tracking
    beatTimestamps: [],    // array of { time: audioCtx.currentTime, beat, subBeat }

    init() {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
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
      this.currentBar = 0;
      this.beatTimestamps = [];
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
      document.querySelectorAll('.pulse-dot').forEach(d => {
        d.classList.remove('active');
      });
      const barCounter = document.getElementById('ghost-bar-counter');
      if (barCounter) barCounter.textContent = '';
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

    // Determine if a beat/subBeat should be audible given the ghost mode
    isBeatAudible(beat, subBeat) {
      switch (this.ghostMode) {
        case 'all':
          return true;

        case '2-4':
          // Only beats 2 and 4 (0-indexed: 1 and 3) are audible, subdivisions silent
          if (subBeat !== 0) return false;
          return beat === 1 || beat === 3;

        case '1-3':
          // Only beats 1 and 3 (0-indexed: 0 and 2) are audible
          if (subBeat !== 0) return false;
          return beat === 0 || beat === 2;

        case 'synco-e':
          // Only the "e" partial (subBeat 1 in subdivision=4, or subBeat 1 in subdivision=2)
          if (this.subdivision >= 2) return subBeat === 1;
          return false;

        case 'synco-and':
          // Only the "&" partial
          if (this.subdivision >= 2) {
            // In eighth notes (sub=2), "&" is subBeat 1
            // In sixteenths (sub=4), "&" is subBeat 2
            if (this.subdivision === 2) return subBeat === 1;
            if (this.subdivision >= 3) return subBeat === 2;
          }
          return false;

        case 'silent-bars':
          return this.silentBarPattern[this.currentBar % this.silentBarPattern.length];

        default:
          return true;
      }
    },

    scheduleNote(time, beat, subBeat) {
      const audible = this.isBeatAudible(beat, subBeat);

      // Always record beat timestamps for accuracy tracking
      if (subBeat === 0) {
        this.beatTimestamps.push({ time, beat });
        // Keep only last 32 timestamps
        if (this.beatTimestamps.length > 32) this.beatTimestamps.shift();
      }
      // Also record subdivision timestamps
      this.beatTimestamps.push({ time, beat, subBeat, isSubdivision: subBeat !== 0 });
      if (this.beatTimestamps.length > 64) this.beatTimestamps.shift();

      if (audible) {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        let freq, duration, vol;
        if (subBeat === 0 && beat === 0) {
          freq = 1000; duration = 0.05; vol = 0.6;
        } else if (subBeat === 0) {
          freq = 800; duration = 0.04; vol = 0.4;
        } else {
          freq = 600; duration = 0.03; vol = 0.2;
        }

        osc.frequency.value = freq;
        gain.gain.setValueAtTime(vol, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
        osc.start(time);
        osc.stop(time + duration);
      }

      // Schedule UI update for quarter-note beats
      const msUntil = (time - this.audioCtx.currentTime) * 1000;
      if (subBeat === 0) {
        setTimeout(() => this.updatePulseUI(beat, audible), Math.max(0, msUntil));
      }

      // Notify accent grid playback
      setTimeout(() => {
        if (State._accentGridCallback) {
          State._accentGridCallback(beat, subBeat);
        }
      }, Math.max(0, msUntil));
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
          this.currentBar++;
          // Update bar counter display for silent-bars mode
          if (this.ghostMode === 'silent-bars') {
            const el = document.getElementById('ghost-bar-counter');
            if (el) {
              const isAudible = this.silentBarPattern[this.currentBar % this.silentBarPattern.length];
              el.innerHTML = `Bar <span class="bar-num">${this.currentBar + 1}</span> ${isAudible ? '&#128266;' : '<span class="silent-label">SILENT</span>'}`;
            }
          }
        }
      }
    },

    updatePulseUI(beat, audible) {
      const dots = document.querySelectorAll('#metronome-pulse .pulse-dot');
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

    setGhostMode(mode) {
      this.ghostMode = mode;
      // Update button UI
      document.querySelectorAll('.ghost-mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.ghost === mode);
      });
      // Update pulse dot ghost styling
      this.renderPulseDots();
      // Clear bar counter if not silent-bars
      if (mode !== 'silent-bars') {
        const el = document.getElementById('ghost-bar-counter');
        if (el) el.textContent = '';
      }
      // For syncopation modes, force subdivision to at least 2
      if ((mode === 'synco-e' || mode === 'synco-and') && this.subdivision < 2) {
        this.setSubdivision(mode === 'synco-and' ? 4 : 2);
        document.getElementById('subdivision').value = this.subdivision;
      }
      if (this.isPlaying) { this.stop(); this.start(); }
    },

    renderPulseDots() {
      const container = document.getElementById('metronome-pulse');
      container.innerHTML = '';
      for (let i = 0; i < this.timeSig; i++) {
        const dot = document.createElement('div');
        dot.className = 'pulse-dot';
        // Mark ghost beats visually
        if (!this.isBeatAudible(i, 0)) {
          dot.classList.add('ghost');
        }
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
        const last2 = this.tapTimes.slice(-2);
        if (last2[1] - last2[0] > 2000) {
          this.tapTimes = [now];
          return;
        }
        let total = 0;
        for (let i = 1; i < this.tapTimes.length; i++) {
          total += this.tapTimes[i] - this.tapTimes[i - 1];
        }
        const avg = total / (this.tapTimes.length - 1);
        const bpm = Math.round(60000 / avg);
        this.setBPM(bpm);
      }
    },

    // Get the closest beat timestamp to a given audioCtx time
    getClosestBeatTime(tapTime) {
      if (!this.beatTimestamps.length) return null;
      let closest = this.beatTimestamps[0];
      let minDiff = Math.abs(tapTime - closest.time);
      for (const bt of this.beatTimestamps) {
        const diff = Math.abs(tapTime - bt.time);
        if (diff < minDiff) {
          minDiff = diff;
          closest = bt;
        }
      }
      return { ...closest, offsetMs: (tapTime - closest.time) * 1000 };
    }
  };

  // ============================================================
  // TAP PADS — Virtual drum pads with timing accuracy
  // ============================================================
  const TapPads = {
    pads: [
      { id: 'hihat',  label: 'Hi-Hat', key: 'Q', freq: 6500, type: 'noise', color: 'hihat' },
      { id: 'snare',  label: 'Snare',  key: 'W', freq: 250,  type: 'noise-tone', color: 'snare' },
      { id: 'crash',  label: 'Crash',  key: 'E', freq: 5000, type: 'noise', color: 'crash' },
      { id: 'tom1',   label: 'Tom 1',  key: 'A', freq: 200,  type: 'tone', color: 'tom1' },
      { id: 'kick',   label: 'Kick',   key: 'S', freq: 60,   type: 'kick', color: 'kick' },
      { id: 'tom2',   label: 'Tom 2',  key: 'D', freq: 140,  type: 'tone', color: 'tom2' },
    ],

    playSound(pad) {
      Metro.init(); // ensure AudioContext
      const ctx = Metro.audioCtx;
      const now = ctx.currentTime;

      if (pad.type === 'kick') {
        // Kick: sine with pitch drop
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.12);
        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (pad.type === 'noise' || pad.type === 'noise-tone') {
        // Noise burst for hi-hat, snare, crash
        const bufferSize = ctx.sampleRate * 0.08;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        // Bandpass for character
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = pad.freq;
        filter.Q.value = pad.id === 'hihat' ? 3 : 0.8;

        const gain = ctx.createGain();
        const vol = pad.id === 'crash' ? 0.3 : 0.5;
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + (pad.id === 'crash' ? 0.25 : 0.1));

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
        noise.stop(now + 0.25);

        // Add tone body for snare
        if (pad.type === 'noise-tone') {
          const osc = ctx.createOscillator();
          const g2 = ctx.createGain();
          osc.frequency.value = pad.freq;
          g2.gain.setValueAtTime(0.4, now);
          g2.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
          osc.connect(g2);
          g2.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.12);
        }
      } else {
        // Tone for toms
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(pad.freq, now);
        osc.frequency.exponentialRampToValueAtTime(pad.freq * 0.7, now + 0.2);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    },

    hitPad(padId) {
      const pad = this.pads.find(p => p.id === padId);
      if (!pad) return;

      this.playSound(pad);

      // Visual feedback
      const el = document.querySelector(`.tap-pad.pad-${padId}`);
      if (el) {
        el.classList.add('hit');
        setTimeout(() => el.classList.remove('hit'), 120);
      }

      // Accuracy tracking if metronome is playing
      if (Metro.isPlaying && Metro.audioCtx) {
        const tapTime = Metro.audioCtx.currentTime;
        const closest = Metro.getClosestBeatTime(tapTime);
        if (closest) {
          AccuracyTracker.recordHit(closest.offsetMs);
        }
      }
    },

    renderPads() {
      let html = `<div class="tap-pad-container">
        <div class="tap-pad-header">
          <h4>Tap Pads</h4>
          <span class="text-muted" style="font-size:0.7rem">Use keyboard keys or tap/click</span>
        </div>
        <div class="tap-pad-grid">`;
      for (const pad of this.pads) {
        html += `<button class="tap-pad pad-${pad.color}" data-action="tap-pad" data-pad="${pad.id}">
          ${pad.label}
          <span class="pad-key">${pad.key}</span>
        </button>`;
      }
      html += `</div>
        <div class="tap-accuracy">
          <div class="accuracy-last-hit" id="accuracy-last-hit"></div>
          <div class="accuracy-label">Timing Accuracy</div>
          <div class="accuracy-stats">
            <div class="accuracy-stat">
              <div class="stat-num" id="acc-avg">--</div>
              <div class="stat-lbl">Avg (ms)</div>
            </div>
            <div class="accuracy-stat">
              <div class="stat-num text-teal" id="acc-perfect">0</div>
              <div class="stat-lbl">Perfect</div>
            </div>
            <div class="accuracy-stat">
              <div class="stat-num text-gold" id="acc-good">0</div>
              <div class="stat-lbl">Good</div>
            </div>
            <div class="accuracy-stat">
              <div class="stat-num" style="color:var(--danger)" id="acc-miss">0</div>
              <div class="stat-lbl">Miss</div>
            </div>
          </div>
          <div class="tap-history" id="tap-history"></div>
        </div>
      </div>`;
      return html;
    },

    // Keyboard mapping
    keyMap: { 'q': 'hihat', 'w': 'snare', 'e': 'crash', 'a': 'tom1', 's': 'kick', 'd': 'tom2' }
  };

  // ============================================================
  // ACCURACY TRACKER — measures tap timing vs metronome grid
  // ============================================================
  const AccuracyTracker = {
    hits: [],         // array of offset values in ms
    maxHistory: 32,

    recordHit(offsetMs) {
      this.hits.push(offsetMs);
      if (this.hits.length > this.maxHistory) this.hits.shift();
      this.updateDisplay(offsetMs);
    },

    getGrade(absMs) {
      if (absMs <= 10) return 'perfect';
      if (absMs <= 25) return 'good';
      if (absMs <= 50) return 'ok';
      return 'miss';
    },

    updateDisplay(lastOffsetMs) {
      const absMs = Math.abs(lastOffsetMs);
      const grade = this.getGrade(absMs);
      const sign = lastOffsetMs > 0.5 ? '+' : (lastOffsetMs < -0.5 ? '' : '');

      // Last hit display
      const el = document.getElementById('accuracy-last-hit');
      if (el) {
        const labels = { perfect: 'PERFECT', good: 'GOOD', ok: 'OK', miss: 'MISS' };
        el.className = `accuracy-last-hit ${grade}`;
        el.textContent = `${labels[grade]} ${sign}${Math.round(lastOffsetMs)}ms`;
      }

      // Stats
      const perfect = this.hits.filter(h => this.getGrade(Math.abs(h)) === 'perfect').length;
      const good = this.hits.filter(h => this.getGrade(Math.abs(h)) === 'good').length;
      const miss = this.hits.filter(h => this.getGrade(Math.abs(h)) === 'miss').length;
      const avg = this.hits.length > 0
        ? Math.round(this.hits.reduce((s, h) => s + Math.abs(h), 0) / this.hits.length)
        : '--';

      const avgEl = document.getElementById('acc-avg');
      const perfEl = document.getElementById('acc-perfect');
      const goodEl = document.getElementById('acc-good');
      const missEl = document.getElementById('acc-miss');
      if (avgEl) avgEl.textContent = avg;
      if (perfEl) perfEl.textContent = perfect;
      if (goodEl) goodEl.textContent = good;
      if (missEl) missEl.textContent = miss;

      // History dots
      const histEl = document.getElementById('tap-history');
      if (histEl) {
        histEl.innerHTML = this.hits.map(h => {
          const g = this.getGrade(Math.abs(h));
          return `<div class="tap-dot ${g}"></div>`;
        }).join('');
      }
    },

    reset() {
      this.hits = [];
      const el = document.getElementById('accuracy-last-hit');
      if (el) { el.textContent = ''; el.className = 'accuracy-last-hit'; }
      ['acc-avg', 'acc-perfect', 'acc-good', 'acc-miss'].forEach(id => {
        const e = document.getElementById(id);
        if (e) e.textContent = id === 'acc-avg' ? '--' : '0';
      });
      const histEl = document.getElementById('tap-history');
      if (histEl) histEl.innerHTML = '';
    }
  };

  // ============================================================
  // LIVE ACCENT GRID — highlights notes in sync with metronome
  // ============================================================
  const LiveGrid = {
    playing: false,

    start() {
      this.playing = true;
      State._accentGridCallback = (beat, subBeat) => {
        if (!this.playing) return;
        const notes = document.querySelectorAll('.rhythm-grid .rhythm-note');
        if (!notes.length) return;
        const totalSubdivisions = parseInt(document.querySelector('.rhythm-grid')?.dataset?.subdivision || '4');
        const idx = beat * totalSubdivisions + subBeat;
        notes.forEach((n, i) => {
          n.classList.toggle('playing', i === idx);
        });
      };
    },

    stop() {
      this.playing = false;
      State._accentGridCallback = null;
      document.querySelectorAll('.rhythm-note.playing').forEach(n => n.classList.remove('playing'));
    }
  };

  // ============================================================
  // ANIMATED POLYRHYTHM — sweep hand + sound
  // ============================================================
  const PolyrhythmPlayer = {
    animationId: null,
    isPlaying: false,
    startTime: 0,
    a: 4,
    b: 3,
    bpm: 60,

    start(a, b, bpm) {
      Metro.init();
      this.a = a;
      this.b = b;
      this.bpm = bpm || 60;
      this.isPlaying = true;
      this.startTime = Metro.audioCtx.currentTime;
      this.scheduleBeats();
      this.animate();
    },

    stop() {
      this.isPlaying = false;
      cancelAnimationFrame(this.animationId);
      document.querySelectorAll('.polyrhythm-dot').forEach(d => d.classList.remove('active'));
      const sweep = document.querySelector('.polyrhythm-sweep');
      if (sweep) sweep.style.transform = 'rotate(-90deg)';
    },

    toggle(a, b, bpm) {
      if (this.isPlaying) this.stop();
      else this.start(a, b, bpm);
    },

    scheduleBeats() {
      const ctx = Metro.audioCtx;
      const measureDuration = (60.0 / this.bpm) * 4; // 1 measure of 4 beats
      const numMeasures = 16; // schedule ahead 16 measures

      for (let m = 0; m < numMeasures; m++) {
        const mStart = this.startTime + m * measureDuration;

        // Rhythm A
        for (let i = 0; i < this.a; i++) {
          const t = mStart + (i / this.a) * measureDuration;
          this.scheduleClick(t, 900, 0.3);
        }
        // Rhythm B
        for (let i = 0; i < this.b; i++) {
          const t = mStart + (i / this.b) * measureDuration;
          this.scheduleClick(t, 600, 0.25);
        }
      }
    },

    scheduleClick(time, freq, vol) {
      const ctx = Metro.audioCtx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
      osc.start(time);
      osc.stop(time + 0.04);
    },

    animate() {
      if (!this.isPlaying) return;
      const ctx = Metro.audioCtx;
      const now = ctx.currentTime;
      const measureDuration = (60.0 / this.bpm) * 4;
      const elapsed = (now - this.startTime) % measureDuration;
      const progress = elapsed / measureDuration;

      // Rotate sweep hand
      const sweep = document.querySelector('.polyrhythm-sweep');
      if (sweep) {
        const angle = progress * 360 - 90;
        sweep.style.transform = `rotate(${angle}deg)`;
      }

      // Highlight dots
      const aDots = document.querySelectorAll('.polyrhythm-dot.rhythm-a');
      const bDots = document.querySelectorAll('.polyrhythm-dot.rhythm-b');

      aDots.forEach((d, i) => {
        const dotProgress = i / this.a;
        const dist = Math.abs(progress - dotProgress);
        d.classList.toggle('active', dist < 0.03 || (1 - dist) < 0.03);
      });

      bDots.forEach((d, i) => {
        const dotProgress = i / this.b;
        const dist = Math.abs(progress - dotProgress);
        d.classList.toggle('active', dist < 0.03 || (1 - dist) < 0.03);
      });

      this.animationId = requestAnimationFrame(() => this.animate());
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
      let html = `<div class="rhythm-grid" data-subdivision="${pattern.subdivision}">`;
      for (let beat = 0; beat < pattern.beats; beat++) {
        html += '<div class="rhythm-beat">';
        for (let sub = 0; sub < pattern.subdivision; sub++) {
          const idx = beat * pattern.subdivision + sub;
          const isAccent = pattern.accents.includes(idx);
          const label = sub === 0 ? (beat + 1) : labels[sub] || '';
          html += `<div class="rhythm-note ${isAccent ? 'accent' : ''}" data-idx="${idx}">
            ${isAccent ? '>' : ''} ${label}
            <span class="rhythm-note-label">${isAccent ? 'ACC' : 'tap'}</span>
          </div>`;
        }
        html += '</div>';
      }
      html += '</div>';
      html += `<div class="mt-2" style="display:flex;gap:8px;justify-content:center">
        <button class="metro-btn" data-action="play-grid">&#9654; Play Grid</button>
      </div>`;
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

      // Add sweep hand
      html += `<div class="polyrhythm-sweep" style="transform:rotate(-90deg)"></div>`;

      html += `</div>
        <div class="polyrhythm-label">${a}:${b}</div>
        <div class="polyrhythm-sublabel">Outer: ${a} beats &middot; Inner: ${b} beats &middot; LCM: ${lcm(a,b)} pulses</div>
        <button class="polyrhythm-play-btn" data-action="play-polyrhythm" data-a="${a}" data-b="${b}">&#9654; Play Polyrhythm</button>
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

      // Clean up active tools when navigating away
      LiveGrid.stop();
      PolyrhythmPlayer.stop();
      AccuracyTracker.reset();

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
      const showPads = ['metronome-practice', 'metronome-challenge', 'tempo-ladder',
                        'rhythm-notation', 'sticking-display', 'timed-practice'].includes(exercise.type);

      switch (exercise.type) {
        case 'metronome-practice':
        case 'metronome-challenge':
        case 'tempo-ladder':
          if (exercise.targetBPM) {
            html += `<div class="mb-2" style="display:flex;gap:8px;flex-wrap:wrap">
              <button class="metro-btn" data-action="set-bpm" data-bpm="${exercise.targetBPM}">
                &#9834; Set Metronome to ${exercise.targetBPM} BPM
              </button>`;
            // For metronome-challenge, offer the exercise's ghost mode
            if (exercise.ghostMode) {
              const ghostLabels = {
                '2-4': '2 & 4 Only', '1-3': '1 & 3 Only',
                'synco-e': 'Synco "e"', 'synco-and': 'Synco "&"',
                'silent-bars': 'Silent Bars'
              };
              html += `<button class="metro-btn" data-action="set-ghost-mode" data-ghost="${exercise.ghostMode}">
                &#128264; ${ghostLabels[exercise.ghostMode] || exercise.ghostMode}
              </button>`;
            }
            html += `</div>`;
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
          html += `<p class="text-muted">Watch the video lessons above in the lesson content, then mark this exercise complete.</p>`;
          break;
      }

      // Add tap pads for practice exercises
      if (showPads) {
        html += TapPads.renderPads();
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

          case 'tap-pad': {
            TapPads.hitPad(target.dataset.pad);
            break;
          }

          case 'set-ghost-mode': {
            Metro.setGhostMode(target.dataset.ghost);
            document.getElementById('metronome-panel').classList.add('open');
            break;
          }

          case 'play-grid': {
            if (LiveGrid.playing) {
              LiveGrid.stop();
              if (Metro.isPlaying) Metro.stop();
              target.innerHTML = '&#9654; Play Grid';
            } else {
              LiveGrid.start();
              if (!Metro.isPlaying) {
                document.getElementById('metronome-panel').classList.add('open');
                Metro.start();
              }
              target.innerHTML = '&#9724; Stop Grid';
            }
            break;
          }

          case 'play-polyrhythm': {
            const a = parseInt(target.dataset.a);
            const b = parseInt(target.dataset.b);
            const bpmEl = document.getElementById('bpm-display');
            const bpm = bpmEl ? parseInt(bpmEl.textContent) : 60;
            PolyrhythmPlayer.toggle(a, b, bpm);
            target.classList.toggle('playing', PolyrhythmPlayer.isPlaying);
            target.innerHTML = PolyrhythmPlayer.isPlaying ? '&#9724; Stop' : '&#9654; Play Polyrhythm';
            break;
          }
        }
      };
    }
  };

  // ============================================================
  // TOUCH SUPPORT FOR TAP PADS
  // ============================================================
  // Use touchstart for zero-latency response on mobile
  document.addEventListener('touchstart', (e) => {
    const pad = e.target.closest('[data-action="tap-pad"]');
    if (pad) {
      e.preventDefault(); // prevent mouse event + scroll
      TapPads.hitPad(pad.dataset.pad);
    }
  }, { passive: false });

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

    // Ghost mode buttons
    document.getElementById('ghost-mode-select').addEventListener('click', (e) => {
      const btn = e.target.closest('.ghost-mode-btn');
      if (btn) Metro.setGhostMode(btn.dataset.ghost);
    });

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
  const activeKeys = new Set();
  document.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

    // Prevent repeat triggers from held keys
    if (activeKeys.has(e.code)) return;
    activeKeys.add(e.code);

    // Tap pad keys (Q, W, E, A, S, D)
    const padId = TapPads.keyMap[e.key.toLowerCase()];
    if (padId) {
      e.preventDefault();
      TapPads.hitPad(padId);
      return;
    }

    // Space to toggle metronome
    if (e.code === 'Space') {
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
      // Stop any playing tools
      LiveGrid.stop();
      PolyrhythmPlayer.stop();
    }
  });

  document.addEventListener('keyup', (e) => {
    activeKeys.delete(e.code);
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
