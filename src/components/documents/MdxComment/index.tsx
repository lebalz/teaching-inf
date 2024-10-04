import React from 'react';
import { observer } from 'mobx-react-lite';
import { MdxCommentData } from '@tdev-api/document';
import { useStore } from '@tdev-hooks/useStore';
import AddComment from './AddComment';
import { default as CommentComponent } from './Comment';
import { useMdxComment } from '@tdev-hooks/useMdxComment';

interface Props extends MdxCommentData {}

const Comment = observer((props: Props & { id: string }) => {
    const comment = useMdxComment(props.id, props.nr, props.commentNr, props.type);
    if (!comment) {
        return <AddComment {...props} />;
    }
    return <CommentComponent comment={comment} />;
});

const MdxComment = observer((props: Props) => {
    const pageStore = useStore('pageStore');
    if (!pageStore.current) {
        return null;
    }
    return <Comment {...props} id={pageStore.current.id} />;
});

export default MdxComment;
