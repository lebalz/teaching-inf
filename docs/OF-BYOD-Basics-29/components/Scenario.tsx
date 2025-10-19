import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import Heading from '@theme/Heading';
import Badge from '@tdev-components/shared/Badge';

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
    return (
        <div className={clsx(styles.scenario)} style={gridSettings}>
            {props.isOsx && <Badge className={clsx(styles.os)} color='black'>macOS</Badge>}
            {props.isWin && <Badge className={clsx(styles.os)} color='blue'>Windows</Badge>}
            {props.children}
        </div>
    );
};

export default Scenario;