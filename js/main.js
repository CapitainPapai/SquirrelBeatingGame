// Точка входа: связываем состояние, игру, интерфейс, звук и PWA.
import { load, save, state, applyOffline, getStats, discoveredCount, clearOfflineReport, flushSave, SAVE_STORAGE_KEY } from './state.js';
import { hydrateFromNative, isNative } from './storage.js';
import { Game } from './game.js';
import { ui } from './ui.js';
import { audio } from './audio.js';
import { hammerSVG } from './art.js';
import { SQUIRRELS } from './data/squirrels.js';
import { formatCoins } from './utils.js';

// Нативное приложение: сначала поднимаем сейв из файла приложения,
// затем читаем его через обычный localStorage-путь (код игры не меняется).
await hydrateFromNative(SAVE_STORAGE_KEY);
load();

window.__APP_VERSION__ = '';
if (isNative()) {
  document.body.classList.add('is-native');
  try {
    const tauriApp = window.__TAURI__ && window.__TAURI__.app;
    if (tauriApp && typeof tauriApp.getVersion === 'function') {
      window.__APP_VERSION__ = await tauriApp.getVersion();
    }
  } catch (e) { /* версия необязательна */ }
}

// Качество звука: null — авто (телефон = экономно), true/false — выбор игрока.
audio.setLowPower(state.settings.audioEconomy ?? null);

const game = new Game();
const fieldEl = document.getElementById('field');
const fxEl = document.getElementById('fx-layer');
const hammerEl = document.getElementById('hammer-cursor');

game.mount(fieldEl, fxEl);
ui.init(game);

// ─────────── молоток-курсор ───────────
hammerEl.innerHTML = hammerSVG();
let hammerHideTimer = 0;
let hammerSwingTimer = 0;
let pointerInField = false;

function moveHammer(x, y, show = true) {
  hammerEl.style.transform = `translate3d(${x - 34}px, ${y - 62}px, 0) rotate(-24deg)`;
  if (show) hammerEl.classList.add('is-on');
}

function swingHammer(x, y) {
  moveHammer(x, y);
  hammerEl.classList.remove('is-swing');
  void hammerEl.offsetWidth;
  hammerEl.classList.add('is-swing');
  clearTimeout(hammerSwingTimer);
  hammerSwingTimer = setTimeout(() => hammerEl.classList.remove('is-swing'), 130);
}

window.addEventListener('pointermove', (e) => {
  const inside = e.target instanceof Element && e.target.closest('#field');
  pointerInField = !!inside;
  if (e.pointerType === 'mouse') {
    moveHammer(e.clientX, e.clientY, inside);
    if (!inside) hammerEl.classList.remove('is-on');
  }
}, { passive: true });

// iOS и Android держат AudioContext на паузе, пока нет явного жеста.
// Будим звук на каждом тапе — иначе в установленном приложении он молчит.
window.addEventListener('pointerdown', (e) => {
  audio.wake();
  const inField = e.target instanceof Element && e.target.closest('#field');
  if (inField) {
    swingHammer(e.clientX, e.clientY);
    clearTimeout(hammerHideTimer);
    if (e.pointerType !== 'mouse') {
      hammerHideTimer = setTimeout(() => hammerEl.classList.remove('is-on'), 420);
    }
  }
}, { passive: true });

window.addEventListener('pointerup', (e) => {
  if (e.pointerType !== 'mouse' && !pointerInField) hammerEl.classList.remove('is-on');
}, { passive: true });

game.onSwingHook = (x, y) => swingHammer(x, y);
game.onBlockedHook = () => {
  hammerEl.classList.add('is-blocked');
  clearTimeout(hammerSwingTimer);
  hammerSwingTimer = setTimeout(() => hammerEl.classList.remove('is-blocked'), 140);
};
game.on('expire', () => {});
game.on('newSpecies', (species) => {
  ui.toast(`Новый вид: ${species.name}!`, 'good');
  ui.updateTabBadges();
  ui.renderBookFilters();
  if (ui.currentView === 'book') ui.renderBook();
});
game.on('buffUpdate', () => ui.updateHud(true));
game.on('buffStart', () => ui.updateHud(true));
game.on('fieldRebuilt', () => setTimeout(() => game.layout(), 40));
game.on('tip', (text) => ui.toast(text, 'good'));
game.on('rateUpdate', () => {});

// ─────────── клавиатура ───────────
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') return;
  if (ui.currentView !== 'game') return;
  const tag = document.activeElement?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  const n = Number(e.key);
  if (Number.isInteger(n) && n >= 1 && n <= 9) {
    const hole = game.holes[n - 1];
    if (hole) {
      const r = hole.el.getBoundingClientRect();
      swingHammer(r.left + r.width / 2, r.top + r.height / 2);
      game.tryPlayerStrike(hole, r.left + r.width / 2, r.top + r.height * 0.4);
    }
  }
  if (e.key === ' ' || e.key === 'Enter') {
    // удар по первому доступному бурундуку
    const target = game.holes.find((h) => h.occ);
    if (target) {
      const r = target.el.getBoundingClientRect();
      swingHammer(r.left + r.width / 2, r.top + r.height / 2);
      game.tryPlayerStrike(target, r.left + r.width / 2, r.top + r.height * 0.4);
    }
  }
});

document.addEventListener('contextmenu', (e) => {
  if (e.target instanceof Element && e.target.closest('#field')) e.preventDefault();
});

// ─────────── запуск ───────────
const hasProgress = state.totalEarned > 0 || Object.keys(state.levels).length > 0;
ui.showStart(hasProgress);

const offlineReport = applyOffline();

ui.onStart = () => {
  game.start();
  ui.updateStatic();
  ui.updateHud(true);
  if (!state.tutorialDone) {
    state.tutorialDone = true;
    save();
    setTimeout(() => ui.tutorialHint(), 400);
  }
  if (offlineReport) {
    setTimeout(() => {
      ui.showOffline(offlineReport);
      clearOfflineReport();
    }, 900);
  }
  setTimeout(() => game.refreshFromStats(), 100);
  setTimeout(() => game.layout(), 120);
};

// пауза, когда игра не видна
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    game.stop();
    audio.sleep();
    state.lastRate = game.ratePerMinute() || state.lastRate;
    flushSave();
  } else if (!ui.startNode) {
    game.start();
    ui.updateHud(true);
    audio.wake();
    slowFrames = 0;
    lastFrameAt = performance.now();
  }
});

// Дублирующий «разбудитель» для WebView без pointer-событий (старые iOS).
['touchend', 'click'].forEach((type) => {
  window.addEventListener(type, () => audio.wake(), { passive: true });
});

// Сторож производительности: звук в WebAudio рендерится между кадрами, и если
// главный поток «проваливается», слышны треск и разрывы. Три долгих кадра —
// повод автоматически перейти на экономный профиль.
let slowFrames = 0;
let lastFrameAt = performance.now();
let autoDegraded = false;
const watchFrames = (t) => {
  const gap = t - lastFrameAt;
  lastFrameAt = t;
  if (!document.hidden) {
    if (gap > 420) slowFrames += 1;
    else if (gap < 120) slowFrames = Math.max(0, slowFrames - 0.5);
    if (slowFrames >= 3 && !autoDegraded && !audio.lowPower && state.settings.audioEconomy !== false) {
      autoDegraded = true;
      audio.setLowPower(true);
      ui.toast('Включил экономный звук — устройству не хватало мощности', 'warn');
    }
  } else {
    slowFrames = 0;
  }
  requestAnimationFrame(watchFrames);
};
requestAnimationFrame(watchFrames);

setInterval(() => {
  state.lastRate = game.ratePerMinute() || state.lastRate;
  save();
  ui.updateStatic();
}, 10000);

// Лес сам меняет мелодию каждые несколько минут
setInterval(() => {
  if (ui.startNode) return;
  if (audio.shouldAdvance()) {
    audio.nextRandom();
    setTimeout(() => {
      ui.updateTrackChip();
      if (!audio._switching) ui.toast(`Лес меняет мелодию: ${audio.track.title}`);
    }, 1400);
  }
}, 20000);

window.addEventListener('beforeunload', () => {
  state.lastRate = game.ratePerMinute() || state.lastRate;
  flushSave();
});

// стартовые подсказки о прогрессе
setTimeout(() => {
  if (discoveredCount() === 0) {
    document.getElementById('field-hint').textContent = 'Тапай по норам: оттуда выглядывают бурундуки';
  }
}, 2000);

// ─────────── PWA ───────────
// Service worker нужен только в браузере; в нативной оболочке файлы уже локальные.
if ('serviceWorker' in navigator && !isNative()) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

// экспорт для отладки в консоли
window.SBG = { game, ui, state, audio, getStats, SQUIRRELS, formatCoins };
