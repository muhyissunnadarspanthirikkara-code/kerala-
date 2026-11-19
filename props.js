/* Kerala Open World – props.js : voxel-hybrid coconut palms, kettuvallam houseboats, stylised voxel clouds */
(function () {
  function merge(T, items) {
    const P = [], N = [], C = [], I = [];
    items.forEach(([g, hex]) => {
      const pa = g.attributes.position.array, na = g.attributes.normal.array, b = P.length / 3;
      const r = ((hex >> 16) & 255) / 255, gr = ((hex >> 8) & 255) / 255, bl = (hex & 255) / 255;
      for (let k = 0; k < pa.length; k++) { P.push(pa[k]); N.push(na[k]); }
      for (let k = 0; k < pa.length; k += 3) C.push(r, gr, bl);
      if (g.index) { const ia = g.index.array; for (let k = 0; k < ia.length; k++) I.push(ia[k] + b); }
      else for (let k = 0; k < pa.length / 3; k++) I.push(b + k);
      g.dispose();
    });
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new T.Float32BufferAttribute(N, 3));
    g.setAttribute('color', new T.Float32BufferAttribute(C, 3)); g.setIndex(I); return g;
  }
  // stepped 5-sided trunk + 9 faceted two-segment drooping fronds + cube coconuts, ~9 high
  function palm(T) {
    const it = [];
    for (let k = 0; k < 5; k++) {
      const g = new T.CylinderGeometry(.27 - .03 * (k + 1), .27 - .03 * k, 1.8, 5); g.translate(.1 * k, k * 1.8 + .9, 0);
      it.push([g, k % 2 ? 0x7a6247 : 0x6b5238]);
    }
    const cx = .5, cy = 9;
    for (let f = 0; f < 9; f++) {
      const a = f / 9 * Math.PI * 2, c1 = f % 2 ? 0x3fb83a : 0x2f9e44, d1 = .35, L1 = 2.2, d2 = .9, L2 = 1.5;
      const s1 = new T.BoxGeometry(.55, .08, L1); s1.translate(0, 0, L1 / 2); s1.rotateX(d1); s1.rotateY(a); s1.translate(cx, cy, 0);
      const s2 = new T.BoxGeometry(.4, .06, L2); s2.translate(0, 0, L2 / 2); s2.rotateX(d2); s2.translate(0, -L1 * Math.sin(d1), L1 * Math.cos(d1)); s2.rotateY(a); s2.translate(cx, cy, 0);
      it.push([s1, c1], [s2, 0x2a8a3a]);
    }
    for (let k = 0; k < 3; k++) { const g = new T.BoxGeometry(.36, .36, .36); g.rotateY(k); g.translate(cx + .35 * Math.cos(k * 2.1), cy - .35, .35 * Math.sin(k * 2.1)); it.push([g, 0x5c3a21]); }
    return merge(T, it);
  }
  function houseboat(T) {
    const g = new T.Group(), m = (c, e) => new T.MeshStandardMaterial({ color: c, roughness: .85, flatShading: true, emissive: e || 0, emissiveIntensity: e ? .5 : 0 });
    const add = (geo, mat, x, y, z) => { const o = new T.Mesh(geo, mat); o.position.set(x, y, z); o.castShadow = true; g.add(o); return o; };
    add(new T.BoxGeometry(3.4, .9, 10.2), m(0x5c3a21), 0, .25, 0); add(new T.BoxGeometry(2.4, .85, 2), m(0x5c3a21), 0, .35, 5.8);
    const cn = add(new T.CylinderGeometry(1.7, 1.7, 6.8, 6, 1, false, 0, Math.PI), m(0xd4a373), 0, .72, -.4); cn.rotation.z = Math.PI / 2; cn.rotation.y = Math.PI / 2;
    add(new T.BoxGeometry(3.46, .45, 4.2), m(0xfef08a, 0xf59e0b), 0, 1.15, -.4); add(new T.BoxGeometry(3.5, .24, 2.2), m(0x8d6e42), 0, .85, 4.2);
    for (const s of [-1, 1]) add(new T.BoxGeometry(.12, 1.2, .12), m(0x8d6e42), s * 1.6, 1.4, 3.3);
    return g;
  }
  window.KProps = {
    palm,
    houseboats(T, S, D) {   // a few kettuvallams moored on the longest rivers
      let n = 0;
      (D.rivers || []).forEach((r, ri) => {
        const c = r.p.length / 3; if (c < 30 || n >= 8) return;
        const i = Math.floor(c * (.35 + .2 * (ri % 3))), a = Math.max(0, i - 2), b = Math.min(c - 1, i + 2), g = houseboat(T);
        g.position.set(r.p[3 * i], r.p[3 * i + 1] + .15, r.p[3 * i + 2]); g.rotation.y = Math.atan2(r.p[3 * b] - r.p[3 * a], r.p[3 * b + 2] - r.p[3 * a + 2]); S.add(g); n++;
      });
    },
    clouds(T, S, getP, getBg) {   // world-fixed stepped voxel clouds that drift and wrap around the player
      const mat = new T.MeshBasicMaterial({ color: 0xffffff, fog: false, transparent: true, opacity: .93, depthWrite: false }), cl = [];
      const rnd = s => { const x = Math.sin(s * 127.1) * 43758.5453; return x - Math.floor(x); };
      for (let i = 0; i < 18; i++) {
        const g = new T.Group(), n = 3 + i % 3;
        for (let k = 0; k < n; k++) { const w = 20 - k * 4 + rnd(i + k) * 6, o = new T.Mesh(new T.BoxGeometry(w, 4, 11 - k * 1.5), mat); o.position.set((rnd(i * 3 + k) - .5) * 8, k * 3.2, (rnd(i * 7 + k) - .5) * 6); g.add(o); }
        S.add(g); cl.push({ g, wx: rnd(i) * 3000, wz: rnd(i + 50) * 3000, y: 80 + rnd(i + 9) * 28, sp: 1.5 + rnd(i + 3) * 2 });
      }
      const col = new T.Color(), W = new T.Color(0xffffff); let last = performance.now();
      (function tick(t) {
        requestAnimationFrame(tick); const dt = Math.min(.1, (t - last) / 1000); last = t; const P = getP(); if (!P) return;
        cl.forEach(c => {
          c.wx += c.sp * dt; const dx = (((c.wx - P.x) % 340) + 340) % 340 - 170, dz = (((c.wz - P.z) % 340) + 340) % 340 - 170;
          c.g.position.set(P.x + dx, c.y, P.z + dz); c.g.scale.setScalar(Math.max(.01, Math.min(1, (165 - Math.hypot(dx, dz)) / 40)));
        });
        col.copy(getBg()).lerp(W, .55); mat.color.copy(col);
      })(performance.now());
    }
  };
})();
