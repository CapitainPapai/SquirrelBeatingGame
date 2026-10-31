// 30 видов бурундуков: редкость, награда, поведение, эффекты и палитра для SVG-арта.

export const RARITIES = {
  common:    { id: 'common',    label: 'Обычный',     tier: 0, weight: 1000, color: '#a9b79a', soft: 'rgba(169,183,154,0.30)' },
  uncommon:  { id: 'uncommon',  label: 'Необычный',   tier: 1, weight: 200,  color: '#8fc47a', soft: 'rgba(143,196,122,0.30)' },
  rare:      { id: 'rare',      label: 'Редкий',      tier: 2, weight: 28,  color: '#74bcdd', soft: 'rgba(116,188,221,0.32)' },
  epic:      { id: 'epic',      label: 'Эпический',   tier: 3, weight: 5,   color: '#b18de0', soft: 'rgba(177,141,224,0.34)' },
  legendary: { id: 'legendary', label: 'Легендарный', tier: 4, weight: 0.9,    color: '#f0b95a', soft: 'rgba(240,185,90,0.36)' },
  mythic:    { id: 'mythic',    label: 'Мифический',  tier: 5, weight: 0.5,  color: '#f08aa0', soft: 'rgba(240,138,160,0.38)' },
};

// palette: fur / furLight / furDark / belly / inner (уши) / accent (декор) / tail
// coins — множитель награды, stay — множитель времени нахождения, deco — аксессуар
export const SQUIRRELS = [
  // ── Обычные ─────────────────────────────────────────────
  { id: 'red', name: 'Рыжик', rarity: 'common', coins: 1, stay: 1, weight: 120,
    desc: 'Самый обычный житель дубравы. Любит орехи, солнце и внезапно появляться из норы.',
    palette: { fur: '#c9762f', furLight: '#e39a55', furDark: '#9a5420', belly: '#f3dcb8', inner: '#e6b18a', accent: '#e7a24a', eye: '#3a2620' } },

  { id: 'gray', name: 'Серяк', rarity: 'common', coins: 1.15, stay: 1.05, weight: 110,
    desc: 'Серый, деловитый и очень быстрый. Уже трижды прятал орехи в одном и том же месте.',
    palette: { fur: '#9a9a94', furLight: '#bcbcb4', furDark: '#6e6e69', belly: '#eee7da', inner: '#d8cfc4', accent: '#c9c3b6', eye: '#2f2b29' } },

  { id: 'brown', name: 'Бурый Тимка', rarity: 'common', coins: 1.25, stay: 1, weight: 105,
    desc: 'Надёжный, как старый пень. Приносит с собой запах коры и мха.',
    palette: { fur: '#8a5a35', furLight: '#ac7548', furDark: '#5f3b21', belly: '#e8d3b0', inner: '#c99a76', accent: '#a9794c', eye: '#2b1f18' } },

  { id: 'plump', name: 'Пончик', rarity: 'common', coins: 1.45, stay: 1.35, weight: 85,
    desc: 'Толстяк с набитыми щеками. Вылезает медленно, но монетку отдаёт охотно.',
    palette: { fur: '#b8804a', furLight: '#d4a06a', furDark: '#8a5c30', belly: '#f5e3c4', inner: '#e0b795', accent: '#d8a26a', eye: '#33241b' } },

  { id: 'sleepy', name: 'Соня', rarity: 'common', coins: 0.95, stay: 1.8, weight: 95,
    desc: 'Просыпается только чтобы посмотреть, кто это стучит. Стоит дольше всех.',
    palette: { fur: '#a28e7c', furLight: '#c3b09e', furDark: '#7a6858', belly: '#f2e8da', inner: '#ddcdbc', accent: '#b9a793', eye: '#34302c' } },

  { id: 'stripe', name: 'Полосатик', rarity: 'common', coins: 1.35, stay: 0.9, weight: 100,
    desc: 'Полоски на спине помогают прятаться в траве. Не помогают прятаться от молотка.',
    palette: { fur: '#b56f3b', furLight: '#d18f5c', furDark: '#7f4a22', belly: '#f1dcbb', inner: '#dda985', accent: '#6d4526', eye: '#2e211a' } },

  // ── Необычные ───────────────────────────────────────────
  { id: 'chipmunk', name: 'Барсик', rarity: 'uncommon', coins: 1.7, stay: 1, weight: 105, deco: 'stripes',
    desc: 'Бурундук-щеголь с тремя чёткими полосками. Считает себя самым быстрым в лесу.',
    palette: { fur: '#c07a3c', furLight: '#dd9d61', furDark: '#8b5222', belly: '#f7e6c8', inner: '#e5b591', accent: '#5a3a22', eye: '#2c2019' } },

  { id: 'ears', name: 'Ушастик', rarity: 'uncommon', coins: 1.8, stay: 1.2, weight: 100, deco: 'longears',
    desc: 'Слышит, как ты поднимаешь молоток, за целую поляну. Но всё равно вылезает.',
    palette: { fur: '#a06a45', furLight: '#c48d63', furDark: '#754a2c', belly: '#f2dfc6', inner: '#e8b9a2', accent: '#c98d6a', eye: '#31231b' } },

  { id: 'scholar', name: 'Учёный Грызун', rarity: 'uncommon', coins: 2.0, stay: 1, weight: 95, deco: 'glasses',
    desc: 'Изучает механику ударов уже 12 лет. Носит очки исключительно для солидности.',
    palette: { fur: '#8d7a63', furLight: '#b09b81', furDark: '#655744', belly: '#efe7d8', inner: '#d8c6b2', accent: '#6a5744', eye: '#2c2620' } },

  { id: 'gardener', name: 'Садовник', rarity: 'uncommon', coins: 1.95, stay: 1.08, weight: 95, deco: 'leafhat',
    desc: 'Выращивает лучшие жёлуди в округе. Носит на голове собственный урожай.',
    palette: { fur: '#9b6c42', furLight: '#bd8d60', furDark: '#6d4929', belly: '#f0e2c8', inner: '#dcb392', accent: '#7e9c5c', eye: '#2f231a' } },

  { id: 'fashion', name: 'Модник', rarity: 'uncommon', coins: 2.2, stay: 1, weight: 90, deco: 'bowtie',
    desc: 'Уверен, что орехи — это аксессуар. Каждый выход из норы — показ новой коллекции.',
    palette: { fur: '#c4844f', furLight: '#e0a672', furDark: '#96602f', belly: '#f8e8cc', inner: '#e9bb96', accent: '#b45a63', eye: '#33241c' } },

  { id: 'poet', name: 'Поэт', rarity: 'uncommon', coins: 2.1, stay: 1.25, weight: 90, deco: 'scarf',
    desc: 'Выходит из норы с шарфом и тоской в глазах. Читает оды жёлудям, пока не прилетит молоток.',
    palette: { fur: '#8f7257', furLight: '#b39476', furDark: '#67503b', belly: '#efe4d2', inner: '#d5bea6', accent: '#6f86a8', eye: '#302720' } },

  // ── Редкие ──────────────────────────────────────────────
  { id: 'golden', name: 'Золотой', rarity: 'rare', coins: 5, stay: 1, weight: 115, deco: 'shine',
    desc: 'Шерсть блестит на солнце, а монеты так и сыплются. Считается большой удачей.',
    palette: { fur: '#e3ae47', furLight: '#f7d27e', furDark: '#b3801f', belly: '#fff1c9', inner: '#f0cf92', accent: '#ffe6a3', eye: '#4a3515' } },

  { id: 'angryred', name: 'Красный Злой', rarity: 'rare', coins: 2.8, stay: 0.95, weight: 105, deco: 'bandana',
    effect: { rage: 10 },
    desc: 'Злится на весь мир. Ударишь — впадаешь в ярость на 10 секунд: бьёшь чаще и получаешь больше.',
    palette: { fur: '#cf4f3f', furLight: '#ea7a63', furDark: '#9c3327', belly: '#f7d9c6', inner: '#ed9a86', accent: '#7d241b', eye: '#3a1512' } },

  { id: 'ninja', name: 'Ниндзя', rarity: 'rare', coins: 4, stay: 0.62, weight: 105, deco: 'ninja',
    desc: 'Появляется на мгновение. Только самые быстрые успевают по нему попасть.',
    palette: { fur: '#4f5a63', furLight: '#71808b', furDark: '#333c44', belly: '#c9d0d6', inner: '#8b98a3', accent: '#2b3238', eye: '#1c2226' } },

  { id: 'wizard', name: 'Волшебник', rarity: 'rare', coins: 3.6, stay: 1.05, weight: 100, deco: 'wizardhat',
    effect: { buff: 'lucky', buffTime: 20 },
    desc: 'Дарит «Прозрение» на 20 секунд — редкие бурундуки начинают вылезать заметно чаще.',
    palette: { fur: '#7f6a9e', furLight: '#a38cbf', furDark: '#5c4a78', belly: '#ece2f2', inner: '#c3b0d6', accent: '#8d79b8', eye: '#2a2236' } },

  { id: 'clock', name: 'Часовщик', rarity: 'rare', coins: 3.2, stay: 1.05, weight: 100, deco: 'clock',
    effect: { buff: 'haste', buffTime: 15 },
    desc: 'Ускоряет твой взмах на 15 секунд. Время — тоже ресурс, особенно в лесу.',
    palette: { fur: '#8a7f63', furLight: '#ad9f80', furDark: '#635a44', belly: '#efe8d4', inner: '#d6c9ae', accent: '#c9a25a', eye: '#2e291f' } },

  { id: 'banker', name: 'Банкир', rarity: 'rare', coins: 4.5, stay: 1, weight: 95, deco: 'monocle',
    effect: { flat: 40 },
    desc: 'Выплачивает премию прямо на месте. Говорит, что это «дивиденды по норе».',
    palette: { fur: '#5d5b52', furLight: '#807d71', furDark: '#3f3e37', belly: '#e7e2d4', inner: '#b8b2a2', accent: '#d4b25e', eye: '#25251f' } },

  { id: 'ice', name: 'Ледяной', rarity: 'rare', coins: 3.4, stay: 1, weight: 95, deco: 'ice',
    effect: { buff: 'slow', buffTime: 8 },
    desc: 'Замораживает время вокруг нор на 8 секунд — все бурундуки задерживаются вдвое дольше.',
    palette: { fur: '#8fc0d4', furLight: '#bce2ee', furDark: '#5f95ad', belly: '#eaf8fc', inner: '#c7e8f2', accent: '#a8e0ef', eye: '#22434f' } },

  // ── Эпические ───────────────────────────────────────────
  { id: 'emerald', name: 'Изумрудный', rarity: 'epic', coins: 7, stay: 1, weight: 100, deco: 'shine',
    desc: 'Изумрудная шубка, важный вид и очень дорогая привычка вылезать из норы.',
    palette: { fur: '#3f9a72', furLight: '#65c095', furDark: '#2b6e50', belly: '#ddf5e6', inner: '#9ad8b9', accent: '#7fe0b2', eye: '#18332a' } },

  { id: 'moon', name: 'Лунный', rarity: 'epic', coins: 6.5, stay: 1.1, weight: 100, deco: 'moon',
    desc: 'Появляется только в мягком свете. Оставляет после себя привкус ночного воздуха.',
    palette: { fur: '#9aa8d6', furLight: '#c1cbec', furDark: '#6d7aab', belly: '#f1f3fd', inner: '#cdd5f0', accent: '#e8ecff', eye: '#28304d' } },

  { id: 'fire', name: 'Огненный', rarity: 'epic', coins: 8, stay: 0.98, weight: 95, deco: 'flame',
    effect: { rage: 6 },
    desc: 'От него пахнет костром. Касание молотка поджигает в тебе ярость на 6 секунд.',
    palette: { fur: '#d2713c', furLight: '#f0a05e', furDark: '#9c4823', belly: '#ffe3bc', inner: '#f3c08e', accent: '#ff9b45', eye: '#3d1d12' } },

  { id: 'thunder', name: 'Гром', rarity: 'epic', coins: 7.5, stay: 0.95, weight: 90, deco: 'bolt',
    effect: { shockwave: true },
    desc: 'Бьёт молнией по всем норам сразу. Все, кто вылез, — получают по заслугам.',
    palette: { fur: '#c6a83f', furLight: '#e8cf72', furDark: '#8f7622', belly: '#fbf1c9', inner: '#e8d79a', accent: '#ffe066', eye: '#3c3212' } },

  { id: 'shadow', name: 'Тень', rarity: 'epic', coins: 9, stay: 0.7, weight: 90, deco: 'shadow',
    desc: 'Почти невидим, исчезает очень быстро. Но платит щедро — за молчание.',
    palette: { fur: '#4a4658', furLight: '#6b657f', furDark: '#2f2c3a', belly: '#b9b4c6', inner: '#8a8399', accent: '#9a7fd0', eye: '#d8cdf0' } },

  // ── Легендарные ─────────────────────────────────────────
  { id: 'crystal', name: 'Кристальный', rarity: 'legendary', coins: 14, stay: 1, weight: 100, deco: 'shine',
    desc: 'Полупрозрачный и звенит на ветру. Одна такая встреча окупает целую неделю охоты.',
    palette: { fur: '#a9d8e6', furLight: '#dbf3fa', furDark: '#6ea7bb', belly: '#f5feff', inner: '#c7ecf6', accent: '#e6fbff', eye: '#264e5c' } },

  { id: 'rainbow', name: 'Радужный', rarity: 'legendary', coins: 12, stay: 1.05, weight: 95, deco: 'rainbow',
    effect: { buff: 'festival', buffTime: 12 },
    desc: 'Приносит лесной праздник на 12 секунд: все награды удваиваются.',
    palette: { fur: '#c88bb8', furLight: '#e8b4d6', furDark: '#9c648c', belly: '#fdf3fa', inner: '#f0c6e2', accent: '#ffd1e8', eye: '#3d2638' } },

  { id: 'oakking', name: 'Король Дуба', rarity: 'legendary', coins: 18, stay: 1.1, weight: 95, deco: 'crown',
    effect: { rage: 8 },
    desc: 'Правитель всех нор. Его удар в ответ дарит ярость на 8 секунд и целую горсть монет.',
    palette: { fur: '#b07a3c', furLight: '#d7a05c', furDark: '#7f5222', belly: '#f7e5c2', inner: '#e0b78a', accent: '#f0c05a', eye: '#33240f' } },

  { id: 'sky', name: 'Небесный', rarity: 'legendary', coins: 15, stay: 1, weight: 90, deco: 'halo',
    effect: { barrage: 3 },
    desc: 'Автоматический молоток сходит с ума и бьёт три раза подряд. Небо одобряет.',
    palette: { fur: '#a9c4e2', furLight: '#d3e5f6', furDark: '#7695b8', belly: '#f4f9ff', inner: '#c5dcf0', accent: '#fff3c4', eye: '#28394d' } },

  // ── Мифические ──────────────────────────────────────────
  { id: 'space', name: 'Космический', rarity: 'mythic', coins: 30, stay: 1.05, weight: 100, deco: 'cosmic',
    effect: { shockwave: true, rage: 5 },
    desc: 'Пришёл из норы, которой нет на картах. Приносит космический удар по всем норам и ярость.',
    palette: { fur: '#4b4a86', furLight: '#7d7ac0', furDark: '#2f2e5c', belly: '#d9d8f2', inner: '#a6a2dd', accent: '#ffe9a8', eye: '#efeaff' } },

  { id: 'spirit', name: 'Дух Леса', rarity: 'mythic', coins: 25, stay: 1.15, weight: 100, deco: 'spirit',
    effect: { buff: 'allbuffs', buffTime: 15 },
    desc: 'Древний хранитель дубравы. Дарует сразу все усиления на 15 секунд — ярость, удачу и праздник.',
    palette: { fur: '#7bb08d', furLight: '#a8d4b4', furDark: '#54806a', belly: '#e6f6ea', inner: '#bfe2c9', accent: '#d9ffd9', eye: '#1f4030' } },
];

export const SQUIRREL_BY_ID = Object.fromEntries(SQUIRRELS.map((s) => [s.id, s]));
export const TOTAL_SPECIES = SQUIRRELS.length;

export function rarityOf(type) {
  return RARITIES[type.rarity];
}

// Подбор вида с учётом удачи: общая + отдельные бонусы для эпиков и легенд.
export function speciesWeight(type, { luck = 0, epic = 0, legend = 0 } = {}) {
  const r = RARITIES[type.rarity];
  const tier = r.tier;
  let boost = 1;
  if (tier >= 1) boost += luck * (0.35 + tier * 0.55);
  if (tier >= 3) boost += epic * (0.5 + (tier - 3) * 0.9);
  if (tier >= 4) boost += legend * (1.1 + (tier - 4) * 1.2);
  return r.weight * (type.weight / 100) * boost;
}

export function rollSquirrel(opts = {}, rand = Math.random) {
  const options = typeof opts === 'number' ? { luck: opts } : opts || {};
  let total = 0;
  const weighted = [];
  for (const type of SQUIRRELS) {
    const w = speciesWeight(type, options);
    total += w;
    weighted.push([type, w]);
  }
  let roll = rand() * total;
  for (const [type, w] of weighted) {
    roll -= w;
    if (roll <= 0) return type;
  }
  return SQUIRRELS[0];
}

export function chanceOfRarity(rarity, opts = {}) {
  const options = typeof opts === 'number' ? { luck: opts } : opts || {};
  const target = RARITIES[rarity].tier;
  let total = 0;
  let targetSum = 0;
  for (const type of SQUIRRELS) {
    const w = speciesWeight(type, options);
    total += w;
    if (RARITIES[type.rarity].tier === target) targetSum += w;
  }
  return targetSum / total;
}

export function chanceOfSpecies(id, opts = {}) {
  const options = typeof opts === 'number' ? { luck: opts } : opts || {};
  let total = 0;
  let own = 0;
  for (const type of SQUIRRELS) {
    const w = speciesWeight(type, options);
    total += w;
    if (type.id === id) own = w;
  }
  return own / total;
}
