// 40 навыков прокачки. Каждый навык имеет реальный эффект, который применяется к статистике игрока.

export const BASE_STATS = {
  earn: 1,
  critChance: 0.03,
  critMult: 2,
  comboStep: 0.004,
  comboCap: 0.2,
  goldBonus: 0,
  ragePower: 0,
  rageDur: 10,
  collectionBonus: 0,
  doubleRewardChance: 0,
  fieldBonus: 0,
  cooldown: 300,
  hitRadius: 0,
  doubleHitChance: 0,
  splashChance: 0,
  echoChance: 0,
  shockwaveEvery: 0,
  missSafe: false,
  quickBonus: 0,
  rareBoost: 0,
  epicBoost: 0,
  legendBoost: 0,
  stayTime: 1,
  spawnRate: 1,
  doubleSpawnChance: 0,
  baitChance: 0,
  autoUnlocked: false,
  autoInterval: 30,
  autoPower: 1,
  autoDoubleChance: 0,
  autoCritChance: 0,
  autoChainChance: 0,
  autoRageChance: 0,
  autoFirstChance: 0,
  fieldLevel: 0,
  offlineRate: 0,
  insuranceChance: 0,
  acornChance: 0,
  treasureChance: 0,
  goldenHammer: 0,
  festivalEvery: 0,
  festivalDur: 12,
  festivalMult: 2,
  master: 1,
};

export const FIELD_SIZES = [
  { cols: 3, rows: 3, name: '3 × 3' },
  { cols: 3, rows: 4, name: '3 × 4' },
  { cols: 4, rows: 4, name: '4 × 4' },
  { cols: 4, rows: 5, name: '4 × 5' },
  { cols: 5, rows: 5, name: '5 × 5' },
];

export const CATEGORIES = [
  { id: 'earn', name: 'Заработок', icon: 'coin', color: '#f0b95a' },
  { id: 'hammer', name: 'Молоток', icon: 'hammer', color: '#d98b5f' },
  { id: 'squirrel', name: 'Бурундуки', icon: 'paw', color: '#8fc47a' },
  { id: 'auto', name: 'Авто-молоток', icon: 'auto', color: '#8fb6d6' },
  { id: 'special', name: 'Особые', icon: 'sparkle', color: '#b18de0' },
];

const pct = (v) => `${Math.round(v * 100)}%`;

export const SKILLS = [
  // ───────── ЗАРАБОТОК ─────────
  {
    id: 'earn', cat: 'earn', name: 'Золотая жила', icon: 'coin',
    desc: 'Каждый уровень повышает награду за удар на 0.1×.',
    max: 60, cost: 12, growth: 1.33,
    format: (l) => (l > 0 ? `доход ×${(1 + l * 0.1).toFixed(1)}` : 'доход ×1.0'),
    apply: (s, l) => { s.earn += l * 0.1; },
  },
  {
    id: 'crit_chance', cat: 'earn', name: 'Острый глаз', icon: 'crit',
    desc: 'Шанс критического удара, который приносит удвоенную (и больше) награду.',
    max: 20, cost: 34, growth: 1.27,
    format: (l) => `крит: ${pct(0.03 + l * 0.015)}`,
    apply: (s, l) => { s.critChance += l * 0.015; },
  },
  {
    id: 'crit_power', cat: 'earn', name: 'Тяжёлый обух', icon: 'hammer',
    desc: 'Увеличивает множитель критического удара.',
    max: 16, cost: 70, growth: 1.3,
    format: (l) => `крит ×${(2 + l * 0.25).toFixed(2)}`,
    apply: (s, l) => { s.critMult += l * 0.25; },
    locked: (st, lv) => (lv.crit_chance || 0) < 1 ? 'Нужен «Острый глаз» ур. 1' : null,
  },
  {
    id: 'combo', cat: 'earn', name: 'Серия', icon: 'combo',
    desc: 'Каждый удар без промаха увеличивает награду. Копится до предела.',
    max: 20, cost: 45, growth: 1.25,
    format: (l) => `+${(0.4 + l * 0.4).toFixed(1)}% за удар, макс +${Math.round((0.2 + l * 0.02) * 100)}%`,
    apply: (s, l) => { s.comboStep += l * 0.004; s.comboCap += l * 0.02; },
  },
  {
    id: 'gold_bonus', cat: 'earn', name: 'Золотая лихорадка', icon: 'sparkle',
    desc: 'Бонус к награде за золотых и «блестящих» бурундуков.',
    max: 15, cost: 90, growth: 1.31,
    format: (l) => `+${Math.round(l * 15)}% за золотых`,
    apply: (s, l) => { s.goldBonus += l * 0.15; },
  },
  {
    id: 'rage_power', cat: 'earn', name: 'Ярость берсерка', icon: 'flame',
    desc: 'В режиме ярости ты зарабатываешь ещё больше.',
    max: 15, cost: 110, growth: 1.3,
    format: (l) => `ярость: ${Math.round(100 + l * 15)}% бонус`,
    apply: (s, l) => { s.ragePower += l * 0.15; },
  },
  {
    id: 'rage_duration', cat: 'earn', name: 'Затяжная ярость', icon: 'clock',
    desc: 'Режим ярости длится дольше.',
    max: 12, cost: 120, growth: 1.33,
    format: (l) => `ярость ${(10 + l * 1.5).toFixed(1)} с`,
    apply: (s, l) => { s.rageDur += l * 1.5; },
  },
  {
    id: 'collection', cat: 'earn', name: 'Желудёвая копилка', icon: 'acorn',
    desc: 'Каждый открытый вид в энциклопедии повышает общий доход.',
    max: 20, cost: 140, growth: 1.34,
    format: (l) => `+${(l * 0.6).toFixed(1)}% за каждый вид`,
    apply: (s, l) => { s.collectionBonus += l * 0.006; },
  },
  {
    id: 'lucky', cat: 'earn', name: 'Счастливая монетка', icon: 'star',
    desc: 'Шанс, что награда за удар удвоится сама по себе.',
    max: 20, cost: 80, growth: 1.28,
    format: (l) => `${Math.round(l * 2.5)}% шанс ×2`,
    apply: (s, l) => { s.doubleRewardChance += l * 0.025; },
  },
  {
    id: 'field_bonus', cat: 'earn', name: 'Лесная щедрость', icon: 'leaf',
    desc: 'Чем больше нор на поляне, тем выше награда за каждый удар.',
    max: 15, cost: 200, growth: 1.3,
    format: (l) => `+${Math.round(l * 6)}% за каждую лишнюю нору`,
    apply: (s, l) => { s.fieldBonus += l * 0.06; },
    locked: (st, lv) => (lv.field_size || 0) < 1 ? 'Нужна «Лесная поляна» ур. 1' : null,
  },

  // ───────── МОЛОТОК ─────────
  {
    id: 'cooldown', cat: 'hammer', name: 'Лёгкий молоток', icon: 'hammer',
    desc: 'Уменьшает откат между ударами.',
    max: 18, cost: 28, growth: 1.29,
    format: (l) => `откат ${Math.max(80, Math.round(300 - l * 12))} мс`,
    apply: (s, l) => { s.cooldown = Math.max(80, s.cooldown - l * 12); },
  },
  {
    id: 'double_hit', cat: 'hammer', name: 'Двойной замах', icon: 'bolt',
    desc: 'Шанс, что удар сработает дважды — вторая монета падает сама.',
    max: 15, cost: 160, growth: 1.33,
    format: (l) => `${Math.round(l * 5)}% двойного удара`,
    apply: (s, l) => { s.doubleHitChance += l * 0.05; },
  },
  {
    id: 'splash', cat: 'hammer', name: 'Ударная волна', icon: 'bolt',
    desc: 'Шанс задеть соседнюю нору и снять бурундука оттуда.',
    max: 15, cost: 240, growth: 1.34,
    format: (l) => `${Math.round(l * 4)}% задеть соседа`,
    apply: (s, l) => { s.splashChance += l * 0.04; },
  },
  {
    id: 'steady', cat: 'hammer', name: 'Твёрдая рука', icon: 'shield',
    desc: 'Промах по пустой норе больше не сбрасывает серию.',
    max: 1, cost: 650, growth: 1,
    format: () => 'промах не сбрасывает серию',
    apply: (s) => { s.missSafe = true; },
  },
  {
    id: 'reach', cat: 'hammer', name: 'Длинная рукоять', icon: 'hammer',
    desc: 'Увеличивает зону попадания — прощает неточные клики.',
    max: 10, cost: 120, growth: 1.3,
    format: (l) => `+${l * 4} px к зоне удара`,
    apply: (s, l) => { s.hitRadius += l * 4; },
  },
  {
    id: 'shockwave', cat: 'hammer', name: 'Землетрясение', icon: 'bolt',
    desc: 'Каждые N ударов молот бьёт по всем норам сразу.',
    max: 9, cost: 700, growth: 1.42,
    format: (l) => (l ? `каждый ${12 - l + 1}-й удар — по всем` : 'не изучено'),
    apply: (s, l) => { s.shockwaveEvery = l ? 13 - l : 0; },
  },
  {
    id: 'echo', cat: 'hammer', name: 'Эхо удара', icon: 'paw',
    desc: 'Шанс, что удар отзовётся ещё раз по той же норе.',
    max: 12, cost: 300, growth: 1.34,
    format: (l) => `${Math.round(l * 6)}% эха`,
    apply: (s, l) => { s.echoChance += l * 0.06; },
  },
  {
    id: 'quick', cat: 'hammer', name: 'Реакция', icon: 'clock',
    desc: 'Бонус к награде, если бить бурундука в первые мгновения после появления.',
    max: 12, cost: 200, growth: 1.3,
    format: (l) => `+${Math.round(l * 5)}% за быстрый удар`,
    apply: (s, l) => { s.quickBonus += l * 0.05; },
  },

  // ───────── БУРУНДУКИ ─────────
  {
    id: 'rare_chance', cat: 'squirrel', name: 'Чутьё на редкость', icon: 'eye',
    desc: 'Повышает шанс появления необычных, редких и более редких бурундуков.',
    max: 25, cost: 170, growth: 1.29,
    format: (l) => `удача +${(l * 0.06).toFixed(2)}`,
    apply: (s, l) => { s.rareBoost += l * 0.06; },
  },
  {
    id: 'epic_chance', cat: 'squirrel', name: 'Талисман удачи', icon: 'sparkle',
    desc: 'Дополнительный шанс на эпических и легендарных бурундуков.',
    max: 20, cost: 500, growth: 1.32,
    format: (l) => `эпик-удача +${(l * 0.05).toFixed(2)}`,
    apply: (s, l) => { s.epicBoost += l * 0.05; },
    locked: (st, lv) => (lv.rare_chance || 0) < 3 ? 'Нужно «Чутьё на редкость» ур. 3' : null,
  },
  {
    id: 'legend_hunter', cat: 'squirrel', name: 'Охотник за легендами', icon: 'star',
    desc: 'Заметно повышает шанс легендарных и мифических гостей.',
    max: 15, cost: 1400, growth: 1.36,
    format: (l) => `легенд-удача +${(l * 0.07).toFixed(2)}`,
    apply: (s, l) => { s.legendBoost += l * 0.07; },
    locked: (st, lv) => (lv.rare_chance || 0) < 8 ? 'Нужно «Чутьё на редкость» ур. 8' : null,
  },
  {
    id: 'stay_time', cat: 'squirrel', name: 'Медленные лапки', icon: 'clock',
    desc: 'Бурундуки дольше сидят на виду — легче попасть.',
    max: 15, cost: 130, growth: 1.27,
    format: (l) => `+${Math.round(l * 6)}% время на реакцию`,
    apply: (s, l) => { s.stayTime += l * 0.06; },
  },
  {
    id: 'spawn_rate', cat: 'squirrel', name: 'Оживление', icon: 'leaf',
    desc: 'Бурундуки вылезают чаще.',
    max: 15, cost: 140, growth: 1.27,
    format: (l) => `+${Math.round(l * 6)}% частота появления`,
    apply: (s, l) => { s.spawnRate += l * 0.06; },
  },
  {
    id: 'double_spawn', cat: 'squirrel', name: 'Парочка', icon: 'paw',
    desc: 'Шанс, что из нор вылезут сразу два бурундука.',
    max: 12, cost: 320, growth: 1.31,
    format: (l) => `${Math.round(l * 5)}% двойное появление`,
    apply: (s, l) => { s.doubleSpawnChance += l * 0.05; },
  },
  {
    id: 'bait', cat: 'squirrel', name: 'Приманка', icon: 'acorn',
    desc: 'Шанс, что после редкого гостя почти сразу вылезет ещё один редкий.',
    max: 10, cost: 800, growth: 1.35,
    format: (l) => `${Math.round(l * 4)}% повторить редкого`,
    apply: (s, l) => { s.baitChance += l * 0.04; },
    locked: (st, lv) => (lv.double_spawn || 0) < 3 ? 'Нужна «Парочка» ур. 3' : null,
  },

  // ───────── АВТО-МОЛОТОК ─────────
  {
    id: 'auto_unlock', cat: 'auto', name: 'Дружелюбный молоток', icon: 'auto',
    desc: 'Второй молоток сам бьёт случайного бурундука. Каждый уровень ускоряет его на 1 секунду.',
    max: 26, cost: 260, growth: 1.22,
    format: (l) => (l === 0 ? 'не куплен' : `удар раз в ${Math.max(5, 31 - l)} с`),
    apply: (s, l) => { s.autoUnlocked = l > 0; if (l > 0) s.autoInterval = Math.max(5, 31 - l); },
  },
  {
    id: 'auto_power', cat: 'auto', name: 'Сила друга', icon: 'bolt',
    desc: 'Награда за авто-удар увеличивается.',
    max: 12, cost: 700, growth: 1.3,
    format: (l) => `+${Math.round(l * 25)}% к авто-награде`,
    apply: (s, l) => { s.autoPower += l * 0.25; },
    requiresAuto: true,
  },
  {
    id: 'auto_double', cat: 'auto', name: 'Двойной друг', icon: 'auto',
    desc: 'Шанс, что авто-молоток ударит по двум норам за раз.',
    max: 10, cost: 1000, growth: 1.34,
    format: (l) => `${Math.round(l * 5)}% двух целей`,
    apply: (s, l) => { s.autoDoubleChance += l * 0.05; },
    requiresAuto: true,
  },
  {
    id: 'auto_crit', cat: 'auto', name: 'Друг-снайпер', icon: 'crit',
    desc: 'Авто-молоток умеет наносить критические удары.',
    max: 15, cost: 900, growth: 1.32,
    format: (l) => `${Math.round(l * 4)}% крит авто`,
    apply: (s, l) => { s.autoCritChance += l * 0.04; },
    requiresAuto: true,
  },
  {
    id: 'auto_chain', cat: 'auto', name: 'Цепочка друга', icon: 'sparkle',
    desc: 'Шанс, что авто-молоток ударит ещё раз без ожидания отката.',
    max: 10, cost: 1200, growth: 1.35,
    format: (l) => `${Math.round(l * 3)}% повтора`,
    apply: (s, l) => { s.autoChainChance += l * 0.03; },
    requiresAuto: true,
  },
  {
    id: 'auto_rage', cat: 'auto', name: 'Ярость друга', icon: 'flame',
    desc: 'Шанс, что авто-удар введёт тебя в режим ярости.',
    max: 10, cost: 1600, growth: 1.36,
    format: (l) => `${Math.round(l * 3)}% шанс ярости`,
    apply: (s, l) => { s.autoRageChance += l * 0.03; },
    requiresAuto: true,
  },
  {
    id: 'auto_first', cat: 'auto', name: 'Мгновенный друг', icon: 'clock',
    desc: 'Шанс, что друг ударит бурундука сразу, как только тот высунется.',
    max: 10, cost: 1100, growth: 1.33,
    format: (l) => `${Math.round(l * 5)}% мгновенный удар`,
    apply: (s, l) => { s.autoFirstChance += l * 0.05; },
    requiresAuto: true,
  },

  // ───────── ОСОБЫЕ ─────────
  {
    id: 'field_size', cat: 'special', name: 'Лесная поляна', icon: 'grid',
    desc: 'Расширяет поляну с норами. Больше нор — больше бурундуков.',
    max: 4, cost: 700, growth: 3.1,
    format: (l) => `поле ${FIELD_SIZES[l].name}`,
    apply: (s, l) => { s.fieldLevel = l; },
  },
  {
    id: 'offline', cat: 'special', name: 'Сторож леса', icon: 'moon',
    desc: 'Пока тебя нет, сторож продолжает собирать монеты. До 8 часов.',
    max: 10, cost: 1500, growth: 1.34,
    format: (l) => `офлайн: ${Math.round(l * 10)}% дохода`,
    apply: (s, l) => { s.offlineRate = l * 0.1; },
  },
  {
    id: 'insurance', cat: 'special', name: 'Страховка', icon: 'shield',
    desc: 'Шанс найти монетку даже в пустой норе, если промахнулся.',
    max: 10, cost: 550, growth: 1.3,
    format: (l) => `${Math.round(l * 5)}% найти монету`,
    apply: (s, l) => { s.insuranceChance += l * 0.05; },
  },
  {
    id: 'acorn', cat: 'special', name: 'Жёлудевый дождь', icon: 'acorn',
    desc: 'Иногда на поляну падает золотой жёлудь. Успей кликнуть — получишь монеты.',
    max: 12, cost: 450, growth: 1.29,
    format: (l) => `${Math.round(l * 2)}% шанс жёлудя`,
    apply: (s, l) => { s.acornChance += l * 0.02; },
  },
  {
    id: 'treasure', cat: 'special', name: 'Клад в норе', icon: 'chest',
    desc: 'Иногда вместо бурундука в норе блестит сундук. Клик открывает горсть монет.',
    max: 10, cost: 900, growth: 1.33,
    format: (l) => `${Math.round(l * 1.2)}% шанс сундука`,
    apply: (s, l) => { s.treasureChance += l * 0.012; },
    locked: (st, lv) => (lv.acorn || 0) < 2 ? 'Нужен «Жёлудевый дождь» ур. 2' : null,
  },
  {
    id: 'golden_hammer', cat: 'special', name: 'Позолоченный молоток', icon: 'hammer',
    desc: 'Все источники монет приносят немного больше.',
    max: 15, cost: 900, growth: 1.3,
    format: (l) => `+${Math.round(l * 4)}% ко всем монетам`,
    apply: (s, l) => { s.goldenHammer += l * 0.04; },
  },
  {
    id: 'festival', cat: 'special', name: 'Лесной праздник', icon: 'sparkle',
    desc: 'Периодически в лесу начинается праздник: все награды удваиваются.',
    max: 10, cost: 2600, growth: 1.4,
    format: (l) => (l === 0 ? 'не изучено' : `каждые ${Math.max(45, 127 - l * 7)} с, ${12 + l} с ×2`),
    apply: (s, l) => {
      if (l > 0) { s.festivalEvery = Math.max(45, 127 - l * 7); s.festivalDur = 12 + l; }
    },
  },
  {
    id: 'master', cat: 'special', name: 'Мастер леса', icon: 'star',
    desc: 'Высшее мастерство: дополнительный бонус ко всем монетам.',
    max: 10, cost: 6000, growth: 1.45,
    format: (l) => `+${Math.round(l * 10)}% ко всем монетам`,
    apply: (s, l) => { s.master += l * 0.1; },
    locked: (st, lv) => (lv.field_size || 0) < 2 ? 'Нужна «Лесная поляна» ур. 2' : null,
  },
];

export const SKILL_BY_ID = Object.fromEntries(SKILLS.map((s) => [s.id, s]));

export function skillCost(skill, level) {
  const raw = skill.cost * Math.pow(skill.growth, level);
  const unit = raw < 100 ? 1 : raw < 1000 ? 5 : raw < 10000 ? 25 : raw < 100000 ? 100 : 1000;
  return Math.ceil(raw / unit) * unit;
}

export function computeStats(levels) {
  const stats = { ...BASE_STATS };
  for (const skill of SKILLS) {
    const lvl = Math.min(levels[skill.id] || 0, skill.max);
    if (lvl > 0) skill.apply(stats, lvl);
  }
  return stats;
}

// Полная стоимость прокачки навыка до максимума — для отображения прогресса
export function totalInvestment(skill, level) {
  let sum = 0;
  for (let i = 0; i < level; i++) sum += skillCost(skill, i);
  return sum;
}
