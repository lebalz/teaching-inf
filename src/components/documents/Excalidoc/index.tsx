import React from 'react';
import { observer } from 'mobx-react-lite';
import styles from './styles.module.scss';
import { MetaInit, ModelMeta } from '@site/src/models/documents/Excalidoc';
import Loader from '@tdev-components/Loader';
import { useExcalidraw } from '@tdev-hooks/useExcalidraw';
import { useFirstRealMainDocument } from '@tdev-hooks/useFirstRealMainDocument';
import _ from 'lodash';
import Preview from './Preview';
import Editor from './Editor';
import SyncStatus from '@tdev-components/SyncStatus';
import { mdiCircleEditOutline, mdiClose, mdiLoading } from '@mdi/js';
import clsx from 'clsx';
import Button from '@tdev-components/shared/Button';
import { LibraryItems } from '@excalidraw/excalidraw/types/types';
import Image from './Preview/Image';
import PermissionsPanel from '@tdev-components/PermissionsPanel';
import { useDocument } from '@tdev-hooks/useDocument';
import { DocumentType } from '@tdev-api/document';

export const DEFAULT_HEIGHT = '600px' as const;

interface ExcaliProps {
    id: string;
    height?: string;
    allowImageInsertion?: boolean;
    libraryItems?: LibraryItems;
    useExcalidrawViewer?: boolean;
}
export interface Props extends MetaInit, ExcaliProps {}

const Excalidoc = observer((props: Props) => {
    const [meta] = React.useState(new ModelMeta(props));
    const doc = useFirstRealMainDocument(props.id, meta);

    if (!doc) {
        return <Loader />;
    }
    if (!doc.canDisplay) {
        return (
            <div>
                <PermissionsPanel documentRootId={props.id} />
                <Image />
            </div>
        );
    }
    return <ExcalidocComponent {...props} documentId={doc.id} />;
});

export const ExcalidocComponent = observer((props: Omit<ExcaliProps, 'id'> & { documentId: string }) => {
    const [edit, setEdit] = React.useState(false);
    const Lib = useExcalidraw();
    const doc = useDocument<DocumentType.Excalidoc>(props.documentId);

    if (!doc) {
        return <Loader />;
    }
    if (!Lib || (!edit && !props.useExcalidrawViewer)) {
        return (
            <div className={clsx('card', styles.excalidraw, styles.preview)}>
                <div className={clsx(styles.actions)}>
                    <SyncStatus model={doc} />
                    <PermissionsPanel documentRootId={doc.documentRootId} />
                    <Button
                        icon={Lib ? mdiCircleEditOutline : mdiLoading}
                        spin={!Lib}
                        onClick={() => setEdit(true)}
                        color="orange"
                        className={clsx(styles.edit)}
                        disabled={!Lib}
                    />
                </div>
                <Preview documentId={doc.id} />
            </div>
        );
    }
    return (
        <div
            style={{ height: props.height || DEFAULT_HEIGHT, width: '100%' }}
            className={clsx(styles.excalidraw)}
        >
            <div className={styles.actions}>
                <SyncStatus model={doc} />
                <PermissionsPanel documentRootId={doc.documentRootId} />
                {props.useExcalidrawViewer && !edit && (
                    <Button
                        icon={Lib ? mdiCircleEditOutline : mdiLoading}
                        spin={!Lib}
                        onClick={() => setEdit(true)}
                        color="orange"
                        className={clsx(styles.edit)}
                        disabled={!Lib}
                    />
                )}
                {edit && (
                    <Button
                        onClick={() => {
                            setEdit(false);
                        }}
                        icon={mdiClose}
                        color="red"
                        title="Bearbeitung beenden"
                    />
                )}
            </div>
            <Editor
                Lib={Lib}
                documentId={doc.id}
                libraryItems={props.libraryItems}
                allowImageInsertion={props.allowImageInsertion}
                readonly={!edit}
            />
        </div>
    );
});

export default Excalidoc;
