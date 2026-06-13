(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var current = 0;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-slide')) || 0);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                show(current + 1);
            }, 6200);
        }
    });

    document.querySelectorAll('[data-catalog]').forEach(function (catalog) {
        var input = catalog.querySelector('[data-filter-input]');
        var year = catalog.querySelector('[data-filter-year]');
        var type = catalog.querySelector('[data-filter-type]');
        var cards = Array.prototype.slice.call(catalog.querySelectorAll('.movie-card'));

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function apply() {
            var keyword = normalize(input && input.value);
            var yearValue = normalize(year && year.value);
            var typeValue = normalize(type && type.value);

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-category')
                ].join(' '));
                var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchedYear = !yearValue || normalize(card.getAttribute('data-year')).indexOf(yearValue) !== -1;
                var matchedType = !typeValue || normalize(card.getAttribute('data-type')).indexOf(typeValue) !== -1;
                card.classList.toggle('is-hidden', !(matchedKeyword && matchedYear && matchedType));
            });
        }

        [input, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
    });

    document.querySelectorAll('[data-player]').forEach(function (wrap) {
        var video = wrap.querySelector('video[data-stream]');
        var cover = wrap.querySelector('.player-cover');
        var attached = false;

        function attach() {
            if (!video || attached) {
                return;
            }
            var stream = video.getAttribute('data-stream');
            if (!stream) {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 60
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                video.hlsInstance = hls;
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else {
                video.src = stream;
            }
            attached = true;
        }

        function play() {
            attach();
            wrap.classList.add('is-playing');
            if (video) {
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        video.controls = true;
                    });
                }
            }
        }

        if (cover) {
            cover.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                wrap.classList.add('is-playing');
            });
        }
    });
})();
