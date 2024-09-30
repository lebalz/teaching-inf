import React from 'react';
import { observer } from 'mobx-react-lite';
import { useFirstMainDocument } from '@tdev-hooks/useFirstMainDocument';
import Loader from '@tdev-components/Loader';
import TaskState from '@tdev-components/documents/TaskState';
import { MetaInit, TaskMeta } from '@tdev-models/documents/TaskState';
import { Access, StateType } from '@tdev-api/document';
import { ModelMeta as SolutionModelMeta } from '@tdev-models/documents/Solution';
import { useDocumentRoot } from '@tdev-hooks/useDocumentRoot';
import { NoneAccess } from '@tdev-models/helpers/accessPolicy';
import { useStore } from '@tdev-hooks/useStore';

interface Props extends MetaInit {
    id: string;
    solutionId: string;
    keepSolution?: boolean;
}

const STATE_OPEN: StateType = 'unset';
const STATE_WAITING_FOR_SOLUTION: StateType = 'star-empty';
const STATE_REVIEWING_SOLUTION: StateType = 'star-half';
const STATE_DONE: StateType = 'checked';

const SampleSolutionTaskState = observer((props: Props) => {
    const [taskMeta] = React.useState(new TaskMeta(props));
    const [solutionMeta] = React.useState(new SolutionModelMeta({}))
    const doc = useFirstMainDocument(props.id, taskMeta);
    const solution = useFirstMainDocument(props.solutionId, solutionMeta);
    const solutionDocRoot = useDocumentRoot(props.solutionId, solutionMeta, false);

    if (!doc) {
        return <Loader />;
    }

    const solutionAvailable = !!solution && !NoneAccess.has(solutionDocRoot.permission);

    const taskStates = [
        STATE_OPEN,
        solutionAvailable ? STATE_REVIEWING_SOLUTION : STATE_WAITING_FOR_SOLUTION,
        solutionAvailable ? STATE_DONE : null
    ].filter(state => !!state);

    if (solutionAvailable && doc.taskState === STATE_WAITING_FOR_SOLUTION) {
        doc.setState(STATE_REVIEWING_SOLUTION);
    }
    if (!solutionAvailable && doc.taskState === STATE_REVIEWING_SOLUTION) {
        doc.setState(STATE_WAITING_FOR_SOLUTION);
    }

    return (
        <TaskState id={props.id} states={taskStates} />
    );
});

export interface HideableProps {
    sampleSolutionTaskStateId: string;
    children?: React.ReactNode;
}

export const StateDependent = observer((props: HideableProps) => {
    const [taskMeta] = React.useState(new TaskMeta({}));
    const doc = useFirstMainDocument(props.sampleSolutionTaskStateId, taskMeta);
    const userStore = useStore('userStore');

    if (!doc) {
        return <Loader />
    }

    const showElement = userStore.current?.isAdmin || (doc.taskState !== STATE_OPEN && doc.taskState !== STATE_DONE);

    return (
        <div>{ showElement && props.children }</div>
    )
});

export default SampleSolutionTaskState;
