import React from 'react';
import { type Props as CodeBlockProps } from '@theme/CodeBlock';

const MDX_CODE = 'MDXCode' as const;
const MDX_PRE = 'MDXPre' as const;

function isReactElementWithNamedType(
    node: any
): node is React.ReactElement<{ children: any }> & { type: { name: string } } {
    return (
        node &&
        typeof node === 'object' &&
        'type' in node &&
        typeof node.type === 'function' &&
        'name' in node.type
    );
}

export const extractCodeBlockProps = (from: React.ReactNode, depth: number = 0): CodeBlockProps | null => {
    const children = Array.isArray(from) ? from : [from];
    for (const child of children) {
        if (!isReactElementWithNamedType(child)) {
            continue;
        }
        if (child.type.name === MDX_CODE) {
            /**
             * this indicates that we found an inline code block...
             */
            return child.props as CodeBlockProps;
        }
        if (child.type.name === MDX_PRE) {
            /**
             * this is a Docusaurus MDXPre component
             * @see https://github.com/facebook/docusaurus/blob/main/packages/docusaurus-theme-classic/src/theme/MDXComponents/Pre.tsx
             * --> MDXPre is a wrapper around the CodeBlock component
             */
            const innerChild = child.props?.children;
            if (isReactElementWithNamedType(innerChild) && innerChild.type.name === MDX_CODE) {
                return innerChild.props as CodeBlockProps;
            }
        }
        if (depth > 0 && child.props?.children) {
            const result = extractCodeBlockProps(child.props?.children, depth - 1);
            if (result) {
                return result;
            }
        }
    }
    return null;
};
