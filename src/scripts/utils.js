/**
 * Nexled Support Site Utilities
 * Replaces PHP helper functions for static hosting.
 */

const Utils = {
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
            return await response.json();
        } catch (e) {
            console.error('Could not fetch JSON:', e);
            return null;
        }
    },

    /**
     * Sanitizes image paths (preventing external links and ensuring local resolution).
     */
    sanitizeImagePath(src) {
        if (!src || src.startsWith('http') || src.startsWith('//')) return '';
        return src;
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
