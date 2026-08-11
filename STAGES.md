# Latent Ocean — Stage Index

Running record of what was implemented at each stage of the prototype.

Latent Ocean is a **designed demonstration** of a simplified two-dimensional latent
space. Nothing in it is produced by a trained VAE. Fish positions, cloud sizes, and
any similarity values are authored by hand to illustrate the concepts.

## Stages

| Stage | Name | Git tag | Folder | Status |
|---|---|---|---|---|
| 01 | Scene and draggable clouds | `stage-01` | [stages/stage-01-scene-and-clouds](stages/stage-01-scene-and-clouds/) | Complete |
| 02 | Responsive world and CONFIG | `stage-02` | [stages/stage-02-responsive-world](stages/stage-02-responsive-world/) | Complete |
| 03 | Reef geometry zone | `stage-03` | [stages/stage-03-reef-zone](stages/stage-03-reef-zone/) | Complete |
| 04 | Reef Overlap metric and HUD | `stage-04` | [stages/stage-04-reef-overlap](stages/stage-04-reef-overlap/) | Complete |
| 05 | Neighbour Compatibility and HUD | `stage-05` | [stages/stage-05-neighbour-compatibility](stages/stage-05-neighbour-compatibility/) | Complete |
| 06 | Keyboard accessibility | `stage-06` | [stages/stage-06-keyboard-accessibility](stages/stage-06-keyboard-accessibility/) | Complete |
| 07 | Visual polish and motion | `stage-07` | [stages/stage-07-visual-polish](stages/stage-07-visual-polish/) | Complete |
| 08 | Explainer panel repositioned | `stage-08` | [stages/stage-08-explainer-reposition](stages/stage-08-explainer-reposition/) | Complete |
| 09 | Configuration Score and Reef Penalty | `stage-09` | [stages/stage-09-configuration-score](stages/stage-09-configuration-score/) | Complete |
| 10A | Reveal Mode, step 1: encoded distributions | `stage-10a` | [stages/stage-10a-reveal-step1](stages/stage-10a-reveal-step1/) | Complete |
| — | Custom Animate UI graphics | — | — | Deferred |

## How to revisit a stage

**Browse it** — open `index.html` inside that stage's folder in a browser. Quickest
way to compare two stages side by side.

**Restore it exactly** — from the project root:

```bash
git checkout stage-01
```

This restores every file including images as they were at that stage. To return to
the latest work:

```bash
git checkout main
```

**See what changed between two stages:**

```bash
git diff stage-01 stage-02
```

## How stages are recorded

Each completed stage gets:

1. A git commit and a tag (`stage-01`, `stage-02`, ...) — the exact, complete state.
2. A folder under `stages/` holding frozen copies of `index.html`, `style.css`, and
   `app.js`, plus a `NOTES.md` describing what was implemented and why.

Stage folders share the project's live `assets/` folder rather than duplicating ~5.3 MB
of images per stage. The tradeoff: if an image is replaced later, older stage folders
render with the newer image. The git tag always holds the true original.

Because a stage folder sits two levels down, its asset paths are rewritten to
`../../assets/`. From Stage 02 onward this applies to **both** `index.html` and
`app.js`, since fish paths live in the CONFIG object rather than in the markup.

## Project structure

```
latent-ocean/
├── index.html        current working version
├── style.css
├── app.js
├── assets/           shared by all stages
├── STAGES.md         this file
└── stages/
    └── stage-01-scene-and-clouds/
        ├── index.html    (asset paths rewritten to ../../assets/)
        ├── style.css
        ├── app.js
        └── NOTES.md
```

## Constraints held across all stages

- Static site only — semantic HTML, CSS, vanilla JavaScript.
- No React, Canvas, SVG replacement artwork, npm packages, build tools, or backend.
- `ocean-background.png` is the visual source of truth for the ocean, grid, reef,
  distance rings, and lighting. These are never redrawn in code.
- Each cloud's circular region stays a real DOM element with `border-radius: 50%`,
  never baked into the background.
- Must remain deployable to GitHub Pages as-is.

## Vocabulary

One fish is one 2D image example. One translucent circle is that single image's
simplified latent distribution — not a cluster, population, or category containing
other unseen images.

## The two metrics

They are deliberately distinct, and the distinction is the teaching point.

**Reef Overlap** measures *location* — how much of the combined cloud area sits
inside the reef, the central prior region.

**Neighbour Compatibility** measures *shape similarity* — an area-weighted average
of the designed similarity scores for the pairs that currently overlap each other.
It is not a second measurement of how much they overlap. Reef overlap contributes
nothing to it.

**Configuration Score** judges the *whole arrangement*: `100 × R × (1 − βI)`, where
R is Reef Overlap as a decimal, I is normalized incompatibility across all six
pairs, and β is the user-controlled Reef Penalty. Reef Overlap sets the reward
available, incompatible overlap removes part of it, and β decides how much. It is
a **designed educational score, not the loss function of a trained VAE**, and it is
not an average of the other two metrics.

Similarity scores are **designed demonstration values based on body shape**, set by
hand in `CONFIG.similarity`. The page never analyses the images, and no value comes
from a trained model.
