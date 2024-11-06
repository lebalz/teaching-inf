import { DocumentType } from '@tdev-api/document';
import { TypeMeta } from '@tdev-models/DocumentRoot';
import { useStore } from '@tdev-hooks/useStore';
import { useFirstMainDocument } from './useFirstMainDocument';

export const DUMMY_DOCUMENT_ID = 'dummy' as const;

/**
 * Bridge the time until the first main document is loaded with a dummy document.
 */
export enum BridgeWithDummy {
    Always = 'always',
    Never = 'never',
    WithoutUser = 'without_user' /* when no user is logged in */
}

/**
 * This hook provides access to the first main document of the rootDocument.
 * This is especially useful, when the DocumentType is expected to have only
 * one main document - like a TaskState.
 *
 * Note: This hook is a wrapper around useFirstMainDocument but does not return a dummy document
 *       or a document with a dummy root document when **a documentRootId was provided**.
 */
export const useFirstRealMainDocument = <Type extends DocumentType>(
    documentRootId: string | undefined,
    meta: TypeMeta<Type>,
    createDocument: boolean = true
) => {
    const sessionStore = useStore('sessionStore');
    const mainDoc = useFirstMainDocument(documentRootId, meta, createDocument);
    if (
        !!documentRootId &&
        sessionStore.isLoggedIn &&
        (mainDoc.authorId === DUMMY_DOCUMENT_ID || mainDoc.root?.isDummy)
    ) {
        return;
    }
    return mainDoc;
};
