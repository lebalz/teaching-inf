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
import { GO_DOWN_KEYS, GO_UP_KEYS, HandledKeys } from '../../helpers/lexical/selectAction';
import { actionForNext, needsToFocusNext } from '../../helpers/lexical/select-next-helpers';
import { actionForPrevious, needsToFocusPrevious } from '../../helpers/lexical/select-previous-helpers';
import { selectEndOfDiv } from '../../helpers/lexical/select-end-of-div';
import scheduleMicrotask from '@tdev-components/util/scheduleMicrotask';

const useSelectionHandler = (
    editor: LexicalEditor,
    nodeKey: string,
    type: 'header' | 'body',
    ref: React.RefObject<HTMLDivElement | null>
) => {
    const cleanupInsertedParagraph = React.useRef<() => void>(null);
    const lastKey = React.useRef<string>(null);
    React.useEffect(() => {
        if (!ref.current) {
            return;
        }
        return editor.registerCommand<KeyboardEvent>(
            KEY_DOWN_COMMAND,
            (event, activeEditor) => {
                if (!HandledKeys.has(event.key)) {
                    cleanupInsertedParagraph.current = null;
                    return false;
                }
                const last = lastKey.current;
                lastKey.current = event.key;
                if (cleanupInsertedParagraph.current && lastKey.current === event.key) {
                    console.log('cleanup');
                    scheduleMicrotask(() => {
                        cleanupInsertedParagraph.current?.();
                        cleanupInsertedParagraph.current = null;
                    });
                    event.preventDefault();
                    event.stopPropagation();
                    return true;
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
                            const needsF = needsToFocusNext(
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
                                            cleanupInsertedParagraph.current = () => {
                                                editor.update(() => {
                                                    newParagraph.remove();
                                                });
                                            };
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
                            const needsF = needsToFocusPrevious(
                                selectedNode,
                                selection.focus.offset,
                                event.key,
                                (n) => $isDirectiveNode(n) && n.getKey() === nodeKey
                            );
                            if (needsF) {
                                if (ref.current) {
                                    selectEndOfDiv(ref.current);
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
                                            cleanupInsertedParagraph.current = () => {
                                                editor.update(() => {
                                                    newParagraph.remove();
                                                });
                                            };
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
