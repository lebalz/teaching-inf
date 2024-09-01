import React from 'react';
import InitialCodeBlock from '@theme-init/CodeBlock';
import CodeBlock, { type Props as CodeBlockType } from '@theme-init/CodeBlock';
import type { WrapperProps } from '@docusaurus/types';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { CodeEditorWrapper } from '@site/src/components/documents/CodeEditor';

export interface MetaProps {
    live_jsx: boolean;
    live_py: boolean;
    id?: string;
    slim: boolean;
    readonly: boolean;
    noReset: boolean;
    noDownload: boolean;
    versioned: boolean;
    noHistory: boolean;
    noCompare: boolean;
    maxLines: number;
    title: string;
}

type Props = WrapperProps<typeof CodeBlockType>;

const sanitizedTitle = (id: string) => {
    if (!id) {
        return;
    }
    return id
        .replace(/--/g, '<<HYPHEN>>')
        .replace(/__/g, '<<UNDERSCORE>>')
        .replace(/[-_]/g, ' ')
        .replace(/<<UNDERSCORE>>/g, '_')
        .replace(/<<HYPHEN>>/g, '-');
};

const extractMetaProps = (props: { metastring?: string }): Partial<MetaProps> => {
    const metaString = (props?.metastring || '').replace(/\s*=\s*/g, '='); // remove spaces around =
    const metaRaw = metaString.split(/\s+/).map((s) => s.trim().split('='));
    return metaRaw.reduce(
        (acc, [key, value]) => {
            if (!key) {
                return acc;
            }
            /** casts to booleans and numbers. When no value was provided, true is used */
            const val =
                value === 'true'
                    ? true
                    : value === 'false'
                      ? false
                      : !Number.isNaN(Number(value))
                        ? Number(value)
                        : value || true;
            acc[key] = val;
            return acc;
        },
        {} as { [key: string]: number | string | boolean }
    );
};

const SPLIT_CODE_REGEX = /^(?:(?<pre>.*?)\n###\s*PRE\s*)?(?<code>.*?)(?:\n###\s*POST\s*(?<post>.*))?$/s;

export const splitCode = (rawCode: string) => {
    const { pre, code, post } = rawCode.replace(/\s*\n$/, '').match(SPLIT_CODE_REGEX)?.groups || {};
    return {
        pre: pre || '',
        code: code || '',
        post: post || ''
    };
};

export default function CodeBlockWrapper(props: Props): JSX.Element {
    const metaProps = extractMetaProps(props);
    const langMatch = ((props.className || '') as string).match(/language-(?<lang>\w*)/);
    let lang = langMatch?.groups?.lang?.toLocaleLowerCase() ?? '';
    if (lang === 'py') {
        lang = 'python';
    }
    // if (metaProps.live_jsx) {
    //     return <Playground scope={ReactLiveScope} {...props} />;
    // }
    if (metaProps.live_py) {
        const title = props.title || metaProps.title;
        const { code, pre, post } = splitCode((props.children as string) || '');
        return (
            <BrowserOnly fallback={<CodeBlock language={lang}>{code}</CodeBlock>}>
                {() => {
                    return (
                        <CodeEditorWrapper
                            code={code}
                            lang={lang}
                            preCode={pre}
                            postCode={post}
                            maxLines={props.maxLines && Number.parseInt(props.maxLines, 10)}
                            readonly={!!props.readonly}
                            noReset={!!props.noReset}
                            noDownload={props.versioned || !!props.noDownload}
                            slim={!!props.slim}
                            showLineNumbers={!(!!props.slim && !/\n/.test(code))}
                            versioned={!!props.versioned}
                            noHistory={!!props.noHistory}
                            noCompare={!!props.noCompare}
                            title={sanitizedTitle(title) || lang}
                            className={props.className}
                        />
                    );
                }}
            </BrowserOnly>
        );
    }
    return <CodeBlock {...props} />;
}
