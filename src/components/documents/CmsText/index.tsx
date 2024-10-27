import { observer } from 'mobx-react-lite';
import { useDocumentRoot } from '@tdev-hooks/useDocumentRoot';
import { CmsTextMeta } from '@tdev-models/documents/CmsText';
import { CmsTextContext } from '@tdev-components/documents/CmsText/shared';
import React from 'react';

interface Props {
    id?: string;
}

const CmsText = observer((props: Props) => {
    const context = React.useContext(CmsTextContext);

    if (!(context || props.id) || (context && props.id)) {
        throw new Error('Either provide an id property or use inside <WithCmsText> (but not both)');
    }

    let cmsText: string;
    if (context) {
        cmsText = context.cmsText;
    } else {
        const docRoot = useDocumentRoot(props.id, new CmsTextMeta({}), false);
        return docRoot?.firstMainDocument?.text;
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
