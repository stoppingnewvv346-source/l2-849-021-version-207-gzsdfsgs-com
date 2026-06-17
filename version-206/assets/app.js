(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobilePanel = document.querySelector(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      var open = mobilePanel.hasAttribute("hidden");
      if (open) {
        mobilePanel.removeAttribute("hidden");
      } else {
        mobilePanel.setAttribute("hidden", "");
      }
      menuButton.setAttribute("aria-expanded", String(open));
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function startTimer() {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        showSlide(index);
        startTimer();
      });
    });

    if (slides.length > 1) {
      startTimer();
    }
  }

  var filterForm = document.querySelector("[data-card-filter]");
  if (filterForm) {
    var textInput = filterForm.querySelector("input");
    var yearSelect = filterForm.querySelector("select");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

    function updateCards() {
      var keyword = textInput.value.trim().toLowerCase();
      var year = yearSelect.value;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-region")
        ].join(" ").toLowerCase();
        var yearMatch = !year || card.getAttribute("data-year") === year;
        var textMatch = !keyword || haystack.indexOf(keyword) !== -1;
        card.classList.toggle("is-hidden-card", !(yearMatch && textMatch));
      });
    }

    textInput.addEventListener("input", updateCards);
    yearSelect.addEventListener("change", updateCards);
    filterForm.addEventListener("submit", function (event) {
      event.preventDefault();
      updateCards();
    });
  }

  var searchResults = document.getElementById("searchResults");
  if (searchResults && window.CATALOG) {
    var params = new URLSearchParams(window.location.search);
    var q = (params.get("q") || "").trim();
    var input = document.getElementById("searchInput");
    var title = document.getElementById("searchTitle");

    if (input) {
      input.value = q;
    }

    var normalized = q.toLowerCase();
    var results = window.CATALOG.filter(function (movie) {
      if (!normalized) {
        return movie.index < 49;
      }
      return [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.tags,
        movie.oneLine
      ].join(" ").toLowerCase().indexOf(normalized) !== -1;
    }).slice(0, 160);

    if (title) {
      title.textContent = q ? "搜索结果：" + q : "推荐影片";
    }

    if (!results.length) {
      searchResults.innerHTML = '<div class="empty-state">暂无匹配影片</div>';
    } else {
      searchResults.innerHTML = results.map(function (movie) {
        var tags = movie.tags.split(",").filter(Boolean).slice(0, 3).map(function (tag) {
          return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return '' +
          '<article class="movie-card">' +
            '<a class="movie-poster" href="' + movie.url + '">' +
              '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
              '<span class="poster-badge">' + escapeHtml(movie.year) + '</span>' +
            '</a>' +
            '<div class="movie-info">' +
              '<a class="movie-title" href="' + movie.url + '">' + escapeHtml(movie.title) + '</a>' +
              '<div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
              '<p>' + escapeHtml(movie.oneLine) + '</p>' +
              '<div class="tag-row">' + tags + '</div>' +
            '</div>' +
          '</article>';
      }).join("");
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
