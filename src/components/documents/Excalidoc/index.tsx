import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { useFirstMainDocument } from '@tdev-hooks//useFirstMainDocument';
import Loader from '../../Loader';
import { MetaInit, ModelMeta } from '@site/src/models/documents/Excalidoc';
import { Excalidraw } from '@excalidraw/excalidraw';
import { useDocument } from '@tdev-hooks/useContextDocument';
import { DocumentType } from '@site/src/api/document';

export interface Props extends MetaInit {
    id: string;
}

const Excalidoc = observer((props: Props) => {
    const [meta] = React.useState(new ModelMeta(props));
    const doc = useFirstMainDocument(props.id, meta);
    if (!doc) {
        return <Loader />;
    }
    return (
        <div style={{ height: '600px', width: '100%' }}>
            <Excalidraw />
        </div>
    );
});

export default Excalidoc;
