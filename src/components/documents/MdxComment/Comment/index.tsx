import React from 'react';
import clsx from 'clsx';
import sharedStyles from '../styles.module.scss';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { DocumentType } from '@tdev-api/document';
import MdxComment from '@tdev-models/documents/MdxComment';
import { QuillV2Component } from '@tdev-components/documents/QuillV2';
import Icon, { Stack } from '@mdi/react';
import {
    mdiCircle,
    mdiCommentAccount,
    mdiCommentAccountOutline,
    mdiCommentOutline,
    mdiCommentPlusOutline,
    mdiDotsHorizontalCircle,
    mdiDotsHorizontalCircleOutline
} from '@mdi/js';
import Options from './Options';

interface Props {
    comment: MdxComment;
}

const Comment = observer((props: Props) => {
    const { comment } = props;
    return (
        <>
            <div
                className={clsx(
                    sharedStyles.wrapper,
                    sharedStyles.colorized,
                    sharedStyles.active,
                    comment.isOpen && sharedStyles.open,
                    sharedStyles[comment.color]
                )}
            >
                <div
                    className={clsx(sharedStyles.comment)}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        comment.setIsOpen(!comment.isOpen);
                    }}
                >
                    <Stack size={1}>
                        <Icon
                            path={comment.isOpen ? mdiCommentAccountOutline : mdiCommentAccount}
                            size={1}
                            color="var(--ifm-background-color)"
                        />
                        <Icon
                            path={comment.isOpen ? mdiCommentAccount : mdiCommentAccountOutline}
                            size={1}
                            color="var(--comment-ico-color)"
                        />
                    </Stack>
                </div>
            </div>
            {comment.isOpen && (
                <div
                    className={clsx(
                        styles.content,
                        sharedStyles.colorized,
                        sharedStyles[comment.color],
                        sharedStyles.active
                    )}
                >
                    {comment.isOpen && (
                        <div
                            className={clsx(styles.options, comment.optionsOpen && styles.open)}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                comment.setOptionsOpen(!comment.optionsOpen);
                            }}
                        >
                            <Stack size={1}>
                                <Icon
                                    path={
                                        comment.optionsOpen
                                            ? mdiDotsHorizontalCircleOutline
                                            : mdiDotsHorizontalCircle
                                    }
                                    size={1}
                                    color="var(--ifm-background-color)"
                                />
                                <Icon
                                    path={
                                        comment.optionsOpen
                                            ? mdiDotsHorizontalCircle
                                            : mdiDotsHorizontalCircleOutline
                                    }
                                    size={1}
                                    color="var(--comment-ico-color)"
                                />
                            </Stack>
                        </div>
                    )}
                    {comment.optionsOpen && <Options comment={comment} />}
                    {comment.children
                        .filter((doc) => doc.type === DocumentType.QuillV2)
                        .map((doc) => {
                            return (
                                <QuillV2Component
                                    quillDoc={doc}
                                    className={styles.quill}
                                    key={doc.id}
                                    theme="bubble"
                                />
                            );
                        })}
                </div>
            )}
        </>
    );
});

export default Comment;
