import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { useFirstRealMainDocument } from '@tdev-hooks/useFirstRealMainDocument';
import Loader from '@tdev-components/Loader';
import { MetaInit, ModelMeta } from '@tdev-models/documents/DynamicDocumentRoots';
import PermissionsPanel from '@tdev-components/PermissionsPanel';
import { useDocumentRoot } from '@tdev-hooks/useDocumentRoot';
import { Access, DocumentType } from '@tdev-api/document';
import { useStore } from '@tdev-hooks/useStore';

interface Props extends MetaInit {
    id: string;
}

const DynamicDocumentRoots = observer((props: Props) => {
    const [meta] = React.useState(new ModelMeta(props));
    const docRoot = useDocumentRoot(props.id, meta, false, {
        access: Access.RO_DocumentRoot,
        sharedAccess: Access.RO_DocumentRoot
    });
    const doc = useFirstRealMainDocument(props.id, meta, false);
    const userStore = useStore('userStore');
    const documentStore = useStore('documentStore');
    const user = userStore.current;
    React.useEffect(() => {
        if (docRoot && !doc && user?.isAdmin) {
            console.log('DynamicDocumentRoots', !!docRoot, !doc, user?.isAdmin);
            documentStore.create({
                documentRootId: docRoot.id,
                type: DocumentType.DynamicDocumentRoots,
                data: {
                    documentRoots: []
                }
            });
        }
    }, [docRoot, doc, user]);
    if (!docRoot) {
        return <Loader />;
    }
    if (!doc) {
        return (
            <div>
                {docRoot.id} - {docRoot.sharedAccess}
                <PermissionsPanel documentRootId={props.id} />
                <Loader />
            </div>
        );
    }
    return (
        <div>
            {docRoot.id}
            <br />
            {doc.id}
            <PermissionsPanel documentRootId={props.id} />
        </div>
    );
});

export default DynamicDocumentRoots;
