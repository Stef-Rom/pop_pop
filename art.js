// Dessins du jeu : objets, avatars et seaux. Tout est vectoriel, sans image.
(() => {
  'use strict';

  const TAU = Math.PI * 2;
  const OUT = 'rgba(52,18,26,.62)';   // contour "autocollant"

  const circ = (c, x, y, r) => { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); };
  const oval = (c, x, y, rx, ry, rot) => { c.beginPath(); c.ellipse(x, y, rx, ry, rot || 0, 0, TAU); c.fill(); };

  function rr(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }

  // Étincelle à quatre branches
  function star(c, x, y, s) {
    c.beginPath();
    c.moveTo(x, y - s);
    c.quadraticCurveTo(x, y, x + s, y);
    c.quadraticCurveTo(x, y, x, y + s);
    c.quadraticCurveTo(x, y, x - s, y);
    c.quadraticCurveTo(x, y, x, y - s);
    c.fill();
  }

  // ---------- Objets ----------
  const KERNEL = [[-6, -1, 7], [6, -2, 7], [0, -7, 7], [1, 4, 6.5], [-5, 5, 4.8], [6.5, 4.5, 4.6]];

  function kernel(c, light, mid, hull, gloss) {
    c.fillStyle = OUT;
    for (const p of KERNEL) circ(c, p[0], p[1], p[2] + 1.5);
    c.fillStyle = light;
    for (const p of KERNEL) circ(c, p[0], p[1], p[2]);
    // Ombres en croissant sur chaque lobe
    c.fillStyle = mid;
    circ(c, 1.6, 4.6, 5.6); circ(c, -5.4, -0.2, 5.6); circ(c, 6.6, -1.2, 5.6); circ(c, 0.6, -6.2, 5.6);
    c.fillStyle = light;
    circ(c, 0.6, 3.4, 5.4); circ(c, -6.4, -1.6, 5.4); circ(c, 5.6, -2.6, 5.4); circ(c, -0.4, -7.6, 5.4);
    if (hull) { c.fillStyle = hull; oval(c, 0.5, -0.5, 2.8, 1.9, 0.4); }
    c.fillStyle = gloss;
    circ(c, -2.6, -9.6, 1.7); circ(c, -9, -3.6, 1.2);
  }

  function face(c, angry, col) {
    const k = col || '#4a2a3a';
    c.fillStyle = k;
    circ(c, -3.6, -1.5, 1.6); circ(c, 3.6, -1.5, 1.6);
    c.strokeStyle = k;
    c.lineWidth = 1.3;
    c.lineCap = 'round';
    c.beginPath();
    if (angry) {
      c.moveTo(-6.8, -5.6); c.lineTo(-2, -3.6);
      c.moveTo(6.8, -5.6); c.lineTo(2, -3.6);
      c.moveTo(-2.2, 3.8); c.lineTo(2.2, 3.8);
    } else {
      c.arc(0, 1.2, 2.6, Math.PI * 0.15, Math.PI * 0.85);
    }
    c.stroke();
    if (!angry) {
      c.fillStyle = 'rgba(255,255,255,.9)';
      circ(c, -3.1, -2, 0.55); circ(c, 4.1, -2, 0.55);
      c.fillStyle = 'rgba(255,110,150,.55)';
      circ(c, -7.2, 1.8, 1.9); circ(c, 7.2, 1.8, 1.9);
    }
  }

  const CANDY = [['#ff4f9a', '#ffc2e0'], ['#3a9cff', '#bfe2ff'], ['#8a5cff', '#d9caff'], ['#22b96e', '#b8f3d2'], ['#ff8a1f', '#ffd9a8']];
  const LOLLY = ['#e8203f', '#ff7a1f', '#8a5cff', '#1fa4e8'];

  function candy(c, main, light, withFace) {
    for (const s of [-1, 1]) {
      c.fillStyle = OUT;
      c.beginPath(); c.moveTo(s * 9, 0); c.lineTo(s * 23.5, -11); c.lineTo(s * 20.5, 0); c.lineTo(s * 23.5, 11); c.closePath(); c.fill();
      c.fillStyle = light;
      c.beginPath(); c.moveTo(s * 10, 0); c.lineTo(s * 22, -9); c.lineTo(s * 19, 0); c.lineTo(s * 22, 9); c.closePath(); c.fill();
      c.strokeStyle = main;
      c.lineWidth = 1;
      c.beginPath(); c.moveTo(s * 12, 0); c.lineTo(s * 19.5, -4.5); c.moveTo(s * 12, 0); c.lineTo(s * 19.5, 4.5); c.stroke();
    }
    c.fillStyle = OUT; oval(c, 0, 0, 13.5, 10.5);
    c.fillStyle = main; oval(c, 0, 0, 12, 9);
    c.save();
    c.beginPath(); c.ellipse(0, 0, 12, 9, 0, 0, TAU); c.clip();
    if (!withFace) {
      c.strokeStyle = 'rgba(255,255,255,.85)';
      c.lineWidth = 3;
      c.beginPath();
      for (const x of [-8, 0, 8]) { c.moveTo(x - 3, -10); c.lineTo(x + 3, 10); }
      c.stroke();
    }
    c.fillStyle = 'rgba(0,0,0,.13)'; oval(c, 0, 8, 14, 5);
    c.restore();
    c.fillStyle = 'rgba(255,255,255,.75)'; oval(c, -4, -5.2, 4.6, 1.7, -0.25);
  }

  function lolly(c, main) {
    c.lineCap = 'round';
    c.strokeStyle = OUT; c.lineWidth = 5.6;
    c.beginPath(); c.moveTo(0, 10); c.lineTo(0, 27); c.stroke();
    c.strokeStyle = '#fff8ea'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(0, 10); c.lineTo(0, 27); c.stroke();
    c.fillStyle = OUT; circ(c, 0, 0, 14.5);
    c.fillStyle = '#fff'; circ(c, 0, 0, 13);
    c.save();
    c.beginPath(); c.arc(0, 0, 13, 0, TAU); c.clip();
    c.strokeStyle = main;
    c.lineWidth = 3.8;
    c.beginPath();
    for (let a = 0; a < 16; a += 0.25) {
      const r = a * 0.82;
      const x = Math.cos(a) * r, y = Math.sin(a) * r;
      if (a === 0) c.moveTo(x, y); else c.lineTo(x, y);
    }
    c.stroke();
    c.fillStyle = 'rgba(0,0,0,.10)'; oval(c, 3, 9, 14, 6);
    c.restore();
    c.strokeStyle = 'rgba(255,255,255,.85)';
    c.lineWidth = 2;
    c.beginPath(); c.arc(0, 0, 9.5, Math.PI * 1.1, Math.PI * 1.45); c.stroke();
  }

  // Dessine un objet centré en (0,0). o = { t, seed, face }
  function drawItem(c, type, o) {
    const seed = o.seed || 0;
    switch (type) {
      case 'pop':
        kernel(c, '#fffaf0', '#f1d48a', o.face ? null : '#e2ad52', 'rgba(255,255,255,.9)');
        if (o.face) face(c);
        break;
      case 'caramel':
        kernel(c, '#f2b24c', '#c2771a', o.face ? null : '#8a4a0c', 'rgba(255,255,255,.8)');
        c.strokeStyle = 'rgba(255,255,255,.55)';
        c.lineWidth = 1.6;
        c.lineCap = 'round';
        c.beginPath(); c.arc(1, -4, 8.5, Math.PI * 1.15, Math.PI * 1.55); c.stroke();
        if (o.face) face(c);
        break;
      case 'arc': {
        const h = ((o.t || 0) * 220 + seed) % 360;
        c.shadowColor = 'hsl(' + h + ',100%,72%)';
        c.shadowBlur = 14;
        kernel(c, 'hsl(' + h + ',95%,76%)', 'hsl(' + ((h + 50) % 360) + ',92%,62%)', null, '#fff');
        c.shadowBlur = 0;
        c.fillStyle = '#fff';
        const a = (o.t || 0) * 3;
        for (let i = 0; i < 3; i++) star(c, Math.cos(a + i * 2.1) * 17, Math.sin(a + i * 2.1) * 17, 3.2);
        if (o.face) face(c);
        break;
      }
      case 'brule': {
        // Halo hérissé + croix : reconnaissable par la forme, pas seulement par la couleur
        c.fillStyle = 'rgba(255,70,20,.62)';
        c.beginPath();
        for (let i = 0; i < 20; i++) {
          const a = i * TAU / 20;
          const r = i % 2 ? 14.5 : 21;
          c.lineTo(Math.cos(a) * r, Math.sin(a) * r - 1);
        }
        c.closePath(); c.fill();
        kernel(c, '#4c3a32', '#231916', null, 'rgba(255,170,100,.45)');
        if (o.face) face(c, true, '#ffb37a');
        else {
          c.lineCap = 'round';
          for (const pass of [1, 0]) {
            c.strokeStyle = pass ? '#1a0c08' : '#ff6a2a';
            c.lineWidth = pass ? 5.6 : 3.2;
            c.beginPath(); c.moveTo(-5.5, -6.5); c.lineTo(5.5, 4.5); c.moveTo(5.5, -6.5); c.lineTo(-5.5, 4.5); c.stroke();
          }
        }
        break;
      }
      case 'dore': {
        // Pop-corn doré, avec son halo et ses étincelles
        c.shadowColor = '#ffd257';
        c.shadowBlur = 14;
        kernel(c, '#ffe27a', '#f0a81e', o.face ? null : '#c9770a', '#ffffff');
        c.shadowBlur = 0;
        c.fillStyle = '#fff';
        const a = (o.t || 0) * 4 + seed;
        for (let i = 0; i < 3; i++) star(c, Math.cos(a + i * 2.1) * 17, Math.sin(a + i * 2.1) * 17, 3.2);
        if (o.face) face(c);
        break;
      }
      case 'gel':
        c.fillStyle = OUT; rr(c, -12.5, -12.5, 25, 25, 5.5); c.fill();
        c.fillStyle = '#bfe9ff'; rr(c, -11, -11, 22, 22, 4.5); c.fill();
        c.fillStyle = '#7fc8f5'; rr(c, -11, 2, 22, 9, 4.5); c.fill();
        c.fillStyle = '#fff'; star(c, -3.5, -3.5, 5.5);
        break;
      case 'coeur':
        for (const pass of [1, 0]) {
          const e = pass ? 1.6 : 0;
          c.fillStyle = pass ? OUT : '#ff4f6d';
          circ(c, -6, -4, 7.5 + e); circ(c, 6, -4, 7.5 + e);
          c.beginPath(); c.moveTo(-13.2 - e, -1.5); c.lineTo(13.2 + e, -1.5); c.lineTo(0, 13.5 + e * 1.3); c.closePath(); c.fill();
        }
        c.fillStyle = 'rgba(255,255,255,.7)'; oval(c, -7, -6.5, 3.2, 2, -0.5);
        break;
      case 'sablier':
        c.fillStyle = OUT;
        rr(c, -11.5, -14.5, 23, 5.5, 2.5); c.fill();
        rr(c, -11.5, 9, 23, 5.5, 2.5); c.fill();
        c.beginPath(); c.moveTo(-9.5, -10); c.lineTo(9.5, -10); c.lineTo(2.2, 0); c.lineTo(9.5, 10); c.lineTo(-9.5, 10); c.lineTo(-2.2, 0); c.closePath(); c.fill();
        c.fillStyle = '#d9f1ff';
        c.beginPath(); c.moveTo(-7.5, -9); c.lineTo(7.5, -9); c.lineTo(1.2, 0); c.lineTo(7.5, 9); c.lineTo(-7.5, 9); c.lineTo(-1.2, 0); c.closePath(); c.fill();
        c.fillStyle = '#ffc928';
        c.beginPath(); c.moveTo(-5, -5.5); c.lineTo(5, -5.5); c.lineTo(0.8, 0); c.lineTo(-0.8, 0); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(-6.5, 9); c.lineTo(6.5, 9); c.lineTo(0, 3.5); c.closePath(); c.fill();
        c.fillStyle = '#b8862a';
        rr(c, -10, -13, 20, 3, 1.5); c.fill();
        rr(c, -10, 10, 20, 3, 1.5); c.fill();
        break;
      case 'bonbon': {
        const p = CANDY[Math.floor(seed) % CANDY.length];
        candy(c, p[0], p[1], o.face);
        if (o.face) face(c);
        break;
      }
      case 'sucette':
        lolly(c, LOLLY[Math.floor(seed) % LOLLY.length]);
        break;
    }
  }

  // ---------- Ennemis du mode Invasion ----------
  const FOE_LOOK = {
    brule: { light: '#4c3a32', mid: '#231916', halo: 'rgba(255,70,20,.62)', face: '#ffb37a', gloss: 'rgba(255,170,100,.45)' },
    braise: { light: '#f0562e', mid: '#a3200f', halo: 'rgba(255,196,40,.75)', face: '#3a0c05', gloss: 'rgba(255,240,170,.85)' },
    costaud: { light: '#6a7080', mid: '#353944', halo: 'rgba(150,170,210,.55)', face: '#e6ecff', gloss: 'rgba(255,255,255,.55)' },
    fumee: { light: '#c9c3d6', mid: '#8a8399', halo: 'rgba(235,230,248,.45)', face: '#4a3f63', gloss: 'rgba(255,255,255,.85)' },
  };

  // Dessine un ennemi centré en (0,0). o = { hp, hit, t }
  function drawFoe(c, kind, o) {
    const L = FOE_LOOK[kind] || FOE_LOOK.brule;
    const t = o.t || 0;
    c.fillStyle = L.halo;
    if (kind === 'fumee') {
      // Volutes de fumée qui respirent
      const p = Math.sin(t * 3) * 1.5;
      circ(c, -12, -6, 9 + p); circ(c, 12, -4, 9 - p); circ(c, 0, -16, 9 + p); circ(c, -7, 10, 8 - p); circ(c, 9, 9, 8 + p);
      circ(c, 0, -1, 17);
    } else {
      // Halo hérissé : flammes longues pour la braise, court et régulier pour le costaud
      const n = kind === 'braise' ? 14 : kind === 'costaud' ? 12 : 20;
      const rOut = kind === 'braise' ? 23 : kind === 'costaud' ? 20 : 21;
      const rIn = kind === 'costaud' ? 17 : 14.5;
      c.beginPath();
      for (let i = 0; i < n; i++) {
        const a = i * TAU / n;
        const flick = kind === 'braise' && i % 2 === 0 ? Math.sin(t * 9 + i) * 2.5 : 0;
        const r = i % 2 ? rIn : rOut + flick;
        c.lineTo(Math.cos(a) * r, Math.sin(a) * r - 1);
      }
      c.closePath(); c.fill();
    }
    kernel(c, L.light, L.mid, null, L.gloss);
    if (kind === 'costaud') {
      // Bandeau riveté ; il se fissure quand il ne reste qu'un point de vie
      c.fillStyle = '#23262e'; rr(c, -13, -14, 26, 5, 2.5); c.fill();
      c.fillStyle = '#aab3c8'; circ(c, -9, -11.5, 1.3); circ(c, 0, -11.5, 1.3); circ(c, 9, -11.5, 1.3);
      if (o.hp === 1) {
        c.strokeStyle = '#0e1016'; c.lineWidth = 1.6; c.lineCap = 'round';
        c.beginPath(); c.moveTo(-10, -8); c.lineTo(-4, -3); c.lineTo(-8, 2); c.lineTo(-2, 8); c.moveTo(8, -7); c.lineTo(5, -1); c.lineTo(9, 5); c.stroke();
      }
    }
    face(c, true, L.face);
    if (o.hit > 0) {
      c.fillStyle = 'rgba(255,255,255,' + Math.min(0.9, o.hit * 5) + ')';
      circ(c, 0, -1, 16);
    }
  }

  // ---------- Avatars (tête centrée en x,y, rayon r) ----------
  function drawAvatar(c, id, x, y, r, mood) {
    c.save();
    c.translate(x, y);
    c.scale(r / 24, r / 24);
    c.lineCap = 'round';
    c.lineJoin = 'round';
    const dark = '#2b1a12';
    const sad = mood === 'sad';
    const happy = mood === 'happy';

    const head = (col) => {
      c.fillStyle = OUT; circ(c, 0, 0, 25.3);
      c.fillStyle = col; circ(c, 0, 0, 24);
      c.fillStyle = 'rgba(255,255,255,.22)'; oval(c, -9, -13, 7, 3.6, -0.5);
    };
    const eyes = (ey, col, dx) => {
      const d = dx || 8;
      if (happy) {
        c.strokeStyle = col || dark;
        c.lineWidth = 2.2;
        c.beginPath();
        c.arc(-d, ey + 1.5, 3.2, Math.PI * 1.15, Math.PI * 1.85);
        c.moveTo(d - 3, ey);
        c.arc(d, ey + 1.5, 3.2, Math.PI * 1.15, Math.PI * 1.85);
        c.stroke();
        return;
      }
      c.fillStyle = col || dark;
      circ(c, -d, ey, 3); circ(c, d, ey, 3);
      c.fillStyle = '#fff';
      circ(c, -d + 1, ey - 1, 1); circ(c, d + 1, ey - 1, 1);
    };
    const mouth = (my, col) => {
      if (happy) {
        c.fillStyle = col || '#5a1f1f';
        c.beginPath(); c.arc(0, my + 1, 6.5, 0, Math.PI); c.closePath(); c.fill();
        c.fillStyle = '#ff8fa3';
        c.beginPath(); c.arc(0, my + 5.5, 3.4, Math.PI, 0); c.closePath(); c.fill();
        return;
      }
      c.strokeStyle = col || dark;
      c.lineWidth = 2;
      c.beginPath();
      if (sad) c.arc(0, my + 9, 7, Math.PI * 1.2, Math.PI * 1.8);
      else c.arc(0, my, 8, Math.PI * 0.2, Math.PI * 0.8);
      c.stroke();
    };
    const cheeks = () => { c.fillStyle = 'rgba(255,110,120,.38)'; circ(c, -14.5, 7, 4.2); circ(c, 14.5, 7, 4.2); };
    const topCap = (col) => { c.fillStyle = col; c.beginPath(); c.arc(0, 0, 24.3, Math.PI * 1.13, Math.PI * 1.87); c.closePath(); c.fill(); };
    const ear = (sx, col, inner) => {
      c.fillStyle = OUT;
      c.beginPath(); c.moveTo(sx * 22.5, -9); c.lineTo(sx * 24.5, -35); c.lineTo(sx * 3.5, -22); c.closePath(); c.fill();
      c.fillStyle = col;
      c.beginPath(); c.moveTo(sx * 21, -10); c.lineTo(sx * 23, -33); c.lineTo(sx * 5, -22); c.closePath(); c.fill();
      c.fillStyle = inner;
      c.beginPath(); c.moveTo(sx * 18, -14); c.lineTo(sx * 20, -27); c.lineTo(sx * 10, -21); c.closePath(); c.fill();
    };

    switch (id) {
      case 'leo':
        head('#f2c49b');
        topCap('#d62839');
        c.fillStyle = '#a81c2f'; rr(c, -2, -13, 30, 6, 3); c.fill();
        c.fillStyle = '#fff'; circ(c, 0, -20, 2.2);
        eyes(-1); cheeks(); mouth(4);
        break;
      case 'mia':
        c.fillStyle = OUT; circ(c, -27, -4, 10.3); circ(c, 27, -4, 10.3);
        c.fillStyle = '#6b3a1e'; circ(c, -27, -4, 9); circ(c, 27, -4, 9);
        head('#f2c49b');
        topCap('#6b3a1e');
        c.fillStyle = '#ff5fa2'; circ(c, -20, -12, 4.5); circ(c, 20, -12, 4.5);
        eyes(-1); cheeks(); mouth(4);
        break;
      case 'chat':
        ear(-1, '#f39c3d', '#ffc2d1'); ear(1, '#f39c3d', '#ffc2d1');
        head('#f39c3d');
        c.strokeStyle = '#c9741c'; c.lineWidth = 2.5;
        c.beginPath(); c.moveTo(-6, -22); c.lineTo(-5, -14); c.moveTo(0, -23); c.lineTo(0, -14); c.moveTo(6, -22); c.lineTo(5, -14); c.stroke();
        c.fillStyle = '#fff4e2'; oval(c, 0, 9, 11, 8);
        c.fillStyle = '#ff7a9c'; c.beginPath(); c.moveTo(-3, 4); c.lineTo(3, 4); c.lineTo(0, 8); c.closePath(); c.fill();
        c.strokeStyle = dark; c.lineWidth = 1;
        c.beginPath(); c.moveTo(-12, 8); c.lineTo(-25, 5); c.moveTo(-12, 11); c.lineTo(-25, 13); c.moveTo(12, 8); c.lineTo(25, 5); c.moveTo(12, 11); c.lineTo(25, 13); c.stroke();
        eyes(-3, '#1f5f3a'); mouth(6);
        break;
      case 'robot':
        c.strokeStyle = '#6d7a85'; c.lineWidth = 3;
        c.beginPath(); c.moveTo(0, -22); c.lineTo(0, -32); c.stroke();
        c.fillStyle = '#ff4f4f'; circ(c, 0, -34, 4);
        c.fillStyle = '#6d7a85'; rr(c, -27, -6, 6, 12, 2); c.fill(); rr(c, 21, -6, 6, 12, 2); c.fill();
        c.fillStyle = OUT; rr(c, -24.3, -24.3, 48.6, 48.6, 9); c.fill();
        c.fillStyle = '#b8c4cc'; rr(c, -23, -23, 46, 46, 8); c.fill();
        c.fillStyle = 'rgba(255,255,255,.3)'; rr(c, -19, -20, 16, 4, 2); c.fill();
        c.fillStyle = '#12313d'; rr(c, -17, -12, 34, 16, 5); c.fill();
        c.fillStyle = sad ? '#ff6b6b' : happy ? '#8dffb0' : '#5fe8ff';
        circ(c, -8, -4, 4); circ(c, 8, -4, 4);
        c.fillStyle = '#12313d'; rr(c, -10, 10, 20, 6, 2); c.fill();
        c.fillStyle = '#b8c4cc'; c.fillRect(-4, 10, 1.5, 6); c.fillRect(2.5, 10, 1.5, 6);
        break;
      case 'renard':
        ear(-1, '#e8632b', '#3a2019'); ear(1, '#e8632b', '#3a2019');
        head('#e8632b');
        c.save();
        c.beginPath(); c.arc(0, 0, 24, 0, TAU); c.clip();
        c.fillStyle = '#fff6ea';
        oval(c, -13, 16, 14, 13); oval(c, 13, 16, 14, 13);
        c.restore();
        c.fillStyle = dark; circ(c, 0, 8, 3.2);
        eyes(-3); mouth(8);
        break;
      case 'panda':
        c.fillStyle = OUT; circ(c, -18, -18, 10.3); circ(c, 18, -18, 10.3);
        c.fillStyle = '#2b2b33'; circ(c, -18, -18, 9); circ(c, 18, -18, 9);
        head('#ffffff');
        c.fillStyle = '#2b2b33'; oval(c, -9, -2, 6.5, 8, 0.35); oval(c, 9, -2, 6.5, 8, -0.35);
        if (happy) eyes(-2, '#fff', 9);
        else { c.fillStyle = '#fff'; circ(c, -9, -2, 2.8); circ(c, 9, -2, 2.8); c.fillStyle = dark; circ(c, -8.6, -1.6, 1.5); circ(c, 9.4, -1.6, 1.5); }
        c.fillStyle = dark; oval(c, 0, 7, 3.2, 2.2);
        cheeks(); mouth(8);
        break;
      case 'licorne':
        c.fillStyle = OUT; circ(c, -21, -11, 10.3); circ(c, -25, 3, 9.3); circ(c, -22, 15, 8.3); circ(c, -9, -22, 9.3);
        c.fillStyle = '#ff8fc7'; circ(c, -21, -11, 9);
        c.fillStyle = '#b48cff'; circ(c, -25, 3, 8); circ(c, -9, -22, 8);
        c.fillStyle = '#7fd4ff'; circ(c, -22, 15, 7);
        c.fillStyle = OUT; c.beginPath(); c.moveTo(-1.5, -20); c.lineTo(6, -45); c.lineTo(12.5, -18); c.closePath(); c.fill();
        c.fillStyle = '#ffd84a'; c.beginPath(); c.moveTo(0.5, -20); c.lineTo(6, -41.5); c.lineTo(10.5, -19); c.closePath(); c.fill();
        c.strokeStyle = '#e0a51c'; c.lineWidth = 1.2;
        c.beginPath(); c.moveTo(2, -25); c.lineTo(9, -27); c.moveTo(3.5, -31); c.lineTo(8, -33); c.stroke();
        ear(1, '#ffffff', '#ffc2e0');
        head('#ffffff');
        eyes(-1, '#4a2a6b'); cheeks(); mouth(5, '#4a2a6b');
        break;
      case 'cochon':
        for (const sx of [-1, 1]) {
          c.fillStyle = OUT;
          c.beginPath(); c.moveTo(sx * 6, -19); c.quadraticCurveTo(sx * 24, -40, sx * 26, -11); c.closePath(); c.fill();
          c.fillStyle = '#f08fae';
          c.beginPath(); c.moveTo(sx * 8, -19); c.quadraticCurveTo(sx * 23, -36, sx * 24, -13); c.closePath(); c.fill();
        }
        head('#f9b8cc');
        eyes(-5); cheeks(); mouth(11);
        c.fillStyle = OUT; oval(c, 0, 6, 11.3, 8.3);
        c.fillStyle = '#f08fae'; oval(c, 0, 6, 10, 7);
        c.fillStyle = '#b8506e'; oval(c, -3.6, 6, 1.7, 2.6); oval(c, 3.6, 6, 1.7, 2.6);
        break;
      case 'canard':
        c.strokeStyle = OUT; c.lineWidth = 5;
        c.beginPath(); c.moveTo(-3, -23); c.quadraticCurveTo(-8, -34, 1, -33); c.moveTo(2, -23); c.quadraticCurveTo(4, -36, 11, -30); c.stroke();
        c.strokeStyle = '#ffffff'; c.lineWidth = 3;
        c.beginPath(); c.moveTo(-3, -23); c.quadraticCurveTo(-8, -34, 1, -33); c.moveTo(2, -23); c.quadraticCurveTo(4, -36, 11, -30); c.stroke();
        head('#ffffff');
        eyes(-5); cheeks();
        c.fillStyle = OUT; oval(c, 0, 8, 13.3, 7.8);
        c.fillStyle = '#ff9a1f'; oval(c, 0, 8, 12, 6.5);
        c.fillStyle = '#ffb84d'; oval(c, 0, 5.6, 9, 2.6);
        c.strokeStyle = '#c96a0a'; c.lineWidth = 1.4;
        c.beginPath();
        if (sad) c.arc(0, 15, 9, Math.PI * 1.25, Math.PI * 1.75); else c.arc(0, 3, 9, Math.PI * 0.25, Math.PI * 0.75);
        c.stroke();
        break;
      case 'poussin':
        head('#ffd93b');
        // Demi-coquille d'œuf en guise de chapeau
        c.fillStyle = OUT; c.beginPath(); c.arc(0, 0, 25.3, Math.PI * 1.13, Math.PI * 1.87); c.closePath(); c.fill();
        topCap('#fffdf5');
        c.fillStyle = '#fffdf5';
        for (let i = 0; i < 5; i++) {
          const zx = -22 + i * 8.9;
          c.beginPath(); c.moveTo(zx, -10.2); c.lineTo(zx + 8.9, -10.2); c.lineTo(zx + 4.45, -4.6); c.closePath(); c.fill();
        }
        eyes(1, null, 9);
        c.fillStyle = 'rgba(255,140,60,.45)'; circ(c, -15, 9, 4); circ(c, 15, 9, 4);
        c.fillStyle = OUT; c.beginPath(); c.moveTo(-6.5, 4.5); c.lineTo(6.5, 4.5); c.lineTo(0, 14); c.closePath(); c.fill();
        c.fillStyle = '#ff8a1f'; c.beginPath(); c.moveTo(-4.6, 5.6); c.lineTo(4.6, 5.6); c.lineTo(0, 12); c.closePath(); c.fill();
        break;
      case 'bebe':
        head('#f6cfae');
        c.strokeStyle = '#8a5a2b'; c.lineWidth = 2.4;
        c.beginPath(); c.moveTo(0, -23); c.bezierCurveTo(-9, -33, 6, -38, 5, -29); c.bezierCurveTo(4.5, -25, 0, -27, 1.5, -30); c.stroke();
        eyes(-3, null, 9); cheeks();
        if (sad) mouth(6);
        else {
          // Tétine
          c.fillStyle = OUT; circ(c, 0, 10, 8.3);
          c.fillStyle = '#6fc8ff'; circ(c, 0, 10, 7);
          c.fillStyle = '#ffffff'; circ(c, 0, 10, 3.4);
          c.strokeStyle = '#3f9be0'; c.lineWidth = 2;
          c.beginPath(); c.arc(0, 17.5, 3.6, 0, Math.PI); c.stroke();
        }
        break;
      case 'chatnoir':
        ear(-1, '#2b2b33', '#ff8fb0'); ear(1, '#2b2b33', '#ff8fb0');
        head('#2b2b33');
        if (happy) eyes(-3, '#f4e04d');
        else {
          c.fillStyle = '#f4e04d'; oval(c, -8, -3, 4.4, 4); oval(c, 8, -3, 4.4, 4);
          c.fillStyle = '#17171c'; oval(c, -8, -3, 1.3, 3.3); oval(c, 8, -3, 1.3, 3.3);
        }
        c.fillStyle = '#ff8fb0'; c.beginPath(); c.moveTo(-3, 4); c.lineTo(3, 4); c.lineTo(0, 8); c.closePath(); c.fill();
        c.strokeStyle = '#d8d8e0'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(-10, 8); c.lineTo(-25, 5); c.moveTo(-10, 11); c.lineTo(-25, 13); c.moveTo(10, 8); c.lineTo(25, 5); c.moveTo(10, 11); c.lineTo(25, 13); c.stroke();
        mouth(6, '#d8d8e0');
        break;
      case 'heros':
        // Capitaine Pop : héros original, masque vert et mèche brune
        head('#f2c49b');
        topCap('#5a3418');
        c.fillStyle = '#5a3418'; c.beginPath(); c.moveTo(-6, -11); c.quadraticCurveTo(4, -4, 14, -11); c.closePath(); c.fill();
        c.save();
        c.beginPath(); c.arc(0, 0, 24, 0, TAU); c.clip();
        c.fillStyle = '#1f8f5f'; rr(c, -26, -8, 52, 12, 5); c.fill();
        c.restore();
        c.fillStyle = '#ffffff'; oval(c, -8, -2, 4.2, 3.2); oval(c, 8, -2, 4.2, 3.2);
        if (!happy) { c.fillStyle = dark; circ(c, -7.4, -2, 1.7); circ(c, 8.6, -2, 1.7); }
        else { c.strokeStyle = dark; c.lineWidth = 1.8; c.beginPath(); c.arc(-8, -1, 2.6, Math.PI * 1.15, Math.PI * 1.85); c.moveTo(5.6, -2); c.arc(8, -1, 2.6, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); }
        cheeks(); mouth(6);
        break;
      case 'masque':
        // Éclair : héros original, cagoule violette et éclair sur le front
        head('#f2c49b');
        c.save();
        c.beginPath(); c.arc(0, 0, 24, 0, TAU); c.clip();
        c.fillStyle = '#4a34b0';
        c.beginPath(); c.moveTo(-26, -26); c.lineTo(26, -26); c.lineTo(26, 3); c.quadraticCurveTo(0, 12, -26, 3); c.closePath(); c.fill();
        c.fillStyle = 'rgba(255,255,255,.16)'; oval(c, -9, -14, 8, 4, -0.5);
        c.restore();
        c.fillStyle = '#ffffff';
        for (const sx of [-1, 1]) {
          c.beginPath(); c.moveTo(sx * 3, -1); c.quadraticCurveTo(sx * 9, -9, sx * 15, -5); c.quadraticCurveTo(sx * 11, 3, sx * 3, -1); c.fill();
        }
        if (sad) { c.fillStyle = dark; circ(c, -8.5, -2.4, 1.4); circ(c, 8.5, -2.4, 1.4); }
        c.fillStyle = '#ffe14d';
        c.beginPath(); c.moveTo(2.5, -22); c.lineTo(-4, -13.5); c.lineTo(-0.5, -13.5); c.lineTo(-2.5, -7); c.lineTo(4.5, -16); c.lineTo(1, -16); c.closePath(); c.fill();
        mouth(9);
        break;
      case 'lapin':
        for (const sx of [-1, 1]) {
          c.fillStyle = OUT; oval(c, sx * 10, -33, 7.3, 17.3, sx * 0.16);
          c.fillStyle = '#fff8f0'; oval(c, sx * 10, -33, 6, 16, sx * 0.16);
          c.fillStyle = '#ffc2d1'; oval(c, sx * 10, -32, 3, 11, sx * 0.16);
        }
        head('#fff8f0');
        eyes(-2); cheeks();
        c.fillStyle = '#ff8fa8'; oval(c, 0, 5, 3, 2.2);
        mouth(7);
        if (!happy && !sad) {
          c.fillStyle = '#fff'; rr(c, -3, 13.5, 6, 5, 1.5); c.fill();
          c.strokeStyle = dark; c.lineWidth = 0.8;
          c.beginPath(); c.moveTo(0, 13.5); c.lineTo(0, 18.5); c.stroke();
        }
        break;
      case 'grenouille':
        for (const sx of [-1, 1]) { c.fillStyle = OUT; circ(c, sx * 12, -19, 10.3); c.fillStyle = '#5cc16a'; circ(c, sx * 12, -19, 9); }
        head('#5cc16a');
        for (const sx of [-1, 1]) {
          c.fillStyle = '#fff'; circ(c, sx * 12, -19, 6.2);
          c.fillStyle = dark;
          if (happy) c.fillRect(sx * 12 - 4, -20, 8, 2.2); else circ(c, sx * 12, -18.5, 3);
        }
        c.fillStyle = 'rgba(255,110,120,.38)'; circ(c, -15, 6, 4); circ(c, 15, 6, 4);
        c.strokeStyle = '#2f7a3b'; c.lineWidth = 2.2;
        c.beginPath();
        if (sad) c.arc(0, 18, 12, Math.PI * 1.25, Math.PI * 1.75); else c.arc(0, -2, 14, Math.PI * 0.2, Math.PI * 0.8);
        c.stroke();
        break;
      case 'ours':
        c.fillStyle = OUT; circ(c, -17, -18, 9.3); circ(c, 17, -18, 9.3);
        c.fillStyle = '#a9713f'; circ(c, -17, -18, 8); circ(c, 17, -18, 8);
        c.fillStyle = '#e2c29a'; circ(c, -17, -18, 4); circ(c, 17, -18, 4);
        head('#a9713f');
        c.fillStyle = '#e2c29a'; oval(c, 0, 8, 10.5, 8.5);
        c.fillStyle = dark; oval(c, 0, 4.5, 3.4, 2.4);
        eyes(-4); mouth(8);
        break;
      case 'pingouin':
        head('#2b3440');
        c.save();
        c.beginPath(); c.arc(0, 0, 24, 0, TAU); c.clip();
        c.fillStyle = '#ffffff'; oval(c, -8, 6, 11, 15); oval(c, 8, 6, 11, 15); oval(c, 0, 14, 14, 12);
        c.restore();
        eyes(-2); cheeks();
        c.fillStyle = OUT; c.beginPath(); c.moveTo(-6.5, 4.5); c.lineTo(6.5, 4.5); c.lineTo(0, 13.5); c.closePath(); c.fill();
        c.fillStyle = '#ff9a1f'; c.beginPath(); c.moveTo(-4.6, 5.6); c.lineTo(4.6, 5.6); c.lineTo(0, 11.5); c.closePath(); c.fill();
        break;
      case 'pirate':
        head('#f2c49b');
        topCap('#d62839');
        c.fillStyle = '#fff'; circ(c, -9, -17, 1.6); circ(c, 2, -19, 1.6); circ(c, 12, -16, 1.6);
        c.fillStyle = '#d62839'; circ(c, 24, -10, 4.5);
        c.beginPath(); c.moveTo(25, -8); c.lineTo(33, -2); c.lineTo(27, 0); c.closePath(); c.fill();
        c.strokeStyle = dark; c.lineWidth = 1.6;
        c.beginPath(); c.moveTo(-22, -9); c.lineTo(20, -6); c.stroke();
        c.fillStyle = dark; oval(c, -8, -2, 5.2, 4.6);
        if (happy) { c.strokeStyle = dark; c.lineWidth = 2.2; c.beginPath(); c.arc(8, 0.5, 3.2, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); }
        else { c.fillStyle = dark; circ(c, 8, -1, 3); c.fillStyle = '#fff'; circ(c, 9, -2, 1); }
        cheeks(); mouth(5);
        break;
      case 'astronaute':
        c.strokeStyle = '#8fa3b8'; c.lineWidth = 2.5;
        c.beginPath(); c.moveTo(15, -22); c.lineTo(20, -33); c.stroke();
        c.fillStyle = '#ff5a5a'; circ(c, 20, -34, 3);
        c.fillStyle = OUT; circ(c, 0, 0, 27.3);
        c.fillStyle = '#f4f6fa'; circ(c, 0, 0, 26);
        c.fillStyle = '#16324a'; circ(c, 0, 1, 20.5);
        c.fillStyle = '#f2c49b'; circ(c, 0, 2, 17.5);
        eyes(0, null, 7);
        c.fillStyle = 'rgba(255,110,120,.38)'; circ(c, -11.5, 7, 3.4); circ(c, 11.5, 7, 3.4);
        mouth(4);
        c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 2.5;
        c.beginPath(); c.arc(0, 1, 17, Math.PI * 1.15, Math.PI * 1.5); c.stroke();
        break;
      case 'fantome':
        for (const pass of [1, 0]) {
          const o = pass ? 1.3 : 0;
          c.fillStyle = pass ? OUT : '#ffffff';
          c.beginPath();
          c.arc(0, 0, 24 + o, Math.PI, 0);
          c.lineTo(24 + o, 26 + o);
          c.quadraticCurveTo(18, 18 + o, 12, 26 + o);
          c.quadraticCurveTo(6, 18 + o, 0, 26 + o);
          c.quadraticCurveTo(-6, 18 + o, -12, 26 + o);
          c.quadraticCurveTo(-18, 18 + o, -24 - o, 26 + o);
          c.closePath(); c.fill();
        }
        if (happy) eyes(-2);
        else { c.fillStyle = dark; oval(c, -8, -2, 3.5, 5); oval(c, 8, -2, 3.5, 5); }
        cheeks();
        if (sad || happy) mouth(5); else { c.fillStyle = dark; oval(c, 0, 10, 3.5, 4.5); }
        break;
    }
    c.restore();
  }

  // ---------- Seaux (bord supérieur en y=0, centré en x=0) ----------
  const RAINBOW = ['#ff5a5a', '#ffa23a', '#ffe14d', '#5fd47a', '#4db4ff', '#a678ff'];

  function drawBucket(c, skin, bw, th, fill) {
    const bb = bw * 0.72, h = 38;
    const path = () => { c.beginPath(); c.moveTo(-bw, 0); c.lineTo(bw, 0); c.lineTo(bb, h); c.lineTo(-bb, h); c.closePath(); };
    const band = (t0, t1) => {
      c.beginPath();
      c.moveTo(-bw + t0 * 2 * bw, 0); c.lineTo(-bw + t1 * 2 * bw, 0);
      c.lineTo(-bb + t1 * 2 * bb, h); c.lineTo(-bb + t0 * 2 * bb, h);
      c.closePath(); c.fill();
    };

    // Pop-corn qui dépasse
    if (fill > 0) {
      const k = Math.min(7, fill);
      for (const pass of [1, 0]) {
        c.fillStyle = pass ? OUT : '#fffaf0';
        for (let i = 0; i < k; i++) circ(c, (i - (k - 1) / 2) * (bw * 1.6 / 7), -3 - (i % 2) * 4, pass ? 7.6 : 6.3);
      }
    }

    path();
    c.lineJoin = 'round';
    c.strokeStyle = OUT;
    c.lineWidth = 3;
    c.stroke();

    c.save();
    path();
    c.clip();
    const n = bw > 40 ? 9 : 5;
    switch (skin) {
      case 'dore': {
        const gr = c.createLinearGradient(-bw, 0, bw, 0);
        gr.addColorStop(0, '#d3921a'); gr.addColorStop(0.45, '#ffe98a'); gr.addColorStop(1, '#c58210');
        c.fillStyle = gr; c.fillRect(-bw, 0, 2 * bw, h);
        c.fillStyle = 'rgba(255,255,255,.4)'; band(0.2, 0.3);
        break;
      }
      case 'bonbon':
        c.fillStyle = '#ff9ed0'; c.fillRect(-bw, 0, 2 * bw, h);
        for (let i = 0; i < 14; i++) {
          c.fillStyle = i % 2 ? '#ffffff' : '#7fe3e0';
          circ(c, -bw + 4 + (i * 17) % (2 * bw - 8), 6 + (i * 11) % 28, 3);
        }
        break;
      case 'etoile':
        c.fillStyle = '#1c2a6b'; c.fillRect(-bw, 0, 2 * bw, h);
        c.fillStyle = '#ffd84a';
        for (let i = 0; i < 8; i++) star(c, -bw + 7 + (i * 23) % (2 * bw - 14), 7 + (i * 13) % 26, 4.2);
        break;
      case 'arc':
        for (let i = 0; i < 6; i++) { c.fillStyle = RAINBOW[i]; band(i / 6, (i + 1) / 6); }
        break;
      case 'pois':
        c.fillStyle = '#e8322e'; c.fillRect(-bw, 0, 2 * bw, h);
        c.fillStyle = '#fff';
        for (let i = 0; i < 12; i++) circ(c, -bw + 5 + (i * 19) % (2 * bw - 10), 6 + (i * 13) % 27, 3.2);
        break;
      case 'coeurs':
        c.fillStyle = '#ffd6e6'; c.fillRect(-bw, 0, 2 * bw, h);
        c.fillStyle = '#e8325a';
        for (let i = 0; i < 7; i++) {
          const hx = -bw + 8 + (i * 21) % (2 * bw - 16), hy = 8 + (i * 11) % 22;
          circ(c, hx - 2.2, hy, 2.6); circ(c, hx + 2.2, hy, 2.6);
          c.beginPath(); c.moveTo(hx - 4.6, hy + 0.8); c.lineTo(hx + 4.6, hy + 0.8); c.lineTo(hx, hy + 6.5); c.closePath(); c.fill();
        }
        break;
      case 'zebre': {
        c.fillStyle = '#ffffff'; c.fillRect(-bw, 0, 2 * bw, h);
        c.fillStyle = '#22232b';
        const nz = bw > 40 ? 15 : 9;
        for (let i = 0; i < nz; i += 2) band((i + 0.15) / nz, (i + 0.95) / nz);
        break;
      }
      case 'bois':
        c.fillStyle = '#a8713f'; c.fillRect(-bw, 0, 2 * bw, h);
        c.fillStyle = '#8f5c2e';
        for (let i = 0; i < 5; i += 2) band(i / 5, (i + 1) / 5);
        c.fillStyle = '#9aa3ad'; c.fillRect(-bw, 7, 2 * bw, 4.5); c.fillRect(-bw, 27, 2 * bw, 4.5);
        c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect(-bw, 7, 2 * bw, 1.4); c.fillRect(-bw, 27, 2 * bw, 1.4);
        break;
      case 'galaxie': {
        const gr = c.createLinearGradient(-bw, 0, bw, h);
        gr.addColorStop(0, '#2a1a5e'); gr.addColorStop(1, '#3a6fd8');
        c.fillStyle = gr; c.fillRect(-bw, 0, 2 * bw, h);
        c.fillStyle = '#fff';
        for (let i = 0; i < 9; i++) circ(c, -bw + 4 + (i * 17) % (2 * bw - 8), 5 + (i * 7) % 29, i % 3 ? 0.9 : 1.5);
        c.fillStyle = '#ffb347'; circ(c, bw * 0.3, 21, 5);
        c.strokeStyle = '#ffe0a8'; c.lineWidth = 1.4;
        c.beginPath(); c.ellipse(bw * 0.3, 21, 9, 3, -0.35, 0, TAU); c.stroke();
        break;
      }
      case 'fleurs': {
        c.fillStyle = '#3f8fe8'; c.fillRect(-bw, 0, 2 * bw, h);
        c.fillStyle = '#5aa6f5'; band(0.3, 0.42); band(0.62, 0.7);
        const nf = bw > 40 ? 7 : 5;
        for (let i = 0; i < nf; i++) {
          const fx = -bw + 9 + i * (2 * bw - 18) / (nf - 1);
          const fy = i % 2 ? 27 : 11;
          c.fillStyle = '#ff9fd0';
          for (let k = 0; k < 5; k++) circ(c, fx + Math.cos(k * TAU / 5 - 1.57) * 4.2, fy + Math.sin(k * TAU / 5 - 1.57) * 4.2, 3.2);
          c.fillStyle = '#ffe14d'; circ(c, fx, fy, 2.5);
        }
        break;
      }
      case 'eclair': {
        const gr = c.createLinearGradient(0, 0, 0, h);
        gr.addColorStop(0, '#15132a'); gr.addColorStop(1, '#43307c');
        c.fillStyle = gr; c.fillRect(-bw, 0, 2 * bw, h);
        const nb = bw > 40 ? 4 : 3;
        c.fillStyle = '#ffe14d';
        for (let i = 0; i < nb; i++) {
          const x = -bw + 13 + i * (2 * bw - 26) / (nb - 1);
          const y = 19 + (i % 2 ? 2 : -1);
          c.beginPath();
          c.moveTo(x + 3.5, y - 13); c.lineTo(x - 5.5, y + 1.5); c.lineTo(x - 0.5, y + 1.5);
          c.lineTo(x - 3.5, y + 13); c.lineTo(x + 6, y - 3); c.lineTo(x + 1, y - 3);
          c.closePath(); c.fill();
        }
        break;
      }
      default:
        c.fillStyle = th.bucket; c.fillRect(-bw, 0, 2 * bw, h);
        c.fillStyle = th.stripe;
        for (let i = 0; i < n; i += 2) band(i / n, (i + 1) / n);
    }
    c.fillStyle = 'rgba(0,0,0,.11)'; band(0.78, 1);
    c.fillStyle = 'rgba(255,255,255,.2)'; band(0.05, 0.13);
    c.restore();

    c.fillStyle = OUT; rr(c, -bw - 3.5, -4.5, 2 * bw + 7, 9, 4.5); c.fill();
    c.fillStyle = skin === 'dore' ? '#fff3b0' : th.rim; rr(c, -bw - 2, -3, 2 * bw + 4, 6, 3); c.fill();
  }

  window.Art = { TAU, OUT, circ, oval, rr, star, drawItem, drawFoe, drawAvatar, drawBucket };
})();
