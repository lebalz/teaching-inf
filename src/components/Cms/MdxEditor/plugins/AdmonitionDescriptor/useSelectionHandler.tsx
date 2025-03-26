import React from 'react';
import {
    $createParagraphNode,
    $createTextNode,
    $getNodeByKey,
    $getSelection,
    $isElementNode,
    $isParagraphNode,
    $isRangeSelection,
    $isTextNode,
    COMMAND_PRIORITY_LOW,
    KEY_DOWN_COMMAND,
    LexicalEditor,
    LexicalNode,
    TextNode
} from 'lexical';
import { $isDirectiveNode } from '@mdxeditor/editor';

const GO_UP_KEYS = new Set(['ArrowUp', 'Backspace', 'ArrowLeft']);
const GO_DOWN_KEYS = new Set(['ArrowRight', 'ArrowDown']);
const HandledKeys = new Set([...GO_DOWN_KEYS, ...GO_UP_KEYS]);

const SKIP = { action: 'skip' } as const;
type Action =
    | typeof SKIP
    | { action: 'insertSpaceAfter'; node: LexicalNode }
    | { action: 'selectOrCreateNextParagraph' };
const nextAction = (
    selectedNode: LexicalNode,
    selectionFocusOffset: number,
    eventKey: 'ArrowRight' | 'ArrowDown'
): Action => {
    const parents = selectedNode.getParents();
    const top = parents[parents.length - 1];
    if (!$isElementNode(top)) {
        return SKIP;
    }
    if (eventKey === 'ArrowRight') {
        const last = top.getLastDescendant();
        if (!last || selectedNode.getKey() !== last.getKey()) {
            return SKIP;
        }
        const end = last.getTextContentSize();
        if (selectionFocusOffset !== end) {
            return SKIP;
        }
        if (!$isTextNode(last) || last.getFormat() > 0) {
            return {
                action: 'insertSpaceAfter',
                node: last
            };
        }
    } else if (eventKey === 'ArrowDown') {
        const last = top.getLastChild();
        if (!last || (last.getKey() !== selectedNode.getKey() && !last.isParentOf(selectedNode))) {
            return SKIP;
        }
        const newlineIndex = last.getTextContent().lastIndexOf('\n');
        if (newlineIndex >= 0 && selectionFocusOffset <= newlineIndex) {
            return SKIP;
        }
    }

    return {
        action: 'selectOrCreateNextParagraph'
    };
};

const useSelectionHandler = (
    editor: LexicalEditor,
    nodeKey: string,
    type: 'header' | 'body',
    ref?: React.RefObject<HTMLDivElement | null>
) => {
    React.useEffect(() => {
        return editor.registerCommand<KeyboardEvent>(
            KEY_DOWN_COMMAND,
            (event, activeEditor) => {
                if (!HandledKeys.has(event.key)) {
                    return false;
                }
                if (activeEditor.getRootElement() !== ref?.current && type !== 'header') {
                    return false;
                }
                // const latest = node.getLatest();
                const selection = $getSelection();
                if (!$isRangeSelection(selection)) {
                    return false;
                }
                const nodes = selection.getNodes();
                if (nodes.length === 0) {
                    return false;
                }
                const selectedNode = GO_UP_KEYS.has(event.key) ? nodes[0] : nodes[nodes.length - 1];
                const elementNode =
                    $isElementNode(selectedNode) && !selectedNode.isInline()
                        ? selectedNode
                        : selectedNode.getParent();
                if (!elementNode) {
                    return false;
                }
                let handled = false;
                // console.log('handled');
                switch (event.key) {
                    case 'ArrowRight':
                    case 'ArrowDown':
                        if (type === 'header') {
                            /** check wheter we need to be focused */
                            if (activeEditor !== editor) {
                                return false;
                            }
                            const last = elementNode.getLastChild();
                            if (event.key === 'ArrowRight') {
                                if (!last || selectedNode.getKey() !== last.getKey()) {
                                    return false;
                                }
                                const end = last.getTextContentSize();
                                if (selection.focus.offset !== end) {
                                    return false;
                                }
                            }
                            const nextNode = elementNode?.getNextSibling();
                            if (!$isDirectiveNode(nextNode)) {
                                return false;
                            }
                            if (nextNode.getKey() === nodeKey && $isDirectiveNode(nextNode)) {
                                ref?.current?.focus();
                                handled = true;
                            }
                        } else {
                            /** potentially create new node below */
                            const action = nextAction(selectedNode, selection.focus.offset, event.key);
                            console.log('action', action);
                            switch (action.action) {
                                case 'skip':
                                    return false;
                                case 'insertSpaceAfter':
                                    const text = $createTextNode(' ');
                                    action.node.insertAfter(text);
                                    text.selectEnd();
                                    handled = true;
                                    break;
                                case 'selectOrCreateNextParagraph':
                                    editor.update(() => {
                                        const dirNode = $getNodeByKey(nodeKey);
                                        if (!dirNode) {
                                            return false;
                                        }
                                        const next = dirNode.getNextSibling();
                                        if (next && $isParagraphNode(next)) {
                                            next.select();
                                            handled = true;
                                        } else {
                                            const newParagraph = $createParagraphNode();
                                            const text = $createTextNode('');
                                            newParagraph.append(text);
                                            dirNode.insertAfter(newParagraph);
                                            text.select();
                                            handled = true;
                                        }
                                    });
                                    break;
                                default:
                                    return false;
                            }
                        }
                        break;
                    case 'ArrowLeft':
                    case 'ArrowUp':
                    case 'Backspace':
                        return false;
                }

                if (handled) {
                    event.preventDefault();
                    event.stopPropagation();
                    return true;
                }
                return false;
            },
            COMMAND_PRIORITY_LOW
        );
    }, [editor, nodeKey, type, ref]);
};

export default useSelectionHandler;
