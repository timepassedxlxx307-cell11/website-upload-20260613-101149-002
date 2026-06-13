(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var activeIndex = 0;

    function setSlide(index) {
      if (!slides.length) {
        return;
      }
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === activeIndex);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === activeIndex);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        setSlide(i);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        setSlide(activeIndex + 1);
      }, 5200);
    }

    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
    forms.forEach(function (form) {
      var root = form.closest("main") || document;
      var cards = Array.prototype.slice.call(root.querySelectorAll(".movie-card"));
      var query = form.querySelector("[data-filter-query]");
      var category = form.querySelector("[data-filter-category]");
      var year = form.querySelector("[data-filter-year]");
      var empty = root.querySelector("[data-no-results]");

      function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
      }

      function applyFilter() {
        var keyword = normalize(query && query.value);
        var categoryValue = normalize(category && category.value);
        var yearValue = normalize(year && year.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-category"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre")
          ].join(" "));
          var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchCategory = !categoryValue || normalize(card.getAttribute("data-category")) === categoryValue;
          var matchYear = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
          var show = matchKeyword && matchCategory && matchYear;
          card.classList.toggle("is-hidden", !show);
          if (show) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [query, category, year].forEach(function (field) {
        if (field) {
          field.addEventListener("input", applyFilter);
          field.addEventListener("change", applyFilter);
        }
      });
    });
  });
})();
