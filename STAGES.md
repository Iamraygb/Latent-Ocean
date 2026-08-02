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
| 04 | Reef Overlap metric and HUD | — | — | Planned |
| 05 | Neighbour Compatibility and HUD | — | — | Planned |
| 06 | Keyboard accessibility | — | — | Planned |
| 07 | Visual polish and motion | — | — | Planned |

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
