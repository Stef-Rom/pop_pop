(() => {
  'use strict';

  const { TAU, OUT, circ, oval, rr, star, drawItem, drawFoe, drawAvatar, drawBucket } = window.Art;
  const $ = (s) => document.querySelector(s);
  const canvas = $('#game');
  const ctx = canvas.getContext('2d');

  // ---------- Constantes ----------
  const WALL = 18;          // largeur des rideaux
  const MY = 54;            // haut de la machine
  const MS = 0.94;          // échelle de la machine (1,10 réduit de 15 %)
  const CTRL_H = 86;        // hauteur de la zone de commande, sous le sol
  const HS = 0.95;          // échelle de la poignée (réduite de 5 %)
  const PS = 1.17;          // échelle du joueur (1,30 à l'origine, réduit de 10 %)
  const MISS_MAX = 3;       // ratés d'affilée avant de perdre une vie (Survie)
  const LEVEL_PTS = 200;    // points pour passer au niveau suivant
  const COMBO_STEP = 12;    // prises d'affilée pour gagner un cran de multiplicateur
  const RULES = 2;          // version des règles : un changement remet les records à zéro
  let W = 400;              // taille logique, recalculée selon l'écran
  let H = 700;
  let scale = 1;

  const AVATARS = [
    { id: 'leo', name: 'Léo', shirt: '#3a7bd5', skin: '#f2c49b' },
    { id: 'mia', name: 'Mia', shirt: '#9b59d0', skin: '#f2c49b' },
    { id: 'chat', name: 'Moustache', shirt: '#f39c3d', skin: '#f39c3d' },
    { id: 'cochon', name: 'Groin', shirt: '#f08fae', skin: '#f9b8cc', pop: 150, candy: 0 },
    { id: 'canard', name: 'Coin-Coin', shirt: '#ff9a1f', skin: '#ffffff', pop: 200, candy: 0 },
    { id: 'poussin', name: 'Piou', shirt: '#ffd93b', skin: '#ffd93b', pop: 200, candy: 10 },
    { id: 'bebe', name: 'Bébé', shirt: '#bfe6ff', skin: '#f6cfae', pop: 300, candy: 20 },
    { id: 'chatnoir', name: 'Minuit', shirt: '#2b2b33', skin: '#2b2b33', pop: 400, candy: 30 },
    { id: 'robot', name: 'Bip', shirt: '#8d99a3', skin: '#b8c4cc', pop: 100, candy: 0 },
    { id: 'renard', name: 'Roux', shirt: '#e8632b', skin: '#e8632b', pop: 250, candy: 20 },
    { id: 'panda', name: 'Bambou', shirt: '#2b2b33', skin: '#ffffff', pop: 350, candy: 40 },
    { id: 'fantome', name: 'Bouh', shirt: null, skin: '#ffffff', pop: 500, candy: 50 },
    { id: 'licorne', name: 'Étoile', shirt: '#ff8fc7', skin: '#ffffff', pop: 600, candy: 80 },
    // Deux super-héros originaux (pas de personnages sous licence)
    { id: 'heros', name: 'Capitaine Pop', shirt: '#1f8f5f', skin: '#f2c49b', cape: '#ffcc00', pop: 700, candy: 60 },
    { id: 'masque', name: 'Éclair', shirt: '#4a34b0', skin: '#4a34b0', cape: '#ffe14d', pop: 800, candy: 80 },
  ];
  const FREE = ['leo', 'mia', 'chat'];

  const BUCKETS = [
    { id: 'classique', name: 'Classique' },
    { id: 'dore', name: 'Doré', pop: 150, candy: 0 },
    { id: 'bonbon', name: 'Bonbon', pop: 0, candy: 40 },
    { id: 'fleurs', name: 'Fleuri', pop: 200, candy: 20 },
    { id: 'etoile', name: 'Étoilé', pop: 300, candy: 30 },
    { id: 'eclair', name: 'Orage', pop: 400, candy: 40 },
    { id: 'arc', name: 'Arc-en-ciel', pop: 0, candy: 120 },
  ];

  const TYPES = {
    pop: { pts: 1, cur: 'pop', s: 1.5 },
    caramel: { pts: 3, cur: 'pop', s: 1.5 },
    arc: { pts: 2, cur: 'pop', s: 1.55 },
    bonbon: { pts: 5, cur: 'candy', s: 1.3 },
    sucette: { pts: 10, cur: 'candy', s: 1.45 },
    brule: { pts: 0, s: 1.5 },
  };

  const THEMES = {
    cinema: {
      name: 'Cinéma', page: '#5a0d18',
      bg: ['#2a070e', '#6a1220'], glow: '255,214,140',
      sideA: '#a81c2f', sideB: '#7d1322', trim: '#e9b94a', floor: '#22060a',
      machine: '#c81e32', machineDark: '#8f1424', machineTrim: '#e9b94a', hole: '#22060a', sign: '#fff4d6',
      bulbOn: '#ffe08a', bulbOff: '#a8802a', cable: '#a8802a',
      bucket: '#fff8e6', stripe: '#d62839', rim: '#e9b94a', faces: false,
    },
    foire: {
      name: 'Fête foraine', page: '#16307a',
      bg: ['#14296e', '#2f8fd8'], glow: '255,240,170',
      sideA: '#e8322e', sideB: '#ffffff', trim: '#ffcc00', floor: '#1f7a3a',
      machine: '#18b6c9', machineDark: '#0e8796', machineTrim: '#ffcc00', hole: '#0b3550', sign: '#ffffff',
      bulbOn: '#fff3a0', bulbOff: '#e8322e', cable: '#ffcc00',
      bucket: '#ffffff', stripe: '#1f6fe0', rim: '#ffcc00', faces: false,
    },
    kawaii: {
      name: 'Kawaii', page: '#cdb8f0',
      bg: ['#a99be8', '#f7a6cc'], glow: '255,255,255',
      sideA: '#ffc7e3', sideB: '#fff0f8', trim: '#ffffff', floor: '#7fd3b0',
      machine: '#ff8fc0', machineDark: '#e56aa2', machineTrim: '#ffffff', hole: '#8a4b7a', sign: '#ffffff',
      bulbOn: '#fff7b0', bulbOff: '#c9a7ff', cable: '#ffffff',
      bucket: '#ffffff', stripe: '#ff8fc0', rim: '#ffe27a', faces: true,
    },
  };
  let th = THEMES.cinema;

  // ---------- Défis du jour et succès ----------
  const CHALLENGES = [
    { id: 'pop', text: (n) => 'Attrape ' + n + ' pop-corn', goals: [200, 300, 450], reward: 10, cum: true },
    { id: 'candy', text: (n) => 'Attrape ' + n + ' bonbons', goals: [30, 50], reward: 12, cum: true },
    { id: 'sucette', text: (n) => 'Attrape ' + n + ' sucettes', goals: [8, 12], reward: 15, cum: true },
    { id: 'games', text: (n) => 'Joue ' + n + ' parties', goals: [3, 5], reward: 8, cum: true },
    { id: 'combo', text: (n) => 'Fais un combo de ' + n, goals: [35, 50], reward: 15 },
    { id: 'score', text: (n) => 'Marque ' + n + ' points en Chrono ou Survie', goals: [250, 400], reward: 15 },
    { id: 'survie', text: (n) => 'Tiens ' + n + ' s en Survie', goals: [50, 80], reward: 15 },
    { id: 'clean', text: () => 'Finis un Chrono sans grain brûlé', goals: [1], reward: 15 },
  ];
  const CH = Object.fromEntries(CHALLENGES.map((c) => [c.id, c]));
  const ACH_REWARD = 10;

  // ---------- Sauvegarde ----------
  let rulesNotice = false;
  const SAVE_KEY = 'poppop-save-v1';
  const save = {
    pop: 0, candy: 0,
    unlocked: FREE.slice(), avatar: 'leo',
    buckets: ['classique'], bucket: 'classique',
    best: { chrono: 0, survie: 0, brique: 0, invasion: 0, empile: 0, laby: 0, rafle: 0 },
    sfx: true, music: true, theme: 'cinema', tuto: false, rules: RULES,
    stats: { games: 0, pop: 0, candy: 0, sucette: 0, burnt: 0, combo: 0, level: 1 },
    ach: [], daily: null,
    player: { id: '', name: '', grp: '' },      // profil du classement en ligne
    dirty: { chrono: false, survie: false, brique: false, invasion: false, empile: false, laby: false, rafle: false },    // records pas encore envoyés
  };
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (s && typeof s === 'object') {
      const stats = Object.assign({}, save.stats, s.stats);
      const best = Object.assign({}, save.best, s.best);
      const player = Object.assign({}, save.player, s.player);
      const dirty = Object.assign({}, save.dirty, s.dirty);
      Object.assign(save, s, { stats, best, player, dirty });
      // Ancien réglage unique "son coupé" : il coupait tout.
      if (s.mute === true && s.sfx === undefined) { save.sfx = false; save.music = false; }
      delete save.mute;
      if (!Array.isArray(save.unlocked)) save.unlocked = FREE.slice();
      if (!Array.isArray(save.buckets)) save.buckets = ['classique'];
      if (!Array.isArray(save.ach)) save.ach = [];
      if (!save.unlocked.includes(save.avatar)) save.avatar = 'leo';
      // Les anciens pseudos saisis librement ne sont plus acceptés : il faudra en tirer un nouveau.
      if (save.player.name && !/^\S+ \S+ [1-9][0-9]$/.test(save.player.name)) save.player.name = '';
      if (!save.buckets.includes(save.bucket)) save.bucket = 'classique';
      if (!THEMES[save.theme]) save.theme = 'cinema';
      // Les règles ont changé : les anciens records ne sont plus comparables, ils repartent de zéro.
      if (s.rules !== RULES) {
        rulesNotice = save.best.chrono > 0 || save.best.survie > 0;
        save.best = { chrono: 0, survie: 0, brique: save.best.brique || 0, invasion: save.best.invasion || 0, empile: save.best.empile || 0, laby: save.best.laby || 0, rafle: save.best.rafle || 0 };
        save.dirty = { chrono: false, survie: false };
        save.rules = RULES;
      }
    }
  } catch (e) { /* stockage indisponible : on joue sans sauvegarde */ }
  const persist = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) {} };

  const ACHS = [
    { id: 'first', name: 'Première séance', desc: 'Termine une partie', test: () => save.stats.games >= 1 },
    { id: 'pop500', name: 'Gourmand', desc: 'Attrape 500 pop-corn au total', test: () => save.stats.pop >= 500 },
    { id: 'pop2000', name: 'Ogre du pop-corn', desc: 'Attrape 2000 pop-corn au total', test: () => save.stats.pop >= 2000 },
    { id: 'candy100', name: 'Bec sucré', desc: 'Attrape 100 bonbons au total', test: () => save.stats.candy >= 100 },
    { id: 'combo30', name: 'Mains en or', desc: 'Fais un combo de 60', test: () => save.stats.combo >= 60 },
    { id: 'combo60', name: 'Intouchable', desc: 'Fais un combo de 120', test: () => save.stats.combo >= 120 },
    { id: 'score200', name: 'Star du Chrono', desc: 'Marque 700 points en Chrono', test: () => save.best.chrono >= 700 },
    { id: 'surv300', name: 'Survivant', desc: 'Marque 1200 points en Survie', test: () => save.best.survie >= 1200 },
    { id: 'lvl5', name: 'Machine infernale', desc: 'Atteins le niveau 5', test: () => save.stats.level >= 5 },
    { id: 'collect', name: 'Collectionneur', desc: 'Débloque tous les avatars', test: () => save.unlocked.length >= AVATARS.length },
  ];

  function today() {
    const d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }

  function ensureDaily() {
    const t = today();
    if (save.daily && save.daily.date === t && Array.isArray(save.daily.tasks)) return;
    let seed = 7;
    for (const ch of t) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
    const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    const pool = CHALLENGES.slice();
    const tasks = [];
    for (let i = 0; i < 3; i++) {
      const c = pool.splice(Math.floor(rnd() * pool.length), 1)[0];
      tasks.push({ id: c.id, goal: c.goals[Math.floor(rnd() * c.goals.length)], prog: 0, done: false });
    }
    save.daily = { date: t, tasks };
    persist();
  }

  function checkAchievements(lines) {
    for (const a of ACHS) {
      if (!save.ach.includes(a.id) && a.test()) {
        save.ach.push(a.id);
        save.candy += ACH_REWARD;
        lines.push('Succès : ' + a.name + '  +' + ACH_REWARD + ' 🍬');
      }
    }
  }

  // ---------- Son, musique et vibrations ----------
  let ac = null;
  let noiseBuf = null;
  function audio() {
    if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }
  const tone = (...a) => { if (save.sfx) beep(...a); };   // bruitages ; la musique appelle beep directement
  function beep(freq, dur = 0.08, type = 'sine', vol = 0.12, slide = 0) {
    try {
      const a = audio();
      const o = a.createOscillator();
      const gn = a.createGain();
      const t = a.currentTime;
      o.type = type;
      o.frequency.setValueAtTime(freq, t);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
      gn.gain.setValueAtTime(vol, t);
      gn.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(gn).connect(a.destination);
      o.start(t);
      o.stop(t + dur);
    } catch (e) {}
  }
  // Petit "pop" de maïs qui éclate
  function popSound(vol) {
    if (!save.sfx) return;
    try {
      const a = audio();
      if (!noiseBuf) {
        noiseBuf = a.createBuffer(1, a.sampleRate * 0.1, a.sampleRate);
        const d = noiseBuf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      }
      const src = a.createBufferSource();
      const f = a.createBiquadFilter();
      const gn = a.createGain();
      const t = a.currentTime;
      src.buffer = noiseBuf;
      f.type = 'bandpass';
      f.frequency.value = 900 + Math.random() * 1400;
      f.Q.value = 1.2;
      gn.gain.setValueAtTime(vol, t);
      gn.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
      src.connect(f).connect(gn).connect(a.destination);
      src.start(t);
      src.stop(t + 0.08);
    } catch (e) {}
  }
  const jingle = (notes, gap, type) => notes.forEach((f, i) => setTimeout(() => tone(f, 0.15, type || 'triangle', 0.11), i * (gap || 110)));
  const buzz = (ms) => { if (save.sfx && navigator.vibrate) { try { navigator.vibrate(ms); } catch (e) {} } };
  const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);

  // Une petite boucle musicale par style (0 = silence)
  const SONGS = {
    cinema: {
      bpm: 132, wave: 'triangle', bar: 8,
      mel: [72, 0, 76, 79, 84, 0, 79, 76, 74, 0, 77, 81, 79, 0, 76, 0, 72, 0, 76, 79, 84, 0, 88, 84, 83, 79, 81, 83, 84, 0, 0, 0],
      roots: [48, 53, 48, 55],
      bass: (root, pos) => (pos === 0 ? root : pos === 4 ? root + 7 : pos === 2 || pos === 6 ? root + 12 : 0),
    },
    foire: {
      bpm: 168, wave: 'square', bar: 6,
      mel: [77, 0, 81, 0, 84, 0, 82, 0, 81, 0, 79, 0, 77, 0, 81, 0, 84, 0, 86, 0, 0, 84, 0, 0, 82, 0, 79, 0, 82, 0, 81, 0, 77, 0, 81, 0, 79, 0, 76, 0, 79, 0, 77, 0, 0, 0, 0, 0],
      roots: [53, 48, 53, 58, 55, 53, 48, 53],
      bass: (root, pos) => (pos === 0 ? root : pos === 2 || pos === 4 ? root + 19 : 0),
    },
    kawaii: {
      bpm: 120, wave: 'sine', bar: 4,
      mel: [84, 0, 81, 79, 76, 0, 79, 0, 81, 84, 0, 88, 86, 0, 84, 0, 84, 0, 81, 79, 76, 0, 72, 0, 74, 76, 79, 0, 84, 0, 0, 0],
      roots: [48, 45, 41, 43, 48, 45, 43, 48],
      bass: (root, pos) => (pos === 0 ? root : pos === 2 ? root + 7 : 0),
    },
  };
  let musicTimer = 0;
  let musicStep = 0;
  function music(on) {
    clearInterval(musicTimer);
    musicTimer = 0;
    if (!on || !save.music) return;
    const song = SONGS[save.theme] || SONGS.cinema;
    const stepMs = 60000 / song.bpm / 2;
    musicStep = 0;
    musicTimer = setInterval(() => {
      if (state !== 'play' && state !== 'count') return;
      const m = song.mel[musicStep % song.mel.length];
      if (m) beep(midi(m), stepMs / 1000 * 1.6, song.wave, song.wave === 'square' ? 0.018 : 0.035);
      const bar = Math.floor(musicStep / song.bar) % song.roots.length;
      const b = song.bass(song.roots[bar], musicStep % song.bar);
      if (b) beep(midi(b), stepMs / 1000 * 1.8, 'sine', 0.05);
      musicStep++;
    }, stepMs);
  }

  // ---------- État ----------
  let state = 'menu';       // menu | count | play | pause | over
  let resumeTo = 'play';
  let mode = 'chrono';      // chrono | survie
  let g = null;
  let items = [];
  let parts = [];
  let texts = [];
  let decorT = 0;
  const machine = { x: 200, t: 0, ph: 0, shake: 0 };
  const player = { x: 200, tx: 200, lean: 0, bounce: 0 };
  const keys = { left: false, right: false, down: false };

  const groundY = () => H - 24 - CTRL_H;
  const rimY = () => groundY() - 112 * PS;
  const bucketHalf = () => (g && g.giant > 0 ? 56 : 30);
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const avatar = () => AVATARS.find((a) => a.id === save.avatar) || AVATARS[0];
  const inGame = () => state === 'play' || state === 'count' || state === 'pause';

  function resize() {
    const r = $('#app').getBoundingClientRect();
    if (!r.width || !r.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    // L'écran entier sert de terrain : au moins 400 de large et 620 de haut en unités logiques
    scale = Math.min(r.width / 400, r.height / (620 + CTRL_H));
    W = r.width / scale;
    H = r.height / scale;
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    player.tx = clamp(player.tx, WALL + 30, maxX());
    player.x = clamp(player.x, WALL + 30, maxX());
  }

  // ---------- Partie ----------
  function newGame(m) {
    mode = m;
    g = {
      time: 0, left: 60, lives: 3, score: 0, combo: 0, maxCombo: 0, spawn: 0.25,
      got: { pop: 0, candy: 0 }, n: { sucette: 0, brule: 0 },
      giant: 0, magnet: 0, hurt: 0, miss: 0, level: 1,
      event: null, nextEvent: 11 + Math.random() * 6,
      count: 3, lastTick: 11, banner: null, banked: false, recordShown: false, tuto: null, rapid: 0, invul: 0, fire: 0, benter: 0,
    };
    if (m === 'rafle') {
      g.raf = { list: [], fx: [], trail: [], last: null, waveT: 0.4, waves: 0, chain: 0, chainT: 0, streak: 0, joy: 0, missFlash: 0, frenzy: 0, frenzyT: 0, slow: 0 };
    }
    if (m === 'laby') {
      g.laby = { map: LABY_MAPS[0], dots: [], left: 0, p: null, foes: [], fx: [], pops: [], want: -1, fright: 0, magnet: 0, boost: 0, freeze: 0, chain: 0, munch: 0, run: 0, lastMunch: 0, bonus: null, bonusT: 14, dying: 0, ready: 0, clearing: 0, near: false, beat: 0 };
      labyFill();
      labyPlace();
    }
    if (m === 'empile') {
      const rows = empRows();
      g.emp = { rows, grid: Array.from({ length: rows }, () => new Array(EMP_COLS).fill(0)), cur: null, queue: [empNewPiece(), empNewPiece()], fx: [], clearRows: [], clearT: 0, streak: 0, flash: null, danger: false, beat: 0, fall: 0, lockT: 0, moveT: 0, spawnT: 0.2, lines: 0, joy: 0, garb: 22 };
    }
    if (m === 'invasion') {
      g.wave = 1;
      g.inv = { list: [], shots: [], bombs: [], fx: [], caps: [], shields: null, charge: null, boss: null, dir: 1, ox: 0, oy: 0, total: 1, enter: 0, fire: 0.6, bombT: 2, diveT: 6, fly: null, flyT: 10, beat: 0, beatI: 0, warned: false, weapon: 'simple', weaponT: 0, bubble: false, streak: 0 };
      buildWave();
    }
    if (m === 'brique') {
      g.stage = 1;
      g.relaunch = 0.4;
      g.idle = 0;
      g.balls = [newBall()];
      g.bfx = [];
      g.bcombo = 0;
      buildBricks();
    }
    if (m === 'tuto') { g.tuto = { step: 0, n: 0, t: 0, sp: 0, moved: 0, lx: W / 2 }; g.count = 0.8; g.banked = true; }
    items = []; parts = []; texts = [];
    player.x = player.tx = W / 2;
    player.lean = 0; player.bounce = 0;
    state = 'count';
    show('hud');
    if (navDepth === 0) pushNav();   // pour que le bouton retour du téléphone mette en pause au lieu de quitter
    updateHud();
    tone(520, 0.1, 'triangle');
    music(true);
  }

  function banner(txt, col) {
    if (g) g.banner = { txt, col: col || '#fff4d6', t: 1.7 };
  }

  // Clôt la partie : butin, statistiques, défis, succès. Renvoie le bilan.
  function finish(completed) {
    if (!g || g.banked) return null;
    g.banked = true;
    music(false);
    const out = { record: false, lines: [] };
    const counted = completed || g.time > 5;
    save.pop += g.got.pop;
    save.candy += g.got.candy;
    const s = save.stats;
    s.pop += g.got.pop;
    s.candy += g.got.candy;
    s.sucette += g.n.sucette;
    s.burnt += g.n.brule;
    s.combo = Math.max(s.combo, g.maxCombo);
    // Le niveau ne compte pour les statistiques que dans les modes classiques
    if (mode === 'chrono' || mode === 'survie') s.level = Math.max(s.level, g.level);
    if (counted) s.games++;
    if (g.score > (save.best[mode] || 0)) { save.best[mode] = g.score; out.record = true; save.dirty[mode] = true; }

    ensureDaily();
    const res = {
      pop: g.got.pop, candy: g.got.candy, sucette: g.n.sucette, games: counted ? 1 : 0,
      combo: g.maxCombo,
      // Les points des modes Casse-briques et Invasion ne sont pas à la même échelle
      score: mode === 'chrono' || mode === 'survie' ? g.score : 0,
      survie: mode === 'survie' ? Math.floor(g.time) : 0,
      clean: completed && mode === 'chrono' && g.n.brule === 0 ? 1 : 0,
    };
    for (const t of save.daily.tasks) {
      const c = CH[t.id];
      if (t.done || !c) continue;
      t.prog = c.cum ? t.prog + res[t.id] : Math.max(t.prog, res[t.id]);
      if (t.prog >= t.goal) {
        t.prog = t.goal;
        t.done = true;
        save.candy += c.reward;
        out.lines.push('Défi réussi : ' + c.text(t.goal) + '  +' + c.reward + ' 🍬');
      }
    }
    checkAchievements(out.lines);
    persist();
    return out;
  }

  // Le déblocage le plus proche, pour donner un objectif en fin de partie.
  function nextUnlock() {
    const locked = AVATARS.filter((a) => !save.unlocked.includes(a.id)).concat(BUCKETS.filter((b) => !save.buckets.includes(b.id)));
    let best = null;
    for (const o of locked) {
      const np = Math.max(0, (o.pop || 0) - save.pop);
      const nc = Math.max(0, (o.candy || 0) - save.candy);
      const need = np + nc * 5;
      if (!best || need < best.need) best = { o, np, nc, need };
    }
    return best;
  }
  function nextUnlockLine() {
    const best = nextUnlock();
    if (!best) return '';
    if (best.need === 0) return 'Tu peux débloquer ' + best.o.name + ' dans le vestiaire !';
    const miss = [];
    if (best.np) miss.push(best.np + ' 🍿');
    if (best.nc) miss.push(best.nc + ' 🍬');
    return 'Encore ' + miss.join(' et ') + ' pour débloquer ' + best.o.name;
  }

  function endGame() {
    const out = finish(true);
    state = 'over';
    items = [];
    $('#overTitle').textContent = mode === 'chrono' ? 'Temps écoulé !' : 'Partie terminée';
    $('#overScore').textContent = g.score;
    const record = out && out.record && g.score > 0;
    $('#overRecord').textContent = record ? '★ Nouveau record ! ★' : 'Record : ' + save.best[mode];
    $('#overLoot').textContent = '+' + g.got.pop + ' 🍿   +' + g.got.candy + ' 🍬';
    const extra = $('#overExtra');
    extra.textContent = '';
    const lines = ['Niveau ' + g.level + ' · combo max ' + g.maxCombo].concat(out ? out.lines : []);
    const unlock = nextUnlockLine();
    if (unlock) lines.push(unlock);
    if (!save.player.name) lines.push('Choisis un pseudo dans Classement pour comparer ton score');
    // Rang au classement mondial, ajouté dès que le serveur répond
    const thisGame = g;
    const thisMode = mode;
    Promise.resolve(trySync()).then(() => {
      if (!save.player.name || !save.player.id || !window.Online) return null;
      return window.Online.top(thisMode, null, save.player.id);
    }).then((rows) => {
      const me = (rows || []).find((r) => r.me);
      if (!me || g !== thisGame || state !== 'over') return;
      const p = document.createElement('p');
      p.textContent = 'Classement mondial : ' + me.pos + (me.pos === 1 ? 'er' : 'e');
      extra.append(p);
    }).catch(() => {});
    for (const l of lines) {
      const p = document.createElement('p');
      p.textContent = l;
      extra.append(p);
    }
    const nu = nextUnlock();
    const can = !!(nu && nu.need === 0);
    $('#btnOverVest').classList.toggle('hidden', !can);
    if (can) $('#overVestHint').textContent = 'Débloque ' + nu.o.name + ' !';
    show('over');
    if (record) jingle([523, 659, 784, 1047], 120);
    else tone(330, 0.3, 'triangle', 0.12, -120);
  }

  function difficulty() {
    if (mode === 'brique' || mode === 'invasion' || mode === 'empile' || mode === 'laby' || mode === 'rafle') return 0.3;
    return (mode === 'chrono' ? g.time / 60 : g.time / 75) + (g.level - 1) * 0.12;
  }

  // Un événement est annoncé EVENT_WARN secondes avant de commencer réellement.
  const EVENT_WARN = 1.2;
  const evOn = (type) => !!(g && g.event && g.event.warn <= 0 && g.event.type === type);

  function pickType(d) {
    const ev = g.event && g.event.warn <= 0 ? g.event.type : null;
    const r = Math.random();
    if (ev === 'pluie') return r < 0.68 ? 'pop' : r < 0.86 ? 'caramel' : 'bonbon';
    const burnt = ev === 'chauffe' ? 0.55 : 0.10 + 0.16 * Math.min(d, 1.6);
    if (r < burnt) return 'brule';
    const q = (r - burnt) / (1 - burnt);
    if (q < 0.03) return 'arc';
    if (q < 0.08) return 'sucette';
    if (q < 0.21) return 'bonbon';
    if (q < 0.38) return 'caramel';
    return 'pop';
  }

  function spawn(type, quiet) {
    const dir = Math.random() < 0.5 ? -1 : 1;
    const twin = g && inGame() && g.level >= 3;       // deux goulottes à partir du niveau 3
    const k = Math.sqrt(W / 400);
    items.push({
      type,
      x: machine.x + dir * (twin ? 30 * MS : 6),
      y: MY + 112 * MS,
      vx: dir * (20 + Math.random() * 190) * k,
      vy: -90 + Math.random() * 130,
      rot: Math.random() * TAU,
      vr: (Math.random() - 0.5) * 7,
      seed: Math.random() * 360,
      free: evOn('pluie'),
    });
    machine.shake = 0.12;
    if (!quiet) popSound(0.09);
  }

  function startEvent() {
    const type = Math.random() < 0.55 ? 'pluie' : 'chauffe';
    if (type === 'pluie') {
      g.event = { type, t: 5, warn: EVENT_WARN };
      banner('Pluie de pop-corn !', '#ffe27a');
      jingle([659, 784, 988, 1175], 70);
    } else {
      g.event = { type, t: 4, warn: EVENT_WARN };
      banner('Surchauffe ! Attention !', '#ff9d6b');
      tone(220, 0.5, 'sawtooth', 0.1, 300);
      buzz(80);
    }
    g.nextEvent = 13 + Math.random() * 8;
  }

  function floatText(txt, x, y, col) {
    texts.push({ txt, x, y, life: 0.9, col });
  }

  function burst(x, y, col, n, stars) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU;
      const v = 50 + Math.random() * 150;
      parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 70, life: 0.5 + Math.random() * 0.35, max: 0.85, col, r: 2.5 + Math.random() * 3, star: stars });
    }
  }
  const ring = (x, y, col) => parts.push({ x, y, vx: 0, vy: 0, life: 0.35, max: 0.35, col, ring: true });

  function loseLife(x, y, label) {
    g.lives--;
    g.hurt = 0.5;
    floatText(label, x, y, '#ff8a8a');
    tone(130, 0.28, 'sawtooth', 0.14, -70);
    buzz(140);
    if (g.lives <= 0) endGame();
  }

  function caught(it) {
    const x = it.x;
    const y = rimY();
    if (mode === 'tuto') tutoCaught(it);
    if (it.type === 'brule') {
      g.combo = 0;
      g.n.brule++;
      shakeT = 0.35;
      slowT = 0.3;
      burst(x, y, '#6b5a55', 12);
      if (mode === 'survie') {
        loseLife(x, y - 12, '−1 ❤');
      } else {
        g.hurt = 0.5;
        g.score = Math.max(0, g.score - 10);
        floatText('−10', x, y - 12, '#ff8a8a');
        tone(130, 0.28, 'sawtooth', 0.14, -70);
        buzz(140);
      }
      return;
    }
    const T = TYPES[it.type];
    const multBefore = Math.min(5, 1 + Math.floor(g.combo / COMBO_STEP));
    g.combo++;
    g.miss = 0;
    g.maxCombo = Math.max(g.maxCombo, g.combo);
    const mult = Math.min(5, 1 + Math.floor(g.combo / COMBO_STEP));
    const pts = T.pts * mult;
    g.score += pts;
    g.got[T.cur]++;
    if (it.type === 'sucette') g.n.sucette++;
    player.bounce = 0.25;
    const sweet = T.cur === 'candy';
    const col = sweet ? '#ffb3da' : '#fff4d6';
    floatText('+' + pts, x, y - 14, col);
    burst(x, y, col, sweet ? 9 : 4, sweet);
    ring(x, y, col);
    if (it.type === 'arc') {
      if (mode === 'brique') brickPower();
      else if (Math.random() < 0.5) { g.giant = 8; banner('Seau géant !', '#9fe8ff'); }
      else { g.magnet = 8; banner('Aimant !', '#9fe8ff'); }
      tone(600, 0.25, 'triangle', 0.14, 600);
      buzz(40);
    } else {
      tone((sweet ? 700 : 520) + Math.min(g.combo, 24) * 22, 0.07, 'triangle', 0.11);
      buzz(sweet ? 20 : 10);
    }
    if (mult > multBefore) {
      banner('Combo x' + mult + ' !', '#ffd257');
      jingle([660, 880, 1100], 70);
      burst(x, y - 20, '#ffd257', 14, true);
      buzz(30);
    }
    const lvl = 1 + Math.floor(g.score / LEVEL_PTS);
    if (mode !== 'brique' && mode !== 'invasion' && lvl > g.level) {
      g.level = lvl;
      banner('Niveau ' + lvl + ' !', '#ffe27a');
      jingle([523, 659, 784], 90);
    }
    if (mode !== 'tuto' && !g.recordShown && save.best[mode] > 0 && g.score > save.best[mode]) {
      g.recordShown = true;
      banner('Nouveau record !', '#ffe27a');
      jingle([784, 988, 1175, 1568], 90);
    }
  }

  // ---------- Mode Casse-briques ----------
  // Le seau sert de raquette, un grain de maïs de balle. Les briques sont des friandises de plusieurs
  // sortes, et chacune a sa façon de disparaître : éclater, s'évaporer, tomber, se transformer, filer dans le seau.
  const BRICK_COLS = ['#ff4f9a', '#ff8a1f', '#ffd93b', '#22b96e', '#3a9cff', '#8a5cff', '#ff6b6b'];
  const BALL_R = 9;
  const BRICK_TOP = 74;
  const BRICK_ENTER = 0.8;        // durée de l'arrivée d'un niveau
  const ballSpeed = () => Math.min(540, (H - CTRL_H) * 0.42 + 26 * (g.stage - 1));
  const newBall = () => ({ x: player.x, y: rimY() - BALL_R - 3, vx: 0, vy: 0, stuck: true, trail: [] });

  function buildBricks() {
    const n = g.stage;
    const left = WALL + 8, right = W - WALL - 8, gap = 4, h = 22;
    const cols = Math.max(6, Math.round((right - left) / 54));
    const bw = (right - left - gap * (cols - 1)) / cols;
    const rows = Math.min(4 + Math.floor((n - 1) / 2), 7);
    const shape = (n - 1) % 4;      // plein, damier, pyramide, colonnes
    const mid = (cols - 1) / 2;
    let bonus = 0, boom = 0;
    g.bricks = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (shape === 1 && (r + c) % 2) continue;
        if (shape === 2 && Math.abs(c - mid) > mid - r * 0.7 + 0.01) continue;
        if (shape === 3 && c % 3 === 2) continue;
        let kind = 'bonbon';
        let hp = 1;
        const roll = Math.random();
        if (roll < 0.08) { if (n >= 2) kind = 'brule'; }
        else if (roll < 0.12) { if (bonus < 2) { kind = 'arc'; bonus++; } }
        else if (roll < 0.17) { if (n >= 2 && boom < 3) { kind = 'petard'; boom++; } }
        else if (roll < 0.27) kind = 'pop';
        else if (roll < 0.35) kind = 'friandise';
        else if (roll < 0.43) kind = 'sucre';
        if (kind === 'bonbon' && n >= 2 && r < Math.min(n - 1, 3)) { kind = 'caramel'; hp = 2; }
        g.bricks.push({ x: left + c * (bw + gap), y: BRICK_TOP + r * (h + gap), w: bw, h, c, r, hp, kind, hit: 0, seed: Math.random() * 360, col: BRICK_COLS[r % BRICK_COLS.length] });
      }
    }
    g.benter = BRICK_ENTER;
  }

  function stickBall() {
    for (const b of g.balls) {
      if (!b.stuck) continue;
      b.x = player.x;
      b.y = rimY() - BALL_R - 3;
    }
  }

  function launchBall(b) {
    const s = ballSpeed();
    const a = (Math.random() - 0.5) * 0.9;
    b.vx = Math.sin(a) * s;
    b.vy = -Math.cos(a) * s;
    b.stuck = false;
    tone(660, 0.08, 'triangle');
  }

  // Bonus du pop-corn arc-en-ciel, propres à ce mode
  function brickPower() {
    const r = Math.random();
    const flying = g.balls.filter((b) => !b.stuck);
    if (r < 0.34 || !flying.length) {
      g.giant = 10;
      banner('Seau géant !', '#9fe8ff');
    } else if (r < 0.67) {
      for (const b of flying) {
        for (const da of [-0.5, 0.5]) {
          if (g.balls.length >= 5) break;
          const a = Math.atan2(b.vx, -b.vy) + da;
          const s = ballSpeed();
          g.balls.push({ x: b.x, y: b.y, vx: Math.sin(a) * s, vy: -Math.abs(Math.cos(a) * s), stuck: false, trail: [] });
        }
      }
      banner('Multi-grains !', '#9fe8ff');
    } else {
      g.fire = 7;
      banner('Grain de feu !', '#ffb347');
    }
  }

  function hitBrick(k) {
    g.idle = 0;
    k.hp--;
    if (k.hp > 0) {
      k.hit = 0.18;
      tone(300, 0.05, 'square', 0.05);
      burst(k.x + k.w / 2, k.y + k.h / 2, '#ffe0a0', 3);
      return;
    }
    killBrick(k);
  }

  function killBrick(k) {
    const cx = k.x + k.w / 2, cy = k.y + k.h / 2;
    k.hp = 0;
    // Les briques cassées d'affilée, sans retoucher le seau, rapportent de plus en plus
    g.bcombo++;
    const mult = Math.min(5, g.bcombo);
    const pts = 5 * g.stage * mult;
    g.score += pts;
    floatText('+' + pts, cx, cy, mult > 1 ? '#ffd257' : '#fff4d6');
    buzz(8);

    const fx = { kind: k.kind, col: k.col, seed: k.seed, x: cx, y: cy, w: k.w, h: k.h, t: 0, dur: 0.32, type: 'eclate', item: null, rot: 0, vx: 0, vy: 0, vr: 0, big: false };
    const morph = (item, dur) => { fx.type = 'transforme'; fx.item = item; fx.dur = dur; };
    if (k.kind === 'pop') morph(Math.random() < 0.75 ? 'pop' : 'caramel', 0.3);          // se détache et tombe
    else if (k.kind === 'brule') morph('brule', 0.3);
    else if (k.kind === 'arc') morph('arc', 0.36);
    else if (k.kind === 'friandise') { fx.type = 'collecte'; fx.item = 'bonbon'; fx.dur = 0.55; }   // file dans le seau
    else if (k.kind === 'sucre') fx.type = 'evapore';
    else if (k.kind === 'petard') fx.big = true;
    else if (Math.random() < 0.3) {
      const r = Math.random();
      morph(r < 0.5 ? 'pop' : r < 0.75 ? 'caramel' : r < 0.94 ? 'bonbon' : 'sucette', 0.36);
    } else {
      const ways = k.kind === 'caramel' ? ['tombe', 'eclate'] : ['eclate', 'evapore', 'tombe'];
      fx.type = ways[Math.floor(Math.random() * ways.length)];
    }

    if (fx.type === 'evapore') {
      fx.dur = 0.8;
      tone(520, 0.28, 'sine', 0.06, 700);
    } else if (fx.type === 'tombe') {
      fx.dur = 1.2;
      fx.vx = (Math.random() - 0.5) * 110;
      fx.vy = -120;
      fx.vr = (Math.random() < 0.5 ? -1 : 1) * (5 + Math.random() * 5);
      tone(420, 0.3, 'triangle', 0.07, -280);
    } else if (fx.type === 'eclate') {
      burst(cx, cy, k.kind === 'brule' ? '#6b5a55' : k.kind === 'petard' ? '#ffd257' : k.col, fx.big ? 18 : 9, fx.big);
      ring(cx, cy, fx.big ? '#ffd257' : '#ffffff');
      popSound(fx.big ? 0.2 : 0.12);
    } else if (fx.type === 'collecte') {
      jingle([988, 1319], 60);
    } else {
      tone(700 + Math.random() * 200, 0.06, 'triangle', 0.09);
    }
    g.bfx.push(fx);

    // Le pétard emporte ses voisines
    if (k.kind === 'petard') {
      shakeT = 0.22;
      for (const o of g.bricks) if (o.hp > 0 && Math.abs(o.c - k.c) <= 1 && Math.abs(o.r - k.r) <= 1) killBrick(o);
    }
    if (!g.recordShown && save.best.brique > 0 && g.score > save.best.brique) {
      g.recordShown = true;
      banner('Nouveau record !', '#ffe27a');
      jingle([784, 988, 1175, 1568], 90);
    }
  }

  function updateBfx(dt) {
    for (let i = g.bfx.length - 1; i >= 0; i--) {
      const f = g.bfx[i];
      f.t += dt;
      if (f.type === 'tombe') { f.vy += 760 * dt; f.x += f.vx * dt; f.y += f.vy * dt; f.rot += f.vr * dt; }
      else if (f.type === 'evapore') f.y -= 44 * dt;
      if (f.t < f.dur) continue;
      if (f.type === 'transforme') {
        items.push({ type: f.item, x: f.x, y: f.y, vx: (Math.random() - 0.5) * 40, vy: -50, rot: 0, vr: (Math.random() - 0.5) * 5, seed: f.seed, free: true });
      } else if (f.type === 'collecte') {
        // La friandise arrive dans le seau : elle est comptée tout de suite
        const pts = 5 * g.stage;
        g.score += pts;
        g.got.candy++;
        player.bounce = 0.25;
        floatText('+' + pts, player.x, rimY() - 14, '#ffb3da');
        burst(player.x, rimY(), '#ffb3da', 8, true);
        tone(900, 0.07, 'triangle', 0.1);
      }
      g.bfx.splice(i, 1);
    }
  }

  function brickUpdate(dt) {
    g.fire = Math.max(0, g.fire - dt);
    updateBfx(dt);
    for (const k of g.bricks) if (k.hit > 0) k.hit -= dt;
    if (g.benter > 0) { g.benter -= dt; stickBall(); return; }

    g.idle += dt;
    const steps = 3;
    const h = dt / steps;
    const half = bucketHalf() * PS;
    const ry = rimY();
    const fiery = g.fire > 0;
    for (let n = g.balls.length - 1; n >= 0; n--) {
      const b = g.balls[n];
      if (b.stuck) {
        b.x = player.x;
        b.y = ry - BALL_R - 3;
        g.relaunch -= dt;
        if (g.relaunch <= 0) launchBall(b);
        continue;
      }
      b.trail.push([b.x, b.y]);
      if (b.trail.length > 7) b.trail.shift();
      let lost = false;
      for (let i = 0; i < steps && !lost; i++) {
        b.x += b.vx * h;
        b.y += b.vy * h;
        if (b.x < WALL + BALL_R) { b.x = WALL + BALL_R; b.vx = Math.abs(b.vx); }
        if (b.x > W - WALL - BALL_R) { b.x = W - WALL - BALL_R; b.vx = -Math.abs(b.vx); }
        if (b.y < 58 + BALL_R) {
          b.y = 58 + BALL_R;
          b.vy = Math.abs(b.vy);
          // Aucune brique touchée depuis longtemps : on dévie la balle pour casser une trajectoire en boucle
          if (g.idle > 6) {
            const s = ballSpeed();
            const a = (Math.random() < 0.5 ? -1 : 1) * (0.35 + Math.random() * 0.5);
            b.vx = Math.sin(a) * s;
            b.vy = Math.cos(a) * s;
            g.idle = 0;
          }
        }

        // Rebond sur le seau : l'angle dépend de l'endroit touché
        if (b.vy > 0 && b.y + BALL_R >= ry && b.y + BALL_R <= ry + 18 && Math.abs(b.x - player.x) <= half + BALL_R) {
          let a = clamp((b.x - player.x) / (half + BALL_R), -1, 1) * 1.05;
          // Jamais de renvoi parfaitement vertical : la balle resterait coincée dans une colonne vide
          if (Math.abs(a) < 0.14) a = (a < 0 || (a === 0 && Math.random() < 0.5) ? -1 : 1) * 0.14;
          const s = ballSpeed();
          b.vx = Math.sin(a) * s;
          b.vy = -Math.cos(a) * s;
          b.y = ry - BALL_R;
          g.bcombo = 0;
          player.bounce = 0.2;
          tone(440, 0.05, 'triangle', 0.09);
        }

        for (const k of g.bricks) {
          if (k.hp <= 0) continue;
          const dx = b.x - clamp(b.x, k.x, k.x + k.w);
          const dy = b.y - clamp(b.y, k.y, k.y + k.h);
          if (dx * dx + dy * dy > BALL_R * BALL_R) continue;
          if (fiery) { killBrick(k); continue; }          // le grain de feu traverse tout
          if (dx === 0 && dy === 0) b.vy = -b.vy;
          else if (Math.abs(dx) > Math.abs(dy)) b.vx = dx > 0 ? Math.abs(b.vx) : -Math.abs(b.vx);
          else b.vy = dy > 0 ? Math.abs(b.vy) : -Math.abs(b.vy);
          hitBrick(k);
          break;
        }
        if (b.y - BALL_R > groundY()) lost = true;
      }
      if (lost) g.balls.splice(n, 1);
    }

    // Plus aucune balle en jeu : une vie perdue
    if (!g.balls.length) {
      loseLife(player.x, groundY() - 40, '−1 ❤');
      if (state !== 'play') return;
      g.bcombo = 0;
      g.fire = 0;
      g.relaunch = 1;
      g.balls = [newBall()];
    }

    if (!g.bricks.some((k) => k.hp > 0) && !g.bfx.length) {
      g.stage++;
      g.level = g.stage;
      g.score += 50 * (g.stage - 1);
      g.fire = 0;
      banner('Niveau ' + g.stage + ' !', '#ffe27a');
      jingle([523, 659, 784, 1047], 90);
      buildBricks();
      g.relaunch = 0.5;
      g.balls = [newBall()];
    }
  }

  // Dessine une brique dans le rectangle donné
  function drawBrickShape(x, y, w, h, k, flash) {
    const cx = x + w / 2, cy = y + h / 2;
    if (k.kind === 'pop' || k.kind === 'friandise') {
      // Une friandise posée dans son alvéole : elle se détache quand on la touche
      ctx.fillStyle = 'rgba(0,0,0,.28)'; rr(ctx, x, y, w, h, 6); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 1.4; rr(ctx, x + 0.7, y + 0.7, w - 1.4, h - 1.4, 6); ctx.stroke();
      ctx.save();
      ctx.translate(cx, cy + (k.kind === 'pop' ? 1 : 0));
      const s = k.kind === 'pop' ? h / 26 : h / 21;
      ctx.scale(s, s);
      drawItem(ctx, k.kind === 'pop' ? 'pop' : 'bonbon', { t: machine.t, seed: k.seed, face: th.faces });
      ctx.restore();
      return;
    }
    let col = k.col;
    if (k.kind === 'arc') col = 'hsl(' + Math.round((machine.t * 160 + x) % 360) + ',90%,66%)';
    else if (k.kind === 'caramel') col = k.hp > 1 ? '#b8690f' : '#eaa53c';
    else if (k.kind === 'brule') col = '#3a2a25';
    else if (k.kind === 'sucre') col = '#f4f8ff';
    else if (k.kind === 'petard') col = '#d62839';
    ctx.fillStyle = OUT; rr(ctx, x - 1.2, y - 1.2, w + 2.4, h + 2.4, 6.5); ctx.fill();
    ctx.fillStyle = col; rr(ctx, x, y, w, h, 5.5); ctx.fill();
    ctx.fillStyle = k.kind === 'sucre' ? 'rgba(120,160,220,.3)' : 'rgba(0,0,0,.16)'; rr(ctx, x, y + h - 7, w, 7, 4); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.34)'; rr(ctx, x + 3, y + 3, w - 6, 5, 2.5); ctx.fill();
    if (k.kind === 'caramel' && k.hp === 1) {
      ctx.strokeStyle = 'rgba(90,40,0,.75)';
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(cx - 9, y + 2); ctx.lineTo(cx - 2, cy); ctx.lineTo(cx - 7, cy + 3); ctx.lineTo(cx + 3, y + h - 2); ctx.stroke();
    } else if (k.kind === 'brule') {
      ctx.strokeStyle = '#ff6a2a';
      ctx.lineWidth = 2.6;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(cx - 5, cy - 5); ctx.lineTo(cx + 5, cy + 5); ctx.moveTo(cx + 5, cy - 5); ctx.lineTo(cx - 5, cy + 5); ctx.stroke();
    } else if (k.kind === 'arc') {
      ctx.fillStyle = '#fff';
      star(ctx, cx, cy, 7);
    } else if (k.kind === 'sucre') {
      ctx.fillStyle = '#9cc4ff';
      star(ctx, cx - w * 0.22, cy, 4); star(ctx, cx + w * 0.2, cy - 1, 3);
    } else if (k.kind === 'petard') {
      ctx.fillStyle = '#ffd257';
      star(ctx, cx, cy, 8.5);
      ctx.fillStyle = '#fff';
      circ(ctx, cx, cy, 2.2);
    }
    if (flash > 0) {
      ctx.fillStyle = 'rgba(255,255,255,' + Math.min(0.85, flash * 5) + ')';
      rr(ctx, x, y, w, h, 5.5); ctx.fill();
    }
  }

  function drawBricks() {
    // Les briques d'un nouveau niveau descendent du haut de l'écran
    const e = g.benter > 0 ? g.benter / BRICK_ENTER : 0;
    const oy = -e * e * 280;
    for (const k of g.bricks) {
      if (k.hp > 0) drawBrickShape(k.x, k.y + oy, k.w, k.h, k, k.hit);
    }

    // Disparitions en cours
    for (const f of g.bfx) {
      const p = clamp(f.t / f.dur, 0, 1);
      const k = { kind: f.kind, col: f.col, seed: f.seed, hp: 1 };
      ctx.save();
      if (f.type === 'evapore') {
        // Elle blanchit, monte et s'efface
        ctx.translate(f.x, f.y);
        ctx.globalAlpha = 1 - p;
        ctx.scale(1 + p * 0.35, 1 + p * 0.35);
        drawBrickShape(-f.w / 2, -f.h / 2, f.w, f.h, k, 0.1 + p);
        ctx.fillStyle = 'rgba(255,255,255,.75)';
        circ(ctx, -f.w * 0.25 + Math.sin(f.t * 9) * 4, -f.h * 0.7 - p * 14, 4 + p * 4);
        circ(ctx, f.w * 0.22 + Math.cos(f.t * 8) * 4, -f.h * 0.9 - p * 18, 3 + p * 4);
      } else if (f.type === 'tombe') {
        ctx.translate(f.x, f.y);
        ctx.globalAlpha = p > 0.7 ? (1 - p) / 0.3 : 1;
        ctx.rotate(f.rot);
        drawBrickShape(-f.w / 2, -f.h / 2, f.w, f.h, k, 0);
      } else if (f.type === 'transforme') {
        ctx.translate(f.x, f.y);
        ctx.save();
        ctx.rotate(p * 3);
        ctx.scale(1 - p, 1 - p);
        drawBrickShape(-f.w / 2, -f.h / 2, f.w, f.h, k, p * 0.2);
        ctx.restore();
        const s = TYPES[f.item].s * p;
        ctx.scale(s, s);
        drawItem(ctx, f.item, { t: machine.t, seed: f.seed, face: th.faces });
      } else if (f.type === 'collecte') {
        // La friandise file vers le seau en décrivant une courbe
        const e2 = p * p;
        const tx = f.x + (player.x - f.x) * e2, ty = f.y + (rimY() - f.y) * e2 - Math.sin(p * Math.PI) * 46;
        ctx.translate(tx, ty);
        ctx.rotate(p * 7);
        ctx.scale(1.15, 1.15);
        drawItem(ctx, 'bonbon', { t: machine.t, seed: f.seed, face: th.faces });
      } else {
        ctx.translate(f.x, f.y);
        ctx.globalAlpha = 1 - p;
        ctx.fillStyle = f.big ? '#ffd257' : '#ffffff';
        circ(ctx, 0, 0, (f.big ? 22 : 10) + p * (f.big ? 60 : 26));
      }
      ctx.restore();
    }
  }

  // Les balles : des grains de maïs, avec leur traînée
  function drawBall() {
    const fiery = g.fire > 0;
    for (const b of g.balls) {
      if (b.stuck) {
        // Pointillé indiquant le départ de la balle
        ctx.strokeStyle = 'rgba(255,255,255,.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 8]);
        ctx.beginPath(); ctx.moveTo(b.x, b.y - BALL_R - 4); ctx.lineTo(b.x, b.y - 70); ctx.stroke();
        ctx.setLineDash([]);
      }
      b.trail.forEach(([tx, ty], i) => {
        ctx.fillStyle = fiery ? 'rgba(255,120,30,' + (0.07 * (i + 1)) + ')' : 'rgba(255,220,120,' + (0.05 * (i + 1)) + ')';
        circ(ctx, tx, ty, BALL_R * (0.45 + i * 0.07));
      });
      if (fiery) { ctx.fillStyle = 'rgba(255,90,20,.4)'; circ(ctx, b.x, b.y, BALL_R + 6 + Math.sin(machine.t * 30) * 1.5); }
      ctx.fillStyle = OUT; circ(ctx, b.x, b.y, BALL_R + 1.6);
      ctx.fillStyle = fiery ? '#ff7a1f' : '#ffc928'; circ(ctx, b.x, b.y, BALL_R);
      ctx.fillStyle = fiery ? '#d63a0a' : '#e59a12'; oval(ctx, b.x + 1.5, b.y + 3, BALL_R * 0.75, BALL_R * 0.5, 0);
      ctx.fillStyle = fiery ? '#ff7a1f' : '#ffc928'; oval(ctx, b.x + 0.5, b.y + 1.2, BALL_R * 0.78, BALL_R * 0.5, 0);
      ctx.fillStyle = 'rgba(255,255,255,.8)'; circ(ctx, b.x - 3, b.y - 3.4, 2.4);
    }
  }

  // ---------- Mode Invasion ----------
  // Une troupe de grains descend en rangs. Le seau tire des pop-corn tout seul ;
  // il faut viser avec la poignée, esquiver les braises et rattraper ce qui tombe.
  const INV_TOP = 96;
  const INV_ENTER = 0.9;          // durée de l'arrivée d'une vague
  const INV_BOSS_EVERY = 4;       // une vague sur quatre est celle d'un roi
  // deaths : les façons de disparaître possibles pour ce type d'ennemi
  const FOES = {
    brule: { pts: 10, hp: 1, size: 1, shoots: true, drop: 0.2, deaths: ['eclate', 'evapore', 'tombe'] },
    braise: { pts: 15, hp: 1, size: 1, shoots: true, drop: 0.2, deaths: ['eclate'] },
    fumee: { pts: 20, hp: 1, size: 1, shoots: false, drop: 0.3, deaths: ['evapore'] },
    costaud: { pts: 30, hp: 2, size: 1.2, shoots: false, drop: 0.5, deaths: ['tombe'] },
  };
  // Bonus à rattraper avec le seau
  const INV_CAPS = {
    double: { col: '#3a9cff', label: 'Double tir !' },
    eventail: { col: '#8a5cff', label: 'Tir en éventail !' },
    bulle: { col: '#22b96e', label: 'Bulle de protection !' },
    bombe: { col: '#ff8a1f', label: 'Boum !' },
  };
  const shieldY = () => rimY() - 82;
  const invMult = () => 1 + Math.min(4, Math.floor(g.inv.streak / 6));

  // Bonus en cours, pour l'affichage en haut de l'écran
  function invPower() {
    const v = g.inv;
    if (g.rapid > 0) return { txt: 'Tir rapide ' + Math.ceil(g.rapid), t: g.rapid * 1.33 };
    if (v.weaponT > 0) return { txt: (v.weapon === 'double' ? 'Double tir ' : 'Éventail ') + Math.ceil(v.weaponT), t: v.weaponT };
    if (v.bubble) return { txt: 'Bulle active', t: 8 };
    const left = v.list.filter((e) => e.alive).length;
    return { txt: !v.boss && left > 0 && left <= 6 ? 'Reste ' + left : '', t: 0 };
  }

  // Type d'ennemi de chaque rangée, de haut en bas : la variété arrive avec les vagues
  function rowKinds(rows) {
    const k = new Array(rows).fill('brule');
    if (g.wave >= 3 && rows >= 4) { k[0] = 'fumee'; k[1] = 'costaud'; k[2] = 'braise'; }
    else if (g.wave >= 2) { k[0] = 'costaud'; k[1] = 'braise'; }
    else k[0] = 'braise';
    return k;
  }

  function buildWave() {
    const v = g.inv;
    v.list = [];
    v.dir = 1;
    v.ox = 0;
    v.oy = 0;
    v.shots = [];
    v.bombs = [];
    v.charge = null;
    v.bombT = 1.6;
    v.diveT = 5 + Math.random() * 3;
    v.enter = INV_ENTER;
    v.warned = false;
    v.boss = null;
    const slot = (x, y, kind) => v.list.push({ sx: x, sy: y, x, y, kind, hp: FOES[kind].hp, alive: true, hit: 0, dive: null, ph: Math.random() * 6 });

    if (g.wave % INV_BOSS_EVERY === 0) {
      // Vague du roi : un très gros grain, et une petite escorte
      const n = g.wave / INV_BOSS_EVERY;
      const hp = 14 + 6 * n;
      v.boss = { x: W / 2, y: INV_TOP + 34, dir: 1, hp, max: hp, kind: ['costaud', 'braise', 'fumee'][(n - 1) % 3], hit: 0, fireT: 2, t: 0 };
      for (let c = 0; c < 4; c++) slot(W / 2 + (c - 1.5) * 46, INV_TOP + 110, 'brule');
    } else {
      const cols = clamp(Math.round((W - 2 * WALL - 90) / 48), 5, 9);
      const rows = Math.min(3 + Math.floor((g.wave - 1) / 2), 5);
      const kinds = rowKinds(rows);
      const mid = (cols - 1) / 2, midr = (rows - 1) / 2;
      // La forme de la troupe change d'une vague à l'autre : bloc, pointe, losange, deux groupes
      const shape = (g.wave - 1) % 4;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (shape === 1 && r > rows - 1 - (Math.abs(c - mid) - 0.5) * 0.7 + 0.01) continue;
          if (shape === 2 && Math.abs(c - mid) / Math.max(1, mid) + Math.abs(r - midr) / Math.max(1, midr) > 1.2) continue;
          if (shape === 3 && Math.abs(c - mid) < 0.6) continue;
          slot(WALL + 32 + c * 46, INV_TOP + r * 40, kinds[r]);
        }
      }
    }
    v.total = Math.max(1, v.list.length);
    // Trois cornets de pop-corn servent d'abris ; ils se regarnissent un peu à chaque vague
    if (!v.shields) v.shields = [0.2, 0.5, 0.8].map((t) => ({ x: WALL + t * (W - 2 * WALL), hp: 6 }));
    else for (const s of v.shields) s.hp = Math.min(6, s.hp + 2);
  }

  function invRecord() {
    if (!g.recordShown && save.best.invasion > 0 && g.score > save.best.invasion) {
      g.recordShown = true;
      banner('Nouveau record !', '#ffe27a');
      jingle([784, 988, 1175, 1568], 90);
    }
  }

  function hitInvader(e) {
    const v = g.inv;
    e.hp--;
    if (e.hp > 0) {
      e.hit = 0.18;
      burst(e.x, e.y, '#cdd6ea', 4);
      tone(240, 0.05, 'square', 0.05);
      return;
    }
    e.alive = false;
    const F = FOES[e.kind];
    const pts = F.pts * g.wave * invMult() * (e.dive ? 2 : 1);       // un plongeur abattu en vol vaut double
    g.score += pts;
    floatText('+' + pts, e.x, e.y - 14, e.dive ? '#9fe8ff' : e.kind === 'braise' ? '#ffcf7a' : e.kind === 'costaud' ? '#cfe0ff' : '#fff4d6');
    buzz(8);

    // Plusieurs façons de disparaître
    const fx = { kind: e.kind, x: e.x, y: e.y, t: 0, rot: 0, vx: 0, vy: 0, vr: 0, item: null, big: false };
    if (Math.random() < F.drop) {
      // Il se transforme en friandise, qui tombe : à rattraper
      const r = Math.random();
      fx.type = 'transforme';
      fx.dur = 0.42;
      fx.item = r < 0.45 ? 'pop' : r < 0.68 ? 'caramel' : r < 0.92 ? 'bonbon' : 'sucette';
      jingle([880, 1175], 60);
    } else {
      fx.type = F.deaths[Math.floor(Math.random() * F.deaths.length)];
      if (fx.type === 'evapore') {
        fx.dur = 0.9;
        tone(500, 0.3, 'sine', 0.06, 700);
      } else if (fx.type === 'tombe') {
        fx.dur = 1.3;
        fx.vx = (Math.random() - 0.5) * 120;
        fx.vy = -170;
        fx.vr = (Math.random() < 0.5 ? -1 : 1) * (7 + Math.random() * 5);
        tone(420, 0.35, 'triangle', 0.07, -300);
      } else {
        fx.dur = 0.32;
        burst(e.x, e.y, e.kind === 'braise' ? '#ffb347' : '#fffaf0', 12);
        ring(e.x, e.y, e.kind === 'braise' ? '#ffb347' : '#fffaf0');
        popSound(0.14);
      }
      // Parfois, il lâche un bonus
      if (Math.random() < (e.kind === 'costaud' ? 0.3 : 0.12)) invCapsule(e.x, e.y);
    }
    v.fx.push(fx);
    invRecord();
  }

  function invCapsule(x, y) {
    const kinds = Object.keys(INV_CAPS);
    g.inv.caps.push({ kind: kinds[Math.floor(Math.random() * kinds.length)], x, y, vy: 40 });
  }

  function hitBoss(dmg) {
    const v = g.inv, b = v.boss;
    b.hp -= dmg;
    b.hit = 0.12;
    burst(b.x + (Math.random() - 0.5) * 50, b.y + 20, '#cdd6ea', 3);
    tone(200 + Math.random() * 60, 0.05, 'square', 0.05);
    // À mi-vie, le roi lâche un bonus
    if (!b.gift && b.hp <= b.max / 2) { b.gift = true; invCapsule(b.x, b.y + 40); }
    if (b.hp > 0) return;
    const pts = 300 * (g.wave / INV_BOSS_EVERY) * invMult();
    g.score += pts;
    g.got.candy += 3;
    floatText('+' + pts, b.x, b.y, '#ffe27a');
    banner('Roi vaincu !', '#ffe27a');
    jingle([523, 659, 784, 1047, 1319], 100);
    shakeT = 0.4;
    buzz(120);
    for (let i = 0; i < 7; i++) {
      v.fx.push({ kind: b.kind, type: 'eclate', x: b.x + (Math.random() - 0.5) * 110, y: b.y + (Math.random() - 0.5) * 80, t: -i * 0.07, dur: 0.45, rot: 0, vx: 0, vy: 0, vr: 0, item: null, big: true });
      const r = Math.random();
      items.push({ type: r < 0.4 ? 'bonbon' : r < 0.6 ? 'sucette' : 'caramel', x: b.x + (Math.random() - 0.5) * 120, y: b.y, vx: (Math.random() - 0.5) * 90, vy: -120 - Math.random() * 120, rot: 0, vr: (Math.random() - 0.5) * 6, seed: Math.random() * 360, free: true });
    }
    burst(b.x, b.y, '#ffd257', 30, true);
    v.boss = null;
    invRecord();
  }

  function updateFx(dt) {
    const v = g.inv;
    for (let i = v.fx.length - 1; i >= 0; i--) {
      const f = v.fx[i];
      f.t += dt;
      if (f.t < 0) continue;
      if (f.type === 'tombe') { f.vy += 760 * dt; f.x += f.vx * dt; f.y += f.vy * dt; f.rot += f.vr * dt; }
      else if (f.type === 'evapore') f.y -= 46 * dt;
      if (f.t < f.dur) continue;
      if (f.type === 'transforme') {
        items.push({ type: f.item, x: f.x, y: f.y, vx: (Math.random() - 0.5) * 30, vy: -40, rot: 0, vr: (Math.random() - 0.5) * 5, seed: Math.random() * 360, free: true });
      }
      v.fx.splice(i, 1);
    }
  }

  // Coup reçu. Renvoie vrai si une vie a été perdue (faux si la bulle a encaissé).
  function invHurt(x, y, label) {
    const v = g.inv;
    if (v.bubble) {
      v.bubble = false;
      g.invul = 0.7;
      ring(player.x, rimY() - 20, '#7be0a0');
      burst(player.x, rimY() - 20, '#7be0a0', 12, true);
      floatText('Bulle !', player.x, rimY() - 60, '#7be0a0');
      popSound(0.16);
      v.bombs = [];
      return false;
    }
    v.bombs = [];
    v.charge = null;
    v.streak = 0;
    g.combo = 0;
    shakeT = 0.3;
    loseLife(x, y, label);
    if (state === 'play') g.invul = 1.4;     // court répit, signalé par le clignotement du personnage
    return true;
  }

  function invApply(kind) {
    const v = g.inv;
    banner(INV_CAPS[kind].label, '#9fe8ff');
    jingle([784, 1047, 1319], 60);
    buzz(30);
    if (kind === 'double' || kind === 'eventail') { v.weapon = kind; v.weaponT = 8; }
    else if (kind === 'bulle') v.bubble = true;
    else {
      // Boum : la rangée la plus basse est balayée, ou le roi encaisse un gros coup
      shakeT = 0.3;
      if (v.boss) hitBoss(8);
      const alive = v.list.filter((e) => e.alive && !e.dive);
      if (alive.length) {
        const low = Math.max(...alive.map((e) => e.sy));
        for (const e of alive) if (e.sy === low) { e.hp = 1; hitInvader(e); }
      }
    }
  }

  function invUpdate(dt) {
    const v = g.inv;
    g.invul = Math.max(0, g.invul - dt);
    g.rapid = Math.max(0, g.rapid - dt);
    v.weaponT = Math.max(0, v.weaponT - dt);
    if (v.weaponT <= 0) v.weapon = 'simple';
    updateFx(dt);
    if (v.enter > 0) { v.enter -= dt; return; }

    const alive = v.list.filter((e) => e.alive);
    if (!alive.length && !v.boss) {
      if (v.fx.length) return;               // on laisse finir les dernières disparitions
      const bonus = 40 * g.wave;
      g.score += bonus;
      g.wave++;
      g.level = g.wave;
      floatText('Vague terminée ! +' + bonus, W / 2, H * 0.34, '#9fe8ff');
      banner(g.wave % INV_BOSS_EVERY === 0 ? 'Le roi arrive !' : 'Vague ' + g.wave + ' !', '#ffe27a');
      jingle([523, 659, 784, 1047], 90);
      buildWave();
      return;
    }

    // La troupe accélère à mesure qu'elle se vide ; elle se déplace d'un bloc, sauf les plongeurs
    const ranks = alive.filter((e) => !e.dive);
    const thin = 1 - alive.length / v.total;
    const speed = (26 + 7 * g.wave) * (1 + 1.4 * thin);
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const e of ranks) {
      minX = Math.min(minX, e.sx + v.ox); maxX = Math.max(maxX, e.sx + v.ox);
      minY = Math.min(minY, e.sy + v.oy); maxY = Math.max(maxY, e.sy + v.oy);
    }
    if (ranks.length) {
      if (v.dir > 0 && maxX + 22 >= W - WALL) { v.dir = -1; v.oy += 16; maxY += 16; minY += 16; }
      else if (v.dir < 0 && minX - 22 <= WALL) { v.dir = 1; v.oy += 16; maxY += 16; minY += 16; }
      v.ox += v.dir * speed * dt;
    }
    const reach = bucketHalf() * PS * 0.85;
    for (const e of alive) {
      if (e.hit > 0) e.hit -= dt;
      if (!e.dive) { e.x = e.sx + v.ox; e.y = e.sy + v.oy; continue; }
      if (e.dive.back) {
        // Il regagne sa place dans les rangs
        const tx = e.sx + v.ox, ty = e.sy + v.oy;
        e.x += (tx - e.x) * Math.min(1, dt * 6);
        e.y += (ty - e.y) * Math.min(1, dt * 4);
        if (Math.abs(ty - e.y) < 3) e.dive = null;
        continue;
      }
      // Plongeon : il fonce vers le bas en se rapprochant du joueur
      e.y += (220 + 12 * g.wave) * dt;
      e.x = clamp(e.x + clamp(player.x - e.x, -1, 1) * (e.y < rimY() - 110 ? 95 : 20) * dt, WALL + 20, W - WALL - 20);
      if (g.invul <= 0 && e.y > rimY() - 12 && e.y < groundY() && Math.abs(e.x - player.x) < reach + 8) {
        e.alive = false;
        burst(e.x, e.y, '#ff8a3d', 10);
        invHurt(player.x, rimY() - 16, '−1 ❤');
        if (state !== 'play') return;
        continue;
      }
      if (e.y > groundY() + 30) { e.dive.back = true; e.y = INV_TOP - 80; e.x = e.sx + v.ox; }
    }

    // Battement de marche, de plus en plus pressant
    v.beat -= dt;
    if (v.beat <= 0) {
      tone([110, 98, 87, 98][v.beatI++ % 4], 0.07, 'square', 0.045);
      v.beat = lerp(0.85, 0.22, thin);
    }

    if (ranks.length) {
      if (!v.warned && maxY > rimY() - 200) {
        v.warned = true;
        banner('Ils approchent !', '#ff9d6b');
        buzz(60);
      }
      // La troupe écrase les abris, puis atteint le joueur : une vie perdue, et elle repart d'en haut
      if (maxY + 20 >= shieldY() - 14) for (const s of v.shields) s.hp = 0;
      if (maxY + 18 >= rimY() - 4) {
        v.bubble = false;
        invHurt(W / 2, rimY() - 50, 'Ils sont passés : −1 ❤');
        if (state !== 'play') return;
        v.oy -= minY - INV_TOP;
        v.warned = false;
      }
    }

    // De temps en temps, un grain quitte les rangs et plonge sur le joueur
    if (g.wave >= 2 && !v.boss) {
      v.diveT -= dt;
      if (v.diveT <= 0) {
        const cand = ranks.filter((e) => e.kind === 'brule' || e.kind === 'braise');
        if (cand.length >= 2) {
          const low = Math.max(...cand.map((e) => e.sy));
          const pool = cand.filter((e) => e.sy === low);
          pool[Math.floor(Math.random() * pool.length)].dive = { back: false };
          tone(700, 0.35, 'sawtooth', 0.06, -450);
        }
        v.diveT = Math.max(3, 7.5 - 0.4 * g.wave) * (0.8 + Math.random() * 0.4);
      }
    }

    // Le roi : il va et vient, et lâche des braises en éventail
    if (v.boss) {
      const b = v.boss;
      b.t += dt;
      if (b.hit > 0) b.hit -= dt;
      b.x += b.dir * (55 + 5 * g.wave) * dt;
      if (b.x > W - WALL - 70) { b.x = W - WALL - 70; b.dir = -1; }
      if (b.x < WALL + 70) { b.x = WALL + 70; b.dir = 1; }
      b.fireT -= dt;
      if (b.fireT <= 0) {
        for (const vx of [-60, 0, 60]) v.bombs.push({ x: b.x, y: b.y + 56, vx, fast: false });
        b.fireT = Math.max(1.4, 2.5 - 0.05 * g.wave);
        tone(180, 0.2, 'sawtooth', 0.07, -60);
      }
    }

    // Tir automatique du seau, selon l'arme en cours
    v.fire -= dt;
    const per = v.weapon === 'eventail' ? 3 : v.weapon === 'double' ? 2 : 1;
    if (v.fire <= 0 && v.shots.length < (g.rapid > 0 ? 5 : 3) * per) {
      const y = rimY() - 12;
      if (v.weapon === 'double') { v.shots.push({ x: player.x - 10, y, vx: 0, main: true }, { x: player.x + 10, y, vx: 0, main: false }); }
      else if (v.weapon === 'eventail') { v.shots.push({ x: player.x, y, vx: 0, main: true }, { x: player.x, y, vx: -130, main: false }, { x: player.x, y, vx: 130, main: false }); }
      else v.shots.push({ x: player.x, y, vx: 0, main: true });
      v.fire = g.rapid > 0 ? 0.2 : 0.42;
      tone(880, 0.03, 'square', 0.022);
    }
    const scored = () => { v.streak++; g.combo = v.streak * 2; };       // la précision fait monter le multiplicateur
    for (let i = v.shots.length - 1; i >= 0; i--) {
      const s = v.shots[i];
      s.y -= 540 * dt;
      s.x += s.vx * dt;
      if (s.y < 58 || s.x < WALL || s.x > W - WALL) {
        // Un tir principal qui part dans le vide remet le multiplicateur à zéro
        if (s.main && v.streak > 0) { v.streak = 0; g.combo = 0; }
        v.shots.splice(i, 1);
        continue;
      }
      if (v.fly && Math.abs(s.x - v.fly.x) < 20 && Math.abs(s.y - v.fly.y) < 18) {
        v.shots.splice(i, 1);
        scored();
        g.score += 50 * invMult();
        g.rapid = 6;
        floatText('+' + 50 * invMult(), v.fly.x, v.fly.y, '#ffb3da');
        burst(v.fly.x, v.fly.y, '#ffb3da', 12, true);
        banner('Tir rapide !', '#9fe8ff');
        jingle([660, 880, 1100], 70);
        v.fly = null;
        v.flyT = 14 + Math.random() * 8;
        continue;
      }
      if (v.boss && Math.abs(s.x - v.boss.x) < 52 && Math.abs(s.y - v.boss.y) < 46) {
        v.shots.splice(i, 1);
        scored();
        hitBoss(1);
        continue;
      }
      for (const e of alive) {
        const r = 17 * FOES[e.kind].size;
        if (e.alive && Math.abs(s.x - e.x) < r + 1 && Math.abs(s.y - e.y) < r) {
          v.shots.splice(i, 1);
          scored();
          hitInvader(e);
          break;
        }
      }
    }

    // Braises : le tireur s'illumine un instant avant de lâcher la sienne, ce qui laisse le temps de réagir
    if (v.charge) {
      v.charge.t -= dt;
      if (v.charge.t <= 0) {
        const e = v.charge.e;
        if (e.alive && !e.dive) v.bombs.push({ x: e.x, y: e.y + 14, vx: 0, fast: e.kind === 'braise' });
        v.charge = null;
      }
    } else {
      v.bombT -= dt;
      if (v.bombT <= 0) {
        const shooters = ranks.filter((e) => e.alive && FOES[e.kind].shoots);
        if (shooters.length) {
          const pick = shooters[Math.floor(Math.random() * shooters.length)];
          let low = pick;
          for (const e of shooters) if (Math.abs(e.x - pick.x) < 6 && e.y > low.y) low = e;
          v.charge = { e: low, t: 0.45 };
        }
        v.bombT = Math.max(0.55, 1.75 - 0.09 * g.wave) * (0.7 + Math.random() * 0.6);
      }
    }
    const sy = shieldY();
    for (let i = v.bombs.length - 1; i >= 0; i--) {
      const b = v.bombs[i];
      b.y += (150 + 14 * g.wave) * (b.fast ? 1.3 : 1) * dt;
      b.x += b.vx * dt;
      if (b.y > groundY() || b.x < WALL || b.x > W - WALL) { v.bombs.splice(i, 1); burst(b.x, Math.min(b.y, groundY() - 3), '#ff8a3d', 3); continue; }
      const shield = v.shields.find((s) => s.hp > 0 && Math.abs(b.x - s.x) < 27 && b.y > sy - 12 && b.y < sy + 24);
      if (shield) {
        shield.hp--;
        v.bombs.splice(i, 1);
        burst(b.x, sy, '#fff6da', 6);
        popSound(0.08);
        continue;
      }
      if (g.invul <= 0 && b.y > rimY() - 4 && Math.abs(b.x - player.x) < reach) {
        invHurt(player.x, rimY() - 16, '−1 ❤');
        if (state !== 'play') return;
        break;
      }
    }

    // Bonus qui tombent : à rattraper avec le seau
    for (let i = v.caps.length - 1; i >= 0; i--) {
      const c = v.caps[i];
      c.vy = Math.min(150, c.vy + 200 * dt);
      c.y += c.vy * dt;
      if (c.y > rimY() - 8 && c.y < rimY() + 28 && Math.abs(c.x - player.x) < bucketHalf() * PS + 6) {
        v.caps.splice(i, 1);
        invApply(c.kind);
        if (state !== 'play') return;
        continue;
      }
      if (c.y > groundY()) v.caps.splice(i, 1);
    }

    // Sucette volante : la toucher donne des points et le tir rapide
    if (v.fly) {
      v.fly.x += v.fly.dir * 110 * dt;
      if (v.fly.x < WALL - 30 || v.fly.x > W - WALL + 30) { v.fly = null; v.flyT = 14 + Math.random() * 8; }
    } else {
      v.flyT -= dt;
      if (v.flyT <= 0) {
        const d = Math.random() < 0.5 ? 1 : -1;
        v.fly = { x: d > 0 ? WALL - 20 : W - WALL + 20, y: 72, dir: d };
      }
    }
  }

  // Petit pictogramme d'un bonus, centré en (0,0)
  function drawInvCapsule(kind) {
    ctx.fillStyle = OUT; rr(ctx, -15.5, -11.5, 31, 23, 11.5); ctx.fill();
    ctx.fillStyle = INV_CAPS[kind].col; rr(ctx, -14, -10, 28, 20, 10); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.3)'; rr(ctx, -10, -8, 20, 5, 2.5); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
    if (kind === 'double') { circ(ctx, -5, 1, 3.2); circ(ctx, 5, 1, 3.2); }
    else if (kind === 'eventail') { ctx.beginPath(); ctx.moveTo(0, 6); ctx.lineTo(0, -5); ctx.moveTo(0, 6); ctx.lineTo(-7, -3); ctx.moveTo(0, 6); ctx.lineTo(7, -3); ctx.stroke(); }
    else if (kind === 'bulle') { ctx.beginPath(); ctx.arc(0, 1, 5.5, 0, TAU); ctx.stroke(); }
    else star(ctx, 0, 1, 7);
  }

  function drawInvaders() {
    const v = g.inv;
    const sy = shieldY();

    // Ligne de visée : là où partent les tirs
    ctx.strokeStyle = 'rgba(255,255,255,.16)';
    ctx.lineWidth = 2;
    ctx.setLineDash([2, 11]);
    ctx.beginPath(); ctx.moveTo(player.x, rimY() - 16); ctx.lineTo(player.x, INV_TOP - 26); ctx.stroke();
    // Trajet de la braise qui va tomber
    if (v.charge && v.charge.e.alive) {
      ctx.strokeStyle = 'rgba(255,120,60,' + (0.3 + 0.3 * Math.sin(machine.t * 40)) + ')';
      ctx.setLineDash([4, 8]);
      ctx.beginPath(); ctx.moveTo(v.charge.e.x, v.charge.e.y + 20); ctx.lineTo(v.charge.e.x, groundY()); ctx.stroke();
    }
    ctx.setLineDash([]);

    // Abris : des cornets dont le pop-corn diminue avec les coups reçus
    for (const s of v.shields) {
      if (s.hp <= 0) continue;
      ctx.save();
      ctx.translate(s.x, sy);
      ctx.scale(0.72, 0.72);
      drawBucket(ctx, 'classique', 30, th, s.hp + 1);
      ctx.restore();
    }
    if (v.bubble) {
      // Bulle de protection autour du seau
      ctx.strokeStyle = 'rgba(123,224,160,' + (0.55 + 0.25 * Math.sin(machine.t * 6)) + ')';
      ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.arc(player.x, rimY() + 30, 74, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
      ctx.fillStyle = 'rgba(123,224,160,.10)';
      ctx.beginPath(); ctx.arc(player.x, rimY() + 30, 74, Math.PI, 0); ctx.fill();
    }

    if (v.fly) {
      ctx.save();
      ctx.translate(v.fly.x, v.fly.y);
      ctx.rotate(Math.sin(machine.t * 6) * 0.25);
      drawItem(ctx, 'sucette', { t: machine.t, seed: 0 });
      ctx.restore();
    }

    // Les vagues arrivent en descendant du haut de l'écran
    const k = v.enter > 0 ? v.enter / INV_ENTER : 0;
    const oy = -k * k * 300;
    if (v.boss) {
      const b = v.boss;
      ctx.save();
      ctx.translate(b.x, b.y + oy + Math.sin(b.t * 3) * 5);
      ctx.scale(2.9, 2.9);
      drawFoe(ctx, b.kind, { hp: b.hp < b.max / 3 ? 1 : 2, hit: b.hit, t: machine.t });
      // Couronne
      ctx.fillStyle = OUT;
      ctx.beginPath(); ctx.moveTo(-11.5, -14.5); ctx.lineTo(-13, -27.5); ctx.lineTo(-6, -20.5); ctx.lineTo(0, -29.5); ctx.lineTo(6, -20.5); ctx.lineTo(13, -27.5); ctx.lineTo(11.5, -14.5); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ffd257';
      ctx.beginPath(); ctx.moveTo(-10, -15.5); ctx.lineTo(-11.2, -24.5); ctx.lineTo(-6, -19); ctx.lineTo(0, -26.5); ctx.lineTo(6, -19); ctx.lineTo(11.2, -24.5); ctx.lineTo(10, -15.5); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#e8322e'; circ(ctx, 0, -18.5, 1.6);
      ctx.restore();
      // Jauge de vie du roi
      const bw = Math.min(220, W - 140), bx = W / 2 - bw / 2;
      ctx.fillStyle = OUT; rr(ctx, bx - 2, 62, bw + 4, 12, 6); ctx.fill();
      ctx.fillStyle = '#3a0c12'; rr(ctx, bx, 64, bw, 8, 4); ctx.fill();
      ctx.fillStyle = '#ff5a3d'; rr(ctx, bx, 64, Math.max(8, bw * clamp(b.hp / b.max, 0, 1)), 8, 4); ctx.fill();
    }
    for (const e of v.list) {
      if (!e.alive) continue;
      const size = FOES[e.kind].size;
      if (v.charge && v.charge.e === e) {
        ctx.fillStyle = 'rgba(255,230,120,' + (0.35 + 0.35 * Math.sin(machine.t * 40)) + ')';
        circ(ctx, e.x, e.y, 27 * size);
      }
      ctx.save();
      ctx.translate(e.x, e.y + oy + (e.dive ? 0 : Math.sin(machine.t * 6 + e.ph) * (e.kind === 'fumee' ? 4 : 2)));
      ctx.rotate(e.dive && !e.dive.back ? machine.t * 9 : Math.sin(machine.t * 5 + e.ph) * 0.12);
      ctx.scale(size, size);
      if (e.kind === 'fumee') ctx.globalAlpha = 0.88;
      drawFoe(ctx, e.kind, { hp: e.hp, hit: e.hit, t: machine.t + e.ph });
      ctx.restore();
    }

    // Disparitions en cours
    for (const f of v.fx) {
      if (f.t < 0) continue;
      const p = clamp(f.t / f.dur, 0, 1);
      ctx.save();
      ctx.translate(f.x, f.y);
      if (f.type === 'evapore') {
        ctx.globalAlpha = 1 - p;
        ctx.scale(1 + p * 0.7, 1 + p * 0.7);
        drawItem(ctx, 'pop', { t: 0, seed: 0, face: false });
        ctx.fillStyle = 'rgba(255,255,255,.7)';
        circ(ctx, -9 + Math.sin(f.t * 9) * 4, -16 - p * 14, 4 + p * 4);
        circ(ctx, 8 + Math.cos(f.t * 8) * 4, -20 - p * 18, 3 + p * 4);
      } else if (f.type === 'tombe') {
        ctx.globalAlpha = p > 0.7 ? (1 - p) / 0.3 : 1;
        ctx.rotate(f.rot);
        ctx.scale(FOES[f.kind].size, FOES[f.kind].size);
        drawFoe(ctx, f.kind, { hp: 1, hit: 0, t: machine.t });
      } else if (f.type === 'transforme') {
        ctx.save();
        ctx.rotate(p * 5);
        ctx.scale(1 - p, 1 - p);
        drawFoe(ctx, f.kind, { hp: 1, hit: p, t: machine.t });
        ctx.restore();
        const s = TYPES[f.item].s * p;
        ctx.scale(s, s);
        drawItem(ctx, f.item, { t: machine.t, seed: 0, face: th.faces });
      } else {
        ctx.globalAlpha = 1 - p;
        ctx.fillStyle = f.big ? '#ffd257' : f.kind === 'braise' ? '#ffd27a' : '#ffffff';
        circ(ctx, 0, 0, (f.big ? 20 : 10) + p * (f.big ? 56 : 28));
      }
      ctx.restore();
    }

    for (const c of v.caps) {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(Math.sin(machine.t * 5 + c.x) * 0.25);
      ctx.fillStyle = 'rgba(255,255,255,' + (0.14 + 0.1 * Math.sin(machine.t * 8)) + ')';
      circ(ctx, 0, 0, 22);
      drawInvCapsule(c.kind);
      ctx.restore();
    }
    for (const b of v.bombs) {
      const r = b.fast ? 7 : 5.5;
      ctx.fillStyle = 'rgba(255,120,40,.3)'; circ(ctx, b.x, b.y, r + 5);
      ctx.fillStyle = 'rgba(255,120,40,.5)'; oval(ctx, b.x, b.y - 9, 3.5, b.fast ? 13 : 9, 0);
      ctx.fillStyle = b.fast ? '#ff4a1a' : '#ff7a2e'; circ(ctx, b.x, b.y, r);
      ctx.fillStyle = '#ffd98a'; circ(ctx, b.x, b.y + 1, r * 0.48);
    }
    for (const s of v.shots) {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.scale(0.58, 0.58);
      drawItem(ctx, 'pop', { t: machine.t, seed: 0, face: false });
      ctx.restore();
    }
  }

  // ---------- Mode Empilage ----------
  // Des blocs de friandises tombent dans un plateau. Une rangée complète disparaît, chaque sorte de bloc
  // à sa manière. La poignée, placée sous le plateau, désigne la colonne ; deux boutons tournent et lâchent.
  const EMP_COLS = 8;
  const EMP_SIDE = 58;            // largeur de la colonne latérale (pièces suivantes, avatar, boutons)
  const EMP_CLEAR = 0.46;         // durée de la disparition d'une rangée
  // La première forme est le pop-corn magique, qui fait éclater les blocs autour de lui
  const EMP_SHAPES = [
    [[0, 0]],
    [[0, 0], [1, 0]],
    [[0, 0], [1, 0], [2, 0]],
    [[0, 0], [0, 1], [1, 1]],
    [[0, 0], [1, 0], [0, 1], [1, 1]],
    [[0, 0], [1, 0], [2, 0], [1, 1]],
    [[0, 0], [0, 1], [1, 1], [2, 1]],
    [[2, 0], [0, 1], [1, 1], [2, 1]],
    [[1, 0], [2, 0], [0, 1], [1, 1]],
    [[0, 0], [1, 0], [1, 1], [2, 1]],
    [[0, 0], [1, 0], [2, 0], [3, 0]],
  ];
  const EMP_KINDS = ['pop', 'caramel', 'rose', 'bleu', 'vert', 'violet'];
  const EMP_COLORS = {
    pop: ['#e8455a', '#a81c2f'], caramel: ['#eaa53c', '#b4660f'], rose: ['#ff5aa0', '#c92a72'],
    bleu: ['#49a6ff', '#1f6fd0'], vert: ['#33c57c', '#168a4f'], violet: ['#9a6cff', '#5f38c9'],
    brule: ['#4c3a32', '#231916'], magic: ['#ffffff', '#cccccc'],
    friandise: ['#3a2430', '#24141c'], petard: ['#d62839', '#8f1626'], arc: ['#ffffff', '#cccccc'],
  };
  // Façon de disparaître de chaque sorte de bloc quand sa rangée est complète
  const EMP_WAYS = {
    pop: 'collecte', caramel: 'tombe', rose: 'evapore', bleu: 'eclate', vert: 'tombe', violet: 'evapore',
    friandise: 'collecte', petard: 'eclate', arc: 'evapore', brule: 'tombe', magic: 'eclate',
  };
  const EMP_SWEET = ['rose', 'bleu', 'vert', 'violet'];
  let empGest = null;             // geste en cours dans le plateau (toucher = tourner, glisser vers le bas = lâcher)

  const empActive = () => !!(g && mode === 'empile' && inGame() && g.emp);
  // En Empilage, la poignée se déplace sous le plateau : son bord droit s'arrête au bord du plateau
  const maxX = () => (empActive() ? empGeom().x0 + empGeom().w : W - WALL - 30);

  function empRows() {
    const room = groundY() - 78;
    const cell = Math.floor(Math.min((W - 2 * WALL - 12 - EMP_SIDE) / EMP_COLS, room / 12, 44));
    return clamp(Math.floor(room / cell), 12, 18);
  }

  function empGeom() {
    const rows = g.emp.rows;
    const gy = groundY();
    const cell = Math.floor(Math.min((W - 2 * WALL - 12 - EMP_SIDE) / EMP_COLS, (gy - 78) / rows, 44));
    const w = cell * EMP_COLS, h = cell * rows;
    const x0 = Math.round((W - w - EMP_SIDE) / 2);
    const sx = x0 + w + 10;
    return { cell, x0, y0: gy - h - 6, w, h, sx, mid: sx + (EMP_SIDE - 10) / 2 };
  }

  // Deux gros boutons dans la colonne de droite, à portée de pouce
  function empButtons() {
    const G = empGeom(), gy = groundY();
    return [{ id: 'rot', x: G.mid, y: gy - 122 }, { id: 'drop', x: G.mid, y: gy - 52 }];
  }

  function empNewPiece() {
    const magic = Math.random() < 0.05;
    const idx = magic ? 0 : 1 + Math.floor(Math.random() * (EMP_SHAPES.length - 1));
    const p = { cells: EMP_SHAPES[idx].map((c) => c.slice()), kind: magic ? 'magic' : EMP_KINDS[Math.floor(Math.random() * EMP_KINDS.length)], x: 0, y: 0, special: -1, skind: '' };
    // Une pièce sur cinq porte un bloc spécial
    if (!magic && p.cells.length > 1 && Math.random() < 0.2) {
      const r = Math.random();
      p.special = Math.floor(Math.random() * p.cells.length);
      p.skind = r < 0.55 ? 'friandise' : r < 0.82 ? 'petard' : 'arc';
    }
    return p;
  }
  const empCellKind = (p, i) => (i === p.special ? p.skind : p.kind);
  const empWidth = (cells) => 1 + Math.max(...cells.map((c) => c[0]));
  const empInterval = () => Math.max(0.1, 0.75 - 0.07 * (g.level - 1));

  function empFits(cells, x, y) {
    const E = g.emp;
    for (const [cx, cy] of cells) {
      const X = x + cx, Y = y + cy;
      if (X < 0 || X >= EMP_COLS || Y >= E.rows) return false;
      if (Y >= 0 && E.grid[Y][X]) return false;
    }
    return true;
  }

  // Colonne désignée par la poignée : la pièce se centre au-dessus du doigt
  function empTargetCol(cells) {
    const G = empGeom(), w = empWidth(cells);
    return clamp(Math.round((player.x - G.x0) / G.cell - w / 2), 0, EMP_COLS - w);
  }

  function empSpawn() {
    const E = g.emp;
    E.cur = E.queue.shift();
    E.queue.push(empNewPiece());
    E.cur.x = empTargetCol(E.cur.cells);
    E.cur.y = 0;
    E.fall = empInterval();
    E.lockT = 0;
    if (!empFits(E.cur.cells, E.cur.x, E.cur.y)) {
      // Plus de place : on cherche une autre colonne libre avant de déclarer la fin
      let ok = false;
      for (let x = 0; x <= EMP_COLS - empWidth(E.cur.cells) && !ok; x++) {
        if (empFits(E.cur.cells, x, 0)) { E.cur.x = x; ok = true; }
      }
      if (!ok) { E.cur = null; endGame(); }
    }
  }

  function empRotate() {
    const E = g.emp;
    if (!E.cur || E.cur.cells.length === 1) return;
    let rot = E.cur.cells.map(([x, y]) => [-y, x]);
    const mx = Math.min(...rot.map((c) => c[0])), my = Math.min(...rot.map((c) => c[1]));
    rot = rot.map(([x, y]) => [x - mx, y - my]);
    for (const dx of [0, -1, 1, -2, 2]) {
      if (empFits(rot, E.cur.x + dx, E.cur.y)) {
        E.cur.cells = rot;
        E.cur.x += dx;
        E.lockT = 0;
        tone(700, 0.04, 'triangle', 0.07);
        return;
      }
    }
    tone(200, 0.05, 'square', 0.04);
  }

  function empLanding() {
    const p = g.emp.cur;
    let y = p.y;
    while (empFits(p.cells, p.x, y + 1)) y++;
    return y;
  }

  function empDrop() {
    const E = g.emp;
    if (!E.cur) return;
    const y = empLanding();
    g.score += 2 * (y - E.cur.y);
    E.cur.y = y;
    empLock();
  }

  // Fait disparaître un bloc du plateau, avec l'animation propre à sa sorte
  function empVanish(c, r, delay, way) {
    const E = g.emp, G = empGeom();
    const kind = E.grid[r][c];
    if (!kind) return;
    E.grid[r][c] = 0;
    const f = { kind, type: way || EMP_WAYS[kind] || 'eclate', x: G.x0 + (c + 0.5) * G.cell, y: G.y0 + (r + 0.5) * G.cell, s: G.cell, t: -delay, dur: 0.34, rot: 0, vx: 0, vy: 0, vr: 0, done: false };
    if (f.type === 'tombe') { f.dur = 0.9; f.vx = (Math.random() - 0.5) * 90; f.vy = -90; f.vr = (Math.random() < 0.5 ? -1 : 1) * (5 + Math.random() * 5); }
    else if (f.type === 'evapore') f.dur = 0.6;
    else if (f.type === 'collecte') f.dur = 0.5;
    E.fx.push(f);
  }

  function empLock() {
    const E = g.emp, p = E.cur, G = empGeom();
    const center = (c, r) => [G.x0 + (c + 0.5) * G.cell, G.y0 + (r + 0.5) * G.cell];
    E.flash = { t: 0.14, cells: p.cells.map(([cx, cy]) => [p.x + cx, p.y + cy]) };
    if (p.kind === 'magic') {
      // Le pop-corn magique fait éclater les blocs voisins
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const X = p.x + dx, Y = p.y + dy;
          if (X < 0 || X >= EMP_COLS || Y < 0 || Y >= E.rows || !E.grid[Y][X]) continue;
          empVanish(X, Y, 0, 'eclate');
          n++;
        }
      }
      const [px, py] = center(p.x, p.y);
      ring(px, py, '#fff');
      burst(px, py, '#9fe8ff', 12, true);
      g.score += 10 * n * g.level;
      if (n) floatText('+' + 10 * n * g.level, px, py, '#9fe8ff');
      popSound(0.16);
      shakeT = 0.18;
    } else {
      p.cells.forEach(([cx, cy], i) => { if (p.y + cy >= 0) E.grid[p.y + cy][p.x + cx] = empCellKind(p, i); });
      tone(160, 0.06, 'square', 0.05);
    }

    // Rangées complètes : elles disparaissent en vague depuis le centre, puis le plateau se tasse
    const full = [];
    for (let r = 0; r < E.rows; r++) if (E.grid[r].every(Boolean)) full.push(r);
    if (full.length) {
      const lines = full.length;
      let sweets = 0, treats = 0;
      const extra = [];
      for (const r of full) {
        for (let c = 0; c < EMP_COLS; c++) {
          const k = E.grid[r][c];
          if (EMP_SWEET.includes(k)) sweets++;
          if (k === 'friandise') treats++;
          if (k === 'petard' || k === 'arc') extra.push([c, r, k]);
          empVanish(c, r, Math.abs(c - (EMP_COLS - 1) / 2) * 0.035);
        }
      }
      // Blocs spéciaux pris dans la rangée
      let blown = 0;
      for (const [c, r, k] of extra) {
        if (k === 'petard') {
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
            const X = c + dx, Y = r + dy;
            if (X >= 0 && X < EMP_COLS && Y >= 0 && Y < E.rows && E.grid[Y][X]) { empVanish(X, Y, 0.12, 'eclate'); blown++; }
          }
          shakeT = 0.2;
        } else {
          for (let Y = 0; Y < E.rows; Y++) if (E.grid[Y][c]) { empVanish(c, Y, 0.1 + Math.abs(Y - r) * 0.02, 'evapore'); blown++; }
        }
      }
      E.clearRows = full;
      E.clearT = EMP_CLEAR;
      E.streak++;
      const base = [0, 50, 150, 350, 700][Math.min(lines, 4)] * g.level;
      const bonus = (E.streak > 1 ? 25 * (E.streak - 1) : 0) * g.level + 10 * blown * g.level + 20 * treats * g.level;
      g.score += base + bonus;
      E.lines += lines;
      E.joy = 1.4;
      // Butin : modeste pour une rangée, plus généreux pour plusieurs à la fois
      g.got.pop += lines * 2;
      g.got.candy += (lines - 1) + (sweets >= 6 ? 1 : 0) + treats;
      floatText('+' + (base + bonus), G.x0 + G.w / 2, G.y0 + G.h * 0.45, '#fff4d6');
      if (lines >= 2) banner(['', '', 'Double !', 'Triple !', 'Quadruple !'][Math.min(lines, 4)], '#ffd257');
      else if (E.streak > 1) banner('Combo x' + E.streak + ' !', '#ffd257');
      jingle([523, 659, 784, 1047].slice(0, lines + 1), 80);
      popSound(0.14);
      buzz(20 * lines);
      const lvl = 1 + Math.floor(E.lines / 6);
      if (lvl > g.level) {
        g.level = lvl;
        banner('Niveau ' + lvl + ' !', '#ffe27a');
      }
      if (!g.recordShown && save.best.empile > 0 && g.score > save.best.empile) {
        g.recordShown = true;
        banner('Nouveau record !', '#ffe27a');
      }
    } else {
      E.streak = 0;
    }
    E.cur = null;
    E.spawnT = 0.12;
  }

  // À partir du niveau 3, une rangée de grains brûlés monte du bas de temps en temps
  function empGarbage() {
    const E = g.emp;
    if (E.grid[0].some(Boolean)) { endGame(); return; }
    E.grid.shift();
    const row = new Array(EMP_COLS).fill('brule');
    row[Math.floor(Math.random() * EMP_COLS)] = 0;
    E.grid.push(row);
    if (E.cur && !empFits(E.cur.cells, E.cur.x, E.cur.y)) E.cur.y = Math.max(0, E.cur.y - 1);
    tone(110, 0.2, 'sawtooth', 0.08);
    shakeT = 0.15;
  }

  function empUpdate(dt) {
    const E = g.emp, G = empGeom();
    E.joy = Math.max(0, E.joy - dt);
    if (E.flash) { E.flash.t -= dt; if (E.flash.t <= 0) E.flash = null; }

    // Animations de disparition
    for (let i = E.fx.length - 1; i >= 0; i--) {
      const f = E.fx[i];
      f.t += dt;
      if (f.t < 0) continue;
      if (!f.done) {
        // Début de l'animation de ce bloc
        f.done = true;
        if (f.type === 'eclate') { burst(f.x, f.y, EMP_COLORS[f.kind][0], 4, f.kind !== 'brule'); tone(500 + Math.random() * 300, 0.04, 'triangle', 0.05); }
        else if (f.type === 'evapore') tone(620, 0.12, 'sine', 0.035, 500);
      }
      if (f.type === 'tombe') { f.vy += 900 * dt; f.x += f.vx * dt; f.y += f.vy * dt; f.rot += f.vr * dt; }
      else if (f.type === 'evapore') f.y -= 40 * dt;
      if (f.t >= f.dur) {
        if (f.type === 'collecte') { burst(G.mid, G.y0 + 150, f.kind === 'pop' ? '#fff4d6' : '#ffb3da', 3, true); tone(900, 0.04, 'triangle', 0.06); }
        E.fx.splice(i, 1);
      }
    }

    // Tassement du plateau une fois les rangées disparues
    if (E.clearT > 0) {
      E.clearT -= dt;
      if (E.clearT > 0) return;
      const rows = E.clearRows.slice().sort((a, b) => b - a);
      for (const r of rows) E.grid.splice(r, 1);
      for (let i = 0; i < rows.length; i++) E.grid.unshift(new Array(EMP_COLS).fill(0));
      E.clearRows = [];
      tone(140, 0.07, 'square', 0.05);
    }

    // Alerte quand la pile approche du haut
    let top = E.rows;
    for (let r = 0; r < E.rows && top === E.rows; r++) if (E.grid[r].some(Boolean)) top = r;
    E.danger = top < 4;
    if (E.danger) {
      E.beat -= dt;
      if (E.beat <= 0) { tone(90, 0.1, 'sine', 0.09); E.beat = 0.7; }
    }

    if (g.level >= 3) {
      E.garb -= dt;
      if (E.garb <= 0) {
        E.garb = Math.max(10, 26 - g.level);
        empGarbage();
        if (state !== 'play') return;
      }
    }
    if (!E.cur) {
      E.spawnT -= dt;
      if (E.spawnT <= 0) empSpawn();
      return;
    }
    const p = E.cur;
    // La pièce glisse vers la colonne désignée, une case à la fois, sans traverser les blocs
    E.moveT -= dt;
    const tc = empTargetCol(p.cells);
    if (tc !== p.x && E.moveT <= 0) {
      const d = tc > p.x ? 1 : -1;
      if (empFits(p.cells, p.x + d, p.y)) { p.x += d; E.lockT = Math.min(E.lockT, 0.2); }
      E.moveT = 0.03;
    }
    if (empFits(p.cells, p.x, p.y + 1)) {
      E.fall -= dt * (keys.down ? 10 : 1);
      if (E.fall <= 0) { p.y++; E.fall = empInterval(); }
      E.lockT = 0;
    } else {
      E.lockT += dt;
      if (E.lockT >= 0.45) empLock();
    }
  }

  function drawEmpCell(x, y, s, kind) {
    const pad = 1.5, w = s - 2 * pad;
    let col = EMP_COLORS[kind] || EMP_COLORS.pop;
    if (kind === 'magic' || kind === 'arc') {
      const h = Math.round((machine.t * 200) % 360);
      col = ['hsl(' + h + ',95%,70%)', 'hsl(' + ((h + 40) % 360) + ',90%,52%)'];
    }
    ctx.fillStyle = OUT; rr(ctx, x + pad - 1.2, y + pad - 1.2, w + 2.4, w + 2.4, s * 0.25); ctx.fill();
    ctx.fillStyle = col[0]; rr(ctx, x + pad, y + pad, w, w, s * 0.22); ctx.fill();
    ctx.fillStyle = col[1]; rr(ctx, x + pad, y + pad + w * 0.7, w, w * 0.3, s * 0.2); ctx.fill();
    if (kind !== 'friandise') { ctx.fillStyle = 'rgba(255,255,255,.42)'; rr(ctx, x + pad + 3, y + pad + 3, w - 6, w * 0.18, w * 0.09); ctx.fill(); }
    const cx = x + s / 2, cy = y + s / 2;
    if (kind === 'pop' || kind === 'caramel' || kind === 'friandise') {
      ctx.save();
      ctx.translate(cx, cy + (kind === 'friandise' ? 0 : 1));
      const k = kind === 'friandise' ? s / 50 : s / 40;
      ctx.scale(k, k);
      drawItem(ctx, kind === 'friandise' ? 'bonbon' : kind, { t: 0, seed: (x + y) % 5, face: th.faces });
      ctx.restore();
    } else if (kind === 'brule') {
      ctx.strokeStyle = '#ff6a2a'; ctx.lineWidth = s * 0.09; ctx.lineCap = 'round';
      const k = s * 0.17;
      ctx.beginPath(); ctx.moveTo(cx - k, cy - k); ctx.lineTo(cx + k, cy + k); ctx.moveTo(cx + k, cy - k); ctx.lineTo(cx - k, cy + k); ctx.stroke();
    } else if (kind === 'magic') {
      ctx.fillStyle = '#fff'; star(ctx, cx, cy, s * 0.28);
    } else if (kind === 'petard') {
      ctx.fillStyle = '#ffd257'; star(ctx, cx, cy, s * 0.3);
      ctx.fillStyle = '#fff'; circ(ctx, cx, cy, s * 0.07);
    } else if (kind === 'arc') {
      // Double flèche : ce bloc emporte toute sa colonne
      ctx.fillStyle = '#fff';
      const k = s * 0.16;
      ctx.fillRect(cx - s * 0.035, cy - k, s * 0.07, 2 * k);
      for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(cx, cy + d * s * 0.32); ctx.lineTo(cx - k * 0.9, cy + d * k * 0.7); ctx.lineTo(cx + k * 0.9, cy + d * k * 0.7); ctx.closePath(); ctx.fill(); }
    }
  }

  function drawBoard() {
    const E = g.emp, G = empGeom();
    const pulse = E.danger ? 0.5 + 0.5 * Math.sin(machine.t * 9) : 0;
    ctx.fillStyle = 'rgba(0,0,0,.42)'; rr(ctx, G.x0 - 6, G.y0 - 6, G.w + 12, G.h + 12, 11); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.045)';
    for (let r = 0; r < E.rows; r++) for (let c = (r % 2); c < EMP_COLS; c += 2) ctx.fillRect(G.x0 + c * G.cell, G.y0 + r * G.cell, G.cell, G.cell);
    if (E.danger) { ctx.fillStyle = 'rgba(255,60,60,' + (0.1 + 0.12 * pulse) + ')'; ctx.fillRect(G.x0, G.y0, G.w, G.cell * 4); }

    // Couloir de chute : les colonnes que la pièce va occuper
    if (E.cur) {
      const ly = empLanding();
      const done = new Set();
      ctx.fillStyle = 'rgba(255,255,255,.07)';
      for (const [cx, cy] of E.cur.cells) {
        if (done.has(cx)) continue;
        done.add(cx);
        const bottom = Math.max(...E.cur.cells.filter((c) => c[0] === cx).map((c) => c[1]));
        ctx.fillRect(G.x0 + (E.cur.x + cx) * G.cell, G.y0 + (E.cur.y + bottom + 1) * G.cell, G.cell, (ly - E.cur.y) * G.cell);
      }
    }

    for (let r = 0; r < E.rows; r++) {
      for (let c = 0; c < EMP_COLS; c++) {
        if (E.grid[r][c]) drawEmpCell(G.x0 + c * G.cell, G.y0 + r * G.cell, G.cell, E.grid[r][c]);
      }
    }
    if (E.flash) {
      ctx.fillStyle = 'rgba(255,255,255,' + Math.min(0.7, E.flash.t * 6) + ')';
      for (const [c, r] of E.flash.cells) { rr(ctx, G.x0 + c * G.cell + 1.5, G.y0 + r * G.cell + 1.5, G.cell - 3, G.cell - 3, G.cell * 0.22); ctx.fill(); }
    }
    if (E.cur) {
      // Fantôme : là où la pièce va se poser
      const ly = empLanding();
      if (ly !== E.cur.y) {
        ctx.strokeStyle = 'rgba(255,255,255,.45)';
        ctx.lineWidth = 2;
        for (const [cx, cy] of E.cur.cells) { rr(ctx, G.x0 + (E.cur.x + cx) * G.cell + 3, G.y0 + (ly + cy) * G.cell + 3, G.cell - 6, G.cell - 6, G.cell * 0.2); ctx.stroke(); }
      }
      E.cur.cells.forEach(([cx, cy], i) => drawEmpCell(G.x0 + (E.cur.x + cx) * G.cell, G.y0 + (E.cur.y + cy) * G.cell, G.cell, empCellKind(E.cur, i)));
    }

    // Disparitions en cours
    const ax = G.mid, ay = G.y0 + 150;
    for (const f of E.fx) {
      const s = f.s;
      if (f.t < 0) { drawEmpCell(f.x - s / 2, f.y - s / 2, s, f.kind); continue; }     // pas encore atteint par la vague
      const p = clamp(f.t / f.dur, 0, 1);
      ctx.save();
      if (f.type === 'collecte') {
        // Le bloc devient une friandise qui file vers l'avatar
        const e = p * p;
        ctx.translate(f.x + (ax - f.x) * e, f.y + (ay - f.y) * e - Math.sin(p * Math.PI) * 40);
        ctx.rotate(p * 6);
        const k = (s / 36) * (1 - p * 0.35);
        ctx.scale(k, k);
        drawItem(ctx, f.kind === 'friandise' ? 'bonbon' : 'pop', { t: machine.t, seed: f.x % 5, face: th.faces });
      } else if (f.type === 'tombe') {
        ctx.translate(f.x, f.y);
        ctx.globalAlpha = p > 0.6 ? (1 - p) / 0.4 : 1;
        ctx.rotate(f.rot);
        drawEmpCell(-s / 2, -s / 2, s, f.kind);
      } else if (f.type === 'evapore') {
        // Il blanchit, monte et s'efface
        ctx.translate(f.x, f.y);
        ctx.globalAlpha = 1 - p;
        ctx.scale(1 + p * 0.4, 1 + p * 0.4);
        drawEmpCell(-s / 2, -s / 2, s, f.kind);
        ctx.fillStyle = 'rgba(255,255,255,' + (0.35 + p * 0.5) + ')';
        rr(ctx, -s / 2 + 1.5, -s / 2 + 1.5, s - 3, s - 3, s * 0.22); ctx.fill();
        circ(ctx, -s * 0.2, -s * 0.6 - p * 10, 3 + p * 3);
        circ(ctx, s * 0.2, -s * 0.75 - p * 14, 2.5 + p * 3);
      } else {
        ctx.translate(f.x, f.y);
        ctx.globalAlpha = 1 - p;
        ctx.scale(1 + p * 0.5, 1 + p * 0.5);
        drawEmpCell(-s / 2, -s / 2, s, f.kind);
        ctx.fillStyle = 'rgba(255,255,255,' + (0.6 * (1 - p)) + ')';
        circ(ctx, 0, 0, s * (0.4 + p * 0.7));
      }
      ctx.restore();
    }

    ctx.strokeStyle = E.danger ? 'rgb(255,' + Math.round(110 + 60 * (1 - pulse)) + ',90)' : th.trim;
    ctx.lineWidth = E.danger ? 3.5 : 2.5;
    rr(ctx, G.x0 - 6, G.y0 - 6, G.w + 12, G.h + 12, 11); ctx.stroke();
    // Annonce de la rangée brûlée qui va monter
    if (g.level >= 3 && E.garb < 1.6) {
      ctx.fillStyle = 'rgba(255,120,40,' + (0.35 + 0.35 * Math.sin(machine.t * 22)) + ')';
      ctx.fillRect(G.x0, G.y0 + G.h - 5, G.w, 5);
    }

    // Colonne latérale : les deux pièces suivantes et l'avatar qui réagit
    ctx.fillStyle = 'rgba(0,0,0,.34)'; rr(ctx, G.sx - 3, G.y0 - 6, EMP_SIDE - 4, 186, 9); ctx.fill();
    ctx.fillStyle = '#fff4d6';
    ctx.font = '800 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SUIVANT', G.mid, G.y0 + 6);
    E.queue.forEach((n, q) => {
      const mini = q === 0 ? 11 : 8;
      const nw = empWidth(n.cells), nh = 1 + Math.max(...n.cells.map((c) => c[1]));
      const cy = G.y0 + (q === 0 ? 34 : 78);
      if (q === 1) ctx.globalAlpha = 0.7;
      n.cells.forEach(([cx, cyy], i) => drawEmpCell(G.mid - nw * mini / 2 + cx * mini, cy - nh * mini / 2 + cyy * mini, mini, empCellKind(n, i)));
      ctx.globalAlpha = 1;
    });
    drawAvatar(ctx, save.avatar, G.mid, ay, 19, E.joy > 0 ? 'happy' : E.danger ? 'sad' : '');
  }

  function drawEmpButtons() {
    for (const b of empButtons()) {
      const y = b.y;
      ctx.fillStyle = OUT; circ(ctx, b.x, y, 26);
      ctx.fillStyle = th.trim; circ(ctx, b.x, y, 24);
      ctx.fillStyle = b.id === 'rot' ? '#7a4fd6' : '#17907c'; circ(ctx, b.x, y, 20.5);
      ctx.strokeStyle = '#fff'; ctx.fillStyle = '#fff'; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
      if (b.id === 'rot') {
        ctx.beginPath(); ctx.arc(b.x, y, 10, Math.PI * 0.35, Math.PI * 1.85); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(b.x + 13.5, y - 9); ctx.lineTo(b.x + 4.5, y - 9.5); ctx.lineTo(b.x + 10.5, y - 1.5); ctx.closePath(); ctx.fill();
      } else {
        ctx.beginPath(); ctx.moveTo(b.x, y - 11); ctx.lineTo(b.x, y + 3); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(b.x - 9, y + 1); ctx.lineTo(b.x + 9, y + 1); ctx.lineTo(b.x, y + 12); ctx.closePath(); ctx.fill();
      }
    }
  }

  // Gestes tactiles du mode : renvoie vrai si l'appui a servi à presser un bouton
  function empPointer(e) {
    if (state !== 'play') return false;
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) / scale, y = (e.clientY - r.top) / scale;
    if (e.type === 'pointerdown') {
      for (const b of empButtons()) {
        if (Math.hypot(x - b.x, y - b.y) < 33) {
          if (b.id === 'rot') empRotate(); else empDrop();
          return true;
        }
      }
      empGest = y < groundY() ? { x, y, t: performance.now(), id: e.pointerId, used: false } : null;
      return false;
    }
    if (empGest && e.pointerId === empGest.id && !empGest.used && y - empGest.y > 70 && Math.abs(x - empGest.x) < 50) {
      empGest.used = true;
      empDrop();
    }
    return false;
  }
  function empPointerUp(e) {
    if (!empGest || e.pointerId !== empGest.id) return;
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) / scale, y = (e.clientY - r.top) / scale;
    const tap = !empGest.used && Math.hypot(x - empGest.x, y - empGest.y) < 14 && performance.now() - empGest.t < 350;
    empGest = null;
    if (tap && g && mode === 'empile' && state === 'play') empRotate();
  }

  // ---------- Mode Labyrinthe ----------
  // L'avatar parcourt un dédale pour ramasser tout le pop-corn, poursuivi par des grains brûlés.
  // Un bonbon ouvre un court « festin » pendant lequel on peut les croquer. Le dédale change à chaque niveau.
  const LABY_MAPS = [
    [
      '###########',
      '#o.......o#',
      '#.##.#.##.#',
      '#....#....#',
      '##.#.#.#.##',
      '#..#...#..#',
      '#.##.#.##.#',
      '#.........#',
      '#.##.#.##.#',
      '#..#...#..#',
      '##.#.#.#.##',
      '#....#....#',
      '#.##.#.##.#',
      '#o.......o#',
      '###########',
    ],
    [
      '###########',
      '#o...#...o#',
      '#.#.....#.#',
      '#.#.###.#.#',
      '#.........#',
      '###.#.#.###',
      '#...#.#...#',
      '#.#.....#.#',
      '#...#.#...#',
      '###.#.#.###',
      '#.........#',
      '#.#.###.#.#',
      '#.#.....#.#',
      '#o.......o#',
      '###########',
    ],
    [
      '###########',
      '#o.......o#',
      '#.###.###.#',
      '#.........#',
      '#.##.#.##.#',
      '#.#.....#.#',
      '#.#.#.#.#.#',
      '#...#.#...#',
      '#.#.#.#.#.#',
      '#.#.....#.#',
      '#.##.#.##.#',
      '#.........#',
      '#.###.###.#',
      '#o.......o#',
      '###########',
    ],
  ];
  const LCOLS = 11, LROWS = 15;
  const LABY_HOME = [5, 7];       // départ des poursuivants
  const LABY_START = [5, 13];     // départ du joueur
  const LABY_DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];   // haut, droite, bas, gauche
  const LABY_FOES = ['brule', 'braise', 'fumee', 'costaud'];
  // Objets spéciaux : aimant (ramasse autour de soi), éclair (vitesse), glaçon (fige les poursuivants)
  const LABY_SPECIAL = { m: ['magnet', 6, 'Aimant !'], e: ['boost', 5, 'Turbo !'], g: ['freeze', 4, 'Gel !'] };
  // Façons de disparaître d'un poursuivant croqué, selon son type
  const LABY_WAYS = { brule: ['eclate', 'evapore', 'tombe'], braise: ['eclate'], fumee: ['evapore'], costaud: ['tombe'] };
  let labyTouch = null;

  function labyGeom() {
    const gy = groundY();
    const cell = Math.floor(Math.min((W - 2 * WALL - 8) / LCOLS, (gy - 70) / LROWS, 46));
    const w = cell * LCOLS, h = cell * LROWS;
    return { cell, x0: Math.round((W - w) / 2), y0: Math.round(66 + (gy - 70 - h) / 2), w, h };
  }
  const labyWall = (c, r) => r >= 0 && r < LROWS && c >= 0 && c < LCOLS && g.laby.map[r][c] === '#';
  const labyOpen = (c, r) => r >= 0 && r < LROWS && c >= 0 && c < LCOLS && g.laby.map[r][c] !== '#';
  const labyMob = (c, r, kind) => ({ c, r, tc: c, tr: r, t: 1, dir: -1, kind, home: 0, scared: false });
  // Position affichée d'un mobile, en cases (entre sa case de départ et sa case d'arrivée)
  const labyPos = (m) => [m.c + (m.tc - m.c) * m.t, m.r + (m.tr - m.r) * m.t];
  const labyPx = (cx, cy) => { const G = labyGeom(); return [G.x0 + (cx + 0.5) * G.cell, G.y0 + (cy + 0.5) * G.cell]; };

  // Bonus en cours, pour l'affichage en haut de l'écran
  function labyPower() {
    const L = g.laby;
    if (L.fright > 0) return { txt: 'Festin ' + Math.ceil(L.fright), t: L.fright };
    if (L.freeze > 0) return { txt: 'Gel ' + Math.ceil(L.freeze), t: L.freeze * 2 };
    if (L.boost > 0) return { txt: 'Turbo ' + Math.ceil(L.boost), t: L.boost * 1.6 };
    if (L.magnet > 0) return { txt: 'Aimant ' + Math.ceil(L.magnet), t: L.magnet * 1.33 };
    return { txt: L.left <= 12 && L.left > 0 ? 'Reste ' + L.left : '', t: 0 };
  }

  function labyFill() {
    const L = g.laby;
    L.map = LABY_MAPS[(g.level - 1) % LABY_MAPS.length];
    L.left = 0;
    const plain = [];
    L.dots = L.map.map((row, r) => row.split('').map((ch, c) => {
      if (ch === '#' || (c === LABY_HOME[0] && r === LABY_HOME[1]) || (c === LABY_START[0] && r === LABY_START[1])) return '';
      L.left++;
      if (ch === 'o') return 'o';
      if (Math.abs(c - LABY_START[0]) + Math.abs(r - LABY_START[1]) > 4) plain.push([c, r]);
      return Math.random() < 0.12 ? 'c' : '.';            // quelques pop-corn caramel, qui valent plus
    }));
    // Deux objets spéciaux par niveau, placés au hasard
    const kinds = ['m', 'e', 'g'].sort(() => Math.random() - 0.5).slice(0, 2);
    for (const k of kinds) {
      const [c, r] = plain.splice(Math.floor(Math.random() * plain.length), 1)[0];
      L.dots[r][c] = k;
    }
  }

  // Replace le joueur et les poursuivants à leur départ (le pop-corn déjà ramassé reste ramassé)
  function labyPlace() {
    const L = g.laby;
    L.p = labyMob(LABY_START[0], LABY_START[1], 'player');
    L.want = -1;
    L.fright = 0;
    L.freeze = 0;
    L.chain = 0;
    L.dying = 0;
    L.ready = 1.1;            // court temps mort avant que tout bouge
    const n = Math.min(4, 2 + g.level);
    L.foes = LABY_FOES.slice(0, n).map((k, i) => {
      const m = labyMob(LABY_HOME[0], LABY_HOME[1], k);
      m.home = 0.8 + i * 1.7;
      return m;
    });
  }

  function labyMove(m, speed, dt, choose) {
    if (m.t >= 1) {
      m.c = m.tc; m.r = m.tr;
      const d = choose(m);
      if (d < 0) { m.dir = -1; return; }
      m.dir = d;
      m.tc = m.c + LABY_DIRS[d][0];
      m.tr = m.r + LABY_DIRS[d][1];
      m.t = 0;
    }
    m.t = Math.min(1, m.t + speed * dt);
  }

  function labyFoeChoice(m) {
    const L = g.laby, p = L.p;
    const back = m.dir < 0 ? -1 : (m.dir + 2) % 4;
    let opts = [];
    for (let d = 0; d < 4; d++) if (d !== back && labyOpen(m.c + LABY_DIRS[d][0], m.r + LABY_DIRS[d][1])) opts.push(d);
    if (!opts.length) opts = back >= 0 ? [back] : [];
    if (!opts.length) return -1;
    const dist = (d, tx, ty) => Math.pow(m.c + LABY_DIRS[d][0] - tx, 2) + Math.pow(m.r + LABY_DIRS[d][1] - ty, 2);
    if (m.scared) {
      // Il fuit : il préfère la case la plus éloignée du joueur
      return opts.reduce((a, b) => (dist(b, p.tc, p.tr) > dist(a, p.tc, p.tr) ? b : a));
    }
    // Chacun a son caractère : la fumée erre, la braise coupe la route, le costaud hésite
    if (m.kind === 'fumee' || Math.random() < 0.2) return opts[Math.floor(Math.random() * opts.length)];
    let tx = p.tc, ty = p.tr;
    if (m.kind === 'braise' && p.dir >= 0) { tx += LABY_DIRS[p.dir][0] * 3; ty += LABY_DIRS[p.dir][1] * 3; }
    if (m.kind === 'costaud' && Math.abs(m.c - p.tc) + Math.abs(m.r - p.tr) < 5) { tx = 1; ty = LROWS - 2; }
    return opts.reduce((a, b) => (dist(b, tx, ty) < dist(a, tx, ty) ? b : a));
  }

  function labyEat(c, r) {
    const L = g.laby;
    const what = L.dots[r][c];
    const [px, py] = labyPx(c, r);
    if (what) {
      L.dots[r][c] = '';
      L.left--;
      L.pops.push({ x: px, y: py, t: 0, big: what !== '.' });
      if (what === 'o') {
        g.score += 10;
        g.got.candy++;
        L.fright = Math.max(3, 7 - 0.6 * (g.level - 1));
        L.chain = 0;
        for (const f of L.foes) {
          if (f.home > 0) continue;
          f.scared = true;
          // Demi-tour immédiat
          [f.c, f.tc] = [f.tc, f.c]; [f.r, f.tr] = [f.tr, f.r];
          f.t = 1 - f.t;
          if (f.dir >= 0) f.dir = (f.dir + 2) % 4;
        }
        banner('Festin !', '#9fe8ff');
        jingle([660, 880, 1100], 70);
        burst(px, py, '#ffb3da', 10, true);
        buzz(30);
      } else if (LABY_SPECIAL[what]) {
        const [key, dur, label] = LABY_SPECIAL[what];
        L[key] = dur;
        g.score += 10;
        banner(label, '#9fe8ff');
        jingle([784, 1047, 1319], 60);
        burst(px, py, '#9fe8ff', 10, true);
        buzz(30);
      } else {
        // Les pop-corn ramassés à la suite font monter la note
        const now = machine.t;
        L.run = now - L.lastMunch < 0.45 ? Math.min(L.run + 1, 14) : 0;
        L.lastMunch = now;
        g.score += what === 'c' ? 5 : 2;
        L.munch++;
        if (what === 'c' || L.munch % 3 === 0) g.got.pop++;
        tone(480 + L.run * 28, 0.035, 'triangle', 0.07);
      }
      if (!g.recordShown && save.best.laby > 0 && g.score > save.best.laby) {
        g.recordShown = true;
        banner('Nouveau record !', '#ffe27a');
      }
    }
    if (L.bonus && L.bonus.c === c && L.bonus.r === r) {
      const pts = 50 * g.level;
      g.score += pts;
      g.got.candy += 2;
      floatText('+' + pts, px, py - 12, '#ffb3da');
      burst(px, py, '#ffb3da', 12, true);
      jingle([784, 988, 1319], 70);
      L.bonus = null;
      L.bonusT = 18;
    }
  }

  // Un poursuivant croqué disparaît d'une des façons prévues pour son type
  function labyCrunch(f, sx, sy) {
    const L = g.laby;
    const pts = 50 * Math.pow(2, Math.min(L.chain, 3));
    L.chain++;
    g.score += pts;
    g.got.candy++;
    floatText('+' + pts, sx, sy - 12, '#9fe8ff');
    buzz(25);
    const fx = { kind: f.kind, x: sx, y: sy, t: 0, dur: 0.34, type: 'eclate', rot: 0, vx: 0, vy: 0, vr: 0 };
    if (Math.random() < 0.3) {
      // Il se change en bonbon, qui file vers le compteur
      fx.type = 'transforme';
      fx.dur = 0.75;
      g.got.candy++;
      jingle([988, 1319], 60);
    } else {
      const ways = LABY_WAYS[f.kind] || ['eclate'];
      fx.type = ways[Math.floor(Math.random() * ways.length)];
      if (fx.type === 'evapore') { fx.dur = 0.85; tone(500, 0.3, 'sine', 0.06, 700); }
      else if (fx.type === 'tombe') { fx.dur = 1.1; fx.vx = (Math.random() - 0.5) * 100; fx.vy = -170; fx.vr = (Math.random() < 0.5 ? -1 : 1) * 9; tone(420, 0.35, 'triangle', 0.07, -300); }
      else { burst(sx, sy, f.kind === 'braise' ? '#ffb347' : '#fffaf0', 12); ring(sx, sy, '#fffaf0'); popSound(0.14); }
    }
    L.fx.push(fx);
    Object.assign(f, labyMob(LABY_HOME[0], LABY_HOME[1], f.kind), { home: 3 });
  }

  function labyUpdate(dt) {
    const L = g.laby, p = L.p;
    g.invul = Math.max(0, g.invul - dt);
    for (let i = L.fx.length - 1; i >= 0; i--) {
      const f = L.fx[i];
      f.t += dt;
      if (f.type === 'tombe') { f.vy += 760 * dt; f.x += f.vx * dt; f.y += f.vy * dt; f.rot += f.vr * dt; }
      else if (f.type === 'evapore') f.y -= 46 * dt;
      if (f.t >= f.dur) L.fx.splice(i, 1);
    }
    for (let i = L.pops.length - 1; i >= 0; i--) { L.pops[i].t += dt; if (L.pops[i].t > 0.25) L.pops.splice(i, 1); }

    // Dédale vidé : les murs clignotent, puis le niveau suivant arrive
    if (L.clearing > 0) {
      L.clearing -= dt;
      if (L.clearing <= 0) {
        g.level++;
        g.score += 100 * (g.level - 1);
        banner('Niveau ' + g.level + ' !', '#ffe27a');
        labyFill();
        labyPlace();
      }
      return;
    }
    // Touché : l'avatar tournoie un instant avant de repartir
    if (L.dying > 0) {
      L.dying -= dt;
      if (L.dying <= 0) {
        const [x, y] = labyPx(...labyPos(p));
        loseLife(x, y - 16, '−1 ❤');
        if (state !== 'play') return;
        labyPlace();
        g.invul = 1.6;
      }
      return;
    }
    if (L.ready > 0) { L.ready -= dt; return; }

    if (L.fright > 0) {
      L.fright -= dt;
      if (L.fright <= 0) for (const f of L.foes) f.scared = false;
    }
    L.magnet = Math.max(0, L.magnet - dt);
    L.boost = Math.max(0, L.boost - dt);
    L.freeze = Math.max(0, L.freeze - dt);

    // Sucette bonus : elle apparaît un moment au centre du dédale
    if (L.bonus) { L.bonus.t -= dt; if (L.bonus.t <= 0) { L.bonus = null; L.bonusT = 18; } }
    else { L.bonusT -= dt; if (L.bonusT <= 0) L.bonus = { c: 5, r: 9, t: 8 }; }

    // Joueur : demi-tour possible à tout moment, virage dès qu'un couloir s'ouvre
    if (L.want >= 0 && p.dir >= 0 && p.t < 1 && L.want === (p.dir + 2) % 4) {
      [p.c, p.tc] = [p.tc, p.c]; [p.r, p.tr] = [p.tr, p.r];
      p.t = 1 - p.t;
      p.dir = L.want;
    }
    labyMove(p, L.boost > 0 ? 7.4 : 5.4, dt, (m) => {
      const can = (d) => d >= 0 && labyOpen(m.c + LABY_DIRS[d][0], m.r + LABY_DIRS[d][1]);
      return can(L.want) ? L.want : can(m.dir) ? m.dir : -1;
    });
    if (p.t >= 1) labyEat(p.tc, p.tr);
    const [px, py] = labyPos(p);
    if (L.magnet > 0) {
      // L'aimant ramasse tout ce qui est à moins de deux cases
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
        const c = Math.round(px) + dx, r = Math.round(py) + dy;
        if (r < 0 || r >= LROWS || c < 0 || c >= LCOLS) continue;
        const d = L.dots[r][c];
        if ((d === '.' || d === 'c') && Math.hypot(c - px, r - py) < 2.1) labyEat(c, r);
      }
    }

    const fast = Math.min(5.1, 3.8 + 0.3 * (g.level - 1));
    let near = 99;
    for (const f of L.foes) {
      if (f.home > 0) { f.home -= dt; continue; }
      if (L.freeze <= 0) labyMove(f, f.scared ? 2.4 : f.kind === 'costaud' ? fast * 0.85 : fast, dt, labyFoeChoice);
      const [fx, fy] = labyPos(f);
      const d = Math.hypot(fx - px, fy - py);
      if (!f.scared) near = Math.min(near, d);
      if (d > 0.62) continue;
      const [sx, sy] = labyPx(fx, fy);
      if (f.scared) labyCrunch(f, sx, sy);
      else if (g.invul <= 0 && L.freeze <= 0) {
        shakeT = 0.3;
        L.dying = 0.8;
        tone(300, 0.6, 'sawtooth', 0.1, -230);
        buzz(140);
        return;
      }
    }
    // Un poursuivant tout proche : battement d'alerte
    L.near = near < 2.6;
    if (L.near) {
      L.beat -= dt;
      if (L.beat <= 0) { tone(95, 0.09, 'sine', 0.09); L.beat = 0.45; }
    }

    if (L.left <= 0) {
      L.clearing = 1;
      jingle([523, 659, 784, 1047], 90);
    }
  }

  // Petits dessins des objets spéciaux, centrés en (0,0), pour une case de taille s
  function drawLabySpecial(k, s) {
    const u = s / 40;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (k === 'm') {
      // Aimant en fer à cheval
      for (const pass of [1, 0]) {
        ctx.strokeStyle = pass ? OUT : '#e8322e';
        ctx.lineWidth = (pass ? 10 : 7) * u;
        ctx.beginPath(); ctx.moveTo(-8 * u, -9 * u); ctx.lineTo(-8 * u, 1 * u); ctx.arc(0, 1 * u, 8 * u, Math.PI, 0, true); ctx.lineTo(8 * u, -9 * u); ctx.stroke();
      }
      ctx.strokeStyle = '#f4f4f4'; ctx.lineWidth = 7 * u; ctx.lineCap = 'butt';
      ctx.beginPath(); ctx.moveTo(-8 * u, -12 * u); ctx.lineTo(-8 * u, -7 * u); ctx.moveTo(8 * u, -12 * u); ctx.lineTo(8 * u, -7 * u); ctx.stroke();
    } else if (k === 'e') {
      // Éclair
      const path = () => { ctx.beginPath(); ctx.moveTo(4 * u, -14 * u); ctx.lineTo(-9 * u, 2 * u); ctx.lineTo(-1 * u, 2 * u); ctx.lineTo(-5 * u, 14 * u); ctx.lineTo(9 * u, -3 * u); ctx.lineTo(1 * u, -3 * u); ctx.closePath(); };
      ctx.strokeStyle = OUT; ctx.lineWidth = 4 * u; path(); ctx.stroke();
      ctx.fillStyle = '#ffd93b'; path(); ctx.fill();
    } else {
      // Glaçon
      ctx.fillStyle = OUT; rr(ctx, -11.5 * u, -11.5 * u, 23 * u, 23 * u, 5 * u); ctx.fill();
      ctx.fillStyle = '#bfe9ff'; rr(ctx, -10 * u, -10 * u, 20 * u, 20 * u, 4 * u); ctx.fill();
      ctx.fillStyle = '#7fc8f5'; rr(ctx, -10 * u, 2 * u, 20 * u, 8 * u, 4 * u); ctx.fill();
      ctx.fillStyle = '#fff'; star(ctx, -3 * u, -3 * u, 5 * u);
    }
  }

  function drawLaby() {
    const L = g.laby, G = labyGeom(), s = G.cell;
    ctx.fillStyle = 'rgba(0,0,0,.42)'; rr(ctx, G.x0 - 5, G.y0 - 5, G.w + 10, G.h + 10, 12); ctx.fill();

    // Murs : dessinés d'un seul tenant, avec leur contour ; ils clignotent quand le dédale est vidé
    const blink = L.clearing > 0 && Math.floor(L.clearing * 8) % 2 === 0;
    for (const pass of [0, 1]) {
      ctx.fillStyle = pass ? (blink ? '#fff4d6' : th.machine) : OUT;
      const inset = pass ? 3.5 : 1.5;
      for (let r = 0; r < LROWS; r++) {
        for (let c = 0; c < LCOLS; c++) {
          if (!labyWall(c, r)) continue;
          const x = G.x0 + c * s, y = G.y0 + r * s;
          rr(ctx, x + inset, y + inset, s - 2 * inset, s - 2 * inset, s * 0.26); ctx.fill();
          if (labyWall(c + 1, r)) ctx.fillRect(x + s / 2, y + inset, s, s - 2 * inset);
          if (labyWall(c, r + 1)) ctx.fillRect(x + inset, y + s / 2, s - 2 * inset, s);
        }
      }
    }
    ctx.fillStyle = 'rgba(255,255,255,.2)';
    for (let r = 0; r < LROWS; r++) {
      for (let c = 0; c < LCOLS; c++) {
        if (labyWall(c, r) && !labyWall(c, r - 1)) { rr(ctx, G.x0 + c * s + 6, G.y0 + r * s + 5.5, s - 12, s * 0.13, s * 0.06); ctx.fill(); }
      }
    }

    for (let r = 0; r < LROWS; r++) {
      for (let c = 0; c < LCOLS; c++) {
        const d = L.dots[r][c];
        if (!d) continue;
        ctx.save();
        ctx.translate(G.x0 + (c + 0.5) * s, G.y0 + (r + 0.5) * s);
        if (d === 'o') {
          const k = (s / 46) * (1 + 0.1 * Math.sin(machine.t * 6));
          ctx.scale(k, k);
          drawItem(ctx, 'bonbon', { t: machine.t, seed: c + r, face: th.faces });
        } else if (LABY_SPECIAL[d]) {
          ctx.translate(0, Math.sin(machine.t * 4 + c) * 2);
          ctx.fillStyle = 'rgba(159,232,255,' + (0.2 + 0.12 * Math.sin(machine.t * 6)) + ')';
          circ(ctx, 0, 0, s * 0.46);
          drawLabySpecial(d, s);
        } else {
          const k = d === 'c' ? s / 62 : s / 78;
          ctx.scale(k, k);
          drawItem(ctx, d === 'c' ? 'caramel' : 'pop', { t: 0, seed: 0, face: false });
        }
        ctx.restore();
      }
    }
    // Petit éclat à l'endroit où un objet vient d'être ramassé
    for (const o of L.pops) {
      const k = o.t / 0.25;
      ctx.strokeStyle = 'rgba(255,250,235,' + (1 - k) + ')';
      ctx.lineWidth = 2.5 * (1 - k);
      ctx.beginPath(); ctx.arc(o.x, o.y, (o.big ? 8 : 4) + k * (o.big ? 18 : 10), 0, TAU); ctx.stroke();
    }
    if (L.bonus) {
      const [bx, by] = labyPx(L.bonus.c, L.bonus.r);
      ctx.save();
      ctx.translate(bx, by - 3);
      ctx.rotate(Math.sin(machine.t * 5) * 0.2);
      ctx.scale(s / 42, s / 42);
      drawItem(ctx, 'sucette', { t: machine.t, seed: 0 });
      ctx.restore();
    }

    for (const f of L.foes) {
      const [fx, fy] = labyPx(...labyPos(f));
      ctx.save();
      ctx.translate(fx, fy + (L.freeze > 0 ? 0 : Math.sin(machine.t * 7 + fx) * 1.5));
      // Pendant le festin, les poursuivants blanchissent ; ils clignotent quand il se termine
      const pale = f.scared && (L.fright > 1.5 || Math.floor(machine.t * 8) % 2 === 0);
      if (pale) {
        ctx.rotate(Math.sin(machine.t * 30) * 0.08);
        ctx.scale(s / 36, s / 36);
        drawItem(ctx, 'pop', { t: 0, seed: 0, face: false });
        ctx.fillStyle = '#5a6f9a';
        circ(ctx, -4, -1, 1.7); circ(ctx, 4, -1, 1.7);
        ctx.strokeStyle = '#5a6f9a'; ctx.lineWidth = 1.3; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-4, 5); ctx.lineTo(-2, 3.5); ctx.lineTo(0, 5); ctx.lineTo(2, 3.5); ctx.lineTo(4, 5); ctx.stroke();
      } else {
        if (f.home > 0) {
          // Au repaire : un anneau se referme jusqu'à sa sortie
          ctx.strokeStyle = 'rgba(255,255,255,.55)';
          ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.arc(0, 0, s * 0.48, -Math.PI / 2, -Math.PI / 2 + TAU * clamp(f.home / 3, 0, 1)); ctx.stroke();
          ctx.globalAlpha = 0.55;
        }
        ctx.scale(s / 46, s / 46);
        drawFoe(ctx, f.kind, { hp: 2, hit: 0, t: machine.t });
        if (L.freeze > 0 && f.home <= 0) { ctx.fillStyle = 'rgba(150,215,255,.5)'; circ(ctx, 0, -1, 20); }
      }
      ctx.restore();
    }

    // Disparitions des poursuivants croqués
    for (const f of L.fx) {
      const p = clamp(f.t / f.dur, 0, 1);
      ctx.save();
      if (f.type === 'transforme') {
        // Il se change en bonbon, qui file vers le compteur en haut de l'écran
        const m = Math.min(1, p / 0.35), fly = Math.max(0, (p - 0.35) / 0.65);
        const e = fly * fly;
        ctx.translate(f.x + (70 - f.x) * e, f.y + (40 - f.y) * e);
        if (m < 1) {
          ctx.save(); ctx.rotate(m * 5); ctx.scale((1 - m) * s / 46, (1 - m) * s / 46);
          drawFoe(ctx, f.kind, { hp: 2, hit: m, t: machine.t });
          ctx.restore();
        }
        const k = m * (s / 40) * (1 - fly * 0.4);
        ctx.rotate(fly * 6);
        ctx.scale(k, k);
        drawItem(ctx, 'bonbon', { t: machine.t, seed: f.x % 5, face: th.faces });
      } else if (f.type === 'evapore') {
        ctx.translate(f.x, f.y);
        ctx.globalAlpha = 1 - p;
        const k = (s / 36) * (1 + p * 0.7);
        ctx.scale(k, k);
        drawItem(ctx, 'pop', { t: 0, seed: 0, face: false });
        ctx.fillStyle = 'rgba(255,255,255,.7)';
        circ(ctx, -9 + Math.sin(f.t * 9) * 4, -16 - p * 14, 4 + p * 4);
        circ(ctx, 8 + Math.cos(f.t * 8) * 4, -20 - p * 18, 3 + p * 4);
      } else if (f.type === 'tombe') {
        ctx.translate(f.x, f.y);
        ctx.globalAlpha = p > 0.7 ? (1 - p) / 0.3 : 1;
        ctx.rotate(f.rot);
        ctx.scale(s / 46, s / 46);
        drawFoe(ctx, f.kind, { hp: 2, hit: 0, t: machine.t });
      } else {
        ctx.translate(f.x, f.y);
        ctx.globalAlpha = 1 - p;
        ctx.fillStyle = f.kind === 'braise' ? '#ffd27a' : '#ffffff';
        circ(ctx, 0, 0, 10 + p * 28);
      }
      ctx.restore();
    }

    // Avatar : flèche de la direction demandée, halo des bonus, tournoiement quand il est touché
    const [px, py] = labyPx(...labyPos(L.p));
    ctx.save();
    ctx.translate(px, py);
    if (L.magnet > 0) { ctx.strokeStyle = 'rgba(159,232,255,' + (0.3 + 0.2 * Math.sin(machine.t * 10)) + ')'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(0, 0, s * 2.1, 0, TAU); ctx.stroke(); }
    if (L.boost > 0) { ctx.fillStyle = 'rgba(255,217,59,.3)'; circ(ctx, 0, 0, s * 0.58); }
    if (L.dying > 0) {
      const k = L.dying / 0.8;
      ctx.rotate((1 - k) * 12);
      ctx.scale(k, k);
    } else if (g.invul > 0 && Math.floor(machine.t * 14) % 2) ctx.globalAlpha = 0.35;
    drawAvatar(ctx, save.avatar, 0, 0, s * 0.4, L.dying > 0 || L.near ? 'sad' : L.fright > 0 ? 'happy' : '');
    if (L.want >= 0 && L.dying <= 0) {
      const [dx, dy] = LABY_DIRS[L.want];
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(dx * s * 0.66, dy * s * 0.66);
      ctx.lineTo(dx * s * 0.48 + dy * s * 0.13, dy * s * 0.48 + dx * s * 0.13);
      ctx.lineTo(dx * s * 0.48 - dy * s * 0.13, dy * s * 0.48 - dx * s * 0.13);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();

    if (L.ready > 0 && L.dying <= 0 && L.clearing <= 0) bigText('Prêt ?', W / 2, G.y0 + G.h * 0.62, 26, '#fff4d6', clamp(L.ready * 3, 0, 1));
  }

  // Pavé directionnel de la zone de commande : il montre la direction demandée
  function drawLabyPad() {
    const gy = groundY(), y = ctrlY(), x = W / 2;
    ctx.fillStyle = 'rgba(0,0,0,.30)';
    ctx.fillRect(0, gy + 14, W, H - gy - 14);
    ctx.fillStyle = OUT; circ(ctx, x, y, 38);
    ctx.fillStyle = th.trim; circ(ctx, x, y, 36);
    ctx.fillStyle = th.machine; circ(ctx, x, y, 31);
    for (let d = 0; d < 4; d++) {
      const [dx, dy] = LABY_DIRS[d];
      ctx.fillStyle = g.laby.want === d ? '#ffffff' : 'rgba(255,255,255,.4)';
      ctx.beginPath();
      ctx.moveTo(x + dx * 26, y + dy * 26);
      ctx.lineTo(x + dx * 12 + dy * 9, y + dy * 12 + dx * 9);
      ctx.lineTo(x + dx * 12 - dy * 9, y + dy * 12 - dx * 9);
      ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = '#fff4d6';
    ctx.font = '800 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Glisse', x - 86, y);
    ctx.fillText('partout', x + 88, y);
  }

  // Direction donnée par un glissement n'importe où sur l'écran, ou par un appui sur une flèche du pavé
  function labyPointer(e) {
    const r = canvas.getBoundingClientRect();
    if (e.type === 'pointerdown' || !labyTouch || labyTouch.id !== e.pointerId) {
      labyTouch = { id: e.pointerId, x: e.clientX, y: e.clientY };
      if (e.type === 'pointerdown') {
        const dx = (e.clientX - r.left) / scale - W / 2, dy = (e.clientY - r.top) / scale - ctrlY();
        if (Math.hypot(dx, dy) < 42 && Math.hypot(dx, dy) > 7) g.laby.want = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0);
      }
      return;
    }
    if (e.pointerType === 'mouse' && e.buttons === 0) return;
    const dx = e.clientX - labyTouch.x, dy = e.clientY - labyTouch.y;
    if (Math.hypot(dx, dy) < 16) return;
    g.laby.want = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0);
    labyTouch.x = e.clientX;
    labyTouch.y = e.clientY;
  }

  // ---------- Mode Attrape-tout ----------
  // Les friandises sont lancées en l'air par vagues. On glisse le doigt dessus pour les attraper.
  // Il faut tout attraper, et ne pas toucher les grains brûlés.
  // ways : les façons de disparaître possibles quand l'objet est attrapé
  const RAF = {
    pop: { pts: 1, cur: 'pop', s: 1.6, ways: ['seau', 'seau', 'eclate', 'evapore'] },
    caramel: { pts: 3, cur: 'pop', s: 1.6, ways: ['seau', 'seau', 'eclate', 'evapore'] },
    bonbon: { pts: 5, cur: 'candy', s: 1.4, ways: ['deballe', 'deballe', 'etoile'] },
    sucette: { pts: 10, cur: 'candy', s: 1.5, ways: ['etoile'] },
    dore: { pts: 15, cur: 'pop', s: 1.55, ways: ['eclate'] },         // pop-corn doré : rare et rapide
    cornet: { pts: 2, cur: 'pop', s: 1.25, ways: ['eclate'] },         // cornet : libère cinq pop-corn
    gros: { pts: 12, cur: 'candy', s: 2.1, ways: ['deballe'] },        // gros bonbon : deux touches
    arc: { pts: 5, cur: 'pop', s: 1.65, ways: ['eclate'] },
    gel: { pts: 5, cur: 'pop', s: 1.5, ways: ['evapore'] },
    brule: { pts: 0, s: 1.6, ways: ['eclate'] },
  };
  const rafGrav = () => (groundY() - 60) * 1.05 * (1 + 0.05 * Math.min(g.level - 1, 8));
  const rafMult = () => 1 + Math.min(4, g.raf.streak);

  // Bonus ou compteur de ratés, pour l'affichage en haut de l'écran
  function rafPower() {
    const R = g.raf;
    if (R.frenzy > 0) return { txt: 'Frénésie ' + Math.ceil(R.frenzy), t: R.frenzy * 1.6 };
    if (R.slow > 0) return { txt: 'Ralenti ' + Math.ceil(R.slow), t: R.slow * 2 };
    return { txt: g.miss > 0 ? 'Ratés ' + g.miss + '/' + MISS_MAX : '', t: 0 };
  }

  // Lance un objet. how : 'arc' (du bas, en cloche), 'fontaine' (du centre), 'rideau' (d'un côté), 'pluie' (du haut)
  function rafLaunch(type, wave, delay, how, side) {
    const grav = rafGrav();
    const top = 60, gy = groundY(), field = gy - top;
    const rx = () => WALL + 40 + Math.random() * (W - 2 * WALL - 80);
    const it = { type, wave, delay, how: how || 'arc', gk: 1, hp: type === 'gros' ? 2 : 1, hit: 0, rot: Math.random() * TAU, vr: (Math.random() - 0.5) * 6, seed: Math.random() * 360, x: 0, y: 0, vx: 0, vy: 0 };
    if (it.how === 'rideau') {
      // Traverse l'écran depuis un côté, en légère cloche
      const s = side || 1;
      it.x = s > 0 ? WALL + 22 : W - WALL - 22;
      it.y = top + field * (0.3 + Math.random() * 0.3);
      it.vx = s * (W - 2 * WALL) / (1.9 + Math.random() * 0.5);
      it.vy = -field * 0.28;
      it.gk = 0.4;
    } else if (it.how === 'pluie') {
      // Descend lentement du haut de l'écran
      it.x = rx();
      it.y = top - 20;
      it.vx = (Math.random() - 0.5) * 40;
      it.vy = field * 0.2;
      it.gk = 0.1;
    } else {
      const peak = field * (0.5 + Math.random() * 0.38) * (type === 'dore' ? 1.08 : 1);
      it.x = it.how === 'fontaine' ? W / 2 + (Math.random() - 0.5) * 30 : rx();
      it.y = gy + 30;
      it.vy = -Math.sqrt(2 * grav * peak);
      it.vx = (rx() - it.x) / (2 * -it.vy / grav);
    }
    g.raf.list.push(it);
    return it;
  }

  function rafWave() {
    const R = g.raf;
    R.waves++;
    const calm = R.waves <= 2;                // les deux premières vagues : un seul pop-corn, pour prendre le geste
    const n = calm ? 1 : 1 + Math.floor(Math.random() * Math.min(5, 1.6 + g.level * 0.7));
    const wave = { left: 0, total: 0, ok: true };
    const burnt = calm ? 0 : Math.min(0.3, 0.1 + 0.03 * g.level);
    // Les lancers se diversifient avec les niveaux
    const hows = ['arc', 'arc', 'fontaine'];
    if (g.level >= 2) hows.push('rideau');
    if (g.level >= 3) hows.push('pluie');
    const how = calm ? 'arc' : hows[Math.floor(Math.random() * hows.length)];
    const side = Math.random() < 0.5 ? 1 : -1;
    for (let i = 0; i < n; i++) {
      const r = Math.random();
      let type = 'pop';
      if (r < burnt) type = 'brule';
      else if (!calm) {
        const q = (r - burnt) / (1 - burnt);
        type = q < 0.03 ? 'arc' : q < 0.055 ? 'gel' : q < 0.085 ? 'dore' : q < 0.13 ? 'cornet' : q < 0.17 ? 'gros'
          : q < 0.23 ? 'sucette' : q < 0.4 ? 'bonbon' : q < 0.56 ? 'caramel' : 'pop';
      }
      if (type !== 'brule') { wave.left++; wave.total++; }
      rafLaunch(type, wave, i * (how === 'rideau' ? 0.22 : 0.13), how, side);
    }
    // Jamais une vague faite uniquement de grains brûlés
    if (!wave.total) { wave.left = wave.total = 1; rafLaunch('pop', wave, n * 0.13, how, side); }
    popSound(0.12);
  }

  function rafFx(it, way) {
    const T = RAF[it.type];
    const f = { way, type: it.type, x: it.x, y: it.y, t: 0, dur: 0.42, seed: it.seed, s: T.s, rot: it.rot };
    if (way === 'evapore') f.dur = 0.7;
    else if (way === 'etoile') f.dur = 0.7;
    else if (way === 'deballe') f.dur = 0.55;
    else if (way === 'eclate') f.dur = 0.34;
    else if (way === 'ecrase') f.dur = 0.5;
    g.raf.fx.push(f);
  }

  function rafCatch(it, i) {
    const R = g.raf;
    const T = RAF[it.type];
    if (it.type === 'brule') {
      // Il ne fallait pas le toucher
      R.list.splice(i, 1);
      R.chain = 0;
      R.streak = 0;
      g.combo = 0;
      g.n.brule++;
      burst(it.x, it.y, '#6b5a55', 14);
      ring(it.x, it.y, '#ff8a3d');
      rafFx(it, 'eclate');
      shakeT = 0.35;
      slowT = 0.25;
      loseLife(it.x, it.y - 16, '−1 ❤');
      return;
    }
    if (it.hp > 1) {
      // Le gros bonbon résiste : il rebondit et il faut le toucher une seconde fois
      it.hp--;
      it.hit = 0.25;
      it.vy = -Math.abs(it.vy) * 0.5 - 220;
      floatText('Encore !', it.x, it.y - 30, '#ffb3da');
      burst(it.x, it.y, '#ffb3da', 6, true);
      tone(380, 0.08, 'triangle', 0.1);
      buzz(15);
      return;
    }
    R.list.splice(i, 1);
    const pts = T.pts * rafMult();
    g.score += pts;
    g.got[T.cur]++;
    if (it.type === 'sucette') g.n.sucette++;
    const sweet = T.cur === 'candy';
    floatText('+' + pts, it.x, it.y - 18, it.type === 'dore' ? '#ffd257' : sweet ? '#ffb3da' : '#fff4d6');
    const way = T.ways[Math.floor(Math.random() * T.ways.length)];
    rafFx(it, way);
    if (way === 'eclate') { burst(it.x, it.y, it.type === 'dore' ? '#ffd257' : sweet ? '#ffb3da' : '#fff4d6', it.type === 'dore' ? 20 : 10, true); ring(it.x, it.y, it.type === 'dore' ? '#ffd257' : '#ffffff'); popSound(0.12); }
    else burst(it.x, it.y, sweet ? '#ffb3da' : '#fff4d6', 4, sweet);
    buzz(10);

    if (it.type === 'cornet') {
      // Le cornet libère cinq pop-corn, à attraper sans risque
      for (let k = 0; k < 5; k++) {
        const a = -Math.PI / 2 + (k - 2) * 0.42;
        const p = rafLaunch('pop', null, 0, 'eclat');
        p.x = it.x; p.y = it.y;
        p.vx = Math.cos(a) * 190;
        p.vy = Math.sin(a) * 330 - 60;
      }
    }

    // Plusieurs prises dans le même geste : bonus plafonné
    R.chain = R.chainT > 0 ? R.chain + 1 : 1;
    R.chainT = 0.55;
    tone(520 + Math.min(R.chain, 12) * 45, 0.06, 'triangle', 0.1);
    if (R.chain >= 3) {
      const bonus = Math.min(R.chain, 6) * 2;
      g.score += bonus;
      if (R.chain === 3) banner('Trio ! +' + bonus, '#ffd257');
      else if (R.chain % 5 === 0) banner('Combo x' + R.chain + ' !', '#ffd257');
    }
    if (it.type === 'arc') { R.frenzy = 5; R.frenzyT = 0; banner('Frénésie !', '#9fe8ff'); jingle([660, 880, 1100, 1320], 60); }
    else if (it.type === 'gel') { R.slow = 4; banner('Ralenti !', '#9fe8ff'); jingle([784, 659, 523], 80); }

    // Toute une vague attrapée sans rien laisser tomber : la série parfaite multiplie les points suivants
    if (it.wave) {
      it.wave.left--;
      if (it.wave.left === 0 && it.wave.ok) {
        R.streak = Math.min(4, R.streak + 1);
        g.combo = R.streak * COMBO_STEP;
        R.joy = 1;
        if (it.wave.total >= 2) {
          const bonus = 5 * it.wave.total;
          g.score += bonus;
          if (it.wave.total >= 3) g.got.candy++;
          floatText('Tout attrapé ! +' + bonus, W / 2, 96, '#9fe8ff');
        }
        if (R.streak >= 2) floatText('Série parfaite : points x' + rafMult(), W / 2, 122, '#ffd257');
        jingle([784, 1047], 70);
      }
    }
    if (!g.recordShown && save.best.rafle > 0 && g.score > save.best.rafle) {
      g.recordShown = true;
      banner('Nouveau record !', '#ffe27a');
    }
  }

  // Attrape tout ce que le doigt a croisé entre deux positions
  function rafSweep(x0, y0, x1, y1) {
    const R = g.raf;
    const dx = x1 - x0, dy = y1 - y0, len2 = dx * dx + dy * dy;
    for (let i = R.list.length - 1; i >= 0; i--) {
      const it = R.list[i];
      if (it.delay > 0 || it.hit > 0) continue;
      const k = len2 ? clamp(((it.x - x0) * dx + (it.y - y0) * dy) / len2, 0, 1) : 0;
      const reach = 13 * RAF[it.type].s + (it.type === 'brule' ? 4 : 14);     // plus indulgent pour les friandises
      if (Math.hypot(it.x - (x0 + dx * k), it.y - (y0 + dy * k)) > reach) continue;
      rafCatch(it, i);
      if (state !== 'play') return;
    }
  }

  function rafUpdate(dt) {
    const R = g.raf;
    player.tx = W / 2;                       // l'avatar reste au centre, son seau reçoit les prises
    R.frenzy = Math.max(0, R.frenzy - dt);
    R.slow = Math.max(0, R.slow - dt);
    R.joy = Math.max(0, R.joy - dt);
    R.chainT -= dt;
    if (R.chainT <= 0) R.chain = 0;
    const d = dt * (R.slow > 0 ? 0.45 : 1);

    const lvl = 1 + Math.floor(g.time / 20);
    if (lvl > g.level) { g.level = lvl; banner('Niveau ' + lvl + ' !', '#ffe27a'); jingle([523, 659, 784], 90); }

    if (R.frenzy > 0) {
      // Pluie de friandises, sans grain brûlé, et sans pénalité si on en rate
      R.frenzyT -= dt;
      if (R.frenzyT <= 0) {
        const r = Math.random();
        rafLaunch(r < 0.55 ? 'pop' : r < 0.78 ? 'caramel' : r < 0.95 ? 'bonbon' : 'sucette', null, 0, 'arc');
        R.frenzyT = 0.2;
      }
    } else {
      R.waveT -= d;
      if (R.waveT <= 0) {
        rafWave();
        R.waveT = Math.max(1.1, 2.5 - 0.13 * g.level) * (0.85 + Math.random() * 0.3);
      }
    }

    const grav = rafGrav();
    const gy = groundY();
    for (let i = R.list.length - 1; i >= 0; i--) {
      const it = R.list[i];
      if (it.delay > 0) { it.delay -= d; continue; }
      if (it.hit > 0) it.hit -= dt;
      it.vy += grav * it.gk * d;
      it.x += it.vx * d;
      it.y += it.vy * d;
      it.rot += it.vr * d;
      // Les objets lancés du bas rebondissent sur les bords ; ceux du « rideau » ressortent de l'autre côté
      if (it.how !== 'rideau') {
        if (it.x < WALL + 20) { it.x = WALL + 20; it.vx = Math.abs(it.vx); }
        if (it.x > W - WALL - 20) { it.x = W - WALL - 20; it.vx = -Math.abs(it.vx); }
      }
      const gone = (it.vy > 0 && it.y > gy + 34) || it.x < -30 || it.x > W + 30;
      if (!gone) continue;
      R.list.splice(i, 1);
      if (it.type === 'brule' || !it.wave) continue;       // un grain brûlé qui retombe, c'est tant mieux
      it.wave.ok = false;
      R.streak = 0;
      g.combo = 0;
      it.x = clamp(it.x, WALL + 20, W - WALL - 20);
      it.y = gy - 6;
      rafFx(it, 'ecrase');
      R.missFlash = 0.3;
      floatText('Raté', it.x, gy - 30, '#ffb37a');
      tone(180, 0.12, 'square', 0.05);
      g.miss++;
      if (g.miss >= MISS_MAX) {
        g.miss = 0;
        loseLife(it.x, gy - 56, MISS_MAX + ' ratés : −1 ❤');
        if (state !== 'play') return;
      }
    }

    R.missFlash = Math.max(0, R.missFlash - dt);
    for (let i = R.fx.length - 1; i >= 0; i--) {
      const f = R.fx[i];
      f.t += dt;
      if (f.t < f.dur) continue;
      R.fx.splice(i, 1);
      if (f.way === 'seau' || f.way === 'deballe') player.bounce = 0.25;
    }
    while (R.trail.length && machine.t - R.trail[0].t > 0.32) R.trail.shift();
  }

  // Dessine un objet centré en (0,0), à l'échelle 1
  function drawRafItem(type, seed) {
    if (type === 'gel') drawLabySpecial('g', 34);
    else if (type === 'dore') {
      // Pop-corn doré, avec son halo et ses étincelles
      ctx.shadowColor = '#ffd257';
      ctx.shadowBlur = 16;
      drawItem(ctx, 'caramel', { t: machine.t, seed, face: th.faces });
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255,240,170,.55)';
      circ(ctx, 0, -1, 9);
      ctx.fillStyle = '#fff';
      const a = machine.t * 4 + seed;
      for (let i = 0; i < 3; i++) star(ctx, Math.cos(a + i * 2.1) * 17, Math.sin(a + i * 2.1) * 17, 3.4);
    } else if (type === 'cornet') {
      ctx.save();
      ctx.translate(0, -17);
      drawBucket(ctx, 'classique', 17, th, 5);
      ctx.restore();
    } else if (type === 'gros') {
      drawItem(ctx, 'bonbon', { t: machine.t, seed, face: th.faces });
    } else drawItem(ctx, type, { t: machine.t, seed, face: th.faces });
  }

  function drawRafle() {
    const R = g.raf;
    const gy = groundY();

    // Zone de commande : rappel de la règle
    ctx.fillStyle = 'rgba(0,0,0,.30)';
    ctx.fillRect(0, gy + 14, W, H - gy - 14);
    if (R.missFlash > 0) { ctx.fillStyle = 'rgba(255,90,60,' + R.missFlash * 1.6 + ')'; ctx.fillRect(0, gy - 6, W, 10); }
    ctx.fillStyle = '#fff4d6';
    ctx.font = '800 ' + Math.min(14, W / 30) + 'px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Glisse le doigt sur les friandises', W / 2, ctrlY() - 10);
    ctx.fillStyle = '#ffb37a';
    ctx.fillText('Ne touche pas les grains brûlés', W / 2, ctrlY() + 12);

    for (const it of R.list) {
      if (it.delay > 0) {
        // Annonce : un petit nuage là où l'objet va sortir
        if (it.delay < 0.4 && (it.how === 'arc' || it.how === 'fontaine')) {
          const k = 1 - it.delay / 0.4;
          ctx.fillStyle = 'rgba(255,250,235,' + (0.5 * k) + ')';
          circ(ctx, it.x, gy - 4, 5 + k * 8); circ(ctx, it.x - 9, gy - 2, 3 + k * 5); circ(ctx, it.x + 9, gy - 2, 3 + k * 5);
        }
        continue;
      }
      const s = RAF[it.type].s * (it.type === 'gros' && it.hp === 1 ? 0.78 : 1);
      ctx.save();
      ctx.translate(it.x, it.y);
      ctx.rotate(it.type === 'cornet' ? Math.sin(it.rot) * 0.3 : th.faces ? Math.sin(it.rot) * 0.35 : it.rot);
      ctx.scale(s, s);
      drawRafItem(it.type, it.seed);
      if (it.hit > 0) { ctx.fillStyle = 'rgba(255,255,255,' + Math.min(0.8, it.hit * 4) + ')'; circ(ctx, 0, 0, 13); }
      ctx.restore();
    }

    // Disparitions : chaque prise a sa façon de s'en aller
    const bx = player.x, by = rimY();
    for (const f of R.fx) {
      const p = clamp(f.t / f.dur, 0, 1), e = p * p;
      ctx.save();
      if (f.way === 'seau') {
        // File dans le seau en décrivant une courbe
        ctx.translate(f.x + (bx - f.x) * e, f.y + (by - f.y) * e - Math.sin(p * Math.PI) * 50);
        ctx.rotate(f.rot + p * 7);
        const k = f.s * (1 - p * 0.45);
        ctx.scale(k, k);
        drawRafItem(f.type, f.seed);
      } else if (f.way === 'deballe') {
        // Le papier s'ouvre en deux, le bonbon file dans le seau
        const open = Math.min(1, p / 0.35), fly = Math.max(0, (p - 0.25) / 0.75), e2 = fly * fly;
        ctx.globalAlpha = 1 - open;
        ctx.fillStyle = '#ffc2e0';
        for (const sx of [-1, 1]) {
          ctx.save();
          ctx.translate(f.x + sx * (14 + open * 30) * (f.s / 1.4), f.y - open * 16);
          ctx.rotate(sx * open * 1.6);
          ctx.beginPath(); ctx.moveTo(-sx * 6, 0); ctx.lineTo(sx * 9, -9); ctx.lineTo(sx * 6, 0); ctx.lineTo(sx * 9, 9); ctx.closePath(); ctx.fill();
          ctx.restore();
        }
        ctx.globalAlpha = 1;
        ctx.translate(f.x + (bx - f.x) * e2, f.y + (by - f.y) * e2 - Math.sin(fly * Math.PI) * 44);
        ctx.fillStyle = OUT; circ(ctx, 0, 0, 9.5 * (1 - fly * 0.35));
        ctx.fillStyle = '#ff4f9a'; circ(ctx, 0, 0, 8 * (1 - fly * 0.35));
        ctx.fillStyle = 'rgba(255,255,255,.75)'; circ(ctx, -2.5, -3, 2.2);
      } else if (f.way === 'etoile') {
        // Tourne, rétrécit, puis devient une étoile qui file vers le score
        const m = Math.min(1, p / 0.4), fly = Math.max(0, (p - 0.4) / 0.6), e2 = fly * fly;
        ctx.translate(f.x + (60 - f.x) * e2, f.y + (38 - f.y) * e2);
        if (m < 1) {
          ctx.save(); ctx.rotate(f.rot + m * 8); ctx.scale(f.s * (1 - m), f.s * (1 - m));
          drawRafItem(f.type, f.seed);
          ctx.restore();
        }
        ctx.rotate(p * 5);
        ctx.fillStyle = '#ffe27a';
        star(ctx, 0, 0, 6 + m * 12 * (1 - fly * 0.5));
        ctx.fillStyle = '#fff';
        star(ctx, 0, 0, 3 + m * 5 * (1 - fly * 0.5));
      } else if (f.way === 'evapore') {
        // Blanchit, monte et s'efface
        ctx.translate(f.x, f.y - p * 46);
        ctx.globalAlpha = 1 - p;
        ctx.rotate(f.rot);
        ctx.scale(f.s * (1 + p * 0.6), f.s * (1 + p * 0.6));
        drawRafItem(f.type, f.seed);
        ctx.fillStyle = 'rgba(255,255,255,' + (0.3 + p * 0.6) + ')';
        circ(ctx, 0, -1, 14);
        circ(ctx, -9 + Math.sin(f.t * 9) * 4, -18 - p * 12, 4 + p * 4);
        circ(ctx, 8 + Math.cos(f.t * 8) * 4, -22 - p * 16, 3 + p * 4);
      } else if (f.way === 'ecrase') {
        // Raté : il s'écrase au sol
        ctx.translate(f.x, f.y);
        ctx.globalAlpha = 1 - p;
        ctx.scale(f.s * (1 + p * 0.5), f.s * (1 - p * 0.65) * 0.7);
        drawRafItem(f.type, f.seed);
      } else {
        ctx.translate(f.x, f.y);
        ctx.globalAlpha = 1 - p;
        ctx.fillStyle = f.type === 'brule' ? '#ff8a3d' : f.type === 'dore' ? '#ffd257' : '#ffffff';
        circ(ctx, 0, 0, 12 + p * (f.type === 'dore' ? 46 : 30));
      }
      ctx.restore();
    }

    // Traînée du doigt, et compteur des prises du geste en cours
    ctx.lineCap = 'round';
    for (let i = 1; i < R.trail.length; i++) {
      const a = R.trail[i - 1], b = R.trail[i];
      if (b.brk) continue;
      const age = clamp((machine.t - b.t) / 0.32, 0, 1);
      ctx.strokeStyle = 'rgba(255,236,170,' + (0.75 * (1 - age)) + ')';
      ctx.lineWidth = 3 + 13 * (1 - age);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,' + (0.9 * (1 - age)) + ')';
      ctx.lineWidth = 1.5 + 4 * (1 - age);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    if (R.chain >= 2 && R.trail.length) {
      const last = R.trail[R.trail.length - 1];
      bigText('x' + R.chain, clamp(last.x + 34, 50, W - 50), last.y - 34, 22, '#ffd257', clamp(R.chainT * 3, 0, 1));
    }
    if (R.slow > 0) { ctx.fillStyle = 'rgba(150,215,255,.10)'; ctx.fillRect(0, 0, W, gy); }
  }

  function rafPointer(e) {
    if (state !== 'play') return;
    const R = g.raf;
    if (e.pointerType === 'mouse' && e.type !== 'pointerdown' && e.buttons === 0) { R.last = null; return; }
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) / scale, y = (e.clientY - r.top) / scale;
    const fresh = e.type === 'pointerdown' || !R.last || R.last.id !== e.pointerId;
    const from = fresh ? { x, y } : R.last;
    R.last = { x, y, id: e.pointerId };
    R.trail.push({ x, y, t: machine.t, brk: fresh });
    if (R.trail.length > 28) R.trail.shift();
    rafSweep(from.x, from.y, x, y);
  }
  function rafPointerUp(e) {
    if (g && g.raf && g.raf.last && g.raf.last.id === e.pointerId) g.raf.last = null;
  }

  // ---------- Tutoriel jouable ----------
  const TUTO = ['Glisse la poignée pour bouger le seau', 'Attrape 3 pop-corn !', 'Un bonbon vaut plus de points !', 'Laisse tomber le grain brûlé !'];
  function tutoSay(txt, col) { g.banner = { txt: txt || TUTO[g.tuto.step], col: col || '#fff4d6', t: 1.7 }; }
  function tutoNext() {
    const t = g.tuto;
    t.step++; t.n = 0; t.t = 0; t.sp = 0.7;
    if (t.step >= TUTO.length) { t.t = -2.2; tutoSay('Bravo ! À toi de jouer !', '#ffe27a'); jingle([523, 659, 784, 1047], 110); }
    else { tutoSay(); tone(784, 0.12, 'triangle'); }
  }
  function tutoUpdate(dt) {
    const t = g.tuto;
    if (g.banner) g.banner.t = Math.max(g.banner.t, 1.2);   // la consigne reste affichée
    t.t += dt;
    if (t.step >= TUTO.length) { if (t.t >= 0) tutoEnd(); return; }
    if (t.step === 0) {
      t.moved += Math.abs(player.x - t.lx);
      t.lx = player.x;
      if (t.moved > 70 && t.t > 1.2) tutoNext();
      return;
    }
    t.sp -= dt;
    if (t.sp <= 0) { spawn(['', 'pop', 'bonbon', 'brule'][t.step]); t.sp = [0, 1.2, 1.7, 2.6][t.step]; }
  }
  function tutoCaught(it) {
    const t = g.tuto;
    if (t.step === 1 && it.type === 'pop') { if (++t.n >= 3) tutoNext(); }
    else if (t.step === 2 && it.type === 'bonbon') tutoNext();
    else if (t.step === 3 && it.type === 'brule') tutoSay('Oups ! Laisse-le tomber', '#ff9d6b');
  }
  function tutoFloor(it) { if (g.tuto.step === 3 && it.type === 'brule') tutoNext(); }
  function tutoEnd() {
    music(false);
    save.tuto = true;
    persist();
    state = 'menu';
    items = [];
    buildMenu();
    show('menu');
  }

  // ---------- Mise à jour ----------
  let shakeT = 0;   // secousse d'écran
  let slowT = 0;    // bref ralenti
  const calm = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function movePlayer(dt) {
    const dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    if (dir) player.tx += dir * 520 * dt;
    player.tx = clamp(player.tx, WALL + 30, maxX());
    const dx = player.tx - player.x;
    player.x += dx * Math.min(1, dt * 20);
    player.lean += (clamp(dx * 0.006, -0.2, 0.2) - player.lean) * Math.min(1, dt * 12);
    player.bounce = Math.max(0, player.bounce - dt);
  }

  function update(dt) {
    machine.t += dt;
    const lvl = g && inGame() ? g.level : 1;
    machine.ph += dt * (0.85 + 0.1 * Math.min(lvl - 1, 6));
    machine.x = W / 2 + Math.sin(machine.ph) * Math.min(W * 0.24, 230);
    machine.shake = Math.max(0, machine.shake - dt);
    if (g && g.banner) { g.banner.t -= dt; if (g.banner.t <= 0) g.banner = null; }

    let d = 0;
    if (state === 'count') {
      const before = Math.ceil(g.count);
      g.count -= dt;
      const after = Math.ceil(g.count);
      if (after !== before && after > 0) tone(520, 0.1, 'triangle');
      if (g.count <= 0) { state = 'play'; if (mode === 'tuto') tutoSay(); else banner('C\'est parti !'); tone(1040, 0.2, 'triangle'); }
      movePlayer(dt);
      if (mode === 'brique') stickBall();
    } else if (state === 'play') {
      g.time += dt;
      d = difficulty();
      if (mode === 'chrono') {
        g.left -= dt;
        const sec = Math.ceil(g.left);
        if (sec <= 10 && sec > 0 && sec !== g.lastTick) { g.lastTick = sec; tone(sec <= 3 ? 1250 : 900, 0.06, 'square', 0.06); }
        if (g.left <= 0) { g.left = 0; endGame(); return; }
      }
      g.giant = Math.max(0, g.giant - dt);
      g.magnet = Math.max(0, g.magnet - dt);
      g.hurt = Math.max(0, g.hurt - dt);

      if (mode === 'tuto') tutoUpdate(dt);
      else if (mode === 'brique') brickUpdate(dt);
      else if (mode === 'invasion') invUpdate(dt);
      else if (mode === 'empile') empUpdate(dt);
      else if (mode === 'laby') labyUpdate(dt);
      else if (mode === 'rafle') rafUpdate(dt);
      else if (g.event) {
        if (g.event.warn > 0) g.event.warn -= dt; else g.event.t -= dt;
        if (g.event.type === 'chauffe') machine.shake = 0.1;
        if (g.event.t <= 0) g.event = null;
      } else {
        g.nextEvent -= dt;
        if (g.nextEvent <= 0 && (mode !== 'chrono' || g.left > 7)) startEvent();
      }

      g.spawn -= dt;
      if (mode !== 'tuto' && mode !== 'brique' && mode !== 'invasion' && mode !== 'empile' && mode !== 'laby' && mode !== 'rafle' && g.spawn <= 0) {
        const dd = Math.min(d, 1);
        const rain = evOn('pluie');
        spawn(pickType(d));
        if (Math.random() < 0.2 + 0.3 * dd) spawn(pickType(d));
        g.spawn = lerp(0.6, 0.23, dd) * (0.8 + Math.random() * 0.4) * (rain ? 0.35 : 1);
      }
      movePlayer(dt);
    } else {
      // Décor : la machine continue de faire sauter du pop-corn derrière les menus
      decorT -= dt;
      if (decorT <= 0) { spawn(Math.random() < 0.2 ? 'bonbon' : Math.random() < 0.3 ? 'caramel' : 'pop', true); decorT = 0.4; }
    }

    const playing = state === 'play';
    // En casse-briques, les objets libérés tombent plus doucement : on surveille aussi la balle
    const grav = (H - CTRL_H) * 0.55 * (1 + 0.35 * Math.min(d, 1.6)) * (g && (mode === 'brique' || mode === 'invasion') && inGame() ? 0.45 : 1);
    const gy = groundY();
    const ry = rimY();
    const bw = bucketHalf() * PS;
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];
      const rad = 13 * TYPES[it.type].s;
      it.vy += grav * dt;
      if (playing && g.magnet > 0 && it.type !== 'brule' && it.y > ry - 260 && it.y < ry) {
        it.x += (player.x - it.x) * Math.min(1, dt * 5);
      }
      it.x += it.vx * dt;
      it.y += it.vy * dt;
      it.rot += it.vr * dt;
      if (it.x < WALL + rad) { it.x = WALL + rad; it.vx = Math.abs(it.vx) * 0.7; }
      if (it.x > W - WALL - rad) { it.x = W - WALL - rad; it.vx = -Math.abs(it.vx) * 0.7; }

      if (playing && it.vy > 0 && it.y > ry - 8 && it.y < ry + 26 && Math.abs(it.x - player.x) < bw + 2) {
        items.splice(i, 1);
        caught(it);
        if (state !== 'play') return;
        continue;
      }
      if (it.y > gy - rad * 0.5) {
        items.splice(i, 1);
        burst(it.x, gy - 4, it.type === 'brule' ? '#4a3a35' : '#fff1c9', 3);
        if (playing && mode === 'tuto') tutoFloor(it);
        if (playing && it.type !== 'brule' && !it.free) {
          if (g.combo >= COMBO_STEP) floatText('Combo perdu', it.x, gy - 34, '#ffb37a');
          g.combo = 0;
          if (mode === 'survie') {
            g.miss++;
            if (g.miss >= MISS_MAX) {
              g.miss = 0;
              loseLife(it.x, gy - 40, MISS_MAX + ' ratés : −1 ❤');
              if (state !== 'play') return;
            }
          }
        }
      }
    }

    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life -= dt;
      if (p.life <= 0) { parts.splice(i, 1); continue; }
      if (!p.ring) { p.vy += 520 * dt; p.x += p.vx * dt; p.y += p.vy * dt; }
    }
    for (let i = texts.length - 1; i >= 0; i--) {
      const t = texts[i];
      t.life -= dt;
      t.y -= 50 * dt;
      if (t.life <= 0) texts.splice(i, 1);
    }
  }

  // ---------- Dessin : décor ----------
  function drawBg() {
    const gy = groundY();
    let gr = ctx.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, th.bg[0]);
    gr.addColorStop(1, th.bg[1]);
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, W, H);

    gr = ctx.createRadialGradient(W / 2, H * 0.42, 10, W / 2, H * 0.42, H * 0.65);
    gr.addColorStop(0, 'rgba(' + th.glow + ',.22)');
    gr.addColorStop(1, 'rgba(' + th.glow + ',0)');
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, W, H);

    if (save.theme === 'foire') drawFair(gy);
    else if (save.theme === 'kawaii') drawKawaii(gy);
    else drawCinema(gy);

    // Rideaux ou poteaux sur les côtés
    for (let s = 0; s < 2; s++) {
      for (let i = 0; i < 3; i++) {
        const x = s === 0 ? i * 6 : W - (i + 1) * 6;
        ctx.fillStyle = i % 2 === s ? th.sideA : th.sideB;
        ctx.fillRect(x, 0, 6, gy);
      }
    }
    ctx.fillStyle = th.trim;
    ctx.fillRect(WALL - 2, 0, 2, gy);
    ctx.fillRect(W - WALL, 0, 2, gy);

    // Sol
    ctx.fillStyle = th.floor;
    ctx.fillRect(0, gy, W, H - gy);
    ctx.fillStyle = 'rgba(0,0,0,.18)';
    ctx.fillRect(0, gy + 8, W, H - gy - 8);
    ctx.fillStyle = th.trim;
    ctx.fillRect(0, gy, W, 3);
  }

  // Cinéma : faisceaux de projecteur, fauteuils et lambrequin
  function drawCinema(gy) {
    ctx.fillStyle = 'rgba(255,226,160,.05)';
    ctx.beginPath(); ctx.moveTo(WALL, 0); ctx.lineTo(W * 0.62, gy); ctx.lineTo(W * 0.22, gy); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(W - WALL, 0); ctx.lineTo(W * 0.78, gy); ctx.lineTo(W * 0.38, gy); ctx.closePath(); ctx.fill();

    // Rangée de fauteuils en silhouette
    const n = Math.ceil((W - 2 * WALL) / 52);
    for (let i = 0; i < n; i++) {
      const x = WALL + 4 + i * 52;
      ctx.fillStyle = 'rgba(20,4,8,.42)';
      rr(ctx, x, gy - 40, 44, 42, 10); ctx.fill();
      ctx.fillStyle = 'rgba(168,28,47,.35)';
      rr(ctx, x + 4, gy - 36, 36, 20, 7); ctx.fill();
    }

    // Lambrequin festonné en haut
    const m = Math.ceil(W / 44);
    for (let i = 0; i < m; i++) {
      const x = i * 44 + 22;
      ctx.fillStyle = '#e9b94a'; circ(ctx, x, 2, 25);
      ctx.fillStyle = '#8f1626'; circ(ctx, x, 1, 23);
    }
  }

  // Fête foraine : étoiles, grande roue, chapiteau et fanions
  function drawFair(gy) {
    ctx.fillStyle = '#fff';
    const ns = Math.round(W / 26);
    for (let i = 0; i < ns; i++) {
      ctx.globalAlpha = 0.3 + 0.3 * Math.sin(machine.t * 2 + i);
      circ(ctx, WALL + 6 + (i * 97) % (W - 2 * WALL - 12), 70 + (i * 53) % (H * 0.45), 1.7);
    }
    ctx.globalAlpha = 1;

    // Chapiteau lointain
    const tx = W * 0.22;
    ctx.fillStyle = 'rgba(255,255,255,.14)';
    ctx.beginPath(); ctx.moveTo(tx - 70, gy); ctx.lineTo(tx - 60, gy - 50); ctx.lineTo(tx, gy - 96); ctx.lineTo(tx + 60, gy - 50); ctx.lineTo(tx + 70, gy); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(232,50,46,.30)';
    for (let i = 0; i < 3; i++) {
      const a = tx - 60 + i * 48;
      ctx.beginPath(); ctx.moveTo(a, gy - 50); ctx.lineTo(tx - 10 + i * 8, gy - 90); ctx.lineTo(tx + i * 8, gy - 90); ctx.lineTo(a + 24, gy - 50); ctx.closePath(); ctx.fill();
    }

    const cx = W * 0.72, cy = gy - 112, R = 96, rot = machine.t * 0.15;
    ctx.strokeStyle = 'rgba(255,255,255,.24)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, TAU);
    ctx.moveTo(cx + R * 0.3, cy);
    ctx.arc(cx, cy, R * 0.3, 0, TAU);
    for (let i = 0; i < 8; i++) {
      const a = rot + i * TAU / 8;
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
    }
    ctx.moveTo(cx, cy); ctx.lineTo(cx - 48, gy);
    ctx.moveTo(cx, cy); ctx.lineTo(cx + 48, gy);
    ctx.stroke();
    const cab = ['#e8322e', '#ffcc00', '#ff7ab8', '#7be0a0'];
    ctx.globalAlpha = 0.65;
    for (let i = 0; i < 8; i++) {
      const a = rot + i * TAU / 8;
      ctx.fillStyle = cab[i % 4];
      rr(ctx, cx + Math.cos(a) * R - 8, cy + Math.sin(a) * R, 16, 13, 4); ctx.fill();
    }
    ctx.globalAlpha = 1;

    const flags = ['#e8322e', '#ffcc00', '#18e0c9', '#ffffff', '#ff7ab8'];
    const n = Math.round((W - 2 * WALL) / 30);
    const fy = (t) => 50 + Math.sin(t * Math.PI) * 16;
    ctx.strokeStyle = 'rgba(255,255,255,.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const x = WALL + t * (W - 2 * WALL);
      if (i === 0) ctx.moveTo(x, fy(t)); else ctx.lineTo(x, fy(t));
    }
    ctx.stroke();
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      const x = WALL + t * (W - 2 * WALL), y = fy(t);
      ctx.fillStyle = flags[i % flags.length];
      ctx.beginPath(); ctx.moveTo(x - 11, y); ctx.lineTo(x + 11, y); ctx.lineTo(x, y + 19); ctx.closePath(); ctx.fill();
    }
  }

  // Kawaii : arc-en-ciel, nuages souriants et étoiles scintillantes
  function drawKawaii(gy) {
    const cols = ['#ff8fb0', '#ffc27a', '#fff09a', '#9be8b0', '#9ad0ff'];
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 11;
    for (let i = 0; i < cols.length; i++) {
      ctx.strokeStyle = cols[i];
      ctx.beginPath(); ctx.arc(W * 0.24, gy + 10, 150 - i * 11, Math.PI, TAU); ctx.stroke();
    }
    ctx.globalAlpha = 1;

    const nc = Math.max(4, Math.round(W / 110));
    for (let i = 0; i < nc; i++) {
      const x = ((i * 137 + machine.t * (6 + (i % 3) * 2)) % (W + 140)) - 70;
      const y = 100 + (i % 4) * H * 0.14;
      ctx.fillStyle = 'rgba(255,255,255,.55)';
      circ(ctx, x, y, 19); circ(ctx, x + 21, y + 4, 15); circ(ctx, x - 21, y + 5, 14); circ(ctx, x + 4, y - 11, 14);
      ctx.fillStyle = 'rgba(120,80,150,.45)';
      circ(ctx, x - 6, y + 1, 1.8); circ(ctx, x + 6, y + 1, 1.8);
      ctx.strokeStyle = 'rgba(120,80,150,.45)';
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(x, y + 3, 3, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
    }
    ctx.fillStyle = '#fff';
    const ns = Math.round(W / 36);
    for (let i = 0; i < ns; i++) {
      ctx.globalAlpha = 0.4 + 0.35 * Math.sin(machine.t * 2 + i * 1.3);
      star(ctx, WALL + 12 + (i * 89) % (W - 2 * WALL - 24), 70 + (i * 131) % (H * 0.6), 5 + (i % 3));
    }
    ctx.globalAlpha = 1;
  }

  // ---------- Dessin : machine ----------
  function drawMachine() {
    const hot = g && state === 'play' && g.event && g.event.type === 'chauffe';
    const twin = g && inGame() && g.level >= 3;
    const x = machine.x + (machine.shake > 0 ? (Math.random() - 0.5) * 3 : 0);
    ctx.save();
    ctx.translate(x, MY);

    ctx.strokeStyle = th.cable;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-44 * MS, -MY); ctx.lineTo(-44 * MS, 6);
    ctx.moveTo(44 * MS, -MY); ctx.lineTo(44 * MS, 6);
    ctx.stroke();

    ctx.scale(MS, MS);

    // Socle
    ctx.fillStyle = OUT; rr(ctx, -61.5, 88.5, 123, 35, 9); ctx.fill();
    ctx.fillStyle = th.machine; rr(ctx, -60, 90, 120, 32, 8); ctx.fill();
    ctx.fillStyle = th.machineDark; rr(ctx, -60, 110, 120, 12, 8); ctx.fill();
    ctx.fillStyle = th.machineTrim; ctx.fillRect(-60, 97, 120, 3);

    // Goulottes
    for (const cx of twin ? [-30, 30] : [0]) {
      ctx.fillStyle = th.machineTrim; rr(ctx, cx - 19, 105, 38, 18, 6); ctx.fill();
      ctx.fillStyle = th.hole; rr(ctx, cx - 16, 108, 32, 15, 5); ctx.fill();
    }
    if (th.faces && !twin) {
      ctx.fillStyle = th.hole;
      circ(ctx, -34, 111, 3); circ(ctx, 34, 111, 3);
      ctx.fillStyle = 'rgba(255,255,255,.6)';
      circ(ctx, -45, 115, 4); circ(ctx, 45, 115, 4);
    }

    // Vitrine
    ctx.fillStyle = OUT; ctx.fillRect(-56, 20, 112, 72);
    const gl = ctx.createLinearGradient(0, 22, 0, 92);
    gl.addColorStop(0, 'rgba(255,250,235,.42)');
    gl.addColorStop(1, 'rgba(255,240,205,.20)');
    ctx.fillStyle = th.bg[0]; ctx.fillRect(-54, 22, 108, 70);
    ctx.fillStyle = gl; ctx.fillRect(-54, 22, 108, 70);

    // Tas de pop-corn
    for (const pass of [1, 0]) {
      ctx.fillStyle = pass ? '#e8c46c' : '#fff6da';
      for (let i = 0; i < 15; i++) {
        const hx = -49 + i * 7;
        const hy = 84 - Math.abs(Math.sin(i * 1.7)) * 8 - (1 - Math.abs(i - 7) / 7.5) * 15;
        circ(ctx, hx, hy + (pass ? 2 : 0), pass ? 8 : 7);
      }
    }
    ctx.fillStyle = '#fff6da'; ctx.fillRect(-54, 82, 108, 10);

    // Marmite et grains qui sautent
    ctx.fillStyle = '#6d7a85'; ctx.fillRect(-1.5, 22, 3, 12);
    ctx.fillStyle = '#8d99a3'; ctx.beginPath(); ctx.arc(0, 34, 16, 0, Math.PI); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.arc(-4, 35, 11, Math.PI * 0.55, Math.PI * 0.95); ctx.lineTo(-4, 35); ctx.fill();
    ctx.fillStyle = '#fffaf0';
    const hop = hot ? 14 : 6;
    for (let i = 0; i < 4; i++) circ(ctx, -18 + i * 12, 33 - Math.abs(Math.sin(machine.t * hop + i * 1.9)) * 9, 3.6);

    // Reflet de la vitre et cadre
    ctx.fillStyle = 'rgba(255,255,255,.22)';
    ctx.beginPath(); ctx.moveTo(-50, 25); ctx.lineTo(-30, 25); ctx.lineTo(-50, 62); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-24, 25); ctx.lineTo(-18, 25); ctx.lineTo(-50, 84); ctx.lineTo(-50, 73); ctx.fill();
    ctx.strokeStyle = th.machineTrim;
    ctx.lineWidth = 3;
    ctx.strokeRect(-54, 22, 108, 70);

    // Toit, store festonné, enseigne
    ctx.fillStyle = OUT; rr(ctx, -63.5, -1.5, 127, 27, 10); ctx.fill();
    ctx.fillStyle = th.machine; rr(ctx, -62, 0, 124, 24, 9); ctx.fill();
    for (let i = 0; i < 9; i++) {
      ctx.fillStyle = i % 2 ? th.sign : th.machine;
      ctx.beginPath(); ctx.arc(-55.2 + i * 13.8, 24, 6.9, 0, Math.PI); ctx.fill();
    }
    ctx.fillStyle = th.sign;
    ctx.font = '900 14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('POP POP', 0, 12);

    // Ampoules
    for (let i = 0; i < 9; i++) {
      const on = (Math.floor(machine.t * (hot ? 10 : 4)) + i) % 2 === 0;
      const bx = -56 + i * 14;
      if (on) { ctx.fillStyle = 'rgba(255,230,140,.35)'; circ(ctx, bx, -1, 5.5); }
      ctx.fillStyle = on ? th.bulbOn : th.bulbOff;
      circ(ctx, bx, -1, 2.8);
    }

    if (hot) {
      ctx.fillStyle = 'rgba(255,60,20,' + (0.2 + 0.15 * Math.sin(machine.t * 18)) + ')';
      rr(ctx, -62, 0, 124, 122, 9); ctx.fill();
    }
    ctx.restore();
  }

  // ---------- Dessin : joueur ----------
  // Personnage complet, pieds en (0,0) : sert au jeu et à l'aperçu du menu.
  function drawFigure(c, a, bucketId, bw, mood, fill) {
    const bb = bw * 0.72;
    if (a.cape) {
      for (const pass of [1, 0]) {
        const o = pass ? 1.4 : 0;
        c.fillStyle = pass ? OUT : a.cape;
        c.beginPath();
        c.moveTo(-12 - o, -33 - o); c.lineTo(12 + o, -33 - o); c.lineTo(22 + o, -2 + o);
        c.quadraticCurveTo(0, -9, -22 - o, -2 + o);
        c.closePath(); c.fill();
      }
    }
    if (a.shirt) {
      c.fillStyle = '#3a2019';
      rr(c, -15, -7, 13, 8, 3.5); c.fill();
      rr(c, 2, -7, 13, 8, 3.5); c.fill();
      c.fillStyle = OUT; rr(c, -16.3, -35.3, 32.6, 32.6, 9); c.fill();
      c.fillStyle = a.shirt; rr(c, -15, -34, 30, 30, 8); c.fill();
      c.fillStyle = 'rgba(255,255,255,.18)'; rr(c, -12, -31, 8, 22, 4); c.fill();
    }
    c.lineCap = 'round';
    for (const pass of [1, 0]) {
      c.strokeStyle = pass ? OUT : a.skin;
      c.lineWidth = pass ? 8.4 : 6;
      c.beginPath();
      c.moveTo(-14, -26); c.lineTo(-bb - 3, -86);
      c.moveTo(14, -26); c.lineTo(bb + 3, -86);
      c.stroke();
    }
    drawAvatar(c, a.id, 0, -52, 24, mood);
    c.save();
    c.translate(0, -112);
    drawBucket(c, bucketId, bw, th, fill);
    c.restore();
  }

  function drawPlayer() {
    const gy = groundY();
    const bw = bucketHalf();
    const mood = g.hurt > 0 ? 'sad' : (player.bounce > 0 || g.combo >= COMBO_STEP) ? 'happy' : '';
    const sq = player.bounce > 0 ? Math.sin(player.bounce / 0.25 * Math.PI) * 0.09 : 0;

    ctx.fillStyle = 'rgba(0,0,0,.28)';
    oval(ctx, player.x, gy + 3, 34, 6);

    if (g.magnet > 0) {
      ctx.strokeStyle = 'rgba(159,232,255,' + (0.35 + 0.25 * Math.sin(machine.t * 12)) + ')';
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(player.x, rimY(), 86 + Math.sin(machine.t * 8) * 7, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
    }

    ctx.save();
    // Clignotement pendant le court répit qui suit un coup reçu
    if (g.invul > 0 && Math.floor(machine.t * 14) % 2) ctx.globalAlpha = 0.35;
    ctx.translate(player.x, gy);
    ctx.rotate(player.lean + (g.hurt > 0 ? Math.sin(g.hurt * 45) * 0.1 : 0));
    ctx.scale(PS * (1 + sq), PS * (1 - sq));
    drawFigure(ctx, avatar(), save.bucket, bw, mood, g.combo > 0 ? 1 + Math.floor(g.combo / 3) : 0);
    ctx.restore();
  }

  // Zone de commande sous le sol : un rail et une poignée alignée sous le personnage.
  // Le doigt se pose sur la poignée, le personnage reste visible au-dessus.
  const ctrlY = () => groundY() + 24 + (CTRL_H - 8) / 2;
  function drawControl() {
    const gy = groundY();
    const y = ctrlY();
    const x0 = WALL + 30, x1 = maxX();
    const held = dragAbs && dragId !== null;

    ctx.fillStyle = 'rgba(0,0,0,.30)';
    ctx.fillRect(0, gy + 14, W, H - gy - 14);

    // Rail
    ctx.fillStyle = 'rgba(0,0,0,.35)';
    rr(ctx, x0 - 8, y - 8, x1 - x0 + 16, 16, 8); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.22)';
    rr(ctx, x0 - 6, y - 6, x1 - x0 + 12, 12, 6); ctx.fill();
    ctx.fillStyle = th.trim;
    ctx.globalAlpha = 0.5;
    for (let i = 0; i <= 8; i++) circ(ctx, x0 + (x1 - x0) * i / 8, y, 2);
    ctx.globalAlpha = 1;

    // Lien visuel entre la poignée et le personnage
    ctx.strokeStyle = 'rgba(255,255,255,.28)';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 5]);
    ctx.beginPath(); ctx.moveTo(player.x, gy + 8); ctx.lineTo(player.x, y - 28 * HS); ctx.stroke();
    ctx.setLineDash([]);

    // Poignée
    const r = (held ? 31 : 28) * HS;
    if (held) { ctx.fillStyle = 'rgba(255,255,255,.22)'; circ(ctx, player.x, y, r + 9 * HS); }
    ctx.fillStyle = OUT; circ(ctx, player.x, y, r + 2);
    ctx.fillStyle = th.trim; circ(ctx, player.x, y, r);
    ctx.fillStyle = th.machine; circ(ctx, player.x, y, r - 5 * HS);
    ctx.fillStyle = 'rgba(255,255,255,.25)'; oval(ctx, player.x - 6 * HS, y - 10 * HS, 11 * HS, 5 * HS, -0.4);
    ctx.fillStyle = th.sign;
    for (const sx of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(player.x + sx * 16 * HS, y); ctx.lineTo(player.x + sx * 6 * HS, y - 8 * HS); ctx.lineTo(player.x + sx * 6 * HS, y + 8 * HS);
      ctx.closePath(); ctx.fill();
    }
  }

  function bigText(txt, x, y, size, col, alpha) {
    ctx.globalAlpha = alpha;
    ctx.font = '900 ' + size + 'px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.lineWidth = size * 0.22;
    ctx.strokeStyle = 'rgba(40,10,20,.75)';
    ctx.strokeText(txt, x, y);
    ctx.fillStyle = col;
    ctx.fillText(txt, x, y);
    ctx.globalAlpha = 1;
  }

  function draw() {
    const shaking = shakeT > 0 && !calm && state === 'play';
    if (shaking) {
      ctx.save();
      ctx.translate((Math.random() - 0.5) * 24 * shakeT, (Math.random() - 0.5) * 24 * shakeT);
    }
    drawBg();
    for (const it of items) {
      const s = TYPES[it.type].s;
      ctx.save();
      ctx.translate(it.x, it.y);
      ctx.rotate(th.faces ? Math.sin(it.rot) * 0.35 : it.rot);
      ctx.scale(s, s);
      drawItem(ctx, it.type, { t: machine.t, seed: it.seed, face: th.faces });
      ctx.restore();
    }
    const bricksOn = !!(g && mode === 'brique' && inGame() && g.bricks);
    const invOn = !!(g && mode === 'invasion' && inGame() && g.inv);
    const empOn = !!(g && mode === 'empile' && inGame() && g.emp);
    const labyOn = !!(g && mode === 'laby' && inGame() && g.laby);
    const rafOn = !!(g && mode === 'rafle' && inGame() && g.raf);
    if (bricksOn) drawBricks(); else if (invOn) drawInvaders(); else if (empOn) drawBoard(); else if (labyOn) drawLaby(); else if (!rafOn) drawMachine();
    if (inGame()) {
      if (labyOn) drawLabyPad();
      else if (rafOn) { drawPlayer(); drawRafle(); }
      else {
        if (!empOn) drawPlayer();
        drawControl();
        if (empOn) drawEmpButtons();
      }
    }
    if (bricksOn) drawBall();

    for (const p of parts) {
      const k = clamp(p.life / p.max, 0, 1);
      ctx.globalAlpha = k;
      if (p.ring) {
        ctx.strokeStyle = p.col;
        ctx.lineWidth = 4 * k;
        ctx.beginPath(); ctx.arc(p.x, p.y, 20 + (1 - k) * 46, 0, TAU); ctx.stroke();
      } else {
        ctx.fillStyle = p.col;
        if (p.star) star(ctx, p.x, p.y, p.r * 2); else circ(ctx, p.x, p.y, p.r);
      }
    }
    ctx.globalAlpha = 1;
    for (const t of texts) bigText(t.txt, t.x, t.y, 24, t.col, clamp(t.life * 2, 0, 1));

    if (g && inGame()) {
      if (state === 'count' || (state === 'pause' && resumeTo === 'count')) {
        const n = Math.max(1, Math.ceil(g.count));
        const f = g.count - Math.floor(g.count);
        bigText(String(n), W / 2, H * 0.48, 110 + f * 40, '#fff4d6', 1);
        bigText(mode === 'brique' ? 'Renvoie le grain avec ton seau' : mode === 'invasion' ? 'Vise avec la poignée, esquive les braises' : mode === 'empile' ? 'Glisse la poignée sous la colonne voulue' : mode === 'laby' ? 'Glisse le doigt dans la direction voulue' : mode === 'rafle' ? 'Glisse le doigt sur les friandises' : 'Glisse la poignée sous ton personnage', W / 2, H * 0.48 + 110, Math.min(18, W / 22), '#fff4d6', 1);
      }
      if (g.banner) {
        const a = clamp(g.banner.t * 2, 0, 1);
        const pop = 1 + Math.max(0, g.banner.t - 1.5) * 2;
        // Taille réduite pour les textes longs, afin qu'ils tiennent dans la largeur
        const size = Math.min(34, W / 13, (W - 44) / (g.banner.txt.length * 0.6));
        bigText(g.banner.txt, W / 2, H * 0.42, size * pop, g.banner.col, a);
      }
      if (g.hurt > 0 && state === 'play') {
        ctx.fillStyle = 'rgba(255,40,40,' + g.hurt * 0.45 + ')';
        ctx.fillRect(0, 0, W, H);
      }
    }
    if (shaking) ctx.restore();
  }

  // ---------- Interface ----------
  const hudCache = {};
  function setText(id, v) {
    if (hudCache[id] !== v) { hudCache[id] = v; $('#' + id).textContent = v; }
  }
  function setBar(id, pct) {
    if (hudCache['w:' + id] !== pct) { hudCache['w:' + id] = pct; $('#' + id).style.width = pct + '%'; }
  }
  function setClass(id, cls, on) {
    const k = 'c:' + id + cls;
    if (hudCache[k] !== on) { hudCache[k] = on; $('#' + id).classList.toggle(cls, on); }
  }
  function updateHud() {
    if (!g) return;
    setText('score', String(g.score));
    const mult = Math.min(5, 1 + Math.floor(g.combo / COMBO_STEP));
    setText('combo', mult > 1 ? 'x' + mult : '');
    setText('level', (mode === 'invasion' ? 'Vague ' : 'Niv. ') + g.level);
    setText('status', mode === 'chrono' ? '⏱ ' + Math.ceil(g.left) : mode === 'tuto' ? 'Tutoriel' : mode === 'empile' ? 'Lignes ' + g.emp.lines : '❤'.repeat(Math.max(0, g.lives)));
    setBar('comboBar', mult >= 5 ? 100 : Math.round((g.combo % COMBO_STEP) / COMBO_STEP * 100));
    setClass('comboWrap', 'max', mult >= 5);
    const power = Math.max(g.giant, g.magnet, mode === 'invasion' ? invPower().t : 0, g.fire || 0, mode === 'laby' ? labyPower().t : mode === 'rafle' ? rafPower().t : 0);
    setClass('powerWrap', 'hidden', power <= 0);
    setBar('powerBar', Math.round(power / 8 * 100));
    let pw = '';
    if (g.giant > 0) pw = 'Seau géant ' + Math.ceil(g.giant);
    else if (g.magnet > 0) pw = 'Aimant ' + Math.ceil(g.magnet);
    else if (mode === 'invasion') pw = invPower().txt;
    else if (g.fire > 0) pw = 'Grain de feu ' + Math.ceil(g.fire);
    else if (mode === 'laby') pw = labyPower().txt;
    else if (mode === 'rafle') pw = rafPower().txt;
    else if (mode === 'survie' && g.miss > 0) pw = 'Ratés ' + g.miss + '/' + MISS_MAX;
    setText('power', pw);
  }

  // ---------- Navigation entre les écrans ----------
  const SUB = ['vest', 'succes', 'rank', 'help'];
  let current = 'menu';
  let navDepth = 0;   // entrées ajoutées à l'historique du navigateur
  function pushNav() {
    try { history.pushState({ pop: 1 }, ''); navDepth++; } catch (e) {}
  }
  function backToMenu() {
    rankToken++;
    if (current === 'help') { save.tuto = true; persist(); }
    buildMenu();
    show('menu');
  }
  // Les boutons « Menu » passent par l'historique, pour se comporter comme le bouton retour du téléphone.
  function navBack() {
    if (navDepth > 0) history.back(); else backToMenu();
  }
  window.addEventListener('popstate', () => {
    navDepth = Math.max(0, navDepth - 1);
    if (SUB.includes(current)) backToMenu();
    else if (state === 'play' || state === 'count') { pause(); pushNav(); }
    else if (state === 'pause') pushNav();
    else if (state === 'over') goMenu();
  });

  const SCREENS = ['menu', 'vest', 'succes', 'rank', 'help', 'pause', 'over'];
  function show(which) {
    current = which;
    for (const id of SCREENS) $('#' + id).classList.toggle('hidden', id !== which);
    $('#hud').classList.toggle('hidden', which !== 'hud' && which !== 'pause');
    $('#update').classList.toggle('ingame', which === 'hud' || which === 'pause');
  }

  let toastTimer = 0;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.add('hidden'), 3200);
  }

  function applyTheme() {
    th = THEMES[save.theme] || THEMES.cinema;
    document.body.dataset.theme = save.theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', th.page);
  }

  const walletText = () => save.pop + ' 🍿    ' + save.candy + ' 🍬';

  function drawPreview() {
    const cv = $('#preview');
    const c = cv.getContext('2d');
    c.clearRect(0, 0, cv.width, cv.height);
    c.save();
    c.translate(cv.width / 2, cv.height - 8);
    c.scale(1.35, 1.35);
    drawFigure(c, avatar(), save.bucket, 34, 'happy', 4);
    c.restore();
  }

  // Passe à l'avatar débloqué précédent ou suivant, directement depuis le menu.
  function cycleAvatar(dir) {
    const owned = AVATARS.filter((a) => save.unlocked.includes(a.id));
    const i = Math.max(0, owned.findIndex((a) => a.id === save.avatar));
    save.avatar = owned[(i + dir + owned.length) % owned.length].id;
    persist();
    buildMenu();
    tone(600, 0.05, 'triangle', 0.08);
  }

  function buildMenu() {
    ensureDaily();
    $('#wallet').textContent = walletText();
    $('#best').textContent = 'Records — Chrono : ' + save.best.chrono + ' · Survie : ' + save.best.survie + ' · Briques : ' + (save.best.brique || 0) + ' · Invasion : ' + (save.best.invasion || 0) + ' · Empilage : ' + (save.best.empile || 0) + ' · Labyrinthe : ' + (save.best.laby || 0) + ' · Attrape-tout : ' + (save.best.rafle || 0);
    $('#btnMusic').textContent = (save.music ? '🎵' : '🔇') + ' Musique';
    $('#btnSfx').textContent = (save.sfx ? '🔊' : '🔇') + ' Bruitages';
    $('#avName').textContent = avatar().name;
    const nu = nextUnlock();
    const can = !!(nu && nu.need === 0);
    $('#btnLook').classList.toggle('notify', can);
    $('#lookHint').textContent = can ? 'Nouveau : tu peux débloquer ' + nu.o.name + ' !' : 'Change d\'avatar, de seau et de style';
    drawPreview();
    const list = $('#daily');
    list.textContent = '';
    for (const t of save.daily.tasks) {
      const c = CH[t.id];
      if (!c) continue;
      const row = document.createElement('div');
      row.className = 'task' + (t.done ? ' done' : '');
      const label = document.createElement('span');
      label.textContent = c.text(t.goal);
      const val = document.createElement('b');
      val.textContent = t.done ? '✓ +' + c.reward + ' 🍬' : (t.goal > 1 ? t.prog + '/' + t.goal + ' · ' : '') + '+' + c.reward + ' 🍬';
      row.append(label, val);
      list.append(row);
    }
  }

  function costText(o) {
    const parts = [];
    if (o.pop) parts.push(o.pop + ' 🍿');
    if (o.candy) parts.push(o.candy + ' 🍬');
    return '🔒 ' + parts.join(' + ');
  }

  // Sélectionne un élément, en l'achetant d'abord s'il est verrouillé.
  function choose(o, owned, key) {
    if (!owned.includes(o.id)) {
      const needPop = Math.max(0, (o.pop || 0) - save.pop);
      const needCandy = Math.max(0, (o.candy || 0) - save.candy);
      if (needPop || needCandy) {
        const miss = [];
        if (needPop) miss.push(needPop + ' 🍿');
        if (needCandy) miss.push(needCandy + ' 🍬');
        toast('Il te manque ' + miss.join(' et ') + ' pour débloquer ' + o.name);
        tone(200, 0.12, 'square', 0.06);
        return;
      }
      save.pop -= o.pop || 0;
      save.candy -= o.candy || 0;
      owned.push(o.id);
      const lines = [o.name + ' est débloqué !'];
      checkAchievements(lines);
      toast(lines.join(' · '));
      jingle([523, 784, 1047], 100);
    } else {
      tone(600, 0.05, 'triangle', 0.08);
    }
    save[key] = o.id;
    persist();
    buildVest();
  }

  function card(o, selected, locked, paint) {
    const b = document.createElement('button');
    b.className = 'av' + (selected ? ' sel' : '') + (locked ? ' locked' : '');
    const cv = document.createElement('canvas');
    cv.width = cv.height = 120;
    paint(cv.getContext('2d'));
    const name = document.createElement('span');
    name.textContent = o.name;
    b.append(cv, name);
    if (locked) {
      const cost = document.createElement('span');
      cost.className = 'cost';
      cost.textContent = costText(o);
      b.append(cost);
    }
    return b;
  }

  function buildVest() {
    $('#wallet2').textContent = walletText();
    const styles = $('#styles');
    styles.textContent = '';
    for (const id of Object.keys(THEMES)) {
      const b = document.createElement('button');
      b.className = 'chip' + (id === save.theme ? ' sel' : '');
      b.textContent = THEMES[id].name;
      b.addEventListener('click', () => {
        save.theme = id;
        persist();
        applyTheme();
        buildVest();
        tone(600, 0.05, 'triangle', 0.08);
      });
      styles.append(b);
    }
    const avGrid = $('#avGrid');
    avGrid.textContent = '';
    for (const a of AVATARS) {
      const b = card(a, a.id === save.avatar, !save.unlocked.includes(a.id), (c) => drawAvatar(c, a.id, 60, 70, 33, ''));
      b.addEventListener('click', () => choose(a, save.unlocked, 'avatar'));
      avGrid.append(b);
    }
    const buGrid = $('#buGrid');
    buGrid.textContent = '';
    for (const k of BUCKETS) {
      const b = card(k, k.id === save.bucket, !save.buckets.includes(k.id), (c) => {
        c.translate(60, 38);
        c.scale(1.55, 1.55);
        drawBucket(c, k.id, 30, th, 5);
      });
      b.addEventListener('click', () => choose(k, save.buckets, 'bucket'));
      buGrid.append(b);
    }
  }

  function buildSucces() {
    const s = save.stats;
    const stats = $('#stats');
    stats.textContent = '';
    const rows = [
      ['Parties jouées', s.games], ['Pop-corn attrapés', s.pop], ['Bonbons attrapés', s.candy],
      ['Sucettes attrapées', s.sucette], ['Grains brûlés', s.burnt], ['Meilleur combo', s.combo], ['Niveau maximum', s.level],
    ];
    for (const [k, v] of rows) {
      const row = document.createElement('div');
      row.className = 'task';
      const a = document.createElement('span'); a.textContent = k;
      const b = document.createElement('b'); b.textContent = v;
      row.append(a, b);
      stats.append(row);
    }
    const list = $('#achList');
    list.textContent = '';
    for (const a of ACHS) {
      const got = save.ach.includes(a.id);
      const row = document.createElement('div');
      row.className = 'task' + (got ? ' done' : '');
      const txt = document.createElement('span');
      const name = document.createElement('strong');
      name.textContent = a.name;
      txt.append(name, document.createElement('br'), a.desc);
      const b = document.createElement('b');
      b.textContent = got ? '🏆' : '+' + ACH_REWARD + ' 🍬';
      row.append(txt, b);
      list.append(row);
    }
    $('#achCount').textContent = save.ach.length + ' / ' + ACHS.length;
  }

  function buildHelp() {
    const list = $('#helpList');
    if (list.childElementCount) return;
    const rows = [
      ['pop', 'Pop-corn : +1 point'],
      ['caramel', 'Pop-corn caramel : +3'],
      ['bonbon', 'Bonbon : +5'],
      ['sucette', 'Sucette : +10'],
      ['arc', 'Arc-en-ciel : seau géant ou aimant'],
      ['brule', 'Grain brûlé : à éviter !'],
    ];
    for (const [type, text] of rows) {
      const row = document.createElement('div');
      row.className = 'help-row';
      const cv = document.createElement('canvas');
      cv.width = cv.height = 96;
      const c = cv.getContext('2d');
      c.translate(48, type === 'sucette' ? 38 : 48);
      c.scale(type === 'bonbon' ? 1.9 : 2.3, type === 'bonbon' ? 1.9 : 2.3);
      drawItem(c, type, { t: 0.4, seed: 0, face: false });
      const span = document.createElement('span');
      span.textContent = text;
      row.append(cv, span);
      list.append(row);
    }
  }

  function goMenu() {
    const out = finish(false);
    music(false);
    checkVersion();
    state = 'menu';
    items = [];
    buildMenu();
    show('menu');
    if (out && out.lines.length) toast(out.lines.join(' · '));
    trySync();
  }

  // ---------- Classement en ligne ----------
  // Le pseudo est composé de mots imposés (aucun texte libre) : le jeu est tous publics,
  // et un enfant ne peut donc pas y saisir son vrai nom. Mêmes listes dans supabase/classement.sql.
  const NAME_A = ["Panda", "Renard", "Tigre", "Lapin", "Hibou", "Koala", "Dragon", "Robot", "Pirate", "Ninja", "Castor", "Dauphin", "Lion", "Loup", "Ours", "Zèbre", "Pingouin", "Hérisson", "Chaton", "Poussin"];
  const NAME_B = ["Malin", "Rapide", "Joyeux", "Gourmand", "Rigolo", "Géant", "Doré", "Futé", "Brave", "Agile", "Curieux", "Farceur", "Magique", "Costaud", "Rusé", "Super", "Turbo", "Cosmique", "Sucré", "Croustillant"];
  const NAME_RE = new RegExp("^(" + NAME_A.join("|") + ") (" + NAME_B.join("|") + ") [1-9][0-9]$");
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const randomName = () => pick(NAME_A) + " " + pick(NAME_B) + " " + (10 + Math.floor(Math.random() * 90));
  let pendingName = "";
  function newId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 3) | 8).toString(16);
    });
  }

  // Envoie les records en attente. Sans réseau, ils restent marqués et repartent plus tard.
  const RANK_MODES = [['chrono', 'Chrono'], ['survie', 'Survie'], ['brique', 'Briques'], ['invasion', 'Invasion'], ['empile', 'Empilage'], ['laby', 'Labyrinthe'], ['rafle', 'Attrape-tout']];
  let syncing = null;
  function trySync() {
    if (syncing) return syncing;
    if (!save.player.name || !save.player.id || !window.Online) return Promise.resolve(false);
    syncing = (async () => {
      try {
        let ok = true;
        for (const [m] of RANK_MODES) {
          if (!save.dirty[m] || !(save.best[m] > 0)) continue;
          // Un échec sur un mode ne doit pas empêcher l'envoi des autres
          try {
            await window.Online.submit(save.player, m, save.best[m]);
            save.dirty[m] = false;
            persist();
          } catch (e) {
            ok = false;
          }
        }
        return ok;
      } finally {
        syncing = null;
      }
    })();
    return syncing;
  }

  let rankMode = 'chrono';
  let rankScope = 'monde';
  let rankToken = 0;

  function chips(el, options, current, onPick) {
    el.textContent = '';
    for (const [id, label] of options) {
      const b = document.createElement('button');
      b.className = 'chip' + (id === current ? ' sel' : '');
      b.textContent = label;
      b.addEventListener('click', () => onPick(id));
      el.append(b);
    }
  }

  async function loadRank() {
    const token = ++rankToken;
    if (!save.player.grp) rankScope = 'monde';
    chips($('#rankModes'), RANK_MODES, rankMode, (id) => { rankMode = id; loadRank(); });
    const scopes = [['monde', 'Monde']];
    if (save.player.grp) scopes.push(['groupe', 'Groupe ' + save.player.grp]);
    chips($('#rankScopes'), scopes, rankScope, (id) => { rankScope = id; loadRank(); });

    const msg = $('#rankMsg');
    const list = $('#rankList');
    list.textContent = '';
    msg.textContent = 'Chargement…';
    try {
      await trySync();
      const rows = await window.Online.top(rankMode, rankScope === 'groupe' ? save.player.grp : null, save.player.id || null);
      if (token !== rankToken) return;
      if (!rows || !rows.length) {
        msg.textContent = 'Aucun score pour le moment. À toi de jouer !';
      } else if (!save.player.name) {
        msg.textContent = 'Enregistre ton pseudo ci-dessous pour apparaître dans le classement.';
      } else if (!rows.some((r) => r.me)) {
        msg.textContent = 'Termine une partie pour entrer dans ce classement.';
      } else {
        msg.textContent = '';
      }
      for (const r of rows || []) {
        const row = document.createElement('div');
        row.className = 'task' + (r.me ? ' me' : '');
        const who = document.createElement('span');
        const pos = document.createElement('b');
        pos.className = 'pos';
        pos.textContent = r.pos <= 3 ? ['🥇', '🥈', '🥉'][r.pos - 1] : r.pos + '.';
        who.append(pos, ' ' + r.name + (r.me ? ' (toi)' : ''));
        const sc = document.createElement('b');
        sc.textContent = r.score;
        row.append(who, sc);
        list.append(row);
      }
    } catch (e) {
      if (token !== rankToken) return;
      msg.textContent = 'Classement indisponible pour le moment. Vérifie ta connexion.';
    }
  }

  function openRank() {
    pendingName = save.player.name || randomName();
    $('#nameView').textContent = pendingName;
    $('#inGrp').value = save.player.grp;
    show('rank');
    loadRank();
  }

  function saveProfile() {
    const name = NAME_RE.test(pendingName) ? pendingName : randomName();
    const grp = $('#inGrp').value.trim().toUpperCase();
    if (grp && !/^[A-Z0-9]{3,10}$/.test(grp)) { toast('Le code de groupe fait 3 à 10 lettres ou chiffres, sans espace.'); return; }
    if (!save.player.id) save.player.id = newId();
    save.player.name = name;
    save.player.grp = grp;
    for (const [m] of RANK_MODES) save.dirty[m] = save.best[m] > 0;
    persist();
    $('#inGrp').value = grp;
    toast('Profil enregistré');
    tone(700, 0.08, 'triangle', 0.09);
    loadRank();
  }

  function pause() {
    if (state !== 'play' && state !== 'count') return;
    resumeTo = state;
    state = 'pause';
    show('pause');
  }

  function openHelp() {
    buildHelp();
    show('help');
  }

  $('#btnChrono').addEventListener('click', () => newGame('chrono'));
  $('#btnSurvie').addEventListener('click', () => newGame('survie'));
  $('#btnBrique').addEventListener('click', () => newGame('brique'));
  $('#btnInvasion').addEventListener('click', () => newGame('invasion'));
  $('#btnEmpile').addEventListener('click', () => newGame('empile'));
  $('#btnLaby').addEventListener('click', () => newGame('laby'));
  $('#btnRafle').addEventListener('click', () => newGame('rafle'));
  $('#btnAgain').addEventListener('click', () => newGame(mode));
  $('#btnMenu').addEventListener('click', goMenu);
  $('#btnPause').addEventListener('click', pause);
  $('#btnResume').addEventListener('click', () => { state = resumeTo; show('hud'); });
  $('#btnQuit').addEventListener('click', goMenu);
  const openVest = () => { buildVest(); show('vest'); pushNav(); };
  $('#btnLook').addEventListener('click', openVest);
  $('#btnLookPreview').addEventListener('click', openVest);
  $('#btnOverVest').addEventListener('click', () => { goMenu(); openVest(); });
  $('#btnSucces').addEventListener('click', () => { buildSucces(); show('succes'); pushNav(); });
  $('#btnRank').addEventListener('click', () => { openRank(); pushNav(); });
  for (const b of document.querySelectorAll('[data-back]')) b.addEventListener('click', navBack);
  $('#btnProfile').addEventListener('click', saveProfile);
  $('#btnDice').addEventListener('click', () => {
    pendingName = randomName();
    $('#nameView').textContent = pendingName;
    tone(500 + Math.random() * 300, 0.05, 'triangle', 0.08);
  });
  window.addEventListener('online', trySync);
  $('#btnHelp').addEventListener('click', () => { openHelp(); pushNav(); });
  $('#btnHelpOk').addEventListener('click', () => {
    const first = !save.tuto;
    save.tuto = true;
    persist();
    if (first) newGame('tuto'); else navBack();
  });
  $('#btnMusic').addEventListener('click', () => { save.music = !save.music; persist(); buildMenu(); tone(600, 0.06); });
  $('#btnSfx').addEventListener('click', () => { save.sfx = !save.sfx; persist(); buildMenu(); tone(600, 0.06); });
  $('#btnPrev').addEventListener('click', () => cycleAvatar(-1));
  $('#btnNext').addEventListener('click', () => cycleAvatar(1));
  $('#btnTuto').addEventListener('click', () => { save.tuto = true; persist(); newGame('tuto'); });
  // Recharge en contournant le cache du navigateur, qui peut garder les anciens fichiers quelques minutes
  $('#btnUpdate').addEventListener('click', async () => {
    $('#btnUpdate').textContent = 'Chargement…';
    try {
      await Promise.all(VERSION_FILES.concat(['online.js', './']).map((f) => fetch(f, { cache: 'reload' })));
    } catch (e) {}
    location.reload();
  });

  // ---------- Commandes ----------
  // Au doigt, le seau suit le mouvement et non la position : on peut glisser n'importe où
  // sur l'écran sans cacher le personnage. À la souris, il suit directement le pointeur.
  const DRAG_GAIN = 1.25;   // le seau va un peu plus vite que le doigt, pour couvrir l'écran sans grand geste
  let dragId = null;
  let dragX = 0;
  let dragAbs = false;      // vrai quand le doigt tient la poignée
  function pointer(e) {
    if (state !== 'play' && state !== 'count') { dragId = null; return; }
    if (mode === 'empile' && empPointer(e)) return;
    if (mode === 'laby') { labyPointer(e); return; }
    if (mode === 'rafle') { rafPointer(e); return; }
    if (e.pointerType === 'mouse') {
      const r = canvas.getBoundingClientRect();
      player.tx = (e.clientX - r.left) / scale;
      return;
    }
    const r = canvas.getBoundingClientRect();
    if (e.type === 'pointerdown' || e.pointerId !== dragId) {
      dragId = e.pointerId;
      dragX = e.clientX;
      // Un doigt posé dans la zone de commande pilote la poignée directement ;
      // posé ailleurs, il déplace le seau par glissement relatif.
      dragAbs = (e.clientY - r.top) / scale >= groundY() + 14;
      if (!dragAbs) return;
    }
    if (dragAbs) player.tx = clamp((e.clientX - r.left) / scale, WALL + 30, maxX());
    else player.tx = clamp(player.tx + (e.clientX - dragX) / scale * DRAG_GAIN, WALL + 30, maxX());
    dragX = e.clientX;
  }
  const pointerEnd = (e) => { if (e.pointerId === dragId) dragId = null; empPointerUp(e); rafPointerUp(e); };
  canvas.addEventListener('pointerdown', pointer);
  canvas.addEventListener('pointermove', pointer);
  canvas.addEventListener('pointerup', pointerEnd);
  canvas.addEventListener('pointercancel', pointerEnd);
  window.addEventListener('keydown', (e) => {
    if (g && mode === 'laby' && inGame()) {
      const d = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3 }[e.key];
      if (d !== undefined) { g.laby.want = d; e.preventDefault(); return; }
    }
    if (e.key === 'ArrowLeft') keys.left = true;
    else if (e.key === 'ArrowRight') keys.right = true;
    else if (e.key === 'ArrowDown') keys.down = true;
    else if (e.key === 'ArrowUp' && g && mode === 'empile' && state === 'play') empRotate();
    else if (e.key === ' ' && g && mode === 'empile' && state === 'play') { e.preventDefault(); empDrop(); }
    else if (e.key === 'Escape' || e.key === 'p') pause();
  });
  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') keys.left = false;
    else if (e.key === 'ArrowRight') keys.right = false;
    else if (e.key === 'ArrowDown') keys.down = false;
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); else checkVersion(); });
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', resize);

  // ---------- Avis de mise à jour ----------
  // On relève l'empreinte (en-tête ETag) des fichiers du jeu. Si elle change pendant que le jeu
  // est ouvert, une publication a eu lieu : on propose de recharger.
  const VERSION_FILES = ['index.html', 'game.js', 'art.js', 'style.css'];
  let bootVersion = null;
  async function checkVersion() {
    try {
      const tags = await Promise.all(VERSION_FILES.map(async (f) => {
        const r = await fetch(f + '?v=' + Date.now(), { method: 'HEAD', cache: 'no-store' });
        return r.ok ? (r.headers.get('etag') || '') : null;
      }));
      if (tags.some((t) => !t)) return;          // hors ligne, ou serveur sans ETag (test local)
      const v = tags.join('|');
      if (bootVersion === null) bootVersion = v;
      else if (v !== bootVersion) $('#update').classList.remove('hidden');
    } catch (e) {}
  }

  // ---------- Boucle ----------
  let last = 0;
  function frame(t) {
    const real = Math.min(0.033, (t - last) / 1000 || 0);
    last = t;
    shakeT = Math.max(0, shakeT - real);
    slowT = Math.max(0, slowT - real);
    const dt = slowT > 0 && state === 'play' ? real * 0.35 : real;
    if (state !== 'pause') update(dt);
    draw();
    if (state === 'play' || state === 'count') updateHud();
    requestAnimationFrame(frame);
  }

  applyTheme();
  resize();
  machine.x = player.x = player.tx = W / 2;
  buildMenu();
  if (save.tuto) show('menu'); else openHelp();
  checkVersion();
  if (rulesNotice) { persist(); toast('Le jeu est devenu plus corsé : les records repartent de zéro !'); }
  trySync();
  requestAnimationFrame(frame);

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
