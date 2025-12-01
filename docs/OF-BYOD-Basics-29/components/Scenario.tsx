import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import Heading from '@theme/Heading';
import Badge from '@tdev-components/shared/Badge';
import { ScenarioNrContext } from './Page';

interface Props {
    children: React.ReactNode;
    nr?: number;
    isOsx?: boolean;
    isWin?: boolean;
}

const getGridSettings = (_nr?: number) => {
    if (!_nr) {
        return {};
    }
    const nr = _nr % 8;
    const isEven = nr % 2 === 0;
    return {
        gridColumnStart: isEven ? 1 : 2,
        gridColumnEnd: isEven ? 2 : 3,
        gridRowStart: Math.ceil(nr / 2),
        gridRowEnd: Math.ceil(nr / 2) + 1
    };
};

const Scenario = (props: Props) => {
    const gridSettings = getGridSettings(props.nr);
    const scenarioNr = React.useContext(ScenarioNrContext);

    return (
        <div className={clsx(styles.scenario)} style={gridSettings}>
            <div className={clsx(styles.meta)}>
                {props.isOsx && <Badge color="black">macOS</Badge>}
                {props.isWin && <Badge color="blue">Windows</Badge>}
                <Badge color="gray">#{scenarioNr}</Badge>
            </div>
            {props.children}
        </div>
    );
};

export default Scenario;
