window.MoviePlayer = (function () {
  function showMessage(videoId, text) {
    var message = document.querySelector(
      '[data-player-message="' + videoId + '"]',
    );
    if (message) {
      message.textContent = text;
      message.hidden = !text;
    }
  }

  function init(videoId, streamUrl) {
    var video = document.getElementById(videoId);
    var button = document.querySelector(
      '[data-player-button="' + videoId + '"]',
    );
    var hls = null;
    var initialized = false;
    var Hls = window.HlsBundle && window.HlsBundle.H;

    if (!video || !streamUrl) {
      return;
    }

    function hideButton() {
      if (button) {
        button.classList.add("is-hidden");
      }
    }

    function showButton() {
      if (button && video.paused) {
        button.classList.remove("is-hidden");
      }
    }

    function playVideo() {
      hideButton();
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          showButton();
        });
      }
    }

    function start() {
      showMessage(videoId, "");
      if (!initialized) {
        initialized = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
          video.addEventListener("loadedmetadata", playVideo, { once: true });
          video.load();
          return;
        }

        if (Hls && Hls.isSupported()) {
          hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, playVideo);
          hls.on(Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              showMessage(videoId, "播放加载失败，请稍后再试");
              showButton();
              if (hls) {
                hls.destroy();
                hls = null;
              }
              initialized = false;
            }
          });
          return;
        }

        video.src = streamUrl;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
        video.load();
        return;
      }

      playVideo();
    }

    if (button) {
      button.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener("play", hideButton);
    video.addEventListener("pause", showButton);
    video.addEventListener("ended", showButton);
  }

  return {
    init: init,
  };
})();
