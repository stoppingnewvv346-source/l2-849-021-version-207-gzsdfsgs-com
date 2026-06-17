(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        var open = mobileNav.classList.toggle("is-open");
        menuButton.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    document.querySelectorAll("[data-search-area]").forEach(function (area) {
      var input = area.querySelector("[data-search-input]");
      var block = area.parentElement;
      var cards = block ? Array.prototype.slice.call(block.querySelectorAll("[data-card]")) : [];
      var buttons = Array.prototype.slice.call(area.querySelectorAll("[data-filter]"));
      var activeFilter = "all";

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        cards.forEach(function (card) {
          var key = (card.getAttribute("data-key") || "").toLowerCase();
          var matchQuery = !query || key.indexOf(query) !== -1;
          var matchFilter = activeFilter === "all" || key.indexOf(activeFilter.toLowerCase()) !== -1;
          card.hidden = !(matchQuery && matchFilter);
        });
      }

      buttons.forEach(function (button, index) {
        if (index === 0) {
          button.classList.add("is-active");
        }
        button.addEventListener("click", function () {
          buttons.forEach(function (item) {
            item.classList.remove("is-active");
          });
          button.classList.add("is-active");
          activeFilter = button.getAttribute("data-filter") || "all";
          apply();
        });
      });

      if (input) {
        input.addEventListener("input", apply);
      }
    });

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var timer;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function start() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot") || 0));
          start();
        });
      });

      show(0);
      start();
    });

    document.querySelectorAll(".player-box").forEach(function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector(".play-overlay");
      var stream = box.getAttribute("data-stream") || "";
      var prepared = false;

      function prepare() {
        if (!video || !stream || prepared) {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          video._hlsInstance = hls;
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else {
          video.src = stream;
        }
        prepared = true;
      }

      function play() {
        prepare();
        if (!video) {
          return;
        }
        box.classList.add("is-playing");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            box.classList.remove("is-playing");
          });
        }
      }

      if (button) {
        button.addEventListener("click", play);
      }
      if (video) {
        video.addEventListener("play", function () {
          box.classList.add("is-playing");
        });
      }
    });
  });
})();
