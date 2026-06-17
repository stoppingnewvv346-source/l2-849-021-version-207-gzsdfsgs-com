function initMoviePlayer(streamUrl) {
  const video = document.getElementById("movie-player");
  const overlay = document.querySelector(".player-overlay");
  if (!video || !overlay || !streamUrl) {
    return;
  }

  let attached = false;
  let hlsInstance = null;

  function attachStream() {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      return;
    }
    video.src = streamUrl;
  }

  function startPlayback() {
    attachStream();
    video.controls = true;
    overlay.classList.add("is-hidden");
    const promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function() {
        overlay.classList.remove("is-hidden");
      });
    }
  }

  overlay.addEventListener("click", startPlayback);
  video.addEventListener("click", function() {
    if (video.paused) {
      startPlayback();
    }
  });
  video.addEventListener("play", function() {
    overlay.classList.add("is-hidden");
  });
  video.addEventListener("ended", function() {
    overlay.classList.remove("is-hidden");
  });
  window.addEventListener("pagehide", function() {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
