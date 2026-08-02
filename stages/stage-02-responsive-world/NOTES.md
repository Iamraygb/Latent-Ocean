# Stage 02 — Responsive World and CONFIG

**Git tag:** `stage-02`
**Status:** Complete, verified across five viewport shapes

## What this stage established

A stable coordinate space. Everything downstream — the reef zone, both metrics —
depends on the artwork occupying a predictable, fully visible box. Stage 01 used
`object-fit: cover`, which cropped a different amount on every screen, so there was
no stable place to anchor a reef circle.

## What was implemented

**Aspect-locked world**
- New `#latent-world` container holding the artwork's natural 16:9 ratio (3840x2160).
- Letterboxes instead of cropping, so the reef and every distance ring stay visible.
- Leftover space is filled with `#0066ff`, sampled from the background's four corners
  and two edge midpoints — all six read identically, so the bars are seamless.
- Uses `dvh` units with a `vh` fallback, because mobile browsers change viewport
  height as the address bar shows and hides.

**CONFIG block**
- All adjustable scene values now live in one object at the top of `app.js`:
  world ratio, per-cloud name, asset, x, y, diameter, and boundary colour.
- Clouds are built from CONFIG rather than hand-written in the HTML, so CONFIG is
  the single source of truth and cannot drift out of sync with the markup.
- `index.html` gained a `<noscript>` message, since the clouds are now script-built.
- Reef centre and radius are present as a **placeholder only**, unused until Stage 03.

**Coordinate change**
- Cloud positions are percentages of the **world**, not the viewport. A cloud at
  42%/58% now means the same spot relative to the reef on every screen.
- Cloud diameter is a percentage of world width (11%), replacing the previous
  viewport-based `clamp()`. Geometry scales with the artwork.
- Drag clamping is against the world box, so a circle can never drift into the
  letterbox area.

## Verified, not assumed

Measured live in the browser at five viewport shapes:

| Viewport | World | Letterbox |
|---|---|---|
| 1440x900 (laptop) | 1440x810 | 45px top/bottom |
| 1180x820 (iPad landscape) | 1180x664 | 78px top/bottom |
| 1024x900 | 1024x576 | 162px top/bottom |
| 1600x620 (ultrawide) | 1102x620 | 249px left/right |
| 390x664 (phone portrait) | 390x219 | 222px top/bottom |

- World ratio held at 1.7778 in every case, matching the image exactly.
- Circles measured perfectly round (158.40 x 158.40 at 1440 wide).
- Cloud stayed at 11.00% of world width and 42.0% position across all resizes.
- Drag clamping is pixel-exact: dragging a cloud toward the letterbox pinned its
  edge to `worldLeft` (248.9) and `worldBottom` (620) precisely.
- No horizontal or vertical page scrolling at any size.
- No console errors.

## Two investigations worth recording

**Clouds appearing to move on their own.** Positions were repeatedly found at
fractional percentages instead of CONFIG values. Instrumented every cloud with a
pointer-event log: 127 events with `isTrusted: true` and `pointerType: "mouse"`,
including pointerdowns on two different clouds. These were genuine OS-level mouse
events landing on the preview pane, not synthetic and not a bug. Dragging was
behaving correctly the whole time.

**A doubled, tiled screenshot** appeared once after a resize plus navigation. The DOM
showed exactly one `.ocean-background` element at the correct rect. It was a transient
compositing artifact in the capture, and a re-capture rendered correctly.

## One real bug caught during snapshotting

Because fish paths moved into CONFIG inside `app.js`, rewriting only `index.html`'s
asset paths — which was sufficient for Stage 01 — would have left this snapshot
loading four missing fish. The snapshot's `app.js` needs the same `../../assets/`
rewrite. Verified afterwards: all five images load in the stage folder.

Any future stage snapshot must rewrite asset paths in **both** files.

## Designed positions at this stage

| Cloud | x | y | diameter | Colour |
|---|---|---|---|---|
| Round orange fish | 42% | 58% | 11% | 255, 140, 66 |
| Oval teal fish | 53% | 52% | 11% | 45, 190, 180 |
| Narrow blue fish | 66% | 38% | 11% | 60, 130, 220 |
| Purple eel | 24% | 27% | 11% | 160, 90, 220 |

Designed placements chosen to illustrate the intended similarity relationships. Not
produced by a trained model.

Diameter was reduced from Stage 01's viewport-based sizing to a flat 11% of world
width, which keeps four clouds comfortably separable in the scene and lands at
roughly 130px on an iPad — above the ~44px minimum touch target.

## Known open items carried forward

- Phone portrait is cramped: clouds measure ~43px, right at the touch-target minimum.
  A "rotate your device" hint was discussed but deliberately left out to keep this
  stage narrow.
- `assets/Background-Latent-Ocean.png` is still a duplicate of `ocean-background.png`,
  pending a decision.
- Reef centre and radius in CONFIG are estimates, to be aligned in Stage 03.

## How to view this stage

Open `index.html` in this folder, or run `git checkout stage-02` from the project root
for the exact full state including assets.
