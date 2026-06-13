(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prevButton = document.querySelector('[data-hero-prev]');
    var nextButton = document.querySelector('[data-hero-next]');
    var activeSlide = 0;
    var timer = null;

    function setSlide(index) {
        if (!slides.length) {
            return;
        }

        activeSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeSlide);
        });
    }

    function nextSlide() {
        setSlide(activeSlide + 1);
    }

    function startSlider() {
        if (timer) {
            window.clearInterval(timer);
        }

        if (slides.length > 1) {
            timer = window.setInterval(nextSlide, 5200);
        }
    }

    if (slides.length) {
        setSlide(0);
        startSlider();

        if (prevButton) {
            prevButton.addEventListener('click', function () {
                setSlide(activeSlide - 1);
                startSlider();
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', function () {
                setSlide(activeSlide + 1);
                startSlider();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                setSlide(index);
                startSlider();
            });
        });
    }

    var filterBlocks = Array.prototype.slice.call(document.querySelectorAll('[data-filter-block]'));

    filterBlocks.forEach(function (block) {
        var input = block.querySelector('[data-search-input]');
        var typeSelect = block.querySelector('[data-filter-type]');
        var regionSelect = block.querySelector('[data-filter-region]');
        var yearSelect = block.querySelector('[data-filter-year]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
        var empty = document.querySelector('[data-no-results]');

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function matchCard(card) {
            var keyword = normalize(input ? input.value : '');
            var type = normalize(typeSelect ? typeSelect.value : '');
            var region = normalize(regionSelect ? regionSelect.value : '');
            var year = normalize(yearSelect ? yearSelect.value : '');
            var search = normalize(card.getAttribute('data-search'));
            var cardType = normalize(card.getAttribute('data-type'));
            var cardRegion = normalize(card.getAttribute('data-region'));
            var cardYear = normalize(card.getAttribute('data-year'));

            return (!keyword || search.indexOf(keyword) !== -1) &&
                (!type || cardType === type) &&
                (!region || cardRegion === region) &&
                (!year || cardYear === year);
        }

        function applyFilter() {
            var visible = 0;

            cards.forEach(function (card) {
                var matched = matchCard(card);
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.style.display = visible ? 'none' : 'block';
            }
        }

        [input, typeSelect, regionSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
    });

    var video = document.querySelector('[data-player-video]');
    var playButton = document.querySelector('[data-player-button]');
    var overlay = document.querySelector('[data-player-overlay]');

    if (video) {
        var streamUrl = video.getAttribute('data-source');

        function attachSource() {
            if (!streamUrl) {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                video._hlsInstance = hls;
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else {
                video.src = streamUrl;
            }
        }

        function playVideo() {
            if (!video.src && !video._hlsInstance) {
                attachSource();
            }

            var result = video.play();

            if (result && typeof result.catch === 'function') {
                result.catch(function () {
                    video.setAttribute('controls', 'controls');
                });
            }
        }

        attachSource();

        if (playButton) {
            playButton.addEventListener('click', playVideo);
        }

        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });

        video.addEventListener('pause', function () {
            if (overlay) {
                overlay.classList.remove('is-hidden');
            }
        });
    }
}());
