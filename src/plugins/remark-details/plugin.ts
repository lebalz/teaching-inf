import { visit } from 'unist-util-visit';
import type { Plugin, Transformer } from 'unified';
import type { Root } from 'mdast';
import type { MdxJsxAttribute, MdxJsxFlowElement } from 'mdast-util-mdx';

interface PluginOptions {
    tagNames?: {
        details?: string;
        summary?: string;
    };
    classNames?: {
        details?: string;
        summary?: string;
    };
}

const plugin: Plugin<PluginOptions[], Root> = function plugin(optionsInput = {}): Transformer<Root> {
    const TAG_NAMES = { details: 'details', summary: 'summary', ...optionsInput.tagNames };
    const getClassNameAttribute = (tag: 'details' | 'summary'): MdxJsxAttribute[] => {
        const className = (optionsInput.classNames || {})[tag];
        return className ? [{ type: 'mdxJsxAttribute', name: 'className', value: className }] : [];
    };

    return async (ast, vfile) => {
        visit(ast, 'containerDirective', (node, idx, parent) => {
            if (!parent || node.name !== 'details') {
                return;
            }
            const label = node.children.filter(
                (child) => (child.data as { directiveLabel: boolean })?.directiveLabel
            );
            const content = node.children.filter(
                (child) => !(child.data as { directiveLabel: boolean })?.directiveLabel
            );
            const children = [...content];
            if (label.length > 0) {
                children.splice(0, 0, {
                    type: 'mdxJsxFlowElement',
                    name: TAG_NAMES.summary,
                    attributes: [...getClassNameAttribute('summary')],
                    children: label
                });
            }
            const details = {
                type: 'mdxJsxFlowElement',
                name: TAG_NAMES.details,
                attributes: [...getClassNameAttribute('details')],
                children: children
            } as MdxJsxFlowElement;
            parent.children.splice(idx || 0, 1, details);
        });
    };
};

export default plugin;
