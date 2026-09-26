import quillCss from '!!raw-loader!quill/dist/quill.snow.css'; // webpack raw-loader example
import QuillV2 from '@tdev-models/documents/QuillV2';
import { observer } from 'mobx-react-lite';
import React from 'react';
import useQuillHtmlSource from './useQuillHtmlSource';

interface Props {
    doc: QuillV2;
}

const QuillRenderer = observer((props: Props) => {
    const { doc } = props;
    const hostRef = React.useRef<HTMLDivElement>(null);
    const html = useQuillHtmlSource(doc?.delta);

    React.useEffect(() => {
        const host = hostRef.current;
        if (!host) {
            return;
        }
        if (!host.shadowRoot) {
            host.attachShadow({ mode: 'open' });
        }
        const root = host.shadowRoot!;
        root.innerHTML = `
            <style>${quillCss}</style>
            <div class="ql-editor">${html}</div>
        `;
    }, [html]);

    return <div ref={hostRef} />;
});

export default QuillRenderer;
