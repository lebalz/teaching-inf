import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { useFirstRealMainDocument } from '@tdev-hooks/useFirstRealMainDocument';
import Loader from '@tdev-components/Loader';
import DynamicDocumentRoots, { MetaInit } from '@tdev-models/documents/DynamicDocumentRoots';
import { ModelMeta } from '@tdev-models/documents/DynamicDocumentRoot';
import PermissionsPanel from '@tdev-components/PermissionsPanel';
import { useDocumentRoot } from '@tdev-hooks/useDocumentRoot';
import { Access, DocumentType } from '@tdev-api/document';
import { useStore } from '@tdev-hooks/useStore';
import { v4 as uuidv4 } from 'uuid';
import DocumentRoot from '@tdev-models/DocumentRoot';
import Button from '@tdev-components/shared/Button';
import { mdiPlus, mdiPlusCircle, mdiPlusCircleOutline } from '@mdi/js';

interface Props extends MetaInit {
    dynamicDocumentRoots: DynamicDocumentRoots;
}

const ConfigureDocumentRoots = observer((props: Props) => {
    const { dynamicDocumentRoots } = props;
    const userStore = useStore('userStore');
    const documentRootStore = useStore('documentRootStore');
    const user = userStore.current;
    if (!user || !user.isAdmin) {
        return null;
    }
    return (
        <div>
            <Button
                text="Neues Root Dokument"
                icon={mdiPlusCircleOutline}
                onClick={() => {
                    const newId = uuidv4();
                    dynamicDocumentRoots.addDynamicDocumentRoot(newId, 'Neues Root Dokument');
                }}
            />
        </div>
    );
});

export default ConfigureDocumentRoots;
