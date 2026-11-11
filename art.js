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
      case 'brule':
        c.fillStyle = 'rgba(255,90,30,.28)';
        circ(c, 0, -1, 17);
        kernel(c, '#4c3a32', '#231916', null, 'rgba(255,170,100,.45)');
        if (o.face) face(c, true, '#ffb37a');
        else {
          c.fillStyle = '#ff8a3d';
          circ(c, -5, 0, 1.7); circ(c, 4, -5, 1.5); circ(c, 3, 4.5, 1.4); circ(c, -1, -8, 1.1);
        }
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

  window.Art = { TAU, OUT, circ, oval, rr, star, drawItem, drawAvatar, drawBucket };
})();
