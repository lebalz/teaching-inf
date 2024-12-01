import { CmsTextContext, useFirstCmsTextDocumentIfExists } from '@tdev-components/documents/CmsText/shared';
import { observer } from 'mobx-react-lite';
import CmsActions from './CmsActions';

export type Name = string & { __nameBrand: 'Name' };
export type DocumentRootId = string & { __nameBrand: 'DocumentRootId' };

export type CmsTextEntries = { [key: Name]: DocumentRootId };

interface Props {
    entries: CmsTextEntries;
    showActions?: boolean;
    children?: React.ReactNode;
}

const WithCmsText = observer((props: Props) => {
    const { entries, showActions, children } = props;
    const allDocumentsAvailable = Object.values(entries)
        .map((documentRootId) => !!useFirstCmsTextDocumentIfExists(documentRootId))
        .every(Boolean);

    return allDocumentsAvailable ? (
        <CmsTextContext.Provider value={{ entries }}>
            {showActions && <CmsActions entries={entries} />}
            {children}
        </CmsTextContext.Provider>
    ) : (
        <></>
    );
});

export default WithCmsText;
