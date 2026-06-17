(function () {
  var boxes = Array.prototype.slice.call(document.querySelectorAll(".player-box"));

  boxes.forEach(function (box) {
    var video = box.querySelector("video");
    var cover = box.querySelector(".player-cover");
    var url = video ? video.getAttribute("data-video") : "";
    var ready = false;
    var hls = null;

    if (!video || !cover || !url) {
      return;
    }

    function playVideo() {
      cover.classList.add("is-hidden");
      video.setAttribute("controls", "controls");
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    function prepare() {
      if (ready) {
        playVideo();
        return;
      }

      ready = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal && hls) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            }
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
        video.load();
      }
    }

    cover.addEventListener("click", prepare);
    video.addEventListener("click", function () {
      if (!ready) {
        prepare();
        return;
      }
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  });
})();
