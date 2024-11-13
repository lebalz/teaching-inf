import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { useFirstRealMainDocument } from '@tdev-hooks/useFirstRealMainDocument';
import Loader from '@tdev-components/Loader';
import { MetaInit, ModelMeta } from '@tdev-models/documents/DynamicDocumentRoots';
import PermissionsPanel from '@tdev-components/PermissionsPanel';
import { Access } from '@tdev-api/document';
import { useStore } from '@tdev-hooks/useStore';
import AddDynamicDocumentRoot from './AddDynamicDocumentRoot';
import Button from '@tdev-components/shared/Button';
import { mdiTrashCan } from '@mdi/js';
import DynamicDocumentRoot from './DynamicDocumentRoot';

interface Props extends MetaInit {
    id: string;
    name?: string;
}

const DynamicDocumentRoots = observer((props: Props) => {
    const [meta] = React.useState(new ModelMeta(props));
    const userStore = useStore('userStore');
    const user = userStore.current;
    const doc = useFirstRealMainDocument(props.id, meta, user?.isAdmin, {
        access: Access.RO_DocumentRoot,
        sharedAccess: Access.RO_DocumentRoot
    });
    if (!doc) {
        return (
            <div>
                {props.id}
                <PermissionsPanel documentRootId={props.id} />
                <Loader />
            </div>
        );
    }
    return (
        <div className={clsx('card', styles.docRoots)}>
            <div className={clsx(styles.header, 'card__header')}>
                <h3>{props.name || 'Gruppe'}</h3>
                <PermissionsPanel documentRootId={props.id} position={['top right', 'bottom right']} />
            </div>
            <div className={clsx(styles.body, 'card__body')}>
                <div className={clsx(styles.actions)}>
                    <AddDynamicDocumentRoot dynamicDocumentRoots={doc} />
                </div>
                {doc._dynamicDocumentRoots.map((root) => {
                    return <DynamicDocumentRoot key={root.id} id={root.id} dynamicRootsDocumentId={doc.id} />;
                })}
            </div>
        </div>
    );
});

export default DynamicDocumentRoots;
