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
import { SelfCheckContext } from '@tdev-components/documents/SelfCheck/shared';

interface Props extends MetaInit {
    includeQuestion: boolean;
}

const SelfCheckTaskState = observer(({ includeQuestion = true, pagePosition }: Props) => {
    const context = React.useContext(SelfCheckContext);
    if (!context) {
        throw new Error('SelfCheckTaskState must be used within a SelfCheck');
    }

    const [taskMeta] = React.useState(new TaskMeta({ pagePosition }));
    const [solutionMeta] = React.useState(new SolutionModelMeta({}));
    const taskDoc = useFirstMainDocument(context.taskStateId, taskMeta);
    const solutionDoc = useFirstMainDocument(context.solutionId, solutionMeta);
    const solutionDocRoot = useDocumentRoot(context.solutionId, solutionMeta, false);

    if (!taskDoc) {
        return <Loader />;
    }

    const solutionAvailable = !!solutionDoc && !NoneAccess.has(solutionDocRoot.permission);

    const states = [
        SelfCheckStateType.Open,
        includeQuestion ? SelfCheckStateType.Question : null,
        solutionAvailable ? SelfCheckStateType.Reviewing : SelfCheckStateType.WaitingForSolution,
        solutionAvailable ? SelfCheckStateType.Done : null
    ].filter((state) => !!state);

    if (solutionAvailable && taskDoc.taskState === SelfCheckStateType.WaitingForSolution) {
        taskDoc.setState(SelfCheckStateType.Reviewing);
    }
    if (!solutionAvailable && taskDoc.taskState === SelfCheckStateType.Reviewing) {
        taskDoc.setState(SelfCheckStateType.WaitingForSolution);
    }

    return <TaskState id={context.taskStateId} states={states} pagePosition={pagePosition} />;
});

export default SelfCheckTaskState;
