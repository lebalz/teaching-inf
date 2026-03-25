import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { useStore } from '@tdev-hooks/useStore';
import { useDeviceId } from '@tdev/webserial/hooks/useDeviceId';
import Decoder, { Config } from '../models/Decoder';
import { useFullscreenTargetId } from '@tdev-hooks/useFullscreenTargetId';
import { Formatters } from './helpers';
import PlotterChart from './PlotterChart';
import PlotterTable from './DataTable';
import Header from './Header';

interface Props {
    separator: string;
    config: Config;
    sampleSize?: number;
    minValue?: number;
    maxValue?: number;
    unit?: string;
    xTimeFormatter?: (timestamp: number, idx?: number) => string;
    timeFormatter?: keyof typeof Formatters;
    animate?: boolean;
    strokeWidth?: number;
    showGrid?: boolean;
}

const SerialPlotter = observer((props: Props) => {
    const subscriptionId = React.useId();
    const viewStore = useStore('viewStore');
    const webserialStore = viewStore.useStore('webserialStore');
    const deviceId = useDeviceId();
    const fullscreenTargetId = useFullscreenTargetId();
    const device = webserialStore.devices.get(deviceId);
    const isFullscreen = viewStore.isFullscreenTarget(fullscreenTargetId);
    const [decoder, setDecoder] = React.useState<Decoder | null>(null);
    React.useEffect(() => {
        if (device) {
            const model = new Decoder(
                subscriptionId,
                device,
                props.separator,
                props.config,
                props.sampleSize
            );
            setDecoder(model);
        }
    }, [device, subscriptionId, props.separator, props.config, props.sampleSize]);

    if (!(decoder && device)) {
        return <div>Serial Plotter</div>;
    }

    return (
        <div className={clsx(styles.networkDevice, isFullscreen && styles.fullscreen)}>
            <Header decoder={decoder} />
            <PlotterChart decoder={decoder} {...props} />
            <PlotterTable decoder={decoder} />
        </div>
    );
});

export default SerialPlotter;
