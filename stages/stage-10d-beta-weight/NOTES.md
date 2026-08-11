# Stage 10D — Reveal Mode, Step 4: Beta Weight

**Git tag:** `stage-10d`
**Status:** Complete. All 30 automated acceptance checks pass. Several checks
remain that only genuine browser input or assistive technology can settle.

Only the weighting concept. No reconstruction, sampling, decoder, complete VAE
loss or complete beta-VAE objective.

## The formula

```
weightedPriorMismatch = beta x D_KL( q_phi(z|x) || p(z) )
```

Beta is a dimensionless, non-negative weight; multiplying nats by it leaves the
result in nats. Beta changes only how much the mismatch **counts**. It never
changes the mismatch itself, mu, sigma, d, either component, the prior, or any
cloud's position or size.

## Canonical sources

**Beta** — `getReefPenaltyBeta()` returns `Number(reefPenaltyInput.value)` from
the existing slider. That input is the single source of truth;
`CONFIG.reefPenaltyBeta` only seeds it once at start-up. Range unchanged at
0 to 1, step 0.01. There is exactly **one** `input[type="range"]` in the
document, verified.

**Raw KL** — `calculateKLComponents(mu, sigma).total`, from Stage 10C, fed by
`calculatePosteriorParameters()`. Step 4 consumes the same object Step 3
displays within a single pass of `updateExplainer()`, so the two can never
disagree: verified that Step 3's `0.27` and Step 4's `0.269` came from one call.

**Not calculated from** Configuration Score, Reef Overlap, Neighbour
Compatibility, displayed strings, DOM text, slider pixels, CSS variables or any
geometry. Demonstrated: full precision gave **6.2262830456** where multiplying
the displayed operands gave **6.226**, and the on-screen value matches the
former.

## The mirrored Beta readout

An `<output id="beta-mirror">` reading from `getReefPenaltyBeta()` through the
shared update path. It holds no state, is not a form control, and is not
focusable — verified `tagName` `OUTPUT`, `tabIndex` -1, and it matches no
focusable selector. A visible line ties it to the real control: "Set with the
**Beta Weight β** control below the reef."

## Resolutions applied

- **(a)** Slider range and Configuration Score behaviour untouched. Learner-facing
  cases now cover only reachable values: `β = 0`, `0 < β < 1`, `β = 1`, with the
  note that Beta can exceed 1 in other configurations but this control ranges
  0 to 1. The unreachable `1.50` example is gone. `β = 2` survives **only** as a
  function-level test.
- **(b)** The real Beta control is un-hidden on narrow screens **in Step 4 only**;
  Steps 1 to 3 keep their existing narrow-screen behaviour, verified separately.
- **(c)** Mirrored readout implemented as described.
- **(d)** Visible label is now **Beta Weight β**; the hidden description covers
  both the Step 4 role and the existing Configuration Score effect without
  implying either is a VAE loss.
- **(e)** Three decimals throughout Step 4, with the caveat that values are
  rounded independently and calculations use full precision. The slider's own
  `β = 0.50` readout keeps its two-decimal format outside Step 4.
- **(f)** Announcement runs through the existing listener, the existing 350ms
  debounce and the single shared live region. `announcePosterior()` is now
  context-aware and produces the Step 4 wording. No second live region, no second
  listener, no immediate-plus-debounced duplication.

## Files changed

`index.html`, `style.css`, `app.js`.

## Reused unchanged

`getReefPenaltyBeta()`, `renderReefPenaltyValue()`, the slider's single `input`
listener, `calculateKLComponents()`, `calculatePosteriorParameters()`,
`calculateDistanceFromPriorMean()`, `getCloudGeometry()`, `getReefGeometry()`,
`updateDistanceLine()`, `selectCloud()`, the drag threshold, all four metrics.
`updateExplainer()`, `goToStep()` and `announcePosterior()` were extended.

## Added

`calculateWeightedPriorMismatch(beta, rawKL)` — pure, returns
`{beta, rawPriorMismatch, weightedPriorMismatch, units}` or `null`. Plus
`STEP_LABELS[4]`, `STEP_HEADINGS[4]`, `body.reveal-step-4`, the Step 4 panel,
the mirrored readout and two navigation controls.

## Acceptance checks — all 30 automated and passing

| # | Result |
|---|---|
| 1-2 | Opens at Step 1; 1 to 2 to 3 still works |
| 3-4 | Step 4 and back focus their own headings |
| 5 | Blue fish held across all four steps |
| 6 | Only `.beta-result` carries accent: 2px border and glow against 1px and none; zero progressbars in Step 4 |
| 7 | Exactly one range input; mirror is a non-focusable `<output>` |
| 8 | Step 3 `0.27` and Step 4 `0.269` from the same call |
| 9-13 | 0, 0.4, 0.8, 1.6, and zero for every Beta against zero KL |
| 14 | Three doubling pairs, ratio exactly 2 |
| 15 | mu, sigma, d, both components and raw KL all identical across a Beta change |
| 16-17 | Cloud box and reef geometry byte-identical across a Beta change |
| 18 | Moving at fixed Beta changed raw and weighted together, Beta and spread held |
| 19 | weighted / raw equalled Beta at five values |
| 20 | Selection change updated raw and weighted |
| 21 | 6.2262830456 full precision vs 6.226 from strings; display matches full |
| 22 | Negative, NaN, Infinite Beta and negative or NaN KL all return `null`; the documented 1e-12 tolerance still accepted |
| 23 | 909 grid samples, none negative or non-finite |
| 24 | One `updateMetrics()` produced exactly one update after ten navigations |
| 25 | Every value identical across a 1440 to 1024 resize |
| 26 | Configuration Score moved 70% to 44% while the weighted term responded independently |
| 27 | Step 3's raw KL unchanged by Beta |
| 28-29 | Required statements present; percentage, probability, accuracy and complete-objective framings absent |
| 30 | Keyboard, Beta focus, D safeguard, inert annotations, metrics, animation, Escape, focus return, non-modal, one live region all intact |

## Genuine-browser checks still outstanding

**None of the following were automated, and none are claimed as passing.**

1. **Real pointer use on the Beta slider** — dragging the thumb, and confirming
   the announcement fires once after settling rather than per event.
2. **Real click-versus-drag cloud selection** in Step 4.
3. **Touch interaction**, including the narrow-screen Step 4 layout.
4. **Keyboard-only navigation** end to end, including arrow keys on the slider.
5. **Visible focus inspection** on the two new navigation controls.
6. **Narrow-screen visual inspection.** The browser pane stopped compositing
   during this session, so **no screenshot of Step 4 was captured at any size**.
   Layout was verified numerically only.
7. **Reduced-motion inspection.**
8. **Screen-reader cadence** and how the equation reads aloud.

## Known limitations

- **On a 390px-wide screen the panel overlaps the selected cloud**, between
  roughly 30% and 46% depending on where the cloud sits. The world is centred and
  the panel is bottom-anchored, so no fixed height keeps a freely-draggable cloud
  always clear. The panel is interactive, so it does block dragging where it
  overlaps; the cloud can be moved higher to free it. Shrinking the panel further
  would have hurt readability more than it helped.
- **Beta cannot exceed 1 in the interface**, so the `β > 1` case is explanatory
  only. The pure function accepts and is tested above 1.
- **All four clouds still share sigma 0.66**, so the spread component stays
  constant at 0.26 whichever cloud is selected.
- The internal identifiers remain `reef-penalty*` while the visible label is now
  **Beta Weight β**. Renaming them would have churned Stage 09 code for no
  behavioural gain.

## How to view this stage

Open `index.html`, press **Reveal the Model**, then walk forward to **Next: Beta
Weight**. Move the Beta control and watch prior mismatch hold still while the
weighted contribution changes. Or run `git checkout stage-10d`.
