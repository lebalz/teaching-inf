import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { InlineMath as MdastNodeInlineMath } from 'mdast-util-math';
import { InlineMath as KatexInline } from 'react-katex';

interface Props {
    mdastNode: MdastNodeInlineMath;
}

const InlineMathEditor = (props: Props) => {
    const { mdastNode } = props;
    console.log(mdastNode, mdastNode.value);
    return (
        <span className={clsx(styles.inlineMath)}>
            <KatexInline>{mdastNode.value}</KatexInline>
        </span>
    );
};

export default InlineMathEditor;
