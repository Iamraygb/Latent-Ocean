# Stage 03 — Reef Geometry Zone

**Git tag:** `stage-03`
**Status:** Complete, alignment confirmed against the artwork

## What this stage established

A measurable circle for the reef. The visible reef is part of the background
artwork, so this stage adds a separate, invisible DOM circle aligned to it,
existing only to supply a centre and radius for the Reef Overlap metric in
Stage 04.

## Where the numbers came from

Measured in Adobe Animate on a 1920x1080 stage, **not** by analysing image
pixels. The reef's on-stage bounding box:

```
X 783.55   Y 397.75   W 318.6   H 318.6

centre X = 783.55 + 318.6/2 = 942.85  ->  942.85 / 1920 = 49.11%
centre Y = 397.75 + 318.6/2 = 557.05  ->  557.05 / 1080 = 51.58%
radius   =          318.6/2 = 159.30  ->  159.30 / 1920 =  8.30%
```

The 3840x2160 export is exactly 2x the stage, so the normalized values hold
without conversion.

### Which Animate values to use

Two different readings were available, and the distinction matters:

- **Single click** (bounding box on stage): W/H 318.6, X 783.55, Y 397.75.
  **This is the one used.** It describes where the reef sits on the stage,
  which is what the PNG export rendered.
- **Double click** (inside the isolated group): W/H 344.1, X/Y -172.05.
  Group-local coordinates, taken before the instance transform. The X and Y of
  exactly -W/2 show the shape is centred on its own registration point, so
  these numbers cannot place it on the background.

The size difference, `318.6 / 344.1 = 0.9259`, indicates the group is scaled to
roughly 92.6% on stage.

## What was implemented

- `#reef-zone`, a circular DOM element built from `CONFIG.reef`, sized as a
  percentage of world width so it scales with the responsive world.
- Invisible by default: no fill, no border, and `pointer-events: none`, so it
  can neither cover the artwork nor intercept a drag.
- `getReefGeometry()` returning `centerX`, `centerY`, `radius`, `area` — the
  same shape and coordinate space as `getCloudGeometry()`, so the two can be
  compared directly by the Stage 04 metric.
- A debug overlay: dashed outline plus a centre cross-hair, toggled by pressing
  **D**, by loading with **?debug**, or by setting `CONFIG.debug.showReefZone`.

## Verified, not assumed

- **Alignment confirmed visually** by magnifying the world 3x about the reef
  centre with clouds hidden. The dashed debug circle traces the reef's white
  speckled rim closely the whole way around, and the cross-hair sits at the
  centre of the disc. The Animate-derived values are accurate.
- Reef geometry read back at exactly 49.11% / 51.58% / 8.30% at both 1440x900
  and 1600x620 — two different world sizes and two different letterbox axes.
- Rendered perfectly circular: 239.03 x 239.03 px at 1440 wide.
- `pointer-events` computed as `none`, and a hit test at the reef centre
  returned a `.cloud-region`, not the reef — so dragging is unaffected.
- Invisible by default: computed border `0px`, background `rgba(0,0,0,0)`.
- D key toggles the outline on and off correctly.
- No console errors.

## Correction to an earlier warning

Stage 02's notes and earlier discussion flagged that **100% Reef Overlap might
be geometrically unreachable**. That warning was wrong and is withdrawn.

It assumed the four clouds would have to fit inside the reef without
overlapping each other. They do not — the metric counts each cloud separately
even when clouds overlap. With a reef radius of 8.30% and a cloud radius of
5.5%, a cloud is entirely inside the reef whenever its centre is within
`8.30 - 5.5 = 2.80%` of the reef centre. All four can satisfy that at once by
stacking near the centre, so **100% is reachable**.

That state is also pedagogically useful: four distributions collapsing onto the
prior is what strong regularization looks like.

## Reef values at this stage

| Value | Setting | Units |
|---|---|---|
| centerX | 49.11 | % of world width |
| centerY | 51.58 | % of world height |
| radius | 8.30 | % of world width |

## Known open items carried forward

- Whether Animate's bounding box included the soft speckled rim or any glow
  filter is still unconfirmed in principle, though the magnified check suggests
  any discrepancy is very small. The reef is a designed teaching object with a
  deliberately soft edge, so exactness here is a judgment call.
- `assets/Background-Latent-Ocean.png` remains a duplicate of
  `ocean-background.png`, pending a decision.
- Phone portrait remains cramped; the rotate hint is still deliberately absent.

## How to view this stage

Open `index.html` in this folder, add `?debug` to the URL or press **D** to see
the reef outline, or run `git checkout stage-03` from the project root.
