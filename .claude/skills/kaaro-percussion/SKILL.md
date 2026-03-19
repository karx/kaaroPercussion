---
name: kaaro-percussion
description: Build, enhance, and maintain the KaaroPercussion web-based percussion training game. Covers curriculum content, interactive tools (metronome, tap pads, rhythm visualizations), gamification, SEO, and deployment.
---

# KaaroPercussion Project Skill

## Project Overview
KaaroPercussion is a free, self-paced, gamified percussion training web app. It teaches drumming/percussion through 8 structured phases — from foundational rhythm to advanced temporal architecture — with interactive exercises, a Web Audio metronome, virtual tap pads, and curated YouTube lessons.

## Architecture
- **Single-page app** — vanilla HTML/CSS/JS, no frameworks, no build step
- **4 source files**: `index.html` (shell), `style.css` (dark theme), `data.js` (course content), `app.js` (all logic)
- **Reference**: `seed.md` contains the full pedagogical framework (8 phases, 65 cited works). Always consult it for curriculum accuracy.

## File Roles

| File | Purpose |
|------|---------|
| `seed.md` | Source pedagogical content — 8 phases, works cited, YouTube URLs. Read-only reference. |
| `data.js` | `COURSE_DATA.phases[]`, `LEVELS[]`, `PHASE_ICONS`. 8 phases, 18 lessons, ~48 exercises. |
| `style.css` | Dark theme design system. CSS variables for colors. Responsive breakpoints at 640px / 1024px. |
| `index.html` | SPA shell with SEO head, header (XP bar), phase nav, main content area, metronome panel. |
| `app.js` | IIFE with modules: State, Storage, Gamification, Metro, TapPads, AccuracyTracker, LiveGrid, PolyrhythmPlayer, Timer, RhythmDisplay, UI, Router. |
| `og-image.svg` | 1200x630 branded OG image. Must use XML-safe entities only (no `&bull;`, no HTML emoji entities). |
| `favicon.svg` | 32x32 SVG favicon with orange-gold gradient. |
| `site.webmanifest` | PWA manifest for installability. |

## Key Technical Details

### Metronome (Web Audio API)
- Lookahead scheduling: `setInterval` at 25ms schedules audio 100ms ahead via `audioContext.currentTime`
- OscillatorNode clicks: accent=1000Hz, normal=800Hz, subdivision=600Hz
- 6 ghost beat modes: `all`, `2-4`, `1-3`, `synco-e`, `synco-and`, `silent-bars`
- `Metro.beatTimestamps[]` stores scheduled beat times for accuracy tracking

### Tap Pads
- 6 pads: hihat, snare, crash, tom1, kick, tom2
- Sounds synthesized via Web Audio (oscillators + noise buffers + filters)
- Keyboard: Q/W/E (top row), A/S/D (bottom row)
- Touch: `touchstart` with `passive: false` for zero-latency mobile

### Accuracy Tracking
- Measures ms offset from nearest metronome grid position
- Grades: perfect (<=10ms), good (<=25ms), ok (<=50ms), miss (>50ms)

### Gamification
- XP: 50-100 per exercise, ~4500 total
- 10 levels: Novice -> Temporal Wizard
- Phase unlocking via cumulative XP thresholds
- Streak tracking (consecutive days)
- All progress in `localStorage`

### Design System
- Background: `#0a0a0f`, Accent: `#ff6b35` (orange), Gold: `#ffc857`, Teal: `#4ecdc4`
- Fonts: Inter (body), JetBrains Mono (code/numbers)
- Mobile-first, touch-friendly (44px min targets)

## Deployment
- Hosted at: `https://karx.github.io/kaaroPercussion/`
- GitHub Pages — push to main branch deploys automatically
- All URLs in meta tags, JSON-LD, and manifest must use this base URL

## Guidelines When Modifying
1. **No build tools** — everything runs directly in the browser
2. **Consult `seed.md`** for any curriculum or pedagogical changes
3. **SVG files** — use only XML-valid entities (`&#x2022;` not `&bull;`, hex escapes not HTML emoji names)
4. **Metronome changes** — preserve the lookahead scheduling pattern; never use `setTimeout` for audio timing
5. **New exercises** — add to `data.js` with proper `type`, update rendering in `app.js` `renderExercise()`
6. **SEO changes** — update both JSON-LD schemas, OG tags, Twitter cards, and manifest consistently
7. **Test on mobile** — tap pads and metronome are core mobile experiences
