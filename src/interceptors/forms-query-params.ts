import qs from 'qs';
import {format, parse} from 'url';

const FORMS_DOMAIN_RE = /forms\.yandex\./;
const FORM_PREFIX = 'form-';

export function prefillForms() {
    if (typeof window !== 'undefined') {
        /* Getting query params for the forms */

        const pageQuery = qs.parse(window.location.search, {ignoreQueryPrefix: true});

        const formPageQuery = Object.keys(pageQuery).reduce((acc, key) => {
            if (key.startsWith(FORM_PREFIX)) {
                const newKey = key.slice(FORM_PREFIX.length);
                acc = {...acc, [newKey]: pageQuery[key]};
            }

            return acc;
        }, {});

        if (!Object.keys(formPageQuery).length) {
            return;
        }

        /* Finding the forms  */

        const iframes = document.querySelectorAll('iframe');
        const forms: HTMLIFrameElement[] = [];

        for (let i = 0; i < iframes.length; i++) {
            const iframe = iframes[i];
            const src = iframe.getAttribute('src');

            if (src !== null && src.match(FORMS_DOMAIN_RE)) {
                forms.push(iframe);
            }
        }

        if (!forms.length) {
            return;
        }

        /* Setting a new src attribute for the forms using the passed query params */

        for (const form of forms) {
            const formSrc = form.getAttribute('src');

            if (formSrc === null) {
                continue;
            }

            const parsedFormSrc = parse(formSrc);

            if (parsedFormSrc.search === null) {
                continue;
            }

            const formQuery = qs.parse(parsedFormSrc.search, {ignoreQueryPrefix: true});
            const newFormQuery = qs.stringify(
                {...formQuery, ...formPageQuery},
                {addQueryPrefix: true, skipNulls: true},
            );
            const newFormSrc = format({...parsedFormSrc, search: newFormQuery});

            form.setAttribute('src', newFormSrc);
        }
    }
}
