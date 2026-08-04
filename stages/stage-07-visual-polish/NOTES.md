# Stage 07 — Visual Polish, Fish Float and Reduced Motion

**Git tag:** `stage-07`
**Status:** Complete. Final stage of the planned sequence.

## What this stage established

The calm underwater feel, and a decorative fish drift that is provably incapable
of disturbing either measurement.

## The constraint that shaped everything here

Both metrics are measured from `.cloud-region` via `getBoundingClientRect()`.
Animating the cloud, or its region, would move the measured centre on every
frame and make both readings jitter continuously.

So the animation is applied to **`.cloud-fish` only**. The fish drifts inside a
completely stationary circle.

This is structural rather than a matter of care: `.cloud-region` and
`.latent-cloud` both compute to `animation-name: none`, so there is no path by
which the drift can reach the measured geometry.

## What was implemented

**Fish drift**
- A `fish-float` keyframe: a gentle vertical bob of plus or minus 3.5% with a
  1.1 degree roll, on an ease-in-out cycle.
- Per-fish timing from `CONFIG.motion`: durations of 6, 6.8, 7.6 and 8.4 seconds,
  so the four never fall into step with each other.
- Negative delays of 0, -1.5, -3 and -4.5 seconds, so each fish begins partway
  through its cycle and the scene is already alive on load rather than every
  fish starting together.

**Cloud styling**
- Translucent fill replaced with a soft radial gradient, brighter toward the
  upper area, suggesting light falling through water.
- A two-layer outer glow, tight and wide, plus a subtle inner highlight.
- The circular boundary kept crisp at 2px so it stays clearly visible, which
  matters because the circle is the thing being measured.

**Fish handling**, all still holding from earlier stages and re-checked here:
aspect preserved via `object-fit: contain`, centred in the grid cell,
`pointer-events: none`, and `draggable="false"`.

**Reduced motion.** Under `prefers-reduced-motion: reduce`, the fish animation
and all decorative transitions stop. The interaction is untouched: clouds still
drag, arrow keys still move them, and both metrics still update. Only decoration
is removed, never function.

## Verified, not assumed

**The central proof.** Sampled 24 times across roughly 2.4 seconds of animation:

| Measurement | Result |
|---|---|
| Fish actually moved | 3.76 px |
| Cloud geometry drift (centre x, centre y, radius, all four clouds) | **0.000000 px** |
| Reef Overlap drift | **0.000000 percentage points** |

The fish demonstrably moves while the measured geometry does not move at all.
Not "small drift" — exactly zero.

**Animation placement**

| Element | animation-name |
|---|---|
| `.cloud-fish` | `fish-float` |
| `.cloud-region` | `none` |
| `.latent-cloud` | `none` |

**Stagger.** Four distinct durations and four distinct delays, confirmed from
computed styles.

**Reduced motion.** The media block was read back from the parsed stylesheet and
contains `.cloud-fish { animation: none; transform: none }`. Applying those same
declarations reduced fish travel from 1.162 px to exactly 0, confirming they do
stop the drift.

Caveat: the test harness cannot toggle the operating system's reduced-motion
setting, so the media query was verified by reading the parsed rule and by
applying its declarations, rather than by switching the real preference. Worth
one manual check.

**Regression across earlier stages**

| Check | Result |
|---|---|
| Reef Overlap, all four apart | 0% |
| Reef Overlap, all four stacked on the reef | 100% |
| Compatibility, all four apart | No overlap |
| Compatibility, all four stacked | 47% |
| Keyboard movement | still exact |
| Fish `pointer-events` | none |
| Fish `draggable` | false |
| Fish `object-fit` | contain |
| Designed starting positions | 35% |

The 47% deserves a note: with all four clouds stacked, all six pairs overlap
equally, so the area-weighted average collapses to the plain mean of the six
scores, `(0.85 + 0.55 + 0.55 + 0.55 + 0.15 + 0.15) / 6 = 46.67%`. The reading is
correct, and it is a useful sanity check on the weighting.

No console errors. Snapshot loads standalone with both panels, running staggered
animations, a stationary region, and focusable clouds.

## Known open items

- **Confirm reduced motion yourself** by enabling it in your OS display settings
  and reloading. It is the one behaviour the harness could not exercise for real.
- Pressing **D** still toggles the reef debug outline. Harmless, but it is a
  global key and a visitor could press it by accident. Worth deciding whether to
  restrict it to `?debug` only now the site is public.
- `assets/Background-Latent-Ocean.png` is still a duplicate of
  `ocean-background.png`, roughly 271 KB, pending a decision.
- Phone portrait remains cramped, with clouds around 43 px. The "rotate your
  device" hint was discussed and deliberately never added.
- The fish PNGs are roughly 1.2 MB each but display at around 130 px. Optimising
  them would cut the page weight substantially, which matters most on mobile.

## How to view this stage

Open `index.html` in this folder and watch the fish drift, or run
`git checkout stage-07` from the project root.
