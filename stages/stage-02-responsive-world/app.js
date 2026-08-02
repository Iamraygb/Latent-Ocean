/* ===========================================================================
   LATENT OCEAN

   A designed demonstration of a simplified two-dimensional latent space.

   Nothing here is produced by a trained VAE. Every position, size and (from
   Stage 05) similarity score is authored by hand to illustrate the concepts.
   The circles are simplified interactive geometry, not exact learned
   probability distributions.

   One fish is one 2D image example. Its circle is that single image's
   simplified latent distribution — not a cluster, a population of data points,
   or a category containing other unseen images.
   =========================================================================== */


/* ===========================================================================
   CONFIG — the adjustable scene values

   Everything meant to be tuned lives here. Coordinates and sizes are
   percentages of the world box, so they mean the same thing on every screen.
   =========================================================================== */

const CONFIG = {

  /* Natural pixel dimensions of assets/ocean-background.png. The world box
     takes this ratio and letterboxes rather than cropping. */
  world: {
    aspectWidth: 3840,
    aspectHeight: 2160
  },

  /* PLACEHOLDER — not used until Stage 03.
     Centre and radius of the reef geometry region, as percentages of the
     world. These will be aligned by eye (or from Animate's transform values)
     to the reef drawn in the background art. The reef boundary is never
     derived by analysing image pixels.
     Note: radius is a percentage of world WIDTH. */
  reef: {
    centerX: 50,
    centerY: 50,
    radius: 9
  },

  /* The four image examples.
       x, y       centre position, as a percentage of the world box
       diameter   circle diameter, as a percentage of world WIDTH
       rgb        boundary and fill colour, as an "r, g, b" triplet */
  clouds: [
    {
      id: 'round-orange',
      name: 'Round Orange Fish',
      asset: '../../assets/fish-round-orange.png',
      alt: 'Round orange fish',
      x: 42,
      y: 58,
      diameter: 11,
      rgb: '255, 140, 66'
    },
    {
      id: 'oval-teal',
      name: 'Oval Teal Fish',
      asset: '../../assets/fish-oval-teal.png',
      alt: 'Oval teal fish',
      x: 53,
      y: 52,
      diameter: 11,
      rgb: '45, 190, 180'
    },
    {
      id: 'narrow-blue',
      name: 'Narrow Blue Fish',
      asset: '../../assets/fish-narrow-blue.png',
      alt: 'Narrow blue fish',
      x: 66,
      y: 38,
      diameter: 11,
      rgb: '60, 130, 220'
    },
    {
      id: 'eel-purple',
      name: 'Purple Eel',
      asset: '../../assets/fish-eel-purple.png',
      alt: 'Long purple eel',
      x: 24,
      y: 27,
      diameter: 11,
      rgb: '160, 90, 220'
    }
  ]

  /* Pairwise similarity scores arrive in Stage 05, alongside the
     Neighbour Compatibility metric. */
};


/* ===========================================================================
   Scene construction
   =========================================================================== */

const world = document.getElementById('latent-world');
const overlapReadout = document.getElementById('overlap-readout');

/** Applies the world's aspect ratio from CONFIG so it is defined in one place. */
function applyWorldRatio() {
  const root = document.documentElement;
  root.style.setProperty('--world-w', CONFIG.world.aspectWidth);
  root.style.setProperty('--world-h', CONFIG.world.aspectHeight);
}

/** Builds one .latent-cloud: a parent holding the circle and its fish image. */
function createCloud(cloudConfig) {
  const cloud = document.createElement('div');
  cloud.className = 'latent-cloud';
  cloud.id = `cloud-${cloudConfig.id}`;
  cloud.dataset.name = cloudConfig.name;

  cloud.style.setProperty('--x', `${cloudConfig.x}%`);
  cloud.style.setProperty('--y', `${cloudConfig.y}%`);
  cloud.style.setProperty('--size', `${cloudConfig.diameter}%`);
  cloud.style.setProperty('--cloud-rgb', cloudConfig.rgb);

  const region = document.createElement('div');
  region.className = 'cloud-region';

  const fish = document.createElement('img');
  fish.className = 'cloud-fish';
  fish.src = cloudConfig.asset;
  fish.alt = cloudConfig.alt;
  fish.draggable = false;

  cloud.append(region, fish);
  return cloud;
}

function buildScene() {
  applyWorldRatio();
  const fragment = document.createDocumentFragment();
  CONFIG.clouds.forEach((cloudConfig) => fragment.append(createCloud(cloudConfig)));
  world.append(fragment);
}


/* ===========================================================================
   Geometry

   Measured from the circle's live rendered box, so values stay correct after
   dragging and after the world is resized.
   =========================================================================== */

/**
 * Returns the rendered geometry of a cloud's circular region.
 * @param {HTMLElement} cloudElement a .latent-cloud
 * @returns {{centerX:number, centerY:number, radius:number, area:number}}
 */
function getCloudGeometry(cloudElement) {
  const region = cloudElement.querySelector('.cloud-region');
  const rect = region.getBoundingClientRect();
  const radius = rect.width / 2;
  return {
    centerX: rect.left + radius,
    centerY: rect.top + radius,
    radius,
    area: Math.PI * radius * radius
  };
}

function circlesOverlap(a, b) {
  const dx = a.centerX - b.centerX;
  const dy = a.centerY - b.centerY;
  return Math.sqrt(dx * dx + dy * dy) < a.radius + b.radius;
}


/* ===========================================================================
   Overlap state

   Stage 02 keeps the simple "which clouds touch" highlight from Stage 01.
   The Reef Overlap and Neighbour Compatibility metrics arrive in Stages 04
   and 05.
   =========================================================================== */

let clouds = [];

function updateOverlapState() {
  const measured = clouds.map((cloud) => ({ cloud, geo: getCloudGeometry(cloud) }));
  clouds.forEach((cloud) => cloud.classList.remove('is-overlapping'));

  const overlappingPairs = [];
  for (let i = 0; i < measured.length; i++) {
    for (let j = i + 1; j < measured.length; j++) {
      if (circlesOverlap(measured[i].geo, measured[j].geo)) {
        measured[i].cloud.classList.add('is-overlapping');
        measured[j].cloud.classList.add('is-overlapping');
        overlappingPairs.push([measured[i].cloud.dataset.name, measured[j].cloud.dataset.name]);
      }
    }
  }

  overlapReadout.textContent = overlappingPairs.length === 0
    ? 'Drag the translucent clouds to explore how their latent distributions overlap. No clouds are currently overlapping.'
    : overlappingPairs.map(([a, b]) => `${a} overlaps ${b}`).join(' · ');
}


/* ===========================================================================
   Dragging

   Pointer Events so mouse, touch and pen behave identically. Positions are
   stored as percentages of the world, so a cloud holds its designed placement
   when the window is resized.
   =========================================================================== */

let activeDrag = null;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function onPointerDown(event) {
  const cloud = event.currentTarget;
  cloud.setPointerCapture(event.pointerId);

  const cloudRect = cloud.getBoundingClientRect();
  activeDrag = {
    cloud,
    pointerId: event.pointerId,
    offsetX: event.clientX - (cloudRect.left + cloudRect.width / 2),
    offsetY: event.clientY - (cloudRect.top + cloudRect.height / 2)
  };

  cloud.classList.add('dragging');
  cloud.addEventListener('pointermove', onPointerMove);
  cloud.addEventListener('pointerup', onPointerUp);
  cloud.addEventListener('pointercancel', onPointerUp);
}

function onPointerMove(event) {
  if (!activeDrag || event.pointerId !== activeDrag.pointerId) return;

  const { cloud, offsetX, offsetY } = activeDrag;
  const worldRect = world.getBoundingClientRect();
  const cloudRect = cloud.getBoundingClientRect();
  const radiusX = cloudRect.width / 2;
  const radiusY = cloudRect.height / 2;

  // Clamped to the world box, not the viewport, so a whole circle always
  // stays inside the artwork rather than drifting into the letterbox area.
  const targetX = clamp(
    event.clientX - offsetX - worldRect.left,
    radiusX,
    worldRect.width - radiusX
  );
  const targetY = clamp(
    event.clientY - offsetY - worldRect.top,
    radiusY,
    worldRect.height - radiusY
  );

  cloud.style.setProperty('--x', `${(targetX / worldRect.width) * 100}%`);
  cloud.style.setProperty('--y', `${(targetY / worldRect.height) * 100}%`);

  updateOverlapState();
}

function onPointerUp(event) {
  if (!activeDrag || event.pointerId !== activeDrag.pointerId) return;

  const { cloud, pointerId } = activeDrag;
  cloud.releasePointerCapture(pointerId);
  cloud.classList.remove('dragging');
  cloud.removeEventListener('pointermove', onPointerMove);
  cloud.removeEventListener('pointerup', onPointerUp);
  cloud.removeEventListener('pointercancel', onPointerUp);
  activeDrag = null;
}


/* ===========================================================================
   Start
   =========================================================================== */

function init() {
  buildScene();
  clouds = Array.from(document.querySelectorAll('.latent-cloud'));
  clouds.forEach((cloud) => cloud.addEventListener('pointerdown', onPointerDown));

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateOverlapState, 100);
  });

  updateOverlapState();
}

init();
