import useIsBrowser from '@docusaurus/useIsBrowser';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import type { default as ExcalidocType, Props } from './Excalidoc';
import { useFirstMainDocument } from '@site/src/hooks/useFirstMainDocument';
import { default as ExcalidocModel, ModelMeta } from '@site/src/models/documents/Excalidoc';
import clsx from 'clsx';
import { DocContext } from '../DocumentContext';
import { ToolbarOptions } from '@site/src/models/documents/QuillV2/helpers/toolbar';

/**
 * Lazy load QuillV2 component - this is a workaround for SSR
 * Background: QuillV2 uses react-quilljs which uses Quill.js which uses window.document
 * which is not available in SSR
 *
 * --> dynamic import QuillV2 component when it's needed
 */

export const Excalidoc = observer((props: Props) => {
    const doc = useFirstMainDocument(props.id, new ModelMeta(props));
    return <ExcalidocComponent excaliDoc={doc} {...props} />;
});

type ExcaliProps = Props & {
    excaliDoc: ExcalidocModel;
    className?: string;
};

export const ExcalidocComponent = observer((props: ExcaliProps) => {
    const [excali, setExcalidoc] = React.useState<{ default: typeof ExcalidocType }>();
    const { excaliDoc } = props;
    React.useEffect(() => {
        import('./Excalidoc').then((quill) => {
            setExcalidoc(quill);
        });
    }, []);
    if (!useIsBrowser() || !excali || !excaliDoc) {
        return <div>{excaliDoc.id}</div>;
    }

    return (
        <DocContext.Provider value={excaliDoc}>
            <excali.default {...props} />
        </DocContext.Provider>
    );
});

export default Excalidoc;
