import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { useStore } from '@tdev-hooks/useStore';
import CodeBlock, { type Props as CodeBlockProps } from '@theme/CodeBlock';
import { templateReplacer } from '../templateReplacer';

interface Props {
    children: React.ReactNode;
}

const TemplateCode = observer((props: Props) => {
    const pageStore = useStore('pageStore');
    const { current } = pageStore;
    if (!current) {
        return null;
    }
    // the default way of docusaurus to transform md code blocks to it's
    // CodeBlock Component...
    const childProps = (Array.isArray(props.children) ? props.children[0] : props.children)?.props?.children
        ?.props;

    const code = templateReplacer(childProps.children as string, pageStore.current?.dynamicValues);
    const metastring = templateReplacer(childProps.metastring as string, pageStore.current?.dynamicValues);

    return (
        <CodeBlock {...childProps} metastring={metastring}>
            {code}
        </CodeBlock>
    );
});

export default TemplateCode;
