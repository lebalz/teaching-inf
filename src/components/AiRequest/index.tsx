import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { useStore } from '@tdev-hooks/useStore';
import { default as AiRequestModel } from '@tdev-models/Ai/AiRequest';
import CodeBlock from '@theme/CodeBlock';
import Card from '@tdev-components/shared/Card';
import Loader from '@tdev-components/Loader';
import { formatDateTime } from '@tdev-models/helpers/date';

interface Props {
    aiRequest: AiRequestModel;
}

const AiRequest = observer((props: Props) => {
    const { aiRequest } = props;
    return (
        <Card
            header={
                <>
                    <h4>{formatDateTime(aiRequest.createdAt)}</h4>
                    <small>
                        <pre className={clsx(styles.request)}>{aiRequest.request}</pre>
                    </small>
                </>
            }
            classNames={{ body: clsx(styles.response) }}
        >
            {aiRequest.status === 'pending' ? (
                <Loader label="Antwort generieren..." />
            ) : (
                <CodeBlock language="json" title="Resultat">
                    {JSON.stringify(aiRequest.response, null, 2)}
                </CodeBlock>
            )}
        </Card>
    );
});

export default AiRequest;
