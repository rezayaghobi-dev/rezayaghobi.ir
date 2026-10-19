/* Progress line, reveals, diagram draw, space backdrop. No dependencies. */
(function () {
  var root = document.documentElement;
  root.classList.add("anims");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canObserve = "IntersectionObserver" in window;

  function reveal(target, threshold) {
    var nodes = [].slice.call(
      typeof target == "string" ? document.querySelectorAll(target) : target
    );
    if (!canObserve || reduce) {
      nodes.forEach(function (n) { n.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { threshold: threshold, rootMargin: "0px 0px -6% 0px" });
    nodes.forEach(function (n) { io.observe(n); });
  }

  var bar = document.querySelector(".progress");
  var waiting = false;
  var groups = document.querySelectorAll(
    ".tiles, .chips, .ladder, .courses, .cert-gallery, .work-list, .timeline, .contact-rows"
  );

  function paint() {
    waiting = false;
    if (!bar) return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? window.scrollY / max : 0;
    bar.style.transform = "scaleX(" + Math.min(1, Math.max(0, p)) + ")";
  }

  function queue() {
    if (waiting) return;
    waiting = true;
    window.requestAnimationFrame(paint);
  }

  function makeSpace() {
    var space = document.createElement("div");
    space.className = "space";
    var w = window.innerWidth;
    var h = window.innerHeight;

    var starCount = w < 700 ? 80 : 150;
    var stars = [];
    for (var i = 0; i < starCount; i++) {
      var s = document.createElement("div");
      s.className = "space__star";
      var size = 0.8 + Math.random() * 1.6;
      var base = 0.2 + Math.random() * 0.55;
      s.style.width = size + "px";
      s.style.height = size + "px";
      s.style.boxShadow = "0 0 " + (size * 2) + "px rgba(255,255,255," + (base * 0.5) + ")";
      space.appendChild(s);
      stars.push({
        el: s,
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 1.4,
        vy: (Math.random() - 0.5) * 1.4,
        base: base,
        phase: Math.random() * Math.PI * 2,
        twinkle: 0.3 + Math.random() * 0.5
      });
    }

    var nebulae = [
      { x: 0.18, y: 0.30, rx: 38, ry: 22, angle: -20, c1: "120,150,255", c2: "80,200,200", strength: 0.5 },
      { x: 0.78, y: 0.22, rx: 30, ry: 44, angle: 160, c1: "180,120,255", c2: "240,150,120", strength: 0.4 },
      { x: 0.55, y: 0.78, rx: 46, ry: 26, angle: 70, c1: "150,210,255", c2: "120,240,180", strength: 0.45 }
    ];

    nebulae.forEach(function (n, idx) {
      var el = document.createElement("div");
      el.className = "space__nebula";
      el.style.width = (n.rx * 2.6) + "%";
      el.style.height = (n.ry * 2.6) + "%";
      el.style.left = (n.x * 100 - n.rx * 1.3) + "%";
      el.style.top = (n.y * 100 - n.ry * 1.3) + "%";
      el.style.background =
        "radial-gradient(ellipse at center, rgba(" + n.c1 + "," + (0.22 * n.strength) +
        "), rgba(" + n.c2 + "," + (0.16 * n.strength) + "), transparent 70%)";
      n.el = el;
      n.seed = idx * 19.1;
      n.amp = 1.6;
      space.appendChild(el);
    });

    document.body.appendChild(space);

    function place(star) {
      star.el.style.transform =
        "translate3d(" + star.x.toFixed(1) + "px," + star.y.toFixed(1) + "px,0)";
    }

    function placeNebula(n, t) {
      var dx = Math.sin(t * 0.25 + n.seed) * n.amp;
      var dy = Math.cos(t * 0.20 + n.seed * 0.7) * n.amp;
      n.el.style.transform =
        "translate3d(" + dx.toFixed(2) + "vw," + dy.toFixed(2) + "vh,0) rotate(" + n.angle + "deg)";
      n.el.style.opacity = 0.09 + 0.03 * Math.sin(t * 0.4 + n.seed);
    }

    if (reduce) {
      for (var k = 0; k < stars.length; k++) {
        place(stars[k]);
        stars[k].el.style.opacity = stars[k].base;
      }
      nebulae.forEach(function (n) { placeNebula(n, 0); });
      window.addEventListener("resize", function () {
        w = window.innerWidth;
        h = window.innerHeight;
        for (var k = 0; k < stars.length; k++) {
          if (stars[k].x > w) stars[k].x = Math.random() * w;
          if (stars[k].y > h) stars[k].y = Math.random() * h;
          place(stars[k]);
        }
      }, { passive: true });
      return;
    }

    var last = performance.now();
    function frame(now) {
      var dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      var t = now * 0.00005;

      for (var k = 0; k < stars.length; k++) {
        var st = stars[k];
        st.x += st.vx * dt;
        st.y += st.vy * dt;
        if (st.x < -4) st.x += w + 8;
        else if (st.x > w + 4) st.x -= w + 8;
        if (st.y < -4) st.y += h + 8;
        else if (st.y > h + 4) st.y -= h + 8;
        place(st);
        st.el.style.opacity =
          st.base * (0.65 + 0.35 * Math.sin(t * st.twinkle * 12 + st.phase));
      }

      for (var j = 0; j < nebulae.length; j++) placeNebula(nebulae[j], t);

      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    window.addEventListener("resize", function () {
      w = window.innerWidth;
      h = window.innerHeight;
    }, { passive: true });
  }

  try {
    [].forEach.call(groups, function (group) {
      [].forEach.call(group.children, function (item, i) {
        item.style.setProperty("--i", Math.min(i, 6));
      });
    });
    reveal(".reveal", 0.08);
    reveal(".diagram", 0.22);
    reveal(groups, 0.12);
    if (bar && !reduce) {
      window.addEventListener("scroll", queue, { passive: true });
      window.addEventListener("resize", queue, { passive: true });
      paint();
    }
    makeSpace();
  } catch (err) {
    root.classList.remove("anims");
  }
})();
