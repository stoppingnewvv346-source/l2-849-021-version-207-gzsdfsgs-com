(function () {
  var hlsPromise = null;
  var hlsUrl = "https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js";

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (hlsPromise) {
      return hlsPromise;
    }
    hlsPromise = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = hlsUrl;
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return hlsPromise;
  }

  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function uniqueValues(cards, key) {
    var values = [];
    cards.forEach(function (card) {
      var value = card.getAttribute(key) || "";
      if (value && values.indexOf(value) === -1) {
        values.push(value);
      }
    });
    return values.sort(function (a, b) {
      return String(b).localeCompare(String(a), "zh-CN");
    });
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function initFilters() {
    var panel = document.querySelector(".catalog-filter");
    var catalog = document.querySelector("[data-catalog]");
    if (!panel || !catalog) {
      return;
    }
    var cards = Array.prototype.slice.call(catalog.querySelectorAll(".movie-card"));
    var query = panel.querySelector(".filter-query");
    var year = panel.querySelector(".filter-year");
    var region = panel.querySelector(".filter-region");
    var type = panel.querySelector(".filter-type");

    fillSelect(year, uniqueValues(cards, "data-year"));
    fillSelect(region, uniqueValues(cards, "data-region"));
    fillSelect(type, uniqueValues(cards, "data-type"));

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (q && query) {
      query.value = q;
    }

    function apply() {
      var qValue = query ? query.value.trim().toLowerCase() : "";
      var yValue = year ? year.value : "";
      var rValue = region ? region.value : "";
      var tValue = type ? type.value : "";
      cards.forEach(function (card) {
        var haystack = (card.getAttribute("data-search") || "").toLowerCase();
        var matched = true;
        if (qValue && haystack.indexOf(qValue) === -1) {
          matched = false;
        }
        if (yValue && card.getAttribute("data-year") !== yValue) {
          matched = false;
        }
        if (rValue && card.getAttribute("data-region") !== rValue) {
          matched = false;
        }
        if (tValue && card.getAttribute("data-type") !== tValue) {
          matched = false;
        }
        card.style.display = matched ? "" : "none";
      });
    }

    [query, year, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    apply();
  }

  function bindVideo(frame) {
    var video = frame.querySelector("video");
    var button = frame.querySelector(".play-cover");
    var stream = frame.getAttribute("data-video");
    if (!video || !stream) {
      return;
    }

    function play() {
      if (frame.dataset.ready === "true") {
        video.play().catch(function () {});
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        frame.dataset.ready = "true";
        video.play().catch(function () {});
        return;
      }
      loadHls().then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          var player = new Hls({ enableWorker: true, lowLatencyMode: true });
          player.loadSource(stream);
          player.attachMedia(video);
          frame.dataset.ready = "true";
          frame.hlsPlayer = player;
          player.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.src = stream;
          frame.dataset.ready = "true";
          video.play().catch(function () {});
        }
      }).catch(function () {
        video.src = stream;
        frame.dataset.ready = "true";
        video.play().catch(function () {});
      });
    }

    frame.addEventListener("click", function (event) {
      if (event.target === video) {
        return;
      }
      play();
    });
    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        play();
      });
    }
    video.addEventListener("play", function () {
      frame.classList.add("is-playing");
    });
    video.addEventListener("pause", function () {
      if (video.currentTime === 0) {
        frame.classList.remove("is-playing");
      }
    });
  }

  function initPlayers() {
    Array.prototype.slice.call(document.querySelectorAll(".video-frame[data-video]")).forEach(bindVideo);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
