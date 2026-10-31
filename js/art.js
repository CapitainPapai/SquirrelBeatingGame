// Процедурный SVG-арт бурундуков. У каждого вида — уникальная палитра и декор.
import { SQUIRREL_BY_ID } from './data/squirrels.js';

let uidCounter = 0;
const nextUid = () => `sg${++uidCounter}`;

const LT = '0 0 120 130';

function ears(pal, long) {
  const h = long ? 1.5 : 1;
  // Аккуратные заострённые ушки с внутренней частью
  const ear = (flip) => {
    const t = flip ? -1 : 1;
    const x = 60 + t * 19;
    return `<g transform="translate(${x} 0) scale(${t} 1)">
      <path d="M-10 30 C -14 18 -12 8 -4 4 C 4 2 10 10 10 22 C 10 28 6 32 0 33 Z" fill="url(#EAR)"/>
      <path d="M-5 27 C -8 18 -7 12 -3 10 C 2 9 5 15 5 22 C 5 26 2 28 -1 28 Z" fill="${pal.inner}" opacity="0.9"/>
    </g>`;
  };
  const lift = long ? -8 : 0;
  return `<g transform="translate(0 ${lift}) scale(1 ${h})">${ear(false)}${ear(true)}</g>`;
}

function tail(pal) {
  return `
    <g class="art-tail">
      <path d="M74 120 C 100 124 116 112 118 92 C 120 74 112 56 100 48 C 91 42 82 48 84 58 C 86 66 94 70 97 78 C 102 90 96 106 78 110 Z" fill="url(#TAIL)"/>
      <path d="M82 112 C 100 112 108 100 108 88 C 108 76 102 66 95 60 C 91 57 88 60 90 65 C 94 74 101 82 100 92 C 99 102 94 108 82 108 Z" fill="${pal.furLight}" opacity="0.45"/>
      <path d="M96 54 C 101 50 106 52 109 57" stroke="${pal.furDark}" stroke-width="2" fill="none" opacity="0.35" stroke-linecap="round"/>
    </g>`;
}

function paws(pal, holding) {
  const food = holding === 'leaf'
    ? `<path d="M60 96 q -9 -3 -10 -11 q 10 1 10 11 z" fill="#7faa5b"/><path d="M60 96 q 9 -3 10 -11 q -10 1 -10 11 z" fill="#8fbb67"/>`
    : holding === 'none'
      ? ''
      : `<g>
          <path d="M52 86 q 8 -3 16 0 q 3 8 -2 13 q -6 6 -12 0 q -5 -5 -2 -13 z" fill="#c8874a"/>
          <path d="M53 94 q 7 4 14 0 q -2 5 -7 5 q -5 0 -7 -5 z" fill="#a86e38" opacity="0.6"/>
          <path d="M50 87 q 10 -7 20 0 q -2 -8 -10 -8 q -8 0 -10 8 z" fill="#8c5a2e"/>
          <path d="M60 79 v -4" stroke="#6f4522" stroke-width="2.2" fill="none" stroke-linecap="round"/>
          <ellipse cx="56" cy="89" rx="2" ry="1.4" fill="#f3dfb8" opacity="0.55"/>
        </g>`;
  return `
    ${food}
    <ellipse cx="41" cy="100" rx="8.5" ry="6.5" fill="${pal.furLight}" transform="rotate(-14 41 100)"/>
    <ellipse cx="79" cy="100" rx="8.5" ry="6.5" fill="${pal.furLight}" transform="rotate(14 79 100)"/>`;
}

function face(pal, type) {
  const eye = pal.eye || '#2f2620';
  const angry = type.id === 'angryred' || type.id === 'fire' || type.id === 'oakking';
  const sleepy = type.id === 'sleepy' || type.id === 'moon';
  const brows = angry
    ? `<path d="M42 34 q 8 -3 13 2" stroke="${pal.furDark}" stroke-width="3" stroke-linecap="round" fill="none"/>
       <path d="M78 34 q -8 -3 -13 2" stroke="${pal.furDark}" stroke-width="3" stroke-linecap="round" fill="none"/>`
    : '';
  const eyes = sleepy
    ? `<path d="M44 46 q 6 5 12 0" stroke="${eye}" stroke-width="3" fill="none" stroke-linecap="round"/>
       <path d="M64 46 q 6 5 12 0" stroke="${eye}" stroke-width="3" fill="none" stroke-linecap="round"/>`
    : `<g class="art-eyes">
         <ellipse cx="50" cy="46" rx="4.6" ry="5.4" fill="${eye}"/>
         <ellipse cx="70" cy="46" rx="4.6" ry="5.4" fill="${eye}"/>
         <circle cx="48.6" cy="44.2" r="1.7" fill="#fff" opacity="0.92"/>
         <circle cx="68.6" cy="44.2" r="1.7" fill="#fff" opacity="0.92"/>
         <circle cx="51.5" cy="48.4" r="0.9" fill="#fff" opacity="0.5"/>
         <circle cx="71.5" cy="48.4" r="0.9" fill="#fff" opacity="0.5"/>
       </g>`;
  return `
    <ellipse cx="60" cy="57" rx="11.5" ry="8.5" fill="${pal.belly}" opacity="0.95"/>
    <circle cx="45" cy="55" r="3.4" fill="${pal.inner}" opacity="0.4"/>
    <circle cx="75" cy="55" r="3.4" fill="${pal.inner}" opacity="0.4"/>
    ${brows}${eyes}
    <path d="M60 52.5 l -4 3 q 4 3.4 8 0 z" fill="${pal.eye || '#3a2a22'}"/>
    <path d="M56 58 q 4 3 8 0" stroke="${pal.furDark}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <g class="art-teeth">
      <rect x="56.8" y="60" width="3" height="4.2" rx="1.2" fill="#fffdf6"/>
      <rect x="60.2" y="60" width="3" height="4.2" rx="1.2" fill="#fffdf6"/>
    </g>`;
}

function decor(type, pal) {
  const a = pal.accent;
  const dark = pal.furDark;
  const d = type.deco;
  if (!d) return '';
  switch (d) {
    case 'stripes':
      return `<g opacity="0.55">
        <path d="M48 22 q 12 -6 24 0" stroke="${dark}" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M50 30 q 10 -4 20 0" stroke="${dark}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      </g>`;
    case 'longears':
      return `<circle cx="42" cy="16" r="3" fill="${pal.inner}" opacity="0.9"/><circle cx="78" cy="16" r="3" fill="${pal.inner}" opacity="0.9"/>`;
    case 'glasses':
      return `<g stroke="#4a3b30" stroke-width="2.2" fill="none" stroke-linecap="round">
        <circle cx="50" cy="46" r="8.4"/><circle cx="70" cy="46" r="8.4"/>
        <path d="M58.4 45 q 1.6 -2 3.2 0"/><path d="M41.6 44 l -6 -2"/><path d="M78.4 44 l 6 -2"/>
        <path d="M50 38 a 8.4 8.4 0 0 1 6 -1" stroke="#fff" stroke-opacity="0.5"/>
      </g>`;
    case 'leafhat':
      return `<g transform="translate(60 20)">
        <path d="M0 4 q -18 -4 -20 -16 q 16 -2 20 12 z" fill="#7fa85a"/>
        <path d="M0 4 q 18 -4 20 -16 q -16 -2 -20 12 z" fill="#93bb6b"/>
        <path d="M0 5 q -2 -10 0 -16" stroke="#5f8642" stroke-width="1.6" fill="none"/>
        <ellipse cx="0" cy="6" rx="7" ry="3.2" fill="${dark}" opacity="0.5"/>
      </g>`;
    case 'bowtie':
      return `<g transform="translate(60 68)">
        <path d="M-0 -1 l -11 -6 v 12 z" fill="${a}"/><path d="M0 -1 l 11 -6 v 12 z" fill="${a}"/>
        <circle cx="0" cy="0" r="2.8" fill="${a}" stroke="#00000022"/>
      </g>`;
    case 'scarf':
      return `<g>
        <path d="M42 64 q 18 9 36 0 q 1 7 -3 9 q -15 7 -30 0 q -4 -2 -3 -9 z" fill="${a}"/>
        <path d="M66 72 q 6 12 2 22 q -7 3 -9 -2 q 4 -10 1 -18 z" fill="${a}" opacity="0.92"/>
        <path d="M42 64 q 18 9 36 0" stroke="#ffffff40" stroke-width="2" fill="none"/>
      </g>`;
    case 'shine':
      return `<g class="art-sparkle" fill="#fff6c9">
        <path d="M22 30 l 2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2 z"/>
        <path d="M100 56 l 1.4 4.2 4.2 1.4 -4.2 1.4 -1.4 4.2 -1.4 -4.2 -4.2 -1.4 4.2 -1.4 z"/>
        <path d="M94 16 l 1.2 3.6 3.6 1.2 -3.6 1.2 -1.2 3.6 -1.2 -3.6 -3.6 -1.2 3.6 -1.2 z"/>
      </g>`;
    case 'bandana':
      return `<g>
        <path d="M34 32 q 26 -12 52 0 q 2 6 -2 8 q -24 -9 -48 0 q -4 -2 -2 -8 z" fill="${a}"/>
        <path d="M40 39 q 20 -6 40 0" stroke="#ffffff30" stroke-width="2" fill="none"/>
        <path d="M84 38 q 9 -2 12 4 q -8 4 -13 -1 z" fill="${a}"/>
      </g>`;
    case 'ninja':
      return `<g>
        <path d="M35 40 q 25 -8 50 0 q 1 7 -2 9 q -23 -6 -46 0 q -3 -2 -2 -9 z" fill="${dark}"/>
        <path d="M88 42 q 12 -3 14 3 q -10 5 -15 1 z" fill="${dark}"/>
        <path d="M42 45 q 18 -4 36 0" stroke="#ffffff2e" stroke-width="2" fill="none"/>
      </g>`;
    case 'wizardhat':
      return `<g transform="translate(60 20)">
        <path d="M-20 2 q 20 6 40 0 q -4 -4 -12 -6 q -4 -14 -8 -15 q -6 4 -8 15 q -8 2 -12 6 z" fill="${a}"/>
        <path d="M-2 16 q 4 -8 2 -18" stroke="#ffffff26" stroke-width="2" fill="none"/>
        <path d="M-1 -20 q 6 -6 3 -10 q 7 2 3 10" fill="#ffe9a8"/>
        <ellipse cx="0" cy="2" rx="20" ry="3.4" fill="${dark}" opacity="0.4"/>
      </g>`;
    case 'clock':
      return `<g transform="translate(87 74)">
        <circle r="9" fill="#f5e7c8" stroke="${a}" stroke-width="2.6"/>
        <path d="M0 -5 v 5 l 4 3" stroke="#6b5641" stroke-width="2" fill="none" stroke-linecap="round"/>
        <circle r="1.4" fill="#6b5641"/>
        <path d="M0 -12 v -4" stroke="${a}" stroke-width="2.4"/>
      </g>`;
    case 'monocle':
      return `<g stroke="${a}" stroke-width="2.4" fill="none">
        <circle cx="70" cy="46" r="9" fill="#fff" fill-opacity="0.12"/>
        <path d="M76 54 q 8 10 4 20"/>
        <path d="M66 40 a 9 9 0 0 1 4 -2" stroke="#fff" stroke-opacity="0.6"/>
      </g>`;
    case 'ice':
      return `<g stroke="#dff6ff" stroke-width="2" fill="none" opacity="0.9">
        <path d="M30 24 l 0 -10 M26 19 l 8 0 M26 19 l -4 -4 M34 19 l 4 -4"/>
        <path d="M92 34 l 0 -8 M88.5 30 l 7 0"/>
      </g>`;
    case 'moon':
      return `<g transform="translate(88 22)">
        <path d="M0 -10 a 10 10 0 1 0 0 20 a 8 8 0 1 1 0 -20 z" fill="#fff8d8"/>
        <circle cx="-12" cy="8" r="1.4" fill="#fff8d8"/><circle cx="6" cy="14" r="1" fill="#fff8d8"/>
      </g>`;
    case 'flame':
      return `<g class="art-flame" transform="translate(90 26)">
        <path d="M0 8 q -8 -2 -8 -10 q 0 -6 6 -12 q 1 6 4 8 q 4 -4 4 -9 q 6 6 6 13 q 0 8 -12 10 z" fill="#ff9b45" opacity="0.9"/>
        <path d="M0 6 q -4 -1 -4 -5 q 0 -4 4 -7 q 2 4 4 6 q 2 -2 2 -4 q 2 4 2 6 q 0 4 -8 4 z" fill="#ffe08a"/>
      </g>`;
    case 'bolt':
      return `<g transform="translate(92 24)">
        <path d="M0 -14 l 10 0 l -6 10 l 8 0 l -14 18 l 4 -13 l -8 0 z" fill="#ffe066" stroke="#c9a227" stroke-width="1.2"/>
      </g>`;
    case 'shadow':
      return `<g opacity="0.5">
        <ellipse cx="60" cy="70" rx="46" ry="52" fill="url(#AURA)"/>
        <circle cx="30" cy="40" r="2.4" fill="${a}"/><circle cx="96" cy="72" r="2" fill="${a}"/>
        <path d="M28 78 q 8 -6 16 0" stroke="${a}" stroke-width="2" fill="none" opacity="0.6"/>
      </g>`;
    case 'rainbow':
      return `<g transform="translate(60 12)" fill="none" stroke-width="3.2" stroke-linecap="round">
        <path d="M-30 12 a 30 30 0 0 1 60 0" stroke="#f28b8b"/>
        <path d="M-25 12 a 25 25 0 0 1 50 0" stroke="#f2c97d"/>
        <path d="M-20 12 a 20 20 0 0 1 40 0" stroke="#a6d68a"/>
        <path d="M-15 12 a 15 15 0 0 1 30 0" stroke="#8fb9e0"/>
      </g>`;
    case 'crown':
      return `<g transform="translate(60 20)">
        <path d="M-16 6 l -2 -16 l 8 7 l 8 -12 l 8 12 l 8 -7 l -2 16 z" fill="#f0c05a" stroke="#c99b34" stroke-width="1.4"/>
        <circle cx="0" cy="-2" r="2" fill="#e8617d"/><circle cx="-11" cy="0" r="1.6" fill="#7ac0e8"/><circle cx="11" cy="0" r="1.6" fill="#7ac0e8"/>
      </g>`;
    case 'halo':
      return `<g>
        <ellipse cx="60" cy="12" rx="22" ry="6" fill="none" stroke="#ffe9a8" stroke-width="3.4" class="art-halo"/>
        <ellipse cx="60" cy="12" rx="22" ry="6" fill="none" stroke="#fff" stroke-width="1" opacity="0.6"/>
        <circle cx="30" cy="30" r="1.8" fill="#fff3c4"/><circle cx="94" cy="44" r="1.4" fill="#fff3c4"/>
      </g>`;
    case 'cosmic':
      return `<g>
        <ellipse cx="60" cy="60" rx="44" ry="14" fill="none" stroke="#ffe9a8" stroke-width="2" opacity="0.5" transform="rotate(-18 60 60)"/>
        <circle cx="24" cy="34" r="1.6" fill="#fff"/><circle cx="98" cy="80" r="1.4" fill="#fff"/>
        <circle cx="32" cy="94" r="1.2" fill="#ffe9a8"/><circle cx="92" cy="26" r="2" fill="#fff"/>
        <path d="M30 22 l 1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6 z" fill="#ffe9a8"/>
      </g>`;
    case 'spirit':
      return `<g>
        <path d="M44 20 q -6 -12 2 -18 q 2 8 8 10" fill="none" stroke="#8fdc9f" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M76 20 q 6 -12 -2 -18 q -2 8 -8 10" fill="none" stroke="#8fdc9f" stroke-width="2.4" stroke-linecap="round"/>
        <circle cx="24" cy="60" r="3" fill="#c6f7c6" opacity="0.7"/><circle cx="98" cy="70" r="2.4" fill="#c6f7c6" opacity="0.6"/>
        <ellipse cx="60" cy="100" rx="30" ry="20" fill="#d9ffd9" opacity="0.12"/>
      </g>`;
    default:
      return '';
  }
}

/**
 * Собирает SVG бурундука.
 * @param {object|string} type вид или id
 * @param {object} opts {glow, className}
 */
export function squirrelSVG(type, opts = {}) {
  const t = typeof type === 'string' ? SQUIRREL_BY_ID[type] : type;
  const pal = t.palette;
  const uid = nextUid();
  const longEars = t.deco === 'longears';
  const svg = `
<svg class="sq-svg ${opts.className || ''}" viewBox="${LT}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="FUR-${uid}" x1="0" y1="0" x2="0.25" y2="1">
      <stop offset="0" stop-color="${pal.furLight}"/><stop offset="0.6" stop-color="${pal.fur}"/><stop offset="1" stop-color="${pal.furDark}"/>
    </linearGradient>
    <linearGradient id="HEAD-${uid}" x1="0.2" y1="0" x2="0.8" y2="1">
      <stop offset="0" stop-color="${pal.furLight}"/><stop offset="0.75" stop-color="${pal.fur}"/>
    </linearGradient>
    <linearGradient id="TAIL-${uid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${pal.fur}"/><stop offset="0.55" stop-color="${pal.furDark}"/><stop offset="1" stop-color="${pal.fur}"/>
    </linearGradient>
    <linearGradient id="EAR-${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${pal.furLight}"/><stop offset="1" stop-color="${pal.fur}"/>
    </linearGradient>
    <radialGradient id="AURA-${uid}" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${pal.accent}" stop-opacity="0.55"/><stop offset="1" stop-color="${pal.accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <g class="art-body">
    ${tail(pal)}
    <path d="M60 58 C 84 58 95 78 93 98 C 91 116 78 124 60 124 C 42 124 29 116 27 98 C 25 78 36 58 60 58 Z" fill="url(#FUR-${uid})"/>
    <ellipse cx="60" cy="100" rx="21" ry="23" fill="${pal.belly}" opacity="0.95"/>
    <ellipse cx="60" cy="112" rx="14" ry="12" fill="${pal.belly}" opacity="0.6"/>
    <ellipse cx="60" cy="86" rx="27" ry="20" fill="#ffffff" opacity="0.05"/>
    ${ears(pal, longEars)}
    <circle cx="60" cy="44" r="25" fill="url(#HEAD-${uid})"/>
    <path d="M38 30 q 22 -16 44 0 q -6 -14 -22 -14 q -16 0 -22 14 z" fill="${pal.furLight}" opacity="0.35"/>
    ${face(pal, t)}
    ${paws(pal, t.id === 'gardener' ? 'leaf' : t.deco === 'ninja' ? 'none' : 'acorn')}
    ${decor(t, pal)}
  </g>
</svg>`;
  // Подставляем уникальные id градиентов
  return svg
    .replace(/url\(#FUR\)/g, `url(#FUR-${uid})`)
    .replace(/url\(#HEAD\)/g, `url(#HEAD-${uid})`)
    .replace(/url\(#TAIL\)/g, `url(#TAIL-${uid})`)
    .replace(/url\(#EAR\)/g, `url(#EAR-${uid})`)
    .replace(/url\(#AURA\)/g, `url(#AURA-${uid})`);
}

export function hammerSVG() {
  return `<svg viewBox="0 0 64 64" class="hammer-svg" aria-hidden="true">
    <g class="hammer-inner">
      <rect x="29" y="24" width="7" height="34" rx="3.4" fill="#a9764a"/>
      <rect x="29" y="24" width="3" height="34" rx="1.6" fill="#c39769"/>
      <rect x="31" y="48" width="8" height="10" rx="3" fill="#8d6038"/>
      <path d="M18 24 h 30 a 5 5 0 0 1 5 5 v 3 a 5 5 0 0 1 -5 5 h -30 a 5 5 0 0 1 -5 -5 v -3 a 5 5 0 0 1 5 -5 z" fill="#8f98a1"/>
      <path d="M18 24 h 30 a 5 5 0 0 1 5 5 v 1 h -40 v -1 a 5 5 0 0 1 5 -5 z" fill="#c3ccd4"/>
      <path d="M13 34 h 40 v 1 a 5 5 0 0 1 -5 5 h -30 a 5 5 0 0 1 -5 -5 z" fill="#69737c"/>
      <rect x="22" y="27" width="12" height="2.4" rx="1.2" fill="#e7edf2" opacity="0.8"/>
      <circle cx="32.5" cy="42" r="1.6" fill="#5f6870"/>
    </g>
  </svg>`;
}

export function acornSVG() {
  return `<svg viewBox="0 0 32 32" aria-hidden="true" class="acorn-svg">
    <path d="M16 30 C 8 26 5 19 6 12 h 20 c 1 7 -2 14 -10 18 z" fill="#c8874a"/>
    <path d="M16 30 C 11 27 8 22 8 17 h 8 v 13 z" fill="#dda46a" opacity="0.7"/>
    <path d="M4 12 a 12 6 0 0 1 24 0 q -12 -4 -24 0 z" fill="#8c5a2e"/>
    <path d="M16 7 q 1 -4 4 -5" stroke="#6f4522" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <ellipse cx="11" cy="9" rx="2.4" ry="1.2" fill="#ffffff" opacity="0.25"/>
  </svg>`;
}

export function chestSVG() {
  return `<svg viewBox="0 0 48 44" aria-hidden="true" class="chest-svg">
    <rect x="4" y="16" width="40" height="24" rx="4" fill="#a9764a"/>
    <rect x="4" y="16" width="40" height="24" rx="4" fill="none" stroke="#6f4522" stroke-width="2"/>
    <path d="M4 22 a 20 12 0 0 1 40 0 z" fill="#c79a63"/>
    <path d="M4 22 a 20 12 0 0 1 40 0" fill="none" stroke="#6f4522" stroke-width="2"/>
    <rect x="20" y="24" width="8" height="9" rx="2" fill="#f0c05a"/>
    <circle cx="24" cy="28" r="1.6" fill="#8a6a1f"/>
    <rect x="10" y="17" width="28" height="3" fill="#8a5c30" opacity="0.5"/>
    <ellipse cx="16" cy="28" rx="5" ry="2" fill="#fff" opacity="0.15"/>
  </svg>`;
}
