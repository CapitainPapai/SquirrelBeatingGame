// Интерфейс: HUD, магазин, энциклопедия, настройки, модальные окна.
import {
  state, getStats, levelOf, nextCost, canBuy, buy, isLocked,
  discoveredCount, save, resetProgress, SAVE_STORAGE_KEY as SAVE_KEY,
} from './state.js';
import { SKILLS, SKILL_BY_ID, CATEGORIES, FIELD_SIZES } from './data/skills.js';
import {
  SQUIRRELS, SQUIRREL_BY_ID, RARITIES, chanceOfSpecies,
} from './data/squirrels.js';
import { squirrelSVG, hammerSVG } from './art.js';
import { audio, TRACKS } from './audio.js';
import { formatCoins, formatPercent, formatDuration } from './utils.js';
import { isNative, exportSave, importSave, platform } from './storage.js';

const $ = (id) => document.getElementById(id);

const ICONS = {
  coin: '<circle cx="12" cy="12" r="8.2"/><path d="M12 7.6v8.8M9.4 10.2h5.2M9.4 13.8h5.2"/>',
  crit: '<circle cx="12" cy="12" r="6.6"/><circle cx="12" cy="12" r="2.2"/><path d="M12 2.4v2.8M12 18.8v2.8M2.4 12h2.8M18.8 12h2.8"/>',
  hammer: '<path d="M14.6 4.4l5 5-2.8 2.8-5-5z"/><path d="M11.9 7.1 4.2 15v4.8h4.8L16.7 12"/>',
  combo: '<path d="M4.5 20v-5M10 20V9.5M15.5 20V5.5M21 20v-8"/>',
  sparkle: '<path d="M11 3.5l1.7 4.9 4.9 1.7-4.9 1.7L11 16.7 9.3 11.8 4.4 10.1l4.9-1.7z"/><path d="M18 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
  star: '<path d="M12 3.4l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.6l5.9-.8z"/>',
  flame: '<path d="M12 21c3.9 0 6.8-2.9 6.8-6.7 0-3.9-2.8-5.9-3.9-8.8-1.9 1.9-2.8 3.8-2.8 4.9-.9-.9-1.8-1.9-1.8-3.9-2 2.9-5.1 4.9-5.1 7.8C5.2 18.1 8.1 21 12 21z"/>',
  clock: '<circle cx="12" cy="12" r="8.2"/><path d="M12 7.4v5l3.2 2"/>',
  acorn: '<path d="M6.4 9.4h11.2c0 5-2.4 9-5.6 11-3.2-2-5.6-6-5.6-11z"/><path d="M5 9.4c0-2.2 3.1-4 7-4s7 1.8 7 4z"/><path d="M12 5.4V3.2"/>',
  leaf: '<path d="M5 19c0-8.4 5.4-14.2 14-14.2 0 9-6 14.2-14 14.2z"/><path d="M5 19c3.2-4.2 6.4-6.4 9.6-7.4"/>',
  eye: '<path d="M2.4 12S6 6.2 12 6.2 21.6 12 21.6 12 18 17.8 12 17.8 2.4 12 2.4 12z"/><circle cx="12" cy="12" r="2.6"/>',
  bolt: '<path d="M13.4 2.6 4.6 14.2h5.6l-1 7.2 9-11.8h-5.6z"/>',
  shield: '<path d="M12 3l7.2 3v6c0 4.1-3 7.4-7.2 9-4.2-1.6-7.2-4.9-7.2-9V6z"/><path d="M9 12l2.2 2.2L15.4 10"/>',
  paw: '<circle cx="7.2" cy="9.4" r="1.9"/><circle cx="12" cy="7.2" r="1.9"/><circle cx="16.8" cy="9.4" r="1.9"/><path d="M12 12.4c-2.9 0-4.9 2.4-4.9 4.9 0 1.9 1.6 3 3.2 2.4 1.1-.4 2.3-.4 3.4 0 1.6.6 3.2-.5 3.2-2.4 0-2.5-2-4.9-4.9-4.9z"/>',
  auto: '<path d="M4.2 17.2a8 8 0 1 0 1.7-8.4"/><path d="M4 5.2V9.6h4.4"/><path d="M12 9v3.2l2.2 1.8"/>',
  grid: '<rect x="3.6" y="3.6" width="7" height="7" rx="1.6"/><rect x="13.4" y="3.6" width="7" height="7" rx="1.6"/><rect x="3.6" y="13.4" width="7" height="7" rx="1.6"/><rect x="13.4" y="13.4" width="7" height="7" rx="1.6"/>',
  moon: '<path d="M20.4 14.2A8.6 8.6 0 1 1 9.8 3.6a6.8 6.8 0 0 0 10.6 10.6z"/>',
  chest: '<rect x="3.4" y="8.4" width="17.2" height="11.6" rx="2"/><path d="M3.4 12.4h17.2M12 8.4v11.6"/><path d="M3.4 8.4 5.6 4h12.8l2.2 4.4"/>',
  bell: '<path d="M18 16.4V11a6 6 0 1 0-12 0v5.4L4.4 18.4h15.2z"/><path d="M10 21h4"/>',
  settings: '<circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a7.6 7.6 0 0 0 .1-6l-1.9.4-1.5-1.5.4-1.9a7.6 7.6 0 0 0-6 .1l.4 1.9L9 9.5l-1.9-.4a7.6 7.6 0 0 0-.1 6l1.9-.4 1.5 1.5-.4 1.9a7.6 7.6 0 0 0 6-.1l-.4-1.9 1.5-1.5z"/>',
  book: '<path d="M4 5.4c3-1.4 5.6-1.4 8 0v14c-2.4-1.4-5-1.4-8 0z"/><path d="M20 5.4c-3-1.4-5.6-1.4-8 0v14c2.4-1.4 5-1.4 8 0z"/>',
  lock: '<rect x="4.6" y="10.4" width="14.8" height="9.4" rx="2.4"/><path d="M8 10.4V8a4 4 0 0 1 8 0v2.4"/><circle cx="12" cy="15" r="1.3"/>',
  play: '<path d="M8 5.6v12.8L18 12z"/>',
  install: '<rect x="6" y="3" width="12" height="18" rx="2.4"/><path d="M10.4 17.6h3.2"/>',
};

export function icon(name, cls = '') {
  const body = ICONS[name] || ICONS.sparkle;
  return `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}

const EFFECT_TEXT = {
  rage: (v) => `Ярость ${v} с: бьёшь чаще и получаешь больше`,
  lucky: (v) => `Прозрение ${v} с: редкие бурундуки вылезают чаще`,
  haste: (v) => `Ускорение ${v} с: взмах быстрее`,
  slow: (v) => `Заморозка ${v} с: бурундуки задерживаются`,
  festival: (v) => `Праздник ${v} с: все монеты ×2`,
  allbuffs: (v) => `Все усиления на ${v} с`,
  shock: 'Ударная волна по всем норам',
  barrage: (v) => `Авто-молоток бьёт ещё ${v} раз`,
  flat: (v) => `Бонус +${v} монет сразу`,
};

function effectText(effect) {
  if (!effect) return '';
  const parts = [];
  if (effect.rage) parts.push(EFFECT_TEXT.rage(effect.rage));
  if (effect.buff) parts.push(EFFECT_TEXT[effect.buff](effect.buffTime));
  if (effect.shockwave) parts.push(EFFECT_TEXT.shock);
  if (effect.barrage) parts.push(EFFECT_TEXT.barrage(effect.barrage));
  if (effect.flat) parts.push(EFFECT_TEXT.flat(effect.flat));
  return parts.join(' · ');
}

class UI {
  constructor() {
    this.game = null;
    this.currentView = 'game';
    this.shopCat = 'earn';
    this.bookFilter = 'all';
    this.deferredPrompt = null;
    this.lastHud = {};
    this.hudTimer = 0;
    this.shopTimer = 0;
    this.tipTimer = 0;
    this.tips = [
      'Совет: попади быстрее — получишь бонус за реакцию',
      'Золотые бурундуки приносят гораздо больше монет',
      'Красный злой дарит ярость — бей чаще и больше',
      'Серия ударов повышает награду за каждого бурундука',
      'Волшебник даёт «Прозрение» — лови редких гостей',
      'Авто-молоток бьёт сам, даже когда ты в магазине',
      'Жёлуди и сундуки на поляне — это бесплатные монеты',
      'Каждый открытый вид бурундука даёт бонус к доходу',
    ];
  }

  init(game) {
    this.game = game;
    this.bind();
    this.renderShopCats();
    this.renderShop();
    this.renderBookFilters();
    this.renderBook();
    this.updateStatic();
    this.startLoop();
  }

  bind() {
    document.querySelectorAll('.tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        this.showView(tab.dataset.view);
        audio.playSfx('tab');
      });
    });

    $('btn-settings').addEventListener('click', () => this.openSettings());
    $('btn-next-track').addEventListener('click', () => {
      audio.nextTrack(1);
      setTimeout(() => this.updateTrackChip(), 420);
      this.toast('Переключаю мелодию…');
      setTimeout(() => this.updateTrackChip(), 1200);
    });
    $('track-chip').addEventListener('click', (e) => {
      if (e.target.closest('#btn-next-track')) return;
      this.openMusic();
    });

    $('shop-cats').addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      this.shopCat = chip.dataset.cat;
      this.renderShopCats();
      this.renderShop();
      document.querySelector('.shop-cats').scrollTo({ left: 0, behavior: 'smooth' });
      audio.playSfx('tab');
    });

    $('book-filters').addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      this.bookFilter = chip.dataset.rarity;
      this.renderBookFilters();
      this.renderBook();
      audio.playSfx('tab');
    });

    $('shop-list').addEventListener('click', (e) => {
      const btn = e.target.closest('.s-buy');
      if (!btn || btn.disabled) return;
      this.purchase(btn.dataset.skill);
    });

    $('book-grid').addEventListener('click', (e) => {
      const card = e.target.closest('.b-card');
      if (!card) return;
      this.openSpecies(card.dataset.species);
    });

    $('modal-root').addEventListener('click', (e) => {
      if (e.target.closest('.modal-backdrop') || e.target.closest('.modal-close')) {
        this.closeModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
    });

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) save(true);
    });
    window.addEventListener('pagehide', () => save(true));
  }

  // ─────────── экраны ───────────
  showView(name) {
    if (!['game', 'book', 'shop'].includes(name)) return;
    this.currentView = name;
    document.querySelectorAll('.view').forEach((v) => {
      v.classList.toggle('is-active', v.id === `view-${name}`);
    });
    document.querySelectorAll('.tab').forEach((t) => {
      const active = t.dataset.view === name;
      t.classList.toggle('is-active', active);
      if (active) t.setAttribute('aria-current', 'page');
      else t.removeAttribute('aria-current');
    });
    if (name === 'game' && this.game) setTimeout(() => this.game.layout(), 40);
    if (name === 'shop') { this.renderShop(); this.updateShopHeader(); }
    if (name === 'book') this.renderBook();
    $('modal-root').classList.remove('is-open');
  }

  startLoop() {
    const loop = () => {
      this.updateHud();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  updateStatic() {
    this.updateTrackChip();
    this.updateShopHeader();
    this.updateBookProgress();
    this.updateTabBadges();
  }

  // ─────────── HUD ───────────
  updateHud(force = false) {
    const now = performance.now();
    if (!force && now - this.hudTimer < 100) return;
    this.hudTimer = now;
    const coins = formatCoins(state.coins);
    if (this.lastHud.coins !== coins) {
      $('hud-coins').textContent = coins;
      this.lastHud.coins = coins;
    }
    const game = this.game;
    const mult = game ? game.currentMultiplier() : 1;
    const multStr = mult < 10 ? mult.toFixed(1) : mult.toFixed(0);
    if (this.lastHud.mult !== multStr) {
      $('hud-mult-value').textContent = multStr;
      this.lastHud.mult = multStr;
    }
    const label = game ? game.multiplierLabel() : 'базовый';
    if (this.lastHud.label !== label) {
      $('hud-mult-sub').textContent = label;
      this.lastHud.label = label;
    }
    // серия
    const combo = game ? game.combo : 0;
    if (this.lastHud.combo !== combo) {
      $('combo-value').textContent = combo;
      $('combo-mult').textContent = `+${Math.round((game ? game.comboMult() : 0) * 100)}%`;
      $('combo-pill').classList.toggle('is-hot', combo >= 8);
      this.lastHud.combo = combo;
    }
    // авто
    if (game) {
      const auto = game.stats.autoUnlocked;
      const pct = Math.round((game.autoReadyPct || 0) * 100);
      const secLeft = auto ? Math.max(0, Math.ceil((game.stats.autoInterval * 1000 - (game.autoCharge || 0)) / 1000)) : 0;
      const autoLabel = auto ? `авто: ${secLeft} с` : 'авто: не куплен';
      if (this.lastHud.auto !== autoLabel) {
        $('auto-label').textContent = autoLabel;
        this.lastHud.auto = autoLabel;
      }
      $('auto-fill').style.width = `${pct}%`;
      this.updateBuffs();
    }
    if (this.currentView === 'shop' && now - this.shopTimer > 380) {
      this.shopTimer = now;
      this.refreshShopAffordability();
      this.updateShopHeader();
    }
    if (now - this.tipTimer > 14000 && this.currentView === 'game') {
      this.tipTimer = now;
      const tip = this.tips[Math.floor(Math.random() * this.tips.length)];
      $('tip-line').textContent = tip;
    }
  }

  updateBuffs() {
    const row = $('buff-row');
    const game = this.game;
    if (!game) return;
    const defs = [
      { key: 'rage', label: 'Ярость', cls: 'buff-rage', icon: icon('flame') },
      { key: 'haste', label: 'Ускорение', cls: 'buff-haste', icon: icon('bolt') },
      { key: 'lucky', label: 'Прозрение', cls: 'buff-lucky', icon: icon('eye') },
      { key: 'festival', label: 'Праздник', cls: 'buff-festival', icon: icon('sparkle') },
      { key: 'slow', label: 'Заморозка', cls: 'buff-slow', icon: icon('moon') },
    ];
    const active = defs.filter((d) => game.buffRemain(d.key) > 0);
    const sig = active.map((d) => d.key).join(',');
    if (sig !== this.lastHud.buffs) {
      this.lastHud.buffs = sig;
      row.innerHTML = active.map((d) => `
        <div class="buff-chip ${d.cls}" data-buff="${d.key}" style="--p:100%">
          <span aria-hidden="true">${d.icon}</span>${d.label}
          <b data-time>0</b><span class="buff-bar"></span>
        </div>`).join('');
      this._buffEls = null;
    }
    if (!this._buffEls) {
      this._buffEls = Array.from(row.querySelectorAll('.buff-chip')).map((el) => ({
        el,
        time: el.querySelector('[data-time]'),
        bar: el.querySelector('.buff-bar'),
        key: el.dataset.buff,
      }));
    }
    for (const b of this._buffEls) {
      const rem = game.buffRemain(b.key);
      const txt = rem >= 10 ? `${Math.ceil(rem)}с` : `${rem.toFixed(1)}с`;
      if (b.time.textContent !== txt) b.time.textContent = txt;
      const max = b.key === 'rage' ? Math.max(1, game.stats.rageDur) : b.key === 'festival' ? Math.max(1, game.stats.festivalDur) : 20;
      b.bar.style.setProperty('--p', `${Math.min(100, (rem / max) * 100)}%`);
      b.el.querySelector('.buff-bar').style.width = `${Math.min(100, (rem / max) * 100)}%`;
    }
  }

  updateTabBadges() {
    const total = discoveredCount();
    const badge = $('tab-badge-book');
    badge.textContent = `${total}/${SQUIRRELS.length}`;
    badge.classList.toggle('attention', total < SQUIRRELS.length);
    $('tab-badge-shop').textContent = formatCoins(state.coins);
    const anyAffordable = SKILLS.some((s) => {
      const lvl = levelOf(s.id);
      if (lvl >= s.max) return false;
      if (isLocked(s)) return false;
      const cost = nextCost(s);
      return cost !== null && state.coins >= cost;
    });
    $('tab-dot-game').classList.toggle('is-on', anyAffordable);
  }

  updateTrackChip() {
    const tr = TRACKS[audio.trackIndex] || TRACKS[0];
    $('track-name').textContent = audio.musicOn ? tr.title : 'Музыка выкл.';
    $('track-chip').title = `Играет: ${tr.title} · ${tr.mood}`;
    const eq = document.querySelector('.eq');
    if (eq) eq.style.opacity = audio.musicOn ? '1' : '0.25';
  }

  updateShopHeader() {
    $('shop-coins').textContent = formatCoins(state.coins);
  }

  updateBookProgress() {
    const total = discoveredCount();
    $('book-progress').textContent = `Открыто ${total} из ${SQUIRRELS.length} видов`;
    $('book-progress-fill').style.width = `${(total / SQUIRRELS.length) * 100}%`;
  }

  // ─────────── магазин ───────────
  renderShopCats() {
    const wrap = $('shop-cats');
    wrap.innerHTML = CATEGORIES.map((c) => {
      const bought = SKILLS.filter((s) => s.cat === c.id && levelOf(s.id) > 0).length;
      const total = SKILLS.filter((s) => s.cat === c.id).length;
      return `<button class="chip ${this.shopCat === c.id ? 'is-active' : ''}" data-cat="${c.id}" data-active="${this.shopCat === c.id}">
        ${icon(c.icon)} ${c.name} <span style="opacity:.55">${bought}/${total}</span>
      </button>`;
    }).join('');
    const active = wrap.querySelector('.chip[data-active="true"]');
    if (active) active.scrollIntoView({ block: 'nearest', inline: 'center' });
  }

  renderShop() {
    const list = $('shop-list');
    const skills = SKILLS.filter((s) => s.cat === this.shopCat);
    list.innerHTML = skills.map((s) => this.shopCard(s)).join('');
    this.lastHud.shopSig = skills.map((s) => levelOf(s.id)).join(',');
  }

  shopCard(skill) {
    const lvl = levelOf(skill.id);
    const maxed = lvl >= skill.max;
    const lock = isLocked(skill);
    const cost = nextCost(skill);
    const cur = skill.format(lvl);
    const next = maxed ? null : skill.format(lvl + 1);
    const affordable = cost !== null && state.coins >= cost && !lock;
    const cat = CATEGORIES.find((c) => c.id === skill.cat);
    let btn;
    if (maxed) btn = `<button class="s-buy is-max" disabled>МАКС</button>`;
    else if (lock) btn = `<button class="s-buy is-locked" disabled aria-label="Закрыто">${icon('lock')}</button>`;
    else btn = `<button class="s-buy" data-skill="${skill.id}" ${affordable ? '' : 'disabled'}>
        <span class="coin-icon" aria-hidden="true"></span>${formatCoins(cost)}
      </button>`;
    return `<div class="s-card ${maxed ? 'is-max' : ''} ${lock ? 'is-locked' : ''} ${affordable ? 'is-affordable' : ''}" data-card="${skill.id}">
      <div class="s-ico" style="color:${cat.color}">${icon(skill.icon)}</div>
      <div class="s-main">
        <div class="s-top">
          <span class="s-name">${skill.name}</span>
          <span class="s-lvl">ур. ${lvl}/${skill.max}</span>
        </div>
        <div class="s-eff"><b>${cur}</b>${next && next !== cur ? `<span class="arrow">→</span>${next}` : ''}</div>
        <div class="s-desc">${skill.desc}</div>
        ${lock ? `<div class="s-lock">${icon('lock')} ${lock}</div>` : ''}
        <div class="s-bar" aria-hidden="true"><i style="width:${(lvl / skill.max) * 100}%"></i></div>
      </div>
      ${btn}
    </div>`;
  }

  refreshShopAffordability() {
    if (this.currentView !== 'shop') return;
    const sig = SKILLS.filter((s) => s.cat === this.shopCat).map((s) => levelOf(s.id)).join(',');
    if (sig !== this.lastHud.shopSig) {
      this.renderShopCats();
      this.renderShop();
      return;
    }
    document.querySelectorAll('#shop-list .s-card').forEach((card) => {
      const skill = SKILL_BY_ID[card.dataset.card];
      if (!skill) return;
      const btn = card.querySelector('.s-buy');
      if (!btn || btn.classList.contains('is-max')) return;
      const lock = isLocked(skill);
      const cost = nextCost(skill);
      const affordable = cost !== null && state.coins >= cost && !lock;
      btn.disabled = !affordable;
      card.classList.toggle('is-affordable', affordable);
    });
  }

  purchase(skillId) {
    const skill = SKILL_BY_ID[skillId];
    if (!skill) return;
    const res = buy(skillId);
    if (!res.ok) {
      if (res.reason === 'coins') {
        audio.playSfx('deny');
        this.toast(`Не хватает ${formatCoins(res.cost - state.coins)} монет`, 'warn');
      } else if (res.reason === 'locked') {
        audio.playSfx('deny');
        this.toast(res.message || 'Сначала открой навык', 'warn');
      }
      return;
    }
    audio.playSfx('buy');
    this.game.refreshFromStats();
    this.renderShopCats();
    this.renderShop();
    this.updateHud(true);
    this.updateTabBadges();
    this.toast(`${skill.name} — уровень ${res.level}`, 'good');
    if (res.level === 1) {
      const tips = {
        auto_unlock: 'Авто-молоток куплен: он будет бить сам!',
        field_size: 'Поляна выросла — теперь нор больше!',
        rare_chance: 'Редкие бурундуки станут появляться чаще',
        shockwave: 'Землетрясение будет бить по всем норам',
        offline: 'Теперь лес собирает монеты, пока тебя нет',
        festival: 'Лесной праздник будет приходить сам',
      };
      if (tips[skillId]) setTimeout(() => this.toast(tips[skillId], 'good'), 700);
    }
    if (skillId === 'field_size') {
      this.game.buildField();
      setTimeout(() => this.game.layout(), 30);
    }
  }

  // ─────────── энциклопедия ───────────
  renderBookFilters() {
    const wrap = $('book-filters');
    const counts = {};
    SQUIRRELS.forEach((s) => {
      if ((state.discovered[s.id] || 0) > 0) counts[s.rarity] = (counts[s.rarity] || 0) + 1;
    });
    const chips = [`<button class="chip ${this.bookFilter === 'all' ? 'is-active' : ''}" data-rarity="all">
        Все <span style="opacity:.55">${discoveredCount()}/${SQUIRRELS.length}</span></button>`];
    Object.values(RARITIES).forEach((r) => {
      const total = SQUIRRELS.filter((s) => s.rarity === r.id).length;
      chips.push(`<button class="chip ${this.bookFilter === r.id ? 'is-active' : ''}" data-rarity="${r.id}">
        <span class="chip-dot" style="color:${r.color}"></span>${r.label}
        <span style="opacity:.55">${counts[r.id] || 0}/${total}</span></button>`);
    });
    wrap.innerHTML = chips.join('');
  }

  renderBook() {
    const grid = $('book-grid');
    const list = this.bookFilter === 'all' ? SQUIRRELS : SQUIRRELS.filter((s) => s.rarity === this.bookFilter);
    grid.innerHTML = list.map((type) => {
      const count = state.discovered[type.id] || 0;
      const locked = count === 0;
      const r = RARITIES[type.rarity];
      return `<button class="b-card ${locked ? 'locked' : ''} ${type.rarity}" data-species="${type.id}"
        style="--rar:${r.color};--rar-soft:${r.soft}" aria-label="${locked ? 'Неизвестный вид' : type.name}">
        ${count > 0 ? `<span class="b-card-count">×${count}</span>` : ''}
        <div class="b-card-art">
          ${squirrelSVG(type)}
          ${locked ? '<span class="locked-q">?</span>' : ''}
        </div>
        <div class="b-card-name ${locked ? 'unknown' : ''}">${locked ? '???' : type.name}</div>
        <div class="b-card-rar">${r.label}</div>
      </button>`;
    }).join('');
    this.updateBookProgress();
    this.renderBookLegend();
  }

  renderBookLegend() {
    $('book-legend').innerHTML = Object.values(RARITIES)
      .map((r) => `<span style="color:${r.color};font-weight:800">${r.label}</span>`)
      .join('<span style="opacity:.45"> · </span>');
  }

  openSpecies(id) {
    const type = SQUIRREL_BY_ID[id];
    if (!type) return;
    const r = RARITIES[type.rarity];
    const count = state.discovered[type.id] || 0;
    const locked = count === 0;
    const stats = getStats();
    const opts = { luck: stats.rareBoost, epic: stats.epicBoost, legend: stats.legendBoost };
    const chance = chanceOfSpecies(type.id, opts);
    const stay = (2500 * type.stay * stats.stayTime) / 1000;
    const reward = Math.max(1, Math.round(stats.earn * type.coins * (1 + stats.goldenHammer)));
    const eff = effectText(type.effect);
    const body = `
      <div class="b-detail-top">
        <div class="b-detail-art ${locked ? 'locked' : ''}" style="--rar:${r.color}">
          ${squirrelSVG(type)}
        </div>
        <div class="b-detail-meta">
          <h3 class="b-detail-name">${locked ? 'Неизвестный бурундук' : type.name}</h3>
          <span class="b-detail-rar" style="--rar:${r.color};--rar-soft:${r.soft}">
            <span class="chip-dot" style="color:${r.color}"></span>${r.label}
          </span>
          <div class="b-detail-stats">
            <div class="b-stat"><span>Поймано</span><b>${count}</b></div>
            <div class="b-stat"><span>Шанс сейчас</span><b>${formatPercent(chance, 2)}</b></div>
            <div class="b-stat"><span>Базовая награда</span><b>×${type.coins.toFixed(2)}</b></div>
            <div class="b-stat"><span>Время на виду</span><b>${stay.toFixed(1)} с</b></div>
          </div>
        </div>
      </div>
      <p class="b-detail-desc">${locked ? 'Этот вид ещё не встречался на твоей поляне. Продолжай ловить бурундуков — и он обязательно появится.' : type.desc}</p>
      ${eff ? `<div class="b-detail-effect">${icon('sparkle')} ${eff}</div>` : ''}
      <div class="b-detail-lock">
        ${locked ? 'Сейчас не пойман' : `Сейчас за такой удар дают ≈ ${formatCoins(reward)} монет`}
      </div>`;
    this.openModal({ title: 'Энциклопедия', body });
  }

  openBookTab() { this.showView('book'); }

  // ─────────── модальные окна ───────────
  openModal({ title, body, actions, onClose, dismissible = true }) {
    const root = $('modal-root');
    root.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-sheet" role="dialog" aria-modal="true" aria-label="${title}">
        <div class="modal-grip"></div>
        <div class="modal-head">
          <h3 class="modal-title">${title}</h3>
          ${dismissible ? '<button class="modal-close" aria-label="Закрыть">✕</button>' : ''}
        </div>
        <div class="modal-body">${typeof body === 'string' ? body : ''}</div>
      </div>`;
    if (typeof body !== 'string') root.querySelector('.modal-body').appendChild(body);
    root.classList.add('is-open');
    this.modalOnClose = onClose || null;
    this.modalDismissible = dismissible;
    if (actions) {
      const bar = document.createElement('div');
      bar.style.cssText = 'display:flex;gap:8px;padding:0 16px 18px;';
      actions.forEach((a) => {
        const b = document.createElement('button');
        b.className = `btn ${a.primary ? 'btn-primary' : 'btn-ghost'}`;
        b.textContent = a.label;
        b.style.flex = '1';
        b.addEventListener('click', () => {
          if (a.onClick) a.onClick();
          if (a.close !== false) this.closeModal();
        });
        bar.appendChild(b);
      });
      root.querySelector('.modal-sheet').appendChild(bar);
    }
  }

  closeModal() {
    const root = $('modal-root');
    if (!root.classList.contains('is-open')) return;
    if (this.modalDismissible === false) return;
    root.classList.remove('is-open');
    root.innerHTML = '';
    const cb = this.modalOnClose;
    this.modalOnClose = null;
    this.modalDismissible = true;
    if (cb) cb();
  }

  downloadSave() {
    const backup = exportSave(SAVE_KEY);
    if (!backup) { this.toast('Пока нечего экспортировать', 'warn'); return; }
    const name = `squirrel-beating-save-${new Date().toISOString().slice(0, 10)}.json`;
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1500);
    this.toast('Сохранение сохранено в файл', 'good');
  }

  toast(text, type = '') {
    const root = $('toast-root');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = text;
    root.appendChild(el);
    while (root.childElementCount > 3) root.firstElementChild.remove();
    setTimeout(() => {
      el.style.transition = 'opacity .3s, transform .3s';
      el.style.opacity = '0';
      el.style.transform = 'translateY(6px)';
      setTimeout(() => el.remove(), 320);
    }, 2100);
  }

  // ─────────── настройки ───────────
  openSettings() {
    const s = state.settings;
    const stats = getStats();
    const body = `
      <h4>Звук</h4>
      <div class="set-row">
        <div class="set-label">Музыка<small>${audio.musicOn ? 'играет' : 'выключена'}</small></div>
        <input type="range" id="vol-music" min="0" max="1" step="0.05" value="${s.music}" aria-label="Громкость музыки" />
        <span class="set-val" id="vol-music-val">${Math.round(s.music * 100)}%</span>
      </div>
      <div class="set-row">
        <div class="set-label">Звуки<small>удары, монеты, покупки</small></div>
        <input type="range" id="vol-sfx" min="0" max="1" step="0.05" value="${s.sfx}" aria-label="Громкость звуков" />
        <span class="set-val" id="vol-sfx-val">${Math.round(s.sfx * 100)}%</span>
      </div>
      <div class="set-row">
        <div class="set-label">Эмбиент<small>ветер, птицы, листва</small></div>
        <input type="range" id="vol-ambient" min="0" max="1" step="0.05" value="${s.ambient}" aria-label="Громкость эмбиента" />
        <span class="set-val" id="vol-ambient-val">${Math.round(s.ambient * 100)}%</span>
      </div>
      <div class="set-row">
        <div class="set-label">Вибрация<small>на телефоне при ударе</small></div>
        <input type="checkbox" id="set-haptics" ${s.haptics === false ? '' : 'checked'} style="width:38px;height:22px;accent-color:#6f9360" />
      </div>

      <h4>Прогресс</h4>
      <div class="set-row">
        <div class="set-label">Доход<small>последняя минута</small></div>
        <span class="set-val" style="min-width:auto">${formatCoins(state.lastRate)} / мин</span>
      </div>
      <div class="set-row">
        <div class="set-label">Всего заработано<small>за всё время</small></div>
        <span class="set-val" style="min-width:auto">${formatCoins(state.totalEarned)}</span>
      </div>
      <div class="set-row">
        <div class="set-label">Поймано бурундуков<small>видов: ${discoveredCount()} / ${SQUIRRELS.length}</small></div>
        <span class="set-val" style="min-width:auto">${formatCoins(state.hits)}</span>
      </div>
      <div class="set-row">
        <div class="set-label">Лучшая серия<small>ударов без промаха</small></div>
        <span class="set-val" style="min-width:auto">${state.bestCombo}</span>
      </div>
      <div class="set-row">
        <div class="set-label">Авто-молоток<small>${stats.autoUnlocked ? `раз в ${stats.autoInterval} с` : 'ещё не куплен'}</small></div>
        <span class="set-val" style="min-width:auto">${stats.autoUnlocked ? 'есть' : '—'}</span>
      </div>

      <h4>Сохранение</h4>
      <div style="display:flex;gap:8px;margin-top:6px">
        <button class="btn btn-ghost" id="btn-export-save" style="flex:1">Экспорт прогресса</button>
        <button class="btn btn-ghost" id="btn-import-save" style="flex:1">Импорт прогресса</button>
      </div>
      <input type="file" id="import-save-file" accept="application/json,.json" class="hidden" />

      <h4>Ещё</h4>
      <div style="display:flex;flex-direction:column;gap:8px;margin-top:6px">
        <button class="btn btn-ghost btn-block" id="btn-open-help">Как играть</button>
        <button class="btn btn-ghost btn-block" id="btn-open-music">Плейлист леса</button>
        ${this.deferredPrompt ? '<button class="btn btn-ghost btn-block" id="btn-install">Установить как приложение</button>' : ''}
        <button class="btn btn-ghost btn-block" id="btn-reset" style="color:#a05c46">Сбросить прогресс</button>
      </div>
      <p style="margin-top:14px;font-size:10.5px;line-height:1.6;color:#8b8769;text-align:center">
        SquirrelBeatingGame · уютная лесная аркада<br />
        ${isNative() ? `${platformName()}${appVersion() ? ' · ' + appVersion() : ''}` : 'Вся музыка и звуки синтезируются прямо в браузере'}
      </p>`;
    this.openModal({ title: 'Настройки', body });
    const bindRange = (id, key, apply) => {
      const input = $(id);
      const val = $(`${id}-val`);
      input.addEventListener('input', () => {
        const v = Number(input.value);
        val.textContent = `${Math.round(v * 100)}%`;
        state.settings[key] = v;
        save();
        apply(v);
      });
    };
    bindRange('vol-music', 'music', (v) => {
      audio.setVolumes({ music: v });
      if (v > 0 && !audio.musicOn) { audio.musicOn = true; audio.startMusic(); }
      this.updateTrackChip();
    });
    bindRange('vol-sfx', 'sfx', (v) => { audio.setVolumes({ sfx: v }); if (v > 0) audio.playSfx('coin'); });
    bindRange('vol-ambient', 'ambient', (v) => audio.setVolumes({ ambient: v }));
    const h = $('set-haptics');
    if (h) h.addEventListener('change', () => { state.settings.haptics = h.checked; save(); });
    const installBtn = $('btn-install');
    if (installBtn) installBtn.addEventListener('click', async () => {
      if (!this.deferredPrompt) return;
      this.deferredPrompt.prompt();
      await this.deferredPrompt.userChoice;
      this.deferredPrompt = null;
      this.toast('Если окно не появилось — установи из меню браузера');
    });
    const musicBtn = $('btn-open-music');
    if (musicBtn) musicBtn.addEventListener('click', () => this.openMusic());
    // Экспорт / импорт сохранения
    const exportBtn = $('btn-export-save');
    if (exportBtn) exportBtn.addEventListener('click', () => this.downloadSave());
    const importBtn = $('btn-import-save');
    const fileInput = $('import-save-file');
    if (importBtn && fileInput) {
      importBtn.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', async () => {
        const file = fileInput.files && fileInput.files[0];
        if (!file) return;
        // Блокируем автосохранение ДО записи: иначе отложенный таймер
        // перезапишет импортированный сейв текущим состоянием из памяти.
        window.__SAVE_LOCKED__ = true;
        try {
          const text = await file.text();
          const ok = await importSave(SAVE_KEY, JSON.parse(text));
          if (ok) {
            this.toast('Прогресс загружен, перезапускаю…', 'good');
            setTimeout(() => location.reload(), 700);
          } else {
            window.__SAVE_LOCKED__ = false;
            this.toast('Файл не похож на сохранение', 'warn');
          }
        } catch (e) {
          window.__SAVE_LOCKED__ = false;
          this.toast('Не удалось прочитать файл', 'warn');
        } finally {
          fileInput.value = '';
        }
      });
    }

    const helpBtn = $('btn-open-help');
    if (helpBtn) helpBtn.addEventListener('click', () => this.openHelp());
    $('btn-reset').addEventListener('click', () => {
      this.openModal({
        title: 'Сбросить прогресс?',
        body: '<p>Монеты, навыки и вся энциклопедия вернутся к началу. Это нельзя отменить.</p>',
        actions: [
          { label: 'Отмена' },
          {
            label: 'Сбросить',
            onClick: () => {
              resetProgress();
              this.game.refreshFromStats();
              this.game.buildField();
              this.renderShop();
              this.renderShopCats();
              this.renderBook();
              this.renderBookFilters();
              this.updateStatic();
              this.updateHud(true);
              this.toast('Прогресс сброшен', 'warn');
            },
          },
        ],
      });
    });
  }

  openHelp() {
    const body = `
      <p>Бурундуки вылезают из нор на поляне. Бей по ним молотком: клик мышью, тап на телефоне или цифры 1–9 на клавиатуре.</p>
      <p>За каждый удар дают монеты. Чем быстрее ты попадаешь и чем длиннее серия без промахов — тем больше награда.</p>
      <h4>Редкие гости</h4>
      <p>Всего 30 видов. Золотой даёт много монет, красный злой включает ярость, волшебник приносит удачу, а мифические устраивают настоящий переполох. Открытые виды попадают в энциклопедию.</p>
      <h4>Прокачка</h4>
      <p>В магазине 40 навыков: доход, криты, откат удара, размер поляны, редкость гостей и авто-молоток, который бьёт сам.</p>
      <h4>Мелочи</h4>
      <p>На поляну иногда падают золотые жёлуди и появляются сундуки — успей кликнуть. Прогресс сохраняется сам, а «Сторож леса» приносит монеты, пока игра закрыта.</p>`;
    this.openModal({ title: 'Как играть', body });
  }

  openMusic() {
    const body = `
      <p style="margin-bottom:10px">10 разных мелодий леса. Меняются сами, но можно выбрать любую.</p>
      <div class="track-list">
        ${TRACKS.map((t, i) => `<button class="track-item ${i === audio.trackIndex ? 'is-current' : ''}" data-track="${i}">
          <span class="t-num">${String(i + 1).padStart(2, '0')}</span>
          <span>${t.title}</span>
          <span class="t-mood">${t.mood}</span>
        </button>`).join('')}
      </div>
      <div style="display:flex;gap:8px;margin-top:14px">
        <button class="btn btn-ghost" id="music-prev" style="flex:1">Пред.</button>
        <button class="btn btn-primary" id="music-toggle" style="flex:1">${audio.musicOn ? 'Пауза' : 'Играть'}</button>
        <button class="btn btn-ghost" id="music-next" style="flex:1">След.</button>
      </div>
      <p style="margin-top:12px;font-size:10.5px;color:#8b8769;text-align:center">Композиции генерируются в реальном времени</p>`;
    this.openModal({ title: 'Плейлист леса', body });
    const root = $('modal-root');
    root.querySelectorAll('.track-item').forEach((el) => {
      el.addEventListener('click', () => {
        const idx = Number(el.dataset.track);
        audio.setTrack(idx);
        if (!audio.musicOn) audio.startMusic(idx);
        root.querySelectorAll('.track-item').forEach((x) => x.classList.remove('is-current'));
        el.classList.add('is-current');
        this.updateTrackChip();
        this.toast(`Играет: ${TRACKS[idx].title}`, 'good');
      });
    });
    $('music-prev').addEventListener('click', () => {
      audio.nextTrack(-1);
      setTimeout(() => { this.updateTrackChip(); this.closeModal(); this.openMusic(); }, 900);
    });
    $('music-next').addEventListener('click', () => {
      audio.nextTrack(1);
      setTimeout(() => { this.updateTrackChip(); this.closeModal(); this.openMusic(); }, 900);
    });
    $('music-toggle').addEventListener('click', () => {
      if (audio.musicOn) {
        audio.stopMusic();
        this.toast('Музыка на паузе');
      } else {
        audio.startMusic();
        this.toast('Музыка включена', 'good');
      }
      this.updateTrackChip();
      $('music-toggle').textContent = audio.musicOn ? 'Пауза' : 'Играть';
    });
  }

  // ─────────── старт и офлайн ───────────
  showStart(hasProgress) {
    const tpl = $('tpl-start');
    const node = tpl.content.firstElementChild.cloneNode(true);
    document.body.appendChild(node);
    const crest = node.querySelector('#start-crest');
    crest.innerHTML = squirrelSVG(SQUIRREL_BY_ID.golden);
    const btn = node.querySelector('#btn-start');
    btn.textContent = hasProgress ? 'Продолжить' : 'Играть';
    if (isNative()) {
      const note = node.querySelector('.start-note');
      if (note) note.textContent = `${platformName()} · работает без интернета`;
    }
    const kicker = node.querySelector('.start-kicker');
    if (hasProgress) {
      kicker.textContent = `${formatCoins(state.coins)} монет · ${discoveredCount()}/${SQUIRRELS.length} видов`;
    }
    btn.addEventListener('click', async () => {
      node.classList.add('is-leaving');
      await audio.init();
      audio.setVolumes({
        music: state.settings.music,
        sfx: state.settings.sfx,
        ambient: state.settings.ambient,
      });
      audio.startMusic(Math.floor(Math.random() * TRACKS.length));
      // В установленном приложении звук иногда просыпается только со второго тапа.
      if (audio.ctx && audio.ctx.state !== 'running') {
        this.toast('Тапни по экрану, чтобы включить звук', 'warn');
      }
      this.updateTrackChip();
      setTimeout(() => { node.remove(); this.startNode = null; }, 480);
      if (this.onStart) this.onStart();
    }, { once: true });
    this.startNode = node;
  }

  showOffline(report) {
    if (!report) return;
    const body = `
      <div style="text-align:center;padding:6px 0 2px">
        <div style="color:#6f8c9c;display:grid;place-items:center;margin-bottom:4px">${icon('moon')}</div>
        <p style="font-size:13px;margin:10px 0 4px">Пока тебя не было, лес не спал.</p>
        <div style="font-family:var(--font-display);font-size:30px;font-weight:800;color:#7c5c1e;margin:6px 0 2px">
          +${formatCoins(report.coins)}
        </div>
        <p style="font-size:11.5px;color:#8b8769">монет за ${formatDuration(report.minutes * 60)}</p>
      </div>`;
    this.openModal({
      title: 'Сторож леса',
      body,
      actions: [{ label: 'Забрать', primary: true }],
    });
  }

  tutorialHint() {
    const hint = $('field-hint');
    hint.textContent = 'Тапай или кликай по бурундукам, чтобы ударить молотком';
    setTimeout(() => {
      hint.textContent = 'Чем быстрее удар — тем больше бонусов';
    }, 6000);
  }
}

function platformName() {
  const p = platform();
  if (p === 'android') return 'Приложение для Android';
  if (p === 'ios') return 'Приложение для iOS';
  if (p === 'windows') return 'Приложение для Windows';
  if (p === 'macos') return 'Приложение для macOS';
  if (p === 'linux') return 'Приложение для Linux';
  return 'Нативное приложение';
}

function appVersion() {
  const v = window.__APP_VERSION__ || '';
  return v ? `v${v}` : '';
}

export const ui = new UI();
