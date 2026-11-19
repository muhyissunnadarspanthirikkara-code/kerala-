/* Kerala Open World – style.js
   "3D Stylized Low-Poly / Voxel Hybrid" look. Does NOT touch heights/collision, only appearance.
   setup()  -> call right after lights are created.
   finish() -> call once the world is built, before the render loop starts. */
(function () {
  const done = new WeakSet();
  const mute = (c, k) => { const h = {}; c.getHSL(h); c.setHSL(h.h, Math.min(1, h.s * k), h.l * .98); };
  window.KStyle = {
    setup({ THREE, R, sun }) {
      R.shadowMap.type = THREE.PCFSoftShadowMap;     // softer, less jagged shadows
      sun.shadow.bias = -.0006; sun.shadow.normalBias = .06; // removes shadow acne stripes
    },
    finish({ S, gw, gh }) {
      S.traverse(o => {
        if (!o.isMesh || !o.material) return;
        (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => {
          if (done.has(m) || !m.isMeshStandardMaterial || m.map || m.transparent || m.vertexColors) return;
          done.add(m); if (m.color) mute(m.color, .86);   // less candy-saturated, more painterly
        });
        const g = o.geometry, ca = g && g.attributes && g.attributes.color;
        if (ca && ca.count === gw * gh && !done.has(g)) {  // terrain: blocky patchwork + colour bands
          done.add(g);
          const a = ca.array, q = v => Math.round(v * 12) / 12;
          for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
            const k = (j * gw + i) * 3, hsh = ((((i >> 1) * 73856093) ^ ((j >> 1) * 19349663)) >>> 0) % 1000 / 1000, f = .93 + .11 * hsh;
            const r = a[k] * f, gr = a[k + 1] * f, b = a[k + 2] * f, av = (r + gr + b) / 3;
            a[k] = q(av + (r - av) * .88); a[k + 1] = q(av + (gr - av) * .88); a[k + 2] = q(av + (b - av) * .88);
          }
          ca.needsUpdate = true;
        }
      });
    }
  };
})();
