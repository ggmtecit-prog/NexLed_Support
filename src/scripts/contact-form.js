(() => {
    const FALLBACK_FEEDBACK = {
        submitted: {
            title: 'Request sent',
            message: 'Your request has been sent. Our team will review the information and follow up using the email address you provided.',
            variant: 'success',
            icon: 'ri-checkbox-circle-line',
            role: 'status',
        },
        validation_summary: {
            title: 'Check the highlighted fields',
            message: 'Correct the indicated fields before sending your request again.',
            variant: 'danger',
            icon: 'ri-close-circle-line',
            role: 'alert',
        },
        submit_failed: {
            title: 'We could not send the request',
            message: 'Please try again in a moment or use one of the direct support contacts shown on this page.',
            variant: 'danger',
            icon: 'ri-close-circle-line',
            role: 'alert',
        },
    };

    const FALLBACK_ERRORS = {
        required: 'This field is required.',
        invalid_email: 'Enter a valid email address.',
        max_length: 'This content exceeds the allowed length.',
    };

    let siteCopyPromise = null;

    function getCurrentLang() {
        if (window.Utils && typeof Utils.getLang === 'function') {
            return Utils.getLang();
        }

        return document.documentElement.lang || 'pt';
    }

    function getByPath(source, path) {
        return String(path || '')
            .split('.')
            .filter(Boolean)
            .reduce((value, segment) => (value && value[segment] !== undefined ? value[segment] : undefined), source);
    }

    function resolveLocalizedValue(node, fallback = '') {
        if (node === undefined || node === null) {
            return fallback;
        }

        if (typeof node === 'string') {
            return node;
        }

        if (window.Utils && typeof Utils.t === 'function') {
            return Utils.t(node, getCurrentLang(), fallback);
        }

        return fallback;
    }

    async function getSiteCopy() {
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

    async function getFormCopy(path, fallback = '') {
        const siteCopy = await getSiteCopy();
        return resolveLocalizedValue(getByPath(siteCopy, `contact.form.${path}`), fallback);
    }

    async function getFeedbackCopy(code) {
        const fallback = FALLBACK_FEEDBACK[code] || FALLBACK_FEEDBACK.submit_failed;

        return {
            title: await getFormCopy(`feedback.${code}.title`, fallback.title),
            message: await getFormCopy(`feedback.${code}.message`, fallback.message),
            variant: fallback.variant,
            icon: fallback.icon,
            role: fallback.role,
        };
    }

    async function getErrorCopy(code) {
        return getFormCopy(`errors.${code}`, FALLBACK_ERRORS[code] || FALLBACK_ERRORS.required);
    }

    function createController(form) {
        const statusHost = form.querySelector('[data-contact-status-host]');
        const statusElement = form.querySelector('[data-contact-status]');
        const statusTitle = form.querySelector('[data-contact-status-title]');
        const statusText = form.querySelector('[data-contact-status-text]');
        const statusIcon = form.querySelector('[data-contact-status-icon]');
        const submitButton = form.querySelector('[data-contact-submit-button]');
        const submitLabel = form.querySelector('[data-contact-submit-label]');
        const submittedAtField = form.querySelector('[data-contact-submitted-at]');
        const langField = form.querySelector('[data-contact-lang]');
        const fields = Array.from(form.querySelectorAll('[data-contact-field]'));
        const fieldMap = new Map(fields.map((field) => [field.dataset.contactField, field]));
        const errorMap = new Map(
            Array.from(form.querySelectorAll('[data-contact-error]'))
                .map((element) => [element.dataset.contactError, element])
        );
        const defaultSubmitLabel = submitLabel ? submitLabel.textContent.trim() : '';

        function syncHiddenFields() {
            if (submittedAtField) {
                submittedAtField.value = String(Date.now());
            }

            if (langField) {
                langField.value = getCurrentLang();
            }
        }

        function clearStatus() {
            if (statusHost) {
                statusHost.hidden = true;
            }

            if (statusElement) {
                statusElement.classList.remove('alert-success', 'alert-danger', 'alert-info', 'alert-warning');
                statusElement.setAttribute('role', 'status');
            }

            if (statusTitle) {
                statusTitle.textContent = '';
            }

            if (statusText) {
                statusText.textContent = '';
            }

            if (statusIcon) {
                statusIcon.className = 'ri-information-line';
            }
        }

        function clearFieldError(name) {
            const field = fieldMap.get(name);
            const error = errorMap.get(name);

            if (field) {
                field.classList.remove('input-error');
                field.setAttribute('aria-invalid', 'false');
            }

            if (error) {
                error.textContent = '';
                error.classList.add('hidden');
            }
        }

        function clearErrors() {
            fieldMap.forEach((_, name) => clearFieldError(name));
        }

        async function showStatus(code) {
            if (!statusHost || !statusElement || !statusTitle || !statusText || !statusIcon) {
                return;
            }

            const copy = await getFeedbackCopy(code);
            statusElement.classList.remove('alert-success', 'alert-danger', 'alert-info', 'alert-warning');
            statusElement.classList.add(`alert-${copy.variant}`);
            statusElement.setAttribute('role', copy.role);
            statusTitle.textContent = copy.title;
            statusText.textContent = copy.message;
            statusIcon.className = copy.icon;
            statusHost.hidden = false;

            if (copy.role === 'alert') {
                statusElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                statusElement.focus();
            }
        }

        async function applyErrors(errors) {
            const tasks = Object.entries(errors || {}).map(async ([name, code]) => {
                const field = fieldMap.get(name);
                const error = errorMap.get(name);
                const message = await getErrorCopy(code);

                if (field) {
                    field.classList.add('input-error');
                    field.setAttribute('aria-invalid', 'true');
                }

                if (error) {
                    error.textContent = message;
                    error.classList.remove('hidden');
                }
            });

            await Promise.all(tasks);
        }

        async function setSubmitting(isSubmitting) {
            if (!submitButton || !submitLabel) {
                return;
            }

            if (isSubmitting) {
                submitButton.disabled = true;
                submitButton.setAttribute('aria-disabled', 'true');
                submitButton.setAttribute('aria-busy', 'true');
                submitLabel.textContent = await getFormCopy('submitting', defaultSubmitLabel || 'Sending request...');
                return;
            }

            submitButton.disabled = false;
            submitButton.setAttribute('aria-disabled', 'false');
            submitButton.removeAttribute('aria-busy');
            submitLabel.textContent = await getFormCopy('submit', defaultSubmitLabel || 'Send Your Ticket');
        }

        async function submitForm(event) {
            event.preventDefault();
            clearStatus();
            clearErrors();
            syncHiddenFields();
            await setSubmitting(true);

            try {
                const response = await fetch(form.action || 'contact-submit.php', {
                    method: 'POST',
                    body: new FormData(form),
                    headers: {
                        Accept: 'application/json',
                    },
                });

                const payload = await response.json().catch(() => null);
                if (!payload || typeof payload !== 'object') {
                    throw new Error('Invalid contact response payload.');
                }

                if (payload.ok) {
                    form.reset();
                    clearErrors();
                    syncHiddenFields();
                    await showStatus(payload.message_code || 'submitted');
                    return;
                }

                if (payload.type === 'validation') {
                    await applyErrors(payload.errors || {});
                    await showStatus(payload.summary_code || 'validation_summary');
                    return;
                }

                await showStatus(payload.message_code || 'submit_failed');
            } catch (error) {
                console.error('Support contact submission failed:', error);
                await showStatus('submit_failed');
            } finally {
                await setSubmitting(false);
            }
        }

        function bindFieldReset(name, field) {
            const handler = () => {
                clearFieldError(name);
            };

            field.addEventListener('input', handler);
            field.addEventListener('change', handler);
        }

        function init() {
            if (form.dataset.contactFormBound === 'true') {
                return;
            }

            form.dataset.contactFormBound = 'true';
            syncHiddenFields();
            clearStatus();
            clearErrors();
            getSiteCopy();

            fieldMap.forEach((field, name) => bindFieldReset(name, field));
            form.addEventListener('submit', submitForm);
        }

        return { init };
    }

    function init() {
        const form = document.querySelector('[data-contact-form]');
        if (!form) {
            return;
        }

        createController(form).init();
    }

    window.SupportContactForm = { init };
})();
