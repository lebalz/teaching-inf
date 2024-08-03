import { DocumentType } from '../api/document';
import { TypeMeta } from '../models/DocumentRoot';
import { useDocumentRoot } from './useDocumentRoot';

/**
 * This hook provides access to the first main document of the rootDocument.
 * This is especially useful, when the DocumentType is expected to have only
 * one main document - like a TaskState.
 */
export const useFirstMainDocument = <Type extends DocumentType>(
    documentRootId: string | undefined,
    meta: TypeMeta<Type>
) => {
    const documentRoot = useDocumentRoot(documentRootId, meta);
    return documentRoot?.firstMainDocument;
};
