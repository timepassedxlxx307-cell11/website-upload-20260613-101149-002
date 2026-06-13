(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileMenu = document.querySelector('.mobile-menu');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            var opened = mobileMenu.hasAttribute('hidden');
            if (opened) {
                mobileMenu.removeAttribute('hidden');
            } else {
                mobileMenu.setAttribute('hidden', '');
            }
            menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var currentSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === currentSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === currentSlide);
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showSlide(Number(dot.getAttribute('data-hero-dot') || 0));
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    var backTop = document.querySelector('.back-top');
    if (backTop) {
        backTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function applyLocalFilters(scope) {
        var list = scope.querySelector('[data-filter-list]');
        if (!list) {
            return;
        }
        var keywordInput = scope.querySelector('.local-filter');
        var yearSelect = scope.querySelector('.year-filter');
        var keyword = normalize(keywordInput && keywordInput.value);
        var year = yearSelect && yearSelect.value;
        Array.prototype.slice.call(list.querySelectorAll('.movie-card')).forEach(function (card) {
            var text = normalize(card.textContent + ' ' + card.getAttribute('data-title') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-type'));
            var cardYear = card.getAttribute('data-year') || '';
            var matched = (!keyword || text.indexOf(keyword) !== -1) && (!year || cardYear === year);
            card.classList.toggle('is-filtered-out', !matched);
        });
    }

    document.querySelectorAll('.filter-bar').forEach(function (bar) {
        var scope = bar.closest('section') || document;
        bar.querySelectorAll('input, select').forEach(function (field) {
            field.addEventListener('input', function () {
                applyLocalFilters(scope);
            });
            field.addEventListener('change', function () {
                applyLocalFilters(scope);
            });
        });
    });

    var searchInput = document.getElementById('searchInput');
    var searchYear = document.getElementById('searchYear');
    var searchRegion = document.getElementById('searchRegion');
    var searchType = document.getElementById('searchType');
    var searchResults = document.getElementById('searchResults');

    function applySearch() {
        if (!searchResults) {
            return;
        }
        var keyword = normalize(searchInput && searchInput.value);
        var year = searchYear && searchYear.value;
        var region = searchRegion && searchRegion.value;
        var type = searchType && searchType.value;
        Array.prototype.slice.call(searchResults.querySelectorAll('.movie-card')).forEach(function (card) {
            var text = normalize(card.textContent + ' ' + card.getAttribute('data-title') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-type'));
            var matched = true;
            if (keyword && text.indexOf(keyword) === -1) {
                matched = false;
            }
            if (year && card.getAttribute('data-year') !== year) {
                matched = false;
            }
            if (region && card.getAttribute('data-region') !== region) {
                matched = false;
            }
            if (type && card.getAttribute('data-type') !== type) {
                matched = false;
            }
            card.classList.toggle('is-filtered-out', !matched);
        });
    }

    if (searchInput && searchResults) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q') || '';
        if (q) {
            searchInput.value = q;
        }
        [searchInput, searchYear, searchRegion, searchType].forEach(function (field) {
            if (field) {
                field.addEventListener('input', applySearch);
                field.addEventListener('change', applySearch);
            }
        });
        applySearch();
    }

    function setupPlayer(player) {
        var video = player.querySelector('video');
        var overlay = player.querySelector('.player-overlay');
        var url = player.getAttribute('data-m3u8');
        var started = false;

        function start() {
            if (!video || !url) {
                return;
            }
            if (!started) {
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                    video._hlsInstance = hls;
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                } else {
                    video.src = url;
                }
                started = true;
            }
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            video.controls = true;
            var playPromise = video.play();
            if (playPromise && playPromise.catch) {
                playPromise.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener('click', start);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (!started) {
                    start();
                }
            });
        }
    }

    document.querySelectorAll('.player-box').forEach(setupPlayer);
})();
