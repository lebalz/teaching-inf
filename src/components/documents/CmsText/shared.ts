import React from 'react';

interface CmsTextContextType {
    cmsText: string;
}

export const CmsTextContext = React.createContext<CmsTextContextType | undefined>(undefined);
