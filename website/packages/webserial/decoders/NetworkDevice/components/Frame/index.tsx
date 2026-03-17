import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { default as EthernetFrameModel } from '../../models/EthernetFrame';
import ARP from './ARP';
import IPFrame from './IPFrame';

interface Props {
    frame: EthernetFrameModel;
}

const Payload = observer((props: Props) => {
    const { frame } = props;
    if (frame.ipFrame) {
        return (
            <div className={clsx(styles.ipFrameContainer)}>
                <IPFrame frame={frame.ipFrame} />
            </div>
        );
    }
    if (frame.arpFrame) {
        return (
            <div className={clsx(styles.arpFrameContainer)}>
                <ARP frame={frame.arpFrame} />
            </div>
        );
    }
    return <div className={clsx(styles.textPayload)}>{frame.payload}</div>;
});

const EthernetFrame = observer((props: Props) => {
    const { frame } = props;
    return (
        <>
            <div className={clsx(styles.dest)}>{frame.dst}</div>
            <div className={clsx(styles.src)}>{frame.src}</div>
            <Payload frame={frame} />
        </>
    );
});

export default EthernetFrame;
