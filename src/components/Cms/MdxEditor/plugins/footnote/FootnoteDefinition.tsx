/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * @see https://github.com/facebook/lexical/blob/main/packages/lexical-link/src/index.ts
 *
 */

import type {
    BaseSelection,
    EditorConfig,
    LexicalCommand,
    LexicalNode,
    NodeKey,
    RangeSelection,
    SerializedElementNode
} from 'lexical';

import { $findMatchingParent } from '@lexical/utils';
import {
    $applyNodeReplacement,
    $getSelection,
    $isElementNode,
    $isRangeSelection,
    createCommand,
    ElementNode,
    Spread
} from 'lexical';
import { $getAncestor } from '@tdev-components/Cms/MdxEditor/helpers/lexical/get-ancestors';
import { $withSelectedNodes } from '@tdev-components/Cms/MdxEditor/helpers/lexical/with-selected-nodes';
import { FootnoteNode } from './Footnote';
import styles from './styles.module.scss';

export type SerializedDefinitionNode = Spread<{}, SerializedElementNode>;

type DefinitionHTMLElementType = HTMLElement | HTMLDivElement;

/** @noInheritDoc */
export class FootnoteDefinitionNode extends FootnoteNode {
    static getType(): string {
        return 'footnoteDefinition';
    }

    static clone(node: FootnoteDefinitionNode): FootnoteDefinitionNode {
        return new FootnoteDefinitionNode(node.__identifier, node.__key);
    }

    constructor(id: string, key?: NodeKey) {
        super(id, key);
    }

    createDOM(config: EditorConfig): DefinitionHTMLElementType {
        const element = document.createElement('div');
        element.classList.add(styles.footnoteDefinition);
        return element;
    }

    canInsertTextAfter(): true {
        return true;
    }

    isInline(): boolean {
        return false;
    }
}

/**
 * Creates a DefinitionNode.
 * @returns The DefinitionNode.
 */
export function $createFootnoteDefinitionNode(id: string): FootnoteDefinitionNode {
    return $applyNodeReplacement(new FootnoteDefinitionNode(id));
}

/**
 * Determines if node is a DefinitionNode.
 * @param node - The node to be checked.
 * @returns true if node is a DefinitionNode, false otherwise.
 */
export function $isFootnoteDefinitioNode(
    node: LexicalNode | null | undefined
): node is FootnoteDefinitionNode {
    return node instanceof FootnoteDefinitionNode;
}
