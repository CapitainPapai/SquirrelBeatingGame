// Состояние игры, сохранение и логика прокачки.
import { SKILLS, SKILL_BY_ID, skillCost, computeStats } from './data/skills.js';
import { SQUIRREL_BY_ID } from './data/squirrels.js';
import { mirrorToNative, clearNative } from './storage.js';

const SAVE_KEY = 'sbg_save_v1';
export const SAVE_STORAGE_KEY = SAVE_KEY;
const MAX_OFFLINE_HOURS = 8;

function defaults() {
  return {
    version: 1,
    coins: 0,
    totalEarned: 0,
    hits: 0,
    misses: 0,
    bestCombo: 0,
    playTime: 0,
    levels: {},
    discovered: {},
    settings: { music: 0.62, sfx: 0.78, ambient: 0.5, audioEconomy: null },
    tutorialDone: false,
    createdAt: Date.now(),
    lastSeen: Date.now(),
    lastRate: 0,
    offlineReport: null,
    sessionHits: 0,
  };
}

export const state = defaults();

let statsCache = null;
let saveTimer = null;
let dirty = false;

export function load() {
  let saved = null;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) saved = JSON.parse(raw);
  } catch (e) {
    saved = null;
  }
  if (saved && typeof saved === 'object') {
    const d = defaults();
    Object.keys(d).forEach((k) => {
      if (saved[k] !== undefined) d[k] = saved[k];
    });
    d.levels = { ...(saved.levels || {}) };
    d.discovered = { ...(saved.discovered || {}) };
    d.settings = { ...defaults().settings, ...(saved.settings || {}) };
    Object.assign(state, d);
  }
  // защита от битых значений
  state.coins = Math.max(0, Number(state.coins) || 0);
  state.totalEarned = Math.max(0, Number(state.totalEarned) || 0);
  for (const key of Object.keys(state.levels)) {
    if (!SKILL_BY_ID[key]) delete state.levels[key];
    else state.levels[key] = Math.max(0, Math.min(SKILL_BY_ID[key].max, Number(state.levels[key]) || 0));
  }
  for (const key of Object.keys(state.discovered)) {
    if (!SQUIRREL_BY_ID[key]) delete state.discovered[key];
  }
  statsCache = null;
  return state;
}

export function save(immediate = false) {
  // Пока идёт импорт сейва, игру нельзя перезаписывать текущим состоянием.
  if (typeof window !== 'undefined' && window.__SAVE_LOCKED__) return;
  dirty = true;
  state.lastSeen = Date.now();
  if (immediate) {
    dirty = false;
    const json = JSON.stringify(state);
    try { localStorage.setItem(SAVE_KEY, json); } catch (e) { /* место кончилось */ }
    mirrorToNative(json);
    return;
  }
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    // Импорт сейва мог начаться уже после планирования таймера.
    if (typeof window !== 'undefined' && window.__SAVE_LOCKED__) return;
    if (!dirty) return;
    dirty = false;
    state.lastSeen = Date.now();
    const json = JSON.stringify(state);
    try { localStorage.setItem(SAVE_KEY, json); } catch (e) { /* noop */ }
    mirrorToNative(json);
  }, 1200);
}

export function flushSave() {
  if (typeof window !== 'undefined' && window.__SAVE_LOCKED__) return;
  if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
  const json = JSON.stringify(state);
  try { localStorage.setItem(SAVE_KEY, json); } catch (e) { /* noop */ }
  mirrorToNative(json);
}

export function resetProgress() {
  const settings = { ...state.settings };
  Object.assign(state, defaults(), { settings });
  statsCache = null;
  save(true);
  clearNative();
}

export function getStats() {
  if (!statsCache) statsCache = computeStats(state.levels);
  return statsCache;
}

export function invalidateStats() {
  statsCache = null;
}

export function levelOf(id) {
  return Math.min(state.levels[id] || 0, SKILL_BY_ID[id].max);
}

export function isLocked(skill) {
  if (!skill.locked) return null;
  if (skill.requiresAuto && !getStats().autoUnlocked) return 'Сначала купи «Дружелюбный молоток»';
  return skill.locked(getStats(), state.levels);
}

export function nextCost(skill) {
  const lvl = levelOf(skill.id);
  if (lvl >= skill.max) return null;
  return skillCost(skill, lvl);
}

export function canBuy(skill) {
  const lvl = levelOf(skill.id);
  if (lvl >= skill.max) return { ok: false, reason: 'max' };
  const lock = isLocked(skill);
  if (lock) return { ok: false, reason: 'locked', message: lock };
  const cost = skillCost(skill, lvl);
  if (state.coins < cost) return { ok: false, reason: 'coins', cost };
  return { ok: true, cost };
}

export function buy(skillId) {
  const skill = SKILL_BY_ID[skillId];
  if (!skill) return { ok: false };
  const res = canBuy(skill);
  if (!res.ok) return res;
  state.coins -= res.cost;
  state.levels[skillId] = levelOf(skillId) + 1;
  statsCache = null;
  save();
  return { ok: true, cost: res.cost, level: state.levels[skillId], skill };
}

export function unlockAll() {
  // используется отладочной кнопкой в настройках
  for (const s of SKILLS) state.levels[s.id] = s.max;
  statsCache = null;
  save(true);
}

export function addCoins(amount) {
  const v = Math.max(0, Math.round(amount));
  if (!v) return 0;
  state.coins += v;
  state.totalEarned += v;
  save();
  return v;
}

export function discover(id) {
  const type = SQUIRREL_BY_ID[id];
  if (!type) return { isNew: false, count: 0 };
  const prev = state.discovered[id] || 0;
  state.discovered[id] = prev + 1;
  save();
  return { isNew: prev === 0, count: prev + 1 };
}

export function discoveredCount() {
  return Object.keys(state.discovered).filter((k) => state.discovered[k] > 0).length;
}

// Офлайн-доход: считаем по средней скорости добычи за прошлую сессию.
export function applyOffline() {
  const stats = getStats();
  const elapsed = Math.max(0, Date.now() - (state.lastSeen || Date.now()));
  if (stats.offlineRate <= 0 || state.lastRate <= 0 || elapsed < 60000) {
    state.offlineReport = null;
    return null;
  }
  const cappedMs = Math.min(elapsed, MAX_OFFLINE_HOURS * 3600000);
  const minutes = cappedMs / 60000;
  const gained = Math.floor(minutes * state.lastRate * stats.offlineRate);
  if (gained <= 0) { state.offlineReport = null; return null; }
  state.coins += gained;
  state.totalEarned += gained;
  state.lastSeen = Date.now();
  const report = { coins: gained, minutes: Math.round(minutes) };
  state.offlineReport = report;
  save(true);
  return report;
}

export function clearOfflineReport() {
  state.offlineReport = null;
  save();
}

export { skillCost, SKILLS, SKILL_BY_ID };
