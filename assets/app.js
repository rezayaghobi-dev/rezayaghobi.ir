/* Progress line, reveals, diagram draw. No dependencies. */
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
  } catch (err) {
    root.classList.remove("anims");
  }
})();
