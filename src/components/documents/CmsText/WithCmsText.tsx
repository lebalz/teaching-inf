import { CmsTextContext, useFirstCmsTextDocumentIfExists } from '@tdev-components/documents/CmsText/shared';
import { observer } from 'mobx-react-lite';

interface Props {
    id: string;
    children?: React.ReactNode;
}

const WithCmsText = observer(({ id, children }: Props) => {
    const doc = useFirstCmsTextDocumentIfExists(id);

    return doc ? (
        <CmsTextContext.Provider value={{ cmsText: doc.text }}>{children}</CmsTextContext.Provider>
    ) : (
        <></>
    );
});

export default WithCmsText;
