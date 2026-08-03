# Stage 05 — Neighbour Compatibility and Designed Similarity Scores

**Git tag:** `stage-05`
**Status:** Complete, verified against the worked example in the brief

## What this stage established

The second measurement, and the one that carries the actual teaching point:
overlapping is not the same as being compatible.

## The metric

```
Neighbour Compatibility = sum of (pair overlap area x pair similarity score)
                        / sum of pair overlap areas
```

An area-weighted average across all six possible pairs. A pair overlapping more
heavily pulls the result further toward its own score.

**This is not a second measurement of overlap quantity.** Reef Overlap measures
position relative to the reef; Neighbour Compatibility measures the shape
similarity of distributions that overlap each other. The two are kept separate
in the code, in the HUD, and in the wording.

Only cloud-to-cloud overlap contributes. Overlap with the reef contributes
nothing.

Pairs with zero intersection are **excluded entirely**, not counted as zero.
Counting them as zero would drag the average down and misrepresent the pairs
that genuinely overlap.

## Designed similarity scores

Stored in `CONFIG.similarity`, one entry per unordered pair:

| Pair | Score |
|---|---|
| Round orange + oval teal | 0.85 |
| Round orange + narrow blue | 0.55 |
| Oval teal + narrow blue | 0.55 |
| Narrow blue + purple eel | 0.55 |
| Round orange + purple eel | 0.15 |
| Oval teal + purple eel | 0.15 |

**Designed demonstration scores based on body shape.** Authored by hand to
illustrate the relationships. Nothing inspects the PNG files, and nothing comes
from a trained model — JavaScript only retrieves the manually configured numbers
above. Scores reflect body shape, not colour.

Held as decimals from 0 to 1 internally; the HUD shows the equivalent
percentage, so 0.85 displays as 85%.

## The NO OVERLAP state

When no pair overlaps, the panel reads **No overlap**. It does not show zero, an
invented score, or "Not evaluated".

`computeNeighbourCompatibility` returns `null` rather than a number for this
case, because **0 is itself a legitimate reading** — it would mean overlapping
pairs whose scores are all zero. A numeric sentinel could not distinguish the
two situations.

The progressbar drops its `aria-valuenow` entirely in this state rather than
reporting a misleading 0, and exposes `aria-valuetext="No overlap"`.

## Verified, not assumed

**The worked example from the brief, reproduced exactly.** Stubbing the pair
areas to 60 (orange–teal) and 20 (orange–eel):

| Pair | Area | Score | Contribution |
|---|---|---|---|
| Orange–teal | 60 | 0.85 | 51 |
| Orange–eel | 20 | 0.15 | 3 |

Result **67.5%**, displayed as **68%** — matching the brief's figure to the
digit, with the other four pairs excluded.

**Behaviour with real geometry:**

| Case | Expected | Got |
|---|---|---|
| All four far apart | NO OVERLAP | "No overlap", aria-valuenow removed |
| Only orange + teal overlapping | 85% | 85% |
| Only orange + eel overlapping | 15% | 15% |
| Circles exactly tangent | NO OVERLAP | "No overlap" |

Tangency correctly does **not** count. The brief says intersection area must be
greater than zero, and `circleIntersectionArea` returns exactly 0 at tangency.

**Area weighting.** With orange–teal deeply overlapped (13,239 px², score 0.85)
against two slight overlaps at score 0.15 (260 px² and 2,286 px²), the result
was **73.71%** rather than the unweighted mean of 50% — pulled toward the pair
with the larger shared area, as intended.

**Independence from the reef.** Moving the whole overlapping arrangement onto
the reef left compatibility at **73.7092% before and after**, exactly unchanged,
while Reef Overlap moved. The two metrics do not contaminate each other.

**Configuration integrity.** All six unordered pairs resolve, in both key orders,
with exactly six scores present. A missing score would log one console warning
and exclude that pair rather than invent a value.

**Layout.** Two panels sit side by side on desktop and stack cleanly on a 390px
viewport, both fitting without overflow, with no overlap against the world or
the status panel and no page scrolling. No console errors.

## Interface changes

- Second HUD panel added, matching the first.
- The bottom status panel now carries a permanent disclosure: "Designed
  demonstration scores based on body shape", with the explicit note that the
  page does not analyse the images and nothing comes from a trained model.
- `aria-live` moved from the whole status panel onto the overlap line only, so
  the static disclosure is not re-announced by a screen reader on every change.

## Known open items carried forward

- Stage 06 adds keyboard accessibility: focusable clouds, arrow-key movement,
  and a visible focus treatment.
- Stage 07 adds the fish float animation and reduced-motion support. The
  animation must move only the fish image, never the cloud or its region, or it
  would shift the measured centre.
- `assets/Background-Latent-Ocean.png` remains a duplicate, pending a decision.
- Phone portrait remains cramped; the rotate hint is still deliberately absent.

## How to view this stage

Open `index.html` in this folder and drag two clouds together — overlap the
orange and teal fish for 85%, the orange fish and the eel for 15%. Or run
`git checkout stage-05` from the project root.
