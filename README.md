# Latent Ocean

An interactive, educational explanation of a simplified **two-dimensional latent space**
in a Variational Autoencoder (VAE), built for people who may not have a machine learning
background.

It uses an ocean and reef metaphor to introduce image similarity, latent distributions,
overlap, and regularization before any technical vocabulary is introduced.

## Important: this is a designed demonstration

**Nothing here is produced by a trained model.** The fish positions, the sizes of the
circular regions, and any similarity values are authored by hand to illustrate the
concepts. They are not learned parameters, and the circles are simplified interactive
geometry rather than exact probability distributions.

A future version trained on a real dataset is out of scope for this prototype.

## How to read the scene

| Ocean element | What it represents |
|---|---|
| The ocean | A simplified two-dimensional latent space |
| One fish | One 2D image example |
| Circle around a fish | That single image's simplified latent distribution |
| Circle position | A designed latent position |
| Distance between circles | Relative image dissimilarity |
| Circle overlap | Distributions occupying some of the same latent area |
| Central reef | The prior, or central "home" region |
| Rings around the reef | Visual guides for distance from the prior |

One fish is **one individual image**, and its circle is that one image's distribution.
A circle is not a cluster, a population of data points, a summary of a larger dataset,
or a category containing other unseen images.

## The four images

Four separate image examples, related by **body shape rather than color**:

- Round orange fish
- Oval teal fish
- Narrow blue fish
- Long purple eel

The first three share a general fish form but differ progressively in body shape. The
eel is the most visibly different, and is positioned furthest away.

## Running it

It's a static site with no build step and no dependencies. Open `index.html` in any
modern browser, or serve the folder with any static file server.

Drag any translucent circle to move it. The circle and its fish move together as one
object, and overlapping circles are highlighted.

## Project structure

```
latent-ocean/
├── index.html        current working version
├── style.css
├── app.js
├── assets/           background and fish images (shared by all stages)
├── STAGES.md         index of what each stage implemented
└── stages/           frozen, browsable snapshot of each stage
```

See [STAGES.md](STAGES.md) for the stage-by-stage history and how to revisit or compare
any earlier version.

## Technical constraints

Deliberately kept to plain semantic HTML, CSS, and vanilla JavaScript — no frameworks,
Canvas, SVG replacement artwork, npm packages, build tools, or backend, so it stays
easy to read and deployable as a static site.

`assets/ocean-background.png` is the visual source of truth for the ocean, grid, reef,
distance rings, and lighting; these are never redrawn in code. Each cloud's circular
region is a real DOM element with `border-radius: 50%`, never baked into the background,
so its rendered center and radius can be measured for overlap calculations.

## Credits

Ocean and fish artwork created in Adobe Animate by the project author.
