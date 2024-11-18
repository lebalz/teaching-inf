import { observer } from 'mobx-react-lite';
import { CmsTextContext, useFirstCmsTextDocumentIfExists } from '@tdev-components/documents/CmsText/shared';
import React from 'react';
import CodeBlock, { Props as CodeBlockProps } from '@theme/CodeBlock';
import PermissionsPanel from '@tdev-components/PermissionsPanel';

interface Props {
    id?: string;
    name?: string;
    codeBlockProps?: CodeBlockProps;
}

const CmsCode = observer((props: Props) => {
    const contextId = props.name ? React.useContext(CmsTextContext)?.entries[props.name] : undefined;
    const cmsText = useFirstCmsTextDocumentIfExists(props.id || contextId)?.text;

    return cmsText ? (
        <>
            {props.id && <PermissionsPanel documentRootId={props.id} />}
            <CodeBlock {...(props.codeBlockProps || {})}>{cmsText}</CodeBlock>
        </>
    ) : (
        <></>
    );
});

export default CmsCode;
