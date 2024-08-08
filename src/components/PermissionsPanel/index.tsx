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
import { Access } from '@site/src/api/document';

interface Props {
    documentRootId: string;
}

const PermissionsPanel = observer(({ documentRootId }: Props) => {
    const [documentRoot, setDocumentRoot] = useState<DocumentRoot<any> | null>();

    const onOpen = async () => {
        setDocumentRoot(rootStore.documentRootStore.find(documentRootId));
    };

    function createAccessRadioButton(
        targetAccess: Access,
        currentAccess: Access,
        group: string,
        onChange: (value: Access) => void
    ) {
        const id = `${group}-${targetAccess}`;
        return (
            <div>
                <input
                    type="radio"
                    id={id}
                    name={group}
                    value={targetAccess}
                    checked={targetAccess === currentAccess}
                    onChange={(e) => onChange(e.target.value as Access)}
                />
                <label htmlFor={id}>{targetAccess}</label>
            </div>
        );
    }

    function saveRootAccess(access: Access) {
        if (!documentRoot) {
            return;
        }
        documentRoot.rootAccess = access;
        documentRoot.save();
    }

    return (
        <>
            {rootStore.userStore.current?.isAdmin && (
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
                                <div className={styles.radioGroup}>
                                    <b className={styles.radioGroupTitle}>Root access:</b>
                                    {createAccessRadioButton(
                                        Access.RW,
                                        documentRoot.rootAccess,
                                        'rootAccess',
                                        (newAccess) => saveRootAccess(newAccess)
                                    )}
                                    {createAccessRadioButton(
                                        Access.RO,
                                        documentRoot.rootAccess,
                                        'rootAccess',
                                        (newAccess) => saveRootAccess(newAccess)
                                    )}
                                    {createAccessRadioButton(
                                        Access.None,
                                        documentRoot.rootAccess,
                                        'rootAccess',
                                        (newAccess) => saveRootAccess(newAccess)
                                    )}
                                </div>
                            </div>
                        )}

                        {!documentRoot && <Loader />}
                    </div>
                </Popup>
            )}
        </>
    );
});

export default PermissionsPanel;
