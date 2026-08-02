# Stage 01 — Scene and Draggable Clouds

**Git tag:** `stage-01`
**Status:** Complete, verified in browser

## What this stage established

The baseline MVP: a full-viewport ocean scene with four draggable latent clouds and
working overlap detection.

## What was implemented

**Scene**
- `ocean-background.png` used as the sole visual source for the ocean, grid, reef,
  distance rings, and lighting. None of these are redrawn in CSS or JS.
- Background fills the viewport with `object-fit: cover`.

**Four latent clouds**
- One `.latent-cloud` parent per image, each containing a `.cloud-region` circle and
  one fish `<img>`.
- The circle is a real DOM element with `border-radius: 50%` — not baked into the
  background — so its rendered geometry can be measured.
- CSS Grid stacks the circle and fish in the same cell, keeping the fish centered.
- The fish has `pointer-events: none` and `draggable="false"`, so it cannot be
  dragged independently of its cloud.

**Interaction**
- Pointer-event dragging (mouse, touch, and pen) with pointer capture.
- Position is stored as `--x` / `--y` percentages, so clouds hold their relative
  place when the window is resized.
- Drag is clamped so a cloud cannot leave the scene.

**Geometry and overlap**
- `getCloudGeometry(cloudElement)` returns `centerX`, `centerY`, `radius`, and `area`,
  read live from the circle's `getBoundingClientRect()` so values stay correct after
  dragging or responsive resizing.
- Pairwise distance check flags overlapping clouds, highlights them, and reports the
  overlapping pairs in the status panel.

## Designed positions at this stage

| Cloud | `--x` | `--y` |
|---|---|---|
| Round orange fish | 42% | 58% |
| Oval teal fish | 53% | 52% |
| Narrow blue fish | 66% | 38% |
| Purple eel | 24% | 27% |

These are **designed** placements chosen to illustrate the intended similarity
relationships. They are not produced by a trained model.

## Asset change during this stage

`ocean-background.png` was replaced with a 3840x2160 export (was 1920x1080) to fix
blurriness when scaled to fill the viewport. The original 1920x1080 file still exists
outside the repo at `VAE_Tutorial/images/ocean-background.png.png`.

Also renamed for GitHub Pages case-sensitivity: `Assets/` to `assets/`, and
`ocean-background.png.png` to `ocean-background.png`.

## Known open questions carried into later stages

- `object-fit: cover` crops the outer distance rings on narrow or near-square windows.
  Not yet resolved — options are `contain`, or re-exporting with the rings pulled inward.
- `assets/Background-Latent-Ocean.png` is still present as a duplicate of the
  background source file. Kept pending a decision on whether to remove it.
- Fish PNGs are ~1.2 MB each but display at roughly 120 px. Not yet optimized.

## How to view this stage

Open `index.html` in this folder directly in a browser, or from the project root run
`git checkout stage-01` to restore the exact full state including assets.

Note: this folder shares the project's live `assets/` folder. If an image is replaced
in a later stage, this snapshot will show the newer image. Use the git tag when you
need the exact original.
