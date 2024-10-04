import React from 'react';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import { observer } from 'mobx-react-lite';
import { useStore } from '@tdev-hooks/useStore';
import { useDocumentRoot } from '@tdev-hooks/useDocumentRoot';
import { DocumentType } from '@tdev-api/document';
import { ModelMeta } from '@tdev-models/documents/MdxPage';

/**
 * This component is used to load the current page and its content.
 */
const MdxPage = observer(() => {
    const { frontMatter } = useDoc();
    const pageStore = useStore('pageStore');
    const userStore = useStore('userStore');
    const pageId = (frontMatter as { page_id: string }).page_id;
    useDocumentRoot(pageId, new ModelMeta({}), false);
    React.useEffect(() => {
        if (pageId) {
            pageStore.addIfNotPresent(pageId, true);
        }
        return () => {
            pageStore.setCurrentPageId(undefined);
        };
    }, [pageId]);
    React.useEffect(() => {
        const { current } = pageStore;
        if (current && userStore.viewedUserId) {
            current.loadLinkedDocumentRoots();
        }
    }, [pageStore.current, userStore.viewedUserId]);
    return null;
});

export default MdxPage;
