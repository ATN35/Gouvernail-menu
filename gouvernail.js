// gouvernail.js — orbite animée + gouvernail dirigé par la souris

const pagesStrip = document.querySelector('.pages-strip');
const pagesTrack = document.querySelector('.pages-track');

function setupInfinitePagesTrack() {
  if (!pagesStrip || !pagesTrack) return;

  const sourceLinks = Array.from(pagesTrack.querySelectorAll('.page-link:not([aria-hidden])'));
  if (!sourceLinks.length) return;

  const templates = sourceLinks.map(link => ({
    className: link.className,
    href: link.getAttribute('href') || '#',
    label: (link.textContent || '').trim(),
    dataLabel: link.dataset.label || '',
    dataColor: link.dataset.color || ''
  }));

  const buildSet = (hidden) => {
    const fragment = document.createDocumentFragment();
    templates.forEach(item => {
      const a = document.createElement('a');
      a.className = item.className;
      a.href = item.href;
      if (item.dataLabel) a.dataset.label = item.dataLabel;
      if (item.dataColor) a.dataset.color = item.dataColor;
      a.textContent = item.label;
      if (hidden) {
        a.setAttribute('aria-hidden', 'true');
        a.tabIndex = -1;
      }
      fragment.appendChild(a);
    });
    return fragment;
  };

  pagesTrack.innerHTML = '';
  pagesTrack.appendChild(buildSet(false));

  const oneSetWidth = pagesTrack.scrollWidth;
  if (!oneSetWidth) return;

  // Au moins assez de copies pour couvrir l'écran pendant tout le cycle.
  const copiesCount = Math.max(3, Math.ceil(pagesStrip.clientWidth / oneSetWidth) + 2);
  for (let i = 1; i < copiesCount; i += 1) {
    pagesTrack.appendChild(buildSet(true));
  }

  pagesTrack.style.setProperty('--pages-shift', `${oneSetWidth}px`);
  const duration = Math.max(18, Math.round(oneSetWidth / 28));
  pagesTrack.style.setProperty('--pages-duration', `${duration}s`);
}

setupInfinitePagesTrack();

const helm        = document.getElementById('helm');
const helmCurrent = document.getElementById('helmCurrent');
const helmDot     = document.getElementById('helmDot');
const links       = Array.from(document.querySelectorAll('.page-link'));
const sceneCards  = Array.from(document.querySelectorAll('.scene-card'));
const bgGroups    = Array.from(document.querySelectorAll('.bg-group'));
const primaryLinks = links.filter(link => !link.hasAttribute('aria-hidden'));
const sceneKeys = [
  'dirigeant',
  'developpeur',
  'product',
  'designer',
  'ops',
  'acquisition'
];

// ─── État ─────────────────────────────────────────────────
let helmRot    = 0;      // rotation rendue du gouvernail (deg)
let mouseAngle = 0;      // angle cible d'après la souris (deg)

let isSpinning = false;
let spinStart  = 0;
let spinBase   = 0;
let spinTarget = null;   // { href, label }
let activeIndex = 0;

// ─── Suivi souris ──────────────────────────────────────────
document.addEventListener('mousemove', (e) => {
  const r  = helm.getBoundingClientRect();
  const cx = r.left + r.width  / 2;
  const cy = r.top  + r.height / 2;
  mouseAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI) + 90;
});

function normalizeDeg(deg) {
  return ((deg % 360) + 360) % 360;
}

function indexFromAngle(deg) {
  const n = primaryLinks.length || 1;
  const norm = normalizeDeg(deg);
  return Math.round((norm / 360) * n) % n;
}

function setActiveByIndex(index) {
  if (!primaryLinks.length) return;
  const n = primaryLinks.length;
  const safeIndex = ((index % n) + n) % n;
  const activeLink = primaryLinks[safeIndex];
  if (!activeLink) return;

  activeIndex = safeIndex;
  const label = activeLink.dataset.label || '';
  const color = activeLink.dataset.color || '';

  if (helmCurrent) {
    helmCurrent.textContent = label;
    helmCurrent.classList.add('has-dest');
  }
  if (helmDot) helmDot.style.background = color;

  document.body.dataset.scene = sceneKeys[safeIndex] || 'dirigeant';
  const activeScene = sceneKeys[safeIndex] || 'dirigeant';
  sceneCards.forEach(card => {
    card.classList.toggle('is-active', card.dataset.sceneCard === activeScene);
  });
  bgGroups.forEach(group => {
    group.classList.toggle('is-active', group.dataset.bgGroup === activeScene);
  });
}

// ─── Déclenchement spin + navigation ──────────────────────
function spinAndGo(href, label) {
  if (isSpinning) return;
  spinBase   = helmRot;
  spinStart  = performance.now();
  isSpinning = true;
  spinTarget = { href, label };
  let idx = primaryLinks.findIndex(l => l.dataset.label === label);
  if (idx < 0 && href) {
    idx = primaryLinks.findIndex(l => l.getAttribute('href') === href);
  }
  if (idx < 0 && href && href.includes('#')) {
    const hash = href.split('#')[1];
    idx = primaryLinks.findIndex(l => (l.getAttribute('href') || '').endsWith('#' + hash));
  }
  if (idx >= 0) setActiveByIndex(idx);
  helm.classList.add('is-spinning');   // active le filtre lumineux CSS
}

// ─── Boucle principale ─────────────────────────────────────
function tick(now) {
  const SPIN_DUR = 2200;

  // 1. Gouvernail —————————————————————————————
  if (isSpinning) {
    const t    = Math.min((now - spinStart) / SPIN_DUR, 1);
    const ease = 1 - Math.pow(1 - t, 3);   // ease-out cubique
    helmRot = spinBase + 720 * ease;
    document.body.classList.add('is-turning');
    if (t >= 1) {
      isSpinning = false;
      helm.classList.remove('is-spinning');
      document.body.classList.remove('is-turning');
      if (spinTarget) window.location.href = spinTarget.href;
    }
  } else {
    // Suivi fluide de la souris
    let diff = ((mouseAngle - helmRot) % 360 + 540) % 360 - 180;
    helmRot += diff * 0.06;
    document.body.classList.toggle('is-turning', Math.abs(diff) > 2.2);
    const idx = indexFromAngle(helmRot);
    if (idx !== activeIndex) setActiveByIndex(idx);
  }

  helm.style.transform = `rotate(${helmRot}deg)`;

  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);

setActiveByIndex(0);

helm.addEventListener('click', () => {
  const current = primaryLinks[activeIndex];
  if (!current) return;
  spinAndGo(current.getAttribute('href'), current.dataset.label || '');
});

// ─── Clics sur les liens ───────────────────────────────────
links.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    spinAndGo(link.getAttribute('href'), link.dataset.label);
  });
});

// ─── Arrivée depuis index.html ─────────────────────────────
const dest  = sessionStorage.getItem('helm-destination');
const label = sessionStorage.getItem('helm-label');
if (dest && label) {
  sessionStorage.removeItem('helm-destination');
  sessionStorage.removeItem('helm-label');
  setTimeout(() => spinAndGo(dest, label), 400);
}
