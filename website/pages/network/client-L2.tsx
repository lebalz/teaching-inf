import NetworkDevice from '@tdev/packages/webserial/decoders/NetworkDevice/components';
import { useDeviceConfig } from '@tdev/packages/webserial/decoders/NetworkDevice/hooks/useDeviceConfig';
import Webserial from '@tdev/webserial/component';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import styles from './styles.module.scss';

const ClientL2 = observer((): React.ReactNode => {
    const config = useDeviceConfig('client', { radioPower: 1 });
    return (
        <Layout title={`Network Microbit Client`} wrapperClassName={clsx(styles.network)}>
            <main>
                <h1>Client</h1>
                {config && (
                    <Webserial
                        deviceId="client-L2"
                        baudRate={115200}
                        hideLogs
                        resetTrigger="::READY::"
                        output={<NetworkDevice config={config} syncQueryString hideIpConfig />}
                    />
                )}
            </main>
        </Layout>
    );
});

export default ClientL2;
