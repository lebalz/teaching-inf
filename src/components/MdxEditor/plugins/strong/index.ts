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
        // const editor = realm.getValue(rootEditor$);
        // editor?.registerNodeTransform(TextNode, (node) => {
        //     const format = node.getFormat();
        //     const element = editor.getElementByKey(node.getKey());

        //     if (element) {
        //         if (format & FORMAT_BOXED) {
        //             element.classList.add('box');
        //         } else {
        //             element.classList.remove('box');
        //         }
        //     }
        // });
        realm.pubIn({
            [addImportVisitor$]: [MdastBoxVisitor],
            [addLexicalNode$]: BoxNode,
            [addExportVisitor$]: [BoxVisitor]
            // [createRootEditorSubscription$]: (editor: LexicalEditor) => {
            //     return editor.registerCommand<KeyboardEvent>(
            //         FORMAT_BOX_COMMAND,
            //         (event) => {
            //             const selection = $getSelection();
            //             const children = selection?.getNodes();
            //             const node = $createBoxNode({type: 'strong', children: []});

            //             if (children) {
            //                 children.forEach((child) => {
            //                     node.append(child);
            //                 });
            //             }

            //             selection?.getNodes().forEach((node) => {
            //                 if ($isTextNode(node)) {
            //                     node.toggleFormat('bold');
            //                     // Add your custom box formatting logic here
            //                 }
            //             });

            //             return true;
            //         },
            //         COMMAND_PRIORITY_EDITOR
            //     );
            // }
        });
    }
});
