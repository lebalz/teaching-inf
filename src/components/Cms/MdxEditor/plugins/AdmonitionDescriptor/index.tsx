/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import React from 'react';
import {
    $isDirectiveNode,
    activeEditor$,
    createActiveEditorSubscription$,
    createRootEditorSubscription$,
    DirectiveDescriptor,
    NestedLexicalEditor,
    realmPlugin,
    rootEditor$,
    useMdastNodeUpdater
} from '@mdxeditor/editor';
import { ContainerDirective } from 'mdast-util-directive';
import { BlockContent, Paragraph, PhrasingContent, RootContent } from 'mdast';
import styles from './styles.module.scss';
import clsx from 'clsx';
import Admonition from '@theme/Admonition';
import { mdiChevronDown } from '@mdi/js';
import Button from '@tdev-components/shared/Button';
import Popup from 'reactjs-popup';
import RemoveNode from '../../RemoveNode';
import { observer } from 'mobx-react-lite';
import AdmonitionTypeSelector from './AdmonitionTypeSelector';
import { ADMONITION_TYPES } from './AdmonitionTypeSelector/admonitionTypes';
import {
    $createParagraphNode,
    $createTextNode,
    $getRoot,
    $getSelection,
    $isElementNode,
    $isParagraphNode,
    $isRangeSelection,
    COMMAND_PRIORITY_LOW,
    KEY_DOWN_COMMAND,
    LexicalEditor
} from 'lexical';
import scheduleMicrotask from '@tdev-components/util/scheduleMicrotask';
import AdmonitionBody from './AdmonitionBody';
import AdmonitionHeader from './AdmonitionHeader';

/** @internal */
export type AdmonitionKind = (typeof ADMONITION_TYPES)[number];

/**
 * Pass this descriptor to the `directivesPlugin` `directiveDescriptors` parameter to enable {@link https://docusaurus.io/docs/markdown-features/admonitions | markdown admonitions}.
 *
 * @example
 * ```tsx
 * <MDXEditor
 *  plugins={[
 *   directivesPlugin({ directiveDescriptors: [ AdmonitionDirectiveDescriptor] }),
 *  ]} />
 * ```
 * @group Directive
 */
const HandledKeys = new Set(['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Backspace']);
export const AdmonitionDirectiveDescriptor: DirectiveDescriptor = {
    name: 'admonition',
    attributes: [],
    hasChildren: true,
    testNode(node) {
        return ADMONITION_TYPES.includes(node.name as AdmonitionKind);
    },
    Editor: observer(({ mdastNode, lexicalNode, parentEditor }) => {
        return (
            <Admonition
                type={mdastNode.name}
                className={clsx(styles.admonition)}
                title={
                    <AdmonitionHeader
                        mdastNode={mdastNode as ContainerDirective}
                        lexicalNode={lexicalNode}
                        parentEditor={parentEditor}
                    />
                }
            >
                <AdmonitionBody
                    mdastNode={mdastNode as ContainerDirective}
                    lexicalNode={lexicalNode}
                    parentEditor={parentEditor}
                />
            </Admonition>
        );
    })
};
