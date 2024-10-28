import React from 'react';
import { useDocumentRoot } from '@tdev-hooks/useDocumentRoot';
import CmsText, { CmsTextMeta } from '@tdev-models/documents/CmsText';

interface CmsTextContextType {
    cmsText: string;
}

export const CmsTextContext = React.createContext<CmsTextContextType | undefined>(undefined);

export function useFirstCmsTextDocumentIfExists(id: string): CmsText | undefined {
    // Not using useFirstMainDocument() here because that would always supply a (dummy) document.
    const docRoot = useDocumentRoot(id, new CmsTextMeta({}), false);
    return docRoot?.firstMainDocument;
}
