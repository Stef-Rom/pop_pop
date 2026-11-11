(() => {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const canvas = $('#game');
  const ctx = canvas.getContext('2d');

  // ---------- Constantes ----------
  const W = 400;            // largeur logique ; la hauteur H suit l'écran
  const WALL = 18;          // largeur des rideaux
  const MY = 58;            // haut de la machine
  const TAU = Math.PI * 2;
  let H = 700;
  let scale = 1;

  const AVATARS = [
    { id: 'leo', name: 'Léo', shirt: '#3a7bd5', skin: '#f2c49b' },
    { id: 'mia', name: 'Mia', shirt: '#9b59d0', skin: '#f2c49b' },
    { id: 'chat', name: 'Moustache', shirt: '#f39c3d', skin: '#f39c3d' },
    { id: 'robot', name: 'Bip', shirt: '#8d99a3', skin: '#b8c4cc', pop: 100, candy: 0 },
    { id: 'renard', name: 'Roux', shirt: '#e8632b', skin: '#e8632b', pop: 250, candy: 20 },
    { id: 'fantome', name: 'Bouh', shirt: null, skin: '#ffffff', pop: 500, candy: 50 },
  ];
  const FREE = ['leo', 'mia', 'chat'];

  const TYPES = {
    pop: { pts: 1, cur: 'pop' },
    caramel: { pts: 3, cur: 'pop' },
    bonbon: { pts: 5, cur: 'candy' },
    sucette: { pts: 10, cur: 'candy' },
    arc: { pts: 2, cur: 'pop' },
    brule: { pts: 0 },
  };

  // ---------- Sauvegarde ----------
  const SAVE_KEY = 'poppop-save-v1';
  const save = { pop: 0, candy: 0, unlocked: FREE.slice(), avatar: 'leo', best: { chrono: 0, survie: 0 }, mute: false };
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (s && typeof s === 'object') {
      Object.assign(save, s);
      save.best = Object.assign({ chrono: 0, survie: 0 }, s.best);
      if (!Array.isArray(save.unlocked)) save.unlocked = FREE.slice();
      if (!save.unlocked.includes(save.avatar)) save.avatar = 'leo';
    }
  } catch (e) { /* stockage indisponible : on joue sans sauvegarde */ }
  const persist = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) {} };

  // ---------- Son et vibrations ----------
  let ac = null;
  function beep(freq, dur = 0.08, type = 'sine', vol = 0.12, slide = 0) {
    if (save.mute) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === 'suspended') ac.resume();
      const o = ac.createOscillator();
      const g = ac.createGain();
      const t = ac.currentTime;
      o.type = type;
      o.frequency.setValueAtTime(freq, t);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g).connect(ac.destination);
      o.start(t);
      o.stop(t + dur);
    } catch (e) {}
  }
  const buzz = (ms) => { if (!save.mute && navigator.vibrate) { try { navigator.vibrate(ms); } catch (e) {} } };

  // ---------- État ----------
  let state = 'menu';       // menu | play | pause | over
  let mode = 'chrono';      // chrono | survie
  let g = null;
  let items = [];
  let parts = [];
  let texts = [];
  let decorT = 0;
  const machine = { x: W / 2, t: 0, shake: 0 };
  const player = { x: W / 2, tx: W / 2 };
  const keys = { left: false, right: false };

  const groundY = () => H - 22;
  const rimY = () => groundY() - 112;
  const bucketW = () => (g && g.giant > 0 ? 58 : 34);
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const avatar = () => AVATARS.find((a) => a.id === save.avatar) || AVATARS[0];

  function resize() {
    const r = $('#app').getBoundingClientRect();
    if (!r.width || !r.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    scale = r.width / W;
    H = r.height / scale;
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
  }

  // ---------- Partie ----------
  function newGame(m) {
    mode = m;
    g = { time: 0, left: 60, lives: 3, score: 0, combo: 0, maxCombo: 0, spawn: 0.9, got: { pop: 0, candy: 0 }, giant: 0, magnet: 0, hurt: 0, banked: false };
    items = []; parts = []; texts = [];
    player.x = player.tx = W / 2;
    state = 'play';
    show('hud');
    beep(440, 0.1, 'triangle'); setTimeout(() => beep(660, 0.14, 'triangle'), 110);
  }

  function bank() {
    if (!g || g.banked) return false;
    g.banked = true;
    save.pop += g.got.pop;
    save.candy += g.got.candy;
    const record = g.score > (save.best[mode] || 0);
    if (record) save.best[mode] = g.score;
    persist();
    return record;
  }

  function endGame() {
    const record = bank();
    state = 'over';
    items = [];
    $('#overTitle').textContent = mode === 'chrono' ? 'Temps écoulé !' : 'Partie terminée';
    $('#overScore').textContent = g.score;
    $('#overRecord').textContent = record && g.score > 0 ? '★ Nouveau record ! ★' : 'Record : ' + save.best[mode];
    $('#overLoot').textContent = '+' + g.got.pop + ' 🍿   +' + g.got.candy + ' 🍬   combo max ' + g.maxCombo;
    show('over');
    if (record && g.score > 0) [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.16, 'triangle'), i * 120));
    else beep(330, 0.3, 'triangle', 0.12, -120);
  }

  function difficulty() {
    return mode === 'chrono' ? g.time / 60 : g.time / 90;
  }

  function pickType(d) {
    const r = Math.random();
    const burnt = 0.08 + 0.13 * Math.min(d, 1.6);
    if (r < burnt) return 'brule';
    const q = (r - burnt) / (1 - burnt);
    if (q < 0.03) return 'arc';
    if (q < 0.07) return 'sucette';
    if (q < 0.19) return 'bonbon';
    if (q < 0.36) return 'caramel';
    return 'pop';
  }

  function spawn(type, quiet) {
    const dir = Math.random() < 0.5 ? -1 : 1;
    items.push({
      type,
      x: machine.x + dir * 8,
      y: MY + 115,
      vx: dir * (15 + Math.random() * 150),
      vy: -80 + Math.random() * 120,
      rot: Math.random() * TAU,
      vr: (Math.random() - 0.5) * 8,
      seed: Math.random() * 360,
    });
    machine.shake = 0.12;
    if (!quiet) beep(170 + Math.random() * 90, 0.04, 'square', 0.025);
  }

  function floatText(txt, x, y, col) {
    texts.push({ txt, x, y, life: 0.9, col });
  }

  function burst(x, y, col, n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU;
      const v = 40 + Math.random() * 120;
      parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, life: 0.5 + Math.random() * 0.3, col, r: 2 + Math.random() * 2.5 });
    }
  }

  function caught(it) {
    const x = it.x;
    const y = rimY();
    if (it.type === 'brule') {
      g.combo = 0;
      g.hurt = 0.45;
      burst(x, y, '#6b5a55', 10);
      beep(130, 0.28, 'sawtooth', 0.14, -70);
      buzz(140);
      if (mode === 'survie') {
        g.lives--;
        floatText('−1 ❤', x, y - 10, '#ff8a8a');
        if (g.lives <= 0) endGame();
      } else {
        g.score = Math.max(0, g.score - 5);
        floatText('−5', x, y - 10, '#ff8a8a');
      }
      return;
    }
    const T = TYPES[it.type];
    g.combo++;
    g.maxCombo = Math.max(g.maxCombo, g.combo);
    const mult = Math.min(5, 1 + Math.floor(g.combo / 8));
    const pts = T.pts * mult;
    g.score += pts;
    g.got[T.cur]++;
    const col = T.cur === 'candy' ? '#ff9ed0' : '#fff4d6';
    floatText('+' + pts, x, y - 10, col);
    burst(x, y, col, T.cur === 'candy' ? 8 : 4);
    if (it.type === 'arc') {
      if (Math.random() < 0.5) { g.giant = 8; floatText('Seau géant !', W / 2, H * 0.45, '#9fe8ff'); }
      else { g.magnet = 8; floatText('Aimant !', W / 2, H * 0.45, '#9fe8ff'); }
      beep(600, 0.25, 'triangle', 0.14, 600);
      buzz(40);
    } else {
      beep((T.cur === 'candy' ? 700 : 520) + Math.min(g.combo, 24) * 22, 0.07, 'triangle', 0.11);
      buzz(10);
    }
  }

  // ---------- Mise à jour ----------
  function update(dt) {
    machine.t += dt;
    machine.x = W / 2 + Math.sin(machine.t * 0.7) * W * 0.24;
    machine.shake = Math.max(0, machine.shake - dt);

    let d = 0;
    if (state === 'play') {
      g.time += dt;
      d = difficulty();
      if (mode === 'chrono') {
        g.left -= dt;
        if (g.left <= 0) { g.left = 0; endGame(); return; }
      }
      g.giant = Math.max(0, g.giant - dt);
      g.magnet = Math.max(0, g.magnet - dt);
      g.hurt = Math.max(0, g.hurt - dt);
      g.spawn -= dt;
      if (g.spawn <= 0) {
        const dd = Math.min(d, 1);
        spawn(pickType(d));
        if (Math.random() < 0.12 + 0.22 * dd) spawn(pickType(d));
        g.spawn = lerp(0.85, 0.32, dd) * (0.8 + Math.random() * 0.4);
      }
      const dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
      if (dir) player.tx += dir * 460 * dt;
      player.tx = clamp(player.tx, WALL + 22, W - WALL - 22);
      player.x += (player.tx - player.x) * Math.min(1, dt * 20);
    } else {
      // Décor : la machine continue de faire sauter du pop-corn derrière les menus
      decorT -= dt;
      if (decorT <= 0) { spawn(Math.random() < 0.15 ? 'bonbon' : 'pop', true); decorT = 0.45; }
    }

    const grav = H * 0.55 * (1 + 0.25 * Math.min(d, 1.6));
    const gy = groundY();
    const ry = rimY();
    const bw = bucketW();
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];
      it.vy += grav * dt;
      if (state === 'play' && g.magnet > 0 && it.type !== 'brule' && it.y > ry - 240 && it.y < ry) {
        it.x += (player.x - it.x) * Math.min(1, dt * 5);
      }
      it.x += it.vx * dt;
      it.y += it.vy * dt;
      it.rot += it.vr * dt;
      if (it.x < WALL + 12) { it.x = WALL + 12; it.vx = Math.abs(it.vx) * 0.7; }
      if (it.x > W - WALL - 12) { it.x = W - WALL - 12; it.vx = -Math.abs(it.vx) * 0.7; }

      if (state === 'play' && it.vy > 0 && it.y > ry - 6 && it.y < ry + 22 && Math.abs(it.x - player.x) < bw) {
        items.splice(i, 1);
        caught(it);
        if (state !== 'play') return;
        continue;
      }
      if (it.y > gy - 6) {
        items.splice(i, 1);
        if (state === 'play' && it.type !== 'brule') {
          if (g.combo >= 8) floatText('Combo perdu', it.x, gy - 30, '#ffb37a');
          g.combo = 0;
        }
        burst(it.x, gy - 4, it.type === 'brule' ? '#4a3a35' : '#fff1c9', 3);
      }
    }

    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life -= dt;
      if (p.life <= 0) { parts.splice(i, 1); continue; }
      p.vy += 500 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    for (let i = texts.length - 1; i >= 0; i--) {
      const t = texts[i];
      t.life -= dt;
      t.y -= 45 * dt;
      if (t.life <= 0) texts.splice(i, 1);
    }
  }

  // ---------- Dessin : outils ----------
  const circ = (c, x, y, r) => { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); };
  function rr(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }

  // ---------- Dessin : décor ----------
  function drawBg() {
    const gy = groundY();
    let gr = ctx.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, '#2e0810');
    gr.addColorStop(1, '#6a1220');
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, W, H);

    gr = ctx.createRadialGradient(W / 2, H * 0.42, 10, W / 2, H * 0.42, H * 0.6);
    gr.addColorStop(0, 'rgba(255,214,140,.20)');
    gr.addColorStop(1, 'rgba(255,214,140,0)');
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, W, H);

    // Rideaux de velours
    for (let s = 0; s < 2; s++) {
      for (let i = 0; i < 3; i++) {
        const x = s === 0 ? i * 6 : W - (i + 1) * 6;
        ctx.fillStyle = i % 2 === s ? '#a81c2f' : '#7d1322';
        ctx.fillRect(x, 0, 6, gy);
      }
    }
    ctx.fillStyle = '#e9b94a';
    ctx.fillRect(WALL - 2, 0, 2, gy);
    ctx.fillRect(W - WALL, 0, 2, gy);

    // Sol
    ctx.fillStyle = '#22060a';
    ctx.fillRect(0, gy, W, H - gy);
    ctx.fillStyle = '#e9b94a';
    ctx.fillRect(0, gy, W, 2);
  }

  function drawMachine() {
    const x = machine.x + (machine.shake > 0 ? (Math.random() - 0.5) * 3 : 0);
    ctx.save();
    ctx.translate(x, MY);

    // Suspension
    ctx.strokeStyle = '#a8802a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-44, -MY); ctx.lineTo(-44, 4);
    ctx.moveTo(44, -MY); ctx.lineTo(44, 4);
    ctx.stroke();

    // Socle et goulotte
    ctx.fillStyle = '#c81e32';
    rr(ctx, -60, 90, 120, 32, 8); ctx.fill();
    ctx.fillStyle = '#e9b94a';
    ctx.fillRect(-60, 98, 120, 3);
    ctx.fillStyle = '#22060a';
    rr(ctx, -18, 107, 36, 15, 5); ctx.fill();

    // Vitrine
    ctx.fillStyle = 'rgba(255,244,214,.22)';
    ctx.fillRect(-54, 22, 108, 70);
    ctx.fillStyle = '#fff1c9';
    for (let i = 0; i < 15; i++) {
      const hx = -49 + i * 7;
      const hy = 84 - Math.abs(Math.sin(i * 1.7)) * 8 - (1 - Math.abs(i - 7) / 7.5) * 14;
      circ(ctx, hx, hy, 7);
    }
    ctx.fillRect(-54, 82, 108, 10);

    // Marmite et grains qui sautent
    ctx.fillStyle = '#8d99a3';
    ctx.fillRect(-1.5, 22, 3, 12);
    ctx.beginPath(); ctx.arc(0, 34, 16, 0, Math.PI); ctx.fill();
    ctx.fillStyle = '#fff6dc';
    for (let i = 0; i < 4; i++) {
      circ(ctx, -18 + i * 12, 34 - Math.abs(Math.sin(machine.t * 6 + i * 1.9)) * 9, 3.5);
    }

    ctx.strokeStyle = '#e9b94a';
    ctx.lineWidth = 3;
    ctx.strokeRect(-54, 22, 108, 70);
    ctx.fillStyle = 'rgba(255,255,255,.18)';
    ctx.beginPath(); ctx.moveTo(-48, 27); ctx.lineTo(-32, 27); ctx.lineTo(-48, 58); ctx.fill();

    // Toit, enseigne, ampoules
    ctx.fillStyle = '#c81e32';
    rr(ctx, -62, 0, 124, 24, 9); ctx.fill();
    ctx.fillStyle = '#fff4d6';
    ctx.font = '900 14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('POP POP', 0, 12);
    for (let i = 0; i < 9; i++) {
      const on = (Math.floor(machine.t * 4) + i) % 2 === 0;
      ctx.fillStyle = on ? '#ffe08a' : '#a8802a';
      circ(ctx, -56 + i * 14, 24, 2.6);
    }
    ctx.restore();
  }

  // ---------- Dessin : objets ----------
  function kernel(c1, c2) {
    ctx.fillStyle = c2;
    circ(ctx, 0, 3, 8);
    ctx.fillStyle = c1;
    circ(ctx, -6, -1, 7); circ(ctx, 6, -2, 7); circ(ctx, 0, -7, 7); circ(ctx, 1, 3, 6);
  }

  function drawItem(it) {
    ctx.save();
    ctx.translate(it.x, it.y);
    ctx.rotate(it.rot);
    switch (it.type) {
      case 'pop':
        kernel('#fff6dc', '#f0d27c');
        break;
      case 'caramel':
        kernel('#eaa53c', '#b4660f');
        ctx.fillStyle = 'rgba(255,255,255,.55)';
        circ(ctx, -3, -8, 2);
        break;
      case 'arc': {
        const h = (machine.t * 220 + it.seed) % 360;
        ctx.shadowColor = 'hsl(' + h + ',100%,70%)';
        ctx.shadowBlur = 14;
        kernel('hsl(' + h + ',95%,72%)', 'hsl(' + ((h + 60) % 360) + ',95%,60%)');
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        circ(ctx, -3, -7, 2);
        break;
      }
      case 'brule':
        kernel('#3a2a25', '#17100e');
        ctx.strokeStyle = '#ff7a2e';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(0, -1, 13.5, 0, TAU); ctx.stroke();
        ctx.fillStyle = '#ff9d4d';
        circ(ctx, -5, 0, 1.6); circ(ctx, 4, -5, 1.4); circ(ctx, 3, 4, 1.3);
        break;
      case 'bonbon':
        ctx.fillStyle = '#ff9ed0';
        ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(-19, -8); ctx.lineTo(-19, 8); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(9, 0); ctx.lineTo(19, -8); ctx.lineTo(19, 8); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#ff4f9a';
        ctx.beginPath(); ctx.ellipse(0, 0, 11, 8, 0, 0, TAU); ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(-4, -7); ctx.lineTo(-1, 7); ctx.moveTo(3, -7); ctx.lineTo(6, 7); ctx.stroke();
        break;
      case 'sucette':
        ctx.strokeStyle = '#fff4d6';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(0, 8); ctx.lineTo(0, 24); ctx.stroke();
        ctx.fillStyle = '#fff';
        circ(ctx, 0, 0, 12);
        ctx.strokeStyle = '#e8203f';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let a = 0; a < 15; a += 0.3) {
          const r = a * 0.75;
          const px = Math.cos(a) * r, py = Math.sin(a) * r;
          if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.strokeStyle = '#b3122c';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(0, 0, 12, 0, TAU); ctx.stroke();
        break;
    }
    ctx.restore();
  }

  // ---------- Dessin : avatars (tête centrée en x,y, rayon r) ----------
  function drawAvatar(c, id, x, y, r, sad) {
    c.save();
    c.translate(x, y);
    c.scale(r / 24, r / 24);
    c.lineCap = 'round';
    const dark = '#2b1a12';
    const eyes = (ey, col) => { c.fillStyle = col || dark; circ(c, -8, ey, 2.8); circ(c, 8, ey, 2.8); };
    const mouth = (my, col) => {
      c.strokeStyle = col || dark;
      c.lineWidth = 2;
      c.beginPath();
      if (sad) c.arc(0, my + 9, 7, Math.PI * 1.2, Math.PI * 1.8);
      else c.arc(0, my, 8, Math.PI * 0.2, Math.PI * 0.8);
      c.stroke();
    };
    const cheeks = () => { c.fillStyle = 'rgba(255,120,120,.35)'; circ(c, -14, 7, 4); circ(c, 14, 7, 4); };
    const topCap = (col) => { c.fillStyle = col; c.beginPath(); c.arc(0, 0, 24.3, Math.PI * 1.13, Math.PI * 1.87); c.closePath(); c.fill(); };
    const ear = (sx, col, inner) => {
      c.fillStyle = col;
      c.beginPath(); c.moveTo(sx * 21, -10); c.lineTo(sx * 23, -33); c.lineTo(sx * 5, -22); c.closePath(); c.fill();
      c.fillStyle = inner;
      c.beginPath(); c.moveTo(sx * 18, -14); c.lineTo(sx * 20, -27); c.lineTo(sx * 10, -21); c.closePath(); c.fill();
    };

    switch (id) {
      case 'leo':
        c.fillStyle = '#f2c49b'; circ(c, 0, 0, 24);
        topCap('#d62839');
        c.fillStyle = '#a81c2f'; rr(c, -2, -13, 30, 6, 3); c.fill();
        eyes(-1); cheeks(); mouth(4);
        break;
      case 'mia':
        c.fillStyle = '#6b3a1e'; circ(c, -27, -4, 9); circ(c, 27, -4, 9);
        c.fillStyle = '#f2c49b'; circ(c, 0, 0, 24);
        topCap('#6b3a1e');
        c.fillStyle = '#ff5fa2'; circ(c, -20, -12, 4.5); circ(c, 20, -12, 4.5);
        eyes(-1); cheeks(); mouth(4);
        break;
      case 'chat':
        ear(-1, '#f39c3d', '#ffc2d1'); ear(1, '#f39c3d', '#ffc2d1');
        c.fillStyle = '#f39c3d'; circ(c, 0, 0, 24);
        c.strokeStyle = '#c9741c'; c.lineWidth = 2.5;
        c.beginPath(); c.moveTo(-6, -22); c.lineTo(-5, -14); c.moveTo(0, -23); c.lineTo(0, -14); c.moveTo(6, -22); c.lineTo(5, -14); c.stroke();
        c.fillStyle = '#fff4e2'; c.beginPath(); c.ellipse(0, 9, 11, 8, 0, 0, TAU); c.fill();
        c.fillStyle = '#ff7a9c'; c.beginPath(); c.moveTo(-3, 4); c.lineTo(3, 4); c.lineTo(0, 8); c.closePath(); c.fill();
        c.strokeStyle = dark; c.lineWidth = 1;
        c.beginPath(); c.moveTo(-12, 8); c.lineTo(-25, 5); c.moveTo(-12, 11); c.lineTo(-25, 13); c.moveTo(12, 8); c.lineTo(25, 5); c.moveTo(12, 11); c.lineTo(25, 13); c.stroke();
        eyes(-3, '#1f5f3a'); mouth(5);
        break;
      case 'robot':
        c.strokeStyle = '#6d7a85'; c.lineWidth = 3;
        c.beginPath(); c.moveTo(0, -22); c.lineTo(0, -32); c.stroke();
        c.fillStyle = '#ff4f4f'; circ(c, 0, -34, 4);
        c.fillStyle = '#6d7a85'; rr(c, -27, -6, 6, 12, 2); c.fill(); rr(c, 21, -6, 6, 12, 2); c.fill();
        c.fillStyle = '#b8c4cc'; rr(c, -23, -23, 46, 46, 8); c.fill();
        c.fillStyle = '#12313d'; rr(c, -17, -12, 34, 16, 5); c.fill();
        c.fillStyle = sad ? '#ff6b6b' : '#5fe8ff'; circ(c, -8, -4, 4); circ(c, 8, -4, 4);
        c.fillStyle = '#12313d'; rr(c, -10, 10, 20, 6, 2); c.fill();
        c.fillStyle = '#b8c4cc'; c.fillRect(-4, 10, 1.5, 6); c.fillRect(2.5, 10, 1.5, 6);
        break;
      case 'renard':
        ear(-1, '#e8632b', '#3a2019'); ear(1, '#e8632b', '#3a2019');
        c.fillStyle = '#e8632b'; circ(c, 0, 0, 24);
        c.save();
        c.beginPath(); c.arc(0, 0, 24, 0, TAU); c.clip();
        c.fillStyle = '#fff6ea';
        c.beginPath(); c.ellipse(-13, 16, 14, 13, 0, 0, TAU); c.fill();
        c.beginPath(); c.ellipse(13, 16, 14, 13, 0, 0, TAU); c.fill();
        c.restore();
        c.fillStyle = dark; circ(c, 0, 8, 3.2);
        eyes(-3); mouth(7);
        break;
      case 'fantome':
        c.fillStyle = '#ffffff';
        c.beginPath();
        c.arc(0, 0, 24, Math.PI, 0);
        c.lineTo(24, 26);
        c.quadraticCurveTo(18, 18, 12, 26);
        c.quadraticCurveTo(6, 18, 0, 26);
        c.quadraticCurveTo(-6, 18, -12, 26);
        c.quadraticCurveTo(-18, 18, -24, 26);
        c.closePath(); c.fill();
        c.fillStyle = dark;
        c.beginPath(); c.ellipse(-8, -2, 3.5, 5, 0, 0, TAU); c.fill();
        c.beginPath(); c.ellipse(8, -2, 3.5, 5, 0, 0, TAU); c.fill();
        cheeks();
        if (sad) mouth(4); else { c.fillStyle = dark; c.beginPath(); c.ellipse(0, 10, 3.5, 4.5, 0, 0, TAU); c.fill(); }
        break;
    }
    c.restore();
  }

  function drawPlayer() {
    const a = avatar();
    const x = player.x;
    const gy = groundY();
    const ry = rimY();
    const bw = bucketW();
    const bb = bw * 0.72;
    const headY = gy - 52;

    ctx.fillStyle = 'rgba(0,0,0,.3)';
    ctx.beginPath(); ctx.ellipse(x, gy + 2, 26, 5, 0, 0, TAU); ctx.fill();

    if (a.shirt) {
      ctx.fillStyle = '#3a2019';
      rr(ctx, x - 14, gy - 6, 12, 7, 3); ctx.fill();
      rr(ctx, x + 2, gy - 6, 12, 7, 3); ctx.fill();
      ctx.fillStyle = a.shirt;
      rr(ctx, x - 15, gy - 34, 30, 30, 8); ctx.fill();
    }

    // Bras levés qui tiennent le seau
    ctx.strokeStyle = a.skin;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - 14, gy - 26); ctx.lineTo(x - bb - 3, ry + 26);
    ctx.moveTo(x + 14, gy - 26); ctx.lineTo(x + bb + 3, ry + 26);
    ctx.stroke();

    drawAvatar(ctx, a.id, x, headY, 24, g && g.hurt > 0);

    // Seau rayé
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x - bw, ry); ctx.lineTo(x + bw, ry); ctx.lineTo(x + bb, ry + 38); ctx.lineTo(x - bb, ry + 38);
    ctx.closePath();
    ctx.fillStyle = '#fff8e6';
    ctx.fill();
    ctx.clip();
    ctx.fillStyle = '#d62839';
    const n = bw > 40 ? 9 : 5;
    for (let i = 0; i < n; i += 2) {
      const t0 = i / n, t1 = (i + 1) / n;
      ctx.beginPath();
      ctx.moveTo(x - bw + t0 * 2 * bw, ry); ctx.lineTo(x - bw + t1 * 2 * bw, ry);
      ctx.lineTo(x - bb + t1 * 2 * bb, ry + 38); ctx.lineTo(x - bb + t0 * 2 * bb, ry + 38);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();

    // Pop-corn qui dépasse selon le combo
    if (g && g.combo > 0) {
      const k = Math.min(7, 1 + Math.floor(g.combo / 3));
      ctx.fillStyle = '#fff6dc';
      for (let i = 0; i < k; i++) circ(ctx, x + (i - (k - 1) / 2) * (bw * 1.5 / 7), ry - 2 - (i % 2) * 3, 6);
    }
    ctx.fillStyle = '#e9b94a';
    rr(ctx, x - bw - 2, ry - 3, bw * 2 + 4, 6, 3); ctx.fill();

    if (g && g.magnet > 0) {
      ctx.strokeStyle = 'rgba(159,232,255,' + (0.35 + 0.25 * Math.sin(machine.t * 12)) + ')';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(x, ry, 60 + Math.sin(machine.t * 8) * 6, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
    }
  }

  function draw() {
    drawBg();
    for (const it of items) drawItem(it);
    drawMachine();
    if (state === 'play' || state === 'pause') drawPlayer();

    for (const p of parts) {
      ctx.globalAlpha = clamp(p.life * 2, 0, 1);
      ctx.fillStyle = p.col;
      circ(ctx, p.x, p.y, p.r);
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 20px system-ui, sans-serif';
    for (const t of texts) {
      ctx.globalAlpha = clamp(t.life * 2, 0, 1);
      ctx.fillStyle = 'rgba(0,0,0,.5)';
      ctx.fillText(t.txt, t.x + 1, t.y + 2);
      ctx.fillStyle = t.col;
      ctx.fillText(t.txt, t.x, t.y);
    }
    ctx.globalAlpha = 1;

    if (state === 'play' && g.time < 3.5) {
      ctx.globalAlpha = clamp(3.5 - g.time, 0, 1);
      ctx.font = '800 17px system-ui, sans-serif';
      ctx.fillStyle = '#fff4d6';
      ctx.fillText('Glisse ton doigt pour déplacer le seau', W / 2, H * 0.55);
      ctx.globalAlpha = 1;
    }
    if (g && g.hurt > 0 && state === 'play') {
      ctx.fillStyle = 'rgba(255,40,40,' + g.hurt * 0.5 + ')';
      ctx.fillRect(0, 0, W, H);
    }
  }

  // ---------- Interface ----------
  const hudCache = {};
  function setText(id, v) {
    if (hudCache[id] !== v) { hudCache[id] = v; $('#' + id).textContent = v; }
  }
  function updateHud() {
    if (!g) return;
    setText('score', String(g.score));
    const mult = Math.min(5, 1 + Math.floor(g.combo / 8));
    setText('combo', mult > 1 ? 'x' + mult : '');
    setText('status', mode === 'chrono' ? '⏱ ' + Math.ceil(g.left) : '❤'.repeat(Math.max(0, g.lives)));
    setText('power', g.giant > 0 ? 'Seau géant ' + Math.ceil(g.giant) : g.magnet > 0 ? 'Aimant ' + Math.ceil(g.magnet) : '');
  }

  function show(which) {
    $('#menu').classList.toggle('hidden', which !== 'menu');
    $('#over').classList.toggle('hidden', which !== 'over');
    $('#pause').classList.toggle('hidden', which !== 'pause');
    $('#hud').classList.toggle('hidden', which !== 'hud' && which !== 'pause');
  }

  let toastTimer = 0;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.add('hidden'), 2400);
  }

  function buildMenu() {
    $('#wallet').textContent = save.pop + ' 🍿    ' + save.candy + ' 🍬';
    $('#best').textContent = 'Records — Chrono : ' + save.best.chrono + ' · Survie : ' + save.best.survie;
    $('#btnSound').textContent = save.mute ? '🔇 Son coupé' : '🔊 Son activé';
    const grid = $('#avGrid');
    grid.textContent = '';
    for (const a of AVATARS) {
      const locked = !save.unlocked.includes(a.id);
      const b = document.createElement('button');
      b.className = 'av' + (a.id === save.avatar ? ' sel' : '') + (locked ? ' locked' : '');
      const cv = document.createElement('canvas');
      cv.width = cv.height = 120;
      drawAvatar(cv.getContext('2d'), a.id, 60, 68, 34, false);
      const name = document.createElement('span');
      name.textContent = a.name;
      b.append(cv, name);
      if (locked) {
        const cost = document.createElement('span');
        cost.className = 'cost';
        cost.textContent = '🔒 ' + a.pop + ' 🍿' + (a.candy ? ' + ' + a.candy + ' 🍬' : '');
        b.append(cost);
      }
      b.addEventListener('click', () => pickAvatar(a));
      grid.append(b);
    }
  }

  function pickAvatar(a) {
    if (!save.unlocked.includes(a.id)) {
      const needPop = Math.max(0, a.pop - save.pop);
      const needCandy = Math.max(0, (a.candy || 0) - save.candy);
      if (needPop || needCandy) {
        const miss = [];
        if (needPop) miss.push(needPop + ' 🍿');
        if (needCandy) miss.push(needCandy + ' 🍬');
        toast('Il te manque ' + miss.join(' et ') + ' pour débloquer ' + a.name);
        beep(200, 0.12, 'square', 0.06);
        return;
      }
      save.pop -= a.pop;
      save.candy -= a.candy || 0;
      save.unlocked.push(a.id);
      toast(a.name + ' est débloqué !');
      [523, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.14, 'triangle'), i * 100));
    } else {
      beep(600, 0.05, 'triangle', 0.08);
    }
    save.avatar = a.id;
    persist();
    buildMenu();
  }

  function goMenu() {
    bank();
    state = 'menu';
    items = [];
    buildMenu();
    show('menu');
  }

  function pause() {
    if (state !== 'play') return;
    state = 'pause';
    show('pause');
  }

  $('#btnChrono').addEventListener('click', () => newGame('chrono'));
  $('#btnSurvie').addEventListener('click', () => newGame('survie'));
  $('#btnAgain').addEventListener('click', () => newGame(mode));
  $('#btnMenu').addEventListener('click', goMenu);
  $('#btnPause').addEventListener('click', pause);
  $('#btnResume').addEventListener('click', () => { state = 'play'; show('hud'); });
  $('#btnQuit').addEventListener('click', goMenu);
  $('#btnSound').addEventListener('click', () => { save.mute = !save.mute; persist(); buildMenu(); beep(600, 0.06); });

  // ---------- Commandes ----------
  function pointer(e) {
    if (state !== 'play') return;
    const r = canvas.getBoundingClientRect();
    player.tx = (e.clientX - r.left) / scale;
  }
  canvas.addEventListener('pointerdown', pointer);
  canvas.addEventListener('pointermove', pointer);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') keys.left = true;
    else if (e.key === 'ArrowRight') keys.right = true;
    else if (e.key === 'Escape' || e.key === 'p') pause();
  });
  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') keys.left = false;
    else if (e.key === 'ArrowRight') keys.right = false;
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', resize);

  // ---------- Boucle ----------
  let last = 0;
  function frame(t) {
    const dt = Math.min(0.033, (t - last) / 1000 || 0);
    last = t;
    if (state !== 'pause') update(dt);
    draw();
    if (state === 'play') updateHud();
    requestAnimationFrame(frame);
  }

  resize();
  buildMenu();
  show('menu');
  requestAnimationFrame(frame);

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
