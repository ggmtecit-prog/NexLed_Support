/**
 * Nexled Support Site Utilities
 * Replaces PHP helper functions for static hosting.
 */

const Utils = {
    _damImageManifestPromise: null,
    _damImageManifest: null,
    _trustedImageHosts: new Set(['res.cloudinary.com']),

    /**
     * Gets a URL parameter by name.
     */
    getParam(name) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    },

    /**
     * Gets the current language, prioritizing URL param, then localStorage, then default 'pt'.
     */
    getLang() {
        let lang = this.getParam('lang');
        if (!lang) {
            try {
                lang = localStorage.getItem('nexled.lang');
            } catch (e) {}
        }
        const allowedLangs = ['pt', 'en', 'es', 'fr'];
        return allowedLangs.includes(lang) ? lang : 'pt';
    },

    /**
     * Translation helper mirroring PHP t() function.
     * @param {Object} node - The object containing translations (e.g., {pt: '...', en: '...'})
     * @param {string} lang - The desired language code.
     * @param {string} fallback - Fallback string if no translation is found.
     */
    t(node, lang, fallback = '') {
        if (!node || typeof node !== 'object') return fallback;
        if (node[lang]) return node[lang];
        if (node['pt']) return node['pt'];
        
        // Fallback to first available key
        const keys = Object.keys(node);
        if (keys.length > 0) return node[keys[0]];
        
        return fallback;
    },

    /**
     * Fetches JSON data.
     */
    async fetchJSON(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const buffer = await response.arrayBuffer();
            const decoder = typeof TextDecoder === 'function'
                ? new TextDecoder('utf-8')
                : null;
            const text = decoder
                ? decoder.decode(buffer)
                : Array.from(new Uint8Array(buffer), (byte) => String.fromCharCode(byte)).join('');

            return JSON.parse(text.replace(/^\uFEFF/, ''));
        } catch (e) {
            console.error('Could not fetch JSON:', e);
            return null;
        }
    },

    /**
     * Preloads DAM image manifest once and caches it for sync lookups during render.
     */
    async preloadDamImageManifest() {
        if (this._damImageManifestPromise) {
            return this._damImageManifestPromise;
        }

        this._damImageManifestPromise = this.fetchJSON('data/dam-images.json')
            .then((manifest) => {
                this._damImageManifest = manifest && typeof manifest === 'object' ? manifest : {};
                return this._damImageManifest;
            })
            .catch(() => {
                this._damImageManifest = {};
                return this._damImageManifest;
            });

        return this._damImageManifestPromise;
    },

    /**
     * Returns cached DAM image manifest.
     */
    getDamImageManifest() {
        return this._damImageManifest && typeof this._damImageManifest === 'object'
            ? this._damImageManifest
            : {};
    },

    /**
     * Allows only trusted public DAM URLs.
     */
    isTrustedImageUrl(src) {
        if (typeof src !== 'string') return false;

        const value = src.trim();
        if (!value || (!value.startsWith('http://') && !value.startsWith('https://') && !value.startsWith('//'))) {
            return false;
        }

        try {
            const url = new URL(value, window.location.href);
            return ['http:', 'https:'].includes(url.protocol) && this._trustedImageHosts.has(url.hostname);
        } catch (e) {
            return false;
        }
    },

    /**
     * Normalizes legacy support image paths before DAM lookup.
     */
    normalizeImagePath(src) {
        if (typeof src !== 'string') return '';

        const value = src.trim();
        if (!value) return '';
        if (this.isTrustedImageUrl(value)) return value;
        if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('//')) return '';

        return value
            .replace(/\\/g, '/')
            .replace(/^\.\//, '')
            .replace(/^(?:\.\.\/)+/, '')
            .replace(/^\/+/, '');
    },

    /**
     * Resolves legacy local image paths to DAM URLs when mapped.
     */
    resolveImagePath(src, fallback = '') {
        if (this.isTrustedImageUrl(src)) {
            return src.trim();
        }

        const normalized = this.normalizeImagePath(src);
        if (!normalized) {
            return fallback;
        }

        const manifest = this.getDamImageManifest();
        return manifest[normalized] || normalized;
    },

    /**
     * Sanitizes image paths while allowing trusted DAM URLs and local fallback.
     */
    sanitizeImagePath(src) {
        return this.resolveImagePath(src, '');
    },

    /**
     * Updates the UI language selector and handles persistence.
     */
    initLanguageSelector(selectorId) {
        const select = document.getElementById(selectorId);
        if (!select) return;

        const currentLang = this.getLang();
        select.value = currentLang;

        select.addEventListener('change', () => {
            const newLang = select.value;
            try {
                localStorage.setItem('nexled.lang', newLang);
            } catch (e) {}
            
            const params = new URLSearchParams(window.location.search);
            params.set('lang', newLang);
            window.location.search = params.toString();
        });
    }
};

window.Utils = Utils;
