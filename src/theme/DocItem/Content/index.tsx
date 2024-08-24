import React from 'react';
import Content from '@theme-original/DocItem/Content';
import type ContentType from '@theme/DocItem/Content';
import type { WrapperProps } from '@docusaurus/types';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import { observer } from 'mobx-react-lite';
import { useStore } from '@site/src/hooks/useStore';
type Props = WrapperProps<typeof ContentType>;

const ContentWrapper = observer((props: Props): JSX.Element => {
    const { frontMatter } = useDoc();
    const pageStore = useStore('pageStore');
    const pageId = (frontMatter as { page_id: string }).page_id;
    React.useEffect(() => {
        if (pageId) {
            pageStore.addIfNotPresent(pageId, true);
        }
        return () => {
            pageStore.setCurrentPageId(undefined);
        };
    }, [pageId]);
    return (
        <>
            <Content {...props} />
        </>
    );
});

export default ContentWrapper;
