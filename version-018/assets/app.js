(function () {
  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $all(selector, scope) {
    return Array.prototype.slice.call(
      (scope || document).querySelectorAll(selector),
    );
  }

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .trim();
  }

  function openMobileMenu() {
    $all("[data-nav-menu]").forEach(function (menu) {
      menu.classList.toggle("is-open");
    });
    var search = $(".nav-search");
    if (search) {
      search.classList.toggle("is-open");
    }
  }

  function bindNav() {
    $all("[data-nav-toggle]").forEach(function (button) {
      button.addEventListener("click", openMobileMenu);
    });
  }

  function bindSiteSearch() {
    $all("[data-site-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var url = "./search.html";
        if (query) {
          url += "?q=" + encodeURIComponent(query);
        }
        window.location.href = url;
      });
    });
  }

  function applyFilter(scope) {
    var input = $("[data-filter-input]", scope);
    var typeSelect = $("[data-filter-type]", scope);
    var yearSelect = $("[data-filter-year]", scope);
    var list = scope.parentElement.querySelector("[data-filter-list]");
    var empty = scope.parentElement.querySelector("[data-empty-state]");
    var query = normalize(input && input.value);
    var type = normalize(typeSelect && typeSelect.value);
    var year = normalize(yearSelect && yearSelect.value);
    var visible = 0;

    if (!list) {
      return;
    }

    $all("[data-movie-card]", list).forEach(function (card) {
      var text = normalize(
        [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.tags,
        ].join(" "),
      );
      var matchesQuery = !query || text.indexOf(query) !== -1;
      var matchesType = !type || normalize(card.dataset.type) === type;
      var matchesYear = !year || normalize(card.dataset.year) === year;
      var show = matchesQuery && matchesType && matchesYear;
      card.hidden = !show;
      if (show) {
        visible += 1;
      }
    });

    if (empty) {
      empty.hidden = visible !== 0;
    }
  }

  function bindFilters() {
    $all("[data-filter-scope]").forEach(function (scope) {
      var input = $("[data-filter-input]", scope);
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";

      if (scope.hasAttribute("data-search-page") && input && query) {
        input.value = query;
      }

      $all("input, select", scope).forEach(function (control) {
        control.addEventListener("input", function () {
          applyFilter(scope);
        });
        control.addEventListener("change", function () {
          applyFilter(scope);
        });
      });

      applyFilter(scope);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    bindNav();
    bindSiteSearch();
    bindFilters();
  });
})();
