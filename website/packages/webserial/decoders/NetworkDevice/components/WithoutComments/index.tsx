import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import CodeBlock from '@theme/CodeBlock';
import TextAreaInput from '@tdev-components/shared/TextAreaInput';
/**
 * Move all multi-line, single-statement if/elif/else/else-if blocks to one line.
 * Modifies Python Syntax in the input string.
 */
function mergeSingleLineIfs(code: string): string {
    const lines = code.split('\n');
    // Process bottom-up so inner/nested single-line ifs are merged first
    for (let i = lines.length - 2; i >= 0; i--) {
        const line = lines[i];
        const trimmed = line.trimStart();
        if (!/^(if|elif|else)\b/.test(trimmed) || !trimmed.endsWith(':')) {
            continue;
        }
        const currentIndent = line.length - trimmed.length;
        const nextLine = lines[i + 1];
        const nextIndent = nextLine.length - nextLine.trimStart().length;
        if (nextIndent <= currentIndent) {
            continue;
        }
        const isSingleLineBody =
            i + 2 >= lines.length || lines[i + 2].length - lines[i + 2].trimStart().length <= currentIndent;
        if (isSingleLineBody) {
            lines[i] = line + ' ' + nextLine.trimStart();
            lines.splice(i + 1, 1);
        }
    }
    return lines.join('\n');
}
interface Props {
    lang?: string;
    inlineCommentChar?: string;
    blockCommentStart?: string[];
    blockCommentEnd?: string[];
    replacers?: { regex: RegExp; replacer: string }[];
}

const WithoutComments = (props: Props) => {
    const [withoutComments, setWithoutComments] = React.useState('');
    const inlineCommentChar = props.inlineCommentChar || '#';
    const blockCommentStart = props.blockCommentStart || ['"""', "'''"];
    const blockCommentEnd = props.blockCommentEnd || ['"""', "'''"];
    const replacers = props.replacers || [
        { regex: /    /g, replacer: '\t' },
        { regex: /SEPARATOR/g, replacer: 'S' }
    ];

    return (
        <div className={clsx(styles.withoutComments)}>
            <div className={clsx(styles.input)}>
                <TextAreaInput
                    monospace
                    noAutoFocus
                    placeholder="Code mit Kommentaren hier einfügen..."
                    onChange={(code) => {
                        const lines = code
                            .split('\n')
                            .map((l) =>
                                replacers.reduce(
                                    (acc, { regex, replacer }) => acc.replace(regex, replacer),
                                    l.trimEnd()
                                )
                            );
                        const uncommentedLines = lines.filter(
                            (line) => !line.trim().startsWith(inlineCommentChar) && line.trim() !== ''
                        );
                        let lineNr = 0;
                        while (lineNr < uncommentedLines.length) {
                            blockCommentStart.forEach((start, idx) => {
                                if (uncommentedLines[lineNr].trim().startsWith(start)) {
                                    uncommentedLines.splice(lineNr, 1);
                                    while (
                                        lineNr < uncommentedLines.length &&
                                        !uncommentedLines[lineNr].trim().endsWith(blockCommentEnd[idx])
                                    ) {
                                        uncommentedLines.splice(lineNr, 1);
                                    }
                                }
                            });
                            lineNr++;
                        }
                        const mergedCode = mergeSingleLineIfs(uncommentedLines.join('\n'));
                        setWithoutComments(mergedCode);
                    }}
                />
            </div>
            <CodeBlock language={props.lang ?? 'python'} showLineNumbers>
                {withoutComments}
            </CodeBlock>
        </div>
    );
};

export default WithoutComments;
