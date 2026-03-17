import React from 'react';
import clsx from 'clsx';
import styles from '../styles.module.scss';
import { observer } from 'mobx-react-lite';
import { default as ARPModel } from '../../../models/ARP';

interface Props {
    frame: ARPModel;
}

const ARP = observer((props: Props) => {
    const { frame } = props;
    return (
        <>
            <div className={clsx(styles.type)}>ARP</div>
            <div className={clsx(styles.sender_mac)}>{frame.sender_mac}</div>
            <div className={clsx(styles.sender_ip)}>{frame.sender_ip}</div>
            <div className={clsx(styles.dest_ip)}>{frame.dest_ip}</div>
        </>
    );
});

export default ARP;
