import { observer } from 'mobx-react-lite';
import { CmsTextContext, useFirstCmsTextDocumentIfExists } from '@tdev-components/documents/CmsText/shared';
import React from 'react';

interface Props {
    id?: string;
}

const CmsText = observer(({ id }: Props) => {
    const context = React.useContext(CmsTextContext);

    let cmsText: string | undefined;

    if (context && !id) {
        cmsText = context.cmsText;
    } else if (!context && id) {
        cmsText = useFirstCmsTextDocumentIfExists(id)?.text;
    } else {
        throw new Error('Either provide an id property or use inside <WithCmsText> (but not both)');
    }

    return cmsText ? (
        <>
            <span>{cmsText}</span>
        </>
    ) : (
        <></>
    );
});

export default CmsText;
