/* ============================================================
   Хранилище прогресса.

   В браузере — localStorage (как раньше).
   В нативном приложении (Tauri) — файл save.json в приватной папке
   приложения: <AppData>/<identifier>/save.json. Это переживает очистку
   кэша WebView и системное «вытеснение» localStorage на iOS.

   Стратегия: localStorage остаётся быстрым рабочим буфером, нативный
   файл — долговременный мастер-сейв. При старте hydrate() копирует
   файл → localStorage (если файл новее/есть), при сохранении mirror()
   асинхронно пишет тот же JSON в файл.
   ============================================================ */

const MIRROR_DELAY = 400;
let mirrorTimer = null;
let lastMirrored = '';

function tauriInvoke() {
  const t = window.__TAURI__;
  if (!t) return null;
  if (t.core && typeof t.core.invoke === 'function') return t.core.invoke;
  if (typeof t.invoke === 'function') return t.invoke;
  return null;
}

export function isNative() {
  return !!tauriInvoke();
}

/**
 * Платформа без IPC и без промисов: определяется по user-agent WebView.
 * Возвращает 'windows' | 'macos' | 'linux' | 'android' | 'ios' | 'web'.
 */
export function platform() {
  if (!isNative()) return 'web';
  const ua = (navigator.userAgent || '').toLowerCase();
  if (/android/.test(ua)) return 'android';
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/windows/.test(ua)) return 'windows';
  if (/macintosh|mac os x/.test(ua)) return 'macos';
  if (/linux|x11/.test(ua)) return 'linux';
  return 'native';
}

function readLocal(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}

function writeLocal(key, value) {
  try { localStorage.setItem(key, value); } catch (e) { /* место кончилось */ }
}

/**
 * Подтягивает сейв из нативного файла в localStorage.
 * Вызывать ОДИН раз до state.load().
 * @returns {Promise<{hydrated:boolean, source:'native'|'local'|'none'}>}
 */
export async function hydrateFromNative(key) {
  const invoke = tauriInvoke();
  if (!invoke) return { hydrated: false, source: readLocal(key) ? 'local' : 'none' };
  try {
    const data = await invoke('load_game');
    if (typeof data === 'string' && data.length > 2) {
      writeLocal(key, data);
      lastMirrored = data;
      return { hydrated: true, source: 'native' };
    }
  } catch (e) {
    /* первый запуск или нет прав — работаем на localStorage */
  }
  return { hydrated: false, source: readLocal(key) ? 'local' : 'none' };
}

/**
 * Асинхронно дублирует сейв в нативный файл (с дебаунсом).
 */
export function mirrorToNative(json, immediate = false) {
  const invoke = tauriInvoke();
  if (!invoke || typeof json !== 'string' || json === lastMirrored) return;
  if (immediate) {
    if (mirrorTimer) { clearTimeout(mirrorTimer); mirrorTimer = null; }
    lastMirrored = json;
    invoke('save_game', { data: json }).catch(() => { lastMirrored = ''; });
    return;
  }
  if (mirrorTimer) clearTimeout(mirrorTimer);
  mirrorTimer = setTimeout(() => {
    mirrorTimer = null;
    lastMirrored = json;
    invoke('save_game', { data: json }).catch(() => { lastMirrored = ''; });
  }, MIRROR_DELAY);
}

/** Сброс: удаляем и файл, и localStorage. */
export async function clearNative() {
  const invoke = tauriInvoke();
  lastMirrored = '';
  if (!invoke) return;
  try { await invoke('delete_game'); } catch (e) { /* noop */ }
}

/** Ручной экспорт сейва (для бэкапа между устройствами). */
export function exportSave(key) {
  const raw = readLocal(key);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    return { app: 'SquirrelBeatingGame', exportedAt: new Date().toISOString(), save: data };
  } catch (e) {
    return null;
  }
}

/** Импорт сейва из бэкапа. Возвращает true при успехе. */
export async function importSave(key, backup) {
  const data = backup && backup.save ? backup.save : backup;
  if (!data || typeof data !== 'object' || !('coins' in data)) return false;
  const json = JSON.stringify(data);
  writeLocal(key, json);
  mirrorToNative(json, true);
  return true;
}
