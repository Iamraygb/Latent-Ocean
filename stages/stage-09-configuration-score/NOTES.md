# Stage 09 — Configuration Score and Reef Penalty

**Git tag:** `stage-09`
**Status:** Complete. All six acceptance checks pass.

Custom Animate graphics are deliberately **not** applied here; they are Stage 10.

## The third metric

A designed educational score for the whole four-cloud arrangement. It is **not**
the loss function of a trained VAE and is not described as one anywhere in the
interface or the code.

```
pairConflict   = overlapArea x (1 - similarity)
actualConflict = sum of pairConflict over all six pairs
maxConflict    = sum of min(areaA, areaB) x (1 - similarity), all six pairs
I              = clamp(actualConflict / maxConflict, 0, 1)

Configuration Score = clamp(100 x R x (1 - beta x I), 0, 100)
```

`R` is Reef Overlap as a decimal, reused from Metric 1. `beta` is the slider.

Reef Overlap sets the reward available. Incompatible overlap removes part of it.
Beta decides how much is removed.

**The teaching point:** two clouds overlapping is not automatically bad.
Overlapping clouds of *different body shapes* is what costs, which is why
conflict is weighted by `(1 - similarity)` rather than by area alone.

**Why the denominator includes all six pairs**, overlapping or not: it fixes the
scale to the cloud sizes, so `I` cannot drift simply because clouds were moved
apart. Cloud-reef intersection never enters this calculation.

## Files changed

- `index.html` — third HUD panel, Reef Penalty control, Reveal placeholder, and
  the panels regrouped into a left column.
- `style.css` — left column layout, score panel accent, slider and button
  styling, responsive rules for the new controls.
- `app.js` — `CONFIG.reefPenaltyBeta`, the new calculations, and a refactor of
  the pair loop.

## Functions added

- `getPairOverlaps(measured)` — **refactored out** of
  `computeNeighbourCompatibility`. Returns all six pairs with overlap area,
  similarity and both cloud areas.
- `calculatePairConflict(overlapArea, similarity)`
- `calculateNormalizedIncompatibility(pairs)`
- `calculateConfigurationScore(reefOverlapPercent, I, beta)`
- `updateConfigurationScoreHUD(score)`
- `getReefPenaltyBeta()`, `renderReefPenaltyValue()`

`computeNeighbourCompatibility` now consumes the shared breakdown and filters to
`overlapArea > 0`, which reproduces its previous behaviour exactly. The six-pair
comparison exists in one place.

**The refactor was verified non-destructive** by re-running Compatibility's known
values from Stage 05:

| Arrangement | Stage 05 | Now |
|---|---|---|
| All four apart | No overlap | No overlap |
| All four stacked | 47% | 47% |
| Orange + teal only | 85% | 85% |
| Orange + eel only | 15% | 15% |

## Reef Penalty

Native `<input type="range">`, 0 to 1, step 0.01, initial **0.50**. Labelled
REEF PENALTY with a real `β` character rather than an image, so it stays crisp at
any size and remains text. Uses the `input` event, so the score tracks the thumb
live. Has a `<label>`, an `<output>` showing `β = 0.50`, and an `aria-describedby`
explaining its effect.

It is a judging weight only. It never moves a cloud, alters the reef, changes the
other two metrics, or simulates training.

Positioned inside the world below the reef so it tracks the artwork on resize,
sitting **21.1px clear of the reef's lower edge**. Verified that a hit test at the
reef centre still returns a `.cloud-region`, so clouds can be dragged onto the
reef exactly as before.

## Acceptance checks

**1. β = 0 → score equals Reef Overlap.** Tested across three arrangements:
47/47, 50/50, 0/0. All equal.

**2. No pairs overlap.** Compatibility shows NO OVERLAP, `I = 0`, and the score
equals Reef Overlap at every beta.

**3. Dissimilar overlap costs more.** With the *same* overlap area of 15,170 px²:

| Pair | Similarity | Conflict | I |
|---|---|---|---|
| Orange + teal | 0.85 | 2,275 | 0.0361 |
| Orange + eel | 0.15 | 12,894 | 0.2045 |

A 5.67x difference in conflict for identical geometry — exactly the ratio of the
two incompatibilities.

**4. Raising β.** Reef Overlap held at 50% and Compatibility at 15% across
β = 0, 0.25, 0.5, 0.75, 1, while the score fell 50 → 48 → 46 → 45 → 43.

**5. Responsive resize.** With positions locked, from 1440x900 to 1024x700 the
score moved 46.36507 to 46.36479, a drift of 0.0003. Clouds did not move.

**6. Existing interaction.** Keyboard movement still exact, all three metrics
respond, clouds still focusable, the HUD is still click-through, and the slider
is focusable with `tabIndex 0`.

**Boundaries:** `I` reached exactly **1** with all four clouds stacked. At `I = 1,
β = 1` the score was **0%** with Reef Overlap at 100%; at `I = 1, β = 0` it was
**100%**.

## Layout

Three panels down the left, vertically centred. The explainer bar stays where
Stage 08 put it, centred at the top. Reef Penalty sits below the reef; the Reveal
placeholder is bottom-right.

**Responsive.** Below 40rem there is no room for a left column, so the panels move
into the empty band below the world with the slider beneath them, and the Reveal
button drops below the explainer. Verified at 390x664: no collisions and **no
cloud covered at all**. In landscape at 844x390 the left column is kept, and only
the eel is clipped, at 12.7%.

## Reveal the Model

A placeholder button with no behaviour attached, as requested. The brief text said
not to implement it while the asset note asked for it; the placeholder is the
resolution.

## Known open items

- **Stage 10** applies `BAR.png`, `Beta Symbol.png` and `Reef Pressure Bar
  Shape.png`, with CSS fallbacks on small screens where the artwork's aspect ratio
  cannot hold.
- `RevealBar.png` is not yet applied to the Reveal button.
- The asset is named "Reef Pressure" while the control is "Reef Penalty". The
  mismatch is deliberate and confirmed.
- Pressing **D** still toggles the reef debug outline globally.
- `assets/Background-Latent-Ocean.png` is still a duplicate.
- Fish PNGs are still roughly 1.2 MB each.

## How to view this stage

Open `index.html` in this folder and drag the orange fish onto the eel, then move
the Reef Penalty slider. Or run `git checkout stage-09` from the project root.
