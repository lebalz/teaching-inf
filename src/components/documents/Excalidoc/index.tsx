import React from 'react';
import { observer } from 'mobx-react-lite';
import { useFirstMainDocument } from '@tdev-hooks//useFirstMainDocument';
import { MetaInit, ModelMeta } from '@site/src/models/documents/Excalidoc';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Loader from '@tdev-components/Loader';
import { useExcalidraw } from '@tdev-hooks/useExcalidraw';

export interface Props extends MetaInit {
    id: string;
}

const Excalidoc = observer((props: Props) => {
    const [meta] = React.useState(new ModelMeta(props));
    const Excalidraw = useExcalidraw();
    const doc = useFirstMainDocument(props.id, meta);
    if (!doc || !Excalidraw) {
        return <Loader />;
    }
    return (
        <div style={{ height: '600px', width: '100%' }}>
            <Excalidraw />
        </div>
    );
});

export default Excalidoc;
