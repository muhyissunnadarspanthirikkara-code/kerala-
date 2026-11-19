/* Kerala Open World – fixes.js
   Safe, game-independent glitch fixes. Call KFix.apply({THREE,R,S,cam}) after the world is built. */
(function () {
  // three r128 culls InstancedMesh by ONE instance at the origin -> trees/lamps vanish or pop in/out. Disable that culling.
  const fixCull = S => S.traverse(o => { if (o.isInstancedMesh) o.frustumCulled = false; });
  window.KFix = {
    apply({ R, S, cam }) {
      fixCull(S); setTimeout(() => fixCull(S), 3000);
      R.domElement.addEventListener('webglcontextlost', e => {
        e.preventDefault(); const h = document.getElementById('hint');
        if (h) { h.textContent = '⚠ ഗ്രാഫിക്സ് നഷ്ടമായി – പേജ് റീലോഡ് ചെയ്യുക'; h.style.display = 'block'; }
      });
      // phones: the original only listens to 'resize', which often fires with stale sizes after rotation
      addEventListener('orientationchange', () => setTimeout(() => {
        R.setSize(innerWidth, innerHeight); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix();
      }, 250));
      // adaptive resolution: drops pixel ratio when FPS is low (lag/stutter), raises it again when smooth
      const max = Math.min(devicePixelRatio || 1, 1.5); let pr = R.getPixelRatio(), f = 0, t0 = performance.now();
      document.addEventListener('visibilitychange', () => { f = 0; t0 = performance.now(); });
      (function tick(t) {
        requestAnimationFrame(tick); f++;
        if (t - t0 < 2000) return;
        const fps = f * 1000 / (t - t0); f = 0; t0 = t;
        if (document.hidden) return;
        let n = pr; if (fps < 38) n = Math.max(.6, pr - .15); else if (fps > 56) n = Math.min(max, pr + .1);
        if (Math.abs(n - pr) > .01) { pr = n; R.setPixelRatio(pr); R.setSize(innerWidth, innerHeight); }
      })(performance.now());
    }
  };
})();
