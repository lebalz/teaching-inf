import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { useStore } from '@tdev-hooks/useStore';
import { useDeviceId } from '@tdev/webserial/hooks/useDeviceId';
import Decoder from '../models/Decoder';
import { useFullscreenTargetId } from '@tdev-hooks/useFullscreenTargetId';
import Icon from '@mdi/react';
import { mdiNetworkOff } from '@mdi/js';
import { SIZE_M } from '@tdev-components/shared/iconSizes';

interface Props {}

const NetworkDevice = observer((props: Props) => {
    const subscriptionId = React.useId();
    const viewStore = useStore('viewStore');
    const webserialStore = viewStore.useStore('webserialStore');
    const deviceId = useDeviceId();
    const fullscreenTargetId = useFullscreenTargetId();
    const device = webserialStore.devices.get(deviceId);
    const isFullscreen = viewStore.isFullscreenTarget(fullscreenTargetId);
    const decoder = React.useMemo(() => {
        if (device) {
            return new Decoder(subscriptionId, device);
        }
    }, [device, subscriptionId]);

    if (!(decoder && device)) {
        return <div>Netzwerk</div>;
    }

    return (
        <div className={clsx(styles.networkDevice, isFullscreen && styles.fullscreen)}>
            <Icon path={decoder.config?.icon || mdiNetworkOff} size={SIZE_M} color="var(--ifm-color-blue)" />
        </div>
    );
});

export default NetworkDevice;
