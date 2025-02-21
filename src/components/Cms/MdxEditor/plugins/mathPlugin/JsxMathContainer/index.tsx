import { VoidEmitter } from '@mdxeditor/editor';
import type { EditorConfig, LexicalEditor } from 'lexical';
import { MathNode } from '../MathNode';
import { InlineMath, Math } from 'mdast-util-math';
import { InlineMath as InlineMathComponent, BlockMath } from 'react-katex';
import { observable } from 'mobx';
import InlineMathEditor from './InlineEditor';

interface Props {
    /** The Lexical editor that contains the node */
    parentEditor: LexicalEditor;
    /** The Lexical node that is being edited */
    lexicalJsxNode: MathNode;
    /** The MDAST node that is being edited */
    mdastNode: Math | InlineMath;
    config: EditorConfig;
    focusEmitter: VoidEmitter;
}

const JsxMathContainer = (props: Props) => {
    const { mdastNode } = props;
    if (mdastNode.type === 'inlineMath') {
        return <InlineMathEditor mdastNode={mdastNode} />;
    } else {
        return <BlockMath>{mdastNode.value}</BlockMath>;
    }
};

export default JsxMathContainer;
