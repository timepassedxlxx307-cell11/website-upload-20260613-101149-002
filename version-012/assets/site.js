document.addEventListener("DOMContentLoaded", function () {
    var mobileToggle = document.querySelector("[data-mobile-toggle]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (mobileToggle && mobilePanel) {
        mobileToggle.addEventListener("click", function () {
            mobilePanel.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var previous = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function setSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle("is-active", position === current);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle("is-active", position === current);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                setSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                setSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                startTimer();
            });
        });

        if (previous) {
            previous.addEventListener("click", function () {
                setSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                setSlide(current + 1);
                startTimer();
            });
        }

        startTimer();
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function filterCards(scope, value) {
        var query = normalize(value);
        var list = scope.querySelector("[data-movie-list]") || document.querySelector("[data-movie-list]");

        if (!list) {
            return;
        }

        Array.prototype.slice.call(list.querySelectorAll(".movie-card")).forEach(function (card) {
            var haystack = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-tags"),
                card.getAttribute("data-year"),
                card.getAttribute("data-region"),
                card.textContent
            ].join(" "));
            card.classList.toggle("is-hidden", query && haystack.indexOf(query) === -1);
        });
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]")).forEach(function (input) {
        input.addEventListener("input", function () {
            filterCards(document, input.value);
        });
    });

    Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]")).forEach(function (button) {
        button.addEventListener("click", function () {
            var value = button.getAttribute("data-filter-value") || "";
            var input = document.querySelector("[data-filter-input]");
            Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]")).forEach(function (item) {
                item.classList.toggle("is-active", item === button);
            });
            if (input) {
                input.value = value;
            }
            filterCards(document, value);
        });
    });

    var params = new URLSearchParams(window.location.search);
    var searchValue = params.get("q");
    var librarySearch = document.getElementById("library-search");

    if (searchValue && librarySearch) {
        librarySearch.value = searchValue;
        filterCards(document, searchValue);
    }
});
