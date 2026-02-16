import React from 'react';
import { useClientLib } from '@tdev-hooks/useClientLib';
import type { Delta } from 'quill';

const useQuillHtmlSource = (delta: Delta | string | null | undefined): string => {
    const Quill = useClientLib(() => import('quill'), 'quill');
    const [html, setHtml] = React.useState<string>('');

    // Parse delta if it's a string
    const deltaObj = React.useMemo(() => {
        if (!delta) {
            return null;
        }
        if (typeof delta === 'string') {
            try {
                return JSON.parse(delta);
            } catch {
                return null;
            }
        }
        return delta as Delta;
    }, [delta]);

    React.useEffect(() => {
        if (!deltaObj || !Quill) {
            setHtml('');
            return;
        }

        // Off-DOM Quill instance for HTML generation
        const container = document.createElement('div');
        const quill = new Quill.default(container);
        quill.setContents(deltaObj);

        // Extract the HTML from the generated editor content
        setHtml(container.querySelector('.ql-editor')?.innerHTML ?? '');
        quill.disable();
        // No need to attach container to the document
    }, [deltaObj, Quill]);

    return html;
};

export default useQuillHtmlSource;
