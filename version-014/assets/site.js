(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    initMobileMenu();
    initHeroSlider();
    initFilters();
    initSearchPage();
  });

  function initMobileMenu() {
    var button = document.querySelector(".mobile-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(open));
      button.textContent = open ? "×" : "☰";
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector(".hero-slider");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle("is-active", idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle("is-active", idx === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute("data-slide")) || 0);
        start();
      });
    });

    slider.addEventListener("mouseenter", function () {
      window.clearInterval(timer);
    });
    slider.addEventListener("mouseleave", start);
    start();
  }

  function textOf(card) {
    return [
      card.getAttribute("data-title"),
      card.getAttribute("data-year"),
      card.getAttribute("data-type"),
      card.getAttribute("data-region"),
      card.getAttribute("data-genre"),
      card.getAttribute("data-keywords")
    ].join(" ").toLowerCase();
  }

  function initFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    if (!panel) {
      return;
    }
    var keyword = panel.querySelector("[data-filter-keyword]");
    var year = panel.querySelector("[data-filter-year]");
    var type = panel.querySelector("[data-filter-type]");
    var reset = panel.querySelector("[data-filter-reset]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-grid .movie-card"));
    var empty = document.querySelector("[data-filter-empty]");

    function apply() {
      var q = (keyword.value || "").trim().toLowerCase();
      var y = year.value;
      var t = type.value;
      var visible = 0;
      cards.forEach(function (card) {
        var ok = true;
        if (q && textOf(card).indexOf(q) === -1) {
          ok = false;
        }
        if (y && card.getAttribute("data-year") !== y) {
          ok = false;
        }
        if (t && card.getAttribute("data-type") !== t) {
          ok = false;
        }
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [keyword, year, type].forEach(function (item) {
      if (item) {
        item.addEventListener("input", apply);
        item.addEventListener("change", apply);
      }
    });
    if (reset) {
      reset.addEventListener("click", function () {
        keyword.value = "";
        year.value = "";
        type.value = "";
        apply();
      });
    }
  }

  function initSearchPage() {
    var page = document.querySelector("[data-search-page]");
    if (!page || !window.SiteMovieIndex) {
      return;
    }
    var input = document.getElementById("search-input");
    var button = document.getElementById("search-button");
    var results = document.getElementById("search-results");
    var empty = document.getElementById("search-empty");
    var params = new URLSearchParams(window.location.search);
    input.value = params.get("q") || "";

    function card(movie) {
      return [
        '<article class="movie-card">',
        '<a class="poster-wrap" href="' + movie.file + '">',
        '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '<span class="card-badge">' + escapeHtml(movie.region) + '</span>',
        '</a>',
        '<div class="card-body">',
        '<a href="' + movie.file + '"><h3>' + escapeHtml(movie.title) + '</h3></a>',
        '<p>' + escapeHtml(movie.one_line) + '</p>',
        '<div class="card-meta"><span>' + escapeHtml(movie.year) + '年</span><span>' + escapeHtml(movie.type) + '</span></div>',
        '</div>',
        '</article>'
      ].join("");
    }

    function search() {
      var q = (input.value || "").trim().toLowerCase();
      var items = window.SiteMovieIndex.filter(function (movie) {
        var hay = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.one_line].join(" ").toLowerCase();
        return !q || hay.indexOf(q) !== -1;
      }).slice(0, 96);
      results.innerHTML = items.map(card).join("");
      if (empty) {
        empty.classList.toggle("is-visible", items.length === 0);
      }
    }

    button.addEventListener("click", search);
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        search();
      }
    });
    search();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  window.setupVideo = function (id, url) {
    var box = document.getElementById(id);
    if (!box) {
      return;
    }
    var video = box.querySelector("video");
    var cover = box.querySelector(".player-cover");
    var loaded = false;
    var hlsInstance = null;

    function load() {
      if (loaded) {
        return;
      }
      loaded = true;
      video.controls = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function play() {
      load();
      box.classList.add("is-playing");
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          box.classList.remove("is-playing");
        });
      }
    }

    if (cover) {
      cover.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
    video.addEventListener("play", function () {
      box.classList.add("is-playing");
    });
    video.addEventListener("pause", function () {
      box.classList.remove("is-playing");
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
}());
