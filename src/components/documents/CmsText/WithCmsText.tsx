import { CmsTextContext } from '@tdev-components/documents/CmsText/shared';
import { useDocumentRoot } from '@tdev-hooks/useDocumentRoot';
import { CmsTextMeta } from '@tdev-models/documents/CmsText';

interface Props {
    id: string;
    children?: React.ReactNode;
}

const WithCmsText = ({id, children}: Props) => {

    // Not using useFirstMainDocument() here because that would always supply a (dummy) document.
    // TODO: Factor-out this use case?
    const docRoot = useDocumentRoot(id, new CmsTextMeta({}), false);
    const doc = docRoot?.firstMainDocument;

    return (
        doc
            ? <CmsTextContext.Provider value={{cmsText: doc.text}}>{children}</CmsTextContext.Provider>
            : <></>
    )
};

export default WithCmsText;