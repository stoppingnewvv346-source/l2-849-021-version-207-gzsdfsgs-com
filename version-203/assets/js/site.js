(function () {
  var navButton = document.querySelector('[data-nav-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (navButton && mobileNav) {
    navButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('image-empty');
    });
  });

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showHero(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showHero(current + 1);
      }, 5200);
    }
  }

  var filterPanel = document.querySelector('[data-filter-panel]');

  if (filterPanel) {
    var input = filterPanel.querySelector('[data-filter-input]');
    var yearFilter = filterPanel.querySelector('[data-year-filter]');
    var typeFilter = filterPanel.querySelector('[data-type-filter]');
    var categoryFilter = filterPanel.querySelector('[data-category-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      var keyword = normalize(input ? input.value : '');
      var year = normalize(yearFilter ? yearFilter.value : '');
      var type = normalize(typeFilter ? typeFilter.value : '');
      var category = normalize(categoryFilter ? categoryFilter.value : '');

      cards.forEach(function (card) {
        var search = normalize(card.getAttribute('data-search'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardType = normalize(card.getAttribute('data-type'));
        var cardCategory = normalize(card.getAttribute('data-category'));
        var matched = true;

        if (keyword && search.indexOf(keyword) === -1) {
          matched = false;
        }

        if (year && cardYear !== year) {
          matched = false;
        }

        if (type && cardType !== type) {
          matched = false;
        }

        if (category && cardCategory !== category) {
          matched = false;
        }

        card.classList.toggle('is-hidden', !matched);
      });
    }

    [input, yearFilter, typeFilter, categoryFilter].forEach(function (control) {
      if (!control) {
        return;
      }

      control.addEventListener('input', applyFilter);
      control.addEventListener('change', applyFilter);
    });

    applyFilter();
  }

  function prepareVideo(video, streamUrl) {
    if (video.getAttribute('data-ready') === '1') {
      return Promise.resolve();
    }

    return new Promise(function (resolve, reject) {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });

        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.setAttribute('data-ready', '1');
          resolve();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
            reject(new Error('stream'));
          }
        });
        video._hlsInstance = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', function () {
          video.setAttribute('data-ready', '1');
          resolve();
        }, { once: true });
      } else {
        reject(new Error('support'));
      }
    });
  }

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var message = player.querySelector('[data-player-message]');

    if (!video || !cover) {
      return;
    }

    var streamUrl = video.getAttribute('data-stream');

    function setMessage(text) {
      if (message) {
        message.textContent = text || '';
      }
    }

    function startPlayback() {
      if (!streamUrl) {
        setMessage('播放暂不可用，请稍后再试。');
        return;
      }

      cover.classList.add('is-loading');
      setMessage('');

      prepareVideo(video, streamUrl).then(function () {
        player.classList.add('is-playing');
        cover.classList.remove('is-loading');
        video.controls = true;
        return video.play();
      }).catch(function () {
        cover.classList.remove('is-loading');
        setMessage('播放暂不可用，请稍后再试。');
      });
    }

    cover.addEventListener('click', startPlayback);
    video.addEventListener('play', function () {
      player.classList.add('is-playing');
    });
  });
})();
