# Stage 10C — Reveal Mode, Step 3: KL Divergence

**Git tag:** `stage-10c`
**Status:** Complete. 25 of 27 acceptance checks automated; 2 need genuine
browser input.

Only the two-component explanation. No sampling, reparameterization, decoder,
reconstruction, Beta weighting or complete objective.

## The formulas

```
locationMismatch = 1/2 (mu1^2 + mu2^2)              = 1/2 d^2
spreadMismatch   = 1/2 k (s^2 - 1 - ln s^2)          k = EXPLAINER.latentDimensions
total            = locationMismatch + spreadMismatch
```

With `k = 2` the spread term reduces to `s^2 - 1 - ln(s^2)`, giving the expanded
form shown in the disclosure:

```
D_KL( q_phi(z|x) || p(z) ) = 1/2 [ mu1^2 + mu2^2 + 2( s^2 - 1 - ln s^2 ) ]
```

**Natural logarithm** — `Math.log`, which is base e in JavaScript. Result in nats.

Direction is `D_KL(q || p)`: the encoded distribution from the prior.

## Full precision into the calculation

`calculateKLComponents(mu, sigma)` takes the object returned by
`calculatePosteriorParameters()` **directly**. It never reads
`formatPosteriorParameters()` output, DOM text, pixels, image bounds, glow, CSS
transforms, or the drawn line's length. Rounding happens once, at render.

Proved rather than asserted: with a shipped cloud, KL from full precision was
**1.6703332968** while the same calculation fed the rounded display strings gave
**1.6766808879**. The two differ, and the on-screen value matches the
full-precision one.

**The total is calculated at full precision and rounded once.** It is never the
sum of the two rounded components. That means the displayed parts can appear not
to add up — 1.58 + 0.26 reads as 1.84 while the total shows 1.85 — so the
disclosure states that each value is rounded independently. Summing rounded
parts to force visual agreement would have meant calculating from rounded
inputs, which the brief forbids.

## Guards

- `sigma <= 0`, non-finite, or NaN returns `null` with one console warning rather
  than a plausible-looking number.
- The spread term is analytically non-negative but can land microscopically below
  zero at `sigma = 1`. Snapped to zero only within a documented `1e-12`
  tolerance. No broad clamping.
- At `sigma = 1` exactly the result is exactly `0`, not a tiny residue.

## Connection to Step 2 geometry

Step 3 reuses the same `calculatePosteriorParameters()` call already made for
Steps 1 and 2 in a single pass of `updateExplainer()`, so `mu`, `sigma`, `d`,
both components and the total can never disagree. The prior mean marker,
distance line and spread indicator carry over from Step 2; the distance line is
kept but dimmed to 55%, since in Step 3 it is evidence for the location
component rather than the subject.

## Selection across three steps

`selectedCloud` is module-level and untouched by `goToStep()`. Verified by
selecting the teal fish then walking 1 → 2 → 3 → 2 → 1: the selection held at
every stop.

## Step 2 caveat revision

The sentence calling the reef "the one-standard-deviation contour" was **never in
the interface** — it existed only in a CSS comment and Stage 10B's notes. So the
prescribed wording was added to Step 2's caveats, and the overstated claim was
corrected in both `style.css` and `stages/stage-10b-reveal-step2/NOTES.md`. The
interface now reads:

> In this tutorial, the reef radius equals one latent unit, matching one
> standard-deviation unit of the prior along any direction. It is a reference
> contour, not a boundary; the prior continues smoothly beyond it.

No probability-mass percentages appear anywhere in the novice-facing interface.

## Files changed

`index.html`, `style.css`, `app.js`, plus the corrected 10B note.

## Reused unchanged

`getCloudGeometry()`, `getReefGeometry()`, `calculatePosteriorParameters()`,
`formatPosteriorParameters()`, `calculateDistanceFromPriorMean()`,
`worldPointToLatent()`, `updateDistanceLine()`, `selectCloud()`,
`announcePosterior()`, the drag threshold, all four ocean metrics.
`updateExplainer()` and `goToStep()` were extended, not replaced. Steps 1 and 2
keep their copy, disclosures, annotations and behaviour.

## Added

- `calculateKLComponents(mu, sigma)` — pure, returns
  `{locationMismatch, spreadMismatch, total, units}` or `null`
- `KL_ZERO_TOLERANCE`, `EXPLAINER.priorStandardDeviation`, `STEP_HEADINGS`
- `STEP_LABELS[3]`, `body.reveal-step-3`
- The Step 3 panel, three component cards, the full-equation disclosure, and the
  two navigation controls

`priorStandardDeviation` is deliberately separate from
`cloudContourStandardDeviations` — two different meanings that both equal 1.

## Acceptance checks

### Automated — 25 of 27

| # | Check | Result |
|---|---|---|
| 1 | Opens at Step 1 | step 1, focus on its heading |
| 2 | Step 1 to Step 2 | works, focus moves |
| 3 | Next opens Step 3, focuses heading | `step-3-heading` |
| 4 | Back returns to Step 2, focuses heading | `step-2-heading` |
| 5 | Selection persists across all three | teal held through 1-2-3-2-1 |
| 6 | Decomposition shown before the equation | concept line and three cards present |
| 7 | Equation collapsed initially | `open` false, toggles on demand |
| 8 | mu(0,0) s1 | 0, 0, 0 |
| 9 | mu(1,0) s1 | 0.5, 0, 0.5 |
| 10 | mu(0,1) s1 | 0.5, 0, 0.5 |
| 11 | mu(1,1) s1 | 1, 0, 1 |
| 12 | mu(0,0) s0.5 | spread 0.636294 |
| 13 | mu(0,0) s0.66 | spread 0.266631 |
| 14 | Centred shipped cloud | location 0.00, total 0.26, above zero |
| 15 | Moving a cloud | location and total changed, spread identical |
| 16 | Same d, eight directions | one distinct location and one distinct total |
| 17 | Full precision, not strings | 1.6703332968 vs 1.6766808879, display matches the former |
| 18 | Grid sweep, 5610 samples | zero negative or non-finite, minimum exactly 0 |
| 19 | Changing selection | name, mu, d, both components and total all updated |
| 20 | Beta independence | Configuration Score moved 58% to 44% while KL held identical |
| 21 | Proportional resize | every value byte-identical at 1440 and 1024 |
| 22 | Revised Step 2 caveat | new wording present, old claim absent, no mass percentages |
| 23 | Forbidden descriptions | none present; direction, non-negativity and zero condition all stated |
| 24 | Annotations never intercept input | all `pointer-events: none`, hit test returns `.cloud-region` |
| 25 | D cannot remove annotations | all five displays unchanged, debug stayed off |
| 26 | Repeated navigation | one `updateMetrics()` produced exactly one update |
| 27 | Existing behaviour | keyboard, metrics, animation, Escape, focus return, non-modal all intact |

### Require genuine browser testing — 2

1. **Real pointer and touch: click-to-select versus drag.** The 4px threshold
   runs on genuine pointer events. Faking them would test the harness, not the
   feature. **Please click a cloud in Step 3 to select it, then drag one and
   confirm the location and total move while the spread stays fixed.**
2. **Screen reader cadence.** The shared live region now announces cloud, mu,
   sigma, location, spread and total on Step 3, still debounced at 350ms. Whether
   that sentence is comfortable to hear repeatedly needs a real screen reader —
   it is the longest announcement in the project so far and is the most likely
   thing to need shortening.

Carried forward and still unconfirmed by hand: Shift plus arrow, and
`prefers-reduced-motion`.

## Accessibility

Non-modal preserved: `aria-modal` null, no focus trap, no `inert`, clouds
tabbable, **exactly one** live region across all three steps. The full equation
uses `<details>`, which conveys expanded state natively.

Four distinct shapes now carry meaning without colour: cross for the encoded
mean and location component, dashed segment for spread, ring with centre dot for
the prior mean, filled square for the total.

## Known limitations

- **All four clouds share sigma 0.66**, so the spread component is constant at
  0.26 whichever cloud is selected. This is deliberate here: it isolates how
  moving a cloud changes only the location component, and it demonstrates why
  distance alone was never the complete mismatch. It does mean a learner cannot
  yet see the spread component respond to anything.
- The console warnings visible during testing are from the deliberate invalid
  spread test, not from application behaviour.

## How to view this stage

Open `index.html`, press **Reveal the Model**, then **Next: The Prior**, then
**Next: KL Divergence**. Drag the cloud onto the reef centre and watch location
fall to zero while the total stays above it. Or run `git checkout stage-10c`.
