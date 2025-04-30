import React from 'react';
import { type Props as CodeBlockProps } from '@theme/CodeBlock';

export const extractCodeBlockProps = (from: React.ReactNode, depth: number = 0): CodeBlockProps => {
    const children = Array.isArray(from) ? from : [from];
    const [mdxCode] = children
        .flatMap((child) => {
            if (!child || typeof child !== 'object' || !('type' in child)) {
                return null;
            }
            if (child.type.name === 'MDXCode') {
                /**
                 * this indicates that we found an inline code block...
                 */
                return child;
            }
            if (child.type.name === 'MDXPre') {
                /**
                 * this is a Docusaurus MDXPre component
                 * @see https://github.com/facebook/docusaurus/blob/main/packages/docusaurus-theme-classic/src/theme/MDXComponents/Pre.tsx
                 * --> MDXPre is a wrapper around the CodeBlock component
                 */
                if (
                    typeof child.props?.children === 'object' &&
                    child.props?.children?.type?.name === 'MDXCode'
                ) {
                    return child.props.children;
                }
                return null;
            }
            if (depth > 0 && child.props?.children) {
                return extractCodeBlockProps(child.props?.children, depth - 1);
            }
            return null;
        })
        .filter((val) => !!val);
    if (mdxCode) {
        return mdxCode.props;
    }
    return { children: '' };
};
