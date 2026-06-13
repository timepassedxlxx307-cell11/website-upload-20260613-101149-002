(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function textValue(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function matchYear(cardYear, filter) {
    var year = parseInt(cardYear || "0", 10);
    if (filter === "all") {
      return true;
    }
    if (filter === "2020") {
      return year >= 2020;
    }
    if (filter === "2010") {
      return year >= 2010 && year < 2020;
    }
    if (filter === "2000") {
      return year >= 2000 && year < 2010;
    }
    if (filter === "1990") {
      return year > 0 && year < 2000;
    }
    return true;
  }

  function applyFilters(panel) {
    var scope = panel.closest("section") || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
    var input = panel.querySelector("[data-search-input]");
    var yearSelect = panel.querySelector("[data-year-filter]");
    var typeSelect = panel.querySelector("[data-type-filter]");
    var empty = scope.querySelector("[data-empty-state]");
    var keyword = textValue(input && input.value);
    var yearFilter = yearSelect ? yearSelect.value : "all";
    var typeFilter = typeSelect ? typeSelect.value : "all";
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = textValue([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags"),
        card.getAttribute("data-year"),
        card.getAttribute("data-type")
      ].join(" "));
      var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
      var yearMatch = matchYear(card.getAttribute("data-year"), yearFilter);
      var typeMatch = typeFilter === "all" || card.getAttribute("data-type") === typeFilter;
      var isVisible = keywordMatch && yearMatch && typeMatch;
      card.classList.toggle("hidden", !isVisible);
      if (isVisible) {
        visible += 1;
      }
    });
    if (empty) {
      empty.hidden = visible !== 0;
    }
  }

  function initSearch() {
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));
    forms.forEach(function (form) {
      var input = form.querySelector("[data-search-input]");
      if (input && query && document.querySelector("[data-library]")) {
        input.value = query;
      }
      form.addEventListener("submit", function (event) {
        var localPanel = form.closest("[data-filter-panel]");
        if (localPanel) {
          event.preventDefault();
          applyFilters(localPanel);
        }
      });
    });
    panels.forEach(function (panel) {
      var controls = Array.prototype.slice.call(panel.querySelectorAll("input, select"));
      controls.forEach(function (control) {
        control.addEventListener("input", function () {
          applyFilters(panel);
        });
        control.addEventListener("change", function () {
          applyFilters(panel);
        });
      });
      if (query) {
        applyFilters(panel);
      }
    });
  }

  function attachStream(player) {
    if (player.dataset.ready === "1") {
      return;
    }
    var video = player.querySelector("video");
    var stream = player.getAttribute("data-stream");
    if (!video || !stream) {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      player._hls = hls;
    } else {
      video.src = stream;
    }
    player.dataset.ready = "1";
  }

  function startPlayer(player) {
    var video = player.querySelector("video");
    if (!video) {
      return;
    }
    attachStream(player);
    player.classList.add("is-playing");
    var playResult = video.play();
    if (playResult && typeof playResult.catch === "function") {
      playResult.catch(function () {
        player.classList.remove("is-playing");
      });
    }
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var cover = player.querySelector(".play-cover");
      if (cover) {
        cover.addEventListener("click", function () {
          startPlayer(player);
        });
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            startPlayer(player);
          }
        });
        video.addEventListener("play", function () {
          player.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
          if (video.currentTime === 0) {
            player.classList.remove("is-playing");
          }
        });
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initSearch();
    initPlayers();
  });
})();
