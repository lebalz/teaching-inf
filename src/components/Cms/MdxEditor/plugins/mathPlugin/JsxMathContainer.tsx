import { VoidEmitter } from '@mdxeditor/editor';
import type { EditorConfig, LexicalEditor } from 'lexical';
import { MathNode } from './MathNode';
import { InlineMath, Math } from 'mdast-util-math';
import { InlineMath as InlineMathComponent, BlockMath } from 'react-katex';

export function JsxMathContainer(props: {
    /** The Lexical editor that contains the node */
    parentEditor: LexicalEditor;
    /** The Lexical node that is being edited */
    lexicalJsxNode: MathNode;
    /** The MDAST node that is being edited */
    mdastNode: Math | InlineMath;
    config: EditorConfig;
    focusEmitter: VoidEmitter;
}) {
    const { mdastNode } = props;
    if (mdastNode.type === 'inlineMath') {
        return <InlineMathComponent>{mdastNode.value}</InlineMathComponent>;
    } else {
        return <BlockMath>{mdastNode.value}</BlockMath>;
    }
}
