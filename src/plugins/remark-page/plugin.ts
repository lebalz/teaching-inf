import type { Transformer } from 'unified';
import { Node, Parent } from 'unist';
import type { MdxJsxFlowElement } from 'mdast-util-mdx';

/**
 * A remark plugin that adds a `<MdxPage /> elements at the top of the current page.
 * This is useful to initialize a page model on page load and to trigger side-effects on page display,
 * as to load models attached to the `page_id`'s root document.
 */
const plugin = function plugin(): Transformer {
    return async (root, file) => {
        const { visit, EXIT } = await import('unist-util-visit');
        visit(root, (node, index, parent: Node | undefined) => {
            if (root === node && !parent) {
                const loaderNode: MdxJsxFlowElement = {
                    type: 'mdxJsxFlowElement',
                    name: 'MdxPage',
                    attributes: [],
                    children: [],
                    data: {}
                };
                (node as Parent).children.splice(0, 0, loaderNode);
                return EXIT;
            }
        });
    };
};

export default plugin;
