import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import EthernetFrame from '.';
import Decoder from '../../models/Decoder';
import styles from './styles.module.scss';

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
