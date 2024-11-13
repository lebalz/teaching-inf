import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { useStore } from '@tdev-hooks/useStore';
import TextMessage from '..';
import DocumentRoot from '@tdev-models/DocumentRoot';
import { DocumentType } from '@tdev-api/document';

interface Props {
    group: DocumentRoot<DocumentType.DynamicDocumentRoot>;
}

const Conversation = observer((props: Props) => {
    const { group } = props;
    return (
        <div className={clsx(styles.conversation)}>
            {group.allDocuments
                .filter((msg) => msg.type === DocumentType.TextMessage)
                .map((message, index) => {
                    return <TextMessage key={index} message={message} />;
                })}
        </div>
    );
});

export default Conversation;
