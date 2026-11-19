/* Kerala Open World – characters.js  (v2, Kerala-Horizon style)
   Realistic-proportion Stylized Low-Poly / Voxel Hybrid humans: tapered 4-sided limbs, faceted head, ELBOW + KNEE joints.
   Every limb segment is ONE merged vertex-coloured mesh -> ~11 meshes per person.
   g.userData.l = [armL, armR, legL, legR] (shoulder y=1.5 / hip y=.86) – same skeleton as the old game, so weapons,
   driving, sitting, climbing and dancing code keep working. Elbows/knees bend automatically from the limb angle (pose). */
(function () {
  const shade = (h, f) => (Math.min(255, ((h >> 16) & 255) * f) << 16) | (Math.min(255, ((h >> 8) & 255) * f) << 8) | Math.min(255, (h & 255) * f);
  function Part(T) { this.T = T; this.p = []; this.n = []; this.i = []; this.c = []; }
  Part.prototype.add = function (g, hex) {
    const pa = g.attributes.position.array, na = g.attributes.normal.array, ia = g.index.array, b = this.p.length / 3;
    const r = ((hex >> 16) & 255) / 255, gr = ((hex >> 8) & 255) / 255, bl = (hex & 255) / 255;
    for (let k = 0; k < pa.length; k++) { this.p.push(pa[k]); this.n.push(na[k]); }
    for (let k = 0; k < pa.length; k += 3) this.c.push(r, gr, bl);
    for (let k = 0; k < ia.length; k++) this.i.push(ia[k] + b);
    g.dispose(); return this;
  };
  Part.prototype.box = function (w, h, d, x, y, z, hex) { const g = new this.T.BoxGeometry(w, h, d); g.translate(x, y, z); return this.add(g, hex); };
  // tapered 4-sided prism hanging down from (x,y,z); tw/bw = top/bottom width, td = depth/width ratio
  Part.prototype.limb = function (tw, bw, len, td, x, y, z, hex) {
    const g = new this.T.CylinderGeometry(tw * .7071, bw * .7071, len, 4, 1, false);
    g.rotateY(Math.PI / 4); g.scale(1, 1, td); g.translate(x, y - len / 2, z); return this.add(g, hex);
  };
  let MAT = null;
  Part.prototype.mesh = function (parent) {
    const T = this.T, g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(this.p, 3));
    g.setAttribute('normal', new T.Float32BufferAttribute(this.n, 3));
    g.setAttribute('color', new T.Float32BufferAttribute(this.c, 3));
    g.setIndex(this.i);
    MAT = MAT || new T.MeshStandardMaterial({ vertexColors: true, roughness: .85, metalness: 0, flatShading: true });
    const m = new T.Mesh(g, MAT); m.castShadow = true; parent.add(m); return m;
  };
  // elbows bend with arm raise, knees bend when a leg swings forward (sitting / driving) or back (walking)
  function pose(g) {
    const u = g.userData, l = u.l, j = u.j; if (!j) return;
    for (let i = 0; i < 2; i++) {
      j.e[i].rotation.x = -(.18 + Math.min(.9, Math.max(0, -l[i].rotation.x) * .45));
      const t = l[i + 2].rotation.x; j.k[i].rotation.x = t < 0 ? Math.min(1.5, -t * .9) : t * .55;
    }
  }
  function build(T, o) {
    const g = new T.Group(), sk = o.skin, hr = o.hair, top2 = o.jacket || o.top, lungi = o.bottom === 0xf2f2f2 || !!o.lungi;
    const B = new Part(T);
    B.box(.5, .22, .3, 0, .93, 0, o.bottom).box(.51, .05, .31, 0, 1.05, 0, lungi ? 0xd8d0bf : 0x2b2118)
      .limb(.56, .46, .54, .55, 0, 1.58, 0, o.top).box(.7, .1, .3, 0, 1.6, 0, o.top)           // tapered chest + shoulders
      .box(.13, .1, .13, 0, 1.7, 0, sk).box(.22, .03, .2, 0, 1.66, 0, shade(o.top, .8))           // neck + collar
      .box(.27, .2, .28, 0, 1.95, 0, sk).box(.23, .1, .25, 0, 1.8, -.005, sk)                    // faceted head: skull + jaw
      .box(.3, .1, .31, 0, 2.07, -.005, hr).box(.3, .22, .08, 0, 1.93, -.16, hr)
      .box(.03, .16, .2, -.145, 1.98, -.02, hr).box(.03, .16, .2, .145, 1.98, -.02, hr).box(.29, .05, .06, 0, 2.03, .14, hr)
      .box(.03, .07, .05, -.15, 1.9, 0, shade(sk, .92)).box(.03, .07, .05, .15, 1.9, 0, shade(sk, .92))
      .box(.05, .03, .01, -.065, 1.93, .141, 0xffffff).box(.05, .03, .01, .065, 1.93, .141, 0xffffff)
      .box(.026, .03, .01, -.065, 1.93, .146, 0x1a1210).box(.026, .03, .01, .065, 1.93, .146, 0x1a1210)
      .box(.065, .015, .01, -.065, 1.97, .143, hr).box(.065, .015, .01, .065, 1.97, .143, hr)
      .box(.04, .06, .04, 0, 1.88, .15, shade(sk, .9)).box(.08, .015, .01, 0, 1.82, .127, 0x7a3b2e);
    if (o.beard) B.box(.24, .07, .06, 0, 1.78, .1, hr).box(.1, .02, .02, 0, 1.855, .145, hr);
    if (o.glasses) B.box(.21, .04, .012, 0, 1.93, .153, 0x050505);
    if (o.pack) B.box(.46, .5, .24, 0, 1.4, -.29, 0xf2b01e).box(.34, .18, .06, 0, 1.25, -.43, 0xd89410)
      .box(.06, .5, .02, -.15, 1.42, .165, 0xd89410).box(.06, .5, .02, .15, 1.42, .165, 0xd89410);
    const bm = B.mesh(g); bm.onBeforeRender = () => pose(g);
    const arm = x => {
      const p = new T.Group(); p.position.set(x, 1.5, 0); g.add(p);
      new Part(T).limb(.19, .16, .38, 1, 0, .06, 0, top2).mesh(p);
      const e = new T.Group(); e.position.y = -.32; p.add(e);
      new Part(T).limb(.16, .13, .28, 1, 0, 0, 0, o.jacket ? top2 : sk).box(.14, .1, .15, 0, -.33, .01, sk).mesh(e);
      return [p, e];
    };
    const leg = x => {
      const p = new T.Group(); p.position.set(x, .86, 0); g.add(p);
      new Part(T).limb(.24, .2, .42, 1, 0, 0, 0, o.bottom).mesh(p);
      const k = new T.Group(); k.position.y = -.42; p.add(k);
      new Part(T).limb(.2, .16, .2, 1, 0, 0, 0, o.bottom).limb(.16, .15, .08, 1, 0, -.2, 0, lungi ? sk : o.bottom)
        .box(.23, .1, .36, 0, -.33, .06, o.shoes).mesh(k);
      return [p, k];
    };
    const a0 = arm(-.38), a1 = arm(.38), l0 = leg(-.13), l1 = leg(.13);
    g.userData.l = [a0[0], a1[0], l0[0], l1[0]]; g.userData.j = { e: [a0[1], a1[1]], k: [l0[1], l1[1]] };
    pose(g); return g;
  }
  window.KChars = { build, pose };
})();
