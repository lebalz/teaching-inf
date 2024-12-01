import { observer } from 'mobx-react-lite';
import { CmsTextContext, useFirstCmsTextDocumentIfExists } from '@tdev-components/documents/CmsText/shared';
import React from 'react';
import CmsActions from './CmsActions';

export interface Props {
    id?: string;
    showActions?: boolean;
    hideImportButton?: boolean;
    name?: string;
}

const CmsText = observer(({ id, name, showActions }: Props) => {
    const contextId = name ? React.useContext(CmsTextContext)?.entries[name] : undefined;
    const rootId = id || contextId;
    const cmsText = useFirstCmsTextDocumentIfExists(rootId);
    if (!cmsText || !cmsText.canDisplay) {
        return showActions && rootId ? <CmsActions rootId={rootId} /> : null;
    }

    return (
        <>
            {showActions && rootId && <CmsActions rootId={rootId} />}
            {cmsText.text}
        </>
    );
});

export default CmsText;
