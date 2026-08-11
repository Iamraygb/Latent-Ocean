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
  },

  /* Starting position of the Reef Penalty slider, from 0 to 1. The slider is
     the live source of truth once the page is running; this is only the
     initial value. */
  reefPenaltyBeta: 0.5
};


/* ===========================================================================
   EXPLAINER CONFIG — the latent coordinate convention

   Reveal Mode reads the scene as a simplified two-dimensional latent space.

   The reef centre is treated as the latent origin (0, 0) and one reef radius
   as one latent unit. That is a coordinate convention for this simulator only;
   at this step the reef is NOT being described as the prior distribution.

   Each cloud is read as the approximate posterior for one representative
   input image:

       q_phi(z|x) = N(mu_phi(x), sigma_phi^2(x) I)

   The complete cloud is the distribution. Its centre is the mean, its radius
   is one standard deviation, and the identity matrix means equal spread in
   both displayed dimensions. The circle is a one-standard-deviation contour,
   not a hard edge — the Gaussian continues past it.
   =========================================================================== */

const EXPLAINER = {
  latentDimensions: 2,
  priorMean: { x: 0, y: 0 },
  latentUnitsPerReefRadius: 1,
  cloudContourStandardDeviations: 1,
  posteriorType: 'isotropic-gaussian'
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
const configurationValue = document.getElementById('configuration-value');
const configurationBar = document.getElementById('configuration-bar');
const configurationFill = document.getElementById('configuration-fill');
const reefPenaltyInput = document.getElementById('reef-penalty-input');
const reefPenaltyValue = document.getElementById('reef-penalty-value');
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


/* ===========================================================================
   Latent coordinates

   Pure functions. They take rendered pixel geometry but only ever divide one
   pixel measurement by another, so every result is a ratio and is unaffected
   by screen size. Percentages are deliberately avoided here: the percentage
   system is anisotropic (x is a share of width, y of height), so "one reef
   radius up" would not equal "one reef radius right".
   =========================================================================== */

/** Pixels of world that make up one latent unit. */
function worldUnitsPerLatentUnit(reefGeometry) {
  return reefGeometry.radius / EXPLAINER.latentUnitsPerReefRadius;
}

/**
 * Converts a point in world pixels to latent coordinates.
 * Screen y grows downward, so it is inverted: moving a cloud up must raise mu2.
 */
function worldPointToLatent(pointX, pointY, reefGeometry) {
  const unit = worldUnitsPerLatentUnit(reefGeometry);
  return {
    x: (pointX - reefGeometry.centerX) / unit,
    y: (reefGeometry.centerY - pointY) / unit
  };
}

/**
 * The posterior parameters this cloud currently stands for.
 *
 * sigma is one shared standard deviation, because the teaching model is
 * isotropic. It changes only if the cloud is resized, never when it is moved.
 *
 * @returns {{mu:{x:number,y:number}, sigma:number}} full precision
 */
function calculatePosteriorParameters(cloudGeometry, reefGeometry) {
  const unit = worldUnitsPerLatentUnit(reefGeometry);
  return {
    mu: worldPointToLatent(cloudGeometry.centerX, cloudGeometry.centerY, reefGeometry),
    sigma: cloudGeometry.radius / (unit * EXPLAINER.cloudContourStandardDeviations)
  };
}

/** Rounds for display only. Callers keep the full-precision values. */
function formatPosteriorParameters(parameters) {
  // Avoids showing "-0.00" when a value rounds to zero from below.
  const fixed = (value) => {
    const text = value.toFixed(2);
    return text === '-0.00' ? '0.00' : text;
  };
  return {
    muX: fixed(parameters.mu.x),
    muY: fixed(parameters.mu.y),
    mu: `(${fixed(parameters.mu.x)}, ${fixed(parameters.mu.y)})`,
    sigma: fixed(parameters.sigma)
  };
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
 * Every unordered cloud pair, measured once.
 *
 * Shared by Neighbour Compatibility and the Configuration Score so the six-pair
 * comparison is not duplicated. Pairs with no overlap are still returned, with
 * an overlapArea of 0, because the Configuration Score's denominator needs all
 * six regardless of whether they currently touch. Compatibility filters them
 * out itself.
 *
 * Pairs with no configured score are omitted entirely and warned about once,
 * rather than being given an invented value.
 *
 * @param {Array<{id:string, geo:object}>} measured every cloud, with its id
 * @returns {Array<{a:string, b:string, overlapArea:number, similarity:number,
 *                  areaA:number, areaB:number}>}
 */
function getPairOverlaps(measured) {
  const pairs = [];

  for (let i = 0; i < measured.length; i++) {
    for (let j = i + 1; j < measured.length; j++) {
      const similarity = getSimilarityScore(measured[i].id, measured[j].id);

      if (similarity === null) {
        const key = `${measured[i].id}|${measured[j].id}`;
        if (!warnedMissingPairs.has(key)) {
          warnedMissingPairs.add(key);
          console.warn(`Latent Ocean: no designed similarity score for "${key}". Pair excluded.`);
        }
        continue;
      }

      pairs.push({
        a: measured[i].id,
        b: measured[j].id,
        overlapArea: circleIntersectionArea(measured[i].geo, measured[j].geo),
        similarity,
        areaA: measured[i].geo.area,
        areaB: measured[j].geo.area
      });
    }
  }

  return pairs;
}

/**
 * @param {Array} pairs from getPairOverlaps
 * @returns {{percent:number, pairs:Array}|null} null when nothing overlaps
 */
function computeNeighbourCompatibility(pairs) {
  let weightedTotal = 0;
  let areaTotal = 0;
  const contributing = [];

  // Only pairs that genuinely overlap. Counting a non-overlapping pair as zero
  // would drag the average down and misrepresent the pairs that do touch.
  pairs.forEach((pair) => {
    if (pair.overlapArea <= 0) return;
    weightedTotal += pair.overlapArea * pair.similarity;
    areaTotal += pair.overlapArea;
    contributing.push({
      a: pair.a, b: pair.b, overlapArea: pair.overlapArea, score: pair.similarity
    });
  });

  if (areaTotal === 0) return null;
  return { percent: (weightedTotal / areaTotal) * 100, pairs: contributing };
}


/* ===========================================================================
   METRIC 3 — CONFIGURATION SCORE

   A designed educational score for the whole four-cloud arrangement. It is NOT
   the loss function of a trained VAE and must not be described as one.

   Reef Overlap sets how much reward is available. Incompatible cloud-to-cloud
   overlap removes some of it. Reef Penalty decides how much is removed.

       pairConflict   = overlapArea x (1 - similarity)
       actualConflict = sum of pairConflict over all six pairs
       maxConflict    = sum of min(areaA, areaB) x (1 - similarity), all six
       I              = clamp(actualConflict / maxConflict, 0, 1)

       Configuration Score = 100 x R x (1 - beta x I)

   where R is Reef Overlap as a decimal and beta is the slider.

   Two clouds overlapping is not automatically bad. Overlapping clouds of
   *different body shapes* is what costs, which is why conflict is weighted by
   (1 - similarity) rather than by area alone.

   The denominator counts all six pairs whether or not they currently overlap,
   so the scale is fixed by the cloud sizes rather than drifting as clouds are
   moved apart. Cloud-reef intersection never enters this calculation.
   =========================================================================== */

/** One pair's contribution: how much incompatible area it currently shares. */
function calculatePairConflict(overlapArea, similarity) {
  return overlapArea * (1 - similarity);
}

/**
 * How incompatible the whole arrangement currently is, from 0 to 1.
 *
 * 0 when nothing overlaps. 1 when every pair overlaps as completely as its
 * two circles allow.
 *
 * @param {Array} pairs from getPairOverlaps
 */
function calculateNormalizedIncompatibility(pairs) {
  let actualConflict = 0;
  let maximumConflict = 0;

  pairs.forEach((pair) => {
    const incompatibility = 1 - pair.similarity;
    actualConflict += calculatePairConflict(pair.overlapArea, pair.similarity);
    // The most two circles can ever share is the whole of the smaller one.
    maximumConflict += Math.min(pair.areaA, pair.areaB) * incompatibility;
  });

  if (maximumConflict === 0) return 0;
  return clamp(actualConflict / maximumConflict, 0, 1);
}

/**
 * @param {number} reefOverlapPercent 0-100, reused from Metric 1
 * @param {number} normalizedIncompatibility 0-1
 * @param {number} beta 0-1, the Reef Penalty slider
 * @returns {number} 0-100
 */
function calculateConfigurationScore(reefOverlapPercent, normalizedIncompatibility, beta) {
  const reward = reefOverlapPercent / 100;
  const retained = 1 - beta * normalizedIncompatibility;
  return clamp(100 * reward * retained, 0, 100);
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

function updateConfigurationScoreHUD(score) {
  const rounded = Math.round(score);
  configurationValue.textContent = `${rounded}%`;
  configurationFill.style.width = `${clamp(score, 0, 100)}%`;
  configurationBar.setAttribute('aria-valuenow', String(rounded));
  configurationBar.setAttribute('aria-valuetext', `${rounded} percent`);
}

/** Current Reef Penalty, read from the slider rather than held separately. */
function getReefPenaltyBeta() {
  return Number(reefPenaltyInput.value);
}

function renderReefPenaltyValue() {
  reefPenaltyValue.textContent = `β = ${getReefPenaltyBeta().toFixed(2)}`;
}

function updateMetrics() {
  const measured = clouds.map((cloud) => ({
    cloud,
    id: cloud.dataset.cloudId,
    geo: getCloudGeometry(cloud)
  }));

  // The six pairs are measured once and shared, so Compatibility and the
  // Configuration Score cannot disagree about who overlaps whom.
  const pairs = getPairOverlaps(measured);

  // Three separate meanings, computed independently:
  //   Reef Overlap            — position relative to the reef
  //   Neighbour Compatibility — shape similarity of clouds overlapping each other
  //   Configuration Score     — the whole arrangement judged together
  const reefOverlapPercent = computeReefOverlap(measured.map((m) => m.geo), getReefGeometry());
  renderReefOverlap(reefOverlapPercent);
  renderNeighbourCompatibility(computeNeighbourCompatibility(pairs));

  updateConfigurationScoreHUD(calculateConfigurationScore(
    reefOverlapPercent,
    calculateNormalizedIncompatibility(pairs),
    getReefPenaltyBeta()
  ));

  // Returns immediately unless Reveal Mode is open.
  updateExplainer();

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
    offsetY: event.clientY - (cloudRect.top + cloudRect.height / 2),
    // Used to tell a click apart from a drag, so a tap can select a cloud in
    // Reveal Mode without the pointer-down also counting as a move.
    startX: event.clientX,
    startY: event.clientY,
    moved: false
  };

  cloud.classList.add('dragging');
  cloud.addEventListener('pointermove', onPointerMove);
  cloud.addEventListener('pointerup', onPointerUp);
  cloud.addEventListener('pointercancel', onPointerUp);
}

function onPointerMove(event) {
  if (!activeDrag || event.pointerId !== activeDrag.pointerId) return;

  const { cloud, offsetX, offsetY } = activeDrag;

  const DRAG_THRESHOLD_PX = 4;
  if (Math.hypot(event.clientX - activeDrag.startX, event.clientY - activeDrag.startY) > DRAG_THRESHOLD_PX) {
    activeDrag.moved = true;
  }

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

  const { cloud, pointerId, moved } = activeDrag;
  cloud.releasePointerCapture(pointerId);
  cloud.classList.remove('dragging');
  cloud.removeEventListener('pointermove', onPointerMove);
  cloud.removeEventListener('pointerup', onPointerUp);
  cloud.removeEventListener('pointercancel', onPointerUp);
  updateCloudLabel(cloud);
  activeDrag = null;

  if (revealActive) {
    // A tap selects; a drag reports where the cloud ended up.
    if (!moved) selectCloud(cloud);
    else if (cloud === selectedCloud) announcePosterior();
  }
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

  // Keyboard movement is discrete, so a debounced announcement is enough.
  if (revealActive && cloud === selectedCloud) announcePosterior();
}

const ARROW_DIRECTIONS = {
  ArrowLeft:  [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp:    [0, -1],
  ArrowDown:  [0, 1]
};

function onCloudKeyDown(event) {
  // Enter or Space selects this cloud in Reveal Mode. Handled before the arrow
  // keys so it cannot interfere with movement.
  if (revealActive && (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar')) {
    event.preventDefault();
    selectCloud(event.currentTarget);
    return;
  }

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
   REVEAL MODE — Explainer Step 1

   Shows one cloud as the posterior for one image, annotating its mean and
   spread. Later explainer steps (prior, KL, sampling, reconstruction) are not
   implemented here.

   Every listener is attached once at start-up and the mode is driven by state,
   so opening and closing repeatedly cannot accumulate handlers.
   =========================================================================== */

const revealPanel = document.getElementById('reveal-panel');
const revealButton = document.getElementById('reveal-model');
const revealClose = document.getElementById('reveal-close');
const revealHeading = document.getElementById('reveal-heading');
const revealSelectedName = document.getElementById('reveal-selected-name');
const muValue = document.getElementById('mu-value');
const sigmaValue = document.getElementById('sigma-value');
const mathMu = document.getElementById('math-mu');
const mathSigma = document.getElementById('math-sigma');
const posteriorAnnouncement = document.getElementById('posterior-announcement');

let revealActive = false;
let selectedCloud = null;
let announceTimer = null;

/** Builds the centre marker and spread indicator once per cloud, on demand. */
function ensureAnnotations(cloud) {
  if (cloud.querySelector('.mu-marker')) return;

  const marker = document.createElement('div');
  marker.className = 'mu-marker';
  marker.setAttribute('aria-hidden', 'true');
  marker.innerHTML = '<span class="mu-marker-label">&mu;</span>';

  // A line from the mathematical centre out to the contour, labelled sigma.
  const spread = document.createElement('div');
  spread.className = 'sigma-indicator';
  spread.setAttribute('aria-hidden', 'true');
  spread.innerHTML = '<span class="sigma-indicator-label">&sigma;</span>';

  cloud.append(marker, spread);
}

function selectCloud(cloud) {
  if (!cloud) return;
  selectedCloud = cloud;
  ensureAnnotations(cloud);

  clouds.forEach((candidate) => {
    const isSelected = candidate === cloud;
    candidate.classList.toggle('is-selected', isSelected);
    candidate.classList.toggle('is-muted', revealActive && !isSelected);
    if (revealActive) {
      candidate.setAttribute('aria-pressed', String(isSelected));
    }
  });

  revealSelectedName.textContent = cloud.dataset.name;
  updateExplainer();
  announcePosterior();
}

/** Refreshes the displayed parameters. Cheap enough to run on every drag frame. */
function updateExplainer() {
  if (!revealActive || !selectedCloud) return;

  const shown = formatPosteriorParameters(
    calculatePosteriorParameters(getCloudGeometry(selectedCloud), getReefGeometry())
  );

  muValue.textContent = shown.mu;
  sigmaValue.textContent = shown.sigma;
  mathMu.textContent = shown.mu;
  mathSigma.textContent = shown.sigma;
}

/**
 * Screen-reader announcement, deliberately not live-bound to the visible
 * values. Announcing every pointer frame would flood the user, so this is
 * called on drag end and debounced for keyboard movement.
 */
function announcePosterior() {
  if (!revealActive || !selectedCloud) return;
  clearTimeout(announceTimer);
  announceTimer = setTimeout(() => {
    const shown = formatPosteriorParameters(
      calculatePosteriorParameters(getCloudGeometry(selectedCloud), getReefGeometry())
    );
    posteriorAnnouncement.textContent =
      `${selectedCloud.dataset.name}. Mean ${shown.muX}, ${shown.muY}. Spread ${shown.sigma}.`;
  }, 350);
}

function openReveal() {
  if (revealActive) return;
  revealActive = true;

  revealPanel.hidden = false;
  document.body.classList.add('reveal-active');
  revealButton.setAttribute('aria-expanded', 'true');

  clouds.forEach((cloud) => cloud.setAttribute('aria-pressed', 'false'));
  selectCloud(selectedCloud || clouds.find((c) => c.dataset.cloudId === 'round-orange') || clouds[0]);

  revealHeading.focus();
}

function closeReveal() {
  if (!revealActive) return;
  revealActive = false;

  revealPanel.hidden = true;
  document.body.classList.remove('reveal-active');
  revealButton.setAttribute('aria-expanded', 'false');

  clouds.forEach((cloud) => {
    cloud.classList.remove('is-selected', 'is-muted');
    cloud.removeAttribute('aria-pressed');
  });

  clearTimeout(announceTimer);
  posteriorAnnouncement.textContent = '';
  revealButton.focus();
}

function initReveal() {
  revealButton.addEventListener('click', openReveal);
  revealClose.addEventListener('click', closeReveal);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && revealActive) {
      event.preventDefault();
      closeReveal();
    }
  });
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
  initReveal();

  // The slider is a judging weight only: it re-scores the current arrangement
  // and touches nothing else. "input" so the score tracks the thumb live.
  reefPenaltyInput.value = String(CONFIG.reefPenaltyBeta);
  renderReefPenaltyValue();
  reefPenaltyInput.addEventListener('input', () => {
    renderReefPenaltyValue();
    updateMetrics();
  });

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateMetrics, 100);
  });

  updateMetrics();
}

init();
