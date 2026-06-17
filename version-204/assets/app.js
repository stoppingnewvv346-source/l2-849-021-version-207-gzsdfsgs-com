(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearch();
    setupFilters();
    setupPlayer();
  });

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    if (slides.length < 2) {
      return;
    }
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        schedule();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        schedule();
      });
    });

    schedule();
  }

  function setupSearch() {
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search], [data-global-search]"));
    inputs.forEach(function (input) {
      if (query) {
        input.value = query;
      }
      input.addEventListener("input", function () {
        filterCards(input.value);
      });
    });
    if (query) {
      filterCards(query);
    }
  }

  function setupFilters() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-term]"));
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        filterCards(button.getAttribute("data-filter-term") || "");
      });
    });
  }

  function filterCards(value) {
    var keyword = String(value || "").trim().toLowerCase();
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .rank-row"));
    cards.forEach(function (card) {
      var text = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-meta") || "")).toLowerCase();
      card.classList.toggle("is-hidden", keyword && text.indexOf(keyword) === -1);
    });
  }

  function setupPlayer() {
    var player = document.querySelector("[data-player]");
    if (!player) {
      return;
    }
    var video = player.querySelector("video");
    var button = player.querySelector("[data-play-button]");
    if (!video || !button) {
      return;
    }
    var streamUrl = video.getAttribute("data-stream");
    var initialized = false;

    function attachStream() {
      if (!streamUrl || initialized) {
        return;
      }
      initialized = true;
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function playVideo() {
      attachStream();
      player.classList.add("is-playing");
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          player.classList.remove("is-playing");
        });
      }
    }

    button.addEventListener("click", playVideo);
    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });
    video.addEventListener("play", function () {
      player.classList.add("is-playing");
    });
  }
})();
