import React, { type ReactNode } from 'react';
import { DocumentType, DocumentTypes, TypeModelMapping } from '@tdev-api/document';
import { observer } from 'mobx-react-lite';

export const DocContext = React.createContext<DocumentTypes | undefined>(undefined);
interface Props<T extends DocumentType> {
    document: TypeModelMapping[T];
    children: ReactNode;
}

const DocumentContext = observer(<T extends DocumentType>(props: Props<T>) => {
    return <DocContext.Provider value={props.document}>{props.children}</DocContext.Provider>;
});

export default DocumentContext;
