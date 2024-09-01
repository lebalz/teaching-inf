import * as React from 'react';
import Button, { Color } from '@site/src/components/documents/CodeEditor/Button';
import { translate } from '@docusaurus/Translate';
import styles from './styles.module.scss';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { useDocument } from '../../useContextDocument';
import { DocumentType } from '@site/src/api/document';
import { mdiLoading, mdiPlay } from '@mdi/js';

const RunCode = observer(() => {
    const script = useDocument<DocumentType.Script>();
    return (
        <Button
            icon={script.isExecuting ? mdiLoading : mdiPlay}
            spin={script.isExecuting}
            color={Color.Success}
            className={clsx(styles.runCode, script.meta.slim && styles.slim)}
            iconSize={script.meta.slim ? '1.2em' : '1.6em'}
            onClick={() => {
                script.execScript();
            }}
            title={`${script.title} ausführen`}
        />
    );
});

export default RunCode;
