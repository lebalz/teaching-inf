import React from 'react';
import { observer } from 'mobx-react-lite';
import { TaskMeta } from '@tdev-models/documents/TaskState';
import { useFirstMainDocument } from '@tdev-hooks/useFirstMainDocument';
import { useStore } from '@tdev-hooks/useStore';
import Loader from '@tdev-components/Loader';
import { SelfCheckStateType } from '@tdev-components/documents/SelfCheck/shared';

interface StateDependentProps {
    taskStateId: string;
    visibleFrom: SelfCheckStateType;
    visibleTo: SelfCheckStateType;
    alwaysVisibleForTeacher: boolean;
    children?: React.ReactNode;
}

const SelfCheckContainer = observer(
    ({
        taskStateId,
        alwaysVisibleForTeacher = true,
        children
    }: StateDependentProps) => {
        const [taskMeta] = React.useState(new TaskMeta({}));
        const doc = useFirstMainDocument(taskStateId, taskMeta);
        const userStore = useStore('userStore');

        if (!doc) {
            return <Loader />;
        }

        const showElement =
            (userStore.current?.isTeacher && alwaysVisibleForTeacher) ||
            (doc.taskState !== SelfCheckStateType.OPEN && doc.taskState !== SelfCheckStateType.DONE);

        return <div>{showElement && children}</div>;
    }
);

export default SelfCheckContainer;
