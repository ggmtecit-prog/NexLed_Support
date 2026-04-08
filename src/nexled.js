/**
 * NEXLED INTERACTIVE COMPONENTS
 * Supports Accordion, Dropdown, Modal, Stepper, and Custom Scrollbar
 * VERSAO ATUALIZADA 02/04/2026
 */

const canUseScrollReveal = typeof window !== 'undefined'
    && typeof document !== 'undefined'
    && typeof window.IntersectionObserver === 'function'
    && (!window.matchMedia || !window.matchMedia('(prefers-reduced-motion: reduce)').matches);

if (canUseScrollReveal) {
    document.documentElement.classList.add('has-scroll-reveal');
}

const isDocsShellPage = () => Boolean(document.querySelector('.docs-main') && document.querySelector('#docs-nav-drawer, .sidebar'));

const shouldResetDocsScroll = () => {
    if (!isDocsShellPage() || window.location.hash) {
        return false;
    }

    const navigationEntry = typeof performance !== 'undefined' && typeof performance.getEntriesByType === 'function'
        ? performance.getEntriesByType('navigation')[0]
        : null;

    return navigationEntry?.type !== 'back_forward';
};

const resetDocsScrollPosition = () => {
    if (!shouldResetDocsScroll()) {
        return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
};

if (typeof history !== 'undefined' && 'scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

document.addEventListener('DOMContentLoaded', () => {
    window.requestAnimationFrame(resetDocsScrollPosition);
});

window.addEventListener('pageshow', () => {
    window.requestAnimationFrame(resetDocsScrollPosition);
});
/**
 * Accordion Component Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const accordionTriggers = Array.from(document.querySelectorAll('.accordion .accordion-trigger'));

    if (accordionTriggers.length === 0) {
        return;
    }

    function getAccordionContent(trigger) {
        const content = trigger.nextElementSibling;
        return content && content.classList.contains('accordion-content') ? content : null;
    }

    function syncAccordionState(trigger, isExpanded) {
        const item = trigger.closest('.accordion-item');
        const content = getAccordionContent(trigger);

        trigger.setAttribute('aria-expanded', String(isExpanded));
        item?.classList.toggle('is-open', isExpanded);

        if (!content) {
            return;
        }

        const contentHeight = `${content.scrollHeight}px`;
        content.style.setProperty('--accordion-content-height', contentHeight);

        if (!isExpanded) {
            requestAnimationFrame(() => {
                content.style.setProperty('--accordion-content-height', '0px');
            });
        }
    }

    accordionTriggers.forEach(trigger => {
        const item = trigger.closest('.accordion-item');
        const isExpanded = trigger.getAttribute('aria-expanded') === 'true' || item?.classList.contains('is-open');
        syncAccordionState(trigger, isExpanded);

        trigger.addEventListener('click', () => {
            if (trigger.disabled || trigger.getAttribute('aria-disabled') === 'true') {
                return;
            }

            const nextValue = trigger.getAttribute('aria-expanded') !== 'true';
            syncAccordionState(trigger, nextValue);
        });
    });

    const syncOpenAccordions = () => {
        accordionTriggers.forEach(trigger => {
            const content = getAccordionContent(trigger);
            if (!content) {
                return;
            }

            if (trigger.getAttribute('aria-expanded') === 'true') {
                content.style.setProperty('--accordion-content-height', `${content.scrollHeight}px`);
                return;
            }

            content.style.setProperty('--accordion-content-height', '0px');
        });
    };

    window.addEventListener('resize', syncOpenAccordions);
    requestAnimationFrame(syncOpenAccordions);
});

/**
 * Announcement Bar Component Logic
 */

function dismissSurfaceById(id) {
    const surface = document.getElementById(id);
    if (!surface || surface.hidden) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || typeof surface.animate !== 'function') {
        surface.hidden = true;
        return;
    }

    const styles = getComputedStyle(surface);
    const duration = Number.parseFloat(styles.getPropertyValue('--motion-duration-default')) || 400;
    const easing = styles.getPropertyValue('--motion-ease-premium').trim() || 'cubic-bezier(0.16, 1, 0.3, 1)';
    const offset = styles.getPropertyValue('--space-12').trim() || '12px';

    surface.setAttribute('aria-hidden', 'true');

    const animation = surface.animate([
        { opacity: 1, transform: 'translateY(0)' },
        { opacity: 0, transform: `translateY(${offset})` }
    ], {
        duration,
        easing,
        fill: 'forwards'
    });

    animation.addEventListener('finish', () => {
        surface.hidden = true;
    }, { once: true });
}

function closeBar(id) {
    dismissSurfaceById(id);
}

function closeAlert(id) {
    dismissSurfaceById(id);
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-dismiss-surface]').forEach(trigger => {
        if (trigger.tagName === 'BUTTON') {
            trigger.setAttribute('type', 'button');
        }
    });

    document.querySelectorAll('[data-toggle-pressed]').forEach(trigger => {
        if (trigger.tagName === 'BUTTON') {
            trigger.setAttribute('type', 'button');
        }

        if (!trigger.hasAttribute('aria-pressed')) {
            trigger.setAttribute('aria-pressed', 'false');
        }
    });

    document.querySelectorAll('input[type="checkbox"][data-state="indeterminate"]').forEach(checkbox => {
        checkbox.indeterminate = true;
        syncIndeterminateCheckbox(checkbox);

        checkbox.addEventListener('change', () => {
            syncIndeterminateCheckbox(checkbox);
        });
    });
});

document.addEventListener('click', event => {
    const dismissTrigger = event.target.closest('[data-dismiss-surface]');
    if (dismissTrigger) {
        dismissSurfaceById(dismissTrigger.dataset.dismissSurface);
        return;
    }

    const toggleTrigger = event.target.closest('[data-toggle-pressed]');
    if (toggleTrigger) {
        const isPressed = toggleTrigger.getAttribute('aria-pressed') === 'true';
        toggleTrigger.setAttribute('aria-pressed', String(!isPressed));
    }
});

function syncIndeterminateCheckbox(checkbox) {
    if (checkbox.indeterminate) {
        checkbox.setAttribute('aria-checked', 'mixed');
        return;
    }

    checkbox.removeAttribute('aria-checked');
}


/* ============================================================
   Dropdown Menu Component Scripts
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    const dropdowns = Array.from(document.querySelectorAll('.dropdown'));

    if (dropdowns.length === 0) {
        return;
    }
    const enabledDropdowns = dropdowns.filter(dropdown => {
        const trigger = dropdown.querySelector('.dropdown-trigger');
        return trigger && !trigger.disabled && trigger.getAttribute('aria-disabled') !== 'true' && dropdown.getAttribute('aria-disabled') !== 'true';
    });

    // Hover-trigger dropdowns (data-dropdown-trigger="hover")
    // Add data-dropdown-trigger="hover" to a .dropdown wrapper to open on mouseenter/mouseleave.
    // To switch to click: remove the attribute. To switch to JS hover: add it back.
    const supportsHoverTrigger = typeof window.matchMedia === 'function'
        && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    dropdowns
        .filter(d => d.dataset.dropdownTrigger === 'hover' && supportsHoverTrigger)
        .forEach(dropdown => {
            const idx = enabledDropdowns.indexOf(dropdown);
            if (idx !== -1) {
                enabledDropdowns.splice(idx, 1);
            }

            let closeTimer;
            dropdown.addEventListener('mouseenter', () => {
                clearTimeout(closeTimer);
                openDropdown(dropdown);
            });
            dropdown.addEventListener('mouseleave', () => {
                closeTimer = setTimeout(() => closeDropdown(dropdown), 150);
            });
        });

    enabledDropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector('.dropdown-trigger');
        const items = Array.from(dropdown.querySelectorAll('.dropdown-item'));
        const valueDisplay = dropdown.querySelector('.dropdown-value');
        const isMulti = dropdown.classList.contains('dropdown-multi');

        items.forEach(item => {
            item.setAttribute('tabindex', '-1');

            item.addEventListener('focus', () => {
                item.scrollIntoView({ block: 'nearest' });
            });
        });

        if (isMulti) {
            bindMultiDropdown(dropdown, trigger, items, valueDisplay);
            updateMultiValue(dropdown, valueDisplay);
        } else {
            bindSingleDropdown(dropdown, trigger, items, valueDisplay);
            const selectedItem = items.find(item => item.getAttribute('aria-selected') === 'true');
            if (selectedItem) {
                updateValue(dropdown, valueDisplay, getItemLabel(selectedItem));
            }
        }

        bindTriggerKeyboard(dropdown, trigger, items);
        bindItemKeyboard(dropdown, trigger, items, isMulti);

        trigger.addEventListener('click', () => {
            if (dropdown.classList.contains('is-open')) {
                closeDropdown(dropdown);
                return;
            }

            openDropdown(dropdown);
        });
    });

    document.addEventListener('click', event => {
        if (!event.target.closest('.dropdown')) {
            closeAllDropdowns();
        }
    });

    function bindSingleDropdown(dropdown, trigger, items, valueDisplay) {
        items.forEach(item => {
            item.addEventListener('click', () => {
                items.forEach(option => {
                    option.setAttribute('aria-selected', 'false');
                });

                item.setAttribute('aria-selected', 'true');
                updateValue(dropdown, valueDisplay, getItemLabel(item));
                closeDropdown(dropdown);
                trigger.focus();
            });
        });
    }

    function bindMultiDropdown(dropdown, trigger, items, valueDisplay) {
        items.forEach(item => {
            const checkbox = item.querySelector('input[type="checkbox"]');

            if (!checkbox) {
                return;
            }

            checkbox.tabIndex = -1;
            item.setAttribute('aria-selected', String(checkbox.checked));

            checkbox.addEventListener('click', event => {
                event.stopPropagation();
            });

            checkbox.addEventListener('change', () => {
                syncMultiItem(item, checkbox.checked);
                updateMultiValue(dropdown, valueDisplay);
            });

            item.addEventListener('click', event => {
                if (event.target.closest('.checkbox-wrapper')) {
                    return;
                }

                event.preventDefault();
                checkbox.checked = !checkbox.checked;
                checkbox.dispatchEvent(new Event('change', { bubbles: true }));
            });
        });
    }

    function bindTriggerKeyboard(dropdown, trigger, items) {
        trigger.addEventListener('keydown', event => {
            if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                if (!dropdown.classList.contains('is-open')) {
                    openDropdown(dropdown);
                }
                items[0]?.focus();
            }

            if (event.key === 'ArrowUp') {
                event.preventDefault();
                if (!dropdown.classList.contains('is-open')) {
                    openDropdown(dropdown);
                }
                items[items.length - 1]?.focus();
            }

            if (event.key === 'Escape') {
                closeDropdown(dropdown);
            }
        });
    }

    function bindItemKeyboard(dropdown, trigger, items, isMulti) {
        items.forEach((item, index) => {
            item.addEventListener('keydown', event => {
                if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    items[(index + 1) % items.length]?.focus();
                }

                if (event.key === 'ArrowUp') {
                    event.preventDefault();
                    items[(index - 1 + items.length) % items.length]?.focus();
                }

                if (event.key === 'Home') {
                    event.preventDefault();
                    items[0]?.focus();
                }

                if (event.key === 'End') {
                    event.preventDefault();
                    items[items.length - 1]?.focus();
                }

                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    if (isMulti) {
                        const checkbox = item.querySelector('input[type="checkbox"]');
                        if (checkbox) {
                            checkbox.checked = !checkbox.checked;
                            syncMultiItem(item, checkbox.checked);
                            updateMultiValue(dropdown, dropdown.querySelector('.dropdown-value'));
                        }
                        return;
                    }

                    item.click();
                }

                if (event.key === 'Escape') {
                    closeDropdown(dropdown);
                    trigger.focus();
                }
            });
        });
    }

    function getItemLabel(item) {
        return item.textContent.replace(/\s+/g, ' ').trim();
    }

    function updateValue(dropdown, valueDisplay, value) {
        if (!valueDisplay) {
            return;
        }

        valueDisplay.textContent = value;
        dropdown.classList.add('has-value');
    }

    function updateMultiValue(dropdown, valueDisplay) {
        if (!valueDisplay) {
            return;
        }

        const selectedItems = Array.from(dropdown.querySelectorAll('.dropdown-item[aria-selected="true"]'));

        if (selectedItems.length === 0) {
            valueDisplay.textContent = 'Select options';
            dropdown.classList.remove('has-value');
            return;
        }

        if (selectedItems.length === 1) {
            updateValue(dropdown, valueDisplay, getItemLabel(selectedItems[0]));
            return;
        }

        updateValue(dropdown, valueDisplay, `${selectedItems.length} selected`);
    }

    function syncMultiItem(item, isSelected) {
        item.setAttribute('aria-selected', String(isSelected));
    }

    function openDropdown(dropdown) {
        closeAllDropdowns(dropdown);
        dropdown.classList.add('is-open');
        dropdown.querySelector('.dropdown-trigger')?.setAttribute('aria-expanded', 'true');
    }

    function closeAllDropdowns(exceptDropdown = null) {
        dropdowns.forEach(dropdown => {
            if (dropdown !== exceptDropdown) {
                closeDropdown(dropdown);
            }
        });
    }

    function closeDropdown(dropdown) {
        dropdown.classList.remove('is-open');
        dropdown.querySelector('.dropdown-trigger')?.setAttribute('aria-expanded', 'false');
    }
});


/**
 * Custom Scrollbar Logic
 */
document.addEventListener('DOMContentLoaded', () => {
    const scrollContainerSelectors = [
        '.custom-scrollbar',
        '.dropdown-menu',
        '.language-selector-menu',
        '.combobox-list',
        '.data-table-wrap',
        '.drawer-sheet-body',
        '.segmented-control',
        '.tab-bar',
        '.pagination-list'
    ];

    const scrollContainers = Array.from(document.querySelectorAll(scrollContainerSelectors.join(', ')))
        .filter((container, index, collection) => collection.indexOf(container) === index)
        .filter(container => container !== document.documentElement && container !== document.body);

    scrollContainers.forEach(container => {
        container.classList.add('custom-scrollbar');

        if (container.dataset.scrollbarBound === 'true') {
            return;
        }

        container.dataset.scrollbarBound = 'true';

        let scrollTimeout;
        container.addEventListener('scroll', () => {
            container.classList.add('is-scrolling');
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                container.classList.remove('is-scrolling');
            }, 900);
        });
    });
});
/**
 * Scroll Reveal Logic
 */
document.addEventListener('DOMContentLoaded', () => {
    const revealTargets = Array.from(document.querySelectorAll('[data-reveal]'));

    if (revealTargets.length === 0) {
        return;
    }

    const revealTarget = target => {
        target.classList.add('is-revealed');
    };

    if (!canUseScrollReveal) {
        revealTargets.forEach(revealTarget);
        return;
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            }

            revealTarget(entry.target);
            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.16,
    });

    revealTargets.forEach(target => {
        observer.observe(target);
    });
});

/**
 * Hyperlinks Demo Logic
 */
document.addEventListener('DOMContentLoaded', () => {
    const hyperlinksDemo = document.querySelector('#hyperlinks .hyperlinks-demo');
    const resetHyperlinksStateButton = document.getElementById('reset-hyperlinks-state');
    const demoLinks = hyperlinksDemo ? hyperlinksDemo.querySelectorAll('[data-demo-link]') : [];
    const demoNavigationLinks = hyperlinksDemo ? hyperlinksDemo.querySelectorAll('.link-navigation:not(.is-disabled):not([aria-disabled="true"])') : [];
    const globalNavigationLinks = document.querySelectorAll('.link-navigation:not(.is-disabled):not([aria-disabled="true"])');

    const bindNavigationLinkBehavior = (links) => {
        links.forEach((link) => {
            if (link.dataset.navigationBound === 'true') return;
            link.dataset.navigationBound = 'true';

            link.addEventListener('click', (event) => {
                const href = (link.getAttribute('href') || '').trim();
                if (!href.startsWith('#')) return;

                event.preventDefault();
                const isActive = link.classList.toggle('is-active');
                if (isActive) {
                    link.setAttribute('aria-current', 'page');
                } else {
                    link.removeAttribute('aria-current');
                }
            });
        });
    };

    demoLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            link.classList.add('is-visited');
        });
    });

    bindNavigationLinkBehavior(demoNavigationLinks);
    bindNavigationLinkBehavior(globalNavigationLinks);

    if (resetHyperlinksStateButton) {
        resetHyperlinksStateButton.addEventListener('click', () => {
            demoLinks.forEach((link) => {
                link.classList.remove('is-visited');
                link.blur();
            });
            demoNavigationLinks.forEach((link) => {
                link.classList.remove('is-active');
                link.removeAttribute('aria-current');
                link.blur();
            });
        });
    }
});

/**
 * Docs Navigation Current Page Sync
 */
document.addEventListener('DOMContentLoaded', () => {
    syncDocsNavigationCurrentPage();
});

function syncDocsNavigationCurrentPage() {
    const docsNavs = document.querySelectorAll('#docs-nav-drawer nav, body > aside .sidebar nav');
    if (!docsNavs.length) return;

    const currentPage = normalizeDocsPageName(window.location.pathname);
    if (!currentPage) return;

    docsNavs.forEach((nav) => {
        const links = nav.querySelectorAll('.dropdown-trigger[href]');

        links.forEach((link) => {
            const href = (link.getAttribute('href') || '').trim();
            const pageName = normalizeDocsPageName(href);

            if (pageName && pageName === currentPage) {
                link.setAttribute('aria-current', 'page');
                return;
            }

            link.removeAttribute('aria-current');
        });
    });
}

function normalizeDocsPageName(pathValue) {
    if (!pathValue) return '';

    const trimmedValue = pathValue.trim();
    if (!trimmedValue || trimmedValue.startsWith('#')) return '';
    if (/^(?:[a-z]+:)?\/\//i.test(trimmedValue)) return '';
    if (/^(?:mailto:|tel:)/i.test(trimmedValue)) return '';

    const cleanPath = trimmedValue.split('#')[0].split('?')[0].replace(/\\/g, '/');
    if (!cleanPath) return 'index.html';

    const segments = cleanPath.split('/').filter(Boolean);
    const leaf = segments.length ? segments[segments.length - 1] : '';

    return (leaf || 'index.html').toLowerCase();
}

/**
 * File Uploader Component Scripts
 */

document.addEventListener('DOMContentLoaded', () => {
    initUploaders();
});

function initUploaders() {
    const uploaders = document.querySelectorAll('[data-uploader]');
    uploaders.forEach((uploader) => {
        setupUploader(uploader);
    });
}

function syncUploaderDisabledState(uploader, dropZone, fileInput) {
    const isDisabled = uploader.getAttribute('aria-disabled') === 'true' || (fileInput && fileInput.disabled);

    if (!dropZone) {
        return isDisabled;
    }

    if (isDisabled) {
        dropZone.setAttribute('aria-disabled', 'true');
        dropZone.setAttribute('tabindex', '-1');
        return true;
    }

    dropZone.removeAttribute('aria-disabled');

    if (!dropZone.hasAttribute('tabindex') || dropZone.getAttribute('tabindex') === '-1') {
        dropZone.setAttribute('tabindex', '0');
    }

    return false;
}

function setupUploader(uploader) {
    const dropZone = uploader.querySelector('[data-uploader-zone]');
    const fileInput = uploader.querySelector('[data-uploader-input]');
    const text = uploader.querySelector('[data-uploader-text]');
    const note = uploader.querySelector('.uploader-note');

    if (!dropZone || !fileInput) return;

    if (syncUploaderDisabledState(uploader, dropZone, fileInput)) {
        uploader.classList.remove('is-dragover');
        return;
    }

    let dragDepth = 0;

    const openFilePicker = () => {
        fileInput.click();
    };

    dropZone.addEventListener('click', () => {
        openFilePicker();
    });

    dropZone.addEventListener('keydown', (event) => {
        const isEnter = event.key === 'Enter';
        const isSpace = event.key === ' ' || event.key === 'Spacebar';

        if (!isEnter && !isSpace) return;

        event.preventDefault();
        openFilePicker();
    });

    dropZone.addEventListener('dragenter', (event) => {
        event.preventDefault();
        dragDepth += 1;
        uploader.classList.add('is-dragover');
    });

    dropZone.addEventListener('dragover', (event) => {
        event.preventDefault();
        uploader.classList.add('is-dragover');
    });

    dropZone.addEventListener('dragleave', (event) => {
        event.preventDefault();
        dragDepth = Math.max(0, dragDepth - 1);

        if (dragDepth === 0) {
            uploader.classList.remove('is-dragover');
        }
    });

    dropZone.addEventListener('drop', (event) => {
        event.preventDefault();
        dragDepth = 0;
        uploader.classList.remove('is-dragover');

        const files = event.dataTransfer ? event.dataTransfer.files : null;
        handleUploaderFiles(files || [], uploader);
    });

    fileInput.addEventListener('change', () => {
        handleUploaderFiles(fileInput.files, uploader);
    });

    if (uploader.classList.contains('is-error') && text) {
        setUploaderErrorState(
            uploader,
            text,
            note,
            fileInput,
            text.textContent.trim(),
            note ? note.textContent.trim() : ''
        );
        return;
    }

    handleUploaderFiles(fileInput.files, uploader);
}

function isPdfFile(file) {
    if (!file) return false;
    const name = (file.name || '').toLowerCase();
    const type = (file.type || '').toLowerCase();
    return type === 'application/pdf' || name.endsWith('.pdf');
}

function getUploaderMaxBytes(uploader) {
    const rawMaxSizeMb = uploader.dataset.uploaderMaxSizeMb;
    const maxSizeMb = Number(rawMaxSizeMb);

    if (!Number.isFinite(maxSizeMb) || maxSizeMb <= 0) {
        return null;
    }

    return maxSizeMb * 1024 * 1024;
}

function formatUploaderMaxSize(maxBytes) {
    const maxSizeMb = maxBytes / (1024 * 1024);
    return Number.isInteger(maxSizeMb) ? `${maxSizeMb} MB` : `${maxSizeMb.toFixed(1)} MB`;
}

function setUploaderIcon(uploader, iconClass) {
    const icon = uploader.querySelector('.uploader-icon i');
    if (!icon) return;

    if (!icon.dataset.uploaderIdleIcon) {
        icon.dataset.uploaderIdleIcon = icon.className;
    }

    icon.className = iconClass;
}

function resetUploaderIcon(uploader) {
    const icon = uploader.querySelector('.uploader-icon i');
    if (!icon) return;

    if (!icon.dataset.uploaderIdleIcon) {
        icon.dataset.uploaderIdleIcon = icon.className;
    }

    icon.className = icon.dataset.uploaderIdleIcon;
}

function setUploaderErrorState(uploader, text, note, fileInput, errorText, errorNote) {
    uploader.classList.remove('has-files');
    uploader.classList.remove('is-default');
    uploader.classList.add('is-error');
    setUploaderIcon(uploader, 'ri-close-line');
    text.textContent = errorText;

    if (note) {
        note.textContent = errorNote;
    }

    if (fileInput) {
        fileInput.setAttribute('aria-invalid', 'true');
        fileInput.value = '';
    }
}

function handleUploaderFiles(files, uploader) {
    const text = uploader.querySelector('[data-uploader-text]');
    const note = uploader.querySelector('.uploader-note');
    const fileInput = uploader.querySelector('[data-uploader-input]');

    if (!text) return;

    const idleText = text.dataset.uploaderIdleText || text.textContent.trim();
    const idleNote = note ? (note.dataset.uploaderIdleNote || note.textContent.trim()) : '';

    if (note && !note.dataset.uploaderIdleNote) {
        note.dataset.uploaderIdleNote = idleNote;
    }

    const fileCount = files ? files.length : 0;
    const maxBytes = getUploaderMaxBytes(uploader);

    uploader.classList.remove('is-dragover');

    if (fileCount > 0) {
        const selectedFiles = Array.from(files);
        const isPdfOnly = uploader.classList.contains('uploader-file');
        const hasInvalidFileType = isPdfOnly && selectedFiles.some((file) => !isPdfFile(file));
        const hasOversizedFile = maxBytes !== null && selectedFiles.some((file) => file.size > maxBytes);

        if (hasInvalidFileType || hasOversizedFile) {
            const maxSizeLabel = maxBytes === null ? '' : formatUploaderMaxSize(maxBytes);
            let errorText = 'Please upload a valid file.';
            let errorNote = idleNote;

            if (hasInvalidFileType && hasOversizedFile) {
                errorText = `Only PDF files up to ${maxSizeLabel} are allowed.`;
                errorNote = `Please upload PDF files that are ${maxSizeLabel} or smaller.`;
            } else if (hasInvalidFileType) {
                errorText = 'Only PDF files are allowed.';
                errorNote = 'Please upload a PDF file.';
            } else if (hasOversizedFile) {
                errorText = `Files must be ${maxSizeLabel} or smaller.`;
                errorNote = `Please upload files that are ${maxSizeLabel} or smaller.`;
            }

            setUploaderErrorState(uploader, text, note, fileInput, errorText, errorNote);
            return;
        }

        uploader.classList.remove('is-error');
        resetUploaderIcon(uploader);

        if (fileInput) {
            fileInput.removeAttribute('aria-invalid');
        }

        if (note && note.dataset.uploaderIdleNote) {
            note.textContent = note.dataset.uploaderIdleNote;
        }

        const itemWord = fileCount === 1 ? 'item' : 'items';
        uploader.classList.remove('is-default');
        uploader.classList.add('has-files');
        text.textContent = `${fileCount} ${itemWord} ready to upload`;
        return;
    }

    uploader.classList.remove('has-files');
    uploader.classList.remove('is-error');
    uploader.classList.add('is-default');
    resetUploaderIcon(uploader);
    text.textContent = idleText;

    if (note && note.dataset.uploaderIdleNote) {
        note.textContent = note.dataset.uploaderIdleNote;
    }

    if (fileInput) {
        fileInput.removeAttribute('aria-invalid');
    }
}
/**
 * Language Selector Logic
 */


/* Legacy language-selector hooks removed. */
/* legacy payload retained only as commented history
        'pt': { src: 'https://flagcdn.com/w40/pt.png', srcset: 'https://flagcdn.com/w80/pt.png 2x', alt: 'Portuguese' },
        'es': { src: 'https://flagcdn.com/w40/es.png', srcset: 'https://flagcdn.com/w80/es.png 2x', alt: 'Spanish' },
        'fr': { src: 'https://flagcdn.com/w40/fr.png', srcset: 'https://flagcdn.com/w80/fr.png 2x', alt: 'French' },
    };

}

function legacyLanguageSelectorCloseShim() {
    return;
*/

document.addEventListener('DOMContentLoaded', () => {
    const languageMetadata = {
        gb: { label: 'English' },
        pt: { label: 'Portugu\u00EAs' },
        es: { label: 'Espa\u00F1ol' },
    };

    const selectors = Array.from(document.querySelectorAll('.language-selector'));

    if (selectors.length === 0) {
        return;
    }
    const enabledSelectors = selectors.filter(selector => {
        const trigger = selector.querySelector('.language-selector-trigger');
        return trigger && !trigger.disabled && trigger.getAttribute('aria-disabled') !== 'true' && selector.getAttribute('aria-disabled') !== 'true';
    });

    enabledSelectors.forEach(selector => {
        const trigger = selector.querySelector('.language-selector-trigger');
        const options = Array.from(selector.querySelectorAll('.language-selector-option'));
        const valueDisplay = selector.querySelector('.language-selector-value');

        options.forEach(option => {
            option.setAttribute('tabindex', '-1');

            option.addEventListener('focus', () => {
                option.scrollIntoView({ block: 'nearest' });
            });

            option.addEventListener('click', () => {
                syncLanguageSelection(selector, option, valueDisplay, languageMetadata);
                closeLanguageSelector(selector);
                trigger.focus();
            });
        });

        initializeLanguageSelector(selector, options, valueDisplay, languageMetadata);
        bindLanguageTriggerKeyboard(selector, trigger, options);
        bindLanguageOptionKeyboard(selector, trigger, options, valueDisplay, languageMetadata);

        trigger.addEventListener('click', () => {
            if (selector.classList.contains('is-open')) {
                closeLanguageSelector(selector);
                return;
            }

            openLanguageSelector(selector);
        });
    });

    document.addEventListener('click', event => {
        if (!event.target.closest('.language-selector')) {
            closeAllLanguageSelectors();
        }
    });

    function initializeLanguageSelector(selector, options, valueDisplay, metadata) {
        const selectedOption = options.find(option => option.getAttribute('aria-selected') === 'true')
            || options.find(option => option.dataset.code === 'gb')
            || options[0];

        if (!selectedOption) {
            return;
        }

        syncLanguageSelection(selector, selectedOption, valueDisplay, metadata);
    }

    function bindLanguageTriggerKeyboard(selector, trigger, options) {
        trigger.addEventListener('keydown', event => {
            const selectedOption = getSelectedLanguageOption(options);

            if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                if (!selector.classList.contains('is-open')) {
                    openLanguageSelector(selector);
                }
                (selectedOption || options[0])?.focus();
            }

            if (event.key === 'ArrowUp') {
                event.preventDefault();
                if (!selector.classList.contains('is-open')) {
                    openLanguageSelector(selector);
                }
                (selectedOption || options[options.length - 1])?.focus();
            }

            if (event.key === 'Escape') {
                closeLanguageSelector(selector);
            }
        });
    }

    function bindLanguageOptionKeyboard(selector, trigger, options, valueDisplay, metadata) {
        options.forEach((option, index) => {
            option.addEventListener('keydown', event => {
                if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    options[(index + 1) % options.length]?.focus();
                }

                if (event.key === 'ArrowUp') {
                    event.preventDefault();
                    options[(index - 1 + options.length) % options.length]?.focus();
                }

                if (event.key === 'Home') {
                    event.preventDefault();
                    options[0]?.focus();
                }

                if (event.key === 'End') {
                    event.preventDefault();
                    options[options.length - 1]?.focus();
                }

                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    syncLanguageSelection(selector, option, valueDisplay, metadata);
                    closeLanguageSelector(selector);
                    trigger.focus();
                }

                if (event.key === 'Escape') {
                    closeLanguageSelector(selector);
                    trigger.focus();
                }
            });
        });
    }

    function getSelectedLanguageOption(options) {
        return options.find(option => option.getAttribute('aria-selected') === 'true');
    }

    function syncLanguageSelection(selector, selectedOption, valueDisplay, metadata) {
        const options = Array.from(selector.querySelectorAll('.language-selector-option'));

        options.forEach(option => {
            option.setAttribute('aria-selected', String(option === selectedOption));
        });

        const code = (selectedOption.dataset.code || 'gb').toLowerCase();
        const optionLabel = selectedOption.dataset.label || getLanguageOptionLabel(selectedOption);
        const language = metadata[code] || { label: optionLabel };
        updateLanguageSelectorTrigger(selector, code, selectedOption.dataset.label || language.label, valueDisplay, selectedOption);
        selector.classList.add('has-value');
    }

    function updateLanguageSelectorTrigger(selector, code, label, valueDisplay, selectedOption = null) {
        const trigger = selector.querySelector('.language-selector-trigger');
        const triggerFlag = selector.querySelector('.language-selector-current .language-selector-flag');

        if (trigger) {
            trigger.setAttribute('aria-label', `Current language: ${label}`);
        }

        if (triggerFlag) {
            triggerFlag.src = getLanguageFlagSrc(code);
            triggerFlag.srcset = getLanguageFlagSrcSet(code);
            triggerFlag.alt = '';
        }

        if (valueDisplay) {
            valueDisplay.textContent = selectedOption?.dataset.value || label;
        }
    }

    function getLanguageOptionLabel(option) {
        return option.querySelector('span')?.textContent.replace(/\s+/g, ' ').trim() || '';
    }

    function getLanguageFlagSrc(code) {
        return `https://flagcdn.com/w40/${code}.png`;
    }

    function getLanguageFlagSrcSet(code) {
        return `https://flagcdn.com/w80/${code}.png 2x`;
    }

    function openLanguageSelector(selector) {
        closeAllLanguageSelectors(selector);
        selector.classList.add('is-open');
        selector.querySelector('.language-selector-trigger')?.setAttribute('aria-expanded', 'true');
    }

    function closeAllLanguageSelectors(exceptSelector = null) {
        selectors.forEach(selector => {
            if (selector !== exceptSelector) {
                closeLanguageSelector(selector);
            }
        });
    }

    function closeLanguageSelector(selector) {
        selector.classList.remove('is-open');
        selector.querySelector('.language-selector-trigger')?.setAttribute('aria-expanded', 'false');
    }
});


/**
 * Material Selector Logic
 * Handles single-selection material buttons
 */

function getEnabledMaterialItems(list) {
    return Array.from(list.querySelectorAll('.material-item')).filter(item => {
        return !item.disabled && item.getAttribute('aria-disabled') !== 'true';
    });
}

function syncMaterialSelectorState(list) {
    const items = Array.from(list.querySelectorAll('.material-item'));

    if (!items.length) {
        return;
    }

    const enabledItems = getEnabledMaterialItems(list);
    const selectedItem = items.find(item => {
        return item.classList.contains('is-selected') || item.getAttribute('aria-selected') === 'true';
    }) || null;
    const focusItem = enabledItems.find(item => item === selectedItem) || enabledItems[0] || null;

    items.forEach(item => {
        const isSelected = item === selectedItem;
        item.classList.toggle('is-selected', isSelected);
        item.setAttribute('aria-selected', isSelected ? 'true' : 'false');
        item.tabIndex = item === focusItem ? 0 : -1;
    });
}

function selectMaterial(element, options = {}) {
    const list = element.closest('.material-selector-list');

    if (!list || element.disabled || element.getAttribute('aria-disabled') === 'true') {
        return;
    }

    const items = list.querySelectorAll('.material-item');

    items.forEach(item => {
        item.classList.remove('is-selected');
        item.setAttribute('aria-selected', 'false');
        item.tabIndex = -1;
    });

    element.classList.add('is-selected');
    element.setAttribute('aria-selected', 'true');
    element.tabIndex = 0;

    if (options.focus) {
        element.focus();
    }
}

function initializeMaterialSelectors() {
    const materialLists = document.querySelectorAll('.material-selector-list');

    materialLists.forEach(list => {
        syncMaterialSelectorState(list);

        list.addEventListener('click', event => {
            const item = event.target.closest('.material-item');

            if (!item || !list.contains(item)) {
                return;
            }

            selectMaterial(item);
        });

        list.addEventListener('keydown', event => {
            const currentItem = event.target.closest('.material-item');

            if (!currentItem || !list.contains(currentItem)) {
                return;
            }

            const enabledItems = getEnabledMaterialItems(list);

            if (!enabledItems.length) {
                return;
            }

            const currentIndex = enabledItems.indexOf(currentItem);
            let nextIndex = currentIndex;

            switch (event.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                    nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % enabledItems.length;
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                    nextIndex = currentIndex === -1 ? enabledItems.length - 1 : (currentIndex - 1 + enabledItems.length) % enabledItems.length;
                    break;
                case 'Home':
                    nextIndex = 0;
                    break;
                case 'End':
                    nextIndex = enabledItems.length - 1;
                    break;
                default:
                    return;
            }

            event.preventDefault();
            selectMaterial(enabledItems[nextIndex], { focus: true });
        });
    });
}

document.addEventListener('DOMContentLoaded', initializeMaterialSelectors);

/**
 * Stepper Component Logic
 */

function getStepperItems(stepperRoot) {
    return Array.from(stepperRoot.querySelectorAll('[data-stepper-item]'));
}

function getInitialActiveStep(stepperRoot) {
    const items = getStepperItems(stepperRoot);
    const activeItem = items.find(item => item.classList.contains('is-active'))
        || items.find(item => item.querySelector('[data-stepper-button][aria-pressed="true"]'))
        || items[0];

    return Number(activeItem?.dataset.step) || 1;
}

function getInitialUnlockedStep(stepperRoot) {
    const unlockedSteps = getStepperItems(stepperRoot)
        .filter(item => !item.classList.contains('is-locked'))
        .map(item => Number(item.dataset.step) || 1);

    return unlockedSteps.length ? Math.max(...unlockedSteps) : getInitialActiveStep(stepperRoot);
}

function setActiveStep(stepNumber, stepperRoot = null) {
    const targetRoot = stepperRoot || document.querySelector('.stepper');

    if (!targetRoot) {
        return;
    }

    const allItems = getStepperItems(targetRoot);

    if (!allItems.length) {
        return;
    }

    const totalSteps = allItems.length;
    const requestedStep = Math.min(Math.max(Number(stepNumber) || 1, 1), totalSteps);
    const currentMaxUnlocked = Number(targetRoot.dataset.stepperMaxUnlocked) || 1;
    const maxUnlockedStep = Math.max(currentMaxUnlocked, requestedStep);

    targetRoot.dataset.stepperMaxUnlocked = String(maxUnlockedStep);

    allItems.forEach((item) => {
        const itemStep = Number(item.dataset.step) || 1;
        const isActive = itemStep === requestedStep;
        const isLocked = itemStep > maxUnlockedStep;
        const button = item.querySelector('[data-stepper-button]');

        item.classList.remove('is-default', 'is-active', 'is-locked');

        if (isActive) {
            item.classList.add('is-active');
        } else if (isLocked) {
            item.classList.add('is-locked');
        } else {
            item.classList.add('is-default');
        }

        if (button) {
            button.setAttribute('aria-pressed', isActive ? 'true' : 'false');

            if (isActive) {
                button.setAttribute('aria-current', 'step');
            } else {
                button.removeAttribute('aria-current');
            }
        }
    });
}

function initializeSteppers() {
    const stepperRoots = Array.from(document.querySelectorAll('.stepper')).filter(stepperRoot => {
        return stepperRoot.querySelector('[data-stepper-item]');
    });

    stepperRoots.forEach((stepperRoot) => {
        const initialActiveStep = getInitialActiveStep(stepperRoot);
        const initialUnlockedStep = Math.max(getInitialUnlockedStep(stepperRoot), initialActiveStep);

        stepperRoot.dataset.stepperMaxUnlocked = String(initialUnlockedStep);
        setActiveStep(initialActiveStep, stepperRoot);

        if (stepperRoot.dataset.stepperClickBound === 'true') {
            return;
        }

        stepperRoot.dataset.stepperClickBound = 'true';
        stepperRoot.addEventListener('click', (event) => {
            const stepItem = event.target.closest('[data-stepper-item]');

            if (!stepItem || !stepperRoot.contains(stepItem)) {
                return;
            }

            setActiveStep(Number(stepItem.dataset.step) || 1, stepperRoot);
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSteppers);
} else {
    initializeSteppers();
}

/**
 * Quantity Selector Logic
 */

function initializeQuantitySelectors() {
    const wrappers = document.querySelectorAll('.quantity-selector');

    wrappers.forEach(wrapper => {
        const input = wrapper.querySelector('.quantity-selector-value');
        const buttons = wrapper.querySelectorAll('button');
        const decreaseBtn = buttons[0];
        const increaseBtn = buttons[buttons.length - 1];

        if (!input || buttons.length < 2 || !decreaseBtn || !increaseBtn) {
            return;
        }

        const min = parseInt(wrapper.dataset.min || input.min || '0', 10);
        const max = parseInt(wrapper.dataset.max || input.max || '999', 10);
        const resolvedMin = Number.isNaN(min) ? 0 : min;
        const resolvedMax = Number.isNaN(max) ? 999 : max;
        const isLocked = wrapper.getAttribute('aria-disabled') === 'true' || input.disabled;
        let lastValidValue = resolvedMin;

        input.min = String(resolvedMin);
        input.max = String(resolvedMax);
        input.step = '1';

        const initialValue = parseInt(input.value, 10);
        const safeInitialValue = Number.isNaN(initialValue)
            ? resolvedMin
            : Math.min(resolvedMax, Math.max(resolvedMin, initialValue));

        input.value = safeInitialValue;
        lastValidValue = safeInitialValue;
        updateState();

        if (isLocked) {
            return;
        }

        decreaseBtn.addEventListener('click', () => {
            commitTypedValue();

            const currentValue = parseInt(input.value, 10);
            if (currentValue > resolvedMin) {
                updateValue(currentValue - 1);
            }
        });

        increaseBtn.addEventListener('click', () => {
            commitTypedValue();

            const currentValue = parseInt(input.value, 10);
            if (currentValue < resolvedMax) {
                updateValue(currentValue + 1);
            }
        });

        input.addEventListener('blur', () => {
            commitTypedValue();
        });

        input.addEventListener('change', () => {
            commitTypedValue();
        });

        function updateValue(newValue) {
            setCommittedValue(newValue, true);
        }

        function commitTypedValue() {
            const rawValue = input.value.trim();
            let nextValue;

            if (rawValue === '') {
                nextValue = lastValidValue;
            } else {
                const parsedValue = parseInt(rawValue, 10);
                nextValue = Number.isNaN(parsedValue) ? lastValidValue : parsedValue;
            }

            if (nextValue < resolvedMin) {
                nextValue = resolvedMin;
            }

            if (nextValue > resolvedMax) {
                nextValue = resolvedMax;
            }

            setCommittedValue(nextValue, false);
        }

        function setCommittedValue(newValue, dispatchChange) {
            input.value = newValue;
            lastValidValue = newValue;
            updateState();

            if (dispatchChange) {
                input.dispatchEvent(new Event('change'));
            }
        }

        function updateState() {
            let currentValue = parseInt(input.value, 10);

            if (Number.isNaN(currentValue)) {
                currentValue = lastValidValue;
                input.value = currentValue;
            }

            if (isLocked) {
                decreaseBtn.disabled = true;
                increaseBtn.disabled = true;
                return;
            }

            if (currentValue <= resolvedMin) {
                decreaseBtn.disabled = true;
                input.value = resolvedMin;
                lastValidValue = resolvedMin;
            } else {
                decreaseBtn.disabled = false;
            }

            if (currentValue >= resolvedMax) {
                increaseBtn.disabled = true;
                input.value = resolvedMax;
                lastValidValue = resolvedMax;
            } else {
                increaseBtn.disabled = false;
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', initializeQuantitySelectors);

function isLettersAndSpaces(value) {
    const trimmedValue = value.trim();

    if (trimmedValue === '') {
        return false;
    }

    return /^[\p{L}\p{M}]+(?:\s+[\p{L}\p{M}]+)*$/u.test(trimmedValue);
}

function isMinLength(value, minimumLength) {
    return value.trim().length >= minimumLength;
}

function isValidTextFieldValue(input) {
    if (!input) {
        return false;
    }

    const validationRule = input.dataset.textValidation || 'non-empty';

    if (validationRule === 'letters-spaces') {
        return isLettersAndSpaces(input.value);
    }

    if (validationRule === 'min-length') {
        return isMinLength(input.value, Number(input.dataset.minLength || 1));
    }

    return input.value.trim() !== '';
}

function applyInputValidationState(input, hint, isValid) {
    if (!input || !hint) {
        return;
    }

    const validMessage = input.dataset.validMessage || 'Looks great!';
    const invalidMessage = input.dataset.invalidMessage || 'Please provide a valid entry.';

    input.classList.toggle('input-success', isValid);
    input.classList.toggle('input-error', !isValid);
    input.setAttribute('aria-invalid', isValid ? 'false' : 'true');

    hint.classList.toggle('input-success', isValid);
    hint.classList.toggle('input-error', !isValid);

    hint.textContent = isValid ? validMessage : invalidMessage;
}

function resetInputValidationState(input, hint) {
    if (!input || !hint) {
        return;
    }

    const defaultMessage = hint.dataset.defaultMessage || input.dataset.defaultMessage || '';

    input.classList.remove('input-success', 'input-error');
    input.setAttribute('aria-invalid', 'false');

    hint.classList.remove('input-success', 'input-error');
    hint.textContent = defaultMessage;
}

function getTextFieldHint(input) {
    if (!input) {
        return null;
    }

    return (input.getAttribute('aria-describedby') || '')
        .split(/\s+/)
        .map(id => document.getElementById(id))
        .find(element => element && element.classList.contains('input-hint')) || null;
}

function initializeTextFieldDemo() {
    const section = document.getElementById('text-field');

    if (!section || section.dataset.textFieldInitialized === 'true') {
        return;
    }

    section.dataset.textFieldInitialized = 'true';

    const passwordInput = section.querySelector('#passwordInput');
    const passwordToggle = section.querySelector('#passwordToggle');

    if (passwordInput && passwordToggle) {
        passwordToggle.addEventListener('click', () => {
            const icon = passwordToggle.querySelector('i');
            const isPassword = passwordInput.type === 'password';

            passwordInput.type = isPassword ? 'text' : 'password';
            passwordToggle.setAttribute('aria-pressed', isPassword ? 'true' : 'false');
            passwordToggle.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');

            if (icon) {
                icon.className = isPassword ? 'ri-eye-off-line text-icon-xs' : 'ri-eye-line text-icon-xs';
                icon.setAttribute('aria-hidden', 'true');
            }
        });
    }

    const bioInput = section.querySelector('#bioInput');
    const charCount = section.querySelector('#charCount');

    if (bioInput && charCount) {
        const syncCharCount = () => {
            charCount.textContent = `${bioInput.value.length}/${bioInput.maxLength}`;
        };

        syncCharCount();
        bioInput.addEventListener('input', syncCharCount);
    }

    const validatedInputs = section.querySelectorAll('[data-text-validation]');

    validatedInputs.forEach(input => {
        const hint = getTextFieldHint(input);

        if (!hint) {
            return;
        }

        const defaultMessage = hint.textContent.trim();
        hint.dataset.defaultMessage = defaultMessage;
        input.dataset.defaultMessage = defaultMessage;

        const syncValidation = (mode = 'input') => {
            const hasValue = input.value.trim() !== '';

            if (!hasValue) {
                if (mode === 'blur' && input.required) {
                    applyInputValidationState(input, hint, false);
                    return;
                }

                resetInputValidationState(input, hint);
                return;
            }

            applyInputValidationState(input, hint, isValidTextFieldValue(input));
        };

        resetInputValidationState(input, hint);
        input.addEventListener('input', () => syncValidation('input'));
        input.addEventListener('blur', () => syncValidation('blur'));
    });

}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTextFieldDemo);
} else {
    initializeTextFieldDemo();
}


/**
 * Modal Component Scripts
 */

document.addEventListener('DOMContentLoaded', () => {
    const triggers = Array.from(document.querySelectorAll('[data-modal-target]'));
    const overlays = Array.from(document.querySelectorAll('.modal-overlay'));

    if (triggers.length === 0 || overlays.length === 0) {
        return;
    }

    overlays.forEach(overlay => {
        overlay.inert = true;
        overlay.setAttribute('aria-hidden', 'true');
        overlay.querySelector('.modal')?.setAttribute('tabindex', '-1');

        overlay.querySelectorAll('[data-close-modal], .modal-close').forEach(button => {
            if (button.tagName === 'BUTTON') {
                button.setAttribute('type', 'button');
            }

            button.addEventListener('click', () => {
                closeModal(overlay, true);
            });
        });

        overlay.addEventListener('click', event => {
            if (event.target === overlay) {
                closeModal(overlay, true);
            }
        });
    });

    triggers.forEach(trigger => {
        const modalId = trigger.getAttribute('data-modal-target');
        if (!modalId) {
            return;
        }

        trigger.setAttribute('aria-controls', modalId);
        trigger.setAttribute('aria-expanded', 'false');
        trigger.setAttribute('aria-haspopup', 'dialog');

        trigger.addEventListener('click', () => {
            const overlay = overlays.find(item => item.id === modalId);
            if (!overlay) {
                return;
            }

            openModal(overlay, trigger);
        });
    });

    document.addEventListener('keydown', event => {
        const openOverlay = overlays.find(overlay => overlay.classList.contains('is-open'));
        if (!openOverlay) {
            return;
        }

        if (event.key === 'Escape') {
            closeModal(openOverlay, true);
            return;
        }

        if (event.key === 'Tab') {
            trapModalFocus(openOverlay, event);
        }
    });

    function getFocusableElements(root) {
        return Array.from(root.querySelectorAll('a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'))
            .filter(element => !element.hasAttribute('inert') && !element.closest('[inert]') && !element.hidden && element.getAttribute('aria-hidden') !== 'true');
    }

    function trapModalFocus(overlay, event) {
        const panel = overlay.querySelector('.modal');
        if (!panel) {
            return;
        }

        const focusable = getFocusableElements(panel);
        if (focusable.length === 0) {
            event.preventDefault();
            panel.focus({ preventScroll: true });
            return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus({ preventScroll: true });
            return;
        }

        if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus({ preventScroll: true });
        }
    }

    function syncTriggerState(targetId, isOpen) {
        triggers
            .filter(trigger => trigger.getAttribute('data-modal-target') === targetId)
            .forEach(trigger => {
                trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            });
    }

    function syncBodyLock() {
        document.body.classList.toggle('modal-open', overlays.some(overlay => overlay.classList.contains('is-open')));
    }

    function openModal(overlay, trigger) {
        if (!overlay) {
            return;
        }

        overlays.forEach(otherOverlay => {
            if (otherOverlay !== overlay) {
                closeModal(otherOverlay, false);
            }
        });

        overlay.inert = false;
        overlay.classList.add('is-open');
        overlay.classList.remove('is-visible');
        overlay.setAttribute('aria-hidden', 'false');
        overlay._lastTrigger = trigger;
        syncTriggerState(overlay.id, true);
        syncBodyLock();

        requestAnimationFrame(() => {
            const panel = overlay.querySelector('.modal');
            const initialFocus = overlay.querySelector('[data-modal-initial-focus]')
                || (panel ? getFocusableElements(panel)[0] : null)
                || panel;

            initialFocus?.focus({ preventScroll: true });
        });
    }

    function closeModal(overlay, restoreFocus) {
        if (!overlay) {
            return;
        }

        overlay.classList.remove('is-open');
        overlay.classList.remove('is-visible');
        overlay.setAttribute('aria-hidden', 'true');
        overlay.inert = true;
        syncTriggerState(overlay.id, false);
        syncBodyLock();

        if (restoreFocus && overlay._lastTrigger) {
            overlay._lastTrigger.focus({ preventScroll: true });
        }
    }
});


/**
 * Carousel Component Logic
 * Handles slide transitions, dot/arrow navigation, keyboard support, and opt-in autoplay.
 */

document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const carousels = document.querySelectorAll('[data-carousel]');

    carousels.forEach((carousel, carouselIndex) => {
        const track = carousel.querySelector('.carousel-track');
        if (!track) return;

        const slides = Array.from(track.querySelectorAll('.carousel-slide'));
        const dots = Array.from(carousel.querySelectorAll('.carousel-dot'));
        const prevBtn = carousel.querySelector('.carousel-prev');
        const nextBtn = carousel.querySelector('.carousel-next');
        const isAutoplayEnabled = carousel.dataset.carouselAutoplay === 'true';
        const autoplayDelay = 5000;

        if (slides.length === 0) return;

        let currentIndex = slides.findIndex(slide => slide.classList.contains('is-active'));
        let autoplayTimer = null;
        let isPointerInside = false;
        let hasFocusWithin = false;
        if (currentIndex === -1) currentIndex = 0;

        carousel.setAttribute('tabindex', '0');
        carousel.setAttribute('role', 'region');
        carousel.setAttribute('aria-roledescription', 'carousel');

        if (!carousel.hasAttribute('aria-label')) {
            carousel.setAttribute('aria-label', 'Image carousel ' + (carouselIndex + 1));
        }

        slides.forEach((slide, index) => {
            slide.setAttribute('role', 'group');
            slide.setAttribute('aria-roledescription', 'slide');
            slide.setAttribute('aria-label', 'Slide ' + (index + 1) + ' of ' + slides.length);
        });

        dots.forEach((dot, index) => {
            dot.setAttribute('type', 'button');
            if (!dot.hasAttribute('aria-label')) {
                dot.setAttribute('aria-label', 'Go to slide ' + (index + 1));
            }
        });

        if (prevBtn) prevBtn.setAttribute('type', 'button');
        if (nextBtn) nextBtn.setAttribute('type', 'button');

        function goToSlide(index) {
            if (index < 0) index = slides.length - 1;
            if (index >= slides.length) index = 0;

            slides.forEach((slide, i) => {
                const isTarget = i === index;
                slide.classList.toggle('is-active', isTarget);
                slide.setAttribute('aria-hidden', isTarget ? 'false' : 'true');
                slide.inert = !isTarget;
            });

            dots.forEach((dot, i) => {
                const isTarget = i === index;
                dot.classList.toggle('is-active', isTarget);
                dot.setAttribute('aria-pressed', isTarget ? 'true' : 'false');

                if (isTarget) {
                    dot.setAttribute('aria-current', 'true');
                } else {
                    dot.removeAttribute('aria-current');
                }
            });

            currentIndex = index;
        }

        function stopAutoplay() {
            if (autoplayTimer !== null) {
                window.clearInterval(autoplayTimer);
                autoplayTimer = null;
            }
        }

        function startAutoplay() {
            if (!isAutoplayEnabled || slides.length < 2 || prefersReducedMotionQuery.matches || document.hidden || isPointerInside || hasFocusWithin) {
                return;
            }

            stopAutoplay();
            autoplayTimer = window.setInterval(() => {
                goToSlide(currentIndex + 1);
            }, autoplayDelay);
        }

        function restartAutoplay() {
            stopAutoplay();
            startAutoplay();
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                goToSlide(currentIndex - 1);
                restartAutoplay();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                goToSlide(currentIndex + 1);
                restartAutoplay();
            });
        }

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                goToSlide(index);
                restartAutoplay();
            });
        });

        carousel.addEventListener('keydown', event => {
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                goToSlide(currentIndex - 1);
                restartAutoplay();
            }

            if (event.key === 'ArrowRight') {
                event.preventDefault();
                goToSlide(currentIndex + 1);
                restartAutoplay();
            }
        });

        if (isAutoplayEnabled) {
            carousel.addEventListener('pointerenter', () => {
                isPointerInside = true;
                stopAutoplay();
            });

            carousel.addEventListener('pointerleave', () => {
                isPointerInside = false;
                startAutoplay();
            });

            carousel.addEventListener('focusin', () => {
                hasFocusWithin = true;
                stopAutoplay();
            });

            carousel.addEventListener('focusout', event => {
                const nextFocused = event.relatedTarget;
                hasFocusWithin = Boolean(nextFocused && carousel.contains(nextFocused));

                if (!hasFocusWithin) {
                    startAutoplay();
                }
            });

            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    stopAutoplay();
                    return;
                }

                startAutoplay();
            });

            const syncMotionPreference = () => {
                if (prefersReducedMotionQuery.matches) {
                    stopAutoplay();
                    return;
                }

                startAutoplay();
            };

            if (typeof prefersReducedMotionQuery.addEventListener === 'function') {
                prefersReducedMotionQuery.addEventListener('change', syncMotionPreference);
            } else if (typeof prefersReducedMotionQuery.addListener === 'function') {
                prefersReducedMotionQuery.addListener(syncMotionPreference);
            }
        }

        goToSlide(currentIndex);
        startAutoplay();
    });
});


/* ============================================================
   Flyout Panel Logic
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    const flyouts = Array.from(document.querySelectorAll('[data-flyout-root]'));

    if (flyouts.length === 0) {
        return;
    }

    const supportsHoverTrigger = typeof window.matchMedia === 'function'
        && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    const getToggle = flyout => flyout.querySelector('[data-flyout-toggle]');
    const getSurface = flyout => flyout.querySelector('[data-flyout-surface]');
    const getTabs = flyout => Array.from(flyout.querySelectorAll('[data-flyout-category]'));

    const getFocusableItems = flyout => {
        const surface = getSurface(flyout);

        if (!surface) {
            return [];
        }

        return Array.from(surface.querySelectorAll('button:not([disabled]):not([aria-disabled="true"]), a[href], [tabindex]:not([tabindex="-1"])'))
            .filter(item => !item.hidden && !item.closest('[hidden]'));
    };

    const getEntryTarget = (flyout, preferLast = false) => {
        const tabs = getTabs(flyout);

        if (tabs.length > 0) {
            if (preferLast) {
                return tabs[tabs.length - 1];
            }

            return tabs.find(tab => tab.getAttribute('tabindex') === '0' || tab.classList.contains('is-active')) || tabs[0];
        }

        const items = getFocusableItems(flyout);

        if (items.length === 0) {
            return null;
        }

        return preferLast ? items[items.length - 1] : items[0];
    };

    const syncFlyoutState = (flyout, isOpen) => {
        flyout.classList.toggle('is-open', isOpen);
        getToggle(flyout)?.setAttribute('aria-expanded', String(isOpen));
    };

    const closeFlyout = (flyout, options = {}) => {
        syncFlyoutState(flyout, false);

        if (options.returnFocus) {
            getToggle(flyout)?.focus({ preventScroll: true });
        }
    };

    const closeAllFlyouts = (exceptFlyout = null) => {
        flyouts.forEach(flyout => {
            if (flyout !== exceptFlyout) {
                closeFlyout(flyout);
            }
        });
    };

    const openFlyout = flyout => {
        closeAllFlyouts(flyout);
        syncFlyoutState(flyout, true);
    };

    flyouts.forEach(flyout => {
        const toggle = getToggle(flyout);
        const surface = getSurface(flyout);

        if (!toggle || !surface) {
            return;
        }

        if (toggle.disabled || toggle.getAttribute('aria-disabled') === 'true' || flyout.getAttribute('aria-disabled') === 'true') {
            return;
        }

        let closeTimer;

        if (supportsHoverTrigger) {
            flyout.addEventListener('mouseenter', () => {
                clearTimeout(closeTimer);
                openFlyout(flyout);
            });

            flyout.addEventListener('mouseleave', () => {
                closeTimer = setTimeout(() => {
                    closeFlyout(flyout);
                }, 150);
            });
        }

        toggle.addEventListener('click', () => {
            if (flyout.classList.contains('is-open')) {
                closeFlyout(flyout);
                return;
            }

            openFlyout(flyout);
        });

        toggle.addEventListener('keydown', event => {
            if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                if (!flyout.classList.contains('is-open')) {
                    openFlyout(flyout);
                }
                getEntryTarget(flyout)?.focus();
            }

            if (event.key === 'ArrowUp') {
                event.preventDefault();
                if (!flyout.classList.contains('is-open')) {
                    openFlyout(flyout);
                }
                getEntryTarget(flyout, true)?.focus();
            }

            if (event.key === 'Escape') {
                closeFlyout(flyout);
            }
        });

        flyout.addEventListener('keydown', event => {
            if (event.key !== 'Escape' || !flyout.classList.contains('is-open')) {
                return;
            }

            event.preventDefault();
            closeFlyout(flyout, { returnFocus: true });
        });

        flyout.addEventListener('focusout', () => {
            setTimeout(() => {
                if (!flyout.contains(document.activeElement)) {
                    closeFlyout(flyout);
                }
            }, 0);
        });
    });

    document.addEventListener('click', event => {
        if (event.target.closest('[data-flyout-root]')) {
            return;
        }

        closeAllFlyouts();
    });
});

/* ============================================================
   Flyout Tabs Logic
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-flyout-tabs]').forEach(flyout => {
        const tabs = Array.from(flyout.querySelectorAll('[data-flyout-category]'));
        const panels = Array.from(flyout.querySelectorAll('[data-flyout-panel]'));
        if (tabs.length === 0 || panels.length === 0) return;

        const activateCategory = category => {
            tabs.forEach(tab => {
                const isActive = tab.dataset.flyoutCategory === category;
                tab.classList.toggle('is-active', isActive);
                tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
                tab.setAttribute('tabindex', isActive ? '0' : '-1');
            });

            panels.forEach(panel => {
                panel.hidden = panel.dataset.flyoutPanel !== category;
            });
        };

        tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => {
                activateCategory(tab.dataset.flyoutCategory);
            });

            tab.addEventListener('keydown', event => {
                let nextIndex = index;

                if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
                    nextIndex = (index + 1) % tabs.length;
                } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
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

        const initialCategory =
            tabs.find(tab => tab.classList.contains('is-active'))?.dataset.flyoutCategory ||
            tabs[0].dataset.flyoutCategory;

        activateCategory(initialCategory);
    });
});/* ============================================================
   Tabs Component Logic
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.tab-bar[data-tabs]').forEach(tabBar => {
        if (tabBar.dataset.tabsBound === 'true') {
            return;
        }

        tabBar.dataset.tabsBound = 'true';
        let tabCounter = tabBar.querySelectorAll('.tab-item').length;
        let isMouseDown = false;
        let pointerStartX = 0;
        let startScrollLeft = 0;
        let isDraggingTabs = false;
        let suppressTabClick = false;

        const dragThreshold = 6;
        const getTabs = () => Array.from(tabBar.querySelectorAll('.tab-item'));
        const canDragTabs = () => tabBar.scrollWidth > tabBar.clientWidth;

        const finishTabDrag = () => {
            tabBar.removeAttribute('data-dragging-tabs');
            isMouseDown = false;
            pointerStartX = 0;
            startScrollLeft = 0;
            isDraggingTabs = false;
        };

        const centerTabInView = (tab, behavior = 'smooth') => {
            if (!tab) {
                return;
            }

            const motionBehavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
                ? 'auto'
                : behavior;

            if (typeof tab.scrollIntoView === 'function') {
                tab.scrollIntoView({
                    behavior: motionBehavior,
                    block: 'nearest',
                    inline: 'center'
                });
                return;
            }

            const maxScrollLeft = tabBar.scrollWidth - tabBar.clientWidth;
            if (maxScrollLeft <= 0) {
                return;
            }

            const nextScrollLeft = Math.min(
                Math.max(tab.offsetLeft - ((tabBar.clientWidth - tab.offsetWidth) / 2), 0),
                maxScrollLeft
            );

            tabBar.scrollTo({
                left: nextScrollLeft,
                behavior: motionBehavior
            });
        };

        const syncTabs = preferredActiveTab => {
            const tabs = getTabs();
            if (tabs.length === 0) {
                return null;
            }

            const activeTab = preferredActiveTab && tabs.includes(preferredActiveTab)
                ? preferredActiveTab
                : tabs.find(tab => tab.classList.contains('is-active')) || tabs[0];

            tabs.forEach(tab => {
                const isActive = tab === activeTab;
                tab.classList.toggle('is-active', isActive);
                tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
                tab.setAttribute('tabindex', isActive ? '0' : '-1');
            });

            return activeTab;
        };

        const activateTab = (tab, options = {}) => {
            const activeTab = syncTabs(tab);

            if (options.focus && activeTab) {
                try {
                    activeTab.focus({ preventScroll: true });
                } catch (error) {
                    activeTab.focus();
                }
            }

            window.requestAnimationFrame(() => {
                centerTabInView(activeTab, options.behavior || 'smooth');
            });
        };

        tabBar.addEventListener('mousedown', event => {
            if (event.button !== 0 || !canDragTabs()) {
                return;
            }

            if (event.target.closest('.tab-close, .tab-add')) {
                return;
            }

            isMouseDown = true;
            pointerStartX = event.clientX;
            startScrollLeft = tabBar.scrollLeft;
            isDraggingTabs = false;
        });

        window.addEventListener('mousemove', event => {
            if (!isMouseDown) {
                return;
            }

            const deltaX = event.clientX - pointerStartX;
            if (!isDraggingTabs && Math.abs(deltaX) < dragThreshold) {
                return;
            }

            if (!isDraggingTabs) {
                isDraggingTabs = true;
                tabBar.dataset.draggingTabs = 'true';
            }

            event.preventDefault();
            tabBar.scrollLeft = startScrollLeft - deltaX;
        });

        window.addEventListener('mouseup', () => {
            if (!isMouseDown) {
                return;
            }

            if (isDraggingTabs) {
                suppressTabClick = true;
                window.setTimeout(() => {
                    suppressTabClick = false;
                }, 0);
            }

            finishTabDrag();
        });

        window.addEventListener('blur', () => {
            finishTabDrag();
        });

        tabBar.addEventListener('click', event => {
            if (!suppressTabClick) {
                return;
            }

            suppressTabClick = false;
            event.preventDefault();
            event.stopImmediatePropagation();
        }, true);

        tabBar.addEventListener('click', event => {
            if (event.target.closest('.tab-close')) {
                return;
            }

            const item = event.target.closest('.tab-item');
            if (!item || !tabBar.contains(item)) {
                return;
            }

            activateTab(item);
        });

        tabBar.addEventListener('keydown', event => {
            if (event.target.closest('.tab-close')) {
                return;
            }

            const currentTab = event.target.closest('.tab-item');
            if (!currentTab || !tabBar.contains(currentTab)) {
                return;
            }

            const tabs = getTabs();
            const currentIndex = tabs.indexOf(currentTab);
            let nextIndex = currentIndex;

            if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                nextIndex = (currentIndex + 1) % tabs.length;
            } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
            } else if (event.key === 'Home') {
                nextIndex = 0;
            } else if (event.key === 'End') {
                nextIndex = tabs.length - 1;
            } else if (event.key === ' ' || event.key === 'Enter') {
                event.preventDefault();
                activateTab(currentTab);
                return;
            } else {
                return;
            }

            event.preventDefault();
            activateTab(tabs[nextIndex], { focus: true });
        });

        tabBar.addEventListener('click', event => {
            const closeButton = event.target.closest('.tab-close');
            if (!closeButton) {
                return;
            }

            const item = closeButton.closest('.tab-item');
            if (!item) {
                return;
            }

            const tabs = getTabs();
            const index = tabs.indexOf(item);
            const wasActive = item.classList.contains('is-active');

            item.remove();

            if (wasActive) {
                const remainingTabs = getTabs();
                if (remainingTabs.length > 0) {
                    activateTab(remainingTabs[Math.min(index, remainingTabs.length - 1)], { focus: true });
                }
            } else {
                const initialActiveTab = syncTabs();
                centerTabInView(initialActiveTab, 'auto');
            }
        });

        const addWrapper = tabBar.querySelector('.tab-add');
        const addButton = addWrapper ? addWrapper.querySelector('button') : null;
        if (addButton) {
            addButton.addEventListener('click', () => {
                tabCounter += 1;
                const label = `Form ${tabCounter}`;
                const tab = document.createElement('div');
                tab.className = 'tab-item';
                tab.setAttribute('role', 'tab');
                tab.setAttribute('aria-selected', 'false');
                tab.setAttribute('tabindex', '-1');
                tab.innerHTML = `
                    <span class="tab-label">${label}</span>
                    <button type="button" class="tab-close" aria-label="Close ${label}">
                        <i class="ri-close-line" aria-hidden="true"></i>
                    </button>
                `;
                tabBar.insertBefore(tab, addWrapper);
                window.requestAnimationFrame(() => {
                    activateTab(tab, { focus: true, behavior: 'smooth' });
                });
            });
        }

        const initialActiveTab = syncTabs();
        centerTabInView(initialActiveTab, 'auto');
    });
});
/**
 * Range Slider Component Logic
 */
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-range-slider]').forEach(slider => {
        if (slider.dataset.rangeSliderBound === 'true') {
            return;
        }

        slider.dataset.rangeSliderBound = 'true';

        const startInput = slider.querySelector('[data-range-slider-start]');
        const endInput = slider.querySelector('[data-range-slider-end]');
        const startOutput = slider.querySelector('[data-range-slider-start-output]');
        const endOutput = slider.querySelector('[data-range-slider-end-output]');
        const unit = (slider.dataset.rangeSliderUnit || '').trim();

        if (!startInput || !endInput) {
            return;
        }

        const syncRange = changedInput => {
            const min = Math.min(Number(startInput.min || 0), Number(endInput.min || 0));
            const max = Math.max(Number(startInput.max || 100), Number(endInput.max || 100));
            let nextStart = clampRangeValue(Number(startInput.value), min, max);
            let nextEnd = clampRangeValue(Number(endInput.value), min, max);

            if (changedInput === startInput && nextStart > nextEnd) {
                nextEnd = nextStart;
            }

            if (changedInput === endInput && nextEnd < nextStart) {
                nextStart = nextEnd;
            }

            startInput.value = String(nextStart);
            endInput.value = String(nextEnd);

            if (startOutput) {
                startOutput.textContent = String(nextStart);
            }

            if (endOutput) {
                endOutput.textContent = String(nextEnd);
            }

            const startPercent = toRangePercent(nextStart, min, max);
            const endPercent = toRangePercent(nextEnd, min, max);
            const startRatio = startPercent / 100;
            const endRatio = endPercent / 100;
            const formatValueText = value => unit ? `${value} ${unit}` : String(value);

            slider.style.setProperty('--range-slider-start-ratio', String(startRatio));
            slider.style.setProperty('--range-slider-end-ratio', String(endRatio));
            startInput.setAttribute('aria-valuetext', formatValueText(nextStart));
            endInput.setAttribute('aria-valuetext', formatValueText(nextEnd));
        };

        startInput.addEventListener('input', () => {
            syncRange(startInput);
        });

        endInput.addEventListener('input', () => {
            syncRange(endInput);
        });

        startInput.addEventListener('change', () => {
            syncRange(startInput);
        });

        endInput.addEventListener('change', () => {
            syncRange(endInput);
        });

        syncRange(startInput);
    });

    function clampRangeValue(value, min, max) {
        if (Number.isNaN(value)) {
            return min;
        }

        return Math.min(Math.max(value, min), max);
    }

    function toRangePercent(value, min, max) {
        if (max === min) {
            return 0;
        }

        return Number((((value - min) / (max - min)) * 100).toFixed(4));
    }
});
/**
 * Progress Bar Demo Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const progressSection = document.querySelector('#progress-bar');

    if (!progressSection) {
        return;
    }

    const progressMeters = Array.from(progressSection.querySelectorAll('[data-progress-meter]'));

    if (progressMeters.length === 0) {
        return;
    }

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const animationFrames = new Map();

    const formatPercent = value => `${Math.round(value)}%`;

    const syncProgressMeter = meter => {
        const progress = meter.querySelector('[data-progress-demo]');
        const output = meter.querySelector('[data-progress-output]');

        if (!progress) {
            return;
        }

        const roundedValue = Math.round(Number(progress.value || 0));
        progress.textContent = formatPercent(roundedValue);
        progress.setAttribute('aria-valuetext', formatPercent(roundedValue));

        if (output) {
            output.textContent = formatPercent(roundedValue);
        }
    };

    const stopProgressAnimation = meter => {
        const frameId = animationFrames.get(meter);

        if (typeof frameId === 'number') {
            cancelAnimationFrame(frameId);
            animationFrames.delete(meter);
        }
    };

    const startProgressAnimation = meter => {
        const progress = meter.querySelector('[data-progress-demo]');

        if (!progress) {
            return;
        }

        stopProgressAnimation(meter);
        syncProgressMeter(meter);

        if (reducedMotionQuery.matches) {
            return;
        }

        const min = Number(progress.dataset.progressMin || 0);
        const max = Number(progress.dataset.progressMax || progress.max || 100);
        const duration = Math.max(Number(progress.dataset.progressDuration || 3200), 1200);
        const travel = Math.max(max - min, 1);
        let current = Number(progress.value || min);
        let direction = 1;
        let lastTime = 0;

        const animate = time => {
            if (!lastTime) {
                lastTime = time;
            }

            const delta = time - lastTime;
            lastTime = time;
            current += ((travel / duration) * delta) * direction;

            if (current >= max) {
                current = max;
                direction = -1;
            } else if (current <= min) {
                current = min;
                direction = 1;
            }

            progress.value = String(current);
            syncProgressMeter(meter);
            animationFrames.set(meter, requestAnimationFrame(animate));
        };

        animationFrames.set(meter, requestAnimationFrame(animate));
    };

    const handleMotionChange = () => {
        progressMeters.forEach(meter => {
            startProgressAnimation(meter);
        });
    };

    progressMeters.forEach(meter => {
        startProgressAnimation(meter);
    });

    if (typeof reducedMotionQuery.addEventListener === 'function') {
        reducedMotionQuery.addEventListener('change', handleMotionChange);
    } else if (typeof reducedMotionQuery.addListener === 'function') {
        reducedMotionQuery.addListener(handleMotionChange);
    }
});

/**
 * Combobox Component Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const comboboxes = Array.from(document.querySelectorAll('[data-combobox]'));

    if (comboboxes.length === 0) {
        return;
    }

    let openCombobox = null;

    comboboxes.forEach((combobox, index) => {
        if (combobox.dataset.comboboxBound === 'true') {
            return;
        }

        combobox.dataset.comboboxBound = 'true';

        const input = combobox.querySelector('[data-combobox-input]');
        const panel = combobox.querySelector('[data-combobox-panel]');
        const list = panel?.querySelector('.combobox-list');
        const valueField = combobox.querySelector('[data-combobox-value]');
        const clearButton = combobox.querySelector('[data-combobox-clear]');
        const emptyState = combobox.querySelector('.combobox-empty');
        const options = Array.from(combobox.querySelectorAll('[data-combobox-option]'));

        if (!input || !panel || !list || !clearButton || options.length === 0) {
            return;
        }

        const listId = list.id || `comboboxList${index + 1}`;
        let selectedOption = options.find(option => option.getAttribute('aria-selected') === 'true') || null;
        let activeOption = selectedOption;

        const isDisabled = () => input.disabled || input.getAttribute('aria-disabled') === 'true' || combobox.getAttribute('aria-disabled') === 'true';

        list.id = listId;
        list.setAttribute('role', 'listbox');
        panel.setAttribute('aria-hidden', 'true');
        input.setAttribute('role', 'combobox');
        input.setAttribute('aria-controls', listId);
        input.setAttribute('aria-expanded', 'false');
        input.setAttribute('aria-autocomplete', 'list');
        input.setAttribute('autocomplete', 'off');
        clearButton.setAttribute('type', 'button');

        options.forEach((option, optionIndex) => {
            normalizeComboboxOption(option);
            option.id = option.id || `${listId}-option-${optionIndex + 1}`;
            option.setAttribute('type', 'button');
            option.addEventListener('click', () => {
                if (isDisabled() || option.getAttribute('aria-disabled') === 'true') {
                    return;
                }

                selectOption(option);
                closeComboboxPanel(combobox, false);
                input.focus();
            });
        });

        combobox._closeCombobox = restoreSelection => {
            closeComboboxPanel(combobox, restoreSelection);
        };

        syncSelectedOption(true);
        updateFilter('');

        if (isDisabled()) {
            combobox.setAttribute('aria-disabled', 'true');
            input.setAttribute('aria-disabled', 'true');
            closeComboboxPanel(combobox, true);
            return;
        }

        if (combobox.classList.contains('is-open')) {
            openComboboxPanel(combobox, false);
        }

        input.addEventListener('focus', () => {
            if (isDisabled()) {
                return;
            }

            openComboboxPanel(combobox, false);
        });

        input.addEventListener('click', () => {
            if (isDisabled()) {
                return;
            }

            openComboboxPanel(combobox, false);
        });

        input.addEventListener('input', () => {
            if (isDisabled()) {
                return;
            }

            selectedOption = null;
            syncSelectedOption(false);
            openComboboxPanel(combobox, false);
            updateFilter(input.value.trim());
        });

        input.addEventListener('keydown', event => {
            if (isDisabled()) {
                return;
            }

            const visibleOptions = getVisibleOptions();

            if (event.key === 'ArrowDown') {
                event.preventDefault();
                openComboboxPanel(combobox, false);
                if (visibleOptions.length === 0) {
                    return;
                }
                const currentIndex = visibleOptions.indexOf(activeOption);
                const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % visibleOptions.length;
                setActiveOption(visibleOptions[nextIndex]);
            }

            if (event.key === 'ArrowUp') {
                event.preventDefault();
                openComboboxPanel(combobox, false);
                if (visibleOptions.length === 0) {
                    return;
                }
                const currentIndex = visibleOptions.indexOf(activeOption);
                const nextIndex = currentIndex === -1 ? visibleOptions.length - 1 : (currentIndex - 1 + visibleOptions.length) % visibleOptions.length;
                setActiveOption(visibleOptions[nextIndex]);
            }

            if (event.key === 'Home') {
                if (!combobox.classList.contains('is-open')) {
                    return;
                }
                event.preventDefault();
                setActiveOption(visibleOptions[0] || null);
            }

            if (event.key === 'End') {
                if (!combobox.classList.contains('is-open')) {
                    return;
                }
                event.preventDefault();
                setActiveOption(visibleOptions[visibleOptions.length - 1] || null);
            }

            if (event.key === 'Enter') {
                if (!combobox.classList.contains('is-open') || !activeOption) {
                    return;
                }
                event.preventDefault();
                selectOption(activeOption);
                closeComboboxPanel(combobox, false);
            }

            if (event.key === 'Escape') {
                event.preventDefault();
                closeComboboxPanel(combobox, true);
            }

            if (event.key === 'Tab') {
                closeComboboxPanel(combobox, true);
            }
        });

        clearButton.addEventListener('click', event => {
            if (isDisabled()) {
                return;
            }

            event.preventDefault();
            clearSelection(true);
            openComboboxPanel(combobox, false);
            input.focus();
        });

        function openComboboxPanel(currentCombobox, focusFirstOption) {
            if (isDisabled()) {
                return;
            }

            if (openCombobox && openCombobox !== currentCombobox) {
                openCombobox._closeCombobox?.(true);
            }

            currentCombobox.classList.add('is-open');
            panel.hidden = false;
            panel.setAttribute('aria-hidden', 'false');
            input.setAttribute('aria-expanded', 'true');
            openCombobox = currentCombobox;
            updateFilter(input.value.trim());

            if (focusFirstOption) {
                setActiveOption(getVisibleOptions()[0] || null);
            }
        }

        function closeComboboxPanel(currentCombobox, restoreSelection) {
            currentCombobox.classList.remove('is-open');
            panel.hidden = true;
            panel.setAttribute('aria-hidden', 'true');
            input.setAttribute('aria-expanded', 'false');
            setActiveOption(null);
            updateFilter('');

            if (restoreSelection) {
                input.value = selectedOption ? getOptionLabel(selectedOption) : '';
            }

            updateClearState();

            if (openCombobox === currentCombobox) {
                openCombobox = null;
            }
        }

        function selectOption(option) {
            selectedOption = option;
            input.value = getOptionLabel(option);
            syncSelectedOption(false);
        }

        function clearSelection(clearInput) {
            selectedOption = null;
            activeOption = null;
            options.forEach(option => {
                option.setAttribute('aria-selected', 'false');
            });
            if (valueField) {
                valueField.value = '';
            }
            combobox.classList.remove('has-value');
            if (clearInput) {
                input.value = '';
            }
            updateClearState();
            updateFilter(input.value.trim());
        }

        function syncSelectedOption(restoreInput) {
            options.forEach(option => {
                option.setAttribute('aria-selected', option === selectedOption ? 'true' : 'false');
            });

            if (valueField) {
                valueField.value = selectedOption ? (selectedOption.dataset.value || getOptionLabel(selectedOption)) : '';
            }

            combobox.classList.toggle('has-value', Boolean(selectedOption));

            if (restoreInput) {
                input.value = selectedOption ? getOptionLabel(selectedOption) : '';
            }

            updateClearState();
        }

        function updateFilter(query) {
            const normalizedQuery = query.trim().toLowerCase();

            options.forEach(option => {
                const matches = normalizedQuery === '' || getOptionLabel(option).toLowerCase().includes(normalizedQuery);
                option.hidden = !matches;
            });

            const visibleOptions = getVisibleOptions();
            if (emptyState) {
                emptyState.hidden = visibleOptions.length !== 0;
            }

            const nextActiveOption = visibleOptions.includes(activeOption)
                ? activeOption
                : (visibleOptions.includes(selectedOption) ? selectedOption : null);

            setActiveOption(nextActiveOption);
        }

        function updateClearState() {
            const hasTypedQuery = input.value.trim() !== '' && (!selectedOption || input.value.trim() !== getOptionLabel(selectedOption));
            const shouldShowClear = !isDisabled() && hasTypedQuery;

            clearButton.disabled = !shouldShowClear;
            clearButton.hidden = !shouldShowClear;
            clearButton.setAttribute('aria-hidden', shouldShowClear ? 'false' : 'true');
        }

        function setActiveOption(option) {
            activeOption = option;

            options.forEach(currentOption => {
                currentOption.classList.toggle('is-active', currentOption === option && !currentOption.hidden);
            });

            if (option && !option.hidden) {
                input.setAttribute('aria-activedescendant', option.id);
                option.scrollIntoView({ block: 'nearest' });
                return;
            }

            input.removeAttribute('aria-activedescendant');
        }

        function getVisibleOptions() {
            return options.filter(option => !option.hidden && option.getAttribute('aria-disabled') !== 'true');
        }

        function normalizeComboboxOption(option) {
            const labelText = getOptionLabel(option);
            let label = option.querySelector('.combobox-option-label');

            if (!label) {
                option.textContent = '';
                label = document.createElement('span');
                label.className = 'combobox-option-label';
                label.textContent = labelText;
                option.append(label);
            }

            if (!option.querySelector('.combobox-option-check')) {
                const check = document.createElement('i');
                check.className = 'ri-check-line combobox-option-check';
                check.setAttribute('aria-hidden', 'true');
                option.append(check);
            }
        }

        function getOptionLabel(option) {
            const label = option.querySelector('.combobox-option-label');
            const text = label ? label.textContent : option.textContent;
            return text.replace(/\s+/g, ' ').trim();
        }
    });

    document.addEventListener('click', event => {
        if (!openCombobox || openCombobox.contains(event.target)) {
            return;
        }

        openCombobox._closeCombobox?.(true);
    });

    document.addEventListener('keydown', event => {
        if (event.key !== 'Escape' || !openCombobox) {
            return;
        }

        openCombobox._closeCombobox?.(true);
        openCombobox.querySelector('[data-combobox-input]')?.focus();
    });
});/**
 * Pagination Component Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-pagination]').forEach(pagination => {
        if (pagination.dataset.paginationBound === 'true') {
            return;
        }

        pagination.dataset.paginationBound = 'true';

        const pageButtons = Array.from(pagination.querySelectorAll('[data-page]'));
        const pageList = pagination.querySelector('.pagination-list');
        const prevBtn = pagination.querySelector('[data-pagination-prev]');
        const nextBtn = pagination.querySelector('[data-pagination-next]');
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (pageButtons.length === 0) {
            return;
        }

        const getActiveIndex = () => {
            const activeIndex = pageButtons.findIndex(button => button.getAttribute('aria-current') === 'page');
            return activeIndex === -1 ? 0 : activeIndex;
        };

        const revealActivePage = (activeButton, behavior = 'smooth') => {
            if (!pageList || !activeButton) {
                return;
            }

            const motionBehavior = reduceMotion ? 'auto' : behavior;
            const maxScrollLeft = pageList.scrollWidth - pageList.clientWidth;

            if (maxScrollLeft <= 0) {
                return;
            }

            const nextScrollLeft = activeButton.offsetLeft - ((pageList.clientWidth - activeButton.offsetWidth) / 2);

            pageList.scrollTo({
                left: Math.min(Math.max(0, nextScrollLeft), maxScrollLeft),
                behavior: motionBehavior
            });
        };

        const syncState = (nextIndex, options = {}) => {
            const safeIndex = Math.min(Math.max(nextIndex, 0), pageButtons.length - 1);

            pageButtons.forEach((button, index) => {
                if (index === safeIndex) {
                    button.setAttribute('aria-current', 'page');
                } else {
                    button.removeAttribute('aria-current');
                }
            });

            if (prevBtn) {
                prevBtn.disabled = safeIndex === 0;
                prevBtn.setAttribute('aria-disabled', safeIndex === 0 ? 'true' : 'false');
            }

            if (nextBtn) {
                nextBtn.disabled = safeIndex === pageButtons.length - 1;
                nextBtn.setAttribute('aria-disabled', safeIndex === pageButtons.length - 1 ? 'true' : 'false');
            }

            window.requestAnimationFrame(() => {
                revealActivePage(pageButtons[safeIndex], options.behavior || 'smooth');
            });
        };

        pageButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                syncState(index);
            });
        });

        prevBtn?.addEventListener('click', () => {
            syncState(getActiveIndex() - 1);
        });

        nextBtn?.addEventListener('click', () => {
            syncState(getActiveIndex() + 1);
        });

        syncState(getActiveIndex(), { behavior: 'auto' });
    });
});

/**
 * Data Table Component Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-table]').forEach(tableWrapper => {
        if (tableWrapper.dataset.tableBound === 'true') {
            return;
        }

        tableWrapper.dataset.tableBound = 'true';

        const table = tableWrapper.querySelector('.data-table-table');
        const tableBody = table?.tBodies?.[0];
        const sortButtons = Array.from(tableWrapper.querySelectorAll('[data-table-sort]'));

        if (!table || !tableBody || sortButtons.length === 0) {
            return;
        }

        sortButtons.forEach(button => {
            const heading = button.closest('.data-table-heading');
            const label = ((heading?.querySelector('.data-table-heading-label')?.textContent || button.getAttribute('aria-label') || button.textContent || '')
                .replace(/^Sort by\s+/i, '')
                .replace(/\s+/g, ' ')
                .trim());

            button.setAttribute('type', 'button');

            if (label && !button.hasAttribute('aria-label')) {
                button.setAttribute('aria-label', 'Sort by ' + label);
            }

            if (heading && !heading.hasAttribute('aria-sort')) {
                heading.setAttribute('aria-sort', 'none');
            }

            button.removeAttribute('aria-pressed');

            button.addEventListener('click', () => {
                const currentHeading = button.closest('.data-table-heading');
                if (!currentHeading) {
                    return;
                }

                const currentDirection = currentHeading.getAttribute('aria-sort') === 'ascending' ? 'ascending' : 'descending';
                const nextDirection = currentDirection === 'ascending' ? 'descending' : 'ascending';
                sortRows(currentHeading, nextDirection);
            });
        });

        const activeHeading = sortButtons
            .map(button => button.closest('.data-table-heading'))
            .find(heading => heading && heading.getAttribute('aria-sort') && heading.getAttribute('aria-sort') !== 'none');

        const floatingHead = tableWrapper.querySelector('.data-table-head-floating');

        const syncFloatingHeadColumns = () => {
            if (!floatingHead) {
                return;
            }

            const firstRow = tableBody.rows[0];
            if (!firstRow) {
                return;
            }

            const widths = Array.from(firstRow.cells)
                .map(cell => Math.ceil(cell.getBoundingClientRect().width))
                .filter(width => width > 0);

            if (widths.length) {
                tableWrapper.style.setProperty('--data-table-head-columns', widths.map(width => width + 'px').join(' '));
            }
        };

        if (activeHeading) {
            sortRows(activeHeading, activeHeading.getAttribute('aria-sort'));
        }

        syncFloatingHeadColumns();
        window.addEventListener('resize', syncFloatingHeadColumns);

        function sortRows(activeHeading, direction) {
            const columnIndex = Number(activeHeading.dataset.tableColumn ?? activeHeading.cellIndex);
            const rows = Array.from(tableBody.rows);

            rows.sort((firstRow, secondRow) => {
                const firstValue = getCellValue(firstRow, columnIndex);
                const secondValue = getCellValue(secondRow, columnIndex);
                return compareCellValues(firstValue, secondValue, direction);
            });

            rows.forEach(row => {
                tableBody.appendChild(row);
            });

            sortButtons.forEach(button => {
                const heading = button.closest('.data-table-heading');
                if (!heading) {
                    return;
                }

                const isActive = heading === activeHeading;
                heading.setAttribute('aria-sort', isActive ? direction : 'none');
                button.removeAttribute('aria-pressed');
            });

            requestAnimationFrame(syncFloatingHeadColumns);
        }

        function getCellValue(row, columnIndex) {
            const cell = row.cells[columnIndex];
            if (!cell) {
                return '';
            }

            return (cell.dataset.sortValue || cell.textContent || '').replace(/\s+/g, ' ').trim();
        }

        function compareCellValues(firstValue, secondValue, direction) {
            const firstNumeric = Number(firstValue.replace(/[^0-9.-]/g, ''));
            const secondNumeric = Number(secondValue.replace(/[^0-9.-]/g, ''));
            const bothNumeric = !Number.isNaN(firstNumeric)
                && !Number.isNaN(secondNumeric)
                && /[0-9]/.test(firstValue)
                && /[0-9]/.test(secondValue);

            if (bothNumeric) {
                return direction === 'ascending' ? firstNumeric - secondNumeric : secondNumeric - firstNumeric;
            }

            return direction === 'ascending'
                ? firstValue.localeCompare(secondValue, undefined, { numeric: true, sensitivity: 'base' })
                : secondValue.localeCompare(firstValue, undefined, { numeric: true, sensitivity: 'base' });
        }
    });
});
/**
 * Date Picker Component Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const datePickers = Array.from(document.querySelectorAll('[data-date-picker]'));

    if (datePickers.length === 0) {
        return;
    }

    const locale = document.documentElement.lang || navigator.language || 'en-US';
    const monthFormatter = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' });
    const dateInputPlaceholder = '00/00/0000';
    const rangeInputPlaceholder = '00/00/0000 - 00/00/0000';
    const summaryFormatter = new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
    const ariaFormatter = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const weekdayLabels = createWeekdayLabels(locale);
    const monthNames = createMonthNames(locale, 'long');
    const monthOptionLabels = createMonthNames(locale, 'short');
    const presetLabels = {
        week: 'This Week',
        'next-7-days': 'Next 7 Days',
        month: 'This Month',
    };
    let openPicker = null;

    datePickers.forEach((picker, index) => {
        const input = picker.querySelector('[data-date-picker-input]');
        const singleValueField = picker.querySelector('[data-date-picker-value]');
        const rangeStartField = picker.querySelector('[data-date-picker-range-start-value]');
        const rangeEndField = picker.querySelector('[data-date-picker-range-end-value]');
        const trigger = picker.querySelector('[data-date-picker-trigger]');
        const panel = picker.querySelector('[data-date-picker-panel]');
        const monthLabel = picker.querySelector('[data-date-picker-month]');
        const weekdayRow = picker.querySelector('[data-date-picker-weekdays]');
        const daysGrid = picker.querySelector('[data-date-picker-days]');
        const summary = picker.querySelector('[data-date-picker-summary]');
        const prevButton = picker.querySelector('[data-date-picker-prev]');
        const nextButton = picker.querySelector('[data-date-picker-next]');
        const todayButton = picker.querySelector('[data-date-picker-today]');
        const clearButton = picker.querySelector('[data-date-picker-clear]');
        const presetButtons = Array.from(picker.querySelectorAll('[data-date-picker-preset]'));
        const isDisabled = input?.disabled || trigger?.disabled || picker.getAttribute('aria-disabled') === 'true';

        if (!input || !trigger || !panel || !monthLabel || !weekdayRow || !daysGrid || !summary || !prevButton || !nextButton) {
            return;
        }

        const mode = picker.dataset.datePickerMode === 'range' ? 'range' : 'single';
        const defaultDate = parseISODate(picker.dataset.datePickerDefault);
        const defaultRangeStart = parseISODate(picker.dataset.datePickerRangeStart);
        const defaultRangeEnd = parseISODate(picker.dataset.datePickerRangeEnd);
        const anchorDate = mode === 'range' ? (defaultRangeStart || defaultDate) : defaultDate;
        const viewDate = anchorDate || stripTime(new Date());
        const panelIdBase = input.id || 'datePicker' + String(index + 1);
        const headingControls = createDatePickerHeadingControls(panelIdBase);
        monthLabel.classList.add('sr-only');
        monthLabel.insertAdjacentElement('afterend', headingControls);
        const monthTriggerLabel = headingControls.querySelector('[data-date-picker-month-trigger]');
        const yearTriggerLabel = headingControls.querySelector('[data-date-picker-year-trigger]');
        const metaPanel = createDatePickerMetaPanel(panelIdBase);
        panel.insertBefore(metaPanel, weekdayRow);
        const monthGrid = metaPanel.querySelector('[data-date-picker-month-grid]');
        const yearGrid = metaPanel.querySelector('[data-date-picker-year-grid]');

        panel.id = panel.id || `${panelIdBase}-panel`;
        panel.setAttribute('aria-hidden', 'true');
        trigger.setAttribute('type', 'button');
        prevButton.setAttribute('type', 'button');
        nextButton.setAttribute('type', 'button');
        todayButton?.setAttribute('type', 'button');
        clearButton?.setAttribute('type', 'button');
        presetButtons.forEach(button => button.setAttribute('type', 'button'));

        picker._datePickerState = {
            mode,
            selectedDate: defaultDate,
            rangeStart: defaultRangeStart,
            rangeEnd: defaultRangeEnd,
            activePreset: mode === 'range' ? (picker.dataset.datePickerPreset || '') : '',
            panelView: 'days',
            metaMonthPage: Math.floor(viewDate.getMonth() / 6),
            metaYearStart: viewDate.getFullYear() - 5,
            viewYear: viewDate.getFullYear(),
            viewMonth: viewDate.getMonth(),
        };

        trigger.setAttribute('aria-controls', panel.id);
        trigger.setAttribute('aria-expanded', 'false');
        input.setAttribute('aria-controls', panel.id);
        input.setAttribute('aria-expanded', 'false');
        input.setAttribute('autocomplete', 'off');
        input.setAttribute('spellcheck', 'false');
        input.setAttribute('inputmode', 'numeric');
        input.setAttribute('maxlength', mode === 'range' ? '23' : '10');
        input.setAttribute('placeholder', mode === 'range' ? rangeInputPlaceholder : dateInputPlaceholder);
        monthTriggerLabel.setAttribute('aria-controls', metaPanel.id);
        monthTriggerLabel.setAttribute('aria-haspopup', 'grid');
        monthTriggerLabel.setAttribute('aria-expanded', 'false');
        monthTriggerLabel.setAttribute('aria-label', 'Choose month');
        yearTriggerLabel.setAttribute('aria-controls', metaPanel.id);
        yearTriggerLabel.setAttribute('aria-haspopup', 'grid');
        yearTriggerLabel.setAttribute('aria-expanded', 'false');
        yearTriggerLabel.setAttribute('aria-label', 'Choose year');

        renderWeekdays(weekdayRow);
        renderDatePicker(picker);

        if (picker.dataset.datePickerOpen === 'true') {
            openDatePicker(picker, false);
        }

        trigger.addEventListener('click', () => {
            if (picker.classList.contains('is-open')) {
                closeDatePicker(picker, true);
                return;
            }

            openDatePicker(picker, true);
        });

        monthTriggerLabel.addEventListener('click', () => {
            openMetaPicker(picker, 'month');
        });

        yearTriggerLabel.addEventListener('click', () => {
            openMetaPicker(picker, 'year');
        });

        monthTriggerLabel.addEventListener('keydown', event => {
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                openMetaPicker(picker, 'month');
            }
        });

        yearTriggerLabel.addEventListener('keydown', event => {
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                openMetaPicker(picker, 'year');
            }
        });

        input.addEventListener('input', () => {
            input.value = mode === 'range'
                ? normalizeTypedRangeInput(input.value)
                : normalizeTypedDateInput(input.value);
        });

        input.addEventListener('blur', () => {
            commitTypedInput(picker);
        });

        input.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                event.preventDefault();
                commitTypedInput(picker);
                return;
            }

            if (event.key === 'ArrowDown') {
                event.preventDefault();
                openDatePicker(picker, true);
                return;
            }

            if (event.key === 'Escape') {
                closeDatePicker(picker, false);
            }
        });

        prevButton.addEventListener('click', () => {
            shiftViewMonth(picker, -1);
        });

        nextButton.addEventListener('click', () => {
            shiftViewMonth(picker, 1);
        });

        todayButton?.addEventListener('click', () => {
            selectDate(picker, stripTime(new Date()), true);
        });

        clearButton?.addEventListener('click', () => {
            clearSelection(picker);
        });

        presetButtons.forEach(button => {
            button.addEventListener('click', () => {
                const preset = button.dataset.datePickerPreset;
                if (!preset) {
                    return;
                }

                applyPreset(picker, preset);
            });
        });

        metaPanel.addEventListener('click', event => {
            const monthOption = event.target.closest('[data-date-picker-month-option]');
            if (monthOption) {
                picker._datePickerState.viewMonth = Number(monthOption.dataset.datePickerMonthOption);
                picker._datePickerState.metaMonthPage = Math.floor(picker._datePickerState.viewMonth / 6);
                closeMetaPicker(picker);
                renderDatePicker(picker);
                requestAnimationFrame(() => {
                    focusPreferredDay(picker);
                });
                return;
            }

            const yearOption = event.target.closest('[data-date-picker-year-option]');
            if (yearOption) {
                picker._datePickerState.viewYear = Number(yearOption.dataset.datePickerYearOption);
                picker._datePickerState.metaYearStart = picker._datePickerState.viewYear - 5;
                closeMetaPicker(picker);
                renderDatePicker(picker);
                requestAnimationFrame(() => {
                    focusPreferredDay(picker);
                });
            }
        });

        daysGrid.addEventListener('click', event => {
            const dayButton = event.target.closest('[data-date-picker-day]');
            if (!dayButton) {
                return;
            }

            const selectedDate = parseISODate(dayButton.dataset.datePickerDay);
            if (!selectedDate) {
                return;
            }

            selectDate(picker, selectedDate, true);
        });

        daysGrid.addEventListener('keydown', event => {
            const currentButton = event.target.closest('[data-date-picker-day]');
            if (!currentButton) {
                return;
            }

            const buttons = Array.from(daysGrid.querySelectorAll('[data-date-picker-day]'));
            const currentIndex = buttons.indexOf(currentButton);
            let nextIndex = currentIndex;

            switch (event.key) {
                case 'ArrowRight':
                    nextIndex = currentIndex + 1;
                    break;
                case 'ArrowLeft':
                    nextIndex = currentIndex - 1;
                    break;
                case 'ArrowDown':
                    nextIndex = currentIndex + 7;
                    break;
                case 'ArrowUp':
                    nextIndex = currentIndex - 7;
                    break;
                case 'Home':
                    nextIndex = currentIndex - (currentIndex % 7);
                    break;
                case 'End':
                    nextIndex = currentIndex + (6 - (currentIndex % 7));
                    break;
                default:
                    return;
            }

            if (nextIndex < 0 || nextIndex >= buttons.length) {
                return;
            }

            event.preventDefault();
            buttons[nextIndex].focus();
        });

        function renderWeekdays(weekdayContainer) {
            const labels = weekdayLabels.map(label => {
                const element = document.createElement('span');
                element.textContent = label;
                return element;
            });

            weekdayContainer.replaceChildren(...labels);
        }

        function renderDatePicker(currentPicker) {
            const state = currentPicker._datePickerState;
            const monthTarget = currentPicker.querySelector('[data-date-picker-month]');
            const daysTarget = currentPicker.querySelector('[data-date-picker-days]');
            const summaryTarget = currentPicker.querySelector('[data-date-picker-summary]');
            const visibleMonth = new Date(state.viewYear, state.viewMonth, 1);
            const today = stripTime(new Date());

            if (state.mode === 'range') {
                input.value = formatRangeInput(state.rangeStart, state.rangeEnd);
                if (singleValueField) {
                    singleValueField.value = '';
                }
                if (rangeStartField) {
                    rangeStartField.value = state.rangeStart ? toISODate(state.rangeStart) : '';
                }
                if (rangeEndField) {
                    rangeEndField.value = state.rangeEnd ? toISODate(state.rangeEnd) : '';
                }
                summaryTarget.textContent = formatRangeSummary(state);
                syncPresetButtons(currentPicker);
            } else {
                input.value = state.selectedDate ? formatInputDate(state.selectedDate) : '';
                if (singleValueField) {
                    singleValueField.value = state.selectedDate ? toISODate(state.selectedDate) : '';
                }
                if (rangeStartField) {
                    rangeStartField.value = '';
                }
                if (rangeEndField) {
                    rangeEndField.value = '';
                }
                summaryTarget.textContent = state.selectedDate ? summaryFormatter.format(state.selectedDate) : 'No date selected';
            }

            renderMonthYearPicker(currentPicker, visibleMonth);
            syncMetaPicker(currentPicker);

            const firstVisibleDay = new Date(state.viewYear, state.viewMonth, 1);
            const offset = (firstVisibleDay.getDay() + 6) % 7;
            firstVisibleDay.setDate(firstVisibleDay.getDate() - offset);

            const weekRows = [];
            const hasVisibleMultiDayRange = state.mode === 'range'
                && state.rangeStart
                && state.rangeEnd
                && !isSameDay(state.rangeStart, state.rangeEnd);

            for (let weekIndex = 0; weekIndex < 6; weekIndex += 1) {
                const weekRow = document.createElement('div');
                weekRow.className = 'date-picker-week-row';

                let rangeStartColumn = null;
                let rangeEndColumn = null;

                for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek += 1) {
                    const dayIndex = (weekIndex * 7) + dayOfWeek;
                    const dayDate = new Date(firstVisibleDay);
                    dayDate.setDate(firstVisibleDay.getDate() + dayIndex);

                    const dayButton = document.createElement('button');
                    const classNames = ['date-picker-day', 'day-col-' + String(dayOfWeek + 1)];
                    const isSelected = state.mode === 'single' && state.selectedDate && isSameDay(dayDate, state.selectedDate);
                    const isRangeStart = state.mode === 'range' && state.rangeStart && isSameDay(dayDate, state.rangeStart);
                    const isRangeEnd = state.mode === 'range' && state.rangeEnd && isSameDay(dayDate, state.rangeEnd);
                    const isInRange = state.mode === 'range' && isDateInRange(dayDate, state.rangeStart, state.rangeEnd);
                    const isPressed = Boolean(isSelected || isRangeStart || isRangeEnd || isInRange);

                    dayButton.type = 'button';
                    dayButton.dataset.datePickerDay = toISODate(dayDate);
                    dayButton.textContent = String(dayDate.getDate());
                    dayButton.setAttribute('aria-label', ariaFormatter.format(dayDate));
                    dayButton.setAttribute('aria-pressed', isPressed ? 'true' : 'false');

                    if (dayDate.getMonth() !== state.viewMonth) {
                        classNames.push('is-outside');
                    }

                    if (isSameDay(dayDate, today)) {
                        classNames.push('is-today');
                        dayButton.setAttribute('aria-current', 'date');
                    }

                    if (isInRange) {
                        classNames.push('is-in-range');

                        if (hasVisibleMultiDayRange) {
                            if (rangeStartColumn === null) {
                                rangeStartColumn = dayOfWeek + 1;
                            }

                            rangeEndColumn = dayOfWeek + 1;
                        }
                    }

                    if (isSelected) {
                        classNames.push('is-selected');
                    }

                    if (isRangeStart) {
                        classNames.push('is-range-start', 'is-selected');
                    }

                    if (isRangeEnd) {
                        classNames.push('is-range-end', 'is-selected');
                    }

                    dayButton.className = classNames.join(' ');
                    weekRow.append(dayButton);
                }

                if (rangeStartColumn !== null && rangeEndColumn !== null) {
                    const rangeStrip = document.createElement('span');
                    rangeStrip.className = 'date-picker-week-strip range-start-col-' + String(rangeStartColumn) + ' range-end-col-' + String(rangeEndColumn);
                    rangeStrip.setAttribute('aria-hidden', 'true');
                    weekRow.prepend(rangeStrip);
                }

                weekRows.push(weekRow);
            }

            daysTarget.replaceChildren(...weekRows);
        }

        function renderMonthYearPicker(currentPicker, visibleMonth) {
            const state = currentPicker._datePickerState;
            const monthPageStart = state.metaMonthPage * 6;

            monthLabel.textContent = monthFormatter.format(visibleMonth);
            monthTriggerLabel.textContent = monthNames[state.viewMonth];
            yearTriggerLabel.textContent = String(state.viewYear);
            monthTriggerLabel.setAttribute('aria-label', 'Choose month, current ' + monthNames[state.viewMonth]);
            yearTriggerLabel.setAttribute('aria-label', 'Choose year, current ' + String(state.viewYear));

            const monthButtons = monthOptionLabels.slice(monthPageStart, monthPageStart + 6).map((label, index) => {
                const monthIndex = monthPageStart + index;
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'date-picker-meta-option';
                button.dataset.datePickerMonthOption = String(monthIndex);
                button.textContent = label;
                button.setAttribute('aria-pressed', state.viewMonth === monthIndex ? 'true' : 'false');
                button.setAttribute('aria-label', monthNames[monthIndex]);
                return button;
            });

            const yearButtons = Array.from({ length: 12 }, (_, index) => {
                const yearValue = state.metaYearStart + index;
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'date-picker-meta-option';
                button.dataset.datePickerYearOption = String(yearValue);
                button.textContent = String(yearValue);
                button.setAttribute('aria-pressed', state.viewYear === yearValue ? 'true' : 'false');
                return button;
            });

            monthGrid.replaceChildren(...monthButtons);
            yearGrid.replaceChildren(...yearButtons);
        }

        function syncMetaPicker(currentPicker) {
            const state = currentPicker._datePickerState;
            const view = state.panelView;
            const isMetaOpen = view !== 'days';

            currentPicker.classList.toggle('is-meta-open', isMetaOpen);
            currentPicker.classList.toggle('is-month-open', view === 'month');
            currentPicker.classList.toggle('is-year-open', view === 'year');
            monthTriggerLabel.setAttribute('aria-expanded', view === 'month' ? 'true' : 'false');
            yearTriggerLabel.setAttribute('aria-expanded', view === 'year' ? 'true' : 'false');
        }

        function openMetaPicker(currentPicker, view) {
            if (isDisabled) {
                return;
            }

            const state = currentPicker._datePickerState;
            if (state.panelView === view) {
                state.panelView = 'days';
                syncMetaPicker(currentPicker);
                return;
            }

            state.panelView = view;

            if (view === 'month') {
                state.metaMonthPage = Math.floor(state.viewMonth / 6);
            }

            if (view === 'year') {
                state.metaYearStart = state.viewYear - 5;
            }

            renderMonthYearPicker(currentPicker, new Date(state.viewYear, state.viewMonth, 1));
            syncMetaPicker(currentPicker);
        }

        function closeMetaPicker(currentPicker) {
            const state = currentPicker._datePickerState;
            if (state.panelView !== 'days') {
                state.panelView = 'days';
                syncMetaPicker(currentPicker);
            }
        }

        function openDatePicker(currentPicker, focusSelectedDay) {
            if (isDisabled) {
                return;
            }

            datePickers.forEach(otherPicker => {
                if (otherPicker === currentPicker || isStickyPicker(otherPicker)) {
                    return;
                }

                otherPicker.classList.remove('is-open');
                const otherPanel = otherPicker.querySelector('[data-date-picker-panel]');
                if (otherPanel) {
                    otherPanel.hidden = true;
                    otherPanel.setAttribute('aria-hidden', 'true');
                }
                otherPicker.querySelector('[data-date-picker-trigger]')?.setAttribute('aria-expanded', 'false');
                otherPicker.querySelector('[data-date-picker-input]')?.setAttribute('aria-expanded', 'false');
            });

            currentPicker.classList.add('is-open');
            panel.hidden = false;
            panel.setAttribute('aria-hidden', 'false');
            setExpandedState(currentPicker, true);
            openPicker = currentPicker;

            if (focusSelectedDay) {
                requestAnimationFrame(() => {
                    focusPreferredDay(currentPicker);
                });
            }
        }

        function closeDatePicker(currentPicker, restoreFocus) {
            closeMetaPicker(currentPicker);
            currentPicker.classList.remove('is-open');
            panel.hidden = true;
            panel.setAttribute('aria-hidden', 'true');
            setExpandedState(currentPicker, false);

            if (openPicker === currentPicker) {
                openPicker = null;
            }

            if (restoreFocus) {
                currentPicker.querySelector('[data-date-picker-trigger]')?.focus();
            }
        }

        function setExpandedState(currentPicker, isOpen) {
            const nextValue = isOpen ? 'true' : 'false';
            currentPicker.querySelector('[data-date-picker-trigger]')?.setAttribute('aria-expanded', nextValue);
            currentPicker.querySelector('[data-date-picker-input]')?.setAttribute('aria-expanded', nextValue);
        }

        function commitTypedInput(currentPicker) {
            const state = currentPicker._datePickerState;
            const typedValue = input.value.trim();

            if (!typedValue) {
                clearSelection(currentPicker);
                return;
            }

            if (state.mode === 'range') {
                const parsedRange = parseTypedRangeInput(typedValue);

                if (!parsedRange) {
                    renderDatePicker(currentPicker);
                    return;
                }

                state.rangeStart = parsedRange.start;
                state.rangeEnd = parsedRange.end;
                state.selectedDate = parsedRange.end || parsedRange.start;
                state.activePreset = '';

                if (parsedRange.start) {
                    state.viewYear = parsedRange.start.getFullYear();
                    state.viewMonth = parsedRange.start.getMonth();
                }

                renderDatePicker(currentPicker);
                return;
            }

            const parsedDate = parseTypedDateInput(typedValue);
            if (!parsedDate) {
                renderDatePicker(currentPicker);
                return;
            }

            state.selectedDate = parsedDate;
            state.viewYear = parsedDate.getFullYear();
            state.viewMonth = parsedDate.getMonth();
            renderDatePicker(currentPicker);
        }

        function shiftViewMonth(currentPicker, direction) {
            const state = currentPicker._datePickerState;

            if (state.panelView === 'month') {
                const nextMonthPage = Math.max(0, Math.min(1, state.metaMonthPage + direction));
                if (nextMonthPage !== state.metaMonthPage) {
                    state.metaMonthPage = nextMonthPage;
                    renderMonthYearPicker(currentPicker, new Date(state.viewYear, state.viewMonth, 1));
                }

                requestAnimationFrame(() => {
                    monthTriggerLabel.focus();
                });
                return;
            }

            if (state.panelView === 'year') {
                state.metaYearStart += direction * 12;
                renderMonthYearPicker(currentPicker, new Date(state.viewYear, state.viewMonth, 1));

                requestAnimationFrame(() => {
                    yearTriggerLabel.focus();
                });
                return;
            }

            const nextDate = new Date(state.viewYear, state.viewMonth + direction, 1);

            state.viewYear = nextDate.getFullYear();
            state.viewMonth = nextDate.getMonth();
            renderDatePicker(currentPicker);

            requestAnimationFrame(() => {
                focusPreferredDay(currentPicker);
            });
        }

        function selectDate(currentPicker, date, closeAfterSelect) {
            const normalizedDate = stripTime(date);
            const state = currentPicker._datePickerState;

            if (state.mode === 'range') {
                state.activePreset = '';

                if (!state.rangeStart || (state.rangeStart && state.rangeEnd)) {
                    state.rangeStart = normalizedDate;
                    state.rangeEnd = null;
                } else if (normalizedDate.getTime() < state.rangeStart.getTime()) {
                    state.rangeEnd = state.rangeStart;
                    state.rangeStart = normalizedDate;
                } else {
                    state.rangeEnd = normalizedDate;
                }

                state.selectedDate = normalizedDate;
                state.viewYear = normalizedDate.getFullYear();
                state.viewMonth = normalizedDate.getMonth();
                renderDatePicker(currentPicker);

                if (closeAfterSelect && state.rangeStart && state.rangeEnd && !isStickyPicker(currentPicker)) {
                    closeDatePicker(currentPicker, true);
                }

                return;
            }

            state.selectedDate = normalizedDate;
            state.viewYear = normalizedDate.getFullYear();
            state.viewMonth = normalizedDate.getMonth();
            renderDatePicker(currentPicker);

            if (closeAfterSelect && !isStickyPicker(currentPicker)) {
                closeDatePicker(currentPicker, true);
            }
        }

        function applyPreset(currentPicker, preset) {
            const state = currentPicker._datePickerState;
            if (state.mode !== 'range') {
                return;
            }

            const today = stripTime(new Date());
            let nextStart = null;
            let nextEnd = null;

            switch (preset) {
                case 'week':
                    nextStart = startOfWeek(today);
                    nextEnd = endOfWeek(today);
                    break;
                case 'next-7-days':
                    nextStart = today;
                    nextEnd = addDays(today, 6);
                    break;
                case 'month':
                    nextStart = startOfMonth(today);
                    nextEnd = endOfMonth(today);
                    break;
                default:
                    clearSelection(currentPicker);
                    return;
            }

            state.rangeStart = nextStart;
            state.rangeEnd = nextEnd;
            state.selectedDate = nextStart;
            state.activePreset = preset;
            state.viewYear = nextStart.getFullYear();
            state.viewMonth = nextStart.getMonth();
            renderDatePicker(currentPicker);
            openDatePicker(currentPicker, false);

            requestAnimationFrame(() => {
                focusPreferredDay(currentPicker);
            });
        }

        function clearSelection(currentPicker) {
            closeMetaPicker(currentPicker);
            const state = currentPicker._datePickerState;

            if (state.mode === 'range') {
                state.rangeStart = null;
                state.rangeEnd = null;
                state.selectedDate = null;
                state.activePreset = '';
            } else {
                state.selectedDate = null;
            }

            renderDatePicker(currentPicker);
        }

        function syncPresetButtons(currentPicker) {
            const state = currentPicker._datePickerState;

            presetButtons.forEach(button => {
                const isActive = button.dataset.datePickerPreset === state.activePreset;
                button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
            });
        }

        function focusPreferredDay(currentPicker) {
            const daysTarget = currentPicker.querySelector('[data-date-picker-days]');
            if (!daysTarget) {
                return;
            }

            const preferredButton =
                daysTarget.querySelector('.is-range-end') ||
                daysTarget.querySelector('.is-range-start') ||
                daysTarget.querySelector('.is-selected') ||
                daysTarget.querySelector('.is-today:not(.is-outside)') ||
                daysTarget.querySelector('[data-date-picker-day]');

            preferredButton?.focus();
        }
    });

    document.addEventListener('click', event => {
        datePickers.forEach(picker => {
            if (picker.contains(event.target) || isStickyPicker(picker)) {
                return;
            }

            picker._datePickerState.panelView = 'days';
            picker.classList.remove('is-meta-open', 'is-month-open', 'is-year-open');
            picker.querySelector('[data-date-picker-month-trigger]')?.setAttribute('aria-expanded', 'false');
            picker.querySelector('[data-date-picker-year-trigger]')?.setAttribute('aria-expanded', 'false');
            picker.classList.remove('is-open');
            const panel = picker.querySelector('[data-date-picker-panel]');
            panel.hidden = true;
            panel.setAttribute('aria-hidden', 'true');
            picker.querySelector('[data-date-picker-trigger]')?.setAttribute('aria-expanded', 'false');
            picker.querySelector('[data-date-picker-input]')?.setAttribute('aria-expanded', 'false');
        });

        openPicker = datePickers.find(picker => picker.classList.contains('is-open')) || null;
    });

    document.addEventListener('keydown', event => {
        if (event.key !== 'Escape' || !openPicker) {
            return;
        }

        openPicker._datePickerState.panelView = 'days';
        openPicker.classList.remove('is-meta-open', 'is-month-open', 'is-year-open');
        openPicker.querySelector('[data-date-picker-month-trigger]')?.setAttribute('aria-expanded', 'false');
        openPicker.querySelector('[data-date-picker-year-trigger]')?.setAttribute('aria-expanded', 'false');
        openPicker.classList.remove('is-open');
        const panel = openPicker.querySelector('[data-date-picker-panel]');
        panel.hidden = true;
        panel.setAttribute('aria-hidden', 'true');
        openPicker.querySelector('[data-date-picker-trigger]')?.setAttribute('aria-expanded', 'false');
        openPicker.querySelector('[data-date-picker-input]')?.setAttribute('aria-expanded', 'false');
        openPicker.querySelector('[data-date-picker-trigger]')?.focus();
        openPicker = null;
    });

    function createDatePickerHeadingControls(idBase) {
        const headingControls = document.createElement('div');
        headingControls.className = 'date-picker-heading-controls';
        headingControls.innerHTML = `
            <button type="button" class="date-picker-heading-trigger" id="${idBase}-month-trigger" data-date-picker-month-trigger></button>
            <button type="button" class="date-picker-heading-trigger" id="${idBase}-year-trigger" data-date-picker-year-trigger></button>
        `;
        return headingControls;
    }

    function createDatePickerMetaPanel(idBase) {
        const metaPanel = document.createElement('div');
        metaPanel.className = 'date-picker-meta-panel';
        metaPanel.id = `${idBase}-meta`;
        metaPanel.innerHTML = `
            <div class="date-picker-meta-section" data-date-picker-meta-section="month">
                <p class="date-picker-meta-title">Months</p>
                <div class="date-picker-meta-grid" data-date-picker-month-grid role="grid" aria-label="Choose month"></div>
            </div>
            <div class="date-picker-meta-section" data-date-picker-meta-section="year">
                <p class="date-picker-meta-title">Years</p>
                <div class="date-picker-meta-grid" data-date-picker-year-grid role="grid" aria-label="Choose year"></div>
            </div>
        `;
        return metaPanel;
    }

    function createWeekdayLabels(localeValue) {
        const formatter = new Intl.DateTimeFormat(localeValue, { weekday: 'short' });
        const mondayStart = new Date(2024, 0, 1);

        return Array.from({ length: 7 }, (_, index) => {
            const weekday = new Date(mondayStart);
            weekday.setDate(mondayStart.getDate() + index);
            return formatter.format(weekday).replace('.', '');
        });
    }

    function createMonthNames(localeValue, monthStyle) {
        const formatter = new Intl.DateTimeFormat(localeValue, { month: monthStyle });
        const anchorMonth = new Date(2024, 0, 1);

        return Array.from({ length: 12 }, (_, index) => {
            const monthDate = new Date(anchorMonth);
            monthDate.setMonth(index);
            return formatter.format(monthDate).replace('.', '');
        });
    }

    function formatInputDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear());

        return `${day}/${month}/${year}`;
    }

    function normalizeTypedDateInput(value) {
        const digits = String(value || '').replace(/\D/g, '').slice(0, 8);
        const parts = [];

        if (digits.length > 0) {
            parts.push(digits.slice(0, 2));
        }

        if (digits.length > 2) {
            parts.push(digits.slice(2, 4));
        }

        if (digits.length > 4) {
            parts.push(digits.slice(4, 8));
        }

        return parts.join('/');
    }

    function normalizeTypedRangeInput(value) {
        const digits = String(value || '').replace(/\D/g, '').slice(0, 16);
        const startValue = normalizeTypedDateInput(digits.slice(0, 8));
        const endDigits = digits.slice(8, 16);
        const endValue = normalizeTypedDateInput(endDigits);

        if (!startValue) {
            return '';
        }

        if (!endDigits) {
            return startValue;
        }

        return `${startValue} - ${endValue}`;
    }

    function parseTypedDateInput(value) {
        const parts = String(value || '').trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (!parts) {
            return null;
        }

        const day = Number(parts[1]);
        const month = Number(parts[2]) - 1;
        const year = Number(parts[3]);
        const parsedDate = new Date(year, month, day);

        if (Number.isNaN(parsedDate.getTime())) {
            return null;
        }

        if (parsedDate.getFullYear() !== year || parsedDate.getMonth() !== month || parsedDate.getDate() !== day) {
            return null;
        }

        return stripTime(parsedDate);
    }

    function parseTypedRangeInput(value) {
        const trimmedValue = String(value || '').trim();
        if (!trimmedValue) {
            return { start: null, end: null };
        }

        const parts = trimmedValue.split(/\s*-\s*/);
        if (parts.length > 2) {
            return null;
        }

        const startDate = parseTypedDateInput(parts[0]);
        if (!startDate) {
            return null;
        }

        if (parts.length === 1 || !parts[1]) {
            return { start: startDate, end: null };
        }

        const endDate = parseTypedDateInput(parts[1]);
        if (!endDate) {
            return null;
        }

        if (endDate.getTime() < startDate.getTime()) {
            return { start: endDate, end: startDate };
        }

        return { start: startDate, end: endDate };
    }

    function formatRangeInput(startDate, endDate) {
        if (!startDate && !endDate) {
            return '';
        }

        if (startDate && endDate) {
            return `${formatInputDate(startDate)} - ${formatInputDate(endDate)}`;
        }

        return `${formatInputDate(startDate)} -`;
    }
    function formatRangeSummary(state) {
        const presetLabel = presetLabels[state.activePreset];

        if (state.rangeStart && state.rangeEnd) {
            const rangeLabel = `${summaryFormatter.format(state.rangeStart)} - ${summaryFormatter.format(state.rangeEnd)}`;
            return presetLabel ? `${presetLabel} - ${rangeLabel}` : `Selected range: ${rangeLabel}`;
        }

        if (state.rangeStart) {
            return `Start date selected: ${summaryFormatter.format(state.rangeStart)}. Choose an end date.`;
        }

        return 'Choose a preset or pick a start and end date.';
    }

    function parseISODate(value) {
        if (!value) {
            return null;
        }

        const parts = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (!parts) {
            return null;
        }

        const parsedDate = new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]));
        return Number.isNaN(parsedDate.getTime()) ? null : stripTime(parsedDate);
    }

    function stripTime(date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    function toISODate(date) {
        const year = String(date.getFullYear());
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    function isSameDay(firstDate, secondDate) {
        return firstDate.getFullYear() === secondDate.getFullYear()
            && firstDate.getMonth() === secondDate.getMonth()
            && firstDate.getDate() === secondDate.getDate();
    }

    function isDateInRange(date, startDate, endDate) {
        if (!startDate || !endDate) {
            return false;
        }

        const currentTime = stripTime(date).getTime();
        return currentTime >= startDate.getTime() && currentTime <= endDate.getTime();
    }

    function addDays(date, amount) {
        const nextDate = stripTime(date);
        nextDate.setDate(nextDate.getDate() + amount);
        return nextDate;
    }

    function startOfWeek(date) {
        const nextDate = stripTime(date);
        const offset = (nextDate.getDay() + 6) % 7;
        nextDate.setDate(nextDate.getDate() - offset);
        return nextDate;
    }

    function endOfWeek(date) {
        return addDays(startOfWeek(date), 6);
    }

    function startOfMonth(date) {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    }

    function endOfMonth(date) {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0);
    }

    function isStickyPicker(picker) {
        return picker.dataset.datePickerSticky === 'true';
    }
});

/**
 * Search Overlay Component Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const overlays = Array.from(document.querySelectorAll('.search-overlay[data-search-overlay-modal="true"]'));
    const triggers = Array.from(document.querySelectorAll('[data-search-overlay-target]'));

    if (overlays.length === 0 || triggers.length === 0) {
        return;
    }

    let openOverlay = null;

    overlays.forEach(overlay => {
        overlay.inert = !overlay.classList.contains('is-open');
        overlay.setAttribute('aria-hidden', overlay.classList.contains('is-open') ? 'false' : 'true');

        overlay.querySelector('.search-overlay-panel')?.setAttribute('tabindex', '-1');

        overlay.querySelectorAll('[data-search-overlay-close]').forEach(button => {
            if (button.tagName === 'BUTTON') {
                button.setAttribute('type', 'button');
            }

            button.addEventListener('click', () => {
                closeSearchOverlay(overlay, true);
            });
        });

        overlay.addEventListener('click', event => {
            if (event.target === overlay) {
                closeSearchOverlay(overlay, true);
            }
        });
    });

    triggers.forEach(trigger => {
        const targetId = trigger.dataset.searchOverlayTarget;
        if (!targetId) {
            return;
        }

        const overlay = document.getElementById(targetId);
        if (!overlay) {
            return;
        }

        if (trigger.tagName === 'BUTTON') {
            trigger.setAttribute('type', 'button');
        }

        trigger.setAttribute('aria-controls', targetId);
        trigger.setAttribute('aria-haspopup', 'dialog');
        trigger.setAttribute('aria-expanded', overlay.classList.contains('is-open') ? 'true' : 'false');

        trigger.addEventListener('click', () => {
            if (openOverlay === overlay) {
                closeSearchOverlay(overlay, true);
                return;
            }

            openSearchOverlay(overlay, trigger);
        });
    });

    document.addEventListener('keydown', event => {
        if (!openOverlay) {
            return;
        }

        if (event.key === 'Escape') {
            closeSearchOverlay(openOverlay, true);
            return;
        }

        if (event.key === 'Tab') {
            trapSearchOverlayFocus(openOverlay, event);
        }
    });

    function getFocusableElements(root) {
        return Array.from(root.querySelectorAll('a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'))
            .filter(element => !element.hasAttribute('inert') && !element.closest('[inert]') && !element.closest('[hidden]') && !element.hidden && element.getAttribute('aria-hidden') !== 'true');
    }

    function trapSearchOverlayFocus(overlay, event) {
        const panel = overlay.querySelector('.search-overlay-panel');
        if (!panel) {
            return;
        }

        const focusable = getFocusableElements(panel);
        if (focusable.length === 0) {
            event.preventDefault();
            panel.focus({ preventScroll: true });
            return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus({ preventScroll: true });
            return;
        }

        if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus({ preventScroll: true });
        }
    }

    function syncTriggerState(targetId, isOpen) {
        triggers
            .filter(trigger => trigger.dataset.searchOverlayTarget === targetId)
            .forEach(trigger => {
                trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            });
    }

    function syncBodyLock() {
        document.body.classList.toggle('search-overlay-open', overlays.some(overlay => overlay.classList.contains('is-open')));
    }

    function openSearchOverlay(overlay, trigger) {
        overlays.forEach(otherOverlay => {
            if (otherOverlay !== overlay) {
                closeSearchOverlay(otherOverlay, false);
            }
        });

        overlay.inert = false;
        overlay.classList.add('is-open');
        overlay.setAttribute('aria-hidden', 'false');
        overlay._lastTrigger = trigger;
        openOverlay = overlay;
        syncTriggerState(overlay.id, true);
        syncBodyLock();

        requestAnimationFrame(() => {
            const panel = overlay.querySelector('.search-overlay-panel');
            const initialFocus = overlay.querySelector('[data-search-overlay-input]')
                || (panel ? getFocusableElements(panel)[0] : null)
                || panel;

            initialFocus?.focus({ preventScroll: true });
        });
    }

    function closeSearchOverlay(overlay, restoreFocus) {
        if (!overlay) {
            return;
        }

        overlay.classList.remove('is-open');
        overlay.setAttribute('aria-hidden', 'true');
        overlay.inert = true;
        syncTriggerState(overlay.id, false);
        syncBodyLock();

        if (openOverlay === overlay) {
            openOverlay = overlays.find(item => item.classList.contains('is-open')) || null;
        }

        if (restoreFocus && overlay._lastTrigger) {
            overlay._lastTrigger.focus({ preventScroll: true });
        }
    }
});

/**
 * Drawer Sheet Component Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const triggers = Array.from(document.querySelectorAll('[data-drawer-target]'));
    const drawers = Array.from(document.querySelectorAll('.drawer-sheet'));

    if (triggers.length === 0 || drawers.length === 0) {
        return;
    }

    let openDrawer = null;

    drawers.forEach(drawer => {
        drawer.inert = true;
        drawer.setAttribute('aria-hidden', 'true');
        drawer.querySelector('.drawer-sheet-panel')?.setAttribute('tabindex', '-1');

        drawer.querySelectorAll('[data-drawer-close]').forEach(button => {
            if (button.tagName === 'BUTTON') {
                button.setAttribute('type', 'button');
            }

            button.addEventListener('click', () => {
                closeDrawerSheet(drawer, true);
            });
        });

        drawer.addEventListener('click', event => {
            if (event.target === drawer) {
                closeDrawerSheet(drawer, true);
            }
        });
    });

    triggers.forEach(trigger => {
        const targetId = trigger.dataset.drawerTarget;
        if (!targetId) {
            return;
        }

        trigger.setAttribute('aria-controls', targetId);
        trigger.setAttribute('aria-expanded', 'false');
        trigger.setAttribute('aria-haspopup', 'dialog');

        trigger.addEventListener('click', () => {
            const drawer = drawers.find(item => item.id === targetId);
            if (!drawer) {
                return;
            }

            openDrawerSheet(drawer, trigger);
        });
    });

    document.addEventListener('keydown', event => {
        if (!openDrawer) {
            return;
        }

        if (event.key === 'Escape') {
            closeDrawerSheet(openDrawer, true);
            return;
        }

        if (event.key === 'Tab') {
            trapDrawerSheetFocus(openDrawer, event);
        }
    });

    function getFocusableElements(root) {
        return Array.from(root.querySelectorAll('a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'))
            .filter(element => !element.hasAttribute('inert') && !element.closest('[inert]') && !element.hidden && element.getAttribute('aria-hidden') !== 'true');
    }

    function trapDrawerSheetFocus(drawer, event) {
        const panel = drawer.querySelector('.drawer-sheet-panel');
        if (!panel) {
            return;
        }

        const focusable = getFocusableElements(panel);
        if (focusable.length === 0) {
            event.preventDefault();
            panel.focus({ preventScroll: true });
            return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus({ preventScroll: true });
            return;
        }

        if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus({ preventScroll: true });
        }
    }

    function syncTriggerState(targetId, isOpen) {
        triggers
            .filter(trigger => trigger.dataset.drawerTarget === targetId)
            .forEach(trigger => {
                trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            });
    }

    function syncBodyLock() {
        document.body.classList.toggle('drawer-sheet-open', drawers.some(drawer => drawer.classList.contains('is-open')));
    }

    function openDrawerSheet(drawer, trigger) {
        drawers.forEach(otherDrawer => {
            if (otherDrawer !== drawer) {
                closeDrawerSheet(otherDrawer, false);
            }
        });

        drawer.inert = false;
        drawer.classList.add('is-open');
        drawer.setAttribute('aria-hidden', 'false');
        drawer._lastTrigger = trigger;
        openDrawer = drawer;
        syncTriggerState(drawer.id, true);
        syncBodyLock();

        requestAnimationFrame(() => {
            const panel = drawer.querySelector('.drawer-sheet-panel');
            const initialFocus = drawer.querySelector('[data-drawer-initial-focus]')
                || (panel ? getFocusableElements(panel)[0] : null)
                || panel;

            initialFocus?.focus({ preventScroll: true });
        });
    }

    function closeDrawerSheet(drawer, restoreFocus) {
        if (!drawer) {
            return;
        }

        drawer.classList.remove('is-open');
        drawer.setAttribute('aria-hidden', 'true');
        drawer.inert = true;
        syncTriggerState(drawer.id, false);
        syncBodyLock();

        if (openDrawer === drawer) {
            openDrawer = drawers.find(item => item.classList.contains('is-open')) || null;
        }

        if (restoreFocus && drawer._lastTrigger) {
            drawer._lastTrigger.focus({ preventScroll: true });
        }
    }
});/**
 * Toast Component Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const triggers = Array.from(document.querySelectorAll('[data-toast-target]'));
    const toasts = Array.from(document.querySelectorAll('.toast'));
    const dismissDelay = 4000;
    const hideDelay = 320;
    const toastTimers = new Map();

    if (triggers.length === 0 || toasts.length === 0) {
        return;
    }

    toasts.forEach(toast => {
        toast.hidden = true;
        toast.inert = true;
        toast.setAttribute('aria-hidden', 'true');
        wireToastPauseState(toast);
    });

    triggers.forEach(trigger => {
        const toastId = trigger.dataset.toastTarget || '';
        const toast = document.getElementById(toastId);

        trigger.type = 'button';

        if (!toast) {
            return;
        }

        trigger.setAttribute('aria-controls', toastId);
        trigger.addEventListener('click', () => {
            showToast(toast);
        });
    });

    document.querySelectorAll('[data-toast-close]').forEach(button => {
        button.type = 'button';
        button.addEventListener('click', () => {
            const toast = button.closest('.toast');
            if (!toast) {
                return;
            }

            hideToast(toast);
        });
    });

    function showToast(toast) {
        clearToastTimers(toast);
        toast.hidden = false;
        toast.inert = false;
        toast.setAttribute('aria-hidden', 'false');
        syncTriggerState(toast.id, true);

        requestAnimationFrame(() => {
            toast.classList.add('is-visible');
        });

        scheduleDismiss(toast);
    }

    function hideToast(toast) {
        clearToastTimers(toast);
        toast.classList.remove('is-visible');
        toast.setAttribute('aria-hidden', 'true');
        syncTriggerState(toast.id, false);

        const hideTimer = setTimeout(() => {
            toast.hidden = true;
            toast.inert = true;
            toastTimers.delete(toast);
        }, hideDelay);

        toastTimers.set(toast, { dismissTimer: null, hideTimer });
    }

    function scheduleDismiss(toast) {
        clearDismissTimer(toast);

        const dismissTimer = setTimeout(() => {
            hideToast(toast);
        }, dismissDelay);

        const timers = toastTimers.get(toast) || { dismissTimer: null, hideTimer: null };
        toastTimers.set(toast, { ...timers, dismissTimer });
    }

    function pauseDismiss(toast) {
        const timers = toastTimers.get(toast);
        if (!timers || !timers.dismissTimer) {
            return;
        }

        clearTimeout(timers.dismissTimer);
        toastTimers.set(toast, { ...timers, dismissTimer: null });
    }

    function resumeDismiss(toast) {
        if (toast.hidden || !toast.classList.contains('is-visible')) {
            return;
        }

        scheduleDismiss(toast);
    }

    function clearDismissTimer(toast) {
        const timers = toastTimers.get(toast);
        if (!timers || !timers.dismissTimer) {
            return;
        }

        clearTimeout(timers.dismissTimer);
    }

    function clearToastTimers(toast) {
        const timers = toastTimers.get(toast);
        if (!timers) {
            return;
        }

        if (timers.dismissTimer) {
            clearTimeout(timers.dismissTimer);
        }

        if (timers.hideTimer) {
            clearTimeout(timers.hideTimer);
        }
    }

    function syncTriggerState(toastId, isActive) {
        triggers
            .filter(trigger => (trigger.dataset.toastTarget || '') === toastId)
            .forEach(trigger => {
                if (isActive) {
                    trigger.setAttribute('data-toast-active', 'true');
                    return;
                }

                trigger.removeAttribute('data-toast-active');
            });
    }

    function wireToastPauseState(toast) {
        toast.addEventListener('mouseenter', () => {
            pauseDismiss(toast);
        });

        toast.addEventListener('mouseleave', () => {
            resumeDismiss(toast);
        });

        toast.addEventListener('focusin', () => {
            pauseDismiss(toast);
        });

        toast.addEventListener('focusout', event => {
            if (toast.contains(event.relatedTarget)) {
                return;
            }

            resumeDismiss(toast);
        });
    }
});





















