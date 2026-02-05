/* =========================
   LL Office – script.js (clean)
   ========================= */

/* Helpers */
const qs = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* 1) Beispiel-Galerie (Click / Touch / Keyboard) */
qsa("[data-cycle]").forEach((cycle) => {
  const images = qsa(".example-image", cycle);
  if (!images.length) return;

  let currentIndex = images.findIndex((img) => img.classList.contains("is-active"));
  if (currentIndex < 0) currentIndex = 0;

  const setActive = (index) => {
    images.forEach((img, i) => {
      img.classList.toggle("is-active", i === index);
      img.setAttribute("aria-hidden", i === index ? "false" : "true");
    });
  };

  const media = qs(".example-media", cycle) || cycle;
  media.setAttribute("role", "button");
  media.setAttribute("tabindex", "0");
  media.setAttribute("aria-label", "Beispielbilder wechseln");

  const next = () => {
    currentIndex = (currentIndex + 1) % images.length;
    setActive(currentIndex);
  };
  const prev = () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    setActive(currentIndex);
  };

  media.addEventListener("click", next);

  media.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      next();
    }
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  });

  setActive(currentIndex);
});

/* 2) Returning Visitor Flag (optional, nicht personenbezogen) */
(() => {
  try {
    const key = "lloffice_returning";
    if (localStorage.getItem(key) === "1") document.documentElement.classList.add("is-returning");
    else localStorage.setItem(key, "1");
  } catch (_) {
    // ignore storage errors
  }
})();

/* 3) Desktop CTA: folgt beim Scrollen */
(() => {
  const bar = qs(".desktop-cta");
  if (!bar) return;

  bar.style.opacity = "1";
  bar.style.pointerEvents = "auto";
  bar.style.transform = "translateY(0)";
})();

/* 4) Footer Year */
(() => {
  const y = qs("#year");
  if (y) y.textContent = String(new Date().getFullYear());
})();

/* 5) Scroll To Top */
(() => {
  const btn = qs(".scroll-top");
  if (!btn) return;

  const toggleVisibility = () => {
    btn.classList.toggle("is-visible", window.scrollY > 300);
  };

  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  window.addEventListener("scroll", toggleVisibility, { passive: true });
  toggleVisibility();
})();

/* 6) FAQ Accordion */
(() => {
  const faqList = qs("[data-faq]");
  if (!faqList) return;

  const items = qsa(".faq-item", faqList);
  const closeAll = () => {
    items.forEach((item) => {
      item.classList.remove("is-open");
      const button = qs(".faq-question", item);
      const answer = qs(".faq-answer", item);
      if (button) button.setAttribute("aria-expanded", "false");
      if (answer) answer.style.maxHeight = "0px";
    });
    faqList.classList.remove("is-active");
  };

  items.forEach((item) => {
    const button = qs(".faq-question", item);
    const answer = qs(".faq-answer", item);
    if (!button) return;

    button.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");
      closeAll();

      if (!isOpen) {
        item.classList.add("is-open");
        button.setAttribute("aria-expanded", "true");
        faqList.classList.add("is-active");
        if (answer) answer.style.maxHeight = `${answer.scrollHeight}px`;
      }
    });
  });
})();

/* 7) Theme Engine (clean, no conflicts)
   - Default: system preference
   - Optional auto-by-time: enabled by default (can disable after manual toggle)
*/
(() => {
  const root = document.documentElement;
  const toggle = qs(".theme-toggle");
  if (!toggle) return;

  const STORAGE_THEME = "theme";
  const STORAGE_MODE = "theme-mode"; // "auto" | "manual"

  const systemPrefersLight = () => window.matchMedia("(prefers-color-scheme: light)").matches;

  const themeByTime = () => {
    const hour = new Date().getHours();
    return hour >= 7 && hour < 19 ? "light" : "dark";
  };

  const applyTheme = (theme, animate = false) => {
    if (animate) {
      toggle.classList.add("is-animating");
      setTimeout(() => toggle.classList.remove("is-animating"), 350);
    }
    root.setAttribute("data-theme", theme);
    toggle.textContent = theme === "light" ? "🌞" : "🌙";
  };

  const init = () => {
    let mode = "auto";
    try {
      mode = localStorage.getItem(STORAGE_MODE) || "auto";
    } catch (_) {
      // ignore storage errors
    }

    if (mode === "manual") {
      let saved = null;
      try {
        saved = localStorage.getItem(STORAGE_THEME);
      } catch (_) {
        // ignore storage errors
      }
      applyTheme(saved || (systemPrefersLight() ? "light" : "dark"));
      return;
    }

    // auto mode
    applyTheme(themeByTime() || (systemPrefersLight() ? "light" : "dark"));
    try {
      localStorage.setItem(STORAGE_MODE, "auto");
    } catch (_) {
      // ignore storage errors
    }
  };

  init();

  toggle.addEventListener("click", () => {
    const current = root.getAttribute("data-theme") || "dark";
    const next = current === "light" ? "dark" : "light";

    applyTheme(next, true);

    try {
      localStorage.setItem(STORAGE_THEME, next);
      localStorage.setItem(STORAGE_MODE, "manual");
    } catch (_) {
      // ignore storage errors
    }
  });

  // Auto refresh every 10 min (only if auto mode)
  setInterval(() => {
    let mode = "auto";
    try {
      mode = localStorage.getItem(STORAGE_MODE) || "auto";
    } catch (_) {
      // ignore storage errors
    }
    if (mode !== "auto") return;

    const t = themeByTime();
    if (t !== root.getAttribute("data-theme")) applyTheme(t, true);
  }, 600000);
})();