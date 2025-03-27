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
    LexicalNode
} from 'lexical';
import { $isDirectiveNode } from '@mdxeditor/editor';

const GO_UP_KEYS = new Set(['ArrowUp', 'Backspace', 'ArrowLeft']);
const GO_DOWN_KEYS = new Set(['ArrowRight', 'ArrowDown']);
const HandledKeys = new Set([...GO_DOWN_KEYS, ...GO_UP_KEYS]);

const SKIP = { action: 'skip' } as const;
type Action =
    | typeof SKIP
    | { action: 'insertSpaceAfter'; node: LexicalNode }
    | { action: 'insertSpaceBefore'; node: LexicalNode }
    | { action: 'selectOrCreateNextParagraph' }
    | { action: 'selectOrCreatePreviousParagraph' };

const actionForNext = (
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

const actionForPrevious = (
    selectedNode: LexicalNode,
    selectionFocusOffset: number,
    eventKey: 'ArrowLeft' | 'ArrowUp' | 'Backspace'
): Action => {
    if (eventKey === 'Backspace') {
        return SKIP;
    }
    const parents = selectedNode.getParents();
    const top = parents[parents.length - 1];
    if (!$isElementNode(top)) {
        return SKIP;
    }
    if (eventKey === 'ArrowLeft') {
        const first = top.getFirstDescendant();
        if (!first || selectedNode.getKey() !== first.getKey()) {
            return SKIP;
        }
        if (selectionFocusOffset !== 0) {
            return SKIP;
        }
        if (!$isTextNode(first) || first.getFormat() > 0) {
            return {
                action: 'insertSpaceBefore',
                node: first
            };
        }
    } else if (eventKey === 'ArrowUp') {
        const first = top.getFirstChild();
        if (!first || (first.getKey() !== selectedNode.getKey() && !first.isParentOf(selectedNode))) {
            return SKIP;
        }
        const newlineIndex = first.getTextContent().lastIndexOf('\n');
        if (newlineIndex >= 0 && selectionFocusOffset > newlineIndex) {
            return SKIP;
        }
    }

    return {
        action: 'selectOrCreatePreviousParagraph'
    };
};

const needsFocusNext = (
    selectedNode: LexicalNode,
    selectionFocusOffset: number,
    eventKey: 'ArrowRight' | 'ArrowDown',
    testNode: (node: LexicalNode | null | undefined) => boolean
) => {
    const elementNode =
        $isElementNode(selectedNode) && !selectedNode.isInline() ? selectedNode : selectedNode.getParent();
    if (!elementNode) {
        return false;
    }
    const last = elementNode.getLastChild();

    if (eventKey === 'ArrowRight') {
        if (!last || selectedNode.getKey() !== last.getKey()) {
            return false;
        }
        const end = last.getTextContentSize();
        if (selectionFocusOffset !== end) {
            return false;
        }
    }
    const nextNode = elementNode?.getNextSibling();
    return testNode(nextNode);
};

const needsFocusPrevious = (
    selectedNode: LexicalNode,
    selectionFocusOffset: number,
    eventKey: 'ArrowLeft' | 'ArrowUp' | 'Backspace',
    testNode: (node: LexicalNode | null | undefined) => boolean
) => {
    const elementNode =
        $isElementNode(selectedNode) && !selectedNode.isInline() ? selectedNode : selectedNode.getParent();
    if (!elementNode) {
        return false;
    }
    const first = elementNode.getFirstDescendant();

    if (eventKey === 'ArrowLeft' || eventKey === 'Backspace') {
        if (!first || selectedNode.getKey() !== first.getKey()) {
            return false;
        }
        if (selectionFocusOffset !== 0) {
            return false;
        }
    }
    const nextNode = elementNode?.getPreviousSibling();
    return testNode(nextNode);
};

const selectEndOf = (div: HTMLDivElement | null) => {
    if (!div) {
        return;
    }
    const range = document.createRange();
    const selection = window.getSelection();

    // Set range to end of div
    range.selectNodeContents(div);
    range.collapse(false); // false = collapse to end

    // Apply the selection
    selection?.removeAllRanges();
    selection?.addRange(range);

    div.focus();
};

const useSelectionHandler = (
    editor: LexicalEditor,
    nodeKey: string,
    type: 'header' | 'body',
    ref: React.RefObject<HTMLDivElement | null>
) => {
    React.useEffect(() => {
        if (!ref.current) {
            return;
        }
        return editor.registerCommand<KeyboardEvent>(
            KEY_DOWN_COMMAND,
            (event, activeEditor) => {
                if (!HandledKeys.has(event.key)) {
                    return false;
                }
                if (
                    activeEditor.getRootElement() !== ref?.current &&
                    ((GO_DOWN_KEYS.has(event.key) && type !== 'header') ||
                        (GO_UP_KEYS.has(event.key) && type !== 'body'))
                ) {
                    return false;
                }
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
                switch (event.key) {
                    case 'ArrowRight':
                    case 'ArrowDown':
                        if (type === 'header') {
                            /** check wheter we need to be focused */
                            if (activeEditor !== editor) {
                                return false;
                            }
                            const needsF = needsFocusNext(
                                selectedNode,
                                selection.focus.offset,
                                event.key,
                                (n) => $isDirectiveNode(n) && n.getKey() === nodeKey
                            );
                            if (needsF) {
                                ref?.current?.focus();
                                handled = true;
                            }
                        } else {
                            /** potentially create new node below */
                            const action = actionForNext(selectedNode, selection.focus.offset, event.key);
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
                        if (type === 'body') {
                            /** check wheter we need to be focused */
                            if (activeEditor !== editor) {
                                return false;
                            }
                            const needsF = needsFocusPrevious(
                                selectedNode,
                                selection.focus.offset,
                                event.key,
                                (n) => $isDirectiveNode(n) && n.getKey() === nodeKey
                            );
                            if (needsF) {
                                if (ref.current) {
                                    selectEndOf(ref.current);
                                }
                                handled = true;
                            }
                        } else {
                            /** potentially create new node below */
                            const action = actionForPrevious(selectedNode, selection.focus.offset, event.key);
                            switch (action.action) {
                                case 'skip':
                                    return false;
                                case 'insertSpaceBefore':
                                    const text = $createTextNode(' ');
                                    action.node.insertBefore(text);
                                    text.selectStart();
                                    handled = true;
                                    break;
                                case 'selectOrCreatePreviousParagraph':
                                    editor.update(() => {
                                        const dirNode = $getNodeByKey(nodeKey);
                                        if (!dirNode) {
                                            return false;
                                        }
                                        const prev = dirNode.getPreviousSibling();
                                        if ($isParagraphNode(prev)) {
                                            return;
                                        } else {
                                            const newParagraph = $createParagraphNode();
                                            dirNode.insertBefore(newParagraph);
                                            newParagraph.select();
                                            handled = true;
                                        }
                                    });
                                    break;
                                default:
                                    return false;
                            }
                        }
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
