import React from 'react';
import { observer } from 'mobx-react-lite';
import { useFirstMainDocument } from '@tdev-hooks/useFirstMainDocument';
import Loader from '@tdev-components/Loader';
import TaskState from '@tdev-components/documents/TaskState';
import { MetaInit, TaskMeta } from '@tdev-models/documents/TaskState';
import { ModelMeta as SolutionModelMeta } from '@tdev-models/documents/Solution';
import { useDocumentRoot } from '@tdev-hooks/useDocumentRoot';
import { NoneAccess } from '@tdev-models/helpers/accessPolicy';
import { SelfCheckStateType } from '@tdev-components/documents/SelfCheck/shared';

interface Props extends MetaInit {
    id: string;
    solutionId: string;
    keepSolution?: boolean;
}

const SelfCheckTaskState = observer((props: Props) => {
    const [taskMeta] = React.useState(new TaskMeta(props));
    const [solutionMeta] = React.useState(new SolutionModelMeta({}));
    const doc = useFirstMainDocument(props.id, taskMeta);
    const solution = useFirstMainDocument(props.solutionId, solutionMeta);
    const solutionDocRoot = useDocumentRoot(props.solutionId, solutionMeta, false);

    if (!doc) {
        return <Loader />;
    }

    const solutionAvailable = !!solution && !NoneAccess.has(solutionDocRoot.permission);

    const taskStates = [
        SelfCheckStateType.STATE_OPEN,
        solutionAvailable ? SelfCheckStateType.STATE_REVIEWING_SOLUTION : SelfCheckStateType.STATE_WAITING_FOR_SOLUTION,
        solutionAvailable ? SelfCheckStateType.STATE_DONE : null
    ].filter((state) => !!state);

    if (solutionAvailable && doc.taskState === SelfCheckStateType.STATE_WAITING_FOR_SOLUTION) {
        doc.setState(SelfCheckStateType.STATE_REVIEWING_SOLUTION);
    }
    if (!solutionAvailable && doc.taskState === SelfCheckStateType.STATE_REVIEWING_SOLUTION) {
        doc.setState(SelfCheckStateType.STATE_WAITING_FOR_SOLUTION);
    }

    return <TaskState id={props.id} states={taskStates} />;
});



export default SelfCheckTaskState;
