(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuToggle = document.querySelector("[data-menu-toggle]");
    var siteNav = document.querySelector("[data-site-nav]");

    if (menuToggle && siteNav) {
      menuToggle.addEventListener("click", function () {
        siteNav.classList.toggle("is-open");
      });
    }

    initHero();
    initFilters();
    initSearchPage();
    initPlayer();
  });

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    var lists = Array.prototype.slice.call(document.querySelectorAll("[data-filter-list]"));

    lists.forEach(function (list) {
      var section = list.closest("section") || document;
      var input = section.querySelector("[data-filter-input]");
      var type = section.querySelector("[data-filter-type]");
      var year = section.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
      var empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "没有找到匹配的影片";

      function valueOf(element) {
        return element ? element.value.trim().toLowerCase() : "";
      }

      function apply() {
        var keyword = valueOf(input);
        var typeValue = valueOf(type);
        var yearValue = valueOf(year);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year")
          ].join(" ").toLowerCase();
          var okKeyword = !keyword || haystack.indexOf(keyword) >= 0;
          var okType = !typeValue || (card.getAttribute("data-type") || "").toLowerCase() === typeValue;
          var okYear = !yearValue || (card.getAttribute("data-year") || "").toLowerCase() === yearValue;
          var ok = okKeyword && okType && okYear;
          card.classList.toggle("is-filtered-out", !ok);
          if (ok) {
            visible += 1;
          }
        });

        if (visible === 0) {
          if (!empty.parentNode) {
            list.appendChild(empty);
          }
        } else if (empty.parentNode) {
          empty.parentNode.removeChild(empty);
        }
      }

      [input, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  function initSearchPage() {
    var results = document.querySelector("[data-search-results]");
    if (!results || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var input = document.querySelector("[data-search-page-input]");
    var title = document.querySelector("[data-search-title]");

    if (input) {
      input.value = query;
    }

    if (!query) {
      return;
    }

    var words = query.toLowerCase().split(/\s+/).filter(Boolean);
    var matched = window.MOVIE_SEARCH_INDEX.filter(function (item) {
      var haystack = [item.title, item.year, item.region, item.type, item.genre, item.tags, item.category].join(" ").toLowerCase();
      return words.every(function (word) {
        return haystack.indexOf(word) >= 0;
      });
    }).slice(0, 120);

    if (title) {
      title.textContent = "搜索结果：" + query;
    }

    if (!matched.length) {
      results.innerHTML = '<div class="empty-state">没有找到匹配的影片</div>';
      return;
    }

    results.innerHTML = matched.map(function (item) {
      return '<article class="movie-card">' +
        '<a class="movie-poster" href="' + escapeHtml(item.file) + '" aria-label="' + escapeHtml(item.title) + ' 在线观看">' +
        '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
        '<span class="movie-type">' + escapeHtml(item.type) + '</span>' +
        '<span class="play-mark">▶</span>' +
        '</a>' +
        '<div class="movie-info">' +
        '<h3><a href="' + escapeHtml(item.file) + '">' + escapeHtml(item.title) + '</a></h3>' +
        '<p class="movie-meta">' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(item.genre) + '</p>' +
        '<p class="movie-line">' + escapeHtml(item.line) + '</p>' +
        '<div class="tag-row"><span class="tag">' + escapeHtml(item.category) + '</span></div>' +
        '</div>' +
        '</article>';
    }).join("");
  }

  function initPlayer() {
    var video = document.querySelector("[data-player]");
    if (!video) {
      return;
    }

    var overlay = document.querySelector("[data-play-overlay]");
    var stream = video.getAttribute("data-stream");
    var loaded = false;
    var hlsInstance = null;

    function load() {
      if (loaded || !stream) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          maxBufferLength: 30
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }

      loaded = true;
    }

    function play() {
      load();

      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char];
    });
  }
})();
