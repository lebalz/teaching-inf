/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import React from 'react';
import { $isDirectiveNode, NestedLexicalEditor, useMdastNodeUpdater } from '@mdxeditor/editor';
import { ContainerDirective } from 'mdast-util-directive';
import { BlockContent, Paragraph, PhrasingContent } from 'mdast';
import styles from './styles.module.scss';
import clsx from 'clsx';
import { mdiChevronDown } from '@mdi/js';
import Button from '@tdev-components/shared/Button';
import Popup from 'reactjs-popup';
import RemoveNode from '../../RemoveNode';
import { observer } from 'mobx-react-lite';
import AdmonitionTypeSelector from './AdmonitionTypeSelector';
import {
    $getSelection,
    $isElementNode,
    $isRangeSelection,
    COMMAND_PRIORITY_LOW,
    KEY_DOWN_COMMAND,
    LexicalEditor,
    LexicalNode
} from 'lexical';
import useSelectionHandler from './useSelectionHandler';

interface Props {
    mdastNode: ContainerDirective;
    parentEditor: LexicalEditor;
    lexicalNode: LexicalNode;
}

const HandledKeys = new Set(['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Backspace']);
const AdmonitionBody = observer((props: Props) => {
    const { mdastNode, lexicalNode, parentEditor } = props;
    useSelectionHandler(parentEditor, lexicalNode.getKey(), 'body');
    return (
        <NestedLexicalEditor<ContainerDirective>
            block
            contentEditableProps={{
                className: styles.body
            }}
            getContent={(node) => {
                const content = node.children.filter(
                    (n) => !(n.data as undefined | { directiveLabel?: boolean })?.directiveLabel
                );
                return content;
            }}
            getUpdatedMdastNode={(mdastNode, children) => {
                const label = mdastNode.children.filter(
                    (n) => (n.data as undefined | { directiveLabel?: boolean })?.directiveLabel
                );
                const composed = [...label, ...children] as BlockContent[];
                return { ...mdastNode, children: composed };
            }}
        />
    );
});

export default AdmonitionBody;
