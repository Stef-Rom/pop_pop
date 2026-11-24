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
    best: { chrono: 0, survie: 0, brique: 0, invasion: 0, empile: 0 },
    sfx: true, music: true, theme: 'cinema', tuto: false, rules: RULES,
    stats: { games: 0, pop: 0, candy: 0, sucette: 0, burnt: 0, combo: 0, level: 1 },
    ach: [], daily: null,
    player: { id: '', name: '', grp: '' },      // profil du classement en ligne
    dirty: { chrono: false, survie: false, brique: false, invasion: false, empile: false },    // records pas encore envoyés
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
        save.best = { chrono: 0, survie: 0, brique: save.best.brique || 0, invasion: save.best.invasion || 0, empile: save.best.empile || 0 };
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
      count: 3, lastTick: 11, banner: null, banked: false, recordShown: false, tuto: null, rapid: 0, invul: 0,
    };
    if (m === 'empile') {
      const rows = empRows();
      g.emp = { rows, grid: Array.from({ length: rows }, () => new Array(EMP_COLS).fill(0)), cur: null, next: empNewPiece(), fall: 0, lockT: 0, moveT: 0, spawnT: 0.2, lines: 0, joy: 0, garb: 22 };
    }
    if (m === 'invasion') {
      g.wave = 1;
      g.inv = { list: [], shots: [], bombs: [], fx: [], shields: null, charge: null, dir: 1, total: 1, enter: 0, fire: 0.6, bombT: 2, fly: null, flyT: 10, beat: 0, beatI: 0, warned: false };
      buildWave();
    }
    if (m === 'brique') {
      g.stage = 1;
      g.relaunch = 0.4;
      g.idle = 0;
      g.ball = { x: W / 2, y: 0, vx: 0, vy: 0, stuck: true };
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
    if (mode === 'brique' || mode === 'invasion' || mode === 'empile') return 0.3;
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
      if (Math.random() < 0.5) { g.giant = 8; banner('Seau géant !', '#9fe8ff'); }
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
  // Le seau sert de raquette, un grain de maïs de balle, et les briques sont des bonbons.
  // Une brique cassée peut laisser tomber un pop-corn ou un bonbon à rattraper.
  const BRICK_COLS = ['#ff4f9a', '#ff8a1f', '#ffd93b', '#22b96e', '#3a9cff', '#8a5cff', '#ff6b6b'];
  const BALL_R = 9;
  const BRICK_TOP = 74;
  const ballSpeed = () => Math.min(540, (H - CTRL_H) * 0.42 + 26 * (g.stage - 1));

  function buildBricks() {
    const n = g.stage;
    const left = WALL + 8, right = W - WALL - 8, gap = 4, h = 22;
    const cols = Math.max(6, Math.round((right - left) / 54));
    const bw = (right - left - gap * (cols - 1)) / cols;
    const rows = Math.min(4 + Math.floor((n - 1) / 2), 7);
    const shape = (n - 1) % 4;      // plein, damier, pyramide, colonnes
    const mid = (cols - 1) / 2;
    let bonus = 0;
    g.bricks = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (shape === 1 && (r + c) % 2) continue;
        if (shape === 2 && Math.abs(c - mid) > mid - r * 0.7 + 0.01) continue;
        if (shape === 3 && c % 3 === 2) continue;
        let kind = 'bonbon';
        let hp = 1;
        const roll = Math.random();
        if (n >= 2 && roll < 0.1) kind = 'brule';
        else if (roll > 0.95 && bonus < 2) { kind = 'arc'; bonus++; }
        else if (n >= 2 && r < Math.min(n - 1, 3)) { kind = 'caramel'; hp = 2; }
        g.bricks.push({ x: left + c * (bw + gap), y: BRICK_TOP + r * (h + gap), w: bw, h, hp, kind, col: BRICK_COLS[r % BRICK_COLS.length] });
      }
    }
  }

  function stickBall() {
    const b = g.ball;
    b.stuck = true;
    b.x = player.x;
    b.y = rimY() - BALL_R - 3;
  }

  function launchBall() {
    const b = g.ball;
    const s = ballSpeed();
    const a = (Math.random() - 0.5) * 0.9;
    b.vx = Math.sin(a) * s;
    b.vy = -Math.cos(a) * s;
    b.stuck = false;
    tone(660, 0.08, 'triangle');
  }

  function hitBrick(k) {
    const cx = k.x + k.w / 2, cy = k.y + k.h / 2;
    g.idle = 0;
    k.hp--;
    if (k.hp > 0) {
      tone(300, 0.05, 'square', 0.05);
      burst(cx, cy, '#ffe0a0', 3);
      return;
    }
    const pts = 5 * g.stage;
    g.score += pts;
    floatText('+' + pts, cx, cy, '#fff4d6');
    burst(cx, cy, k.kind === 'brule' ? '#6b5a55' : k.col, 8);
    tone(520 + Math.random() * 220, 0.06, 'triangle', 0.1);
    buzz(8);
    let drop = null;
    if (k.kind === 'brule') drop = 'brule';
    else if (k.kind === 'arc') drop = 'arc';
    else if (Math.random() < 0.35) {
      const r = Math.random();
      drop = r < 0.55 ? 'pop' : r < 0.75 ? 'caramel' : r < 0.93 ? 'bonbon' : 'sucette';
    }
    if (drop) {
      items.push({ type: drop, x: cx, y: cy, vx: (Math.random() - 0.5) * 50, vy: -60, rot: Math.random() * TAU, vr: (Math.random() - 0.5) * 6, seed: Math.random() * 360, free: true });
    }
    if (!g.recordShown && save.best.brique > 0 && g.score > save.best.brique) {
      g.recordShown = true;
      banner('Nouveau record !', '#ffe27a');
      jingle([784, 988, 1175, 1568], 90);
    }
  }

  function brickUpdate(dt) {
    const b = g.ball;
    if (b.stuck) {
      stickBall();
      g.relaunch -= dt;
      if (g.relaunch <= 0) launchBall();
      return;
    }
    g.idle += dt;
    const steps = 3;
    const h = dt / steps;
    const half = bucketHalf() * PS;
    const ry = rimY();
    for (let i = 0; i < steps; i++) {
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
        player.bounce = 0.2;
        tone(440, 0.05, 'triangle', 0.09);
      }

      for (const k of g.bricks) {
        if (k.hp <= 0) continue;
        const dx = b.x - clamp(b.x, k.x, k.x + k.w);
        const dy = b.y - clamp(b.y, k.y, k.y + k.h);
        if (dx * dx + dy * dy > BALL_R * BALL_R) continue;
        if (dx === 0 && dy === 0) b.vy = -b.vy;
        else if (Math.abs(dx) > Math.abs(dy)) b.vx = dx > 0 ? Math.abs(b.vx) : -Math.abs(b.vx);
        else b.vy = dy > 0 ? Math.abs(b.vy) : -Math.abs(b.vy);
        hitBrick(k);
        break;
      }

      if (b.y - BALL_R > groundY()) {
        loseLife(b.x, groundY() - 40, '−1 ❤');
        if (state !== 'play') return;
        g.combo = 0;
        g.relaunch = 1;
        stickBall();
        return;
      }
    }

    if (!g.bricks.some((k) => k.hp > 0)) {
      g.stage++;
      g.level = g.stage;
      g.score += 50 * (g.stage - 1);
      banner('Niveau ' + g.stage + ' !', '#ffe27a');
      jingle([523, 659, 784, 1047], 90);
      buildBricks();
      g.relaunch = 1.2;
      stickBall();
    }
  }

  function drawBricks() {
    for (const k of g.bricks) {
      if (k.hp <= 0) continue;
      let col = k.col;
      if (k.kind === 'arc') col = 'hsl(' + Math.round((machine.t * 160 + k.x) % 360) + ',90%,66%)';
      else if (k.kind === 'caramel') col = k.hp > 1 ? '#b8690f' : '#eaa53c';
      else if (k.kind === 'brule') col = '#3a2a25';
      ctx.fillStyle = OUT; rr(ctx, k.x - 1.2, k.y - 1.2, k.w + 2.4, k.h + 2.4, 6.5); ctx.fill();
      ctx.fillStyle = col; rr(ctx, k.x, k.y, k.w, k.h, 5.5); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,.16)'; rr(ctx, k.x, k.y + k.h - 7, k.w, 7, 4); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.34)'; rr(ctx, k.x + 3, k.y + 3, k.w - 6, 5, 2.5); ctx.fill();
      const cx = k.x + k.w / 2, cy = k.y + k.h / 2;
      if (k.kind === 'caramel' && k.hp === 1) {
        ctx.strokeStyle = 'rgba(90,40,0,.75)';
        ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(cx - 9, k.y + 2); ctx.lineTo(cx - 2, cy); ctx.lineTo(cx - 7, cy + 3); ctx.lineTo(cx + 3, k.y + k.h - 2); ctx.stroke();
      } else if (k.kind === 'brule') {
        ctx.strokeStyle = '#ff6a2a';
        ctx.lineWidth = 2.6;
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(cx - 5, cy - 5); ctx.lineTo(cx + 5, cy + 5); ctx.moveTo(cx + 5, cy - 5); ctx.lineTo(cx - 5, cy + 5); ctx.stroke();
      } else if (k.kind === 'arc') {
        ctx.fillStyle = '#fff';
        star(ctx, cx, cy, 7);
      }
    }
  }

  // La balle : un grain de maïs
  function drawBall() {
    const b = g.ball;
    ctx.fillStyle = OUT; circ(ctx, b.x, b.y, BALL_R + 1.6);
    ctx.fillStyle = '#ffc928'; circ(ctx, b.x, b.y, BALL_R);
    ctx.fillStyle = '#e59a12'; oval(ctx, b.x + 1.5, b.y + 3, BALL_R * 0.75, BALL_R * 0.5, 0);
    ctx.fillStyle = '#ffc928'; oval(ctx, b.x + 0.5, b.y + 1.2, BALL_R * 0.78, BALL_R * 0.5, 0);
    ctx.fillStyle = 'rgba(255,255,255,.8)'; circ(ctx, b.x - 3, b.y - 3.4, 2.4);
  }

  // ---------- Mode Invasion ----------
  // Une troupe de grains descend en rangs. Le seau tire des pop-corn tout seul ;
  // il faut viser avec la poignée, esquiver les braises et rattraper ce qui tombe.
  const INV_TOP = 96;
  const INV_ENTER = 0.9;          // durée de l'arrivée d'une vague
  // deaths : les façons de disparaître possibles pour ce type d'ennemi
  const FOES = {
    brule: { pts: 10, hp: 1, size: 1, shoots: true, drop: 0.2, deaths: ['eclate', 'evapore', 'tombe'] },
    braise: { pts: 15, hp: 1, size: 1, shoots: true, drop: 0.2, deaths: ['eclate'] },
    fumee: { pts: 20, hp: 1, size: 1, shoots: false, drop: 0.3, deaths: ['evapore'] },
    costaud: { pts: 30, hp: 2, size: 1.2, shoots: false, drop: 0.5, deaths: ['tombe'] },
  };
  const shieldY = () => rimY() - 82;

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
    const cols = clamp(Math.round((W - 2 * WALL - 90) / 48), 5, 9);
    const rows = Math.min(3 + Math.floor((g.wave - 1) / 2), 5);
    const kinds = rowKinds(rows);
    v.list = [];
    v.dir = 1;
    v.total = cols * rows;
    v.shots = [];
    v.bombs = [];
    v.charge = null;
    v.bombT = 1.4;
    v.enter = INV_ENTER;
    v.warned = false;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        v.list.push({ x: WALL + 32 + c * 46, y: INV_TOP + r * 40, kind: kinds[r], hp: FOES[kinds[r]].hp, alive: true, hit: 0, ph: Math.random() * 6 });
      }
    }
    // Trois cornets de pop-corn servent d'abris ; ils se regarnissent un peu à chaque vague
    if (!v.shields) v.shields = [0.2, 0.5, 0.8].map((t) => ({ x: WALL + t * (W - 2 * WALL), hp: 5 }));
    else for (const s of v.shields) s.hp = Math.min(5, s.hp + 2);
  }

  function hitInvader(e) {
    e.hp--;
    if (e.hp > 0) {
      e.hit = 0.18;
      burst(e.x, e.y, '#cdd6ea', 4);
      tone(240, 0.05, 'square', 0.05);
      return;
    }
    e.alive = false;
    const F = FOES[e.kind];
    const pts = F.pts * g.wave;
    g.score += pts;
    floatText('+' + pts, e.x, e.y - 14, e.kind === 'braise' ? '#ffcf7a' : e.kind === 'costaud' ? '#cfe0ff' : '#fff4d6');
    buzz(8);

    // Plusieurs façons de disparaître
    const fx = { kind: e.kind, x: e.x, y: e.y, t: 0, rot: 0, vx: 0, vy: 0, vr: 0, item: null };
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
        // Il blanchit et s'évapore
        fx.dur = 0.9;
        tone(500, 0.3, 'sine', 0.06, 700);
      } else if (fx.type === 'tombe') {
        // Assommé, il tournoie et tombe hors de l'écran
        fx.dur = 1.3;
        fx.vx = (Math.random() - 0.5) * 120;
        fx.vy = -170;
        fx.vr = (Math.random() < 0.5 ? -1 : 1) * (7 + Math.random() * 5);
        tone(420, 0.35, 'triangle', 0.07, -300);
      } else {
        // Il éclate comme un pop-corn
        fx.dur = 0.32;
        burst(e.x, e.y, e.kind === 'braise' ? '#ffb347' : '#fffaf0', 12);
        ring(e.x, e.y, e.kind === 'braise' ? '#ffb347' : '#fffaf0');
        popSound(0.14);
      }
    }
    g.inv.fx.push(fx);

    if (!g.recordShown && save.best.invasion > 0 && g.score > save.best.invasion) {
      g.recordShown = true;
      banner('Nouveau record !', '#ffe27a');
      jingle([784, 988, 1175, 1568], 90);
    }
  }

  function updateFx(dt) {
    const v = g.inv;
    for (let i = v.fx.length - 1; i >= 0; i--) {
      const f = v.fx[i];
      f.t += dt;
      if (f.type === 'tombe') { f.vy += 760 * dt; f.x += f.vx * dt; f.y += f.vy * dt; f.rot += f.vr * dt; }
      else if (f.type === 'evapore') f.y -= 46 * dt;
      if (f.t < f.dur) continue;
      if (f.type === 'transforme') {
        items.push({ type: f.item, x: f.x, y: f.y, vx: (Math.random() - 0.5) * 30, vy: -40, rot: 0, vr: (Math.random() - 0.5) * 5, seed: Math.random() * 360, free: true });
      }
      v.fx.splice(i, 1);
    }
  }

  function invHurt(x, y, label) {
    g.inv.bombs = [];
    g.inv.charge = null;
    shakeT = 0.3;
    loseLife(x, y, label);
    if (state === 'play') g.invul = 1.4;     // court répit, signalé par le clignotement du personnage
  }

  function invUpdate(dt) {
    const v = g.inv;
    g.invul = Math.max(0, g.invul - dt);
    g.rapid = Math.max(0, g.rapid - dt);
    updateFx(dt);
    if (v.enter > 0) { v.enter -= dt; return; }

    const alive = v.list.filter((e) => e.alive);
    if (!alive.length) {
      if (v.fx.length) return;               // on laisse finir les dernières disparitions
      g.wave++;
      g.level = g.wave;
      g.score += 40 * (g.wave - 1);
      banner('Vague ' + g.wave + ' !', '#ffe27a');
      jingle([523, 659, 784, 1047], 90);
      buildWave();
      return;
    }

    // La troupe accélère à mesure qu'elle se vide
    const thin = 1 - alive.length / v.total;
    const speed = (26 + 7 * g.wave) * (1 + 1.4 * thin);
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const e of alive) {
      if (e.hit > 0) e.hit -= dt;
      minX = Math.min(minX, e.x); maxX = Math.max(maxX, e.x);
      minY = Math.min(minY, e.y); maxY = Math.max(maxY, e.y);
    }
    let down = 0;
    if (v.dir > 0 && maxX + 22 >= W - WALL) { v.dir = -1; down = 16; }
    else if (v.dir < 0 && minX - 22 <= WALL) { v.dir = 1; down = 16; }
    for (const e of alive) { e.x += v.dir * speed * dt; e.y += down; }
    maxY += down;

    // Battement de marche, de plus en plus pressant
    v.beat -= dt;
    if (v.beat <= 0) {
      tone([110, 98, 87, 98][v.beatI++ % 4], 0.07, 'square', 0.045);
      v.beat = lerp(0.85, 0.22, thin);
    }

    if (!v.warned && maxY > rimY() - 200) {
      v.warned = true;
      banner('Ils approchent !', '#ff9d6b');
      buzz(60);
    }
    // La troupe écrase les abris, puis atteint le joueur : une vie perdue, et elle repart d'en haut
    if (maxY + 20 >= shieldY() - 14) for (const s of v.shields) s.hp = 0;
    if (maxY + 18 >= rimY() - 4) {
      invHurt(W / 2, rimY() - 50, 'Ils sont passés : −1 ❤');
      if (state !== 'play') return;
      const lift = minY + down - INV_TOP;
      for (const e of v.list) e.y -= lift;
      v.warned = false;
    }

    // Tir automatique du seau
    v.fire -= dt;
    if (v.fire <= 0 && v.shots.length < (g.rapid > 0 ? 5 : 3)) {
      v.shots.push({ x: player.x, y: rimY() - 12 });
      v.fire = g.rapid > 0 ? 0.2 : 0.42;
      tone(880, 0.03, 'square', 0.022);
    }
    for (let i = v.shots.length - 1; i >= 0; i--) {
      const s = v.shots[i];
      s.y -= 540 * dt;
      if (s.y < 58) { v.shots.splice(i, 1); continue; }
      if (v.fly && Math.abs(s.x - v.fly.x) < 20 && Math.abs(s.y - v.fly.y) < 18) {
        v.shots.splice(i, 1);
        g.score += 50;
        g.rapid = 6;
        floatText('+50', v.fly.x, v.fly.y, '#ffb3da');
        burst(v.fly.x, v.fly.y, '#ffb3da', 12, true);
        banner('Tir rapide !', '#9fe8ff');
        jingle([660, 880, 1100], 70);
        v.fly = null;
        v.flyT = 14 + Math.random() * 8;
        continue;
      }
      for (const e of alive) {
        const reach = 17 * FOES[e.kind].size;
        if (e.alive && Math.abs(s.x - e.x) < reach + 1 && Math.abs(s.y - e.y) < reach) {
          v.shots.splice(i, 1);
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
        if (e.alive) v.bombs.push({ x: e.x, y: e.y + 14, fast: e.kind === 'braise' });
        v.charge = null;
      }
    } else {
      v.bombT -= dt;
      if (v.bombT <= 0) {
        const shooters = alive.filter((e) => e.alive && FOES[e.kind].shoots);
        if (shooters.length) {
          const pick = shooters[Math.floor(Math.random() * shooters.length)];
          let low = pick;
          for (const e of shooters) if (Math.abs(e.x - pick.x) < 6 && e.y > low.y) low = e;
          v.charge = { e: low, t: 0.4 };
        }
        v.bombT = Math.max(0.5, 1.5 - 0.09 * g.wave) * (0.7 + Math.random() * 0.6);
      }
    }
    const reach = bucketHalf() * PS * 0.85;
    const sy = shieldY();
    for (let i = v.bombs.length - 1; i >= 0; i--) {
      const b = v.bombs[i];
      b.y += (165 + 15 * g.wave) * (b.fast ? 1.3 : 1) * dt;
      if (b.y > groundY()) { v.bombs.splice(i, 1); burst(b.x, groundY() - 3, '#ff8a3d', 3); continue; }
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

  function drawInvaders() {
    const v = g.inv;
    const sy = shieldY();

    // Ligne de visée : là où partent les tirs
    ctx.strokeStyle = 'rgba(255,255,255,.16)';
    ctx.lineWidth = 2;
    ctx.setLineDash([2, 11]);
    ctx.beginPath(); ctx.moveTo(player.x, rimY() - 16); ctx.lineTo(player.x, INV_TOP - 26); ctx.stroke();
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
    for (const e of v.list) {
      if (!e.alive) continue;
      const size = FOES[e.kind].size;
      if (v.charge && v.charge.e === e) {
        ctx.fillStyle = 'rgba(255,230,120,' + (0.35 + 0.35 * Math.sin(machine.t * 40)) + ')';
        circ(ctx, e.x, e.y, 27 * size);
      }
      ctx.save();
      ctx.translate(e.x, e.y + oy + Math.sin(machine.t * 6 + e.ph) * (e.kind === 'fumee' ? 4 : 2));
      ctx.rotate(Math.sin(machine.t * 5 + e.ph) * 0.12);
      ctx.scale(size, size);
      if (e.kind === 'fumee') ctx.globalAlpha = 0.88;
      drawFoe(ctx, e.kind, { hp: e.hp, hit: e.hit, t: machine.t + e.ph });
      ctx.restore();
    }

    // Disparitions en cours
    for (const f of v.fx) {
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
        ctx.fillStyle = f.kind === 'braise' ? '#ffd27a' : '#ffffff';
        circ(ctx, 0, 0, 10 + p * 28);
      }
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
  // Des blocs de friandises tombent dans un plateau. Une rangée complète éclate en pop-corn.
  // La poignée choisit la colonne ; deux boutons font tourner la pièce et la lâchent.
  const EMP_COLS = 8;
  const EMP_SIDE = 58;            // largeur du panneau latéral (pièce suivante, avatar)
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
  };
  const EMP_SWEET = ['rose', 'bleu', 'vert', 'violet'];
  let empGest = null;             // geste en cours dans le plateau (toucher = tourner, glisser vers le bas = lâcher)

  const maxX = () => W - WALL - (g && mode === 'empile' && inGame() ? 150 : 30);
  const empButtons = () => [{ id: 'rot', x: W - WALL - 92 }, { id: 'drop', x: W - WALL - 34 }];

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
    return { cell, x0, y0: gy - h - 6, w, h, sx: x0 + w + 10 };
  }

  function empNewPiece() {
    const magic = Math.random() < 0.05;
    const idx = magic ? 0 : 1 + Math.floor(Math.random() * (EMP_SHAPES.length - 1));
    return { cells: EMP_SHAPES[idx].map((c) => c.slice()), kind: magic ? 'magic' : EMP_KINDS[Math.floor(Math.random() * EMP_KINDS.length)], x: 0, y: 0 };
  }
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

  // Colonne visée par la poignée, pour une pièce donnée
  function empTargetCol(cells) {
    const lo = WALL + 30;
    const frac = clamp((player.x - lo) / Math.max(1, maxX() - lo), 0, 1);
    return Math.round(frac * (EMP_COLS - empWidth(cells)));
  }

  function empSpawn() {
    const E = g.emp;
    E.cur = E.next;
    E.next = empNewPiece();
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

  function empLock() {
    const E = g.emp, p = E.cur, G = empGeom();
    const center = (c, r) => [G.x0 + (c + 0.5) * G.cell, G.y0 + (r + 0.5) * G.cell];
    if (p.kind === 'magic') {
      // Le pop-corn magique fait éclater les blocs voisins
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const X = p.x + dx, Y = p.y + dy;
          if (X < 0 || X >= EMP_COLS || Y < 0 || Y >= E.rows || !E.grid[Y][X]) continue;
          const [px, py] = center(X, Y);
          burst(px, py, EMP_COLORS[E.grid[Y][X]][0], 5, true);
          E.grid[Y][X] = 0;
          n++;
        }
      }
      const [px, py] = center(p.x, p.y);
      ring(px, py, '#fff');
      g.score += 10 * n * g.level;
      if (n) floatText('+' + 10 * n * g.level, px, py, '#9fe8ff');
      popSound(0.16);
      shakeT = 0.18;
    } else {
      for (const [cx, cy] of p.cells) if (p.y + cy >= 0) E.grid[p.y + cy][p.x + cx] = p.kind;
      tone(160, 0.06, 'square', 0.05);
    }

    // Rangées complètes
    let lines = 0, sweets = 0;
    for (let r = E.rows - 1; r >= 0; r--) {
      if (!E.grid[r].every(Boolean)) continue;
      for (let c = 0; c < EMP_COLS; c++) {
        const k = E.grid[r][c];
        if (EMP_SWEET.includes(k)) sweets++;
        const [px, py] = center(c, r);
        burst(px, py, EMP_COLORS[k][0], 3, k !== 'pop' && k !== 'brule');
      }
      E.grid.splice(r, 1);
      E.grid.unshift(new Array(EMP_COLS).fill(0));
      lines++;
      r++;
    }
    if (lines) {
      const pts = [0, 50, 150, 350, 700][Math.min(lines, 4)] * g.level;
      g.score += pts;
      E.lines += lines;
      E.joy = 1.4;
      // Butin : modeste pour une rangée, plus généreux pour plusieurs à la fois
      g.got.pop += lines * 2;
      g.got.candy += (lines - 1) + (sweets >= 6 ? 1 : 0);
      floatText('+' + pts, G.x0 + G.w / 2, G.y0 + G.h * 0.45, '#fff4d6');
      if (lines >= 2) banner(['', '', 'Double !', 'Triple !', 'Quadruple !'][Math.min(lines, 4)], '#ffd257');
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
    const E = g.emp;
    E.joy = Math.max(0, E.joy - dt);
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
    // La pièce glisse vers la colonne visée, une case à la fois, sans traverser les blocs
    E.moveT -= dt;
    const tc = empTargetCol(p.cells);
    if (tc !== p.x && E.moveT <= 0) {
      const d = tc > p.x ? 1 : -1;
      if (empFits(p.cells, p.x + d, p.y)) { p.x += d; E.lockT = Math.min(E.lockT, 0.2); }
      E.moveT = 0.035;
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
    if (kind === 'magic') {
      const h = Math.round((machine.t * 200) % 360);
      col = ['hsl(' + h + ',95%,70%)', 'hsl(' + ((h + 40) % 360) + ',90%,52%)'];
    }
    ctx.fillStyle = OUT; rr(ctx, x + pad - 1.2, y + pad - 1.2, w + 2.4, w + 2.4, s * 0.25); ctx.fill();
    ctx.fillStyle = col[0]; rr(ctx, x + pad, y + pad, w, w, s * 0.22); ctx.fill();
    ctx.fillStyle = col[1]; rr(ctx, x + pad, y + pad + w * 0.7, w, w * 0.3, s * 0.2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.42)'; rr(ctx, x + pad + 3, y + pad + 3, w - 6, w * 0.18, w * 0.09); ctx.fill();
    const cx = x + s / 2, cy = y + s / 2;
    if (kind === 'pop' || kind === 'caramel') {
      ctx.save();
      ctx.translate(cx, cy + 1);
      ctx.scale(s / 40, s / 40);
      drawItem(ctx, kind, { t: 0, seed: 0, face: th.faces });
      ctx.restore();
    } else if (kind === 'brule') {
      ctx.strokeStyle = '#ff6a2a'; ctx.lineWidth = s * 0.09; ctx.lineCap = 'round';
      const k = s * 0.17;
      ctx.beginPath(); ctx.moveTo(cx - k, cy - k); ctx.lineTo(cx + k, cy + k); ctx.moveTo(cx + k, cy - k); ctx.lineTo(cx - k, cy + k); ctx.stroke();
    } else if (kind === 'magic') {
      ctx.fillStyle = '#fff'; star(ctx, cx, cy, s * 0.28);
    }
  }

  function drawBoard() {
    const E = g.emp, G = empGeom();
    ctx.fillStyle = 'rgba(0,0,0,.42)'; rr(ctx, G.x0 - 6, G.y0 - 6, G.w + 12, G.h + 12, 11); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.045)';
    for (let r = 0; r < E.rows; r++) for (let c = (r % 2); c < EMP_COLS; c += 2) ctx.fillRect(G.x0 + c * G.cell, G.y0 + r * G.cell, G.cell, G.cell);
    ctx.strokeStyle = th.trim; ctx.lineWidth = 2.5; rr(ctx, G.x0 - 6, G.y0 - 6, G.w + 12, G.h + 12, 11); ctx.stroke();

    let top = E.rows;
    for (let r = 0; r < E.rows; r++) {
      for (let c = 0; c < EMP_COLS; c++) {
        if (!E.grid[r][c]) continue;
        top = Math.min(top, r);
        drawEmpCell(G.x0 + c * G.cell, G.y0 + r * G.cell, G.cell, E.grid[r][c]);
      }
    }
    if (E.cur) {
      // Fantôme : là où la pièce va se poser
      const ly = empLanding();
      if (ly !== E.cur.y) {
        ctx.strokeStyle = 'rgba(255,255,255,.4)';
        ctx.lineWidth = 2;
        for (const [cx, cy] of E.cur.cells) { rr(ctx, G.x0 + (E.cur.x + cx) * G.cell + 3, G.y0 + (ly + cy) * G.cell + 3, G.cell - 6, G.cell - 6, G.cell * 0.2); ctx.stroke(); }
      }
      for (const [cx, cy] of E.cur.cells) drawEmpCell(G.x0 + (E.cur.x + cx) * G.cell, G.y0 + (E.cur.y + cy) * G.cell, G.cell, E.cur.kind);
    }

    // Panneau latéral : pièce suivante et avatar qui réagit
    ctx.fillStyle = 'rgba(0,0,0,.34)'; rr(ctx, G.sx - 3, G.y0 - 6, EMP_SIDE - 4, 132, 9); ctx.fill();
    ctx.fillStyle = '#fff4d6';
    ctx.font = '800 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const mid = G.sx + (EMP_SIDE - 10) / 2;
    ctx.fillText('SUIVANT', mid, G.y0 + 6);
    const n = E.next, mini = 11;
    const nw = empWidth(n.cells), nh = 1 + Math.max(...n.cells.map((c) => c[1]));
    for (const [cx, cy] of n.cells) drawEmpCell(mid - nw * mini / 2 + cx * mini, G.y0 + 30 - nh * mini / 2 + cy * mini, mini, n.kind);
    drawAvatar(ctx, save.avatar, mid, G.y0 + 92, 19, E.joy > 0 ? 'happy' : top < 4 ? 'sad' : '');
  }

  function drawEmpButtons() {
    const y = ctrlY();
    for (const b of empButtons()) {
      ctx.fillStyle = OUT; circ(ctx, b.x, y, 27);
      ctx.fillStyle = th.trim; circ(ctx, b.x, y, 25);
      ctx.fillStyle = b.id === 'rot' ? '#7a4fd6' : '#17907c'; circ(ctx, b.x, y, 21);
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
        if (Math.hypot(x - b.x, y - ctrlY()) < 31) {
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
      else if (g.event) {
        if (g.event.warn > 0) g.event.warn -= dt; else g.event.t -= dt;
        if (g.event.type === 'chauffe') machine.shake = 0.1;
        if (g.event.t <= 0) g.event = null;
      } else {
        g.nextEvent -= dt;
        if (g.nextEvent <= 0 && (mode !== 'chrono' || g.left > 7)) startEvent();
      }

      g.spawn -= dt;
      if (mode !== 'tuto' && mode !== 'brique' && mode !== 'invasion' && mode !== 'empile' && g.spawn <= 0) {
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
    if (bricksOn) drawBricks(); else if (invOn) drawInvaders(); else if (empOn) drawBoard(); else drawMachine();
    if (inGame()) {
      if (!empOn) drawPlayer();
      drawControl();
      if (empOn) drawEmpButtons();
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
        bigText(mode === 'brique' ? 'Renvoie le grain avec ton seau' : mode === 'invasion' ? 'Vise avec la poignée, esquive les braises' : mode === 'empile' ? 'Poignée : déplacer · boutons : tourner, lâcher' : 'Glisse la poignée sous ton personnage', W / 2, H * 0.48 + 110, Math.min(18, W / 22), '#fff4d6', 1);
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
    const power = Math.max(g.giant, g.magnet, g.rapid || 0);
    setClass('powerWrap', 'hidden', power <= 0);
    setBar('powerBar', Math.round(power / 8 * 100));
    let pw = '';
    if (g.giant > 0) pw = 'Seau géant ' + Math.ceil(g.giant);
    else if (g.magnet > 0) pw = 'Aimant ' + Math.ceil(g.magnet);
    else if (g.rapid > 0) pw = 'Tir rapide ' + Math.ceil(g.rapid);
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
    $('#best').textContent = 'Records — Chrono : ' + save.best.chrono + ' · Survie : ' + save.best.survie + ' · Briques : ' + (save.best.brique || 0) + ' · Invasion : ' + (save.best.invasion || 0) + ' · Empilage : ' + (save.best.empile || 0);
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
  const RANK_MODES = [['chrono', 'Chrono'], ['survie', 'Survie'], ['brique', 'Briques'], ['invasion', 'Invasion'], ['empile', 'Empilage']];
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
  const pointerEnd = (e) => { if (e.pointerId === dragId) dragId = null; empPointerUp(e); };
  canvas.addEventListener('pointerdown', pointer);
  canvas.addEventListener('pointermove', pointer);
  canvas.addEventListener('pointerup', pointerEnd);
  canvas.addEventListener('pointercancel', pointerEnd);
  window.addEventListener('keydown', (e) => {
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
