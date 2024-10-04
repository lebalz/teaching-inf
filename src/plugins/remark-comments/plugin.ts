import type { Transformer } from 'unified';
import { Node, Parent } from 'unist';
import type { MdxJsxFlowElement, MdxJsxTextElement } from 'mdast-util-mdx';

const COMMENTABLE_BLOCK_TYPES = new Set([
    'paragraph',
    'blockquote',
    'heading',
    'code',
    'list',
    'thematicBreak',
    'html',
    'jsx'
]);

export interface PluginOptions {
    commentable?: string[];
}

/**
 * A remark plugin that adds a `<MdxComment /> elements after each block-element
 * This is useful to support comments within mdx documents.
 * A `page_id` in the frontmatter is required to generate the comments.
 */
const plugin = function plugin(options: PluginOptions): Transformer {
    return async (root, file) => {
        const { visit } = await import('unist-util-visit');
        const commentableNodes = new Set(options?.commentable || COMMENTABLE_BLOCK_TYPES);
        let nodeNr = 0;
        const typeNrMap = new Map<string, number>();

        visit(root, (node, index, parent: Node | undefined) => {
            const idx = index as number;
            // Check if the node is block level
            if (commentableNodes.has(node.type)) {
                // Check if parent is defined and if it's not a block element adding current node
                if (parent && !commentableNodes.has(parent.type)) {
                    nodeNr++;
                    if (!typeNrMap.has(node.type)) {
                        typeNrMap.set(node.type, 0);
                    }
                    const typeNr = (typeNrMap.get(node.type) as number) + 1;
                    typeNrMap.set(node.type, typeNr);
                    const newNode: MdxJsxFlowElement = {
                        type: 'mdxJsxFlowElement',
                        name: 'MdxComment',
                        attributes: [
                            {
                                type: 'mdxJsxAttribute',
                                name: 'nr',
                                value: {
                                    type: 'mdxJsxAttributeValueExpression',
                                    value: `${typeNr}`,
                                    data: {
                                        estree: {
                                            type: 'Program',
                                            body: [
                                                {
                                                    type: 'ExpressionStatement',
                                                    expression: {
                                                        type: 'Literal',
                                                        value: typeNr,
                                                        raw: `${typeNr}`
                                                    }
                                                }
                                            ],
                                            sourceType: 'module',
                                            comments: []
                                        }
                                    }
                                }
                            },
                            {
                                type: 'mdxJsxAttribute',
                                name: 'nodeNr',
                                value: {
                                    type: 'mdxJsxAttributeValueExpression',
                                    value: `${nodeNr}`,
                                    data: {
                                        estree: {
                                            type: 'Program',
                                            body: [
                                                {
                                                    type: 'ExpressionStatement',
                                                    expression: {
                                                        type: 'Literal',
                                                        value: nodeNr,
                                                        raw: `${nodeNr}`
                                                    }
                                                }
                                            ],
                                            sourceType: 'module',
                                            comments: []
                                        }
                                    }
                                }
                            },
                            {
                                type: 'mdxJsxAttribute',
                                name: 'type',
                                value: node.type
                            }
                        ],
                        children: [],
                        data: {}
                    };
                    (parent as Parent).children.splice(idx + 1, 0, newNode);
                }
            }
        });
    };
};

export default plugin;
