import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { useFirstRealMainDocument } from '@tdev-hooks/useFirstRealMainDocument';
import Loader from '@tdev-components/Loader';
import { MetaInit } from '@tdev-models/documents/DynamicDocumentRoots';
import PermissionsPanel from '@tdev-components/PermissionsPanel';
import { Access } from '@tdev-api/document';
import { useStore } from '@tdev-hooks/useStore';
import Button from '@tdev-components/shared/Button';
import { mdiCircleEditOutline, mdiCloseCircle, mdiLocationEnter, mdiTextBoxEdit, mdiTrashCan } from '@mdi/js';
import { useDocumentRoot } from '@tdev-hooks/useDocumentRoot';
import { ModelMeta } from '@tdev-models/documents/DynamicDocumentRoot';
import Link from '@docusaurus/Link';

interface Props extends MetaInit {
    id: string;
    dynamicRootsDocumentId: string;
}

const DynamicDocumentRoot = observer((props: Props) => {
    const documentStore = useStore('documentStore');
    const [meta] = React.useState(new ModelMeta({}, props.id, props.dynamicRootsDocumentId, documentStore));
    const [edit, setEdit] = React.useState(false);
    const docRoot = useDocumentRoot(props.id, meta, false, {
        access: Access.None_DocumentRoot,
        sharedAccess: Access.None_DocumentRoot
    });
    if (!docRoot || docRoot.isDummy) {
        return (
            <div>
                {props.id}
                <Loader />
            </div>
        );
    }
    return (
        <div className={clsx(styles.dynamicDocRoot)}>
            {edit ? (
                <input
                    type="text"
                    value={meta.name}
                    defaultValue="Dynamische Dokumentenwurzel"
                    onChange={(e) => {
                        meta.setName(e.target.value);
                    }}
                />
            ) : (
                <div className={clsx(styles.roomName)}>{meta.name}</div>
            )}
            <Button
                text="Zum Raum"
                color="blue"
                href={`/rooms/${docRoot.id}`}
                icon={mdiLocationEnter}
                iconSide="left"
            />

            <div className={clsx(styles.actions)}>
                {docRoot.hasRWAccess && (
                    <>
                        <Button
                            color={edit ? 'black' : 'orange'}
                            icon={edit ? mdiCloseCircle : mdiCircleEditOutline}
                            onClick={() => {
                                setEdit(!edit);
                            }}
                        />
                        <Button
                            color="red"
                            icon={mdiTrashCan}
                            onClick={() => {
                                meta.destroy();
                            }}
                        />
                    </>
                )}
                <PermissionsPanel documentRootId={docRoot.id} position={['top right', 'bottom right']} />
            </div>
        </div>
    );
});

export default DynamicDocumentRoot;
