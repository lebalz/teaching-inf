import React, { useState } from 'react';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import styles from './styles.module.scss';
import { rootStore } from '@site/src/stores/rootStore';
import Button from '../shared/Button';
import { mdiShieldLockOutline } from '@mdi/js';
import DocumentRoot from '@site/src/models/DocumentRoot';
import Loader from '@site/src/components/Loader';
import { observer } from 'mobx-react-lite';

interface Props {
    documentRootId: string;
}

const PermissionsPanel = observer(({ documentRootId }: Props) => {
    const [documentRoot, setDocumentRoot] = useState<DocumentRoot<any> | null>();

    const onOpen = async () => {
        setDocumentRoot(rootStore.documentRootStore.find(documentRootId));
    };

    return (
        <Popup
            trigger={<Button icon={mdiShieldLockOutline}></Button>}
            onOpen={onOpen}
            modal
            closeOnEscape
            closeOnDocumentClick
        >
            <div className={styles.popupContentContainer}>
                <h2>Permissions</h2>
                {!!documentRoot && (
                    <div>
                        <div>Root permission: {documentRoot.persistedAccess}</div>
                        <div>Shared access: {documentRoot.sharedAccess}</div>
                    </div>
                )}

                {!documentRoot && <Loader />}
            </div>
        </Popup>
    );
});

export default PermissionsPanel;
