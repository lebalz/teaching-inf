import React from 'react';
import { observer } from 'mobx-react-lite';
import DynamicDocumentRoots, { MetaInit } from '@tdev-models/documents/DynamicDocumentRoots';
import { useStore } from '@tdev-hooks/useStore';
import { v4 as uuidv4 } from 'uuid';
import Button from '@tdev-components/shared/Button';
import { mdiPlusCircleOutline } from '@mdi/js';

interface Props extends MetaInit {
    dynamicDocumentRoots: DynamicDocumentRoots;
}

const AddDynamicDocumentRoot = observer((props: Props) => {
    const { dynamicDocumentRoots } = props;
    const userStore = useStore('userStore');
    const user = userStore.current;
    if (!user || !user.isAdmin) {
        return null;
    }

    return (
        <div>
            <Button
                text="Neue Gruppe"
                title='Neue "Document Root" hinzufügen'
                icon={mdiPlusCircleOutline}
                iconSide="left"
                onClick={() => {
                    const newId = uuidv4();
                    dynamicDocumentRoots.addDynamicDocumentRoot(
                        newId,
                        `Neue Gruppe (${dynamicDocumentRoots._dynamicDocumentRoots.length + 1})`
                    );
                }}
            />
        </div>
    );
});

export default AddDynamicDocumentRoot;
