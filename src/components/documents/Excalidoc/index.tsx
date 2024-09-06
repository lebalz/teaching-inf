import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { useFirstMainDocument } from '../../../hooks/useFirstMainDocument';
import Loader from '../../Loader';
import { MetaInit, ModelMeta } from '@site/src/models/documents/Excalidoc';
import { Excalidraw } from '@excalidraw/excalidraw';
import { useDocument } from '../useContextDocument';
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
        <div>
            <Excalidraw />
        </div>
    );
});

export default Excalidoc;
