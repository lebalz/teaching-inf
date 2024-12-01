import { observer } from 'mobx-react-lite';
import { CmsTextContext, useFirstCmsTextDocumentIfExists } from '@tdev-components/documents/CmsText/shared';
import React from 'react';
import CmsActions from './CmsActions';
import { CmsTextEntries } from './WithCmsText';

export interface Props {
    id?: string;
    showActions?: boolean;
    name?: string;
}

const CmsText = observer(({ id, name, showActions }: Props) => {
    const contextId = name ? React.useContext(CmsTextContext)?.entries[name] : undefined;
    const rootId = id || contextId;
    const cmsText = useFirstCmsTextDocumentIfExists(rootId);
    if (!cmsText || !cmsText.canDisplay) {
        return showActions && rootId ? <CmsActions entries={{ [rootId]: rootId } as CmsTextEntries} /> : null;
    }

    return (
        <>
            {showActions && rootId && <CmsActions entries={{ [rootId]: rootId } as CmsTextEntries} />}
            {cmsText.text}
        </>
    );
});

export default CmsText;
