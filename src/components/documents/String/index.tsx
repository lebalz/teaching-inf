import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { useFirstMainDocument } from '../../../hooks/useFirstMainDocument';
import Loader from '../../Loader';
import { MetaInit, ModelMeta } from '@site/src/models/documents/String';

interface Props extends MetaInit {
    id: string;
}

const Component = observer((props: Props) => {
    const [meta] = React.useState(new ModelMeta(props));
    const doc = useFirstMainDocument(props.id, meta);
    if (!doc) {
        return <Loader />;
    }
    return (
        <input
            type="text"
            style={{ width: props.width }}
            spellCheck={false}
            onChange={(e) => {
                doc.setData({ text: e.target.value }, true);
            }}
            value={doc.text}
            placeholder={props.placeholder}
            disabled={props.readonly || !doc.canEdit}
        />
    );
});

export default Component;
