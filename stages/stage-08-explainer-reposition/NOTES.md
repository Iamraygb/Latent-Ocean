# Stage 08 — Explainer Panel Repositioned

**Git tag:** `stage-08`
**Status:** Complete. A UI change only; no logic or measurement touched.

## What changed

The explainer moved from the bottom-left corner to sit directly beneath the two
measurement panels, as a centred horizontal bar matching their combined width.
This follows the supplied wireframe.

Two follow-up corrections were then made on request, and are described in their
own sections below: the always-visible disclosure paragraph was removed, and a
width bug that made the three panels progressively wider was fixed.

**Structure.** A new `#hud-stack` wraps the measurement row and the explainer in
a single fixed, centred column. Because the stack is sized to the panel row, the
explainer spans exactly the same width rather than floating at its own size.

**Layout inside the explainer.** "LATENT OCEAN" and the hint now share one row,
with the overlap readout pushed to the trailing edge. The disclosure sits
beneath, separated by a hairline rule.

**Styling** was brought into line with the measurement panels: same navy fill,
same border, same radius, same uppercase letter-spaced label treatment.

Nothing about dragging, keyboard movement, the metrics, or the animation was
altered.

## The regression this introduced, and the fix

Stacking three full-width panels vertically made the top area far taller on
small screens. Measured at 390x664:

| | Before fix | After fix |
|---|---|---|
| Stack height | 284.6 px | 201.7 px |
| Share of viewport height | 42.9% | 30.4% |
| Purple eel covered | **90.7%** | **0%** |
| Narrow blue covered | 15.6% | 0% |

The stack now fits entirely within the letterbox band above the world, so it
covers no clouds at all in portrait.

Achieved by tightening padding, font sizes, bar height and gaps below 40rem,
and letting the panels fill the available width instead of holding a 19rem
minimum.

## The harder case: a phone in landscape

At 844x390 the world fills the full height, so there is no letterbox to sit in
and the stack unavoidably overlays ocean.

| | Before fix | After fix |
|---|---|---|
| Stack height | 142.9 px | 80.2 px |
| Purple eel covered | **100%** | **24.4%** |
| Narrow blue covered | 61.9% | 0% |

Only the eel's top edge is now clipped; the fish itself stays visible and
grabbable.

A separate `max-height: 30rem` block handles this, collapsing padding further
and **hiding the keyboard hint line**. That line is the least useful on a touch
device, and screen readers still receive the fuller description through
`#cloud-keyboard-help`, which is unchanged. Both readings and the designed-scores
disclosure remain visible.

Worth noting throughout: the stack carries `pointer-events: none`, so even where
it overlays a cloud the cloud stays draggable. The problem was visibility, never
interaction.

## Verified

| Check | Result |
|---|---|
| Explainer width matches the panel row | identical, 241.9 to 1198.1 |
| Explainer sits below the panels | yes |
| Stack horizontally centred | yes |
| Clouds covered, 390x664 portrait | none |
| Clouds covered, 844x390 landscape | eel top edge only, 24.4% |
| Reef Overlap, apart then stacked | 0% then 100% |
| Compatibility, apart then stacked | No overlap then 47% |
| Keyboard movement | exact |
| Fish animation running | yes |
| Cloud region still unanimated | yes |
| `aria-live` on the readout | polite, intact |
| Horizontal page scrolling | none |
| Console errors | none |

## Follow-up 1 — the disclosure paragraph was removed

The "Designed demonstration scores based on body shape…" paragraph no longer
appears in the interface. It was judged unnecessary as a permanent fixture.

**Where that statement now lives.** The brief requires that "the interface **or
supporting explanation**" identify the scores as designed demonstration values.
The interface no longer carries it, so the supporting explanation does:

- `README.md` opens with a section headed "Important: this is a designed
  demonstration", stating that nothing is produced by a trained model.
- `CONFIG.similarity` in `app.js` is headed "Designed demonstration scores based
  on body shape."

The requirement is therefore still met, but it now rests entirely on the README.
If the prototype is ever shown standing alone, without the repository alongside
it, that statement should be reinstated somewhere in the interface.

Removing the paragraph also shortened the panel to a single 37px line, which
made the earlier landscape compromise unnecessary: **the keyboard hint is now
visible at every screen size**, and the rule that hid it has been deleted.

## Follow-up 2 — the panels were not the same width

The explainer extended past both ends of the measurement row, and on narrow
screens each of the three panels was progressively wider than the one above it.

Cause: `#hud-stack` used `width: max-content`, and on narrow screens the panels
carried `width: 100%`. A percentage width inside a `max-content` container is
circular, so each panel resolved its own width independently.

Fix: below 40rem the stack takes a definite `width: calc(100vw - 1rem)`, and
panels use `flex: 1 1 100%`. At all widths `.hud-panel` uses `flex: 1 1 0`, so
the two measurement panels share the row equally and present one clean outer
edge for the explainer to align to.

Measured afterwards:

| | Left edge | Right edge |
|---|---|---|
| Reef Overlap, 1440px | 347.17 | 713.99 |
| Neighbour Compatibility, 1440px | 725.99 | 1092.83 |
| Explainer, 1440px | **347.17** | **1092.83** |

Flush with the left edge of Reef Overlap and the right edge of Neighbour
Compatibility, extending past neither. At 390px all three panels measured
identically at 8 to 382.

The shorter panel improved the landscape case again: the eel now sits **9.2%**
covered, down from 24.4%, and from 100% before any of this work.

## Note on scope

The supplied wireframe also showed a Reef Pressure slider, different fish
imagery, and additional coloured circles. None of that was implemented; this
stage moved the explainer and nothing else.

## Known open items carried forward

- Pressing **D** still toggles the reef debug outline globally.
- `assets/Background-Latent-Ocean.png` is still a duplicate, roughly 271 KB.
- Fish PNGs are roughly 1.2 MB each while displaying at around 130 px.
- Reduced motion and Shift plus arrow still want one manual confirmation.

## How to view this stage

Open `index.html` in this folder, or run `git checkout stage-08` from the
project root. Resize the window narrow, then short and wide, to see the two
responsive treatments.
