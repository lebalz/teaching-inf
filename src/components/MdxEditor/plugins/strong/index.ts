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
import { $getSelection, $isRangeSelection, createCommand, LexicalCommand, LexicalEditor } from 'lexical';
import { MdastBoxVisitor } from './MdastBoxVisitor';
import { $createBoxNode, BoxNode } from './BoxNode';
import { BoxVisitor } from './LexicalBoxVisitor';
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
            [addExportVisitor$]: [BoxVisitor]
        });
    }
});
