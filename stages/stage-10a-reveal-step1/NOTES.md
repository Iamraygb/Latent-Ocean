# Stage 10A — Reveal Mode, Step 1: Encoded Distributions

**Git tag:** `stage-10a`
**Status:** Complete. Eight of ten acceptance checks verified automatically; two
need a human at a real browser.

Only the first explainer concept is implemented. The prior, KL divergence,
sampling, reconstruction and the full β-VAE objective are **not** here.

## The scientific contract

Each cloud is read as the approximate posterior for one representative input
image:

```
q_phi(z|x) = N(mu_phi(x), sigma_phi^2(x) I)
```

- The fish artwork is the input image `x`.
- The **complete cloud** is the distribution — not the fish, not the centre.
- The centre is the mean `mu`, not a sampled point.
- The radius is one shared standard deviation `sigma`.
- The circle is a **one-standard-deviation contour**, not a hard edge. The
  Gaussian continues beyond it, and the copy says so on screen.

The interface never calls a cloud a class cluster, never ties the radius to
image size, confidence, data quantity or accuracy, and never presents dragging
as something a real encoder is doing.

## The mapping

```
worldUnitsPerLatentUnit = reefRadius / latentUnitsPerReefRadius
muX   = (cloudCenterX - reefCenterX) / worldUnitsPerLatentUnit
muY   = (reefCenterY - cloudCenterY) / worldUnitsPerLatentUnit
sigma = cloudRadius / (worldUnitsPerLatentUnit * cloudContourStandardDeviations)
```

Reef centre is the latent origin. One reef radius is one latent unit. Screen y
is inverted so moving a cloud upward raises `mu2`.

**Computed in rendered pixels, deliberately.** Every result divides one pixel
measurement by another, so it is a ratio and screen-size independent. The
percentage system was rejected because it is anisotropic — `--x` is a share of
width and `--y` of height, so "one reef radius up" would not equal "one reef
radius right" and checks 2 and 3 would disagree with each other.

Geometry comes from `getCloudGeometry()` and `getReefGeometry()`, the same
functions the intersection maths uses, so the explainer and the metrics can
never disagree about where a cloud is. Nothing is derived from fish-image
bounds or decorative glow. `box-sizing: border-box` is global, so the cloud's
border sits inside the measured box and does not inflate sigma.

Full precision is kept internally; `formatPosteriorParameters()` rounds to two
decimals for display only, and maps a value rounding to zero from below onto
`0.00` rather than `-0.00`.

## Files changed

`index.html`, `style.css`, `app.js`.

## Functions added

- `worldUnitsPerLatentUnit(reefGeometry)`
- `worldPointToLatent(x, y, reefGeometry)`
- `calculatePosteriorParameters(cloudGeometry, reefGeometry)`
- `formatPosteriorParameters(parameters)`
- `ensureAnnotations()`, `selectCloud()`, `updateExplainer()`,
  `announcePosterior()`, `openReveal()`, `closeReveal()`, `initReveal()`

## Functions reused, unchanged

`getCloudGeometry()`, `getReefGeometry()`, `circleIntersectionArea()`,
`computeReefOverlap()`, `computeNeighbourCompatibility()`,
`calculateConfigurationScore()`, `moveCloudBy()`, `clamp()`.

`updateMetrics()` gained one call to `updateExplainer()`, which returns
immediately unless Reveal Mode is open.

## Acceptance checks

### Verified automatically

| # | Check | Result |
|---|---|---|
| 1 | Cloud centred on reef gives mu = (0,0) | `(0.00, 0.00)`, residual 1.3e-7 |
| 2 | One reef radius right gives mu1 = +1 | 1.000043 |
| 3 | One reef radius up gives mu2 = +1 | 1.000044 |
| 4 | Radius half the reef radius gives sigma = 0.5 | 0.499978 |
| 5 | Proportional resize leaves mu and sigma unchanged | drift 8e-5, identical when displayed |
| 6 | Dragging changes mu but not sigma | mu moved, sigma bit-identical |
| 7 | Selecting another cloud updates annotations and values | orange to eel, exactly one selected, three muted |
| 8 | Repeated open/close does not duplicate listeners | five cycles, each opened once and closed once |
| 9 | Exiting restores appearance and focus | classes, opacity, aria and focus all restored |
| 10 | Existing behaviour still works | keyboard, metrics, beta, animation all intact |

**On the residuals in checks 2 to 4.** These are roughly 4e-5, which is *not*
floating-point noise — it is the browser quantizing layout to sub-pixel units.
At a 1440px world the reef radius is about 119.5px, and 1/64px of quantization
is about 1.3e-4 relative. The formula is exact; its inputs are rounded by the
layout engine. The error is three orders of magnitude below the two-decimal
display precision, so nothing visible is affected. An initial test run used
1e-6 and 1e-9 tolerances and reported failures; those tolerances were wrong for
pixel-derived geometry, not the maths.

### Still require manual browser testing

Two things could not be exercised honestly by automation:

1. **Real pointer click-to-select.** The click-versus-drag discrimination uses a
   4px movement threshold on genuine pointer events. Synthetic events were not
   used to fake this, because doing so would test the harness rather than the
   feature. **Please click a cloud and confirm it becomes selected, then drag
   one and confirm it moves without changing the selection.**
2. **Screen reader announcement behaviour.** The debounce and the
   announce-on-drag-end path are wired and the live region updates, but whether
   the cadence is comfortable can only be judged with a real screen reader.

Also worth confirming by hand, carried over from earlier stages: Shift plus an
arrow key, and `prefers-reduced-motion`.

## Two test artifacts worth recording

**A "failed" check 9 that was not a failure.** The first run reported appearance
not restored, because Reveal Mode was already open when the test began, so the
opening click was a no-op and the comparison was against an open state. Re-run
from a guaranteed-closed state, it passed.

**HUD opacity read as 1 instead of 0.35.** The muting has a 0.2s transition, and
`getComputedStyle` immediately after adding the class returns the mid-transition
value. Measured after the transition settles, it is 0.35.

## Accessibility

- Escape closes; focus moves to the heading on open and returns to the button on
  close; `aria-expanded` tracks state.
- Clouds carry `aria-pressed` only while Reveal Mode is open.
- Enter or Space on a focused cloud selects it, handled before the arrow keys so
  movement is unaffected.
- Centre and spread are marked with a cross and a dashed line with tick, plus
  the letters mu and sigma, and the panel repeats those shapes as keys. Nothing
  depends on colour alone.
- Announcements are debounced at 350ms and fire on drag end, so a pointer drag
  does not flood a screen reader.

**Deliberate deviation from modal convention:** Reveal Mode does **not** trap
focus. A trap would make the clouds unreachable, and the brief requires them to
stay draggable and selectable while it is open. Escape and focus return are
implemented; the trap is not. This was raised and approved before implementation.

## Known limitations

- **Every cloud reports the same sigma, 0.66**, because all four are 11% of world
  width. The concept is shown but never varies. Giving each cloud its own sigma
  would need a cloud-size change, which this stage is not permitted to make.
- On a phone the measurement panels, the slider and the Reveal button are hidden
  while Reveal Mode is open. There is no room for both, and they are muted
  anyway; they keep calculating throughout and return on close. This is an
  escalation of "visually muted" that the brief did not explicitly authorise for
  small screens.
- The `D` debug key remains global and still toggles the reef outline inside
  Reveal Mode.
- Reopening keeps the previously selected cloud rather than resetting to orange.
  First open defaults to orange as specified.

## Values at the designed positions

| Cloud | mu | sigma |
|---|---|---|
| Round orange | (-0.86, -0.44) | 0.66 |
| Oval teal | (0.47, -0.03) | 0.66 |
| Narrow blue | (2.04, 0.92) | 0.66 |
| Purple eel | (-3.03, 1.67) | 0.66 |

## How to view this stage

Open `index.html` and press **Reveal the Model**, or run
`git checkout stage-10a` from the project root.
