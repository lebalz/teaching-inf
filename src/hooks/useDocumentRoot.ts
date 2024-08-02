import React, { useId } from 'react';
import { Access, Document, DocumentType } from '../api/document';
import { rootStore } from '../stores/rootStore';
import { ApiState } from '../stores/iStore';
import DocumentRoot, { TypeMeta } from '../models/DocumentRoot';

export const useDocumentRoot = <Type extends DocumentType>(id: string | undefined, meta: TypeMeta<Type>) => {
    const defaultRootDocId = useId();
    const defaultDocId = useId();
    const store = rootStore.documentRootStore;
    const [dummyDocumentRoot] = React.useState<DocumentRoot<Type>>(
        new DocumentRoot({ id: id || defaultRootDocId, access: Access.RW }, meta, store, true)
    );

    /** initial load */
    React.useEffect(() => {
        const rootDoc = store.find(dummyDocumentRoot.id);
        if (rootDoc || store.apiStateFor(`load-${dummyDocumentRoot.id}`) === ApiState.LOADING) {
            return;
        }
        if (dummyDocumentRoot.isDummy) {
            store.addDocumentRoot(dummyDocumentRoot);
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
         * load the documentRoot and it's documents from the api.
         */
        store
            .load(id, meta)
            .then((docRoot) => {
                if (!docRoot) {
                    return store.create(id, meta, {}).then((docRoot) => {
                        return docRoot;
                    });
                }
                return docRoot;
            })
            .then((docRoot) => {
                if (docRoot) {
                    if (docRoot.mainDocuments.length === 0 && rootStore.userStore.current) {
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
                console.log('err loading', err);
            });
    }, [meta, id]);

    return store.find<Type>(dummyDocumentRoot.id);
};
