/**
 * By Mdx Editor, @url https://github.com/mdx-editor/editor/tree/main/src/plugins/image
 */

import {
    addExportVisitor$,
    addImportVisitor$,
    addLexicalNode$,
    createRootEditorSubscription$,
    realmPlugin
} from '@mdxeditor/editor';
import {
    $getSelection,
    $isRangeSelection,
    createCommand,
    KEY_DOWN_COMMAND,
    KEY_ARROW_RIGHT_COMMAND,
    LexicalCommand,
    LexicalEditor,
    COMMAND_PRIORITY_EDITOR,
    RangeSelection,
    KEY_ARROW_DOWN_COMMAND,
    KEY_ARROW_LEFT_COMMAND,
    KEY_ARROW_UP_COMMAND
} from 'lexical';
import { MdastBoxVisitor } from './MdastBoxVisitor';
import { $createBoxNode, $isBoxNode, BoxNode } from './BoxNode';
import { BoxVisitor } from './LexicalBoxVisitor';
import { $getNextSiblingOrParentSibling } from '@lexical/utils';
// import { LexicalBoxVisitor } from './LexicalBoxVisitor';

export const FORMAT_BOXED = 512 as const;
export const FORMAT_BOX_COMMAND: LexicalCommand<void> = createCommand('FORMAT_BOX');

/**
 * A plugin that adds support for images.
 * @group Image
 */
export const strongPlugin = realmPlugin<{}>({
    init(realm, params) {
        realm.pubIn({
            [addImportVisitor$]: [MdastBoxVisitor],
            [addLexicalNode$]: BoxNode,
            [addExportVisitor$]: [BoxVisitor],
            [createRootEditorSubscription$]: [
                (editor: LexicalEditor) => {
                    return editor.registerCommand<KeyboardEvent>(
                        KEY_ARROW_RIGHT_COMMAND,
                        (event) => {
                            const selection = $getSelection() as RangeSelection | undefined;
                            if (!selection || !$isRangeSelection(selection) || !selection.isCollapsed()) {
                                return false;
                            }
                            const focusNode = selection.getNodes()[0];
                            const distance2End = focusNode.getTextContentSize() - selection.focus.offset;
                            if (distance2End < 2) {
                                const nextSibling = $getNextSiblingOrParentSibling(focusNode)?.[0];
                                if (nextSibling && $isBoxNode(nextSibling)) {
                                    // dispatch "arrow down" event
                                    editor.dispatchCommand(KEY_ARROW_DOWN_COMMAND, {} as any);
                                    return true;
                                }
                            }
                            return false;
                        },
                        COMMAND_PRIORITY_EDITOR
                    );
                },
                (editor: LexicalEditor) => {
                    return editor.registerCommand<KeyboardEvent>(
                        KEY_ARROW_LEFT_COMMAND,
                        (event) => {
                            const selection = $getSelection() as RangeSelection | undefined;
                            if (!selection || !$isRangeSelection(selection) || !selection.isCollapsed()) {
                                return false;
                            }
                            const focusNode = selection.getNodes()[0];
                            const distance2Start = selection.focus.offset;
                            if (distance2Start < 1) {
                                const previous = focusNode.getPreviousSibling();
                                if (previous && $isBoxNode(previous)) {
                                    // dispatch "arrow down" event
                                    editor.dispatchCommand(KEY_ARROW_UP_COMMAND, {} as any);
                                    return true;
                                }
                            }
                            return false;
                        },
                        COMMAND_PRIORITY_EDITOR
                    );
                }
            ]
        });
    }
});
