// Игровой движок поляны: норы, спавн, удары, эффекты, усиления.
import { getStats, invalidateStats, state, addCoins, discover, discoveredCount } from './state.js';
import { rollSquirrel, RARITIES, SQUIRREL_BY_ID } from './data/squirrels.js';
import { FIELD_SIZES } from './data/skills.js';
import { squirrelSVG, acornSVG, chestSVG } from './art.js';
import { audio } from './audio.js';
import { formatCoins } from './utils.js';

const BASE_HIT = 2;
const BASE_SPAWN = 1250;
const BASE_STAY = 2500;
const COMBO_TIMEOUT = 3800;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => a + Math.random() * (b - a);

export class Game {
  constructor() {
    this.field = null;
    this.fxLayer = null;
    this.holes = [];
    this.active = new Set();
    this.stats = getStats();
    this.combo = 0;
    this.comboAt = 0;
    this.hitsSinceShock = 0;
    this.spawnTimer = 700;
    this.autoCharge = 0;
    this.festivalTimer = 0;
    this.buffs = { rage: 0, haste: 0, lucky: 0, festival: 0, slow: 0 };
    this.rageShown = false;
    this.festivalShown = false;
    this.pendingAuto = [];
    this.rateWindow = [];
    this.lastFrame = 0;
    this.running = false;
    this.raf = 0;
    this.listeners = {};
    this.cols = 3;
    this.rows = 3;
    this.hitFlash = 0;
    this.lastStrikeAt = 0;
    this.tipIndex = 0;
    this.sessionCoins = 0;
    this.autoFlash = 0;
  }

  // ─────────── жизненный цикл ───────────
  mount(fieldEl, fxLayerEl) {
    this.field = fieldEl;
    this.fxLayer = fxLayerEl;
    this.buildField();
    this.layout();
    window.addEventListener('resize', () => this.layout());
    if (window.ResizeObserver) {
      this._ro = new ResizeObserver(() => this.layout());
      this._ro.observe(this.field.parentElement);
    }
    this.onSwingHook = null;
    this.onBlockedHook = null;
    this.field.addEventListener('pointerdown', (e) => this.onPointerDown(e));
  }

  on(evt, fn) {
    (this.listeners[evt] = this.listeners[evt] || []).push(fn);
  }

  emit(evt, data) {
    const arr = this.listeners[evt];
    if (arr) arr.forEach((f) => f(data));
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastFrame = performance.now();
    this.spawnTimer = Math.min(this.spawnTimer, 600);
    const loop = (t) => {
      if (!this.running) return;
      const dt = Math.min(120, Math.max(0, t - this.lastFrame));
      this.lastFrame = t;
      this.update(dt);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  buildField() {
    const stats = getStats();
    const size = FIELD_SIZES[clamp(stats.fieldLevel, 0, FIELD_SIZES.length - 1)];
    this.cols = size.cols;
    this.rows = size.rows;
    const total = size.cols * size.rows;
    this.active.clear();
    this.holes = [];
    this.field.innerHTML = '';
    this.field.style.setProperty('--cols', size.cols);
    this.field.style.setProperty('--rows', size.rows);
    this.field.querySelectorAll?.('.hole').forEach((el) => el.remove());
    for (let i = 0; i < total; i++) {
      const el = document.createElement('div');
      el.className = 'hole';
      el.dataset.idx = String(i);
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '-1');
      el.setAttribute('aria-label', `Нора ${i + 1}`);
      el.innerHTML = `
        <div class="pit"></div>
        <div class="sq-slot"></div>
        <div class="lip"></div>
        <div class="hole-timer"><i></i></div>
        <div class="moss"></div>`;
      this.field.appendChild(el);
      this.holes.push({
        el,
        idx: i,
        slot: el.querySelector('.sq-slot'),
        timer: el.querySelector('.hole-timer i'),
        occ: null,
      });
    }
    this.layout();
  }

  layout() {
    if (!this.field || !this.field.parentElement) return;
    const wrap = this.field.parentElement;
    const availW = Math.max(140, wrap.clientWidth - 2);
    const availH = Math.max(140, wrap.clientHeight - 2);
    const ratio = this.cols / this.rows;
    let w = Math.min(availW, 560);
    let h = w / ratio;
    if (h > availH) { h = availH; w = h * ratio; }
    this.field.style.width = `${Math.round(w)}px`;
    this.field.style.height = `${Math.round(h)}px`;
  }

  refreshFromStats() {
    invalidateStats();
    this.stats = getStats();
    const expected = FIELD_SIZES[clamp(this.stats.fieldLevel, 0, FIELD_SIZES.length - 1)];
    if (expected.cols !== this.cols || expected.rows !== this.rows) {
      this.buildField();
      this.emit('fieldRebuilt');
    }
    this.festivalTimer = Math.min(this.festivalTimer, this.stats.festivalEvery || 0);
  }

  // ─────────── усиления ───────────
  isBuff(name) {
    return performance.now() < (this.buffs[name] || 0);
  }

  addBuff(name, seconds) {
    const until = performance.now() + seconds * 1000;
    this.buffs[name] = Math.max(this.buffs[name] || 0, until);
    if (name === 'rage' && !this.rageShown) {
      this.rageShown = true;
      document.getElementById('app')?.classList.add('is-rage');
      audio.playSfx('rage');
      this.emit('buffStart', { name });
    }
    if (name === 'festival' && !this.festivalShown) {
      this.festivalShown = true;
      document.getElementById('app')?.classList.add('is-festival');
      audio.playSfx('festival');
      this.fxBanner('Лесной праздник! ×2 монеты');
    }
    if (name === 'lucky') this.emit('tip', 'Прозрение: редкие бурундуки спешат к тебе');
    if (name === 'slow') audio.playSfx('freeze');
    if (name === 'haste') audio.playSfx('buy');
    this.emit('buffUpdate');
  }

  buffRemain(name) {
    return Math.max(0, ((this.buffs[name] || 0) - performance.now()) / 1000);
  }

  cooldown() {
    let cd = this.stats.cooldown;
    if (this.isBuff('rage')) cd *= 0.55;
    if (this.isBuff('haste')) cd *= 0.6;
    return Math.max(60, cd);
  }

  luck() {
    return this.stats.rareBoost + (this.isBuff('lucky') ? 0.85 : 0);
  }

  // ─────────── спавн ───────────
  activeCount() {
    let n = 0;
    this.active.forEach((h) => { if (h.occ) n++; });
    return n;
  }

  maxActive() {
    const holes = this.holes.length;
    let max = 2 + Math.floor((holes - 9) / 4);
    max += Math.floor(Math.min(2, state.totalEarned / 150000));
    return clamp(max, 2, 7);
  }

  progressFactor() {
    // Мягкое ускорение темпа по мере прогресса
    return 1 - Math.min(0.38, state.totalEarned / 600000);
  }

  spawnDelay() {
    const base = BASE_SPAWN * this.progressFactor() / Math.max(0.4, this.stats.spawnRate);
    return clamp(rand(base * 0.78, base * 1.24), 260, 4000);
  }

  freeHoles() {
    return this.holes.filter((h) => !h.occ);
  }

  spawnOne(forceSpecies) {
    const free = this.freeHoles();
    if (!free.length) return false;
    const hole = free[Math.floor(Math.random() * free.length)];
    const roll = Math.random();
    let occ;
    if (forceSpecies) {
      occ = { kind: 'squirrel', species: forceSpecies };
    } else if (roll < this.stats.treasureChance) {
      occ = { kind: 'chest' };
    } else if (roll < this.stats.treasureChance + this.stats.acornChance) {
      occ = { kind: 'acorn' };
    } else {
      const species = rollSquirrel({
        luck: this.luck(),
        epic: this.stats.epicBoost,
        legend: this.stats.legendBoost,
      });
      occ = { kind: 'squirrel', species };
    }
    this.riseIn(hole, occ);
    return occ;
  }

  riseIn(hole, occ) {
    const now = performance.now();
    const stats = this.stats;
    let duration;
    if (occ.kind === 'squirrel') {
      duration = BASE_STAY * occ.species.stay * stats.stayTime;
      duration *= 1 - Math.min(0.3, state.totalEarned / 1500000);
      if (this.isBuff('slow')) duration *= 1.9;
      duration = Math.max(950, duration);
    } else {
      duration = occ.kind === 'chest' ? BASE_STAY * 1.25 : BASE_STAY * 1.05;
    }
    occ.born = now;
    occ.duration = duration;
    hole.occ = occ;
    this.active.add(hole);

    let html;
    if (occ.kind === 'squirrel') {
      html = `<div class="sq">${squirrelSVG(occ.species)}</div>`;
      hole.el.classList.remove('is-chest', 'is-acorn');
      hole.el.setAttribute('aria-label', `${occ.species.name} выглянул из норы`);
    } else if (occ.kind === 'chest') {
      html = `<div class="treasure-item">${chestSVG()}</div>`;
      hole.el.classList.remove('is-acorn');
      hole.el.classList.add('is-chest');
      hole.el.setAttribute('aria-label', 'Сундук с монетами');
    } else {
      html = `<div class="treasure-item">${acornSVG()}</div>`;
      hole.el.classList.remove('is-chest');
      hole.el.classList.add('is-acorn');
      hole.el.setAttribute('aria-label', 'Золотой жёлудь');
    }
    hole.slot.innerHTML = html;
    hole.el.classList.remove('is-hit');
    hole.hitToken = (hole.hitToken || 0) + 1;
    void hole.el.offsetWidth;
    hole.el.classList.add('is-up');
    audio.playSfx('acorn');

    // Мгновенный авто-удар
    if (occ.kind === 'squirrel' && stats.autoUnlocked && Math.random() < stats.autoFirstChance) {
      this.scheduleAuto(hole, 180, 'auto');
    }
    // Приманка на редких
    if (occ.kind === 'squirrel' && RARITIES[occ.species.rarity].tier >= 2 && stats.baitChance > 0) {
      if (Math.random() < stats.baitChance) {
        setTimeout(() => {
          if (!this.running) return;
          const sp = rollSquirrel({ luck: this.luck() + 0.5, epic: this.stats.epicBoost, legend: this.stats.legendBoost });
          this.spawnOne(sp);
        }, 500);
      }
    }
    this.emit('spawn', occ);
  }

  scheduleAuto(hole, delay, source) {
    this.pendingAuto.push({ hole, at: performance.now() + delay, source });
  }

  // ─────────── удары ───────────
  onPointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    const rect = this.field.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    const hole = this.findHoleAt(x, y, rect);
    this.tryPlayerStrike(hole, x, y);
  }

  // Удар игрока с учётом отката. Возвращает true, если удар прошёл.
  tryPlayerStrike(hole, x, y) {
    const now = performance.now();
    if (now - this.lastStrikeAt < this.cooldown()) {
      if (this.onBlockedHook) this.onBlockedHook();
      return false;
    }
    this.lastStrikeAt = now;
    if (!hole || !hole.occ) {
      this.miss(hole, { x, y });
      return true;
    }
    this.strike(hole, { x, y, source: 'player' });
    return true;
  }

  findHoleAt(x, y, fieldRect) {
    const fr = fieldRect || this.field.getBoundingClientRect();
    if (x < fr.left - 30 || x > fr.right + 30 || y < fr.top - 30 || y > fr.bottom + 30) return null;
    let best = null;
    let bestScore = Infinity;
    const pad = this.stats.hitRadius;
    for (const h of this.holes) {
      const r = h.el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const rx = r.width / 2 + pad * 0.6;
      const ry = r.height / 2 + pad * 0.6;
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 1.18 && d < bestScore) { bestScore = d; best = h; }
    }
    return best;
  }

  strike(hole, opts = {}) {
    const now = performance.now();
    if (!hole || !hole.occ) {
      if (opts.source === 'player') this.miss(hole, opts);
      return;
    }
    const occ = hole.occ;
    const source = opts.source || 'player';
    const rect = hole.el.getBoundingClientRect();
    const cx = opts.x ?? rect.left + rect.width / 2;
    const cy = opts.y ?? rect.top + rect.height * 0.42;

    if (occ.kind === 'chest' || occ.kind === 'acorn') {
      this.collectBonus(hole, cx, cy, source);
      return;
    }

    const species = occ.species;
    const age = now - occ.born;
    const quick = age < 800 && source === 'player';
    let crit = Math.random() < (source === 'auto' ? this.stats.autoCritChance : this.stats.critChance);
    let reward = this.computeReward(species, { crit, quick, source });
    const rar = RARITIES[species.rarity];

    this.removeOccupant(hole, true);
    if (source === 'player') {
      this.combo += 1;
      this.comboAt = now;
      this.hitsSinceShock += 1;
      state.hits += 1;
      state.bestCombo = Math.max(state.bestCombo, this.combo);
    }

    const disc = discover(species.id);
    if (disc.isNew) {
      audio.playSfx('new');
      this.fxNew('Новый вид!', cx, cy);
      this.emit('newSpecies', species);
    } else if (disc.count === 5 || disc.count === 15 || disc.count === 30 || disc.count === 60) {
      this.fxBanner(`${species.name}: пойман ${disc.count} раз`);
    }

    this.pay(reward, cx, cy, { crit, rar, source });
    this.impact(cx, cy, crit, rar);
    audio.playSfx(source === 'auto' ? 'hit' : (crit ? 'crit' : 'hit'));
    audio.playSfx('coin', { pitch: 1 + Math.min(0.6, this.combo * 0.02) });
    this.vibrate(crit ? 22 : 12);

    // Эффекты вида
    this.applySpeciesEffect(species, cx, cy);

    // Дополнительные удары
    if (source !== 'splash') {
      if (Math.random() < this.stats.doubleHitChance) {
        const extra = Math.round(reward * 0.8);
        addCoins(extra);
        this.sessionCoins += extra;
        this.fxCoins(cx + rand(-18, 18), cy - 14, extra, false);
        this.bumpEarn(extra);
      }
      if (Math.random() < this.stats.echoChance) {
        setTimeout(() => {
          if (!this.running) return;
          const extra = Math.round(reward * 0.6);
          addCoins(extra);
          this.sessionCoins += extra;
          this.fxCoins(cx + rand(-20, 20), cy - 26, extra, false);
          this.bumpEarn(extra);
          audio.playSfx('coin', { pitch: 1.25 });
        }, 160);
      }
      if (Math.random() < this.stats.splashChance) this.splash(hole, cx, cy);
    }

    // Землетрясение
    if (this.stats.shockwaveEvery > 0 && this.hitsSinceShock >= this.stats.shockwaveEvery) {
      this.hitsSinceShock = 0;
      setTimeout(() => this.strikeAll(), 120);
      this.fxBanner('Землетрясение!');
    }

    this.emit('reward', { reward, species, crit });
    this.emit('hudDirty');
  }

  computeReward(species, { crit, quick, source }) {
    const s = this.stats;
    let coins = BASE_HIT * s.earn * species.coins;
    coins *= 1 + s.goldenHammer + (s.master - 1);
    if (species.deco === 'shine' || species.id === 'golden') coins *= 1 + s.goldBonus;
    coins *= 1 + s.collectionBonus * discoveredCount();
    coins *= 1 + s.fieldBonus * Math.max(0, this.holes.length - 9);
    coins *= 1 + this.comboMult();
    if (this.isBuff('rage')) coins *= 1.5 + s.ragePower;
    if (this.isBuff('festival')) coins *= s.festivalMult;
    if (quick) coins *= 1 + s.quickBonus;
    if (crit) coins *= s.critMult;
    if (Math.random() < s.doubleRewardChance) coins *= 2;
    if (source === 'auto') coins *= s.autoPower;
    if (source === 'splash') coins *= 0.7;
    return Math.max(1, Math.round(coins));
  }

  comboMult() {
    return Math.min(this.combo * this.stats.comboStep, this.stats.comboCap);
  }

  currentMultiplier() {
    const s = this.stats;
    let m = s.earn * (1 + s.goldenHammer + (s.master - 1));
    m *= 1 + this.comboMult();
    m *= 1 + s.collectionBonus * discoveredCount();
    m *= 1 + s.fieldBonus * Math.max(0, this.holes.length - 9);
    if (this.isBuff('rage')) m *= 1.5 + s.ragePower;
    if (this.isBuff('festival')) m *= s.festivalMult;
    return m;
  }

  multiplierLabel() {
    if (this.isBuff('festival')) return 'праздник';
    if (this.isBuff('rage')) return 'ярость';
    if (this.combo > 3) return 'серия';
    if (this.isBuff('haste')) return 'ускорение';
    return 'базовый';
  }

  applySpeciesEffect(species, cx, cy) {
    const e = species.effect;
    if (!e) return;
    const s = this.stats;
    if (e.rage) {
      this.addBuff('rage', e.rage + Math.max(0, s.rageDur - 10));
    }
    if (e.buff === 'lucky') this.addBuff('lucky', e.buffTime || 20);
    if (e.buff === 'haste') this.addBuff('haste', e.buffTime || 15);
    if (e.buff === 'slow') this.addBuff('slow', e.buffTime || 8);
    if (e.buff === 'festival') this.addBuff('festival', e.buffTime || 12);
    if (e.buff === 'allbuffs') {
      const d = e.buffTime || 15;
      this.addBuff('rage', d + Math.max(0, s.rageDur - 10));
      this.addBuff('lucky', d);
      this.addBuff('haste', d);
      this.addBuff('festival', d);
    }
    if (e.flat) {
      const flat = Math.round(e.flat * s.earn * (1 + s.goldenHammer));
      addCoins(flat);
      this.sessionCoins += flat;
      this.fxCoins(cx + 24, cy - 20, flat, false);
      this.bumpEarn(flat);
    }
    if (e.shockwave) {
      this.fxBanner('Ударная волна!');
      setTimeout(() => this.strikeAll(), 180);
    }
    if (e.barrage) {
      for (let i = 0; i < e.barrage; i++) {
        const free = this.holes.filter((h) => h.occ && h.occ.kind === 'squirrel');
        if (!free.length) break;
        const target = free[Math.floor(Math.random() * free.length)];
        this.scheduleAuto(target, 220 + i * 190, 'auto');
      }
    }
  }

  splash(fromHole, cx, cy) {
    const r = this.holes[fromHole.idx];
    if (!r) return;
    const c = fromHole.idx % this.cols;
    const row = Math.floor(fromHole.idx / this.cols);
    const neighbors = [];
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nc = c + dx;
      const nr = row + dy;
      if (nc < 0 || nc >= this.cols || nr < 0 || nr >= this.rows) continue;
      const h = this.holes[nr * this.cols + nc];
      if (h && h.occ) neighbors.push(h);
    }
    if (!neighbors.length) return;
    const target = neighbors[Math.floor(Math.random() * neighbors.length)];
    setTimeout(() => {
      if (this.running && target.occ) this.strike(target, { source: 'splash' });
    }, 90);
  }

  strikeAll() {
    const targets = this.holes.filter((h) => h.occ);
    if (!targets.length) return;
    targets.forEach((h, i) => {
      setTimeout(() => {
        if (this.running && h.occ) this.strike(h, { source: 'shock' });
      }, i * 55);
    });
    this.shake(10);
  }

  autoStrike() {
    const s = this.stats;
    const targets = this.holes.filter((h) => h.occ && h.occ.kind !== 'acorn');
    if (!targets.length) return false;
    const target = targets[Math.floor(Math.random() * targets.length)];
    this.autoFlash = performance.now();
    this.strike(target, { source: 'auto' });
    if (Math.random() < s.autoChainChance) {
      setTimeout(() => {
        if (!this.running) return;
        const t2 = this.holes.filter((h) => h.occ);
        if (t2.length) this.strike(t2[Math.floor(Math.random() * t2.length)], { source: 'auto' });
      }, 240);
    }
    if (Math.random() < s.autoDoubleChance) {
      const other = targets.filter((h) => h !== target && h.occ);
      if (other.length) {
        const t2 = other[Math.floor(Math.random() * other.length)];
        this.scheduleAuto(t2, 170, 'auto');
      }
    }
    if (Math.random() < s.autoRageChance) this.addBuff('rage', s.rageDur);
    return true;
  }

  collectBonus(hole, cx, cy, source) {
    const occ = hole.occ;
    const s = this.stats;
    let amount;
    if (occ.kind === 'chest') {
      amount = Math.round((26 + this.holes.length * 4) * s.earn * (1 + s.goldenHammer) * (1 + this.comboMult()));
      if (this.isBuff('festival')) amount *= s.festivalMult;
      audio.playSfx('chest');
      this.fxBanner('Клад!');
    } else {
      amount = Math.round((8 + this.holes.length * 1.5) * s.earn * (1 + s.goldenHammer));
      if (this.isBuff('festival')) amount *= s.festivalMult;
      audio.playSfx('acorn');
    }
    this.removeOccupant(hole, true);
    addCoins(amount);
    this.sessionCoins += amount;
    this.fxCoins(cx, cy, amount, false);
    this.bumpEarn(amount);
    this.impact(cx, cy, false, RARITIES.rare);
    this.vibrate(10);
    if (source === 'player') state.hits += 1;
    this.emit('hudDirty');
  }

  removeOccupant(hole, hit) {
    if (!hole.occ) return;
    const el = hole.el;
    hole.hitToken = (hole.hitToken || 0) + 1;
    const token = hole.hitToken;
    if (hit) {
      el.classList.add('is-hit');
      setTimeout(() => {
        if (hole.hitToken !== token || hole.occ) return;
        el.classList.remove('is-up', 'is-hit', 'is-chest', 'is-acorn');
        hole.slot.innerHTML = '';
        el.setAttribute('aria-label', `Нора ${hole.idx + 1}`);
      }, 330);
    } else {
      el.classList.remove('is-up', 'is-chest', 'is-acorn');
      hole.slot.innerHTML = '';
      el.setAttribute('aria-label', `Нора ${hole.idx + 1}`);
    }
    hole.occ = null;
    this.active.delete(hole);
  }

  miss(hole, opts) {
    state.misses += 1;
    if (!this.stats.missSafe) {
      this.combo = 0;
    }
    const rect = hole ? hole.el.getBoundingClientRect() : null;
    const x = opts?.x ?? (rect ? rect.left + rect.width / 2 : 0);
    const y = opts?.y ?? (rect ? rect.top + rect.height / 2 : 0);
    if (Math.random() < this.stats.insuranceChance) {
      const amount = Math.max(1, Math.round(1.5 * this.stats.earn * (1 + this.stats.goldenHammer)));
      addCoins(amount);
      this.sessionCoins += amount;
      this.fxCoins(x, y, amount, false);
      this.bumpEarn(amount);
      audio.playSfx('coin', { pitch: 0.9 });
    } else {
      audio.playSfx('swing');
    }
    this.emit('hudDirty');
    this.emit('miss');
  }

  pay(amount, x, y, { crit, rar, source }) {
    addCoins(amount);
    this.sessionCoins += amount;
    this.fxCoins(x, y, amount, crit);
    this.bumpEarn(amount);
    if (crit) this.shake(7);
    if (rar && rar.tier >= 4) this.fxBanner(`${rar.label} · ${amount} монет`);
  }

  bumpEarn(amount) {
    const now = performance.now();
    this.rateWindow.push({ t: now, c: amount });
    if (this.rateWindow.length > 400) this.rateWindow.splice(0, this.rateWindow.length - 400);
  }

  ratePerMinute() {
    const now = performance.now();
    const windowMs = 60000;
    let sum = 0;
    while (this.rateWindow.length && now - this.rateWindow[0].t > windowMs) this.rateWindow.shift();
    for (const e of this.rateWindow) sum += e.c;
    const elapsed = Math.min(windowMs, Math.max(8000, now - (this.startedAt || now)));
    return Math.round((sum / elapsed) * 60000);
  }

  // ─────────── обновление ───────────
  update(dt) {
    const now = performance.now();
    if (!this.startedAt) this.startedAt = now;
    this.stats = getStats();
    state.playTime += dt;
    this.updateRateSave(now);
    this.updateBuffs(now);
    this.updateSpawns(dt, now);
    this.updateAuto(dt, now);
    this.updateExpiry(now);
    this.updateTimers(now);
    this.updatePendingAuto(now);
    this.updateFestival(dt, now);
    this.updateCombo(now);
  }

  updateRateSave(now) {
    if (now - (this._lastRateSave || 0) > 5000) {
      this._lastRateSave = now;
      state.lastRate = this.ratePerMinute();
      this.emit('rateUpdate', state.lastRate);
    }
  }

  updateBuffs(now) {
    let changed = false;
    for (const k of Object.keys(this.buffs)) {
      if (this.buffs[k] && now > this.buffs[k]) {
        this.buffs[k] = 0;
        changed = true;
        if (k === 'rage') {
          this.rageShown = false;
          document.getElementById('app')?.classList.remove('is-rage');
        }
        if (k === 'festival') {
          this.festivalShown = false;
          document.getElementById('app')?.classList.remove('is-festival');
        }
      }
    }
    if (changed) this.emit('buffUpdate');
    this.emit('buffTick');
  }

  updateSpawns(dt, now) {
    this.spawnTimer -= dt;
    if (this.spawnTimer > 0) return;
    if (this.activeCount() >= this.maxActive()) {
      this.spawnTimer = 220;
      return;
    }
    this.spawnOne();
    if (Math.random() < this.stats.doubleSpawnChance) this.spawnOne();
    this.spawnTimer = this.spawnDelay();
    void now;
  }

  updateAuto(dt, now) {
    const s = this.stats;
    if (!s.autoUnlocked) {
      this.autoCharge = 0;
      return;
    }
    const interval = s.autoInterval * 1000 * (this.isBuff('haste') ? 0.7 : 1) * (this.isBuff('rage') ? 0.85 : 1);
    this.autoCharge += dt;
    if (this.autoCharge >= interval) {
      const hitAny = this.autoStrike();
      if (hitAny) this.autoCharge = 0;
      else this.autoCharge = interval * 0.9;
    }
    this.autoIntervalMs = interval;
    this.autoReadyPct = clamp(this.autoCharge / interval, 0, 1);
    void now;
  }

  updateExpiry(now) {
    for (const hole of this.holes) {
      if (hole.occ && now - hole.occ.born > hole.occ.duration) {
        this.removeOccupant(hole, false);
        this.emit('expire', hole);
      }
    }
  }

  updateTimers(now) {
    for (const hole of this.holes) {
      if (!hole.occ) continue;
      const left = 1 - (now - hole.occ.born) / hole.occ.duration;
      if (hole.timer) hole.timer.style.transform = `scaleX(${clamp(left, 0, 1)})`;
    }
  }

  updatePendingAuto(now) {
    if (!this.pendingAuto.length) return;
    const due = this.pendingAuto.filter((p) => p.at <= now);
    if (!due.length) return;
    this.pendingAuto = this.pendingAuto.filter((p) => p.at > now);
    due.forEach((p) => {
      if (p.hole.occ) this.strike(p.hole, { source: p.source || 'auto' });
    });
  }

  updateFestival(dt, now) {
    const every = this.stats.festivalEvery;
    if (!every) return;
    this.festivalTimer += dt;
    if (this.festivalTimer >= every * 1000) {
      this.festivalTimer = 0;
      this.addBuff('festival', this.stats.festivalDur);
    }
    void now;
  }

  updateCombo(now) {
    if (this.combo > 0 && now - this.comboAt > COMBO_TIMEOUT) {
      this.combo = 0;
      this.emit('hudDirty');
    }
  }

  // ─────────── визуальные эффекты ───────────
  fxCoins(x, y, amount, crit) {
    if (!this.fxLayer) return;
    if (this.fxLayer.childElementCount > 46) this.fxLayer.firstElementChild?.remove();
    const el = document.createElement('div');
    el.className = `fx-coin${crit ? ' crit' : ''}`;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.innerHTML = `<span class="mini-coin"></span>+${formatCoins(amount)}`;
    this.fxLayer.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }

  impact(x, y, crit, rar) {
    if (!this.fxLayer) return;
    const ripple = document.createElement('div');
    ripple.className = 'fx-ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    if (rar && rar.tier >= 3) ripple.style.borderColor = rar.color;
    this.fxLayer.appendChild(ripple);
    setTimeout(() => ripple.remove(), 520);
    const n = crit ? 10 : 6;
    for (let i = 0; i < n; i++) {
      const s = document.createElement('div');
      s.className = 'fx-spark';
      s.style.left = `${x}px`;
      s.style.top = `${y}px`;
      const a = Math.random() * Math.PI * 2;
      const d = 28 + Math.random() * 42;
      s.style.setProperty('--dx', `${Math.cos(a) * d}px`);
      s.style.setProperty('--dy', `${Math.sin(a) * d}px`);
      if (crit) s.style.background = 'radial-gradient(circle,#fff,#ffb056)';
      this.fxLayer.appendChild(s);
      setTimeout(() => s.remove(), 660);
    }
    const stars = crit ? 4 : 2;
    for (let i = 0; i < stars; i++) {
      const st = document.createElement('div');
      st.className = 'fx-star';
      st.style.left = `${x + rand(-16, 16)}px`;
      st.style.top = `${y + rand(-10, 10)}px`;
      st.style.color = crit ? '#ffe9a8' : (rar?.color || '#fff2c4');
      st.style.setProperty('--dx', `${rand(-30, 30)}px`);
      st.style.setProperty('--dy', `${rand(-40, -14)}px`);
      this.fxLayer.appendChild(st);
      setTimeout(() => st.remove(), 640);
    }
  }

  fxBanner(text) {
    if (!this.fxLayer) return;
    const el = document.createElement('div');
    el.className = 'fx-banner';
    el.textContent = text;
    this.fxLayer.appendChild(el);
    setTimeout(() => el.remove(), 1550);
  }

  fxNew(text, x, y) {
    if (!this.fxLayer) return;
    const el = document.createElement('div');
    el.className = 'fx-new';
    el.textContent = text;
    el.style.left = `${x}px`;
    el.style.top = `${Math.max(60, y - 56)}px`;
    this.fxLayer.appendChild(el);
    setTimeout(() => el.remove(), 1850);
  }

  shake(power = 6) {
    const app = document.getElementById('app');
    if (!app) return;
    app.style.setProperty('--shake', `${power}px`);
    app.classList.remove('screen-shake');
    void app.offsetWidth;
    app.classList.add('screen-shake');
    clearTimeout(this._shakeT);
    this._shakeT = setTimeout(() => app.classList.remove('screen-shake'), 260);
  }

  vibrate(ms) {
    if (state.settings?.haptics === false) return;
    if (navigator.vibrate) { try { navigator.vibrate(ms); } catch (e) { /* noop */ } }
  }
}

export { formatCoins };
export { SQUIRREL_BY_ID };
