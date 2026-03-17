import React from 'react';
import clsx from 'clsx';
import styles from '../styles.module.scss';
import { observer } from 'mobx-react-lite';
import { useStore } from '@tdev-hooks/useStore';
import { default as IPFrameModel } from '../../../models/IPFrame';

interface Props {
    frame: IPFrameModel;
}

const IPFrame = observer((props: Props) => {
    const { frame } = props;
    return (
        <>
            <div className={clsx(styles.type)}>IP</div>
            <div className={clsx(styles.ttl)}>{frame.ttl}</div>
            <div className={clsx(styles.src)}>{frame.src}</div>
            <div className={clsx(styles.dst)}>{frame.dst}</div>
            <div className={clsx(styles.payload)}>{frame.payload}</div>
        </>
    );
});

export default IPFrame;
