# Stage 10B — Reveal Mode, Step 2: The Prior

**Git tag:** `stage-10b`
**Status:** Complete. 18 of 20 acceptance checks automated; 2 need a human.

Only the second explainer concept. No KL divergence, sampling, reconstruction or
the full objective.

## Scientific contract

The prior is `p(z) = N(0, I)`: a simplified two-dimensional standard normal
centred on the reef, with unit variance in each displayed dimension.

**A useful consequence, stated in the copy rather than left implicit:** one reef
radius is one latent unit and `sigma_prior = 1`, so the reef circle is exactly
the **one-standard-deviation contour** of the prior. It is a reference contour,
not a boundary. The density fade deliberately extends to 150% of world width so
the artwork cannot be read as the prior stopping at the reef edge.

The artwork's outer rings are decorative and not mathematically spaced, so the
copy calls them **qualitative density guides** and never attaches probability
percentages to them.

The interface never describes the prior as uniform inside the reef, a permitted
region, a class boundary, a cluster of training examples, or anything computed
from the four fish.

## The distance formula

```
d = sqrt((mu1 - muPrior1)^2 + (mu2 - muPrior2)^2)
```

With the configured prior at the origin this reduces to `sqrt(mu1^2 + mu2^2)`.

`calculateDistanceFromPriorMean(mu)` is pure and takes **latent values**, never
pixels, never image bounds, never glow. It consumes the full-precision `mu` that
Stage 10A's `calculatePosteriorParameters()` already produces.

`d` is labelled only as *distance from prior mean*. The interface states in
three places that it is the location part only, that spread also matters, and
that it is **not** the complete KL divergence. It is never called a probability,
a percentage, a mismatch total, or a similarity measure.

## How the distance line is positioned

The line is one DOM element anchored at the reef using the same `CONFIG.reef`
percentages `#reef-zone` uses, so it cannot drift from the mathematical centre.
Length and angle come from the same pixel geometry the metrics use:

```
dx = cloudGeometry.centerX - reefGeometry.centerX
dy = cloudGeometry.centerY - reefGeometry.centerY
width  = hypot(dx, dy) / worldRect.width * 100   (percent of world width)
rotate = atan2(dy, dx)
```

`transform-origin: 0 50%`, so it pivots at the reef. Percentage width resolves
against the world and rotation preserves length, so the drawn line equals the
measured separation. **One conversion from the existing geometry — no second
coordinate system.** It hides itself below 1px so a cloud centred on the reef
leaves no stub.

## Selected-cloud state between steps

`selectedCloud` is module-level and untouched by navigation. `goToStep()` only
sets `activeExplainerStep`, toggles which container is hidden, updates the label,
re-renders and moves focus. Verified by selecting the blue fish, moving to Step 2
and back, and confirming the selection held throughout.

## Files changed

`index.html`, `style.css`, `app.js`.

## Reused unchanged

`getCloudGeometry()`, `getReefGeometry()`, `worldPointToLatent()`,
`calculatePosteriorParameters()`, `formatPosteriorParameters()`,
`worldUnitsPerLatentUnit()`, `selectCloud()`, `announcePosterior()`,
`ensureAnnotations()`, the drag threshold, all four metrics, `moveCloudBy()`.
`updateExplainer()` was extended, not replaced. Step 1's copy, math disclosure,
annotations and behaviour are unchanged.

## Added

- `calculateDistanceFromPriorMean(mu)` — pure
- `createPriorAnnotations()`, `updateDistanceLine()`, `goToStep(step)`
- State: `activeExplainerStep`, `distanceLine`, `STEP_LABELS`
- Elements: `#prior-density`, `#prior-mean-marker`, `#distance-line`, the Step 2
  panel, and the two navigation controls

## Acceptance checks

### Automated — 18 of 20

| # | Check | Result |
|---|---|---|
| 1 | Opens at Step 1 | step 1, focus on its heading |
| 2 | Next opens Step 2, focuses heading | step 2, focus `step-2-heading` |
| 3 | Back returns to Step 1, focuses heading | step 1, focus `reveal-heading` |
| 4 | Selection persists across steps | blue fish held through both moves |
| 5 | Cloud on reef | mu (0.00, 0.00), d 0.00, line hidden |
| 6 | One radius right | mu (1.00, 0.00), d 1.00 |
| 7 | One radius up | mu (0.00, 1.00), d 1.00 |
| 8 | mu = (1,1) | d 1.41 |
| 9 | Equal radius, eight directions | all exactly 1.7 |
| 10 | Outward increases d | strictly increasing ladder |
| 11 | Dragging changes mu and d, not sigma | sigma identical |
| 12 | Selecting another cloud | name, mu, d and line width all changed; exactly one selected |
| 13 | Proportional resize | mu, sigma, d **identical strings**; line width drift 0.0002pp, angle 0.004 degrees |
| 14 | Prior marker aligned after resize | **0.000 px** offset from the mathematical reef centre |
| 15 | Annotations never intercept input | all `pointer-events: none`; hit test at cloud centre returns `.cloud-region` |
| 16 | Never calls d KL or total mismatch | wording audit passed |
| 17 | Reef edge described as reference | "does not stop at the reef edge" and "qualitative density guides" both present |
| 18 | D cannot hide Step 2 annotations | ignored while open; annotation display unchanged |
| 19 | No duplicate listeners or updates | 13 navigations produced 7 updates (one per entry to Step 2); one `updateMetrics()` produced exactly one |
| 20 | Existing behaviour intact | keyboard, beta, metrics, animation, Escape, focus return all pass |

### Still require manual browser testing — 2

1. **Real pointer click-to-select and drag.** The 4px threshold runs on genuine
   pointer events; faking them would test the harness rather than the feature.
   **Please click a cloud in Step 2 to select it, then drag one and confirm the
   line follows without the selection changing.**
2. **Screen reader cadence.** The shared live region now appends the distance in
   Step 2 and still debounces at 350ms, but whether the wording and rhythm are
   comfortable needs a real screen reader.

Also carried forward: Shift plus arrow, and `prefers-reduced-motion`.

## Two measurement artifacts, not defects

**Check 13 failed on the first attempt** with `cloudsMoved: true` — a cloud had
physically moved between calls from stray real pointer input on the preview
pane, the same effect diagnosed in Stage 02. Re-run with the locked percentages
explicitly restored, every value was identical.

**`lineOriginOffsetPx` read 0.961** rather than 0. The line is rotated, so
`getBoundingClientRect()` returns its axis-aligned box, whose left edge is not
the pivot. The pivot itself is exact, as check 14's 0.000px marker offset shows.

## Accessibility

Non-modal throughout: no `aria-modal`, no focus trap, no `inert`, no
`aria-hidden` on interactive clouds. Confirmed `aria-modal` is null, clouds all
have `tabIndex 0`, and there is **exactly one** live region in the panel, shared
by both steps.

Prior mean is a ring with a centre dot; encoded mean is a cross; distance is a
solid line with end ticks; spread is a short dashed segment. Four distinct
shapes, each labelled, echoed as keys in the panel. Nothing relies on colour.

Each step keeps its own independent `SHOW THE MATH` disclosure.

## Known limitations

- **All four clouds still report sigma 0.66.** Intentional for this stage, and it
  does let a learner isolate how moving mu changes d while sigma holds still.
- The density fade is a qualitative gradient, not a calibrated density plot. It
  is not labelled with probability values.
- Step 2 has no Step 3 control, by instruction. The closing sentence about KL
  divergence is explanatory copy only.

## How to view this stage

Open `index.html`, press **Reveal the Model**, then **Next: The Prior**. Drag the
selected cloud and watch d change while sigma holds. Or run
`git checkout stage-10b`.
