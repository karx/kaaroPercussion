// KaaroPercussion - Course Content Data
// All phases, lessons, exercises, and video references

const COURSE_DATA = {
  phases: [
    // ============================================================
    // PHASE I: Temporal Architecture & Metronomic Continuum
    // ============================================================
    {
      id: 1,
      title: "Temporal Architecture",
      subtitle: "The Metronomic Continuum",
      icon: "\u{1F3AF}",
      xpRequired: 0,
      description: "Establish a rigid temporal grid and condition your mind to accurately calculate the passage of milliseconds. The external metronome acts as an impartial pedagogical mirror.",
      lessons: [
        {
          id: "1-1",
          title: "Developing the Internal Clock",
          content: `<p>True expressive timing cannot exist without a baseline of metronomic perfection. This lesson establishes a rigorous 30-minute daily routine designed for beginner calibration.</p>
<p>The cognitive focus is entirely on <strong>active listening</strong>. You must critically evaluate whether your physical strikes land slightly ahead of the click, directly on it, or slightly behind it. The ultimate goal is for your strike to perfectly <em>mask</em> the digital transient of the metronome click, making the click seemingly disappear.</p>`,
          videos: [
            { id: "wfBPS6d7c7k", title: "Beginner Drum Timing Exercise | Quarter & Eighth Notes" }
          ],
          exercises: [
            {
              id: "1-1-1",
              type: "metronome-practice",
              title: "Groove Lock-In",
              instructions: "Set the metronome to 70 BPM and execute a simple 4/4 ostinato. Focus entirely on active listening \u2014 your strikes should perfectly mask the click, making it disappear. Practice for 10 minutes.",
              targetBPM: 70,
              durationMinutes: 10,
              xpReward: 50
            },
            {
              id: "1-1-2",
              type: "metronome-practice",
              title: "Fill and Return",
              instructions: "Play a standard groove for 3 bars, execute a complex fill during bar 4, and re-enter the groove flawlessly on the downbeat of bar 5. The metronome is your absolute arbiter. Practice for 10 minutes at 70 BPM.",
              targetBPM: 70,
              durationMinutes: 10,
              xpReward: 50
            },
            {
              id: "1-1-3",
              type: "metronome-challenge",
              title: "Metronome Challenge Drill",
              instructions: "Halve the tempo: set the metronome to 35 BPM but continue playing at 70 BPM. Treat the click as only beats 1 and 3 (or 2 and 4). The vast silence between clicks forces your internal clock to handle the subdivisions. 10 minutes.",
              targetBPM: 35,
              durationMinutes: 10,
              xpReward: 75
            }
          ]
        },
        {
          id: "1-2",
          title: "Advanced Subtractive Timekeeping",
          content: `<p>As your internal temporal continuum strengthens, engage in <strong>Subtractive Practice</strong>. The metronome is programmed to click only on specific beats or syncopated partials, forcing you to maintain the downbeat internally.</p>
<p>The apex is the <strong>Silent Metronome Challenge</strong>: the click drops out entirely for several measures before returning. If your internal BPM calculation is accurate, you'll land perfectly in phase when the pulse returns.</p>
<p>When advancing tempos, use the <strong>Metronome Ladder</strong> \u2014 increase in micro-increments of 5 BPM. This allows your nervous system to adapt without inducing the tension that destroys rhythmic accuracy.</p>
<p>Away from the instrument, actively engage in <strong>environmental tempo recall</strong> \u2014 tap the beat of ambient music in stores, on TV, in your car. Turn your body into a continuous receptor of rhythm.</p>`,
          videos: [
            { id: "CH7qOLmW5nA", title: "Working Out A Tempo Without A Metronome" },
            { id: "TRa1LGrCTkg", title: "How to Memorize Every Tempo Without a Metronome" }
          ],
          exercises: [
            {
              id: "1-2-1",
              type: "metronome-challenge",
              title: "Backbeat Click",
              instructions: "Use the \u201C2 & 4 Only\u201D click mode (button below or in the metronome panel). The click only sounds on beats 2 and 4, mimicking a jazz hi-hat. Maintain a steady groove at 80 BPM while the click pulls against your downbeat. Use the tap pads to practice your timing \u2014 the accuracy tracker will show how close you land to the grid.",
              targetBPM: 80,
              ghostMode: "2-4",
              durationMinutes: 10,
              xpReward: 75
            },
            {
              id: "1-2-2",
              type: "metronome-challenge",
              title: "Silent Metronome Challenge",
              instructions: "Use the \u201CSilent Bars\u201D click mode (button below or in the metronome panel). The metronome plays for 2 bars, then drops out for 2 bars, and repeats. Your job: stay perfectly in phase during the silent bars. Use the tap pads to check your timing when the click returns.",
              targetBPM: 90,
              ghostMode: "silent-bars",
              durationMinutes: 10,
              xpReward: 100
            },
            {
              id: "1-2-3",
              type: "tempo-ladder",
              title: "Metronome Ladder",
              instructions: "Start at 60 BPM. Play a groove for 2 minutes, then increase by 5 BPM. Repeat until you reach 100 BPM. Never skip increments \u2014 let your nervous system adapt gradually.",
              xpReward: 75
            }
          ]
        }
      ]
    },

    // ============================================================
    // PHASE II: Kinesiology, Biomechanics & Rudiments
    // ============================================================
    {
      id: 2,
      title: "Biomechanics & Rudiments",
      subtitle: "Stick Control & Physical Conditioning",
      icon: "\u{1F4AA}",
      xpRequired: 200,
      description: "Condition the hands and wrists \u2014 the biomechanical conduits through which the internal clock manifests acoustic sound. Without developed fast-twitch muscle response and fulcrum control, you'll hit a physiological speed limit.",
      lessons: [
        {
          id: "2-1",
          title: "Stick Control & Natural Rebound",
          content: `<p>The foundational text is George Lawrence Stone's <em>Stick Control for the Snare Drummer</em>. Every exercise is intended to be played <strong>20 consecutive times</strong> without stopping, at various tempos, ensuring the neural pathways are deeply myelinated.</p>
<p><strong>Natural rebound is critical:</strong> Tension is the enemy of both speed and micro-timing. The stick is held over the drum, the wrist initiates a downward throw, and the kinetic energy from the drumhead naturally rebounds the stick back to its starting position. Do NOT force the stick down and pull it back up \u2014 this doubles the workload and causes rapid fatigue, tendonitis, and an inability to play rapid, relaxed phrases.</p>`,
          videos: [],
          resources: [
            { title: "Stick Control for the Snare Drummer \u2014 George Lawrence Stone", url: "https://www.goodreads.com/book/show/105813" },
            { title: "What's the point in Stick Control?", url: "https://www.reddit.com/r/drums/comments/1jgd41c/whats_the_point_in_stick_control_whats_the_best/" }
          ],
          exercises: [
            {
              id: "2-1-1",
              type: "metronome-practice",
              title: "Stone's Exercise #1: Alternating Singles",
              instructions: "Play RLRL RLRL continuously. Start at 60 BPM, play each line 20 times without stopping. Focus on matched stick heights and natural rebound. Both hands must produce identical volume and tone.",
              targetBPM: 60,
              durationMinutes: 10,
              xpReward: 50
            },
            {
              id: "2-1-2",
              type: "self-assessment",
              title: "Rebound Technique Check",
              instructions: "Self-evaluate your rebound technique. Hold the stick loosely, throw it at the drum, and let it bounce back naturally. Check: Are you gripping too tightly? Does the stick return to its starting height? Can you play 8 bars without forearm tension?",
              checklist: [
                "Stick returns to starting height naturally",
                "No forearm tension after 8 bars",
                "Both hands produce equal volume",
                "Fulcrum point feels natural and loose"
              ],
              xpReward: 50
            }
          ]
        },
        {
          id: "2-2",
          title: "The Vocabulary of Rudiments",
          content: `<p>The rudiments serve as the fundamental phonetic alphabet of percussion. Mastery of these sticking patterns allows you to navigate the drum set without encountering muscular \u201Csticking traps.\u201D</p>
<table class="data-table">
<tr><th>Rudiment</th><th>Sticking</th><th>Purpose</th></tr>
<tr><td>Single Stroke Roll</td><td>R L R L R L R L</td><td>Primary mechanism for linear speed and direct articulation. Builds fast-twitch response.</td></tr>
<tr><td>Double Stroke Roll</td><td>R R L L R R L L</td><td>Foundation for buzz rolls and drag figures. Requires finger control for the second stroke.</td></tr>
<tr><td>Single Paradiddle</td><td>R L R R / L R L L</td><td>Combines single and double strokes. The double at the end forces the opposite hand to lead.</td></tr>
<tr><td>Double Paradiddle</td><td>R L R L R R / L R L R L L</td><td>Six-note pattern ideal for triplet subdivisions and 6/8 meter applications.</td></tr>
<tr><td>Flam</td><td>lR / rL</td><td>Grace note technique creating a thicker, broader sonic texture than a single hit.</td></tr>
</table>`,
          videos: [],
          resources: [
            { title: "5 Easy Drum Rudiments For Beginners \u2014 Drumeo", url: "https://www.drumeo.com/beat/5-easy-drum-rudiments-for-beginners/" }
          ],
          exercises: [
            {
              id: "2-2-1",
              type: "sticking-display",
              title: "Single Stroke Roll",
              instructions: "Play RLRLRLRL continuously at 60 BPM as sixteenth notes. Gradually increase to 100 BPM over multiple sessions. Focus on even stick heights and matched dynamics between hands.",
              pattern: { sticking: "RLRLRLRL", accents: [] },
              targetBPM: 60,
              xpReward: 50
            },
            {
              id: "2-2-2",
              type: "sticking-display",
              title: "Double Stroke Roll",
              instructions: "Play RRLLRRLL continuously. The second stroke of each double must be produced with finger control, not a full wrist stroke. Start at 50 BPM.",
              pattern: { sticking: "RRLLRRLL", accents: [0, 2, 4, 6] },
              targetBPM: 50,
              xpReward: 50
            },
            {
              id: "2-2-3",
              type: "sticking-display",
              title: "Single Paradiddle",
              instructions: "Play RLRR LRLL. The double stroke at the end inherently forces the opposite hand to lead the next sequence. Master at 60 BPM before increasing.",
              pattern: { sticking: "RLRRLRLL", accents: [0, 4] },
              targetBPM: 60,
              xpReward: 50
            },
            {
              id: "2-2-4",
              type: "sticking-display",
              title: "Flam Technique",
              instructions: "Play flams alternating: lR rL lR rL. The grace note (lowercase) lands milliseconds before the primary stroke (uppercase). Keep the grace note stick very low to the drum.",
              pattern: { sticking: "lRrLlRrL", accents: [1, 3, 5, 7] },
              targetBPM: 50,
              xpReward: 50
            }
          ]
        },
        {
          id: "2-3",
          title: "Weak Hand & Moeller Technique",
          content: `<p>A universal hurdle: the discrepancy between dominant and non-dominant hand. Use the <strong>\u201C3x More Principle\u201D</strong> \u2014 play any exercise three times as long with your weaker hand.</p>
<p>The <strong>Stone Killer</strong> exercise (from Joe Morello\u2019s <em>Master Studies</em>): play continuous sixteenth notes on one hand \u2014 4 reps of RRRR, then LLLL \u2014 at 60 BPM. Scale to 10, 25, and eventually 50 continuous strokes per hand.</p>
<p>The <strong>Moeller Technique</strong> uses a continuous, wave-like whipping motion of arm, wrist, and fingers. A \u201Cwhip, tap, upstroke\u201D sequence achieves blinding speeds with a fraction of the muscular exertion.</p>`,
          videos: [],
          resources: [
            { title: "12 Minutes to Stronger Hands \u2014 Studio Drum MTL", url: "https://www.studiodrummontreal.com/post/12-minutes-to-stronger-hands" }
          ],
          exercises: [
            {
              id: "2-3-1",
              type: "metronome-practice",
              title: "Stone Killer \u2014 4 Strokes",
              instructions: "At 60 BPM, play RRRR LLLL RRRR LLLL as continuous sixteenth notes. Focus on even dynamics. Each group of 4 must be identical in volume and spacing. Practice 10 minutes.",
              targetBPM: 60,
              durationMinutes: 10,
              xpReward: 75
            },
            {
              id: "2-3-2",
              type: "timed-practice",
              title: "3x Weak Hand Principle",
              instructions: "Choose any rudiment from this phase. Play it for 2 minutes leading with your strong hand, then 6 minutes leading with your weak hand. Notice the imbalance and commit to correcting it.",
              durationMinutes: 8,
              xpReward: 75
            }
          ]
        }
      ]
    },

    // ============================================================
    // PHASE III: Subdivision Fluency & Grid Methodology
    // ============================================================
    {
      id: 3,
      title: "Subdivision & Grid",
      subtitle: "The Mathematics of Inner Beats",
      icon: "\u{1F4CA}",
      xpRequired: 500,
      description: "Learn to divide the pulse mathematically and execute microscopic divisions with absolute precision. True rhythmic mastery requires switching seamlessly between unrelated subdivisions without altering the BPM.",
      lessons: [
        {
          id: "3-1",
          title: "Subdivision Fluency",
          content: `<p>Subdivisions are the mathematical fractions of a beat \u2014 eighth notes, triplets, sixteenth notes, and thirty-second notes. You must develop the cognitive agility to switch seamlessly between them.</p>
<p>For instance, transitioning from a straight sixteenth-note grid (4 equal parts) to a sixteenth-note triplet grid (6 equal parts) requires your brain to instantly recalculate the spatial distance between notes \u2014 while the underlying BPM stays constant.</p>`,
          videos: [
            { id: "DRZ_oKa3oR4", title: "How To Practice Subdivision On The Drums" },
            { id: "AQEnmt8vvuY", title: "A Perfect Guide to Understanding Subdivisions" }
          ],
          exercises: [
            {
              id: "3-1-1",
              type: "metronome-practice",
              title: "Subdivision Switching",
              instructions: "At 80 BPM: Play 2 bars of eighth notes, then 2 bars of triplets, then 2 bars of sixteenth notes. Repeat the cycle. The quarter-note pulse must remain rock solid as you change the subdivision density.",
              targetBPM: 80,
              durationMinutes: 10,
              xpReward: 75
            },
            {
              id: "3-1-2",
              type: "metronome-practice",
              title: "Triplet to Sixteenth Transition",
              instructions: "At 70 BPM: Play 4 bars of triplets, then immediately switch to sixteenth notes on bar 5 without any hesitation. The downbeats must remain perfectly aligned with the click.",
              targetBPM: 70,
              durationMinutes: 10,
              xpReward: 75
            }
          ]
        },
        {
          id: "3-2",
          title: "The 16th Note Accent Grid",
          content: `<p>The Grid Method, originating from drum corps warm-ups, forces you to move a dynamically accented stroke through every possible partial of a subdivision while maintaining low, consistent tap strokes.</p>
<p>This exercise isolates the micro-timing of inner beats. You easily identify the downbeat, but frequently rush the inner partials (\u201Ce\u201D and \u201Ca\u201D). Forcing an accent onto these weak partials makes your brain acknowledge their exact spatial location.</p>
<table class="data-table">
<tr><th>Phase</th><th>Accented Partial</th><th>Pattern</th><th>Challenge</th></tr>
<tr><td>Phase 1</td><td>Downbeat</td><td><strong>1</strong> e & a, <strong>2</strong> e & a</td><td>Easiest \u2014 relies on natural gross motor inclination</td></tr>
<tr><td>Phase 2</td><td>"e"</td><td>1 <strong>e</strong> & a, 2 <strong>e</strong> & a</td><td>Accent immediately follows downbeat, causes rushing</td></tr>
<tr><td>Phase 3</td><td>"&"</td><td>1 e <strong>&</strong> a, 2 e <strong>&</strong> a</td><td>Upbeat pulse \u2014 creates reggae/ska inversion</td></tr>
<tr><td>Phase 4</td><td>"a"</td><td>1 e & <strong>a</strong>, 2 e & <strong>a</strong></td><td>Hardest \u2014 must prevent blending into the following downbeat</td></tr>
</table>`,
          videos: [
            { id: "icqGQOdppxc", title: "16th Note Grid \u2014 How to Play" },
            { id: "ePSFvIutFE8", title: "16th Note Accent Grid + Breakdown" }
          ],
          exercises: [
            {
              id: "3-2-1",
              type: "rhythm-notation",
              title: "Accent Grid: Downbeat (Phase 1)",
              instructions: "Play continuous sixteenth notes with an accent on every downbeat. All other notes are quiet taps. Maintain even spacing at 80 BPM. Use RLRL sticking.",
              pattern: { beats: 4, subdivision: 4, accents: [0, 4, 8, 12] },
              targetBPM: 80,
              xpReward: 50
            },
            {
              id: "3-2-2",
              type: "rhythm-notation",
              title: "Accent Grid: The \"e\" (Phase 2)",
              instructions: "Accent lands on the second partial of each beat. This is highly challenging \u2014 the accent immediately follows the downbeat, often causing you to rush. Stay locked to the click at 70 BPM.",
              pattern: { beats: 4, subdivision: 4, accents: [1, 5, 9, 13] },
              targetBPM: 70,
              xpReward: 75
            },
            {
              id: "3-2-3",
              type: "rhythm-notation",
              title: "Accent Grid: The \"&\" (Phase 3)",
              instructions: "Accent the upbeat (third partial). This creates a reggae-like inversion of the standard feel. Keep taps extremely quiet and accents strong. 70 BPM.",
              pattern: { beats: 4, subdivision: 4, accents: [2, 6, 10, 14] },
              targetBPM: 70,
              xpReward: 75
            },
            {
              id: "3-2-4",
              type: "rhythm-notation",
              title: "Accent Grid: The \"a\" (Phase 4)",
              instructions: "The hardest position: accent the fourth partial. Requires immense control to prevent the accented \"a\" from blending into the following downbeat. 65 BPM.",
              pattern: { beats: 4, subdivision: 4, accents: [3, 7, 11, 15] },
              targetBPM: 65,
              xpReward: 100
            }
          ]
        }
      ]
    },

    // ============================================================
    // PHASE IV: Four-Way Coordination & Limb Independence
    // ============================================================
    {
      id: 4,
      title: "Coordination & Independence",
      subtitle: "Four-Way Limb Liberation",
      icon: "\u{1F9E0}",
      xpRequired: 900,
      description: "Sever the brain's sympathetic link between limbs. Develop the neurological capability to maintain a repetitive ostinato with specific limbs while executing independent, syncopated phrases with the remaining limbs.",
      lessons: [
        {
          id: "4-1",
          title: "Ted Reed's Syncopation System",
          content: `<p>The universal, indispensable text: Ted Reed\u2019s <em>Progressive Steps to Syncopation for the Modern Drummer</em>. Originally written for sight-reading, modern pedagogy evolved it into a systemic matrix for four-way coordination.</p>
<p>Instead of playing the book on a single snare drum, use the written melody as a <strong>floating variable</strong> set against a <strong>fixed ostinato</strong>. This avoids the trap of memorizing hundreds of random grooves.</p>
<p><strong>Jazz Application:</strong> Right hand plays the ride cymbal pattern, left foot closes hi-hat on beats 2 and 4, right foot feathers the bass drum on all quarter notes. The written melody is assigned to the left hand on snare. Once mastered, shift the melody to the bass drum.</p>`,
          videos: [
            { id: "VgEeMJRjxC4", title: "How To Use Ted Reed's Syncopation With Ostinatos" },
            { id: "Q1DKQ3oGvs4", title: "Independence Exercise" }
          ],
          resources: [
            { title: "Improve Coordination \u2014 Ted Reed Syncopation \u2014 Tim Buell", url: "https://www.timbuellmusic.com/coordination/" }
          ],
          exercises: [
            {
              id: "4-1-1",
              type: "metronome-practice",
              title: "Jazz Ostinato: Melody on Snare",
              instructions: "Establish the jazz ride pattern (RH), hi-hat on 2 & 4 (LF), bass drum feathering quarters (RF). Now read any line from Reed's Syncopation book and play it with your left hand on the snare. Start at 100 BPM swing.",
              targetBPM: 100,
              durationMinutes: 15,
              xpReward: 100
            },
            {
              id: "4-1-2",
              type: "metronome-practice",
              title: "Jazz Ostinato: Melody on Bass Drum",
              instructions: "Same jazz ostinato, but now assign the Reed melody exclusively to the bass drum. The right foot must execute rapid syncopations without disrupting the ride cymbal. 90 BPM.",
              targetBPM: 90,
              durationMinutes: 15,
              xpReward: 100
            }
          ]
        },
        {
          id: "4-2",
          title: "World Rhythms & Vocalization",
          content: `<p>Advanced independence training uses <strong>Afro-Cuban and Brazilian rhythms</strong>. Samba requires a syncopated bass drum pattern that interacts with the hi-hat, while hands execute counter-rhythms on snare and cymbals.</p>
<p><strong>The vocalization test:</strong> You must be able to <em>sing</em> the written melody out loud while physically playing the underlying polyrhythm. If you cannot vocalize the syncopation, your brain has merely memorized a physical parlor trick rather than deeply understanding the mathematical relationship between the limbs.</p>
<p>If you can execute these coordination matrices first thing in the morning, or late at night when exhausted, the independence is ready for the stage.</p>`,
          videos: [],
          resources: [
            { title: "Modern Drummer: Developing Independence", url: "https://www.moderndrummer.com/2014/04/modern-drummer-education-team-weighs-developing-independence/" }
          ],
          exercises: [
            {
              id: "4-2-1",
              type: "metronome-practice",
              title: "Tribal Ostinato Challenge",
              instructions: "Play continuous sixteenth notes distributed between right hand (floor tom) and right foot (bass drum). With your left hand, improvise syncopated accents across the kit. Maintain 90 BPM for 5 minutes.",
              targetBPM: 90,
              durationMinutes: 5,
              xpReward: 75
            },
            {
              id: "4-2-2",
              type: "self-assessment",
              title: "Vocalization Test",
              instructions: "Choose any coordination exercise from this phase. Play the groove AND sing the syncopated melody out loud simultaneously. If you can't vocalize it, the independence isn't truly internalized.",
              checklist: [
                "Can sing the melody while hands play the ostinato",
                "Can maintain the groove while singing",
                "Groove doesn't falter when the vocal rhythm gets complex",
                "Can do this first thing in the morning"
              ],
              xpReward: 100
            }
          ]
        }
      ]
    },

    // ============================================================
    // PHASE V: Expressive Micro-Timing & The Pocket
    // ============================================================
    {
      id: 5,
      title: "Micro-Timing & Pocket",
      subtitle: "The Art of Controlled Imperfection",
      icon: "\u{1F3B5}",
      xpRequired: 1400,
      description: "The objective shifts from playing ON the grid to manipulating the microscopic space AROUND it. Intentional placement of notes milliseconds ahead or behind the beat controls the emotional gravity of the music.",
      lessons: [
        {
          id: "5-1",
          title: "Ahead, On, and Behind the Beat",
          content: `<p><strong>Behind the beat:</strong> Snare hits land a fraction of a millisecond after the pulse. Creates a relaxed, heavy, dragging feel \u2014 ubiquitous in blues, soul, R&B, and J Dilla\u2013inspired hip-hop.</p>
<p><strong>Ahead of the beat:</strong> Strikes land milliseconds before the pulse. Generates urgency, forward momentum, aggression \u2014 effective for punk, upbeat pop, and high-energy fills.</p>
<p><strong>The critical distinction</strong> between masterful micro-timing and simple incompetence: <em>structural consistency</em>. If you\u2019re intentionally placing the snare behind the beat, every single hit throughout the entire song must land at that exact micro-displacement. Studio legends like Jeff Porcaro defy quantization \u2014 yet feel immaculate because their micro-deviations are perfectly uniform.</p>`,
          videos: [
            { id: "CzNomxcMd3Q", title: "MICRO TIMING: Playing Behind or Ahead of the Beat" },
            { id: "3YRLT8ZvxsA", title: "Build Pocket and Timing With This Exercise Routine" }
          ],
          exercises: [
            {
              id: "5-1-1",
              type: "metronome-practice",
              title: "Behind the Beat Practice",
              instructions: "Set metronome to 75 BPM. Play a simple groove but intentionally place every snare hit slightly AFTER the click. The key: every snare must be displaced by the same amount. Record yourself and listen back.",
              targetBPM: 75,
              durationMinutes: 10,
              xpReward: 100
            },
            {
              id: "5-1-2",
              type: "metronome-practice",
              title: "Ahead of the Beat Practice",
              instructions: "Same groove, same tempo, but now place the snare slightly BEFORE the click. Notice how the feel shifts to urgency. Maintain consistent displacement throughout.",
              targetBPM: 75,
              durationMinutes: 10,
              xpReward: 100
            },
            {
              id: "5-1-3",
              type: "self-assessment",
              title: "DAW Transient Analysis",
              instructions: "Record yourself playing a groove for 2 minutes in a DAW. Zoom into the waveform and visually analyze where your snare transients land relative to the grid. Are the displacements consistent?",
              checklist: [
                "Recorded a 2-minute groove in a DAW",
                "Visually analyzed snare transient positions",
                "Displacements are consistent (not random drift)",
                "Dynamics are independent of timing position"
              ],
              xpReward: 75
            }
          ]
        },
        {
          id: "5-2",
          title: "Linear Drumming",
          content: `<p><strong>Linear drumming:</strong> No two limbs ever strike a surface simultaneously. This creates a continuous, single-note melody across the entire drum set. It provides the illusion of blistering speed while cleaning up the sonic texture.</p>
<p>Linear patterns replace standard hand combinations with <strong>hand/foot interpolations</strong>. For example: Right Hand, Left Hand, Right Foot, Left Foot. This fundamentally alters groove texture and density.</p>
<p>Mastery of linear drumming \u2014 integrating ghost notes and varying dynamic accents \u2014 pushes limb independence to its absolute zenith.</p>`,
          videos: [
            { id: "ZEd3cbKU9hs", title: "Intermediate Linear Drum Beats" },
            { id: "aGHKUUuasSM", title: "The 10 Levels of Linear Drumming" }
          ],
          exercises: [
            {
              id: "5-2-1",
              type: "sticking-display",
              title: "Basic Linear Pattern",
              instructions: "Play: RH (hi-hat), LH (snare), RF (kick), LH (snare) as continuous sixteenth notes. No two limbs strike simultaneously. Start at 70 BPM.",
              pattern: { sticking: "HSKSHSKS", accents: [0, 2] },
              targetBPM: 70,
              xpReward: 75
            },
            {
              id: "5-2-2",
              type: "sticking-display",
              title: "Linear with Ghost Notes",
              instructions: "Same linear concept but add ghost notes (very quiet snare taps) between the main accents. The dynamic contrast between ghost notes and accents creates the groove's depth.",
              pattern: { sticking: "HgKgHgKg", accents: [0, 2, 4, 6] },
              targetBPM: 70,
              xpReward: 100
            }
          ]
        }
      ]
    },

    // ============================================================
    // PHASE VI: Advanced Rhythmic Architecture
    // ============================================================
    {
      id: 6,
      title: "Rhythmic Architecture",
      subtitle: "Polyrhythms & Metric Modulation",
      icon: "\u{1F52E}",
      xpRequired: 2000,
      description: "The highest echelon: deliberate subversion of standard time signatures and overlaying conflicting mathematical structures. Odd groupings, dense polyrhythms, and the cognitive illusion of metric modulation.",
      lessons: [
        {
          id: "6-1",
          title: "Odd Note Groupings",
          content: `<p>Advanced percussionists disrupt binary/ternary predictability by organizing standard subdivisions into <strong>odd groupings</strong> (5s, 7s) while remaining in 4/4 time.</p>
<p>The <strong>7-7-5-5-3-3-2 paradigm</strong> (Bruce Becker): continuous sixteenth notes organized into fractional blocks that resolve over two measures of 4/4.</p>
<table class="data-table">
<tr><th>Block Size</th><th>Paradiddle Variation</th><th>Total Strokes</th></tr>
<tr><td>7-Note Block</td><td>Paradiddle Paradiddle Paradiddle Diddle</td><td>14 (7+7)</td></tr>
<tr><td>5-Note Block</td><td>Paradiddle Paradiddle Diddle</td><td>10 (5+5)</td></tr>
<tr><td>3-Note Block</td><td>Paradiddle Diddle</td><td>6 (3+3)</td></tr>
<tr><td>2-Note Block</td><td>Single Paradiddle</td><td>4</td></tr>
</table>
<p>Because the groupings are odd, the downbeat continuously shifts to different limbs, demanding intense polymetric awareness.</p>`,
          videos: [
            { id: "XzvCBZmnFoo", title: "The Buncha-5s-and-a-7 32nd Note Challenge" },
            { id: "wuSKpFJnlwo", title: "The Definitive Guide to Groupings of 5" }
          ],
          resources: [
            { title: "Easy Odd Note Groupings (7-7-5-5-3-3-2) \u2014 Drumeo", url: "https://www.drumeo.com/beat/easy-odd-note-groupings/" }
          ],
          exercises: [
            {
              id: "6-1-1",
              type: "metronome-practice",
              title: "Groupings of 5 in 4/4",
              instructions: "Play continuous sixteenth notes grouped in 5s (accent every 5th note) over a 4/4 click at 70 BPM. Notice how the accent cycles through different beat positions. Let the cycle resolve naturally.",
              targetBPM: 70,
              durationMinutes: 10,
              xpReward: 100
            },
            {
              id: "6-1-2",
              type: "metronome-practice",
              title: "7-7-5-5-3-3-2 Pattern",
              instructions: "Play continuous sixteenth notes, accenting in blocks of 7, 7, 5, 5, 3, 3, 2 over two bars of 4/4. The total (32 notes) resolves perfectly. Start at 60 BPM and memorize the accent pattern.",
              targetBPM: 60,
              durationMinutes: 15,
              xpReward: 100
            }
          ]
        },
        {
          id: "6-2",
          title: "Polyrhythms",
          content: `<p>Polyrhythms: two mathematically conflicting rhythmic grids played simultaneously. The <strong>Least Common Multiple (LCM)</strong> of the two rhythms dictates the underlying sub-grid.</p>
<p><strong>4:3 polyrhythm:</strong> 4 evenly spaced notes in the same time as 3. LCM = 12 micro-pulses. The \u201C3\u201D lands on pulses 1, 5, 9. The \u201C4\u201D lands on pulses 1, 4, 7, 10.</p>
<p>More complex: <strong>5:4</strong> (LCM = 20, aligns every 20 pulses), <strong>2:7</strong>. Master these by stripping away the drum set and tapping raw rhythms on a table, internalizing the melodic \u201Cchant\u201D the two conflicting rhythms create.</p>`,
          videos: [
            { id: "1VgtO1Q-61c", title: "4 Over 3 Polyrhythm \u2014 Advanced" },
            { id: "z8KC68s3i-s", title: "3 Against 4: Advanced Body Percussion Exercise" },
            { id: "Mq2BWMkgWzM", title: "How To Study Polyrhythms on Drums" }
          ],
          exercises: [
            {
              id: "6-2-1",
              type: "polyrhythm-visual",
              title: "4:3 Polyrhythm",
              instructions: "Play 4 evenly spaced notes with your right hand while your left hand plays 3 evenly spaced notes in the same timeframe. Use the visualization to understand the 12-pulse sub-grid. Start by tapping on a table.",
              polyrhythm: { a: 4, b: 3 },
              targetBPM: 60,
              xpReward: 100
            },
            {
              id: "6-2-2",
              type: "polyrhythm-visual",
              title: "5:4 Polyrhythm",
              instructions: "5 against 4. This only aligns every 20 pulses. Tap the raw rhythms on a table first, then move to the kit. Internalize the vocal chant the two rhythms create together.",
              polyrhythm: { a: 5, b: 4 },
              targetBPM: 50,
              xpReward: 100
            }
          ]
        },
        {
          id: "6-3",
          title: "Metric Modulation",
          content: `<p>The apex of temporal manipulation. A mathematical pivot from one tempo to another by reclassifying a subdivision as the new quarter-note pulse.</p>
<p><strong>Example:</strong> Playing at 90 BPM with eighth-note triplets, you reclassify the triplet speed as the new straight eighth notes. Your hands don\u2019t change speed, but the BPM mathematically shifts. You must mentally juggle both grids simultaneously for a measure before executing the pivot.</p>
<p>This is a highly advanced compositional tool that tests the absolute limits of your internal clock.</p>`,
          videos: [
            { id: "b5SkUZsb0uU", title: "Drum Lesson: Understanding Metric Modulation" },
            { id: "TNQGAK8GQJg", title: "Master Metric Modulation \u2014 Musicians Institute" }
          ],
          resources: [
            { title: "Understanding Metric Modulation \u2014 6 Studies (PDF)", url: "https://www.confidentdrummer.com/Free/UnderstandingMetricModulation-6Studies.pdf" }
          ],
          exercises: [
            {
              id: "6-3-1",
              type: "metronome-practice",
              title: "Triplet to Eighth Modulation",
              instructions: "At 90 BPM, play eighth-note triplets for 4 bars. On bar 5, treat the triplet speed as straight eighths \u2014 the BPM mathematically shifts. Your hand speed doesn't change, but the pulse does. Maintain the new tempo for 4 bars.",
              targetBPM: 90,
              durationMinutes: 10,
              xpReward: 100
            },
            {
              id: "6-3-2",
              type: "video-study",
              title: "Study: Metric Modulation Concepts",
              instructions: "Watch the video lessons below and study the 6 Studies PDF. Try to identify metric modulations in music you listen to. This concept requires deep conceptual understanding before physical execution.",
              xpReward: 50
            }
          ]
        }
      ]
    },

    // ============================================================
    // PHASE VII: Hand Percussion
    // ============================================================
    {
      id: 7,
      title: "Hand Percussion",
      subtitle: "Somatic Rhythmic Expression",
      icon: "\u{1F442}",
      xpRequired: 2700,
      description: "Remove the barrier between body and membrane. Direct skin-to-skin contact requires a completely different biomechanical approach to timing, endurance, and tone production.",
      lessons: [
        {
          id: "7-1",
          title: "The Phonetics of the Membrane",
          content: `<p>In conga and djembe performance, tones are a highly articulate rhythmic language. Producing these tones cleanly allows rhythms to sound even, with each stroke supporting the groove.</p>
<table class="data-table">
<tr><th>Articulation</th><th>Execution</th><th>Sound</th></tr>
<tr><td>Open Tone</td><td>Strike the edge where palm meets knuckles, let fingers bounce off the membrane</td><td>Resonant, sustained, high-pitched ringing</td></tr>
<tr><td>Slap</td><td>Whip relaxed fingertips into the center/edge, strike and immediately release. Fingers must NOT remain stiff.</td><td>Sharp, high-frequency, aggressive transient for accents</td></tr>
<tr><td>Heel-Tip (Heel-Toe)</td><td>Fleshy palm base drops into drumhead, then rock forward to bring fingertips down</td><td>Muffled, low-volume subdivision mechanism</td></tr>
</table>`,
          videos: [
            { id: "XMTBzi7B7DQ", title: "Heel-Tip Exercises for Congas" }
          ],
          resources: [
            { title: "Good Sounds on Congas \u2014 5 Basic Techniques", url: "https://rhythmnotes.net/basic-conga-techniques/" }
          ],
          exercises: [
            {
              id: "7-1-1",
              type: "video-study",
              title: "Open Tone Technique",
              instructions: "Watch the video and practice producing a clean open tone. Strike the edge of the drumhead where your palm meets your knuckles. Let the fingers bounce off immediately. The tone should ring and sustain. Practice on any available drum surface.",
              xpReward: 50
            },
            {
              id: "7-1-2",
              type: "video-study",
              title: "Slap Technique",
              instructions: "Practice the slap: whip relaxed fingertips into the drumhead and release immediately. If your fingers flop forward and stay on the head, the technique is ruined. The sound should be a sharp, high crack.",
              xpReward: 50
            },
            {
              id: "7-1-3",
              type: "timed-practice",
              title: "Heel-Tip Motor Pattern",
              instructions: "Practice the heel-tip rocking motion for 5 minutes. Palm heel drops, then rock forward to fingertips. This is the fundamental rhythmic motor of all conga playing. Keep it quiet and even.",
              durationMinutes: 5,
              xpReward: 75
            }
          ]
        },
        {
          id: "7-2",
          title: "The Clave & Tumbao",
          content: `<p>In Afro-Cuban music, the temporal grid is governed by the <strong>Clave</strong> \u2014 both a physical instrument and an immovable structural pattern. The <strong>son clave</strong> exists in 3:2 or 2:3 polarity and dictates the phrasing of every instrument.</p>
<p>The <strong>tumbao</strong> pattern uses heel-toe motion continuously as a quiet bed, interspersed with slaps and open tones: <strong>Heel, Toe, Slap, Toe, Heel, Toe, Open, Open</strong>.</p>
<p>Mastery requires extreme physical efficiency \u2014 relax your weight into the drum and let the non-striking hand rest lazily, preserving energy for hours-long performances.</p>`,
          videos: [
            { id: "Mq2BWMkgWzM", title: "How To Study Polyrhythms on Drums" }
          ],
          resources: [
            { title: "How to Play the Claves: Guide to Clave Rhythms \u2014 MasterClass", url: "https://www.masterclass.com/articles/how-to-play-the-claves" }
          ],
          exercises: [
            {
              id: "7-2-1",
              type: "rhythm-notation",
              title: "Son Clave 3-2",
              instructions: "Learn and internalize the 3-2 son clave pattern. Clap or tap it continuously until it feels automatic. This is the DNA of Afro-Cuban rhythm \u2014 everything else is built around it.",
              pattern: { beats: 8, subdivision: 2, accents: [0, 3, 6, 10, 12] },
              targetBPM: 90,
              xpReward: 75
            },
            {
              id: "7-2-2",
              type: "timed-practice",
              title: "Tumbao Pattern",
              instructions: "Play the tumbao: Heel, Toe, Slap, Toe, Heel, Toe, Open, Open. Repeat continuously for 10 minutes at a comfortable tempo. The heel-toe provides a quiet bed; slaps and open tones define the groove.",
              durationMinutes: 10,
              xpReward: 100
            }
          ]
        }
      ]
    },

    // ============================================================
    // PHASE VIII: Professional Practice & Tech Integration
    // ============================================================
    {
      id: 8,
      title: "Professional Practice",
      subtitle: "Regimen Architecture & Technology",
      icon: "\u{1F3C6}",
      xpRequired: 3500,
      description: "The dividing line between perpetual amateurism and professional mastery is the architecture of your daily routine. Focused 15-minute sessions 5 days a week beat a single 4-hour unfocused jam on the weekend.",
      lessons: [
        {
          id: "8-1",
          title: "The 3-Hour Professional Session",
          content: `<p>A professional routine is divided into deeply specific cognitive and physical zones:</p>
<table class="data-table">
<tr><th>Phase</th><th>Time</th><th>Focus</th><th>Method</th></tr>
<tr><td>I. Warm-Up</td><td>30-40 min</td><td>Stick Control, Moeller, tendon blood flow</td><td>Stone\u2019s Stick Control on practice pad, Stone Killer at scaling tempos</td></tr>
<tr><td>II. Reading</td><td>30-40 min</td><td>Four-way independence, sight-reading</td><td>Ted Reed\u2019s Syncopation with ostinatos, Gary Chester\u2019s The New Breed</td></tr>
<tr><td>III. Conceptual</td><td>30-40 min</td><td>Polyrhythms, metric modulation, linear constructs</td><td>Isolate one new concept and displace it across the kit</td></tr>
<tr><td>IV. Repertoire</td><td>60 min</td><td>Song application, micro-timing, transcription</td><td>Play along to records, transcribe solos, DAW analysis of pocket</td></tr>
</table>
<p><strong>Record everything.</strong> Your brain\u2019s processing power is occupied with physical execution \u2014 auditory perception is compromised in the moment. Listening back exposes flaws you couldn\u2019t hear while playing.</p>`,
          videos: [],
          resources: [
            { title: "Drummer's Guide to Practice Routines \u2014 Lessonface", url: "https://www.lessonface.com/content/drummers-guide-practice-routines" },
            { title: "How To Build A Drumming Practice Routine \u2014 Drumeo", url: "https://www.drumeo.com/beat/how-to-practice-drums/" }
          ],
          exercises: [
            {
              id: "8-1-1",
              type: "self-assessment",
              title: "Design Your Practice Routine",
              instructions: "Using the 3-hour template as inspiration, design a practice routine that fits your available time. Even 15 minutes of focused practice daily is more effective than weekend marathons.",
              checklist: [
                "Defined a warm-up section (stick control / rudiments)",
                "Defined a reading / coordination section",
                "Defined a conceptual exploration section",
                "Defined a repertoire / musicality section",
                "Set specific, trackable tempo goals with deadlines",
                "Committed to recording practice sessions"
              ],
              xpReward: 100
            },
            {
              id: "8-1-2",
              type: "self-assessment",
              title: "First Week Commitment",
              instructions: "Complete 5 out of 7 days of your designed practice routine this week. Use a habit tracker or journal to document each session.",
              checklist: [
                "Day 1 completed",
                "Day 2 completed",
                "Day 3 completed",
                "Day 4 completed",
                "Day 5 completed"
              ],
              xpReward: 100
            }
          ]
        },
        {
          id: "8-2",
          title: "Technology & Tools",
          content: `<p>Modern percussion technology accelerates the feedback loop, replacing guesswork with empirical data:</p>
<ul>
<li><strong>Smart Practice Pads:</strong> Bluetooth pads (RTOM, Offworld) measure velocity, strike placement, and rhythmic consistency between hands.</li>
<li><strong>Advanced Metronomes:</strong> Apps like Soundbrenner program complex polyrhythms, metric modulations, and odd time signatures.</li>
<li><strong>Visual Gamification:</strong> Melodics grades temporal accuracy on complex multi-limb patterns via a gamified interface.</li>
<li><strong>Digital Pedagogy:</strong> Drumeo provides structured roadmaps, synchronized sheet music, and looping tools to slow down and master complex phrases.</li>
</ul>`,
          videos: [],
          resources: [
            { title: "Top Drum Practice Apps and Tools \u2014 Drummer World", url: "https://www.drummerworld.com/articles/news/top-drum-practice-apps-tools-2025/" },
            { title: "Drumeo \u2014 Online Drum Lessons", url: "https://www.drumeo.com/beat/how-to-practice-drums/" }
          ],
          exercises: [
            {
              id: "8-2-1",
              type: "self-assessment",
              title: "Set Up Your Tech Stack",
              instructions: "Equip yourself with the tools that will accelerate your learning. You don't need everything \u2014 pick what fits your budget and goals.",
              checklist: [
                "Have a metronome app installed (Soundbrenner, Pro Metronome, or similar)",
                "Have a DAW or recording app for analyzing your playing",
                "Have a practice journal or habit tracker set up",
                "Explored at least one online lesson platform (Drumeo, Melodics, etc.)"
              ],
              xpReward: 50
            },
            {
              id: "8-2-2",
              type: "self-assessment",
              title: "Graduation: The Synthesized Rhythmic Master",
              instructions: "Reflect on your journey through all 8 phases. The fundamental objective \u2014 whether executing a linear fill on a drum set or a tumbao on a conga \u2014 is the complete mastery of the silence between the beats.",
              checklist: [
                "Can lock to a metronome at any tempo",
                "Rudiments are fluid and even between hands",
                "Can switch subdivisions without losing the pulse",
                "Can maintain an ostinato while improvising independently",
                "Understand and can execute micro-timing displacement",
                "Can feel and execute basic polyrhythms (4:3, 5:4)",
                "Can produce clean tones on hand percussion",
                "Have an established, regular practice routine"
              ],
              xpReward: 100
            }
          ]
        }
      ]
    }
  ]
};

// Level definitions
const LEVELS = [
  { level: 1, xpMin: 0, title: "Novice", color: "#a0a0b0" },
  { level: 2, xpMin: 250, title: "Timekeeper", color: "#4ecdc4" },
  { level: 3, xpMin: 500, title: "Rudiment Runner", color: "#45b7d1" },
  { level: 4, xpMin: 1000, title: "Grid Master", color: "#96c93d" },
  { level: 5, xpMin: 1500, title: "Independence Seeker", color: "#f7dc6f" },
  { level: 6, xpMin: 2000, title: "Pocket Player", color: "#ff9f43" },
  { level: 7, xpMin: 2500, title: "Rhythmic Architect", color: "#ff6b35" },
  { level: 8, xpMin: 3000, title: "Clave Guardian", color: "#ee5a24" },
  { level: 9, xpMin: 3500, title: "Percussion Master", color: "#e74c3c" },
  { level: 10, xpMin: 4500, title: "Temporal Wizard", color: "#9b59b6" }
];

// Phase icons as SVG paths (used in phase cards)
const PHASE_ICONS = {
  1: "metronome",
  2: "drumstick",
  3: "grid",
  4: "brain",
  5: "wave",
  6: "geometry",
  7: "hand",
  8: "trophy"
};
