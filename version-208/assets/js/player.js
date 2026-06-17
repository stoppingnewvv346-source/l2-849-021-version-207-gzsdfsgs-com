(function () {
  function attachHls(video) {
    var source = video.dataset.source;
    if (!source || video.dataset.hlsReady === '1') {
      return;
    }
    video.dataset.hlsReady = '1';
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video._hls = hls;
    } else {
      video.src = source;
    }
  }

  document.querySelectorAll('[data-hls-player]').forEach(function (video) {
    var card = video.closest('.player-card');
    var button = card ? card.querySelector('[data-player-start]') : null;
    attachHls(video);

    function playVideo() {
      attachHls(video);
      var promise = video.play();
      if (promise && typeof promise.then === 'function') {
        promise.then(function () {
          if (card) {
            card.classList.add('is-playing');
          }
        }).catch(function () {
          if (card) {
            card.classList.add('is-playing');
          }
          video.controls = true;
        });
      } else if (card) {
        card.classList.add('is-playing');
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    video.addEventListener('play', function () {
      if (card) {
        card.classList.add('is-playing');
      }
    });

    video.addEventListener('pause', function () {
      if (card) {
        card.classList.remove('is-playing');
      }
    });
  });
})();
