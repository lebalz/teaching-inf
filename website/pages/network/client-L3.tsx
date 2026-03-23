import clsx from 'clsx';
import Layout from '@theme/Layout';
import { observer } from 'mobx-react-lite';
import styles from './styles.module.scss';
import Webserial from '@tdev/webserial/component';
import NetworkDevice from '@tdev/packages/webserial/decoders/NetworkDevice/components';
import { useDeviceConfig } from '@tdev/packages/webserial/decoders/NetworkDevice/hooks/useDeviceConfig';

const Client = observer((): React.ReactNode => {
    const config = useDeviceConfig(
        'client',
        { radioPower: 1 },
        { ip: '192.168.0.2', defaultGateway: '192.168.0.1' }
    );
    return (
        <Layout title={`Network Microbit Client`} wrapperClassName={clsx(styles.network)}>
            <main>
                <h1>Client</h1>
                {config && (
                    <Webserial
                        deviceId="client"
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

export default Client;
