import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { DocumentModelType } from '@tdev-api/document';
import CodeBlock from '@theme/CodeBlock';
import QuillRenderer from './QuillRenderer';

interface Props {
    doc: DocumentModelType;
}

const DocumentReport = observer((props: Props) => {
    const { doc } = props;
    switch (doc?.type) {
        case 'script':
            return <CodeBlock language="py">{doc.code}</CodeBlock>;
        case 'pyodide_code':
            return <CodeBlock language={doc.lang}>{doc.code}</CodeBlock>;
        case 'quill_v2':
            return (
                <div>
                    <QuillRenderer doc={doc} />
                </div>
            );
        case 'string':
            return <div>{doc.text}</div>;
    }
    return null;
});

export default DocumentReport;
