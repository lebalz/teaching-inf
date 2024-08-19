import React, { useId } from 'react';
import { Access, DocumentType } from '../api/document';
import { rootStore } from '../stores/rootStore';
import DocumentRoot, { TypeMeta } from '../models/DocumentRoot';

/**
 * 1. create a dummy documentRoot with default (meta) data
 * 2. create a dummy document with default (meta) data
 * 2. when component mounts, check if the documentRoot is already in the store
 * 3. if not
 *  3.1. add the dummy document to the store
 *  3.2. add the dummy documentRoot to the store
 *  3.3. if an id was provided, load or create the documentRoot and it's documents from the api
 *  3.4. cleanup the dummy document
 */
export const useDocumentRoot = <Type extends DocumentType>(
    id: string | undefined,
    meta: TypeMeta<Type>,
    createFirstDocument: boolean = true
) => {
    const defaultRootDocId = useId();
    const [dummyDocumentRoot] = React.useState<DocumentRoot<Type>>(
        new DocumentRoot(
            { id: id || defaultRootDocId, access: Access.RW, sharedAccess: Access.None },
            meta,
            rootStore.documentRootStore,
            true
        )
    );

    /** initial load */
    React.useEffect(() => {
        const { documentRootStore } = rootStore;
        const rootDoc = documentRootStore.find(dummyDocumentRoot.id);
        if (rootDoc) {
            return;
        }
        if (createFirstDocument) {
            documentRootStore.addDocumentRoot(dummyDocumentRoot);
        }
        if (!id) {
            dummyDocumentRoot.setLoaded();
            return;
        }

        /**
         * load the documentRoot and it's documents from the api.
         */
        documentRootStore.loadInNextBatch(id, meta);
        return () => {
            rootStore.documentRootStore.removeFromStore(defaultRootDocId, false);
        };
    }, []);


    return rootStore.documentRootStore.find<Type>(dummyDocumentRoot.id) || dummyDocumentRoot;
};
