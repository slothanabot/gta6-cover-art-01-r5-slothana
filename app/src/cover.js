'use strict';
/* Neon Grid Cover Studio — cover rendering engine.
   Everything here is drawn with the 2D canvas API: no external images,
   no fonts loaded over the network, no Rockstar artwork. The sample
   "photos" are procedural scenes painted in code below. */
(function () {

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* Five neon colour grades. Each grade tints the whole cover with a
     sunset/neon wash and supplies the caption accent colour. */
  var GRADES = [
    { name: 'Vice Sunset', top: '#ff9a3d', mid: '#ff5e7a', bottom: '#7b2ff7',
      glow: '#ff6ec7', accent: '#ffd166', wash: 'rgba(255,94,122,0.20)' },
    { name: 'Neon Pink', top: '#ff2e88', mid: '#c724b1', bottom: '#2b1055',
      glow: '#ff2e88', accent: '#ff5ce1', wash: 'rgba(255,46,136,0.22)' },
    { name: 'Ocean Drive', top: '#00e5ff', mid: '#00b3ff', bottom: '#120458',
      glow: '#00e5ff', accent: '#7df9ff', wash: 'rgba(0,229,255,0.18)' },
    { name: 'Acid Lime', top: '#d4ff3f', mid: '#37e08b', bottom: '#0b3d2e',
      glow: '#b6ff00', accent: '#d4ff3f', wash: 'rgba(120,255,90,0.18)' },
    { name: 'Midnight Purple', top: '#a06bff', mid: '#6d28d9', bottom: '#0d0221',
      glow: '#a06bff', accent: '#c4b5fd', wash: 'rgba(139,92,246,0.22)' }
  ];

  /* Layouts: cell grids in the multi-panel poster style, plus a solo
     full-bleed layout. */
  var LAYOUTS = {
    '6':    { cols: 2, rows: 3, label: '6-panel' },
    '4':    { cols: 2, rows: 2, label: '4-panel' },
    '9':    { cols: 3, rows: 3, label: '9-panel' },
    'solo': { cols: 1, rows: 1, label: 'Solo' }
  };

  var SIZES = {
    '1080x1080':  { w: 1080, h: 1080, label: 'Square · 1080 × 1080' },
    '1080x1350':  { w: 1080, h: 1350, label: 'Portrait · 1080 × 1350' },
    '1920x1080':  { w: 1920, h: 1080, label: 'Landscape · 1920 × 1080' }
  };

  /* ------------------------------------------------------------------ */
  /* Procedural sample photos. Each paints a sunset scene on a canvas,  */
  /* so the app ships with photos to try without any image files.       */
  /* ------------------------------------------------------------------ */

  function sky(ctx, w, h, stops) {
    var g = ctx.createLinearGradient(0, 0, 0, h);
    for (var i = 0; i < stops.length; i++) {
      g.addColorStop(stops[i][0], stops[i][1]);
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  function sun(ctx, x, y, r, color) {
    var g = ctx.createRadialGradient(x, y, r * 0.1, x, y, r * 2.2);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - r * 2.2, y - r * 2.2, r * 4.4, r * 4.4);
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }

  function palm(ctx, x, y, s, lean) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(lean);
    ctx.scale(s, s);
    ctx.strokeStyle = '#1d0b26';
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(14, -70, 6, -140); ctx.stroke();
    ctx.lineWidth = 6;
    for (var i = 0; i < 7; i++) {
      var a = -Math.PI * (0.08 + i * 0.13);
      ctx.beginPath();
      ctx.moveTo(6, -140);
      ctx.quadraticCurveTo(6 + Math.cos(a) * 55, -140 + Math.sin(a) * 55 - 18,
        6 + Math.cos(a) * 95, -140 + Math.sin(a) * 95 + 26);
      ctx.stroke();
    }
    ctx.restore();
  }

  function buildings(ctx, w, h, base, rnd, lit) {
    var x = -10;
    while (x < w + 10) {
      var bw = 40 + rnd() * 90;
      var bh = h * (0.18 + rnd() * 0.38);
      ctx.fillStyle = '#160a24';
      ctx.fillRect(x, base - bh, bw, bh);
      ctx.fillStyle = lit;
      for (var wy = base - bh + 12; wy < base - 14; wy += 22) {
        for (var wx = x + 8; wx < x + bw - 10; wx += 18) {
          if (rnd() < 0.42) ctx.fillRect(wx, wy, 8, 11);
        }
      }
      x += bw + 4 + rnd() * 14;
    }
  }

  function paintSample(canvas, variant, seed) {
    var ctx = canvas.getContext('2d');
    var w = canvas.width, h = canvas.height;
    var rnd = mulberry32(seed * 7919 + 13);
    if (variant === 0) { /* Sunset boulevard */
      sky(ctx, w, h, [[0, '#2b1055'], [0.45, '#ff5e7a'], [0.75, '#ff9a3d'], [1, '#ffd166']]);
      sun(ctx, w * 0.5, h * 0.52, w * 0.13, '#fff3c4');
      buildings(ctx, w, h, h * 0.72, rnd, '#ffd166');
      ctx.fillStyle = '#1d0b26';
      ctx.fillRect(0, h * 0.72, w, h * 0.28);
      ctx.fillStyle = '#ffd166';
      ctx.fillRect(w * 0.5 - 3, h * 0.72, 6, h * 0.28);
      for (var i = 0; i < 5; i++) {
        var y = h * (0.76 + i * 0.05);
        ctx.fillRect(w * 0.5 - 3 - i * 14, y, 6 + i * 28, 5);
      }
      palm(ctx, w * 0.08, h * 0.86, w / 520, 0.12);
      palm(ctx, w * 0.94, h * 0.88, w / 620, -0.14);
      /* low car silhouette */
      ctx.fillStyle = '#12061f';
      ctx.beginPath();
      ctx.moveTo(w * 0.32, h * 0.86); ctx.lineTo(w * 0.38, h * 0.80);
      ctx.lineTo(w * 0.56, h * 0.80); ctx.lineTo(w * 0.64, h * 0.86);
      ctx.closePath(); ctx.fill();
      ctx.fillRect(w * 0.30, h * 0.86, w * 0.36, h * 0.025);
      ctx.fillStyle = '#ff5e7a';
      ctx.fillRect(w * 0.33, h * 0.865, w * 0.05, 4);
    } else if (variant === 1) { /* Ocean pier */
      sky(ctx, w, h, [[0, '#120458'], [0.5, '#7b2ff7'], [0.8, '#ff5e7a'], [1, '#ff9a3d']]);
      sun(ctx, w * 0.62, h * 0.46, w * 0.11, '#ffe9a8');
      ctx.fillStyle = '#1b2a6b';
      ctx.fillRect(0, h * 0.58, w, h * 0.42);
      ctx.strokeStyle = 'rgba(255,209,102,0.55)';
      ctx.lineWidth = 3;
      for (var j = 0; j < 9; j++) {
        var ry = h * (0.60 + j * 0.045);
        ctx.beginPath();
        ctx.moveTo(w * (0.52 + rnd() * 0.1), ry);
        ctx.lineTo(w * (0.62 + rnd() * 0.16), ry);
        ctx.stroke();
      }
      /* pier */
      ctx.fillStyle = '#241226';
      ctx.fillRect(0, h * 0.66, w, h * 0.05);
      for (var p = 0; p < 7; p++) {
        ctx.fillRect(w * (0.05 + p * 0.15), h * 0.66, 10, h * 0.3);
      }
      ctx.fillStyle = '#3a1c3d';
      ctx.fillRect(0, h * 0.63, w, 6);
      palm(ctx, w * 0.12, h * 0.66, w / 560, 0.1);
      ctx.fillStyle = 'rgba(20,8,32,0.9)';
      for (var b = 0; b < 4; b++) {
        var bx = w * (0.3 + rnd() * 0.5), by = h * (0.12 + rnd() * 0.16);
        ctx.beginPath(); ctx.arc(bx, by, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(bx + 14, by + 4, 3, 0, Math.PI * 2); ctx.fill();
      }
    } else if (variant === 2) { /* Neon skyline, night */
      sky(ctx, w, h, [[0, '#0d0221'], [0.6, '#2b1055'], [1, '#6d28d9']]);
      ctx.fillStyle = '#ffffff';
      for (var s = 0; s < 70; s++) {
        ctx.globalAlpha = 0.25 + rnd() * 0.75;
        ctx.fillRect(rnd() * w, rnd() * h * 0.4, 2, 2);
      }
      ctx.globalAlpha = 1;
      sun(ctx, w * 0.78, h * 0.2, w * 0.07, '#e9d5ff');
      var cols = ['#00e5ff', '#ff2e88', '#d4ff3f', '#ffd166'];
      var bx2 = -8;
      while (bx2 < w + 8) {
        var bw2 = 46 + rnd() * 100;
        var bh2 = h * (0.3 + rnd() * 0.5);
        ctx.fillStyle = '#12061f';
        ctx.fillRect(bx2, h - bh2, bw2, bh2);
        ctx.fillStyle = cols[Math.floor(rnd() * cols.length)];
        for (var wy2 = h - bh2 + 12; wy2 < h - 12; wy2 += 20) {
          for (var wx2 = bx2 + 8; wx2 < bx2 + bw2 - 10; wx2 += 16) {
            if (rnd() < 0.35) { ctx.globalAlpha = 0.5 + rnd() * 0.5; ctx.fillRect(wx2, wy2, 7, 10); }
          }
        }
        ctx.globalAlpha = 1;
        bx2 += bw2 + 6 + rnd() * 12;
      }
      ctx.fillStyle = '#0a0416';
      ctx.fillRect(0, h * 0.94, w, h * 0.06);
    } else { /* Palm beach */
      sky(ctx, w, h, [[0, '#ff2e88'], [0.45, '#ff5e7a'], [0.75, '#ff9a3d'], [1, '#ffe9a8']]);
      sun(ctx, w * 0.5, h * 0.42, w * 0.12, '#fff7d6');
      ctx.fillStyle = '#0e4d6e';
      ctx.fillRect(0, h * 0.55, w, h * 0.18);
      ctx.fillStyle = '#127a8a';
      ctx.fillRect(0, h * 0.55, w, 5);
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 3;
      for (var wv = 0; wv < 5; wv++) {
        ctx.beginPath();
        ctx.moveTo(w * (0.08 + rnd() * 0.2), h * (0.58 + wv * 0.03));
        ctx.quadraticCurveTo(w * 0.5, h * (0.56 + wv * 0.03), w * (0.8 + rnd() * 0.1), h * (0.58 + wv * 0.03));
        ctx.stroke();
      }
      ctx.fillStyle = '#f2c184';
      ctx.fillRect(0, h * 0.73, w, h * 0.27);
      palm(ctx, w * 0.16, h * 0.98, w / 480, 0.22);
      palm(ctx, w * 0.86, h * 0.98, w / 540, -0.2);
      /* umbrella + ball */
      ctx.fillStyle = '#ff2e88';
      ctx.beginPath(); ctx.arc(w * 0.58, h * 0.82, w * 0.09, Math.PI, 0); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#1d0b26'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(w * 0.58, h * 0.82); ctx.lineTo(w * 0.58, h * 0.95); ctx.stroke();
      ctx.fillStyle = '#00e5ff';
      ctx.beginPath(); ctx.arc(w * 0.72, h * 0.93, w * 0.035, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillRect(w * 0.72 - w * 0.035, h * 0.93 - 2, w * 0.07, 4);
    }
    return canvas;
  }

  function makeSample(variant, seed) {
    var c = document.createElement('canvas');
    c.width = 720; c.height = 900;
    return paintSample(c, variant, seed);
  }

  /* ------------------------------------------------------------------ */
  /* Cover drawing.                                                     */
  /* ------------------------------------------------------------------ */

  function drawPanel(ctx, x, y, cw, ch, panel, grade) {
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, cw, ch); ctx.clip();
    var src = panel && panel.src;
    if (src) {
      var iw = src.naturalWidth || src.width;
      var ih = src.naturalHeight || src.height;
      var zoom = (panel.zoom || 1);
      var scale = Math.max(cw / iw, ch / ih) * zoom;
      var dw = iw * scale, dh = ih * scale;
      var dx = x + (cw - dw) / 2 + (panel.ox || 0) * cw;
      var dy = y + (ch - dh) / 2 + (panel.oy || 0) * ch;
      ctx.drawImage(src, dx, dy, dw, dh);
    } else {
      var g = ctx.createLinearGradient(x, y, x, y + ch);
      g.addColorStop(0, grade.top); g.addColorStop(0.55, grade.mid); g.addColorStop(1, grade.bottom);
      ctx.fillStyle = g; ctx.fillRect(x, y, cw, ch);
      sun(ctx, x + cw * 0.5, y + ch * 0.4, Math.min(cw, ch) * 0.16, '#fff3c4');
    }
    /* grade wash + vignette per panel */
    ctx.fillStyle = grade.wash;
    ctx.fillRect(x, y, cw, ch);
    var vg = ctx.createRadialGradient(x + cw / 2, y + ch / 2, Math.min(cw, ch) * 0.35,
      x + cw / 2, y + ch / 2, Math.max(cw, ch) * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(10,2,24,0.42)');
    ctx.fillStyle = vg;
    ctx.fillRect(x, y, cw, ch);
    ctx.restore();
  }

  function outlinedText(ctx, text, cx, y, font, fill, strokeW) {
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(10,2,20,0.92)';
    ctx.lineWidth = strokeW;
    ctx.strokeText(text, cx, y);
    ctx.fillStyle = fill;
    ctx.fillText(text, cx, y);
  }

  function drawCover(ctx, W, H, state) {
    var grade = GRADES[state.grade] || GRADES[0];
    var layout = LAYOUTS[state.layout] || LAYOUTS['6'];
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0d0221';
    ctx.fillRect(0, 0, W, H);

    var gutter = Math.max(4, Math.round(W * 0.008));
    var cols = layout.cols, rows = layout.rows;
    var cw = (W - gutter * (cols + 1)) / cols;
    var ch = (H - gutter * (rows + 1)) / rows;
    var total = cols * rows;
    for (var i = 0; i < total; i++) {
      var col = i % cols, row = Math.floor(i / cols);
      drawPanel(ctx,
        gutter + col * (cw + gutter), gutter + row * (ch + gutter),
        cw, ch, state.panels[i], grade);
    }

    /* neon frame */
    ctx.save();
    ctx.strokeStyle = grade.glow;
    ctx.globalAlpha = 0.85;
    ctx.lineWidth = Math.max(3, W * 0.004);
    ctx.shadowColor = grade.glow;
    ctx.shadowBlur = W * 0.02;
    ctx.strokeRect(gutter / 2, gutter / 2, W - gutter, H - gutter);
    ctx.restore();

    /* caption block: subtitle, bold outlined title, accent rule */
    var title = (state.title || '').toUpperCase();
    var sub = (state.subtitle || '').toUpperCase();
    var titleSize = Math.round(W * (layout.cols === 1 ? 0.115 : 0.105));
    var subSize = Math.round(W * 0.032);
    var pad = Math.round(W * 0.045);
    var titleY = H - Math.round(H * 0.055);
    var bandH = titleSize + subSize + Math.round(H * 0.045);
    var bandY = H - bandH - Math.round(H * 0.02);
    var bg = ctx.createLinearGradient(0, bandY, 0, H);
    bg.addColorStop(0, 'rgba(8,1,20,0)');
    bg.addColorStop(1, 'rgba(8,1,20,0.82)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, bandY, W, H - bandY);

    if (sub) {
      try { ctx.letterSpacing = Math.round(W * 0.006) + 'px'; } catch (e) { /* older canvas */ }
      outlinedText(ctx, sub, W / 2, titleY - titleSize - Math.round(H * 0.008),
        '700 ' + subSize + 'px "Arial Black", Arial, sans-serif', grade.accent, Math.max(2, subSize * 0.14));
      try { ctx.letterSpacing = '0px'; } catch (e) { /* older canvas */ }
    }
    if (title) {
      try { ctx.letterSpacing = Math.round(W * 0.004) + 'px'; } catch (e) { /* older canvas */ }
      outlinedText(ctx, title, W / 2, titleY,
        '900 ' + titleSize + 'px "Arial Black", Arial, sans-serif', '#ffffff', Math.max(4, titleSize * 0.16));
      try { ctx.letterSpacing = '0px'; } catch (e) { /* older canvas */ }
      ctx.fillStyle = grade.accent;
      ctx.fillRect(W / 2 - W * 0.09, titleY + Math.round(H * 0.012), W * 0.18, Math.max(3, H * 0.005));
    }

    /* badge: starburst circle, top right */
    var badge = (state.badge || '').trim();
    if (badge) {
      var br = Math.round(W * 0.052);
      var bx = W - br - Math.round(W * 0.035);
      var by = br + Math.round(H * 0.03);
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(-0.12);
      ctx.fillStyle = grade.accent;
      ctx.shadowColor = grade.glow;
      ctx.shadowBlur = W * 0.015;
      ctx.beginPath();
      for (var k = 0; k < 16; k++) {
        var ang = (k / 16) * Math.PI * 2;
        var r = (k % 2 === 0) ? br : br * 0.82;
        var px = Math.cos(ang) * r, py = Math.sin(ang) * r;
        if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath(); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#14041f';
      ctx.font = '900 ' + Math.round(br * 0.62) + 'px "Arial Black", Arial, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(badge, 0, 1);
      ctx.restore();
    }
  }

  function exportCover(state, sizeKey) {
    var size = SIZES[sizeKey] || SIZES['1080x1350'];
    var c = document.createElement('canvas');
    c.width = size.w; c.height = size.h;
    drawCover(c.getContext('2d'), size.w, size.h, state);
    return c;
  }

  window.NeonCover = {
    GRADES: GRADES,
    LAYOUTS: LAYOUTS,
    SIZES: SIZES,
    makeSample: makeSample,
    paintSample: paintSample,
    drawCover: drawCover,
    exportCover: exportCover
  };
})();
