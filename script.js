(function () {
    var ADDON_NAME = 'b4e504572ff41522f8fa96df';
    var SWIPER_HIDDEN_CLASS = 'ps-swiper-hidden-left';
    var STORAGE_KEY = 'ps_wheel_open';
    var BTN_ID = 'ps-custom-settings-btn';
    var WHEEL_WIDTH = 320;
    var BANNER_STYLE_ID = 'hvw-banner-style';

    // ─── Settings API ────────────────────────────────────────────────────────

    function applyBannerSetting(hide) {
        var el = document.getElementById(BANNER_STYLE_ID);
        if (!el) {
            el = document.createElement('style');
            el.id = BANNER_STYLE_ID;
            document.head.appendChild(el);
        }
        if (hide) {
            el.textContent = '.MainPage_actionsBar__agoxp { display: none !important; }';
        } else {
            el.textContent = '';
        }
    }

    function initSettings() {
        if (!window.pulsesyncApi) {
            setTimeout(initSettings, 500);
            return;
        }
        var api = window.pulsesyncApi.getSettings(ADDON_NAME);
        if (!api || typeof api.onChange !== 'function') {
            setTimeout(initSettings, 1000);
            return;
        }

        function apply(s) {
            var hide = s && typeof s.hideVibeBanner !== 'undefined'
                ? (s.hideVibeBanner && typeof s.hideVibeBanner === 'object'
                    ? s.hideVibeBanner.value
                    : s.hideVibeBanner)
                : true;
            applyBannerSetting(hide !== false);
        }

        apply(api.getCurrent() || {});
        api.onChange(function (s) { apply(s || {}); });
    }

    // ─── Navbar width tracker ────────────────────────────────────────────────

    function getNavbarWidth() {
        var navbar = document.querySelector('.NavbarDesktop_root__scYzp') ||
                     document.querySelector('[class*="NavbarDesktop_root"]');
        return navbar ? navbar.getBoundingClientRect().width : 60;
    }

    function updateNavbarVar() {
        document.documentElement.style.setProperty('--ps-navbar-width', getNavbarWidth() + 'px');
    }

    // Update on load, resize and navbar expand/collapse
    updateNavbarVar();
    new MutationObserver(updateNavbarVar).observe(document.body, { attributes: true, subtree: true, attributeFilter: ['class', 'style'] });

    // ─── Wheel toggle ────────────────────────────────────────────────────────

    function getWheelElement() {
        return document.querySelector('.swiper.VibePage_wheel__E_p8_') ||
               document.querySelector('.swiper[class*="VibePage_wheel"]');
    }

    function getMeta() {
        return document.querySelector('[class*="VibePage_meta"]');
    }

    function isWheelOpen(swiper) {
        return !!swiper && !swiper.classList.contains(SWIPER_HIDDEN_CLASS);
    }

    function saveWheelState(open) {
        localStorage.setItem(STORAGE_KEY, open ? 'true' : 'false');
    }

    function loadWheelState() {
        return localStorage.getItem(STORAGE_KEY) === 'true';
    }

    function updateLayout() {
        var swiper = getWheelElement();
        var meta = getMeta();
        if (!meta) return;
        var open = swiper ? isWheelOpen(swiper) : false;
        if (open) {
            meta.style.marginLeft = WHEEL_WIDTH + 'px';
            meta.style.width = 'calc(100% - ' + WHEEL_WIDTH + 'px)';
            meta.style.maxWidth = 'calc(100% - ' + WHEEL_WIDTH + 'px)';
        } else {
            meta.style.marginLeft = '';
            meta.style.width = '';
            meta.style.maxWidth = '';
        }
    }

    function applyWheelState(swiper, open) {
        if (!swiper) return;
        swiper.classList.toggle(SWIPER_HIDDEN_CLASS, !open);
        updateLayout();
    }

    function initSwiperToggle() {
        var swiper = getWheelElement();
        if (!swiper) return;

        applyWheelState(swiper, loadWheelState());

        if (document.getElementById(BTN_ID)) {
            updateLayout();
            return;
        }

        var btn = document.createElement('button');
        btn.id = BTN_ID;
        btn.type = 'button';
        btn.className = 'cpeagBA1_PblpJn8Xgtv iJVAJMgccD4vj4E4o068 zIMibMuH7wcqUoW7KH1B IlG7b1K0AD7E7AMx6F5p nHWc2sto1C6Gm0Dpw_l0 C_QGmfTz6UFX93vfPt6Z qU2apWBO1yyEK0lZ3lPO kc5CjvU5hT9KEj0iTt3C VibeSettings_toggleSettingsButton__j6fIU';
        btn.setAttribute('aria-label', 'Настроить Мою волну');
        btn.innerHTML = '<span class="JjlbHZ4FaP9EAcR_1DxF"><svg class="J9wTKytjOWG73QMoN5WP elJfazUBui03YWZgHCbW l3tE1hAMmBj2aoPPwU08" focusable="false" aria-hidden="true"><use xlink:href="/icons/sprite.svg#filter_xxs"></use></svg><span class="_MWOVuZRvUQdXKTMcOPx tk7ahHRDYXJMMB879KUA _3_Mxw7Si7j2g4kWjlpR">Настроить</span></span>';

        btn.addEventListener('click', function () {
            var current = getWheelElement();
            if (!current) return;
            current.classList.toggle(SWIPER_HIDDEN_CLASS);
            saveWheelState(isWheelOpen(current));
            updateLayout();
        });

        var anchor = document.querySelector('.VibePage_words__39Mii') ||
                     document.querySelector('[class*="VibePage_playerBlock"]');
        if (anchor && anchor.parentNode) {
            anchor.parentNode.insertBefore(btn, anchor.nextSibling);
        } else {
            var meta = getMeta();
            if (meta) meta.appendChild(btn);
        }
    }

    // ─── Observers ───────────────────────────────────────────────────────────

    new MutationObserver(function () {
        var swiper = getWheelElement();
        if (swiper && !document.getElementById(BTN_ID)) {
            initSwiperToggle();
        }
    }).observe(document.body, { childList: true, subtree: true });

    window.addEventListener('resize', function () { updateNavbarVar(); updateLayout(); });

    setTimeout(initSwiperToggle, 1000);
    setTimeout(initSwiperToggle, 2500);

    var lastUrl = location.href;
    new MutationObserver(function () {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            setTimeout(function () {
                var old = document.getElementById(BTN_ID);
                if (old) old.remove();
                initSwiperToggle();
            }, 800);
        }
    }).observe(document, { subtree: true, childList: true });

    // ─── Init ────────────────────────────────────────────────────────────────

    initSettings();
})();
