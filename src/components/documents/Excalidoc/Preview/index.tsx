import React from 'react';
import { observer } from 'mobx-react-lite';
import styles from './styles.module.scss';
import { ModelMeta } from '@site/src/models/documents/Excalidoc';
import _ from 'lodash';
import clsx from 'clsx';
import { useFirstRealMainDocument } from '@tdev-hooks/useFirstRealMainDocument';

export interface Props {
    id: string;
    meta: ModelMeta;
}

const Preview = observer((props: Props) => {
    const { meta } = props;
    const excalidoc = useFirstRealMainDocument(props.id, meta);
    if (!excalidoc) {
        return null;
    }
    return (
        <div className={clsx('card__image', styles.image)}>
            <img src={excalidoc.image} />
        </div>
    );
});

export default Preview;
