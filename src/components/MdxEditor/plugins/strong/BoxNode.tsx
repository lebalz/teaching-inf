import { NestedEditorsContext, VoidEmitter, voidEmitter } from '@mdxeditor/editor';
import {
    DecoratorNode,
    EditorConfig,
    LexicalEditor,
    LexicalNode,
    NodeKey,
    SerializedLexicalNode,
    Spread,
    TextNode
} from 'lexical';
import { Strong } from 'mdast';
import { JSX } from 'react';
import BoxEditor from './BoxEditor';

/**
 * A serialized representation of an {@link BoxNode}.
 * @group Directive
 */
export type SerializedBoxedNode = Spread<
    {
        mdastNode: Strong;
        type: 'boxed';
        version: 1;
    },
    SerializedLexicalNode
>;

export class BoxNode extends DecoratorNode<React.JSX.Element> {
    /** @internal */
    __mdastNode: Strong;

    __focusEmitter = voidEmitter();

    static getType(): string {
        return 'boxed';
    }

    static clone(node: BoxNode): BoxNode {
        return new BoxNode(structuredClone(node.__mdastNode), node.__key);
    }

    /** @internal */
    static importJSON(serializedNode: SerializedBoxedNode): BoxNode {
        return $createBoxNode(serializedNode.mdastNode);
    }

    /**
     * Constructs a new {@link BoxNode} with the specified MDAST directive node as the object to edit.
     */
    constructor(mdastNode: Strong, key?: NodeKey) {
        super(key);
        this.__mdastNode = {
            ...mdastNode,
            data: {
                ...(mdastNode.data || {}),
                hProperties: {
                    ...(mdastNode.data?.hProperties || {}),
                    class: 'boxed'
                }
            }
        };
    }

    /**
     * Returns the MDAST node that is being edited.
     */
    getMdastNode(): Strong {
        return this.__mdastNode;
    }

    /** @internal */
    exportJSON(): SerializedBoxedNode {
        return {
            mdastNode: structuredClone(this.__mdastNode),
            type: 'boxed',
            version: 1
        };
    }

    createDOM(): HTMLElement {
        return document.createElement('span');
    }

    updateDOM(): boolean {
        return false;
    }

    /**
     * Sets a new MDAST node to edit.
     */
    setMdastNode(mdastNode: Strong): void {
        this.getWritable().__mdastNode = {
            ...mdastNode,
            data: {
                ...(mdastNode.data || {}),
                hProperties: {
                    ...(mdastNode.data?.hProperties || {}),
                    class: 'boxed'
                }
            }
        };
    }

    /**
     * Focuses the direcitive editor.
     */
    select = () => {
        this.__focusEmitter.publish();
    };

    /** @internal */
    decorate(parentEditor: LexicalEditor, config: EditorConfig): JSX.Element {
        return (
            <BoxEditorContainer
                lexicalNode={this}
                mdastNode={this.getMdastNode()}
                parentEditor={parentEditor}
                config={config}
                focusEmitter={this.__focusEmitter}
            />
        );
    }

    /** @internal */
    isInline(): boolean {
        return this.__mdastNode.type === 'strong';
    }

    /** @internal */
    isKeyboardSelectable(): boolean {
        return true;
    }
}

const BoxEditorContainer: React.FC<{
    parentEditor: LexicalEditor;
    lexicalNode: BoxNode;
    mdastNode: Strong;
    config: EditorConfig;
    focusEmitter: VoidEmitter;
}> = (props) => {
    const { mdastNode } = props;
    return (
        <NestedEditorsContext.Provider value={props}>
            <BoxEditor />
        </NestedEditorsContext.Provider>
    );
};
/**
 * Creates an {@link BoxNode}. Use this instead of the constructor to follow the Lexical conventions.
 * @group Directive
 */
export function $createBoxNode(mdastNode: Strong, key?: NodeKey): BoxNode {
    return new BoxNode(mdastNode, key);
}

/**
 * Retruns true if the node is an {@link BoxNode}.
 * @group Directive
 */
export function $isBoxNode(node: LexicalNode | null | undefined): node is BoxNode {
    return node instanceof BoxNode;
}
