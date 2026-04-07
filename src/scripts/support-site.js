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
    const BREADCRUMB_TRAILS = {
        downloads: [
            { type: 'route', route: 'home', labelPath: 'breadcrumb.home', fallback: 'Home' },
            { type: 'current', labelPath: 'breadcrumb.current', fallback: 'Download Files' },
        ],
        contact: [
            { type: 'route', route: 'home', labelPath: 'breadcrumb.home', fallback: 'Home' },
            { type: 'current', labelPath: 'breadcrumb.current', fallback: 'Contact Us' },
        ],
        repair: [
            { type: 'route', route: 'home', labelPath: 'breadcrumb.home', fallback: 'Home' },
            { type: 'current', labelPath: 'breadcrumb.current', fallback: 'Repair Guides' },
        ],
        steps: [
            { type: 'route', route: 'home', labelPath: 'breadcrumb.home', fallback: 'Home' },
            { type: 'route', route: 'repair', labelPath: 'nav.repairGuides', fallback: 'Repair Guides' },
            { type: 'current', labelPath: 'breadcrumb.current', fallback: 'Guide' },
        ],
    };

    const LANG_OPTIONS = {
        gb: { lang: 'en', label: 'English' },
        pt: { lang: 'pt', label: 'Portuguese' },
        es: { lang: 'es', label: 'Spanish' },
        fr: { lang: 'fr', label: 'French' },
    };
    let flyoutConfigPromise = null;
    let siteCopyPromise = null;
    let searchIndexPromise = null;
    const SEARCH_COPY = {
        trigger: {
            pt: 'Abrir pesquisa',
            en: 'Open search',
            es: 'Abrir b\u00fasqueda',
            fr: 'Ouvrir la recherche',
        },
        close: {
            pt: 'Fechar pesquisa',
            en: 'Close search',
            es: 'Cerrar b\u00fasqueda',
            fr: 'Fermer la recherche',
        },
        title: {
            pt: 'Encontrar p\u00e1ginas, sec\u00e7\u00f5es e guias',
            en: 'Find pages, sections, and guides',
            es: 'Encontrar p\u00e1ginas, secciones y gu\u00edas',
            fr: 'Trouver des pages, sections et guides',
        },
        placeholder: {
            pt: 'Pesquisar p\u00e1ginas, produtos ou guias de repara\u00e7\u00e3o',
            en: 'Search pages, products, or repair guides',
            es: 'Buscar p\u00e1ginas, productos o gu\u00edas de reparaci\u00f3n',
            fr: 'Rechercher des pages, produits ou guides de r\u00e9paration',
        },
        empty: {
            pt: 'N\u00e3o foram encontrados resultados de suporte.',
            en: 'No matching support results found.',
            es: 'No se encontraron resultados de soporte.',
            fr: 'Aucun r\u00e9sultat d\u2019assistance trouv\u00e9.',
        },
        helper: {
            pt: 'Pesquise p\u00e1ginas principais, sec\u00e7\u00f5es de produto e guias de repara\u00e7\u00e3o.',
            en: 'Search primary pages, product sections, and repair guides.',
            es: 'Busque p\u00e1ginas principales, secciones de producto y gu\u00edas de reparaci\u00f3n.',
            fr: 'Recherchez des pages principales, sections produit et guides de r\u00e9paration.',
        },
        results: {
            pt: 'Resultados da pesquisa',
            en: 'Search results',
            es: 'Resultados de la b\u00fasqueda',
            fr: 'R\u00e9sultats de recherche',
        },
        page: {
            pt: 'P\u00e1gina',
            en: 'Page',
            es: 'P\u00e1gina',
            fr: 'Page',
        },
        section: {
            pt: 'Sec\u00e7\u00e3o',
            en: 'Section',
            es: 'Secci\u00f3n',
            fr: 'Section',
        },
        repairGuide: {
            pt: 'Guia de repara\u00e7\u00e3o',
            en: 'Repair guide',
            es: 'Gu\u00eda de reparaci\u00f3n',
            fr: 'Guide de r\u00e9paration',
        },
    };
    const SUPPORT_SHELL_COPY = {
        resources: {
            pt: 'Recursos',
            en: 'Resources',
            es: 'Recursos',
            fr: 'Ressources',
        },
        faq: {
            pt: 'Perguntas Frequentes',
            en: 'Frequently Asked Questions',
            es: 'Preguntas Frecuentes',
            fr: 'Questions fr\u00e9quentes',
        },
        warranty: {
            pt: 'Garantia',
            en: 'Warranty',
            es: 'Garant\u00eda',
            fr: 'Garantie',
        },
        contactUs: {
            pt: 'Contacte-nos',
            en: 'Contact Us',
            es: 'Cont\u00e1ctenos',
            fr: 'Contactez-nous',
        },
        homePage: {
            pt: 'P\u00e1gina Inicial',
            en: 'Home Page',
            es: 'P\u00e1gina de Inicio',
            fr: 'Page d\u2019accueil',
        },
        quickHelp: {
            pt: 'Ajuda R\u00e1pida',
            en: 'Quick Help',
            es: 'Ayuda R\u00e1pida',
            fr: 'Aide rapide',
        },
        openSupportRequest: {
            pt: 'Abrir Pedido de Suporte',
            en: 'Open Support Request',
            es: 'Abrir solicitud de soporte',
            fr: 'Ouvrir une demande d\u2019assistance',
        },
        viewRepairGuides: {
            pt: 'Ver Guias de Repara\u00e7\u00e3o',
            en: 'View Repair Guides',
            es: 'Ver gu\u00edas de reparaci\u00f3n',
            fr: 'Voir les guides de r\u00e9paration',
        },
        viewDownloads: {
            pt: 'Ver Downloads',
            en: 'View Downloads',
            es: 'Ver descargas',
            fr: 'Voir les t\u00e9l\u00e9chargements',
        },
    };

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

    function getDictionaryValue(node, lang, fallback = '') {
        if (window.Utils && typeof Utils.t === 'function') {
            return Utils.t(node, lang, fallback);
        }

        if (node && typeof node === 'object' && node[lang]) {
            return node[lang];
        }

        return fallback;
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

    function resolveSiteCopyValue(siteCopy, pageKey, key, lang, fallback = '') {
        if (!key) {
            return fallback;
        }

        const pageCopy = siteCopy && typeof siteCopy === 'object' ? siteCopy[pageKey] : undefined;
        const sharedCopy = siteCopy && typeof siteCopy === 'object' ? siteCopy.shared || {} : {};
        const pageValue = pageCopy && typeof pageCopy === 'object'
            ? getByPath(pageCopy, key)
            : undefined;

        if (pageValue !== undefined) {
            return resolveLocalizedValue(pageValue, lang, fallback);
        }

        return resolveLocalizedValue(getByPath(sharedCopy, key), lang, fallback);
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

            const hoverEnabled = supportsHoverFlyouts();
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

                if (hoverEnabled) {
                    tab.addEventListener('mouseenter', () => {
                        activateCategory(tab.dataset.flyoutCategory);
                    });
                }

                tab.addEventListener('focus', () => {
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

    function supportsHoverFlyouts() {
        return typeof window.matchMedia === 'function'
            && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    }

    function bindHoverOnlySupportFlyouts() {
        if (!supportsHoverFlyouts()) {
            return;
        }

        document.querySelectorAll('[data-support-flyout] [data-flyout-toggle]').forEach((toggle) => {
            if (toggle.dataset.supportHoverOnlyBound === 'true') {
                return;
            }

            toggle.dataset.supportHoverOnlyBound = 'true';
            toggle.addEventListener('click', (event) => {
                // Keep keyboard activation intact; block pointer clicks so desktop flyouts stay hover-driven.
                if (event.detail === 0) {
                    return;
                }

                event.preventDefault();
                event.stopImmediatePropagation();
            }, true);
        });
    }

    async function hydrateFlyouts() {
        const flyoutConfig = await getFlyoutConfig();
        if (!flyoutConfig || typeof flyoutConfig !== 'object') {
            return;
        }

        document.querySelectorAll('[data-flyout-root]').forEach((dropdown) => {
            const routeKey = dropdown.dataset.supportFlyout;
            const flyout = flyoutConfig[routeKey];
            const menu = dropdown.querySelector('[data-flyout-surface]');

            if (!flyout || !menu) {
                return;
            }

            menu.classList.remove('flyout-features');
            menu.classList.add('flyout-products');
            menu.setAttribute('data-support-flyout-products', '');
            menu.setAttribute('data-flyout-tabs', '');
            menu.setAttribute('role', 'dialog');

            if (flyout.ariaLabel) {
                menu.setAttribute('aria-label', flyout.ariaLabel);
            }

            menu.innerHTML = buildFlyoutMarkup(routeKey, flyout);
        });

        bindSupportFlyouts();
    }

    function createSearchEntry(label, description, href, keywords = []) {
        const safeLabel = getTextValue(label);
        const safeHref = getTextValue(href);
        if (!safeLabel || !safeHref) {
            return null;
        }

        return {
            label: safeLabel,
            description: getTextValue(description),
            href: safeHref,
            keywords: keywords
                .map((keyword) => getTextValue(keyword))
                .filter(Boolean)
                .join(' '),
        };
    }

    function addSearchEntry(collection, registry, entry) {
        if (!entry) {
            return;
        }

        const key = `${entry.href}|${entry.label}`;
        if (registry.has(key)) {
            return;
        }

        registry.add(key);
        collection.push(entry);
    }

    function buildSearchDescription(typeLabel, detailLabel = '') {
        const detail = getTextValue(detailLabel);
        return detail ? `${typeLabel} - ${detail}` : typeLabel;
    }

    function buildSearchPageItems(siteCopy, lang) {
        const items = [];
        const registry = new Set();
        const pageType = getDictionaryValue(SEARCH_COPY.page, lang, 'Page');
        const sectionType = getDictionaryValue(SEARCH_COPY.section, lang, 'Section');
        const primaryPages = [
            { pageKey: 'index', href: withLang(ROUTES.home, lang), titlePath: 'hero.title', extraPath: 'header.supportPage' },
            { pageKey: 'repair', href: withLang(ROUTES.repair, lang), titlePath: 'breadcrumb.current', extraPath: 'nav.repairGuides' },
            { pageKey: 'downloads', href: withLang(ROUTES.downloads, lang), titlePath: 'breadcrumb.current', extraPath: 'nav.downloadFiles' },
            { pageKey: 'contact', href: withLang(ROUTES.contact, lang), titlePath: 'breadcrumb.current', extraPath: 'header.getInTouch' },
        ];

        primaryPages.forEach((item) => {
            const label = resolveSiteCopyValue(siteCopy, item.pageKey, item.titlePath, lang, item.pageKey);
            const detail = resolveSiteCopyValue(siteCopy, item.pageKey, item.extraPath, lang, '');
            addSearchEntry(
                items,
                registry,
                createSearchEntry(label, buildSearchDescription(pageType, detail), item.href, [label, detail])
            );
        });

        [
            { labelPath: 'faq.title', href: withLang(ROUTES.faq, lang) },
            { labelPath: 'warranty.title', href: withLang(ROUTES.warranty, lang) },
        ].forEach((item) => {
            const label = resolveSiteCopyValue(siteCopy, 'index', item.labelPath, lang, '');
            addSearchEntry(
                items,
                registry,
                createSearchEntry(label, buildSearchDescription(sectionType, label), item.href, [label, 'index'])
            );
        });

        return { items, registry };
    }

    function buildSearchProductItems(items, registry, siteCopy, flyoutConfig, lang) {
        if (!flyoutConfig || typeof flyoutConfig !== 'object') {
            return;
        }

        const sectionType = getDictionaryValue(SEARCH_COPY.section, lang, 'Section');

        Object.entries(flyoutConfig).forEach(([routeKey, flyout]) => {
            const routeLabelPath = routeKey === 'repair' ? 'nav.repairGuides' : 'nav.downloadFiles';
            const routeLabel = resolveSiteCopyValue(siteCopy, routeKey, routeLabelPath, lang, routeKey);

            (flyout?.categories || []).forEach((category) => {
                const categoryLabel = getTextValue(category?.label, '');
                (category.items || []).forEach((item) => {
                    const label = getTextValue(item?.label, 'Product');
                    addSearchEntry(
                        items,
                        registry,
                        createSearchEntry(
                            label,
                            buildSearchDescription(sectionType, `${routeLabel} - ${categoryLabel}`),
                            withLang(getTextValue(item?.href, '#'), lang),
                            [label, routeLabel, categoryLabel]
                        )
                    );
                });
            });
        });
    }

    function buildSearchRepairGuideItems(items, registry, repairsData, lang) {
        if (!repairsData || !Array.isArray(repairsData.categories)) {
            return;
        }

        const repairGuideType = getDictionaryValue(SEARCH_COPY.repairGuide, lang, 'Repair guide');

        repairsData.categories.forEach((category) => {
            (category.cards || []).forEach((card) => {
                const productLabel = resolveLocalizedValue(card.title, lang, 'Product');
                (card.repairs || []).forEach((repair) => {
                    const repairLabel = resolveLocalizedValue(repair.label, lang, 'Guide');
                    addSearchEntry(
                        items,
                        registry,
                        createSearchEntry(
                            repairLabel,
                            buildSearchDescription(repairGuideType, productLabel),
                            withLang(`steps.html?file=${encodeURIComponent(getTextValue(repair.file, ''))}`, lang),
                            [repairLabel, productLabel, resolveLocalizedValue(category.title, lang, 'Category')]
                        )
                    );
                });
            });
        });
    }

    async function getSearchIndex() {
        if (searchIndexPromise) {
            return searchIndexPromise;
        }

        searchIndexPromise = Promise.all([
            getSiteCopy(),
            getFlyoutConfig(),
            window.Utils && typeof Utils.fetchJSON === 'function'
                ? Utils.fetchJSON('data/repairs.json')
                : Promise.resolve(null),
        ]).then(([siteCopy, flyoutConfig, repairsData]) => {
            const lang = getCurrentLang();
            const { items, registry } = buildSearchPageItems(siteCopy || {}, lang);
            buildSearchProductItems(items, registry, siteCopy || {}, flyoutConfig, lang);
            buildSearchRepairGuideItems(items, registry, repairsData, lang);
            return items;
        });

        return searchIndexPromise;
    }

    function updateSearchOverlayCopy(overlay) {
        const lang = getCurrentLang();
        const title = overlay.querySelector('[data-support-search-title]');
        const input = overlay.querySelector('[data-search-overlay-input]');
        const closeButton = overlay.querySelector('[data-search-overlay-close]');
        const list = overlay.querySelector('[data-support-search-list]');
        const empty = overlay.querySelector('[data-support-search-empty]');
        const helper = overlay.querySelector('[data-support-search-helper]');

        document.querySelectorAll('[data-search-overlay-target="supportSearchOverlay"]').forEach((trigger) => {
            trigger.setAttribute(
                'aria-label',
                getDictionaryValue(SEARCH_COPY.trigger, lang, 'Open search')
            );
        });

        if (title) {
            title.textContent = getDictionaryValue(SEARCH_COPY.title, lang, 'Find pages, sections, and guides');
        }

        if (closeButton) {
            closeButton.setAttribute(
                'aria-label',
                getDictionaryValue(SEARCH_COPY.close, lang, 'Close search')
            );
        }

        if (input) {
            const placeholder = getDictionaryValue(SEARCH_COPY.placeholder, lang, 'Search pages, products, or repair guides');
            input.setAttribute('placeholder', placeholder);
            input.setAttribute('aria-label', placeholder);
        }

        if (list) {
            list.setAttribute(
                'aria-label',
                getDictionaryValue(SEARCH_COPY.results, lang, 'Search results')
            );
        }

        if (empty) {
            empty.textContent = getDictionaryValue(SEARCH_COPY.empty, lang, 'No matching support results found.');
        }

        if (helper) {
            helper.textContent = getDictionaryValue(SEARCH_COPY.helper, lang, 'Search primary pages, product sections, and repair guides.');
        }
    }

    function renderSearchResults(state, query) {
        const normalizedQuery = getTextValue(query).toLowerCase();
        const sourceItems = normalizedQuery
            ? state.items.filter((item) => {
                const haystack = `${item.label} ${item.description} ${item.keywords}`.toLowerCase();
                return haystack.includes(normalizedQuery);
            })
            : state.items.slice(0, 10);

        state.list.innerHTML = '';

        if (!sourceItems.length) {
            state.results.hidden = true;
            state.empty.hidden = false;
            return;
        }

        sourceItems.slice(0, 12).forEach((item) => {
            const link = document.createElement('a');
            link.className = 'search-overlay-item';
            link.href = item.href;
            link.setAttribute('role', 'listitem');

            const copy = document.createElement('div');
            const label = document.createElement('p');
            label.className = 'text-body-sm font-semibold';
            label.textContent = item.label;

            const description = document.createElement('p');
            description.className = 'text-body-xs text-grey-primary';
            description.textContent = item.description;

            copy.appendChild(label);
            copy.appendChild(description);
            link.appendChild(copy);
            state.list.appendChild(link);
        });

        state.results.hidden = false;
        state.empty.hidden = true;
    }

    async function hydrateSearchOverlay() {
        const overlay = document.getElementById('supportSearchOverlay');
        if (!overlay) {
            return;
        }

        updateSearchOverlayCopy(overlay);

        const input = overlay.querySelector('[data-search-overlay-input]');
        const results = overlay.querySelector('[data-support-search-results]');
        const list = overlay.querySelector('[data-support-search-list]');
        const empty = overlay.querySelector('[data-support-search-empty-state]');

        if (!input || !results || !list || !empty) {
            return;
        }

        const state = {
            items: await getSearchIndex(),
            input,
            results,
            list,
            empty,
        };

        const render = () => renderSearchResults(state, input.value);
        render();

        if (overlay.dataset.supportSearchBound === 'true') {
            return;
        }

        overlay.dataset.supportSearchBound = 'true';
        input.addEventListener('input', render);

        new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName !== 'class' || !overlay.classList.contains('is-open')) {
                    return;
                }

                input.value = '';
                render();
            });
        }).observe(overlay, { attributes: true, attributeFilter: ['class'] });
    }

    function applySupportShellCopy() {
        const lang = getCurrentLang();

        document.querySelectorAll('[data-support-shell-copy]').forEach((element) => {
            const key = element.dataset.supportShellCopy;
            if (!key || !SUPPORT_SHELL_COPY[key]) {
                return;
            }

            element.textContent = getDictionaryValue(
                SUPPORT_SHELL_COPY[key],
                lang,
                element.textContent
            );
        });
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

    async function hydrateBreadcrumbs(options = {}) {
        const breadcrumbNavs = document.querySelectorAll('[data-support-breadcrumb]');
        if (!breadcrumbNavs.length) {
            return;
        }

        const pageKey = options.pageKey || document.body?.dataset.supportPage;
        if (!pageKey) {
            return;
        }

        const siteCopy = await getSiteCopy();
        const lang = getCurrentLang();

        breadcrumbNavs.forEach((nav) => {
            const trailKey = nav.dataset.supportBreadcrumb || pageKey;
            const trail = BREADCRUMB_TRAILS[trailKey];
            if (!Array.isArray(trail) || !trail.length) {
                return;
            }

            const preserveQueryKeys = (nav.dataset.supportPreserveQuery || '')
                .split(',')
                .map((key) => key.trim())
                .filter(Boolean);
            const currentHref = escapeHTML(`${window.location.pathname}${window.location.search}${window.location.hash}`);

            const itemsMarkup = trail.map((item, index) => {
                const isLast = index === trail.length - 1;
                const fallback = item.type === 'current' && nav.dataset.supportBreadcrumbCurrent
                    ? nav.dataset.supportBreadcrumbCurrent
                    : item.fallback || '';
                const label = resolveSiteCopyValue(siteCopy, pageKey, item.labelPath, lang, fallback) || fallback;
                const escapedLabel = escapeHTML(label);

                if (item.type === 'route' && item.route && !isLast) {
                    const href = escapeHTML(withLang(ROUTES[item.route] || '#', lang, preserveQueryKeys));
                    return `
                        <li class="breadcrumb-item">
                            <a href="${href}" class="breadcrumb-link link-navigation link-md"><span class="link-label">${escapedLabel}</span></a>
                        </li>
                        <li class="breadcrumb-separator">
                            <i class="ri-arrow-right-s-line icon icon-md" aria-hidden="true"></i>
                        </li>
                    `;
                }

                return `
                    <li class="breadcrumb-item">
                        <a href="${currentHref}" class="breadcrumb-link link-navigation link-md" aria-current="page">
                            <span class="link-label" data-support-breadcrumb-current-label>${escapedLabel}</span>
                        </a>
                    </li>
                `;
            }).join('');

            nav.innerHTML = `<ol class="breadcrumb">${itemsMarkup}</ol>`;
        });
    }

    function setBreadcrumbCurrent(label) {
        const nextLabel = getTextValue(label, '');
        document.querySelectorAll('[data-support-breadcrumb]').forEach((nav) => {
            nav.dataset.supportBreadcrumbCurrent = nextLabel;
        });

        document.querySelectorAll('[data-support-breadcrumb-current-label]').forEach((element) => {
            element.textContent = nextLabel;
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

        const resolveKey = (key, fallback = '') => resolveSiteCopyValue(siteCopy, pageKey, key, lang, fallback);
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
        bindHoverOnlySupportFlyouts();
        hydrateBreadcrumbs(options);
        hydrateFlyouts();
        hydratePageCopy(options);
        applySupportShellCopy();
        hydrateSearchOverlay();
    }

    window.SupportSite = {
        ROUTES,
        initPage,
        hydrateBreadcrumbs,
        hydrateFlyouts,
        hydratePageCopy,
        setBreadcrumbCurrent,
        syncLanguageSelector,
        bindLanguageSelector,
        langToSelectorCode,
        selectorCodeToLang,
    };
})();
