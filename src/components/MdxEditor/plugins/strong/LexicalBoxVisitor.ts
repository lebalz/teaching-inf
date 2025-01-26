import { Strong } from 'mdast';
import { $isBoxNode, BoxNode } from './BoxNode';
import { LexicalExportVisitor } from '@mdxeditor/editor';

export const BoxVisitor: LexicalExportVisitor<BoxNode, Strong> = {
    testLexicalNode: $isBoxNode,
    visitLexicalNode({ actions, mdastParent, lexicalNode }) {
        console.log('lv', lexicalNode.getMdastNode());
        actions.appendToParent(mdastParent, lexicalNode.getMdastNode());
    }
};
