(function() {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector('.mobile-toggle');
    var panel = document.querySelector('.mobile-panel');

    if (!button || !panel) {
      return;
    }

    button.addEventListener('click', function() {
      var isOpen = !panel.hasAttribute('hidden');
      if (isOpen) {
        panel.setAttribute('hidden', '');
        button.setAttribute('aria-expanded', 'false');
      } else {
        panel.removeAttribute('hidden');
        button.setAttribute('aria-expanded', 'true');
      }
    });
  }

  function setupSearchForms() {
    document.querySelectorAll('.site-search-form').forEach(function(form) {
      form.addEventListener('submit', function(event) {
        var input = form.querySelector('input[name="q"]');
        var value = input ? input.value.trim() : '';

        if (!value) {
          event.preventDefault();
          if (input) {
            input.focus();
          }
        }
      });
    });
  }

  function setupHero() {
    var slider = document.querySelector('.hero-carousel');

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function(slide, current) {
        slide.classList.toggle('is-active', current === active);
      });
      dots.forEach(function(dot, current) {
        dot.classList.toggle('is-active', current === active);
      });
    }

    function autoplay() {
      clearInterval(timer);
      timer = setInterval(function() {
        show(active + 1);
      }, 5200);
    }

    dots.forEach(function(dot, index) {
      dot.addEventListener('click', function() {
        show(index);
        autoplay();
      });
    });

    if (prev) {
      prev.addEventListener('click', function() {
        show(active - 1);
        autoplay();
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        show(active + 1);
        autoplay();
      });
    }

    if (slides.length > 1) {
      autoplay();
    }
  }

  function getActiveFilters(scope) {
    var filters = {};
    scope.querySelectorAll('.filter-group').forEach(function(group) {
      var active = group.querySelector('.filter-button.is-active');
      if (active && active.dataset.filterValue !== 'all') {
        filters[active.dataset.filterKey] = active.dataset.filterValue;
      }
    });
    return filters;
  }

  function applyFilters(scope) {
    var filters = getActiveFilters(scope);
    var keywordInput = scope.querySelector('.page-search-input');
    var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));

    cards.forEach(function(card) {
      var visible = true;

      Object.keys(filters).forEach(function(key) {
        var value = filters[key];
        var current = (card.dataset[key] || '').toLowerCase();
        if (value && current.indexOf(value.toLowerCase()) === -1) {
          visible = false;
        }
      });

      if (keyword) {
        var title = (card.dataset.title || card.textContent || '').toLowerCase();
        var genre = (card.dataset.genre || '').toLowerCase();
        var region = (card.dataset.region || '').toLowerCase();
        if (title.indexOf(keyword) === -1 && genre.indexOf(keyword) === -1 && region.indexOf(keyword) === -1) {
          visible = false;
        }
      }

      card.classList.toggle('is-hidden', !visible);
    });
  }

  function setupFilters() {
    document.querySelectorAll('.filter-scope').forEach(function(scope) {
      scope.querySelectorAll('.filter-button').forEach(function(button) {
        button.addEventListener('click', function() {
          var group = button.closest('.filter-group');
          if (group) {
            group.querySelectorAll('.filter-button').forEach(function(peer) {
              peer.classList.remove('is-active');
            });
          }
          button.classList.add('is-active');
          applyFilters(scope);
        });
      });

      var input = scope.querySelector('.page-search-input');
      if (input) {
        input.addEventListener('input', function() {
          applyFilters(scope);
        });
      }
    });
  }

  function cardHtml(movie) {
    return [
      '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '" data-region="' + escapeHtml(movie.region) + '" data-type="' + escapeHtml(movie.type) + '" data-year="' + escapeHtml(movie.year) + '" data-genre="' + escapeHtml(movie.genre) + '">',
      '  <a class="poster-link" href="./' + movie.file + '" aria-label="' + escapeHtml(movie.title) + '">',
      '    <img src="./' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="play-chip">播放</span>',
      '  </a>',
      '  <div class="card-body">',
      '    <h3><a href="./' + movie.file + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p class="card-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.year) + '</p>',
      '    <p class="card-desc">' + escapeHtml(movie.one_line) + '</p>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupSearchPage() {
    var container = document.getElementById('search-results');

    if (!container || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var title = document.getElementById('search-title');
    var input = document.querySelector('.search-page-input');

    if (input) {
      input.value = query;
    }

    var normalized = query.toLowerCase();
    var results = window.MOVIE_SEARCH_INDEX.filter(function(movie) {
      if (!normalized) {
        return movie.hot === true;
      }

      var haystack = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.tags,
        movie.one_line
      ].join(' ').toLowerCase();

      return haystack.indexOf(normalized) !== -1;
    }).slice(0, 120);

    if (title) {
      title.textContent = query ? '搜索结果' : '热门内容';
    }

    if (!results.length) {
      container.innerHTML = '<div class="empty-state">暂未找到匹配内容</div>';
      return;
    }

    container.innerHTML = results.map(cardHtml).join('');
  }

  ready(function() {
    setupMobileMenu();
    setupSearchForms();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
}());
