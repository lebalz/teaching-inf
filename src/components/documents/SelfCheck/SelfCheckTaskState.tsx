import React from 'react';
import { observer } from 'mobx-react-lite';
import { useFirstMainDocument } from '@tdev-hooks/useFirstMainDocument';
import Loader from '@tdev-components/Loader';
import TaskState from '@tdev-components/documents/TaskState';
import { MetaInit, TaskMeta } from '@tdev-models/documents/TaskState';
import { ModelMeta as SolutionModelMeta } from '@tdev-models/documents/Solution';
import { useDocumentRoot } from '@tdev-hooks/useDocumentRoot';
import { NoneAccess } from '@tdev-models/helpers/accessPolicy';
import { SelfCheckStateType } from '@tdev-components/documents/SelfCheck/models';

interface Props extends MetaInit {
    id: string;
    solutionId: string;
    includeQuestion: boolean;
}

const SelfCheckTaskState = observer(({ id, solutionId, includeQuestion = true }: Props) => {
    const [taskMeta] = React.useState(new TaskMeta({}));
    const [solutionMeta] = React.useState(new SolutionModelMeta({}));
    const doc = useFirstMainDocument(id, taskMeta);
    const solution = useFirstMainDocument(solutionId, solutionMeta);
    const solutionDocRoot = useDocumentRoot(solutionId, solutionMeta, false);

    if (!doc) {
        return <Loader />;
    }

    const solutionAvailable = !!solution && !NoneAccess.has(solutionDocRoot.permission);

    const taskStates = [
        SelfCheckStateType.Open,
        includeQuestion ? SelfCheckStateType.Question : null,
        solutionAvailable ? SelfCheckStateType.Reviewing : SelfCheckStateType.WaitingForSolution,
        solutionAvailable ? SelfCheckStateType.Done : null
    ].filter((state) => !!state);

    if (solutionAvailable && doc.taskState === SelfCheckStateType.WaitingForSolution) {
        doc.setState(SelfCheckStateType.Reviewing);
    }
    if (!solutionAvailable && doc.taskState === SelfCheckStateType.Reviewing) {
        doc.setState(SelfCheckStateType.WaitingForSolution);
    }

    return <TaskState id={id} states={taskStates} />;
});

export default SelfCheckTaskState;
