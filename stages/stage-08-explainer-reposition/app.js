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

  /* The reef geometry region — the prior, or central "home" area.

     The visible reef is part of the background artwork. This is a separate,
     invisible DOM circle aligned to it, existing only so its centre and radius
     can be measured for the Reef Overlap metric. It never covers or replaces
     the artwork.

     Derived from the reef's transform values in Adobe Animate, on a 1920x1080
     stage — never by analysing image pixels:

         X 783.55, Y 397.75, W 318.6, H 318.6

         centre X = 783.55 + 318.6/2 = 942.85  ->  942.85 / 1920 = 49.11%
         centre Y = 397.75 + 318.6/2 = 557.05  ->  557.05 / 1080 = 51.58%
         radius   =          318.6/2 = 159.30  ->  159.30 / 1920 =  8.30%

     The 3840x2160 export is exactly 2x the stage, so these percentages hold.
     Adjust these three numbers to move or resize the reef zone.

     Note: centerX and radius are percentages of world WIDTH; centerY is a
     percentage of world HEIGHT. */
  reef: {
    centerX: 49.11,
    centerY: 51.58,
    radius: 8.30
  },

  /* Development aids. showReefZone can also be toggled at runtime by pressing
     the D key, or by loading the page with ?debug in the URL. */
  debug: {
    showReefZone: false
  },

  /* Keyboard movement, in percent of world width per key press.
     The vertical step is scaled by the world's aspect ratio so that a press of
     Up or Down moves a cloud the same number of pixels as Left or Right. */
  keyboard: {
    step: 0.5,
    largeStep: 2.5
  },

  /* Decorative drift of the fish images.

     IMPORTANT: this animates the fish image only, never the cloud or its
     circular region. Both metrics are measured from .cloud-region, so
     animating anything above the fish would make the readings jitter
     continuously. Keep it on .cloud-fish.

     Each fish is given a slightly different duration and a negative delay, so
     they drift out of step with one another and are already in motion on load
     rather than starting together.

     Disabled entirely when the visitor prefers reduced motion. */
  motion: {
    floatSeconds: 6,
    floatVarianceSeconds: 0.8,
    staggerSeconds: 1.5
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
  ],

  /* =========================================================================
     DESIGNED SIMILARITY SCORES

     Designed demonstration scores based on body shape.

     These are authored by hand to illustrate the relationships. They are NOT
     produced by a trained model, and nothing here inspects the PNG files.
     JavaScript only looks up the manually configured numbers below.

     The three fish share a general form but differ progressively in body
     shape; the eel is the most visibly different. Scores reflect body shape,
     not colour.

     One entry per unordered pair, so six in total for four images. Order
     within a key does not matter — lookup tries both directions.

     Stored as decimals from 0 to 1. The HUD shows the equivalent percentage.
     ========================================================================= */
  similarity: {
    'round-orange|oval-teal':   0.85,
    'round-orange|narrow-blue': 0.55,
    'oval-teal|narrow-blue':    0.55,
    'narrow-blue|eel-purple':   0.55,
    'round-orange|eel-purple':  0.15,
    'oval-teal|eel-purple':     0.15
  }
};


/* ===========================================================================
   Scene construction
   =========================================================================== */

const world = document.getElementById('latent-world');
const overlapReadout = document.getElementById('overlap-readout');
const reefOverlapValue = document.getElementById('reef-overlap-value');
const reefOverlapBar = document.getElementById('reef-overlap-bar');
const reefOverlapFill = document.getElementById('reef-overlap-fill');
const compatibilityPanel = document.getElementById('compatibility-panel');
const compatibilityValue = document.getElementById('compatibility-value');
const compatibilityBar = document.getElementById('compatibility-bar');
const compatibilityFill = document.getElementById('compatibility-fill');
let reefZone = null;

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
  cloud.dataset.cloudId = cloudConfig.id;

  cloud.style.setProperty('--x', `${cloudConfig.x}%`);
  cloud.style.setProperty('--y', `${cloudConfig.y}%`);
  cloud.style.setProperty('--size', `${cloudConfig.diameter}%`);
  cloud.style.setProperty('--cloud-rgb', cloudConfig.rgb);

  // Keyboard reachable. aria-roledescription replaces the announced word
  // "button" with something that describes what this actually is, since ARIA
  // has no role for a freely repositionable two-dimensional object.
  cloud.tabIndex = 0;
  cloud.setAttribute('role', 'button');
  cloud.setAttribute('aria-roledescription', 'draggable latent cloud');
  cloud.setAttribute('aria-describedby', 'cloud-keyboard-help');

  const region = document.createElement('div');
  region.className = 'cloud-region';

  const fish = document.createElement('img');
  fish.className = 'cloud-fish';
  fish.src = cloudConfig.asset;
  // The cloud itself carries the accessible name, so the image inside would
  // only repeat it.
  fish.alt = '';
  fish.draggable = false;

  cloud.append(region, fish);
  updateCloudLabel(cloud);
  return cloud;
}

/**
 * Keeps a cloud's accessible name in step with where it actually is, so a
 * screen reader announces the current position when the cloud regains focus.
 */
function updateCloudLabel(cloud) {
  const x = parseFloat(cloud.style.getPropertyValue('--x'));
  const y = parseFloat(cloud.style.getPropertyValue('--y'));
  cloud.setAttribute(
    'aria-label',
    `${cloud.dataset.name}. Position ${Math.round(x)} percent across, ${Math.round(y)} percent down.`
  );
}

/**
 * Builds the reef geometry region.
 *
 * Invisible by default and never interactive, so it cannot cover the artwork
 * or intercept a drag. It exists purely as a measurable circle.
 */
function createReefZone() {
  const reef = document.createElement('div');
  reef.id = 'reef-zone';
  reef.setAttribute('aria-hidden', 'true');

  reef.style.setProperty('--x', `${CONFIG.reef.centerX}%`);
  reef.style.setProperty('--y', `${CONFIG.reef.centerY}%`);
  // Radius is a percentage of world width, so the diameter is twice that.
  reef.style.setProperty('--size', `${CONFIG.reef.radius * 2}%`);

  return reef;
}

function buildScene() {
  applyWorldRatio();
  const fragment = document.createDocumentFragment();

  // Reef first, so clouds sit above it in paint order.
  fragment.append(createReefZone());
  CONFIG.clouds.forEach((cloudConfig, index) => {
    const cloud = createCloud(cloudConfig);
    applyFloatTiming(cloud, index);
    fragment.append(cloud);
  });

  world.append(fragment);
}

/**
 * Gives each fish its own drift timing, so the four never move in lockstep.
 *
 * The negative delay starts each fish partway through its cycle, so the scene
 * is already alive on load instead of every fish beginning together.
 *
 * This only ever touches the fish image. The cloud and its circular region are
 * left completely still, because both metrics are measured from the region.
 */
function applyFloatTiming(cloud, index) {
  const { floatSeconds, floatVarianceSeconds, staggerSeconds } = CONFIG.motion;
  const fish = cloud.querySelector('.cloud-fish');
  const duration = floatSeconds + index * floatVarianceSeconds;
  fish.style.setProperty('--float-duration', `${duration}s`);
  fish.style.setProperty('--float-delay', `${-index * staggerSeconds}s`);
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

/**
 * Returns the rendered geometry of the reef zone, in the same shape and the
 * same coordinate space as getCloudGeometry, so the two can be compared
 * directly. Used by the Reef Overlap metric from Stage 04.
 *
 * @returns {{centerX:number, centerY:number, radius:number, area:number}}
 */
function getReefGeometry() {
  const rect = reefZone.getBoundingClientRect();
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

/**
 * Area of the lens where two circles overlap, in square pixels.
 *
 * Three cases:
 *   apart            -> 0
 *   one inside other -> the whole of the smaller circle
 *   partial          -> the sum of the two circular segments
 *
 * Both geometry arguments use the shape returned by getCloudGeometry and
 * getReefGeometry, so clouds and the reef can be passed interchangeably.
 *
 * @returns {number} overlapping area in px^2, never negative
 */
function circleIntersectionArea(a, b) {
  const distance = Math.hypot(a.centerX - b.centerX, a.centerY - b.centerY);
  const r1 = a.radius;
  const r2 = b.radius;

  if (distance >= r1 + r2) return 0;

  if (distance <= Math.abs(r1 - r2)) {
    const smaller = Math.min(r1, r2);
    return Math.PI * smaller * smaller;
  }

  // Distance from each centre to the chord where the circles cross.
  const d1 = (distance * distance + r1 * r1 - r2 * r2) / (2 * distance);
  const d2 = distance - d1;

  // Rounding can push these fractionally outside their valid ranges, which
  // would yield NaN. Clamp rather than let a stray NaN reach the metric.
  const safeAcos = (value) => Math.acos(Math.min(1, Math.max(-1, value)));
  const segment = (radius, toChord) =>
    radius * radius * safeAcos(toChord / radius) -
    toChord * Math.sqrt(Math.max(0, radius * radius - toChord * toChord));

  return segment(r1, d1) + segment(r2, d2);
}


/* ===========================================================================
   METRIC 1 — REEF OVERLAP

   The percentage of the combined four cloud areas that currently lies inside
   the reef.

       Reef Overlap = sum of cloud-reef intersection areas
                    / sum of all four cloud areas
                    x 100

   Each cloud is counted separately, even where two clouds overlap each other.
   Nothing is subtracted from the numerator.

   0%   no cloud area is inside the reef
   100% all four cloud regions lie completely inside the reef

   This measures position relative to the reef, and nothing else. Cloud-to-cloud
   similarity is a separate metric arriving in Stage 05.

   Areas are in rendered pixels, but since the numerator and denominator scale
   together the result is independent of screen size.
   =========================================================================== */

function computeReefOverlap(cloudGeometries, reefGeometry) {
  let intersectionTotal = 0;
  let cloudAreaTotal = 0;

  cloudGeometries.forEach((geometry) => {
    intersectionTotal += circleIntersectionArea(geometry, reefGeometry);
    cloudAreaTotal += geometry.area;
  });

  if (cloudAreaTotal === 0) return 0;
  return (intersectionTotal / cloudAreaTotal) * 100;
}


/* ===========================================================================
   METRIC 2 — NEIGHBOUR COMPATIBILITY

   The shape-similarity quality of the clouds that currently overlap each other.
   This is NOT a second measurement of how much they overlap.

       Neighbour Compatibility = sum of (pair overlap area x pair score)
                               / sum of pair overlap areas

   An area-weighted average: a pair overlapping more heavily pulls the result
   further toward its own score.

   Only cloud-to-cloud overlap counts. Overlap with the reef contributes
   nothing here — that is Reef Overlap's job, and the two are kept separate.

   All six pairs are considered; those with zero intersection are excluded
   entirely rather than counted as zero, which would drag the average down and
   misrepresent the pairs that genuinely overlap.

   Returns null when no pair overlaps, so the interface can say NO OVERLAP.
   Null is used rather than 0 because 0 is itself a legitimate reading.
   =========================================================================== */

/** Looks up a designed score for an unordered pair, trying both key orders. */
function getSimilarityScore(idA, idB) {
  const scores = CONFIG.similarity;
  if (`${idA}|${idB}` in scores) return scores[`${idA}|${idB}`];
  if (`${idB}|${idA}` in scores) return scores[`${idB}|${idA}`];
  return null;
}

const warnedMissingPairs = new Set();

/**
 * @param {Array<{id:string, geo:object}>} measured every cloud, with its id
 * @returns {{percent:number, pairs:Array}|null} null when nothing overlaps
 */
function computeNeighbourCompatibility(measured) {
  let weightedTotal = 0;
  let areaTotal = 0;
  const contributing = [];

  for (let i = 0; i < measured.length; i++) {
    for (let j = i + 1; j < measured.length; j++) {
      const overlapArea = circleIntersectionArea(measured[i].geo, measured[j].geo);
      if (overlapArea <= 0) continue;

      const score = getSimilarityScore(measured[i].id, measured[j].id);
      if (score === null) {
        // A missing score is a configuration error. Warn once rather than
        // inventing a value, which the brief explicitly rules out.
        const key = `${measured[i].id}|${measured[j].id}`;
        if (!warnedMissingPairs.has(key)) {
          warnedMissingPairs.add(key);
          console.warn(`Latent Ocean: no designed similarity score for "${key}". Pair excluded.`);
        }
        continue;
      }

      weightedTotal += overlapArea * score;
      areaTotal += overlapArea;
      contributing.push({ a: measured[i].id, b: measured[j].id, overlapArea, score });
    }
  }

  if (areaTotal === 0) return null;
  return { percent: (weightedTotal / areaTotal) * 100, pairs: contributing };
}


/* ===========================================================================
   Overlap state

   Stage 02 keeps the simple "which clouds touch" highlight from Stage 01.
   The Reef Overlap and Neighbour Compatibility metrics arrive in Stages 04
   and 05.
   =========================================================================== */

let clouds = [];

function renderReefOverlap(percent) {
  const rounded = Math.round(percent);
  reefOverlapValue.textContent = `${rounded}%`;
  reefOverlapFill.style.width = `${Math.min(100, Math.max(0, percent))}%`;
  reefOverlapBar.setAttribute('aria-valuenow', String(rounded));
  reefOverlapBar.setAttribute('aria-valuetext', `${rounded} percent`);
}

/**
 * Renders Neighbour Compatibility.
 * @param {{percent:number}|null} result null means no pair overlaps
 */
function renderNeighbourCompatibility(result) {
  if (result === null) {
    compatibilityValue.textContent = 'No overlap';
    compatibilityPanel.classList.add('is-unevaluated');
    compatibilityFill.style.width = '0%';
    // No value exists, so the progressbar is left indeterminate rather than
    // reporting a misleading zero.
    compatibilityBar.removeAttribute('aria-valuenow');
    compatibilityBar.setAttribute('aria-valuetext', 'No overlap');
    return;
  }

  const rounded = Math.round(result.percent);
  compatibilityValue.textContent = `${rounded}%`;
  compatibilityPanel.classList.remove('is-unevaluated');
  compatibilityFill.style.width = `${Math.min(100, Math.max(0, result.percent))}%`;
  compatibilityBar.setAttribute('aria-valuenow', String(rounded));
  compatibilityBar.setAttribute('aria-valuetext', `${rounded} percent`);
}

function updateMetrics() {
  const measured = clouds.map((cloud) => ({
    cloud,
    id: cloud.dataset.cloudId,
    geo: getCloudGeometry(cloud)
  }));

  // Two separate meanings, computed independently:
  //   Reef Overlap          — position relative to the reef
  //   Neighbour Compatibility — shape similarity of clouds overlapping each other
  renderReefOverlap(computeReefOverlap(measured.map((m) => m.geo), getReefGeometry()));
  renderNeighbourCompatibility(computeNeighbourCompatibility(measured));

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

  // The instruction line above this one already explains how to move a cloud,
  // so this reports state only.
  overlapReadout.textContent = overlappingPairs.length === 0
    ? 'No clouds are currently overlapping.'
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

  updateMetrics();
}

function onPointerUp(event) {
  if (!activeDrag || event.pointerId !== activeDrag.pointerId) return;

  const { cloud, pointerId } = activeDrag;
  cloud.releasePointerCapture(pointerId);
  cloud.classList.remove('dragging');
  cloud.removeEventListener('pointermove', onPointerMove);
  cloud.removeEventListener('pointerup', onPointerUp);
  cloud.removeEventListener('pointercancel', onPointerUp);
  updateCloudLabel(cloud);
  activeDrag = null;
}


/* ===========================================================================
   Keyboard movement

   Arrow keys nudge the focused cloud; holding Shift moves it further. Both
   metrics recalculate on every press, exactly as they do while dragging.
   =========================================================================== */

/**
 * Moves a cloud by a percentage offset, clamped so the whole circle stays
 * inside the world.
 */
function moveCloudBy(cloud, deltaXPercent, deltaYPercent) {
  const worldRect = world.getBoundingClientRect();
  const cloudRect = cloud.getBoundingClientRect();

  // Half the cloud, expressed in the same percentage units as its position.
  const halfWidthPercent = (cloudRect.width / 2 / worldRect.width) * 100;
  const halfHeightPercent = (cloudRect.height / 2 / worldRect.height) * 100;

  const currentX = parseFloat(cloud.style.getPropertyValue('--x'));
  const currentY = parseFloat(cloud.style.getPropertyValue('--y'));

  const nextX = clamp(currentX + deltaXPercent, halfWidthPercent, 100 - halfWidthPercent);
  const nextY = clamp(currentY + deltaYPercent, halfHeightPercent, 100 - halfHeightPercent);

  cloud.style.setProperty('--x', `${nextX}%`);
  cloud.style.setProperty('--y', `${nextY}%`);

  updateCloudLabel(cloud);
  updateMetrics();
}

const ARROW_DIRECTIONS = {
  ArrowLeft:  [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp:    [0, -1],
  ArrowDown:  [0, 1]
};

function onCloudKeyDown(event) {
  const direction = ARROW_DIRECTIONS[event.key];
  if (!direction) return;

  // Stop the page from scrolling while a cloud has focus.
  event.preventDefault();

  const stepPercent = event.shiftKey ? CONFIG.keyboard.largeStep : CONFIG.keyboard.step;

  // A percentage of height covers fewer pixels than the same percentage of
  // width, so scale the vertical step by the aspect ratio. Without this, Up
  // and Down would move noticeably less far than Left and Right.
  const aspect = CONFIG.world.aspectWidth / CONFIG.world.aspectHeight;

  moveCloudBy(
    event.currentTarget,
    direction[0] * stepPercent,
    direction[1] * stepPercent * aspect
  );
}


/* ===========================================================================
   Reef alignment debugging

   The reef zone is invisible in normal use. Toggling it on draws its outline
   so it can be checked against the reef in the artwork, and CONFIG.reef
   adjusted until they agree.
   =========================================================================== */

function setReefDebug(visible) {
  document.body.classList.toggle('debug-reef', visible);
}

function initReefDebug() {
  const requested = CONFIG.debug.showReefZone
    || new URLSearchParams(window.location.search).has('debug');
  setReefDebug(requested);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'd' || event.key === 'D') {
      setReefDebug(!document.body.classList.contains('debug-reef'));
    }
  });
}


/* ===========================================================================
   Start
   =========================================================================== */

function init() {
  buildScene();
  reefZone = document.getElementById('reef-zone');
  clouds = Array.from(document.querySelectorAll('.latent-cloud'));
  clouds.forEach((cloud) => {
    cloud.addEventListener('pointerdown', onPointerDown);
    cloud.addEventListener('keydown', onCloudKeyDown);
  });

  initReefDebug();

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateMetrics, 100);
  });

  updateMetrics();
}

init();
