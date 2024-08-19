import React, { useId } from 'react';
import { Access, DocumentType } from '../api/document';
import { TypeMeta } from '../models/DocumentRoot';
import { CreateDocumentModel } from '../stores/DocumentStore';
import { useDocumentRoot } from './useDocumentRoot';
import { rootStore } from '../stores/rootStore';

/**
 * This hook provides access to the first main document of the rootDocument.
 * This is especially useful, when the DocumentType is expected to have only
 * one main document - like a TaskState.
 */
export const useFirstMainDocument = <Type extends DocumentType>(
    documentRootId: string | undefined,
    meta: TypeMeta<Type>
) => {
    const defaultDocId = useId();
    const documentRoot = useDocumentRoot(documentRootId, meta);
    const [dummyDocument] = React.useState(
        CreateDocumentModel(
            {
                id: defaultDocId,
                type: meta.type,
                data: meta.defaultData,
                authorId: 'dummy',
                documentRootId: documentRoot.id,
                parentId: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            rootStore.documentStore
        )
    );
    React.useEffect(() => {
        if (documentRoot.isLoaded && !documentRoot.isDummy && !documentRoot.firstMainDocument) {
            if (documentRoot.permission === Access.RW && rootStore.userStore.current) {
                console.log('create first document', documentRoot.id, documentRoot.type);
                rootStore.documentStore.create({
                    documentRootId: documentRoot.id,
                    authorId: rootStore.userStore.current.id,
                    type: documentRoot.type,
                    data: meta.defaultData
                });
            }
        }
    }, [documentRoot, rootStore.userStore.current]);

    return documentRoot?.firstMainDocument || dummyDocument;
};
