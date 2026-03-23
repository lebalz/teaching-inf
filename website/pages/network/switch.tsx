import clsx from 'clsx';
import Layout from '@theme/Layout';
import { observer } from 'mobx-react-lite';
import styles from './styles.module.scss';
import Webserial from '@tdev/webserial/component';
import NetworkDevice from '@tdev/packages/webserial/decoders/NetworkDevice/components';
import React from 'react';
import { useDeviceConfig } from '@tdev/packages/webserial/decoders/NetworkDevice/hooks/useDeviceConfig';

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
