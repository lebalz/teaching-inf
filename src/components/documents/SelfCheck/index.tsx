import { SelfCheckContext } from '@tdev-components/documents/SelfCheck/shared';
import React, { type ReactNode } from 'react';

interface Props {
    solutionId: string;
    taskStateId: string;
    children?: ReactNode;
}

const SelfCheck = ({ solutionId, taskStateId, children }: Props) => {
    return (
        <SelfCheckContext.Provider value={{ solutionId, taskStateId }}>{children}</SelfCheckContext.Provider>
    );
};

export default SelfCheck;
