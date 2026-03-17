import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import Decoder from '../../models/Decoder';
import EthernetFrame from '.';

interface Props {
    decoder: Decoder;
}

const Frames = observer((props: Props) => {
    const { decoder } = props;
    return (
        <div className={clsx(styles.frames)}>
            {decoder.packages.map((frame, index) => {
                return <EthernetFrame key={index} frame={frame} />;
            })}
        </div>
    );
});

export default Frames;
