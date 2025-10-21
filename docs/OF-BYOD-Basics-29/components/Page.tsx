import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import Heading from '@theme/Heading';
import Badge from '@tdev-components/shared/Badge';

interface Props {
    isOsx?: boolean;
    children: React.ReactNode;
    nr: number;
    testNr?: number;
}

export const ScenarioNrContext = React.createContext<number>(1);


const Page = (props: Props) => {
    
    return (
        <ScenarioNrContext.Provider value={props.testNr ?? 1}>
            <div className={clsx(styles.page)}>
                <Badge className={clsx(styles.pageNr)} color='gray'>{props.nr}</Badge>
                {props.children}
            </div>
        </ScenarioNrContext.Provider>
    );
};

export default Page;