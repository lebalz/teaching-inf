import React from 'react';
import clsx from 'clsx';
import styles from '../styles.module.scss';
import { observer } from 'mobx-react-lite';
import { useFirstMainDocument } from '@tdev-hooks/useFirstMainDocument';
import Loader from '@tdev-components/Loader';
import Icon, { Stack } from '@mdi/react';
import { mdiCircle, mdiCommentPlus, mdiCommentPlusOutline } from '@mdi/js';
import { DocumentType, MdxCommentData } from '@tdev-api/document';
import { useStore } from '@tdev-hooks/useStore';
import { Delta } from 'quill/core';

interface Props extends MdxCommentData {
    pageId: string;
}

const AddComment = observer((props: Props) => {
    const documentStore = useStore('documentStore');
    return (
        <div className={clsx(styles.wrapper, styles.colorized)}>
            <div
                className={clsx(styles.comment)}
                onClick={() => {
                    documentStore
                        .create({
                            documentRootId: props.pageId,
                            type: DocumentType.MdxComment,
                            data: {
                                commentNr: props.commentNr,
                                type: props.type,
                                nr: props.nr,
                                isOpen: true,
                                color: 'blue'
                            }
                        })
                        .then((comment) => {
                            if (comment) {
                                return documentStore.create({
                                    documentRootId: props.pageId,
                                    parentId: comment.id,
                                    type: DocumentType.QuillV2,
                                    data: {
                                        delta: { ops: [{ insert: '\n' }] } as Delta
                                    }
                                });
                            }
                        });
                }}
            >
                <Stack size={1}>
                    <Icon path={mdiCircle} size={1.2} color="var(--ifm-background-color)" />
                    <Icon path={mdiCommentPlusOutline} size={1} color="var(--comment-ico-color)" />
                </Stack>
            </div>
        </div>
    );
});

export default AddComment;
