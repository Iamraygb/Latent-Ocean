const scene = document.getElementById('ocean-scene');
const clouds = Array.from(document.querySelectorAll('.latent-cloud'));
const overlapReadout = document.getElementById('overlap-readout');

// Reads the circular .cloud-region's live rendered geometry so measurements
// stay correct after drag moves or viewport resizes.
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
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < a.radius + b.radius;
}

function updateOverlapState() {
  const geometries = clouds.map((cloud) => ({ cloud, geo: getCloudGeometry(cloud) }));

  clouds.forEach((cloud) => cloud.classList.remove('is-overlapping'));

  const overlappingPairs = [];
  for (let i = 0; i < geometries.length; i++) {
    for (let j = i + 1; j < geometries.length; j++) {
      if (circlesOverlap(geometries[i].geo, geometries[j].geo)) {
        geometries[i].cloud.classList.add('is-overlapping');
        geometries[j].cloud.classList.add('is-overlapping');
        overlappingPairs.push([geometries[i].cloud.dataset.name, geometries[j].cloud.dataset.name]);
      }
    }
  }

  renderOverlapReadout(overlappingPairs);
}

function renderOverlapReadout(pairs) {
  if (pairs.length === 0) {
    overlapReadout.textContent =
      'Drag the translucent clouds to explore how their latent distributions overlap. No clouds are currently overlapping.';
    return;
  }
  overlapReadout.textContent = pairs.map(([a, b]) => `${a} overlaps ${b}`).join(' · ');
}

let activeDrag = null;

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
  const sceneRect = scene.getBoundingClientRect();
  const cloudRect = cloud.getBoundingClientRect();
  const radiusX = cloudRect.width / 2;
  const radiusY = cloudRect.height / 2;

  let targetX = event.clientX - offsetX - sceneRect.left;
  let targetY = event.clientY - offsetY - sceneRect.top;

  targetX = Math.min(Math.max(targetX, radiusX), sceneRect.width - radiusX);
  targetY = Math.min(Math.max(targetY, radiusY), sceneRect.height - radiusY);

  cloud.style.setProperty('--x', `${(targetX / sceneRect.width) * 100}%`);
  cloud.style.setProperty('--y', `${(targetY / sceneRect.height) * 100}%`);

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

clouds.forEach((cloud) => cloud.addEventListener('pointerdown', onPointerDown));

let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(updateOverlapState, 100);
});

updateOverlapState();
