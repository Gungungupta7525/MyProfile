/* ==========================================================================
   Gungun — Portfolio behaviour
   Progressive enhancement only: the site is fully readable with JS disabled.
   No dependencies.
   ========================================================================== */

(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------------------------------------------------------
     1. Theme
     The initial theme is applied by an inline script in <head> to avoid a
     flash of the wrong theme. This block only handles toggling + persistence.
     ---------------------------------------------------------------------- */

  function currentTheme() {
    return root.getAttribute("data-theme") || "dark";
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "light" ? "#f8fafc" : "#070a10");

    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.setAttribute(
        "aria-label",
        theme === "light" ? "Switch to dark theme" : "Switch to light theme"
      );
      btn.setAttribute("aria-pressed", String(theme === "light"));
    });

    try {
      localStorage.setItem("theme", theme);
    } catch (e) {
      /* storage blocked (private mode) — theme just won't persist */
    }
  }

  document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyTheme(currentTheme() === "light" ? "dark" : "light");
    });
  });

  // Keep multiple tabs in sync
  window.addEventListener("storage", function (e) {
    if (e.key === "theme" && (e.newValue === "light" || e.newValue === "dark")) {
      root.setAttribute("data-theme", e.newValue);
    }
  });

  // Respect an explicit OS-level change only when the user never chose manually
  if (!window.matchMedia("(prefers-color-scheme: dark)").matches) {
    // no-op: the inline head script already picked a sensible default
  }

  /* ----------------------------------------------------------------------
     2. Mobile navigation
     ---------------------------------------------------------------------- */

  var navToggle = document.querySelector("[data-nav-toggle]");
  var nav = document.querySelector("[data-nav]");

  if (navToggle && nav) {
    var setNav = function (open) {
      navToggle.setAttribute("aria-expanded", String(open));
      nav.setAttribute("data-open", String(open));
    };

    navToggle.addEventListener("click", function () {
      setNav(navToggle.getAttribute("aria-expanded") !== "true");
    });

    // Close on link click, Escape, or when the viewport grows past the breakpoint
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setNav(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
        setNav(false);
        navToggle.focus();
      }
    });

    var wide = window.matchMedia("(min-width: 52.0625rem)");
    var onWide = function (e) {
      if (e.matches) setNav(false);
    };
    if (wide.addEventListener) wide.addEventListener("change", onWide);
    else wide.addListener(onWide);
  }

  /* ----------------------------------------------------------------------
     3. Header border on scroll
     ---------------------------------------------------------------------- */

  var header = document.querySelector("[data-header]");
  if (header) {
    var onScroll = function () {
      header.setAttribute("data-scrolled", String(window.scrollY > 8));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ----------------------------------------------------------------------
     4. Scroll reveal
     ---------------------------------------------------------------------- */

  var revealables = document.querySelectorAll(".reveal");

  if (revealables.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealables.forEach(function (el) {
        el.setAttribute("data-visible", "true");
      });
    } else {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.setAttribute("data-visible", "true");
            observer.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -12% 0px", threshold: 0.05 }
      );

      revealables.forEach(function (el, i) {
        // Stagger siblings slightly for a softer cascade
        if (!el.style.getPropertyValue("--reveal-delay")) {
          var stagger = (i % 6) * 55;
          el.style.setProperty("--reveal-delay", stagger + "ms");
        }
        observer.observe(el);
      });
    }
  }

  /* ----------------------------------------------------------------------
     5. Active nav link (marks the current page section)
     ---------------------------------------------------------------------- */

  var navLinks = document.querySelectorAll('.nav__link[href^="#"]');
  if (navLinks.length && "IntersectionObserver" in window) {
    var sections = Array.prototype.map.call(navLinks, function (link) {
      return document.querySelector(link.getAttribute("href"));
    });

    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (link) {
            var isActive = link.getAttribute("href") === "#" + entry.target.id;
            if (isActive) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    sections.forEach(function (section) {
      if (section) spy.observe(section);
    });
  }

  /* ----------------------------------------------------------------------
     6. Animated stat counters
     ---------------------------------------------------------------------- */

  var counters = document.querySelectorAll("[data-count-to]");

  if (counters.length && "IntersectionObserver" in window && !reduceMotion) {
    var animate = function (el) {
      var target = parseFloat(el.getAttribute("data-count-to"));
      var decimals = (String(target).split(".")[1] || "").length;
      var suffix = el.getAttribute("data-count-suffix") || "";
      var start = performance.now();
      var duration = 1400;

      var tick = function (now) {
        var progress = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = (target * eased).toFixed(decimals) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target + suffix;
      };

      requestAnimationFrame(tick);
    };

    var countObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          animate(entry.target);
          countObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(function (el) {
      countObserver.observe(el);
    });
  } else {
    counters.forEach(function (el) {
      var suffix = el.getAttribute("data-count-suffix") || "";
      el.textContent = el.getAttribute("data-count-to") + suffix;
    });
  }

  /* ----------------------------------------------------------------------
     7. Reading progress bar (long-form pages)
     ---------------------------------------------------------------------- */

  var progressBar = document.querySelector("[data-progress]");

  if (progressBar) {
    var updateProgress = function () {
      var doc = document.documentElement;
      var total = doc.scrollHeight - doc.clientHeight;
      var ratio = total > 0 ? Math.min(Math.max(doc.scrollTop / total, 0), 1) : 0;
      progressBar.style.transform = "scaleX(" + ratio + ")";
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
  }

  /* ----------------------------------------------------------------------
     8. Copy-to-clipboard
     ---------------------------------------------------------------------- */

  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var value = btn.getAttribute("data-copy");
      var label = btn.querySelector("[data-copy-label]") || btn;
      var original = label.textContent;

      var done = function (ok) {
        label.textContent = ok ? "Copied" : "Press Ctrl+C";
        setTimeout(function () {
          label.textContent = original;
        }, 2000);
      };

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(value).then(
          function () {
            done(true);
          },
          function () {
            done(false);
          }
        );
      } else {
        // Fallback for http:// or older browsers
        var ta = document.createElement("textarea");
        ta.value = value;
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        try {
          done(document.execCommand("copy"));
        } catch (e) {
          done(false);
        }
        document.body.removeChild(ta);
      }
    });
  });

  /* ----------------------------------------------------------------------
     9. Contact form
     Client-side validation, then submission. Falls back to a prefilled
     mailto: link so the form still works with no backend at all.
     ---------------------------------------------------------------------- */

  var form = document.querySelector("[data-contact-form]");

  if (form) {
    var status = form.querySelector("[data-form-status]");
    var submitBtn = form.querySelector('[type="submit"]');
    var originalLabel = submitBtn ? submitBtn.innerHTML : "";

    var setError = function (field, message) {
      var control = form.querySelector('[name="' + field + '"]');
      if (!control) return;
      var errorEl = form.querySelector('[data-error-for="' + field + '"]');
      control.setAttribute("aria-invalid", message ? "true" : "false");
      if (errorEl) errorEl.textContent = message || "";
    };

    var validateField = function (field) {
      var control = form.querySelector('[name="' + field + '"]');
      if (!control) return true;

      var value = control.value.trim();
      var message = "";

      if (control.required && !value) {
        message = "This field is required.";
      } else if (field === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
        message = "Enter a valid email address.";
      } else if (field === "name" && value && value.length < 2) {
        message = "Please enter at least 2 characters.";
      } else if (field === "message" && value && value.length < 10) {
        message = "A little more detail helps — 10 characters minimum.";
      }

      setError(field, message);
      return !message;
    };

    var fields = ["name", "email", "message"];
    var subjectField = form.querySelector('[name="subject"]');
    if (subjectField) fields.push("subject");

    fields.forEach(function (field) {
      var control = form.querySelector('[name="' + field + '"]');
      if (!control) return;
      control.addEventListener("blur", function () {
        validateField(field);
      });
      control.addEventListener("input", function () {
        if (control.getAttribute("aria-invalid") === "true") validateField(field);
      });
    });

    var say = function (state, text) {
      if (!status) return;
      status.setAttribute("data-state", state);
      status.textContent = text;
    };

    var buildMailto = function (data) {
      var to = form.getAttribute("data-mailto") || "";
      var subject = data.subject || form.getAttribute("data-subject") || "Portfolio enquiry";
      var body = data.message + "\n\n—\n" + data.name + "\n" + data.email;
      return (
        "mailto:" + to + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body)
      );
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var valid = fields.map(validateField).every(Boolean);
      var firstInvalid = form.querySelector('[aria-invalid="true"]');

      if (!valid) {
        say("error", "Please fix the highlighted fields and try again.");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var data = {};
      new FormData(form).forEach(function (value, key) {
        data[key] = typeof value === "string" ? value.trim() : value;
      });

      // Honeypot: real users never fill this in.
      if (data.company) {
        say("ok", "Thanks — your message has been sent.");
        form.reset();
        return;
      }

      var endpoint = form.getAttribute("action");

      // No endpoint configured → open the user's mail client.
      if (!endpoint || endpoint === "#" || !/^https?:/i.test(endpoint)) {
        window.location.href = buildMailto(data);
        say("ok", "Opening your email client so you can send the message.");
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = "Sending…";
      }
      say("", "Sending your message…");

      fetch(endpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form)
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Request failed with status " + res.status);
          say("ok", "Thanks — your message is in. I'll get back to you shortly.");
          form.reset();
          fields.forEach(function (f) {
            setError(f, "");
          });
        })
        .catch(function () {
          window.location.href = buildMailto(data);
          say("error", "Could not send automatically — opening your email client instead.");
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalLabel;
          }
        });
    });
  }

  /* ----------------------------------------------------------------------
     10. Project filters (optional, only if a filter bar exists)
     ---------------------------------------------------------------------- */

  var filterBar = document.querySelector("[data-filter-bar]");

  if (filterBar) {
    var buttons = filterBar.querySelectorAll("[data-filter]");
    var items = document.querySelectorAll("[data-filter-item]");
    var empty = document.querySelector("[data-filter-empty]");

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var value = btn.getAttribute("data-filter");
        var shown = 0;

        buttons.forEach(function (b) {
          b.setAttribute("aria-pressed", String(b === btn));
        });

        items.forEach(function (item) {
          var tags = (item.getAttribute("data-filter-item") || "").split(/\s+/);
          var match = value === "all" || tags.indexOf(value) !== -1;
          item.hidden = !match;
          if (match) shown++;
        });

        if (empty) empty.hidden = shown !== 0;
      });
    });
  }

  /* ----------------------------------------------------------------------
     11. Year stamp
     ---------------------------------------------------------------------- */

  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
