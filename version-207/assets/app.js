(function () {
    const root = document.body.dataset.root || './';

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function formatNumber(value) {
        const number = Number(value) || 0;
        if (number >= 10000) {
            return (number / 10000).toFixed(1) + '万';
        }
        return String(number);
    }

    function initMobileMenu() {
        const button = document.querySelector('[data-mobile-menu-button]');
        const panel = document.querySelector('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initSiteSearch() {
        document.querySelectorAll('[data-site-search]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                const input = form.querySelector('input[name="q"]');
                const query = input ? input.value.trim() : '';
                if (query) {
                    window.location.href = root + 'search.html?q=' + encodeURIComponent(query);
                }
            });
        });
    }

    function initHeroCarousel() {
        const carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
        const prev = carousel.querySelector('[data-hero-prev]');
        const next = carousel.querySelector('[data-hero-next]');
        let current = 0;
        let timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
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
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });
        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initFilters() {
        const scope = document.querySelector('[data-filter-root]');
        if (!scope) {
            return;
        }
        const grid = scope.querySelector('[data-filter-grid]');
        const cards = grid ? Array.from(grid.querySelectorAll('.movie-card')) : [];
        const keyword = scope.querySelector('[data-filter-keyword]');
        const region = scope.querySelector('[data-filter-region]');
        const type = scope.querySelector('[data-filter-type]');
        const genre = scope.querySelector('[data-filter-genre]');
        const year = scope.querySelector('[data-filter-year]');
        const sort = scope.querySelector('[data-filter-sort]');
        const count = scope.querySelector('[data-filter-count]');

        function matches(card) {
            const q = keyword ? keyword.value.trim().toLowerCase() : '';
            const haystack = [
                card.dataset.title,
                card.dataset.tags,
                card.dataset.genre,
                card.dataset.region,
                card.dataset.type,
                card.dataset.year
            ].join(' ').toLowerCase();
            if (q && !haystack.includes(q)) {
                return false;
            }
            if (region && region.value && card.dataset.region !== region.value) {
                return false;
            }
            if (type && type.value && card.dataset.type !== type.value) {
                return false;
            }
            if (genre && genre.value && !(card.dataset.genre || '').includes(genre.value)) {
                return false;
            }
            if (year && year.value && card.dataset.year !== year.value) {
                return false;
            }
            return true;
        }

        function applySort(visibleCards) {
            if (!sort || sort.value === 'default') {
                visibleCards.sort(function (a, b) {
                    return Number(a.dataset.title > b.dataset.title) - Number(a.dataset.title < b.dataset.title);
                });
            }
            if (sort && sort.value === 'views') {
                visibleCards.sort(function (a, b) {
                    return Number(b.dataset.views) - Number(a.dataset.views);
                });
            }
            if (sort && sort.value === 'rating') {
                visibleCards.sort(function (a, b) {
                    return Number(b.dataset.rating) - Number(a.dataset.rating);
                });
            }
            if (sort && sort.value === 'date') {
                visibleCards.sort(function (a, b) {
                    return Number(b.dataset.year) - Number(a.dataset.year);
                });
            }
            visibleCards.forEach(function (card) {
                grid.appendChild(card);
            });
        }

        function update() {
            const visibleCards = [];
            cards.forEach(function (card) {
                const visible = matches(card);
                card.classList.toggle('is-hidden', !visible);
                if (visible) {
                    visibleCards.push(card);
                }
            });
            applySort(visibleCards);
            if (count) {
                count.textContent = String(visibleCards.length);
            }
        }

        [keyword, region, type, genre, year, sort].forEach(function (control) {
            if (control) {
                control.addEventListener('input', update);
                control.addEventListener('change', update);
            }
        });
        update();
    }

    function createSearchCard(movie) {
        const article = document.createElement('article');
        article.className = 'movie-card';
        article.innerHTML = [
            '<a href="' + root + escapeHtml(movie.url) + '" class="movie-card__link">',
            '    <div class="movie-card__poster">',
            '        <img src="' + root + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '        <span class="movie-card__badge">' + escapeHtml(movie.region) + '</span>',
            '        <span class="movie-card__duration">' + escapeHtml(movie.duration) + '</span>',
            '    </div>',
            '    <div class="movie-card__body">',
            '        <h3>' + escapeHtml(movie.title) + '</h3>',
            '        <p>' + escapeHtml(movie.description) + '</p>',
            '        <div class="movie-card__tags"><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.year) + '</span></div>',
            '        <div class="movie-card__meta"><span>' + formatNumber(movie.views) + '次</span><span>' + escapeHtml(movie.genre.split(' ')[0] || '精选') + '</span><strong>★ ' + escapeHtml(movie.rating) + '</strong></div>',
            '    </div>',
            '</a>'
        ].join('');
        return article;
    }

    function initSearchPage() {
        const scope = document.querySelector('[data-search-page]');
        if (!scope || !window.MOVIE_INDEX) {
            return;
        }
        const form = scope.querySelector('[data-search-page-form]');
        const input = scope.querySelector('[data-search-page-input]');
        const results = scope.querySelector('[data-search-results]');
        const count = scope.querySelector('[data-search-count]');
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get('q') || '';
        input.value = initialQuery;

        function render() {
            const query = input.value.trim().toLowerCase();
            results.innerHTML = '';
            let matched = window.MOVIE_INDEX.filter(function (movie) {
                if (!query) {
                    return true;
                }
                const haystack = [movie.title, movie.description, movie.region, movie.type, movie.year, movie.genre, movie.tags].join(' ').toLowerCase();
                return haystack.includes(query);
            });
            matched = matched.slice(0, 200);
            matched.forEach(function (movie) {
                results.appendChild(createSearchCard(movie));
            });
            count.textContent = String(matched.length);
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            const query = input.value.trim();
            const url = query ? root + 'search.html?q=' + encodeURIComponent(query) : root + 'search.html';
            window.history.replaceState(null, '', url);
            render();
        });
        input.addEventListener('input', render);
        render();
    }

    initMobileMenu();
    initSiteSearch();
    initHeroCarousel();
    initFilters();
    initSearchPage();
})();
