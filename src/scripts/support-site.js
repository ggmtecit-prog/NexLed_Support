(() => {
    const ROUTES = {
        home: 'index.html',
        repair: 'repair.html',
        downloads: 'downloads.html',
        contact: 'contact.html',
        store: '#',
        faq: 'index.html#faq',
        warranty: 'index.html#warranty',
    };

    const LANG_OPTIONS = {
        gb: { lang: 'en', label: 'English' },
        pt: { lang: 'pt', label: 'Portuguese' },
        es: { lang: 'es', label: 'Spanish' },
        fr: { lang: 'fr', label: 'French' },
    };

    function langToSelectorCode(lang) {
        return lang === 'en' ? 'gb' : lang;
    }

    function selectorCodeToLang(code) {
        return code === 'gb' ? 'en' : code;
    }

    function getLanguageOptionMarkup(code) {
        const option = LANG_OPTIONS[code];
        if (!option) {
            return '';
        }

        return `
            <img class="language-selector-flag" src="https://flagcdn.com/w40/${code}.png"
                srcset="https://flagcdn.com/w80/${code}.png 2x" width="20" height="20" alt="">
            <span>${option.label}</span>
            <i class="ri-check-line language-selector-check" aria-hidden="true"></i>
        `;
    }

    function ensureLanguageOption(selector, code) {
        if (selector.querySelector(`.language-selector-option[data-code="${code}"]`)) {
            return;
        }

        const menu = selector.querySelector('.language-selector-menu');
        if (!menu || !LANG_OPTIONS[code]) {
            return;
        }

        const option = document.createElement('li');
        option.className = 'language-selector-option';
        option.setAttribute('role', 'option');
        option.setAttribute('aria-selected', 'false');
        option.dataset.code = code;
        option.innerHTML = getLanguageOptionMarkup(code);
        menu.appendChild(option);
    }

    function syncLanguageSelector(selector, lang) {
        ensureLanguageOption(selector, 'fr');

        const code = langToSelectorCode(lang);
        const trigger = selector.querySelector('.language-selector-trigger');
        const triggerFlag = selector.querySelector('.language-selector-current .language-selector-flag');
        const options = selector.querySelectorAll('.language-selector-option');

        options.forEach((option) => {
            option.setAttribute('aria-selected', String(option.dataset.code === code));
        });

        if (trigger) {
            const langLabel = LANG_OPTIONS[code]?.label || LANG_OPTIONS.gb.label;
            trigger.setAttribute('aria-label', `Current language: ${langLabel}`);
        }

        if (triggerFlag) {
            triggerFlag.src = `https://flagcdn.com/w40/${code}.png`;
            triggerFlag.srcset = `https://flagcdn.com/w80/${code}.png 2x`;
            triggerFlag.alt = '';
        }

        selector.classList.add('has-value');
    }

    function buildNextUrl(lang, preserveQueryKeys = []) {
        const nextUrl = new URL(window.location.href);
        const currentParams = new URLSearchParams(window.location.search);
        const nextParams = new URLSearchParams();

        preserveQueryKeys.forEach((key) => {
            if (currentParams.has(key)) {
                nextParams.set(key, currentParams.get(key));
            }
        });

        nextParams.set('lang', lang);
        nextUrl.search = nextParams.toString();
        return nextUrl.toString();
    }

    function bindLanguageSelector(selector, preserveQueryKeys = []) {
        ensureLanguageOption(selector, 'fr');

        const menu = selector.querySelector('.language-selector-menu');
        if (!menu || menu.dataset.supportSiteBound === 'true') {
            return;
        }

        menu.dataset.supportSiteBound = 'true';

        function updateLanguage(code) {
            const nextLang = selectorCodeToLang(code);

            try {
                localStorage.setItem('nexled.lang', nextLang);
            } catch (error) {
            }

            window.location.assign(buildNextUrl(nextLang, preserveQueryKeys));
        }

        menu.addEventListener('click', (event) => {
            const option = event.target.closest('.language-selector-option');
            if (!option) {
                return;
            }

            updateLanguage(option.dataset.code || 'gb');
        });

        menu.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') {
                return;
            }

            const option = event.target.closest('.language-selector-option');
            if (!option) {
                return;
            }

            event.preventDefault();
            updateLanguage(option.dataset.code || 'gb');
        });
    }

    function hydrateRouteTarget(element) {
        const routeKey = element.dataset.supportRoute;
        const target = ROUTES[routeKey] || '#';

        if (element.tagName === 'A') {
            element.setAttribute('href', target);
            return;
        }

        if (target === '#') {
            return;
        }

        element.addEventListener('click', () => {
            window.location.assign(target);
        });
    }

    function hydrateLinks() {
        document.querySelectorAll('[data-support-route]').forEach(hydrateRouteTarget);

        document.querySelectorAll('[data-support-mail]').forEach((link) => {
            const email = link.dataset.supportMail;
            if (!email) {
                return;
            }

            if (link.tagName === 'A') {
                link.setAttribute('href', `mailto:${email}`);
            }
        });

        document.querySelectorAll('[data-support-tel]').forEach((link) => {
            const phone = link.dataset.supportTel;
            if (!phone) {
                return;
            }

            if (link.tagName === 'A') {
                link.setAttribute('href', `tel:${phone.replace(/\s+/g, '')}`);
            }
        });
    }

    function initPage(options = {}) {
        const preserveQueryKeys = Array.isArray(options.preserveQueryKeys) ? options.preserveQueryKeys : [];
        const currentLang = window.Utils && typeof Utils.getLang === 'function' ? Utils.getLang() : 'pt';
        const selector = document.querySelector('.language-selector');

        document.documentElement.lang = currentLang;

        if (selector) {
            syncLanguageSelector(selector, currentLang);
            bindLanguageSelector(selector, preserveQueryKeys);
        }

        hydrateLinks();
    }

    window.SupportSite = {
        ROUTES,
        initPage,
        syncLanguageSelector,
        bindLanguageSelector,
        langToSelectorCode,
        selectorCodeToLang,
    };
})();
