import React from 'react';
import {
    $createParagraphNode,
    $createTextNode,
    $getNodeByKey,
    $getSelection,
    $isElementNode,
    $isParagraphNode,
    $isRangeSelection,
    COMMAND_PRIORITY_LOW,
    KEY_DOWN_COMMAND,
    LexicalEditor,
    LexicalNode
} from 'lexical';
import { $isDirectiveNode } from '@mdxeditor/editor';

const GO_UP_KEYS = new Set(['ArrowUp', 'Backspace', 'ArrowLeft']);
const GO_DOWN_KEYS = new Set(['ArrowRight', 'ArrowDown']);
const HandledKeys = new Set([...GO_DOWN_KEYS, ...GO_UP_KEYS]);

const useSelectionHandler = (editor: LexicalEditor, nodeKey: string, type: 'header' | 'body') => {
    React.useEffect(() => {
        return editor.registerCommand<KeyboardEvent>(
            KEY_DOWN_COMMAND,
            (event, activeEditor) => {
                if (!HandledKeys.has(event.key)) {
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
                switch (event.key) {
                    case 'ArrowRight':
                    case 'ArrowDown':
                        if (type === 'header') {
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
                            if (nextNode.getKey() === nodeKey) {
                                console.log('header', selection.focus.offset, nextNode?.getKey(), nodeKey);
                                nextNode.select();
                                event.preventDefault();
                                event.stopPropagation();
                                return true;
                                // latest?.selectStart();
                            }
                            /** check wheter we need to be focused */
                        } else {
                            /** potentially create new node below */
                            const top = selectedNode.getTopLevelElement();
                            if (!$isElementNode(top)) {
                                return false;
                            }
                            const last = top.getLastDescendant();
                            if (!last || selectedNode.getKey() !== last.getKey()) {
                                return false;
                            }
                            if (event.key === 'ArrowRight') {
                                const end = last.getTextContentSize();
                                if (selection.focus.offset !== end) {
                                    return false;
                                }
                            }
                            let handled = false;
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
                            if (handled) {
                                event.preventDefault();
                                event.stopPropagation();
                                return true;
                            }

                            // const directive = $isDirectiveNode(elementNode)
                            //     ? elementNode
                            //     : elementNode.getParents().find($isDirectiveNode);
                            // console.log(directive);
                            // if (event.key === 'ArrowRight') {
                            //     if (!last || selectedNode.getKey() !== last.getKey()) {
                            //         return false;
                            //     }
                            //     const end = last.getTextContentSize();
                            //     const next = elementNode.getNextSibling();
                            //     if (selection.focus.offset === end && !next) {
                            //         console.log('insert a new one');
                            //         event.preventDefault();
                            //         event.stopPropagation();
                            //         return true;
                            //     }
                            // }
                        }
                        break;
                    case 'ArrowLeft':
                    case 'ArrowUp':
                    case 'Backspace':
                        return false;
                }
                return false;
            },
            COMMAND_PRIORITY_LOW
        );
    }, [editor, nodeKey, type]);
};

export default useSelectionHandler;
