# Stage 04 — Reef Overlap Metric and HUD

**Git tag:** `stage-04`
**Status:** Complete, math verified against analytic values

## What this stage established

The first live measurement. Drag a cloud toward the reef and the number climbs.

## The metric

```
Reef Overlap = sum of cloud-reef intersection areas
             / sum of all four cloud areas
             x 100
```

Each cloud is counted separately, even where two clouds overlap each other.
Nothing is subtracted from the numerator.

- **0%** — no cloud area lies inside the reef
- **100%** — all four cloud regions lie completely inside the reef

This measures **position relative to the reef**, and nothing else. Cloud-to-cloud
shape similarity is a separate metric arriving in Stage 05, deliberately kept
distinct in both the code and the interface.

## What was implemented

**`circleIntersectionArea(a, b)`** — the lens area where two circles overlap, in
square pixels. Three cases:

- apart, or exactly tangent, returns 0
- one circle inside the other returns the whole of the smaller circle
- partial overlap returns the sum of the two circular segments

`Math.acos` inputs are clamped to [-1, 1] and the `sqrt` argument floored at 0.
Without those guards, floating-point rounding at near-degenerate positions
produces `NaN`, which would silently poison the metric rather than fail loudly.

Both arguments use the shape returned by `getCloudGeometry` and
`getReefGeometry`, so clouds and the reef are interchangeable.

**`computeReefOverlap(cloudGeometries, reefGeometry)`** — applies the formula
above. Returns 0 rather than dividing by zero if there are no clouds.

**HUD** — a screen-fixed panel at the top, styled after the supplied mockup:
uppercase letter-spaced label, value at the right, and a fill bar beneath. Marked
up as a `role="progressbar"` with `aria-valuenow` and `aria-valuetext` kept in
step with the displayed number.

`updateOverlapState()` was renamed `updateMetrics()`, since it now drives a
measurement rather than only the overlap highlight. It runs continuously during
dragging.

## Verified, not assumed

**Nine analytic tests of the intersection maths, all passing:**

| Case | Expected | Got |
|---|---|---|
| Disjoint (d=3, r=1,1) | 0 | 0 |
| Externally tangent (d=2, r=1,1) | 0 | 0 |
| Concentric identical | pi | 3.141593 |
| Contained (R=5, r=1, d=2) | pi | 3.141593 |
| Internally tangent (R=5, r=1, d=4) | pi | 3.141593 |
| Equal circles at d=r | 1.228370 | 1.228370 |
| Symmetry, f(a,b) = f(b,a) | equal | equal |
| Never exceeds the smaller circle's area | bounded | bounded |
| Nearly concentric, no NaN | finite | finite |

**The metric against the cases in the brief**, driven by positioning clouds
programmatically:

| Arrangement | Expected | Got |
|---|---|---|
| All four far from the reef | 0% | 0.000% |
| Exactly one cloud centred on the reef | 25% | 25.000% |
| Two clouds centred on the reef | 50% | 50.000% |
| All four stacked on the reef centre | 100% | 100.000% |

**Scale invariance.** With positions locked to CONFIG, the value moved from
34.6583% to 34.6586% across a viewport change of 1440x900 to 1600x620 — a world
size change *and* a switch of letterbox axis. Drift of 0.0003 percentage points,
which is sub-pixel rounding.

**Other checks**

- HUD stayed in sync with a fresh computation at every point tested.
- Dragging the eel onto the reef moved the reading from 36% to 64%, with the bar
  tracking it.
- HUD fits without overflow or horizontal scrolling at 1600, 1440, 390 and 320
  px wide, and does not overlap the world.
- Snapshot folder loads standalone with all five images and the HUD in sync.
- No console errors.

## Confirmation of an earlier correction

Stage 03's notes withdrew the warning that 100% Reef Overlap might be
unreachable. Stacking all four clouds on the reef centre now measures exactly
100.000%, confirming the withdrawal empirically rather than by argument alone.

## A note on apparent value drift during testing

The reading was twice observed changing between a screenshot and a follow-up
measurement. Both times the cause was a cloud genuinely moving, from real
OS-level mouse input landing on the preview pane — the same effect diagnosed in
Stage 02. The HUD was checked against a fresh computation each time and was
always in sync. There is no desynchronisation between display and calculation.

## Reading at the designed starting positions

**34.66%**, with the four clouds at their CONFIG placements.

## Known open items carried forward

- The second HUD panel, Neighbour Compatibility, arrives in Stage 05. The HUD is
  a centred flex row, so the new panel will sit alongside this one and wrap on
  narrow screens.
- The bottom status panel still lists cloud-to-cloud overlaps from Stage 01. It
  is due to be repurposed in Stage 05 to carry the "Designed demonstration
  scores based on body shape" disclosure.
- `assets/Background-Latent-Ocean.png` remains a duplicate, pending a decision.
- Phone portrait remains cramped; the rotate hint is still deliberately absent.

## How to view this stage

Open `index.html` in this folder and drag a cloud toward the reef, or run
`git checkout stage-04` from the project root.
