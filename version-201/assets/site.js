(function() {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function initNavigation() {
    const toggle = document.querySelector(".nav-toggle");
    const mobileNav = document.querySelector(".mobile-nav");
    if (!toggle || !mobileNav) {
      return;
    }
    toggle.addEventListener("click", function() {
      const isOpen = mobileNav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  function initHero() {
    const hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    let active = 0;
    let timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function() {
        show(active + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function(dot, index) {
      dot.addEventListener("click", function() {
        show(index);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function compareCards(a, b, value, originalOrder) {
    if (value === "year-desc") {
      return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
    }
    if (value === "year-asc") {
      return Number(a.getAttribute("data-year") || 0) - Number(b.getAttribute("data-year") || 0);
    }
    if (value === "title") {
      return normalize(a.textContent).localeCompare(normalize(b.textContent), "zh-Hans-CN");
    }
    return originalOrder.get(a) - originalOrder.get(b);
  }

  function initLists() {
    const toolbars = Array.from(document.querySelectorAll("[data-toolbar]"));
    toolbars.forEach(function(toolbar) {
      const section = toolbar.closest(".list-section") || document;
      const lists = Array.from(section.querySelectorAll("[data-card-list]"));
      if (!lists.length) {
        return;
      }
      const cards = Array.from(section.querySelectorAll("[data-movie-card]"));
      const originalOrder = new Map(cards.map(function(card, index) {
        return [card, index];
      }));
      const search = toolbar.querySelector(".movie-search");
      const buttons = Array.from(toolbar.querySelectorAll(".filter-button"));
      const sort = toolbar.querySelector(".sort-select");
      const empty = section.querySelector("[data-empty-state]");
      let activeFilter = "all";

      function filterCards() {
        const query = normalize(search ? search.value : "");
        let visible = 0;
        cards.forEach(function(card) {
          const text = normalize(card.textContent + " " + card.getAttribute("data-keywords"));
          const category = card.getAttribute("data-category") || "";
          const matchQuery = !query || text.indexOf(query) !== -1;
          const matchFilter = activeFilter === "all" || category === activeFilter;
          const shouldShow = matchQuery && matchFilter;
          card.hidden = !shouldShow;
          if (shouldShow) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      function sortCards() {
        if (!sort) {
          return;
        }
        const value = sort.value;
        lists.forEach(function(list) {
          const listCards = Array.from(list.querySelectorAll("[data-movie-card]"));
          listCards.sort(function(a, b) {
            return compareCards(a, b, value, originalOrder);
          });
          listCards.forEach(function(card) {
            list.appendChild(card);
          });
        });
      }

      if (search) {
        search.addEventListener("input", filterCards);
      }
      buttons.forEach(function(button) {
        button.addEventListener("click", function() {
          buttons.forEach(function(item) {
            item.classList.remove("is-active");
          });
          button.classList.add("is-active");
          activeFilter = button.getAttribute("data-filter") || "all";
          filterCards();
        });
      });
      if (sort) {
        sort.addEventListener("change", function() {
          sortCards();
          filterCards();
        });
      }
      filterCards();
    });
  }

  ready(function() {
    initNavigation();
    initHero();
    initLists();
  });
})();
