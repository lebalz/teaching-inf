import type { Plugin, Transformer } from 'unified';
import { Paragraph, Root } from 'mdast';
import { ContainerDirective } from 'mdast-util-directive';
import { MdxJsxFlowElement } from 'mdast-util-mdx';

interface PluginOptions {
    tagNames?: {
        definition?: string;
    };
}

const plugin: Plugin<PluginOptions[], Root> = function plugin(this, optionsInput = {}): Transformer<Root> {
    const TAG_NAME = optionsInput?.tagNames?.definition || 'def';
    return async (root) => {
        const { visit } = await import('unist-util-visit');
        visit(root, (node, idx, parent) => {
            if (!parent) {
                return;
            }
            if (
                node.type !== 'containerDirective' ||
                (node as unknown as ContainerDirective).name !== TAG_NAME ||
                idx === undefined
            ) {
                return;
            }
            const directive = node as unknown as ContainerDirective;
            const heading = (
                directive.children.find((c) => c.type === 'paragraph' && c.data?.directiveLabel) as Paragraph
            )?.children;
            const content = directive.children.slice(heading ? 1 : 0);
            const depth = Math.max(Math.min(Number(directive.attributes!.h) || 3, 6), 1) as
                | 1
                | 2
                | 3
                | 4
                | 5
                | 6;
            const defbox: MdxJsxFlowElement = {
                type: 'mdxJsxFlowElement',
                name: 'DefBox',
                attributes: [],
                children: [
                    {
                        type: 'mdxJsxFlowElement',
                        name: 'DefHeading',
                        attributes: [],
                        children: [
                            {
                                type: 'heading',
                                depth: depth,
                                children: heading || [{ type: 'text', value: 'Definition' }]
                            }
                        ]
                    },
                    {
                        type: 'mdxJsxFlowElement',
                        name: 'DefContent',
                        attributes: [],
                        children: content
                    }
                ]
            };
            parent.children.splice(idx, 1, defbox);
        });
    };
};

export default plugin;
