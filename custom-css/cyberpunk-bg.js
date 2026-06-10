/* ============================================================================
   Cyberpunk Neon — animated backdrop injected into VS Code via Custom CSS+JS
   (be5invis.vscode-custom-css runs this file in the workbench renderer)

   Strategy: append a fixed full-window <canvas> at z-index 0, behind all UI.
   The companion CSS (cyberpunk-bg.css) makes the workbench / editor / terminal
   backgrounds transparent so this animation shows through. A dark veil is drawn
   on top of the motion so code & terminal text stay readable.
   ============================================================================ */
(function () {
  "use strict";
  if (window.__cyberpunkBG) return;          // guard against double-injection
  window.__cyberpunkBG = true;

  function boot() {
    if (!document.body) { return setTimeout(boot, 200); }
    if (document.getElementById("cyberpunk-bg")) return;

    var canvas = document.createElement("canvas");
    canvas.id = "cyberpunk-bg";
    canvas.style.cssText =
      "position:fixed;inset:0;width:100vw;height:100vh;z-index:0;" +
      "pointer-events:none;display:block;";
    document.body.prepend(canvas);

    var ctx = canvas.getContext("2d");
    var W = 0, H = 0, DPR = 1, HORIZON = 0, CX = 0;

    var C = {
      void: "#05060d", deep: "#0c0a22",
      magenta: "#ff2e97", pink: "#ff5cb0", cyan: "#00eaff",
      ice: "#7df9ff", purple: "#b46bff", blue: "#2b8bff",
    };
    var SPEED = 1.0, GRIDSPEED = 0.5, DIM = 0.20; // DIM = darkness veil over motion (readability)

    function hexRGBA(hex, a) {
      var n = parseInt(hex.slice(1), 16);
      return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
    }
    function rng(seed) {
      return function () {
        seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
        var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }

    var stars = [], waves = [];
    function build() {
      var r = rng(99); stars = [];
      var n = Math.round((W * H) / 14000);
      for (var i = 0; i < n; i++)
        stars.push({ x: r() * W, y: r() * HORIZON, s: r() * 1.2 + 0.2, p: r() * 6.28, sp: 0.4 + r() * 0.7,
                     c: r() < 0.5 ? C.ice : C.pink });
      waves = [];
      var pal = [C.magenta, C.cyan, C.purple, C.pink];
      for (var k = 0; k < 4; k++)
        waves.push({ color: pal[k % pal.length], baseY: 0.20 + k * 0.09, amp: 20 + k * 11,
                     freq: 0.6 + k * 0.18, speed: 0.25 + k * 0.12, phase: k * 1.3 });
    }

    var nebula = [
      { x: 0.20, y: 0.36, r: 0.62, c: C.magenta, a: 0.42, dx: 0.5, dy: 0.3 },
      { x: 0.80, y: 0.32, r: 0.58, c: C.cyan, a: 0.36, dx: -0.4, dy: 0.25 },
      { x: 0.50, y: 0.54, r: 0.78, c: C.purple, a: 0.40, dx: 0.3, dy: -0.2 },
      { x: 0.30, y: 0.66, r: 0.52, c: C.blue, a: 0.26, dx: -0.35, dy: -0.3 },
      { x: 0.70, y: 0.62, r: 0.56, c: C.pink, a: 0.26, dx: 0.25, dy: 0.2 },
    ];

    function resize() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * DPR; canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      HORIZON = H * 0.66; CX = W / 2;
      build();
    }
    window.addEventListener("resize", resize);

    var gridOff = 0, last = 0, running = true;
    function frame(now) {
      if (!running) return;
      var t = now / 1000 * SPEED;
      var dt = Math.min(0.05, (now - last) / 1000) || 0.016; last = now;
      ctx.clearRect(0, 0, W, H);

      // sky + floor base
      var sky = ctx.createLinearGradient(0, 0, 0, HORIZON);
      sky.addColorStop(0, C.void); sky.addColorStop(0.7, "#08081a"); sky.addColorStop(1, C.deep);
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, HORIZON);
      var fl = ctx.createLinearGradient(0, HORIZON, 0, H);
      fl.addColorStop(0, "#0a0820"); fl.addColorStop(1, C.void);
      ctx.fillStyle = fl; ctx.fillRect(0, HORIZON, W, H - HORIZON);

      // nebula
      ctx.globalCompositeOperation = "lighter";
      for (var i = 0; i < nebula.length; i++) {
        var b = nebula[i];
        var cx = (b.x + Math.sin(t * 0.07 * b.dx) * 0.04) * W;
        var cy = (b.y + Math.cos(t * 0.06 * b.dy) * 0.04) * HORIZON * 1.2;
        var rr = b.r * Math.min(W, H) * (0.9 + 0.1 * Math.sin(t * 0.2 + b.x));
        var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rr);
        g.addColorStop(0, hexRGBA(b.c, b.a)); g.addColorStop(1, hexRGBA(b.c, 0));
        ctx.fillStyle = g; ctx.fillRect(cx - rr, cy - rr, rr * 2, rr * 2);
      }
      // stars
      for (var s = 0; s < stars.length; s++) {
        var st = stars[s];
        var a = 0.45 + 0.5 * (0.5 + 0.5 * Math.sin(t * st.sp + st.p));
        ctx.fillStyle = hexRGBA(st.c, a);
        ctx.beginPath(); ctx.arc(st.x, st.y, st.s, 0, 6.2832); ctx.fill();
      }
      // flowing neon waves
      for (var w = 0; w < waves.length; w++) {
        var wv = waves[w], yBase = HORIZON * wv.baseY + HORIZON * 0.05;
        var passes = [[16, 0.10], [6, 0.24], [2, 1.0]];
        for (var pi = 0; pi < passes.length; pi++) {
          ctx.beginPath(); ctx.lineWidth = passes[pi][0];
          ctx.strokeStyle = hexRGBA(wv.color, passes[pi][1]); ctx.lineJoin = "round";
          for (var x = -10; x <= W + 10; x += 9) {
            var u = x / W;
            var y = yBase + Math.sin(u * 6.2832 * wv.freq + t * wv.speed + wv.phase) * wv.amp
                          + Math.sin(u * 6.2832 * wv.freq * 2.3 + t * wv.speed * 1.4) * wv.amp * 0.32;
            if (x < 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }
      // perspective grid floor
      gridOff += dt * GRIDSPEED * SPEED;
      var span = H - HORIZON, N = 20;
      for (var gi = 0; gi < N; gi++) {
        var fr = ((gi + (gridOff % 1)) / N), gy = HORIZON + span * fr * fr;
        ctx.strokeStyle = hexRGBA(C.cyan, (1 - fr) * 0.55); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
      }
      var M = 15, gap = (W * 1.6) / (M * 2);
      for (var vk = -M; vk <= M; vk++) {
        ctx.strokeStyle = hexRGBA(C.magenta, 0.36); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(CX, HORIZON); ctx.lineTo(CX + vk * gap, H); ctx.stroke();
      }
      ctx.strokeStyle = hexRGBA(C.ice, 0.85); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, HORIZON); ctx.lineTo(W, HORIZON); ctx.stroke();

      // readability veil
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = hexRGBA(C.void, DIM);
      ctx.fillRect(0, 0, W, H);

      requestAnimationFrame(frame);
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) running = false;
      else { running = true; last = performance.now(); requestAnimationFrame(frame); }
    });

    resize();
    requestAnimationFrame(frame);
  }

  boot();
})();
