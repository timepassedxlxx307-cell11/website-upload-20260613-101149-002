(function() {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function() {
            mobileNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-filter-scope]').forEach(function(scope) {
        var section = scope.parentElement;
        var input = scope.querySelector('[data-search-input]');
        var typeFilter = scope.querySelector('[data-type-filter]');
        var yearFilter = scope.querySelector('[data-year-filter]');
        var cards = section ? Array.prototype.slice.call(section.querySelectorAll('[data-card]')) : [];

        function normalize(value) {
            return (value || '').toString().trim().toLowerCase();
        }

        function apply() {
            var query = normalize(input && input.value);
            var typeValue = normalize(typeFilter && typeFilter.value);
            var yearValue = normalize(yearFilter && yearFilter.value);

            cards.forEach(function(card) {
                var text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year')
                ].join(' '));
                var cardType = normalize(card.getAttribute('data-type'));
                var cardYear = normalize(card.getAttribute('data-year'));
                var matchedQuery = !query || text.indexOf(query) !== -1;
                var matchedType = !typeValue || cardType.indexOf(typeValue) !== -1;
                var matchedYear = !yearValue || cardYear === yearValue;
                card.hidden = !(matchedQuery && matchedType && matchedYear);
            });
        }

        [input, typeFilter, yearFilter].forEach(function(control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
    });

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function(slide, i) {
                slide.classList.toggle('is-active', i === active);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle('is-active', i === active);
            });
        }

        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function() {
                show(active + 1);
            }, 5200);
        }

        dots.forEach(function(dot, i) {
            dot.addEventListener('click', function() {
                show(i);
                start();
            });
        });

        start();
    }
})();
