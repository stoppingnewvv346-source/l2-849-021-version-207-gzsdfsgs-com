(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var dotsWrap = hero.querySelector('[data-hero-dots]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      if (dotsWrap) {
        Array.prototype.slice.call(dotsWrap.children).forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === index);
        });
      }
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5000);
    }

    if (dotsWrap) {
      slides.forEach(function (_, dotIndex) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', '切换到第' + (dotIndex + 1) + '屏');
        dot.addEventListener('click', function () {
          showSlide(dotIndex);
          restart();
        });
        dotsWrap.appendChild(dot);
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        restart();
      });
    }

    showSlide(0);
    restart();
  }

  var filterInput = document.querySelector('[data-local-filter]');
  var typeFilter = document.querySelector('[data-filter-type]');
  var yearFilter = document.querySelector('[data-filter-year]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card-list] .movie-card-link'));

  function applyFilters() {
    if (!cards.length) {
      return;
    }
    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var type = typeFilter ? typeFilter.value : '';
    var year = yearFilter ? yearFilter.value : '';
    cards.forEach(function (card) {
      var haystack = [
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre
      ].join(' ').toLowerCase();
      var matchedKeyword = !keyword || haystack.indexOf(keyword) > -1;
      var matchedType = !type || card.dataset.type === type;
      var matchedYear = !year || card.dataset.year === year;
      card.style.display = matchedKeyword && matchedType && matchedYear ? '' : 'none';
    });
  }

  [filterInput, typeFilter, yearFilter].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });

  var searchInput = document.getElementById('searchInput');
  var searchButton = document.getElementById('searchButton');
  var searchResults = document.getElementById('searchResults');
  var searchCount = document.getElementById('searchCount');

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function renderSearch() {
    if (!searchInput || !searchResults || !window.MOVIE_SEARCH_INDEX) {
      return;
    }
    var keyword = searchInput.value.trim().toLowerCase();
    var source = window.MOVIE_SEARCH_INDEX;
    var results = source.filter(function (item) {
      if (!keyword) {
        return true;
      }
      return [item.title, item.region, item.type, item.year, item.genre, item.oneLine].join(' ').toLowerCase().indexOf(keyword) > -1;
    }).slice(0, 120);
    searchResults.innerHTML = results.map(function (item) {
      return '<a class="movie-card" href="' + escapeHtml(item.url) + '">' +
        '<span class="poster-frame">' +
        '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
        '<span class="poster-shade"></span>' +
        '<span class="poster-badge">' + escapeHtml(item.type) + '</span>' +
        '</span>' +
        '<span class="movie-card-body">' +
        '<span class="movie-meta">' + escapeHtml(item.region) + ' · ' + escapeHtml(item.year) + ' · ' + escapeHtml(item.type) + '</span>' +
        '<strong>' + escapeHtml(item.title) + '</strong>' +
        '<span class="movie-desc">' + escapeHtml(item.oneLine) + '</span>' +
        '<span class="movie-card-tags"><em>' + escapeHtml(item.genre) + '</em><em>' + escapeHtml(item.year) + '</em></span>' +
        '</span>' +
        '</a>';
    }).join('');
    if (searchCount) {
      searchCount.textContent = keyword ? '找到 ' + results.length + ' 条相关影片' : '显示前 ' + results.length + ' 条影片';
    }
  }

  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    searchInput.value = params.get('q') || '';
    searchInput.addEventListener('input', renderSearch);
    searchInput.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        renderSearch();
      }
    });
    if (searchButton) {
      searchButton.addEventListener('click', renderSearch);
    }
    renderSearch();
  }
})();
