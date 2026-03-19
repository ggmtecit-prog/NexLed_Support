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
    let flyoutConfigPromise = null;
    let siteCopyPromise = null;

    function langToSelectorCode(lang) {
        return lang === 'en' ? 'gb' : lang;
    }

    function selectorCodeToLang(code) {
        return code === 'gb' ? 'en' : code;
    }

    function getFlyoutConfig() {
        if (flyoutConfigPromise) {
            return flyoutConfigPromise;
        }

        if (!window.Utils || typeof Utils.fetchJSON !== 'function') {
            flyoutConfigPromise = Promise.resolve(null);
            return flyoutConfigPromise;
        }

        flyoutConfigPromise = Utils.fetchJSON('data/flyouts.json');
        return flyoutConfigPromise;
    }

    function getSiteCopy() {
        if (siteCopyPromise) {
            return siteCopyPromise;
        }

        if (!window.Utils || typeof Utils.fetchJSON !== 'function') {
            siteCopyPromise = Promise.resolve(null);
            return siteCopyPromise;
        }

        siteCopyPromise = Utils.fetchJSON('data/site-copy.json');
        return siteCopyPromise;
    }

    function getTextValue(value, fallback = '') {
        return typeof value === 'string' && value.trim() ? value.trim() : fallback;
    }

    function escapeHTML(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function normalizeFlyoutId(value, fallback) {
        const normalized = getTextValue(value, fallback)
            .toLowerCase()
            .replace(/[^a-z0-9_-]+/g, '-')
            .replace(/-{2,}/g, '-')
            .replace(/^-|-$/g, '');

        return normalized || fallback;
    }

    function sanitizeFlyoutHref(value) {
        const href = getTextValue(value, '#');
        if (
            href.startsWith('//') ||
            /^[a-z][a-z0-9+.-]*:/i.test(href) ||
            /^javascript:/i.test(href)
        ) {
            return '#';
        }

        return href;
    }

    function getByPath(source, path) {
        return String(path || '')
            .split('.')
            .filter(Boolean)
            .reduce((value, segment) => (value && value[segment] !== undefined ? value[segment] : undefined), source);
    }

    function resolveLocalizedValue(node, lang, fallback = '') {
        if (node === undefined || node === null) {
            return fallback;
        }

        if (typeof node === 'string') {
            return node;
        }

        if (window.Utils && typeof Utils.t === 'function' && typeof node === 'object') {
            return Utils.t(node, lang, fallback);
        }

        return fallback;
    }

    function buildFlyoutMarkup(menuKey, flyout) {
        const categories = Array.isArray(flyout?.categories) ? flyout.categories : [];
        if (!categories.length) {
            return '';
        }

        const safeMenuKey = normalizeFlyoutId(menuKey, 'flyout');
        const navLabel = escapeHTML(
            getTextValue(flyout.navLabel, getTextValue(flyout.ariaLabel, 'Flyout categories'))
        );

        const tabsMarkup = categories.map((category, index) => {
            const isActive = index === 0;
            const categoryId = normalizeFlyoutId(category?.id, `category-${index + 1}`);
            const categoryLabel = escapeHTML(getTextValue(category?.label, `Category ${index + 1}`));

            return `
                <button type="button" class="flyout-nav-item${isActive ? ' is-active' : ''}"
                    id="support-${safeMenuKey}-flyout-tab-${categoryId}" role="tab"
                    aria-selected="${isActive ? 'true' : 'false'}"
                    aria-controls="support-${safeMenuKey}-flyout-panel-${categoryId}"
                    data-flyout-category="${categoryId}" tabindex="${isActive ? '0' : '-1'}">
                    <span>${categoryLabel}</span>
                    <i class="ri-arrow-right-s-line" aria-hidden="true"></i>
                </button>
            `;
        }).join('');

        const panelsMarkup = categories.map((category, index) => {
            const categoryId = normalizeFlyoutId(category?.id, `category-${index + 1}`);
            const itemsMarkup = (category.items || []).map((item) => {
                const itemLabel = escapeHTML(getTextValue(item?.label, 'Product'));
                const imagePath = Utils.sanitizeImagePath(getTextValue(item?.image, ''));
                const imageMarkup = imagePath
                    ? `<img src="${escapeHTML(imagePath)}" alt="${escapeHTML(getTextValue(item?.alt, getTextValue(item?.label, 'Product image')))}">`
                    : '';
                const href = escapeHTML(sanitizeFlyoutHref(item?.href));

                return `
                    <a href="${href}" class="flyout-link">
                        <span class="flyout-media">
                            ${imageMarkup}
                        </span>
                        <span class="flyout-label">${itemLabel}</span>
                    </a>
                `;
            }).join('');

            return `
                <div class="flyout-grid" id="support-${safeMenuKey}-flyout-panel-${categoryId}" role="tabpanel"
                    aria-labelledby="support-${safeMenuKey}-flyout-tab-${categoryId}"
                    data-flyout-panel="${categoryId}"${index === 0 ? '' : ' hidden'}>
                    ${itemsMarkup}
                </div>
            `;
        }).join('');

        return `
            <div class="flyout-body">
                <nav class="flyout-nav" aria-label="${navLabel}" role="tablist">
                    ${tabsMarkup}
                </nav>
                <div class="flyout-copy">
                    ${panelsMarkup}
                </div>
            </div>
        `;
    }

    function bindSupportFlyouts() {
        document.querySelectorAll('[data-support-flyout-products]').forEach((flyout) => {
            if (flyout.dataset.supportFlyoutBound === 'true') {
                return;
            }

            flyout.dataset.supportFlyoutBound = 'true';

            const tabs = Array.from(flyout.querySelectorAll('[data-flyout-category]'));
            const panels = Array.from(flyout.querySelectorAll('[data-flyout-panel]'));
            if (tabs.length === 0 || panels.length === 0) {
                return;
            }

            const activateCategory = (category) => {
                tabs.forEach((tab) => {
                    const isActive = tab.dataset.flyoutCategory === category;
                    tab.classList.toggle('is-active', isActive);
                    tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
                    tab.setAttribute('tabindex', isActive ? '0' : '-1');
                });

                panels.forEach((panel) => {
                    panel.hidden = panel.dataset.flyoutPanel !== category;
                });
            };

            tabs.forEach((tab, index) => {
                tab.addEventListener('click', () => {
                    activateCategory(tab.dataset.flyoutCategory);
                });

                tab.addEventListener('keydown', (event) => {
                    let nextIndex = index;

                    if (event.key === 'ArrowDown') {
                        nextIndex = (index + 1) % tabs.length;
                    } else if (event.key === 'ArrowUp') {
                        nextIndex = (index - 1 + tabs.length) % tabs.length;
                    } else if (event.key === 'Home') {
                        nextIndex = 0;
                    } else if (event.key === 'End') {
                        nextIndex = tabs.length - 1;
                    } else {
                        return;
                    }

                    event.preventDefault();
                    const nextTab = tabs[nextIndex];
                    activateCategory(nextTab.dataset.flyoutCategory);
                    nextTab.focus();
                });
            });

            activateCategory(
                tabs.find((tab) => tab.classList.contains('is-active'))?.dataset.flyoutCategory ||
                tabs[0].dataset.flyoutCategory
            );
        });
    }

    async function hydrateFlyouts() {
        const flyoutConfig = await getFlyoutConfig();
        if (!flyoutConfig || typeof flyoutConfig !== 'object') {
            return;
        }

        document.querySelectorAll('.dropdown.dropdown-flyout').forEach((dropdown) => {
            const routeKey = dropdown.querySelector('.dropdown-trigger')?.dataset.supportRoute;
            const flyout = flyoutConfig[routeKey];
            const menu = dropdown.querySelector('.dropdown-menu');

            if (!flyout || !menu) {
                return;
            }

            menu.classList.remove('flyout-features');
            menu.classList.add('flyout-products');
            menu.removeAttribute('data-flyout-products');
            menu.setAttribute('data-support-flyout-products', '');
            menu.setAttribute('role', 'dialog');

            if (flyout.ariaLabel) {
                menu.setAttribute('aria-label', flyout.ariaLabel);
            }

            menu.innerHTML = buildFlyoutMarkup(routeKey, flyout);
        });

        bindSupportFlyouts();
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

    function getCurrentLang() {
        return window.Utils && typeof Utils.getLang === 'function' ? Utils.getLang() : 'pt';
    }

    function withLang(url, lang, preserveQueryKeys = []) {
        if (!url || url.startsWith('#')) {
            return url;
        }

        let parsedUrl;
        try {
            parsedUrl = new URL(url, window.location.href);
        } catch (error) {
            return url;
        }

        if (parsedUrl.origin !== window.location.origin) {
            return url;
        }

        if (!/\.html?$/i.test(parsedUrl.pathname) && !/\.php$/i.test(parsedUrl.pathname)) {
            return url;
        }

        const currentParams = new URLSearchParams(window.location.search);
        preserveQueryKeys.forEach((key) => {
            if (!parsedUrl.searchParams.has(key) && currentParams.has(key)) {
                parsedUrl.searchParams.set(key, currentParams.get(key));
            }
        });

        parsedUrl.searchParams.set('lang', lang);

        const isSameOrigin = parsedUrl.origin === window.location.origin;
        return isSameOrigin ? `${parsedUrl.pathname.split('/').pop()}${parsedUrl.search}${parsedUrl.hash}` : parsedUrl.toString();
    }

    function hydrateRouteTarget(element) {
        const routeKey = element.dataset.supportRoute;
        const preserveQueryKeys = (element.dataset.supportPreserveQuery || '')
            .split(',')
            .map((key) => key.trim())
            .filter(Boolean);
        const target = withLang(ROUTES[routeKey] || '#', getCurrentLang(), preserveQueryKeys);

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

    function hydrateInternalLangLinks() {
        const currentLang = getCurrentLang();

        document.querySelectorAll('a[href]').forEach((link) => {
            if (link.dataset.supportRoute) {
                return;
            }

            const href = link.getAttribute('href');
            if (!href) {
                return;
            }

            const preserveQueryKeys = (link.dataset.supportPreserveQuery || '')
                .split(',')
                .map((key) => key.trim())
                .filter(Boolean);
            const hydratedHref = withLang(href, currentLang, preserveQueryKeys);

            if (hydratedHref && hydratedHref !== href) {
                link.setAttribute('href', hydratedHref);
            }
        });
    }

    async function hydratePageCopy(options = {}) {
        const siteCopy = await getSiteCopy();
        if (!siteCopy || typeof siteCopy !== 'object') {
            return;
        }

        const pageKey = options.pageKey || document.body?.dataset.supportPage;
        if (!pageKey) {
            return;
        }

        const lang = getCurrentLang();
        const pageCopy = siteCopy[pageKey];
        const sharedCopy = siteCopy.shared || {};
        if ((!pageCopy || typeof pageCopy !== 'object') && (!sharedCopy || typeof sharedCopy !== 'object')) {
            return;
        }

        const resolveKey = (key, fallback = '') => {
            const pageValue = pageCopy && typeof pageCopy === 'object'
                ? getByPath(pageCopy, key)
                : undefined;
            if (pageValue !== undefined) {
                return resolveLocalizedValue(pageValue, lang, fallback);
            }

            const sharedValue = getByPath(sharedCopy, key);
            return resolveLocalizedValue(sharedValue, lang, fallback);
        };

        const pageTitle = resolveKey('meta.title');
        if (pageTitle) {
            document.title = pageTitle;
        }

        document.querySelectorAll('[data-i18n]').forEach((element) => {
            const value = resolveKey(element.dataset.i18n, element.textContent);
            if (value !== undefined && value !== null) {
                element.textContent = value;
            }
        });

        document.querySelectorAll('[data-i18n-html]').forEach((element) => {
            const value = resolveKey(element.dataset.i18nHtml, element.innerHTML);
            if (value !== undefined && value !== null) {
                element.innerHTML = value;
            }
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
            const value = resolveKey(element.dataset.i18nPlaceholder, element.getAttribute('placeholder') || '');
            if (value) {
                element.setAttribute('placeholder', value);
            }
        });

        document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
            const value = resolveKey(element.dataset.i18nAriaLabel, element.getAttribute('aria-label') || '');
            if (value) {
                element.setAttribute('aria-label', value);
            }
        });

        document.querySelectorAll('[data-i18n-alt]').forEach((element) => {
            const value = resolveKey(element.dataset.i18nAlt, element.getAttribute('alt') || '');
            if (value) {
                element.setAttribute('alt', value);
            }
        });
    }

    function hydrateLinks() {
        document.querySelectorAll('[data-support-route]').forEach(hydrateRouteTarget);
        hydrateInternalLangLinks();

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
        const currentLang = getCurrentLang();
        const selector = document.querySelector('.language-selector');

        document.documentElement.lang = currentLang;

        if (selector) {
            syncLanguageSelector(selector, currentLang);
            bindLanguageSelector(selector, preserveQueryKeys);
        }

        hydrateLinks();
        hydrateFlyouts();
        hydratePageCopy(options);
    }

    window.SupportSite = {
        ROUTES,
        initPage,
        hydrateFlyouts,
        hydratePageCopy,
        syncLanguageSelector,
        bindLanguageSelector,
        langToSelectorCode,
        selectorCodeToLang,
    };
})();
