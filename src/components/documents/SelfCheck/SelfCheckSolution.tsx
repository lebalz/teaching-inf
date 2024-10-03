import React from 'react';
import { observer } from 'mobx-react-lite';
import { MetaInit } from '@tdev-models/documents/TaskState';
import { SelfCheckStateType } from '@tdev-components/documents/SelfCheck/models';
import { SelfCheckContext } from '@tdev-components/documents/SelfCheck/shared';
import SelfCheckContent from '@tdev-components/documents/SelfCheck/SelfCheckContent';
import Solution from '@tdev-components/documents/Solution';

interface Props extends MetaInit {
    visibleFrom?: SelfCheckStateType;
    visibleTo?: SelfCheckStateType;
    alwaysVisibleForTeacher?: boolean;
    children: JSX.Element;
}

const SelfCheckSolution = observer((props: Props) => {
    const context = React.useContext(SelfCheckContext);
    if (!context) {
        throw new Error('SelfCheckSolution must be used within a SelfCheck');
    }

    return (
        <SelfCheckContent
            alwaysVisibleForTeacher={props.alwaysVisibleForTeacher}
            visibleTo={props.visibleTo}
            visibleFrom={props.visibleFrom}
        >
            <Solution id={context.solutionId}>{props.children}</Solution>
        </SelfCheckContent>
    );
});

export default SelfCheckSolution;
