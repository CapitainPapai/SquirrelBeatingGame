/* ============================================================
   Звук: живой эмбиент леса, 10 разных композиций и SFX.
   Всё синтезируется в AudioContext — без внешних файлов.
   ============================================================ */

// Планировщик музыки: тик раз в TICK_MS, смотрит вперёд на LOOKAHEAD секунд.
// Запас нужен мобильным браузерам: их таймеры «дрожат» и тротлятся в фоне.
// Больше 1 с брать нельзя — иначе после смены мелодии старый такт ещё звучит.
const TICK_MS = 220;
const LOOKAHEAD = 1.0;

const midiToFreq = (m) => 440 * Math.pow(2, (m - 69) / 12);

const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  majorPenta: [0, 2, 4, 7, 9],
  minorPenta: [0, 3, 5, 7, 10],
};

const CHORD_TYPES = {
  maj7: [0, 4, 7, 11],
  maj9: [0, 4, 7, 11, 14],
  add9: [0, 4, 7, 14],
  '6': [0, 4, 7, 9],
  sus2: [0, 2, 7, 12],
  sus4: [0, 5, 7, 12],
  '7sus': [0, 5, 7, 10],
  min7: [0, 3, 7, 10],
  min9: [0, 3, 7, 10, 14],
  min: [0, 3, 7],
  maj: [0, 4, 7],
  dom7: [0, 4, 7, 10],
};

// ─────────────────────────────── ПЕСНИ ───────────────────────────────
export const TRACKS = [
  {
    id: 'morning', title: 'Утро в дубраве', mood: 'тёплая калимба',
    root: 62, scale: 'major', bpm: 72, beatsPerBar: 4,
    chords: [
      { r: 0, t: 'maj9', bars: 1 }, { r: 5, t: 'min7', bars: 1 },
      { r: 3, t: 'maj7', bars: 1 }, { r: 4, t: '7sus', bars: 1 },
    ],
    layers: {
      pad: { inst: 'warmPad', oct: 0, gain: 0.055, attack: 1.4, release: 1.6 },
      bass: { inst: 'softBass', oct: -1, gain: 0.2, pattern: [[0, 0, 1.6], [2.5, 0, 1.2]] },
      arp: { inst: 'kalimba', oct: 1, gain: 0.11, rate: 0.5, pattern: [0, 2, 4, 2, 1, 3, 4, 3], vel: 0.6, every: 2 },
      lead: {
        inst: 'kalimba', oct: 1, gain: 0.16,
        motif: [
          [4, 0, 0.9, 0.9], [5, 1.0, 0.5, 0.7], [4, 1.5, 1.4, 0.8], [2, 3.0, 0.8, 0.6],
          [3, 0, 0.7, 0.8], [4, 1.5, 1.2, 0.75], [2, 3.0, 1.8, 0.7],
          [4, 0, 0.8, 0.85], [5, 1.0, 0.6, 0.7], [6, 2.0, 1.4, 0.8], [4, 3.5, 0.5, 0.6],
          [3, 0, 1.0, 0.8], [2, 1.2, 0.6, 0.65], [1, 2.0, 1.9, 0.7],
        ],
      },
    },
  },
  {
    id: 'moss', title: 'Тропинка из мха', mood: 'маримба и флейта',
    root: 55, scale: 'lydian', bpm: 84, beatsPerBar: 4,
    chords: [
      { r: 0, t: 'maj7', bars: 2 }, { r: 1, t: 'min7', bars: 1 }, { r: 3, t: 'maj9', bars: 1 },
      { r: 4, t: 'sus4', bars: 2 }, { r: 5, t: 'min7', bars: 1 }, { r: 3, t: 'maj7', bars: 1 },
    ],
    layers: {
      pad: { inst: 'airyPad', oct: 0, gain: 0.05, attack: 1.8, release: 2.2 },
      bass: { inst: 'softBass', oct: -1, gain: 0.17, pattern: [[0, 0, 1.0], [1.5, 0, 0.8], [3, 4, 0.9]] },
      arp: { inst: 'marimba', oct: 0, gain: 0.1, rate: 0.5, pattern: [0, 3, 1, 4, 2, 4, 1, 3], vel: 0.55, every: 1 },
      lead: {
        inst: 'flute', oct: 1, gain: 0.2, breath: 0.5,
        motif: [
          [2, 0, 1.2, 0.7], [4, 1.4, 0.6, 0.6], [3, 2.0, 1.8, 0.65],
          [1, 0, 0.9, 0.6], [2, 1.1, 0.5, 0.5], [0, 2.0, 1.9, 0.55],
          [3, 0, 1.4, 0.7], [4, 1.6, 0.8, 0.6], [5, 2.6, 1.3, 0.55],
          [4, 0, 0.8, 0.6], [2, 1.0, 0.8, 0.55], [3, 2.2, 1.7, 0.62],
        ],
      },
    },
  },
  {
    id: 'sunbeam', title: 'Солнечные зайчики', mood: 'лёгкий роудс',
    root: 60, scale: 'major', bpm: 96, beatsPerBar: 4,
    chords: [
      { r: 0, t: 'add9', bars: 1 }, { r: 5, t: 'min7', bars: 1 },
      { r: 3, t: 'maj7', bars: 1 }, { r: 4, t: 'dom7', bars: 1 },
    ],
    layers: {
      pad: { inst: 'softPad', oct: 0, gain: 0.035, attack: 0.9, release: 1.0 },
      bass: { inst: 'roundBass', oct: -1, gain: 0.2, pattern: [[0, 0, 0.7], [1.5, 0, 0.4], [2.5, 0, 0.5], [3.5, 4, 0.4]] },
      arp: { inst: 'rhodes', oct: 1, gain: 0.06, rate: 0.25, pattern: [0, 1, 2, 3, 2, 1], vel: 0.42, every: 1 },
      lead: {
        inst: 'bell', oct: 1, gain: 0.13,
        motif: [
          [4, 0, 0.45, 0.6], [2, 0.5, 0.4, 0.5], [4, 1.0, 0.4, 0.55], [6, 1.5, 0.9, 0.6], [5, 2.5, 0.9, 0.5],
          [4, 0, 0.45, 0.55], [3, 0.5, 0.4, 0.5], [4, 1.0, 1.4, 0.6], [1, 2.5, 0.9, 0.45],
          [2, 0, 0.4, 0.55], [3, 0.5, 0.4, 0.5], [4, 1.0, 0.5, 0.6], [6, 1.6, 0.7, 0.55], [4, 2.5, 1.4, 0.5],
          [3, 0, 0.5, 0.55], [4, 0.6, 0.4, 0.5], [5, 1.2, 0.6, 0.55], [4, 2.0, 1.8, 0.5],
        ],
      },
      perc: { inst: 'shaker', gain: 0.05, pattern: [0.5, 1.5, 2.5, 3.5] },
    },
  },
  {
    id: 'brook', title: 'Тихий ручей', mood: 'медитация',
    root: 57, scale: 'minor', bpm: 66, beatsPerBar: 3,
    chords: [
      { r: 0, t: 'min9', bars: 2 }, { r: 5, t: 'maj7', bars: 2 },
      { r: 2, t: 'maj7', bars: 1 }, { r: 6, t: 'add9', bars: 1 },
    ],
    layers: {
      pad: { inst: 'waterPad', oct: 0, gain: 0.06, attack: 2.2, release: 2.6 },
      bass: { inst: 'deepBass', oct: -1, gain: 0.14, pattern: [[0, 0, 2.2]] },
      arp: { inst: 'pluck', oct: 1, gain: 0.05, rate: 0.75, pattern: [0, 2, 4, 3], vel: 0.4, every: 2 },
      lead: {
        inst: 'flute', oct: 1, gain: 0.17, breath: 0.75,
        motif: [
          [4, 0, 1.4, 0.55], [3, 1.6, 0.8, 0.5], [2, 2.6, 1.2, 0.5],
          [0, 0, 1.2, 0.5], [2, 1.4, 1.4, 0.55],
          [3, 0, 0.8, 0.5], [4, 0.9, 0.7, 0.5], [2, 1.9, 1.6, 0.5],
          [1, 0, 1.5, 0.45], [2, 1.7, 1.0, 0.5],
        ],
      },
    },
  },
  {
    id: 'grove', title: 'Ореховая роща', mood: 'тёплая гитара',
    root: 53, scale: 'major', bpm: 88, beatsPerBar: 4,
    chords: [
      { r: 0, t: 'maj7', bars: 1 }, { r: 5, t: 'min7', bars: 1 },
      { r: 3, t: 'maj7', bars: 1 }, { r: 4, t: 'sus4', bars: 1 },
    ],
    layers: {
      pad: { inst: 'warmPad', oct: 0, gain: 0.032, attack: 1.0, release: 1.2 },
      bass: { inst: 'fingerBass', oct: -1, gain: 0.22, pattern: [[0, 0, 0.9], [1.5, 4, 0.4], [2.5, 4, 0.6], [3.5, 7, 0.4]] },
      arp: { inst: 'guitar', oct: 0, gain: 0.09, rate: 0.25, pattern: [0, 2, 3, 4, 3, 2, 1, 2], vel: 0.45, every: 1 },
      lead: {
        inst: 'guitar', oct: 1, gain: 0.13,
        motif: [
          [4, 0, 0.9, 0.65], [3, 1.0, 0.45, 0.55], [2, 1.5, 0.9, 0.6], [0, 2.5, 1.3, 0.55],
          [1, 0, 0.45, 0.5], [2, 0.5, 0.45, 0.5], [3, 1.0, 1.2, 0.6], [5, 2.5, 0.9, 0.5],
          [4, 0, 0.7, 0.6], [2, 0.8, 0.5, 0.5], [4, 1.5, 0.6, 0.6], [6, 2.2, 1.5, 0.55],
          [3, 0, 1.0, 0.55], [1, 1.2, 0.6, 0.5], [2, 2.0, 1.7, 0.55],
        ],
      },
      perc: { inst: 'brush', gain: 0.035, pattern: [0, 2] },
    },
  },
  {
    id: 'campfire', title: 'Вечерний костёр', mood: 'тёплый роудс',
    root: 52, scale: 'minor', bpm: 76, beatsPerBar: 4,
    chords: [
      { r: 0, t: 'min9', bars: 2 }, { r: 5, t: 'maj7', bars: 2 },
      { r: 2, t: 'maj7', bars: 1 }, { r: 6, t: '7sus', bars: 1 },
    ],
    layers: {
      pad: { inst: 'warmPad', oct: 0, gain: 0.05, attack: 1.5, release: 1.8 },
      bass: { inst: 'deepBass', oct: -1, gain: 0.19, pattern: [[0, 0, 1.4], [2, 0, 1.4], [3.5, 4, 0.4]] },
      arp: { inst: 'rhodes', oct: 0, gain: 0.05, rate: 0.5, pattern: [0, 2, 3, 1, 3, 2], vel: 0.38, every: 2 },
      lead: {
        inst: 'rhodes', oct: 1, gain: 0.16,
        motif: [
          [2, 0, 1.5, 0.7], [4, 1.6, 0.7, 0.6], [3, 2.5, 1.4, 0.62],
          [0, 0, 1.0, 0.6], [1, 1.2, 0.9, 0.55], [2, 2.4, 1.5, 0.6],
          [4, 0, 1.2, 0.65], [5, 1.4, 0.8, 0.55], [4, 2.4, 1.5, 0.6],
          [3, 0, 1.4, 0.6], [2, 1.6, 1.9, 0.55],
        ],
      },
    },
  },
  {
    id: 'moonlight', title: 'Лунная поляна', mood: 'музыкальная шкатулка',
    root: 58, scale: 'major', bpm: 64, beatsPerBar: 4,
    chords: [
      { r: 0, t: 'maj7', bars: 2 }, { r: 5, t: 'min7', bars: 1 }, { r: 3, t: 'maj7', bars: 1 },
      { r: 4, t: 'add9', bars: 2 }, { r: 1, t: 'min7', bars: 1 }, { r: 3, t: 'maj7', bars: 1 },
    ],
    layers: {
      pad: { inst: 'glassPad', oct: 0, gain: 0.045, attack: 2.4, release: 3.0 },
      bass: { inst: 'softBass', oct: -1, gain: 0.15, pattern: [[0, 0, 2.0]] },
      arp: { inst: 'musicBox', oct: 2, gain: 0.05, rate: 1.0, pattern: [0, 3, 1, 4], vel: 0.34, every: 2 },
      lead: {
        inst: 'musicBox', oct: 1, gain: 0.15,
        motif: [
          [4, 0, 1.0, 0.65], [6, 1.2, 0.7, 0.55], [4, 2.2, 1.6, 0.6],
          [3, 0, 0.8, 0.6], [4, 0.9, 0.8, 0.55], [2, 1.9, 1.8, 0.55],
          [1, 0, 0.9, 0.55], [2, 1.0, 0.9, 0.5], [4, 2.1, 1.7, 0.55],
          [3, 0, 1.2, 0.55], [2, 1.4, 0.8, 0.5], [0, 2.4, 1.6, 0.5],
        ],
      },
    },
  },
  {
    id: 'wind', title: 'Ветер в кронах', mood: 'воздушный эмбиент',
    root: 50, scale: 'dorian', bpm: 80, beatsPerBar: 4,
    chords: [
      { r: 0, t: 'min7', bars: 2 }, { r: 3, t: 'min7', bars: 2 },
      { r: 6, t: 'maj7', bars: 2 }, { r: 4, t: 'sus2', bars: 2 },
    ],
    layers: {
      pad: { inst: 'airyPad', oct: 0, gain: 0.07, attack: 3.0, release: 3.2 },
      bass: { inst: 'deepBass', oct: -1, gain: 0.12, pattern: [[0, 0, 3.0]] },
      arp: { inst: 'pluck', oct: 1, gain: 0.035, rate: 1.0, pattern: [0, 2, 4, 2], vel: 0.3, every: 3 },
      lead: {
        inst: 'flute', oct: 1, gain: 0.15, breath: 0.9,
        motif: [
          [2, 0, 2.2, 0.5], [4, 2.4, 1.5, 0.45],
          [3, 0, 1.8, 0.45], [1, 2.0, 1.9, 0.42],
          [4, 0, 2.4, 0.48], [2, 2.6, 1.3, 0.4],
          [5, 0, 3.0, 0.44],
        ],
      },
    },
  },
  {
    id: 'leaves', title: 'Танец листьев', mood: 'игривая маримба',
    root: 57, scale: 'major', bpm: 104, beatsPerBar: 4,
    chords: [
      { r: 0, t: 'maj7', bars: 1 }, { r: 5, t: 'min7', bars: 1 },
      { r: 3, t: 'maj7', bars: 1 }, { r: 4, t: 'dom7', bars: 1 },
    ],
    layers: {
      pad: { inst: 'softPad', oct: 0, gain: 0.028, attack: 0.6, release: 0.8 },
      bass: { inst: 'roundBass', oct: -1, gain: 0.2, pattern: [[0, 0, 0.6], [1, 0, 0.35], [2, 0, 0.5], [3, 4, 0.4]] },
      arp: { inst: 'marimba', oct: 0, gain: 0.1, rate: 0.25, pattern: [0, 2, 1, 3, 2, 4, 3, 1], vel: 0.5, every: 1 },
      lead: {
        inst: 'marimba', oct: 1, gain: 0.15,
        motif: [
          [4, 0, 0.35, 0.7], [6, 0.5, 0.3, 0.6], [4, 1.0, 0.3, 0.65], [3, 1.5, 0.6, 0.6], [2, 2.25, 0.3, 0.55], [4, 2.75, 0.9, 0.6],
          [5, 0, 0.4, 0.65], [4, 0.5, 0.35, 0.58], [2, 1.0, 0.5, 0.6], [1, 1.75, 0.9, 0.55], [2, 3.0, 0.8, 0.5],
          [4, 0, 0.35, 0.68], [5, 0.5, 0.3, 0.6], [7, 1.0, 0.5, 0.62], [6, 1.75, 0.5, 0.55], [4, 2.5, 1.2, 0.55],
          [3, 0, 0.4, 0.6], [2, 0.5, 0.4, 0.55], [3, 1.0, 0.4, 0.55], [4, 1.5, 1.8, 0.58],
        ],
      },
      perc: { inst: 'shaker', gain: 0.055, pattern: [0.5, 1.5, 2.5, 3.5] },
    },
  },
  {
    id: 'roots', title: 'Дом у корней', mood: 'уютный вечер',
    root: 51, scale: 'major', bpm: 70, beatsPerBar: 4,
    chords: [
      { r: 0, t: 'maj9', bars: 2 }, { r: 5, t: 'min7', bars: 1 }, { r: 3, t: 'maj7', bars: 1 },
      { r: 4, t: 'sus2', bars: 2 }, { r: 1, t: 'min7', bars: 1 }, { r: 3, t: 'maj7', bars: 1 },
    ],
    layers: {
      pad: { inst: 'warmPad', oct: 0, gain: 0.058, attack: 1.8, release: 2.0 },
      bass: { inst: 'fingerBass', oct: -1, gain: 0.18, pattern: [[0, 0, 1.5], [2, 0, 0.9], [3.25, 4, 0.5]] },
      arp: { inst: 'guitar', oct: 0, gain: 0.07, rate: 0.5, pattern: [0, 3, 2, 4, 1, 3], vel: 0.4, every: 2 },
      lead: {
        inst: 'bell', oct: 1, gain: 0.12,
        motif: [
          [4, 0, 1.6, 0.6], [2, 1.9, 1.6, 0.55],
          [3, 0, 1.0, 0.55], [4, 1.2, 0.7, 0.5], [2, 2.1, 1.5, 0.55],
          [5, 0, 1.4, 0.55], [4, 1.6, 1.7, 0.5],
          [3, 0, 1.0, 0.5], [1, 1.2, 1.0, 0.45], [2, 2.4, 1.6, 0.5],
        ],
      },
      perc: { inst: 'brush', gain: 0.03, pattern: [0, 2] },
    },
  },
];

// ─────────────────────────────── ДВИЖОК ───────────────────────────────
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.ready = false;
    this.volumes = { music: 0.55, sfx: 0.8, ambient: 0.5 };
    this.musicOn = true;
    this.trackIndex = 0;
    this.playing = false;
    this.bar = 0;
    this.nextBarAt = 0;
    this.scheduleTimer = null;
    this.ambientTimer = null;
    this.noiseBuffer = null;
    this.channels = {};
    this.lastBird = 0;
    this._switching = false;
    this.trackStartedAt = 0;
    this.trackLength = 0;
  }

  async init() {
    if (this.ctx) {
      // iOS/Android умеют усыплять контекст ('suspended') и «прерывать» его
      // ('interrupted' после звонка или сворачивания). Оба состояния лечатся
      // вызовом resume() из жеста пользователя.
      if (this.ctx.state !== 'running') await this.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    this.ctx = ctx;

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.knee.value = 22;
    comp.ratio.value = 3.2;
    comp.attack.value = 0.008;
    comp.release.value = 0.22;
    this.master = ctx.createGain();
    this.master.gain.value = 0.9;
    this.master.connect(comp).connect(ctx.destination);

    // Реверб
    const verb = ctx.createConvolver();
    verb.buffer = this._makeIR(2.2, 2.6);
    this.reverb = ctx.createGain();
    this.reverb.gain.value = 0.9;
    verb.connect(this.reverb).connect(this.master);

    // Дилэй
    const delay = ctx.createDelay(1.2);
    delay.delayTime.value = 0.34;
    const fb = ctx.createGain();
    fb.gain.value = 0.24;
    const dlp = ctx.createBiquadFilter();
    dlp.type = 'lowpass'; dlp.frequency.value = 2400;
    delay.connect(dlp).connect(fb).connect(delay);
    this.delaySend = ctx.createGain();
    this.delaySend.gain.value = 0.5;
    dlp.connect(this.delaySend).connect(this.master);

    this.musicBus = ctx.createGain();
    this.musicBus.gain.value = this.volumes.music;
    this.musicBus.connect(this.master);

    this.sfxBus = ctx.createGain();
    this.sfxBus.gain.value = this.volumes.sfx;
    this.sfxBus.connect(this.master);
    this.sfxVerb = ctx.createGain();
    this.sfxVerb.gain.value = 0.22;
    this.sfxBus.connect(this.sfxVerb).connect(verb);

    this.ambBus = ctx.createGain();
    this.ambBus.gain.value = this.volumes.ambient;
    this.ambBus.connect(this.master);

    this.noiseBuffer = this._makeNoise(3);

    // Каналы для слоёв музыки
    const mk = (gain, wet, dly) => {
      const g = ctx.createGain();
      g.gain.value = gain;
      g.connect(this.musicBus);
      if (wet > 0) {
        const w = ctx.createGain();
        w.gain.value = wet;
        g.connect(w).connect(verb);
      }
      if (dly > 0) {
        const d = ctx.createGain();
        d.gain.value = dly;
        g.connect(d).connect(delay);
      }
      return g;
    };
    this.channels = {
      pad: mk(0.9, 0.55, 0.12),
      bass: mk(0.9, 0.16, 0),
      arp: mk(0.9, 0.4, 0.3),
      lead: mk(1.0, 0.45, 0.28),
      perc: mk(0.9, 0.12, 0),
    };

    this.ready = true;
    ctx.onstatechange = () => this._onStateChange();
    this.startAmbient();
    // Свежесозданный контекст на iOS (и в установленном приложении) часто
    // стартует в 'suspended' — без явного resume() звука не будет вообще.
    await this.resume();
  }

  /**
   * Возобновляет звук. Возвращает true, если контекст действительно завёлся.
   * Вызывать из пользовательского жеста (тап/клик) — этого требует iOS.
   */
  async resume() {
    const ctx = this.ctx;
    if (!ctx) { await this.init(); return !!(this.ctx && this.ctx.state === 'running'); }
    if (ctx.state === 'running') return true;
    try { await ctx.resume(); } catch (e) { /* нет жеста — попробуем на следующем тапе */ }
    if (ctx.state === 'running') {
      this._resyncBars();
      return true;
    }
    return false;
  }

  /**
   * Сворачивание/уход со страницы: мягко усыпляем контекст.
   * Иначе Android продолжает «дорисовывать» такты из очереди, а вернувшись
   * мы получаем пачку наложенных звуков — треск и шум.
   */
  sleep() {
    if (!this.ready || !this.ctx) return;
    if (this.ctx.state === 'running') {
      try { this.ctx.suspend(); } catch (e) { /* noop */ }
    }
  }

  /** Дёшево вызывается на каждый тап: будит контекст, если он уснул. */
  wake() {
    if (!this.ready) { this.init(); return; }
    if (this.ctx && this.ctx.state !== 'running') this.resume();
  }

  /**
   * Ставит сетку тактов заново. Нужна после паузы: часы контекста стоят,
   * а планировщик успевает «накопить» недоигранные такты.
   */
  _resyncBars() {
    if (!this.ctx) return;
    this.nextBarAt = this.ctx.currentTime + 0.12;
  }

  _onStateChange() {
    const ctx = this.ctx;
    if (!ctx) return;
    if (ctx.state === 'running') {
      this._resyncBars();
      if (this.ready && this.playing && this.musicOn && !this.scheduleTimer) {
        this.scheduleTimer = setInterval(() => this._tick(), TICK_MS);
        this._tick();
      }
    }
  }

  _makeIR(seconds, decay) {
    const ctx = this.ctx;
    const rate = ctx.sampleRate;
    const len = Math.floor(rate * seconds);
    const buf = ctx.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      let lp = 0;
      for (let i = 0; i < len; i++) {
        const t = i / len;
        const n = Math.random() * 2 - 1;
        lp = lp * 0.7 + n * 0.3;
        const pre = i < rate * 0.012 ? i / (rate * 0.012) : 1;
        d[i] = lp * Math.pow(1 - t, decay) * pre * 0.7;
      }
    }
    return buf;
  }

  _makeNoise(seconds) {
    const ctx = this.ctx;
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < len; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99765 * b0 + white * 0.099;
        b1 = 0.963 * b1 + white * 0.2965;
        b2 = 0.57 * b2 + white * 1.0526;
        d[i] = (b0 + b1 + b2 + white * 0.1848) * 0.22;
      }
    }
    return buf;
  }

  setVolumes(v) {
    Object.assign(this.volumes, v);
    if (!this.ready) return;
    this.musicBus.gain.setTargetAtTime(this.musicOn ? this.volumes.music : 0, this.ctx.currentTime, 0.06);
    this.sfxBus.gain.setTargetAtTime(this.volumes.sfx, this.ctx.currentTime, 0.06);
    this.ambBus.gain.setTargetAtTime(this.volumes.ambient, this.ctx.currentTime, 0.12);
  }

  // ─────────── инструменты ───────────
  _env(t, peak, attack, decay, sustain = 0.0001, hold = 0) {
    const g = this.ctx.createGain();
    const p = Math.max(0.0001, peak);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(p, t + Math.max(0.004, attack));
    if (hold > 0) g.gain.setValueAtTime(p, t + attack + hold);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0001, sustain), t + attack + hold + Math.max(0.05, decay));
    return g;
  }

  _osc(type, freq, t, dur, detune = 0) {
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    o.detune.value = detune;
    o.start(t);
    o.stop(t + dur + 0.05);
    return o;
  }

  _noiseHit(t, dur) {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;
    const off = Math.random() * 2;
    src.start(t, off);
    src.stop(t + dur + 0.05);
    return src;
  }

  _inst(name, freq, t, dur, vel, out) {
    const ctx = this.ctx;
    const v = Math.max(0.001, vel);
    switch (name) {
      case 'kalimba': {
        const g = this._env(t, v * 0.5, 0.004, 0.9, 0.0001);
        g.connect(out);
        const a = this._osc('sine', freq, t, dur + 0.6);
        const b = this._osc('sine', freq * 3.01, t, dur + 0.3);
        const bg = ctx.createGain(); bg.gain.value = 0.12;
        const c = this._osc('sine', freq * 6.2, t, 0.25);
        const cg = ctx.createGain(); cg.gain.value = 0.05;
        a.connect(g);
        b.connect(bg).connect(g);
        c.connect(cg).connect(g);
        break;
      }
      case 'marimba': {
        const g = this._env(t, v * 0.5, 0.003, 0.55, 0.0001);
        g.connect(out);
        this._osc('sine', freq, t, dur + 0.5).connect(g);
        const h = ctx.createGain(); h.gain.value = 0.22;
        this._osc('sine', freq * 4.0, t, 0.28).connect(h).connect(g);
        const n = this._noiseHit(t, 0.05);
        const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq * 3; f.Q.value = 2;
        const ng = ctx.createGain(); ng.gain.value = 0.04 * v;
        n.connect(f).connect(ng).connect(g);
        break;
      }
      case 'musicBox': {
        const g = this._env(t, v * 0.45, 0.002, 1.5, 0.0001);
        g.connect(out);
        this._osc('sine', freq, t, dur + 1.2).connect(g);
        const h = ctx.createGain(); h.gain.value = 0.15;
        this._osc('sine', freq * 2.0, t, 0.7).connect(h).connect(g);
        const h2 = ctx.createGain(); h2.gain.value = 0.05;
        this._osc('sine', freq * 5.4, t, 0.35).connect(h2).connect(g);
        break;
      }
      case 'bell': {
        const g = this._env(t, v * 0.42, 0.002, 1.9, 0.0001);
        g.connect(out);
        const car = this._osc('sine', freq, t, dur + 1.5);
        const mod = this._osc('sine', freq * 2.76, t, dur + 1.5);
        const mg = ctx.createGain();
        mg.gain.setValueAtTime(freq * 2.4, t);
        mg.gain.exponentialRampToValueAtTime(freq * 0.05, t + 1.6);
        mod.connect(mg).connect(car.frequency);
        car.connect(g);
        break;
      }
      case 'rhodes': {
        const g = this._env(t, v * 0.42, 0.006, 1.5, 0.0001);
        g.connect(out);
        const car = this._osc('sine', freq, t, dur + 1.2);
        const mod = this._osc('sine', freq, t, dur + 1.2);
        const mg = ctx.createGain();
        mg.gain.setValueAtTime(freq * 1.1, t);
        mg.gain.exponentialRampToValueAtTime(freq * 0.02, t + 1.2);
        mod.connect(mg).connect(car.frequency);
        const trem = ctx.createGain(); trem.gain.value = 1;
        const lfo = this._osc('sine', 4.5, t, dur + 1.2);
        const lg = ctx.createGain(); lg.gain.value = 0.16 * v;
        lfo.connect(lg).connect(trem.gain);
        car.connect(trem).connect(g);
        break;
      }
      case 'flute': {
        const g = this._env(t, v * 0.4, 0.075, Math.max(0.5, dur * 0.75), v * 0.22, Math.max(0.1, dur * 0.55));
        g.connect(out);
        const o = this._osc('sine', freq, t, dur + 0.9);
        const o2 = this._osc('triangle', freq * 2, t, dur + 0.9);
        const o2g = ctx.createGain(); o2g.gain.value = 0.04;
        const vib = this._osc('sine', 5.2, t, dur + 0.9);
        const vg = ctx.createGain();
        vg.gain.setValueAtTime(0, t);
        vg.gain.linearRampToValueAtTime(freq * 0.008, t + 0.35);
        vib.connect(vg).connect(o.frequency);
        o.connect(g);
        o2.connect(o2g).connect(g);
        // дыхание
        const n = this._noiseHit(t, dur + 0.4);
        const bp = ctx.createBiquadFilter(); bp.type = 'bandpass';
        bp.frequency.value = freq * 2; bp.Q.value = 1.1;
        const ng = ctx.createGain();
        ng.gain.setValueAtTime(0.0001, t);
        ng.gain.linearRampToValueAtTime(0.05 * v * ((this.track && this.track.lead && this.track.lead.breath) || 0.6), t + 0.08);
        ng.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.3);
        n.connect(bp).connect(ng).connect(out);
        break;
      }
      case 'pluck':
      case 'guitar': {
        const g = this._env(t, v * 0.4, 0.005, name === 'guitar' ? 1.3 : 0.8, 0.0001);
        g.connect(out);
        const o = this._osc('sawtooth', freq, t, dur + 1.0, -4);
        const o2 = this._osc('sawtooth', freq, t, dur + 1.0, 5);
        const f = ctx.createBiquadFilter();
        f.type = 'lowpass'; f.Q.value = 1.2;
        f.frequency.setValueAtTime(Math.min(5200, freq * 9), t);
        f.frequency.exponentialRampToValueAtTime(Math.max(300, freq * 1.6), t + 0.35);
        const mix = ctx.createGain(); mix.gain.value = 0.5;
        o.connect(f); o2.connect(f);
        f.connect(mix).connect(g);
        const n = this._noiseHit(t, 0.06);
        const nf = ctx.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = 2400; nf.Q.value = 1.4;
        const ng = ctx.createGain(); ng.gain.value = 0.09 * v;
        n.connect(nf).connect(ng).connect(g);
        break;
      }
      case 'warmPad':
      case 'softPad':
      case 'airyPad':
      case 'waterPad':
      case 'glassPad': {
        const cfg = { warmPad: [900, 0.28], softPad: [1200, 0.2], airyPad: [1500, 0.12], waterPad: [700, 0.24], glassPad: [2200, 0.14] }[name];
        const g = ctx.createGain();
        const atk = Math.max(0.4, (this._padAtk || 1.4));
        const rel = Math.max(0.6, (this._padRel || 1.6));
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(v * 0.5, t + atk);
        g.gain.setValueAtTime(v * 0.5, t + Math.max(atk + 0.1, dur));
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur + rel);
        g.connect(out);
        const f = ctx.createBiquadFilter();
        f.type = 'lowpass'; f.frequency.value = cfg[0]; f.Q.value = 0.6;
        f.connect(g);
        const detunes = name === 'glassPad' ? [-9, 0, 8] : [-6, 0, 7];
        detunes.forEach((d) => {
          const o = this._osc(name === 'airyPad' ? 'triangle' : 'sawtooth', freq, t, dur + rel + 0.2, d);
          const og = ctx.createGain(); og.gain.value = cfg[1];
          o.connect(og).connect(f);
        });
        if (name === 'glassPad' || name === 'airyPad') {
          const o2 = this._osc('sine', freq * 2, t, dur + rel + 0.2, 2);
          const g2 = ctx.createGain(); g2.gain.value = 0.12;
          o2.connect(g2).connect(f);
        }
        // мягкое дыхание
        const n = this._noiseHit(t, dur + rel + 0.2);
        const nf = ctx.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = 1000; nf.Q.value = 0.6;
        const ng = ctx.createGain();
        ng.gain.setValueAtTime(0.0001, t);
        ng.gain.linearRampToValueAtTime(0.012 * v, t + atk + 0.3);
        ng.gain.exponentialRampToValueAtTime(0.0001, t + dur + rel);
        n.connect(nf).connect(ng).connect(out);
        break;
      }
      case 'softBass':
      case 'deepBass':
      case 'roundBass':
      case 'fingerBass': {
        const g = this._env(t, v * 0.55, name === 'fingerBass' ? 0.008 : 0.02, 0.55, 0.0001);
        g.connect(out);
        const o = this._osc(name === 'fingerBass' ? 'triangle' : 'sine', freq, t, dur + 0.7);
        const o2 = this._osc('sine', freq * 2, t, dur + 0.5);
        const g2 = ctx.createGain(); g2.gain.value = name === 'roundBass' ? 0.3 : 0.12;
        const f = ctx.createBiquadFilter(); f.type = 'lowpass';
        f.frequency.setValueAtTime(name === 'deepBass' ? 220 : 520, t);
        f.frequency.exponentialRampToValueAtTime(120, t + 0.6);
        o.connect(f); o2.connect(g2).connect(f);
        f.connect(g);
        break;
      }
      case 'shaker':
      case 'brush': {
        const n = this._noiseHit(t, name === 'shaker' ? 0.12 : 0.22);
        const hp = ctx.createBiquadFilter();
        hp.type = name === 'shaker' ? 'highpass' : 'bandpass';
        hp.frequency.value = name === 'shaker' ? 6200 : 2600;
        hp.Q.value = 0.9;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(v * 0.5, t + 0.006);
        g.gain.exponentialRampToValueAtTime(0.0001, t + (name === 'shaker' ? 0.11 : 0.24));
        n.connect(hp).connect(g).connect(out);
        break;
      }
      default: {
        const g = this._env(t, v * 0.3, 0.01, 0.7, 0.0001);
        g.connect(out);
        this._osc('triangle', freq, t, dur + 0.5).connect(g);
      }
    }
  }

  // ─────────── музыка ───────────
  get track() { return TRACKS[this.trackIndex]; }

  startMusic(index = this.trackIndex) {
    if (!this.ready) return;
    this.trackIndex = index % TRACKS.length;
    this.playing = true;
    this.musicOn = true;
    this.musicBus.gain.cancelScheduledValues(this.ctx.currentTime);
    this.musicBus.gain.setTargetAtTime(this.volumes.music, this.ctx.currentTime, 0.2);
    this.bar = 0;
    this.nextBarAt = this.ctx.currentTime + 0.12;
    this._switching = false;
    this.markTrackStart();
    if (this.ctx.state !== 'running') this.resume();
    if (!this.scheduleTimer) {
      this.scheduleTimer = setInterval(() => this._tick(), TICK_MS);
      this._tick();
    }
  }

  markTrackStart() {
    this.trackStartedAt = Date.now();
    // Песня «длится» 4–6 минут (или ~30 тактов), затем лес меняет мелодию
    const barDur = this._barDuration();
    const bars = 24 + Math.floor(Math.random() * 14);
    this.trackLength = Math.max(150000, Math.min(360000, barDur * bars * 1000));
  }

  shouldAdvance() {
    if (!this.ready || !this.musicOn || this._switching) return false;
    return this.trackStartedAt > 0 && Date.now() - this.trackStartedAt > this.trackLength;
  }

  nextRandom() {
    if (!this.ready) return;
    let idx = this.trackIndex;
    for (let i = 0; i < 6 && idx === this.trackIndex; i++) {
      idx = Math.floor(Math.random() * TRACKS.length);
    }
    this.nextTrackTo(idx);
  }

  nextTrackTo(index) {
    if (!this.ready) return;
    this._switching = true;
    if (this.musicOn) this.musicBus.gain.setTargetAtTime(0, this.ctx.currentTime, 0.08);
    const barDur = this._barDuration();
    setTimeout(() => {
      this.trackIndex = ((index % TRACKS.length) + TRACKS.length) % TRACKS.length;
      this.bar = 0;
      this.nextBarAt = this.ctx.currentTime + 0.2;
      this.musicOn = true;
      this.musicBus.gain.cancelScheduledValues(this.ctx.currentTime);
      this.musicBus.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      this.musicBus.gain.setTargetAtTime(this.volumes.music, this.ctx.currentTime, 0.45);
      this._switching = false;
      this.markTrackStart();
    }, Math.max(120, barDur * 420));
  }

  stopMusic() {
    this.musicOn = false;
    if (this.ready) this.musicBus.gain.setTargetAtTime(0, this.ctx.currentTime, 0.25);
  }

  nextTrack(step = 1) {
    if (!this.ready) return;
    this.nextTrackTo(this.trackIndex + step);
  }

  setTrack(index) {
    if (!this.ready) return;
    if (index === this.trackIndex) return;
    this.trackIndex = index % TRACKS.length;
    this.bar = 0;
    this.nextBarAt = this.ctx.currentTime + 0.3;
    this.markTrackStart();
    if (this.musicOn) {
      this.musicBus.gain.setTargetAtTime(0.15 * this.volumes.music, this.ctx.currentTime, 0.25);
      setTimeout(() => {
        if (this.ready && this.musicOn) this.musicBus.gain.setTargetAtTime(this.volumes.music, this.ctx.currentTime, 0.5);
      }, 500);
    }
  }

  _barDuration() {
    const tr = this.track;
    return (60 / tr.bpm) * tr.beatsPerBar;
  }

  _tick() {
    if (!this.ready || !this.musicOn || this._switching) return;
    if (this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;
    const barDur = this._barDuration();
    // Таймер отстал (телефон свернули, тяжёлый кадр, троттлинг)?
    // Не догоняем упущенные такты: они наложились бы друг на друга и
    // дали бы тот самый треск/шум. Просто сдвигаем сетку вперёд.
    if (this.nextBarAt < now - barDur * 0.5) this.nextBarAt = now + 0.06;
    const horizon = now + LOOKAHEAD;
    let guard = 0;
    while (this.nextBarAt < horizon && guard++ < 4) {
      this._scheduleBar(this.bar, Math.max(this.nextBarAt, now + 0.05));
      this.nextBarAt += barDur;
      this.bar++;
    }
  }

  _scheduleBar(bar, t) {
    const tr = this.track;
    const beat = 60 / tr.bpm;
    const barDur = beat * tr.beatsPerBar;
    const scale = SCALES[tr.scale];
    const prog = tr.chords;
    let total = 0, chord = prog[0];
    for (const c of prog) { total += c.bars || 1; }
    const pos = bar % total;
    let acc = 0;
    for (const c of prog) {
      acc += c.bars || 1;
      if (pos < acc) { chord = c; break; }
    }
    const chordRootMidi = tr.root + scale[((chord.r % scale.length) + scale.length) % scale.length];
    const tones = CHORD_TYPES[chord.t] || CHORD_TYPES.maj;
    const chordNotes = tones.map((iv) => chordRootMidi + iv);

    const degToMidi = (deg, oct = 0) => {
      const n = scale.length;
      const octShift = Math.floor(deg / n);
      const idx = ((deg % n) + n) % n;
      return tr.root + scale[idx] + octShift * 12 + oct * 12;
    };

    const L = tr.layers;

    // pad
    if (L.pad) {
      this._padAtk = L.pad.attack;
      this._padRel = L.pad.release;
      const notes = [chordNotes[0] - 12, ...chordNotes].slice(0, 5);
      notes.forEach((m, i) => {
        this._inst(L.pad.inst, midiToFreq(m + L.pad.oct * 12), t + i * 0.012, barDur * 0.92, L.pad.gain * (i === 0 ? 1 : 0.8), this.channels.pad);
      });
    }

    // bass
    if (L.bass) {
      const pat = L.bass.pattern;
      pat.forEach(([bt, toneIdx, durBeats]) => {
        const m = chordNotes[toneIdx % chordNotes.length] + L.bass.oct * 12;
        this._inst(L.bass.inst, midiToFreq(m), t + bt * beat, durBeats * beat, L.bass.gain, this.channels.bass);
      });
    }

    // arp / аккордовые переливы
    if (L.arp) {
      const a = L.arp;
      const every = a.every || 1;
      if (bar % every === 0) {
        const count = Math.ceil(tr.beatsPerBar / a.rate);
        for (let i = 0; i < count; i++) {
          const step = i % a.pattern.length;
          const rawTone = a.pattern[step];
          const toneIdx = rawTone % chordNotes.length;
          const octUp = Math.floor(rawTone / chordNotes.length) * 12;
          const m = chordNotes[toneIdx] + 12 * (a.oct || 0) + octUp;
          const at = t + i * a.rate * beat;
          const vel = a.vel * (0.82 + Math.random() * 0.3) * (i % 2 === 0 ? 1 : 0.82);
          this._inst(a.inst, midiToFreq(m), at, a.rate * beat * 1.6, vel, this.channels.arp);
        }
      }
    }

    // мелодия: мотив разбит на фразы по тактам (новая фраза начинается с доли 0)
    if (L.lead) {
      const ld = L.lead;
      if (!ld._phrases) {
        const groups = [];
        let cur = [];
        for (const note of ld.motif) {
          if (note[1] === 0 && cur.length) { groups.push(cur); cur = []; }
          cur.push(note);
        }
        if (cur.length) groups.push(cur);
        ld._phrases = groups;
      }
      const phrases = ld._phrases;
      if (phrases.length) {
        const phrase = phrases[bar % phrases.length];
        phrase.forEach(([deg, start, dur, vel], i) => {
          const at = t + start * beat;
          // лёгкая вариация к концу восьмитаковой фразы
          const vary = (bar % 8 >= 6 && i === phrase.length - 1) ? 1 : 0;
          const m = degToMidi(deg + vary, ld.oct || 0);
          const v = vel * (0.9 + Math.random() * 0.2);
          this._inst(ld.inst, midiToFreq(m), at, dur * beat, v * (ld.gain || 0.15), this.channels.lead);
        });
      }
    }

    // лёгкая перкуссия
    if (L.perc) {
      L.perc.pattern.forEach((bt) => {
        this._inst(L.perc.inst, 0, t + bt * beat, 0.15, L.perc.gain, this.channels.perc);
      });
    }
  }

  // ─────────── эмбиент ───────────
  startAmbient() {
    if (!this.ready || this.ambientTimer) return;
    const ctx = this.ctx;
    // Ветер
    const wind = ctx.createBufferSource();
    wind.buffer = this.noiseBuffer;
    wind.loop = true;
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.value = 420;
    windFilter.Q.value = 0.4;
    const windGain = ctx.createGain();
    windGain.gain.value = 0.16;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.055;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.07;
    lfo.connect(lfoGain).connect(windGain.gain);
    const lfo2 = ctx.createOscillator();
    lfo2.frequency.value = 0.031;
    const lfo2Gain = ctx.createGain();
    lfo2Gain.gain.value = 160;
    lfo2.connect(lfo2Gain).connect(windFilter.frequency);
    wind.connect(windFilter).connect(windGain).connect(this.ambBus);
    wind.start();
    lfo.start(); lfo2.start();
    this.windNodes = { wind, lfo, lfo2 };

    // Дальние птицы и листья
    this.ambientTimer = setInterval(() => {
      if (!this.ready || this.ctx.state !== 'running') return;
      if (this.volumes.ambient <= 0.001) return;
      const r = Math.random();
      if (r < 0.55) this._bird();
      else if (r < 0.75) this._rustle();
      else if (r < 0.86) this._cricket();
      else if (r < 0.94) this._woodCreak();
    }, 2300);
  }

  _ambDest() {
    return this.ambBus;
  }

  _bird() {
    const ctx = this.ctx;
    const t0 = ctx.currentTime + 0.05;
    const kind = Math.random();
    const base = 1900 + Math.random() * 1500;
    const dest = this._ambDest();
    const out = ctx.createGain();
    out.gain.value = 0.05 + Math.random() * 0.05;
    out.connect(dest);
    // лёгкое панорамирование
    const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (pan) { pan.pan.value = Math.random() * 1.6 - 0.8; out.disconnect(); out.connect(pan).connect(dest); }
    const notes = 2 + Math.floor(Math.random() * 4);
    for (let i = 0; i < notes; i++) {
      const at = t0 + i * (0.09 + Math.random() * 0.06);
      const o = ctx.createOscillator();
      o.type = 'sine';
      const f0 = base * (kind < 0.5 ? 1 : 1.18) * (1 + (Math.random() - 0.5) * 0.06);
      o.frequency.setValueAtTime(f0, at);
      o.frequency.exponentialRampToValueAtTime(f0 * (kind < 0.3 ? 1.5 : 1.22), at + 0.045);
      o.frequency.exponentialRampToValueAtTime(f0 * (kind < 0.3 ? 0.9 : 1.05), at + 0.11);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, at);
      g.gain.linearRampToValueAtTime(0.6, at + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.14);
      o.connect(g).connect(out);
      o.start(at); o.stop(at + 0.2);
    }
    setTimeout(() => { try { out.disconnect(); } catch (e) { /* noop */ } }, 1600);
  }

  _rustle() {
    const ctx = this.ctx;
    const t = ctx.currentTime + 0.05;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;
    src.playbackRate.value = 0.8 + Math.random() * 0.6;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.value = 1200 + Math.random() * 2000; f.Q.value = 0.7;
    const g = ctx.createGain();
    const dur = 0.5 + Math.random() * 0.9;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.09, t + 0.18);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (pan) { pan.pan.value = Math.random() * 1.8 - 0.9; src.connect(f).connect(g).connect(pan).connect(this.ambBus); }
    else src.connect(f).connect(g).connect(this.ambBus);
    src.start(t, Math.random() * 2); src.stop(t + dur + 0.1);
  }

  _cricket() {
    const ctx = this.ctx;
    const t0 = ctx.currentTime + 0.05;
    const f = 3900 + Math.random() * 900;
    for (let i = 0; i < 5; i++) {
      const at = t0 + i * 0.055;
      const o = ctx.createOscillator();
      o.type = 'sine'; o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, at);
      g.gain.linearRampToValueAtTime(0.012, at + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.035);
      o.connect(g).connect(this.ambBus);
      o.start(at); o.stop(at + 0.05);
    }
  }

  _woodCreak() {
    const ctx = this.ctx;
    const t = ctx.currentTime + 0.05;
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(120, t);
    o.frequency.linearRampToValueAtTime(90, t + 0.8);
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.value = 320; f.Q.value = 5;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.02, t + 0.2);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    o.connect(f).connect(g).connect(this.ambBus);
    o.start(t); o.stop(t + 1);
  }

  // ─────────── SFX ───────────
  playSfx(name, opts = {}) {
    if (!this.ready || this.volumes.sfx <= 0.001) return;
    if (this.ctx.state !== 'running') { this.wake(); return; }
    const ctx = this.ctx;
    const t = ctx.currentTime + 0.005;
    const out = this.sfxBus;

    switch (name) {
      case 'swing': {
        const n = this._noiseHit(t, 0.18);
        const f = ctx.createBiquadFilter();
        f.type = 'bandpass'; f.Q.value = 1.4;
        f.frequency.setValueAtTime(700, t);
        f.frequency.exponentialRampToValueAtTime(2600, t + 0.13);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.16, t + 0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
        n.connect(f).connect(g).connect(out);
        break;
      }
      case 'hit': {
        // деревянный удар
        const o = this._osc('sine', 168, t, 0.28);
        o.frequency.exponentialRampToValueAtTime(62, t + 0.16);
        const g1 = this._env(t, 0.5, 0.004, 0.2, 0.0001);
        o.connect(g1).connect(out);
        const n = this._noiseHit(t, 0.14);
        const f = ctx.createBiquadFilter();
        f.type = 'bandpass'; f.frequency.value = 1100; f.Q.value = 0.9;
        const g2 = this._env(t, 0.32, 0.002, 0.1, 0.0001);
        n.connect(f).connect(g2).connect(out);
        const o2 = this._osc('triangle', 520, t, 0.1);
        const g3 = this._env(t, 0.1, 0.001, 0.06, 0.0001);
        o2.connect(g3).connect(out);
        break;
      }
      case 'crit': {
        this.playSfx('hit');
        [0, 0.06, 0.13].forEach((d, i) => {
          const at = t + d;
          const o = this._osc('sine', 900 + i * 420, at, 0.3);
          const g = this._env(at, 0.16, 0.002, 0.24, 0.0001);
          o.connect(g).connect(out);
        });
        break;
      }
      case 'coin': {
        const base = opts.pitch || 1;
        const at = t;
        [[1046, 0], [1568, 0.05], [2093, 0.1]].forEach(([f, d], i) => {
          const o = this._osc('sine', f * base, at + d, 0.4);
          const g = this._env(at + d, 0.075 / (i + 1), 0.002, 0.26, 0.0001);
          o.connect(g).connect(out);
        });
        break;
      }
      case 'buy': {
        [523, 659, 784, 1046].forEach((f, i) => {
          const at = t + i * 0.055;
          const o = this._osc('triangle', f, at, 0.34);
          const g = this._env(at, 0.1, 0.004, 0.28, 0.0001);
          o.connect(g).connect(out);
        });
        break;
      }
      case 'deny': {
        const o = this._osc('sawtooth', 150, t, 0.22);
        o.frequency.exponentialRampToValueAtTime(98, t + 0.18);
        const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 700;
        const g = this._env(t, 0.16, 0.005, 0.2, 0.0001);
        o.connect(f).connect(g).connect(out);
        break;
      }
      case 'rage': {
        const n = this._noiseHit(t, 0.8);
        const f = ctx.createBiquadFilter();
        f.type = 'bandpass'; f.Q.value = 1.2;
        f.frequency.setValueAtTime(300, t);
        f.frequency.exponentialRampToValueAtTime(3000, t + 0.6);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.16, t + 0.2);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
        n.connect(f).connect(g).connect(out);
        const o = this._osc('sawtooth', 60, t, 0.7);
        o.frequency.linearRampToValueAtTime(120, t + 0.5);
        const of = ctx.createBiquadFilter(); of.type = 'lowpass'; of.frequency.value = 600;
        const og = this._env(t, 0.18, 0.1, 0.55, 0.0001);
        o.connect(of).connect(og).connect(out);
        break;
      }
      case 'freeze': {
        [1568, 2093, 2637, 3136].forEach((f, i) => {
          const at = t + i * 0.04;
          const o = this._osc('sine', f, at, 0.6);
          const g = this._env(at, 0.055, 0.002, 0.55, 0.0001);
          o.connect(g).connect(out);
        });
        break;
      }
      case 'chest': {
        [523, 784, 1046, 1318].forEach((f, i) => {
          const at = t + i * 0.07;
          const o = this._osc('triangle', f, at, 0.5);
          const g = this._env(at, 0.11, 0.004, 0.45, 0.0001);
          o.connect(g).connect(out);
        });
        break;
      }
      case 'acorn': {
        const o = this._osc('sine', 700, t, 0.2);
        o.frequency.exponentialRampToValueAtTime(300, t + 0.12);
        const g = this._env(t, 0.18, 0.002, 0.16, 0.0001);
        o.connect(g).connect(out);
        break;
      }
      case 'new': {
        [659, 880, 1318].forEach((f, i) => {
          const at = t + i * 0.09;
          const o = this._osc('sine', f, at, 0.7);
          const g = this._env(at, 0.1, 0.004, 0.6, 0.0001);
          o.connect(g).connect(out);
        });
        break;
      }
      case 'festival': {
        [784, 988, 1175, 1568, 1975].forEach((f, i) => {
          const at = t + i * 0.07;
          const o = this._osc('triangle', f, at, 0.6);
          const g = this._env(at, 0.07, 0.01, 0.5, 0.0001);
          o.connect(g).connect(out);
        });
        break;
      }
      case 'tab': {
        const o = this._osc('sine', 880, t, 0.12);
        const g = this._env(t, 0.05, 0.002, 0.1, 0.0001);
        o.connect(g).connect(out);
        break;
      }
      default:
        break;
    }
  }
}

export const audio = new SoundEngine();
