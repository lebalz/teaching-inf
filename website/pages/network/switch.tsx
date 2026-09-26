import NetworkDevice from '@tdev/packages/webserial/decoders/NetworkDevice/components';
import { useDeviceConfig } from '@tdev/packages/webserial/decoders/NetworkDevice/hooks/useDeviceConfig';
import Webserial from '@tdev/webserial/component';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import React from 'react';
import styles from './styles.module.scss';

const Switch = observer((): React.ReactNode => {
    const config = useDeviceConfig('switch', { radioPower: 1 });
    return (
        <Layout title={`Network Microbit Switch`} wrapperClassName={clsx(styles.network)}>
            <main>
                <h1>Switch</h1>
                {config && (
                    <Webserial
                        deviceId="switch"
                        baudRate={115200}
                        hideLogs
                        resetTrigger="::READY::"
                        output={<NetworkDevice config={config} syncQueryString />}
                    />
                )}
            </main>
        </Layout>
    );
});

export default Switch;
