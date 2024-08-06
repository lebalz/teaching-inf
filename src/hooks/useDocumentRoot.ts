import React, { useId } from 'react';
import { Access, Document, DocumentType } from '../api/document';
import { rootStore } from '../stores/rootStore';
import DocumentRoot, { TypeMeta } from '../models/DocumentRoot';

/**
 * 1. create a dummy documentRoot with default (meta) data
 * 2. when component mounts, check if the documentRoot is already in the store
 * 3. if not
 *  3.1. add the dummy documentRoot to the store
 *  3.2. when no documentRootId is provided (dummyDocumentRoot.id==defaultRootDocId), return early
 *  3.3. otherwise, load or create the documentRoot
 */
export const useDocumentRoot = <Type extends DocumentType>(id: string | undefined, meta: TypeMeta<Type>) => {
    const defaultRootDocId = useId();
    const defaultDocId = useId();
    const documentStore = rootStore.documentRootStore;
    const sessionStore = rootStore.sessionStore;
    const [dummyDocumentRoot] = React.useState<DocumentRoot<Type>>(
        new DocumentRoot(
            { id: id || defaultRootDocId, access: Access.RW, sharedAccess: Access.None },
            meta,
            documentStore,
            true
        )
    );

    /** initial load */
    React.useEffect(() => {
        if (!sessionStore.isLoggedIn) {
            return;
        }
        const rootDoc = documentStore.find(dummyDocumentRoot.id);
        if (rootDoc) {
            return;
        }
        if (dummyDocumentRoot.isDummy) {
            documentStore.addDocumentRoot(dummyDocumentRoot);
            /** add default document when there are no mainDocs */
            if (dummyDocumentRoot.mainDocuments.length === 0) {
                const now = new Date().toISOString();
                rootStore.documentStore.addToStore({
                    type: meta.type,
                    data: meta.defaultData,
                    authorId: rootStore.userStore.current?.id || '',
                    createdAt: now,
                    updatedAt: now,
                    documentRootId: dummyDocumentRoot.id,
                    id: defaultDocId,
                    parentId: null
                } satisfies Document<Type>);
            }
            if (dummyDocumentRoot.id === defaultRootDocId) {
                /** no according document in the backend can be expected - skip */
                return;
            }
        }

        /**
         * dont create dummy documents, ever
         */
        if (!id) {
            return;
        }

        /**
         * load the documentRoot and it's documents from the api.
         */
        documentStore
            .load(id, meta)
            .then((docRoot) => {
                if (!docRoot) {
                    return documentStore.create(id, meta, {}).then((docRoot) => {
                        return docRoot;
                    });
                }
                return docRoot;
            })
            .then((docRoot) => {
                if (docRoot) {
                    if (
                        docRoot.permission === Access.RW &&
                        rootStore.userStore.current &&
                        !docRoot.firstMainDocument
                    ) {
                        rootStore.documentStore.create({
                            documentRootId: docRoot.id,
                            authorId: rootStore.userStore.current.id,
                            type: docRoot.type,
                            data: meta.defaultData
                        });
                    }
                }
            })
            .catch((err) => {
                /**
                 * could land here, when two users try to create the same document root
                 * at the same time
                 */
                console.log('err loading', err);
            });
    }, [meta, id, sessionStore.isLoggedIn]);

    return documentStore.find<Type>(dummyDocumentRoot.id);
};
