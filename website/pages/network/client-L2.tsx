import clsx from 'clsx';
import Layout from '@theme/Layout';
import { observer } from 'mobx-react-lite';
import styles from './styles.module.scss';
import Webserial from '@tdev/webserial/component';
import NetworkDevice from '@tdev/packages/webserial/decoders/NetworkDevice/components';

const ClientL2 = observer((): React.ReactNode => {
    return (
        <Layout title={`Network Microbit Client`} wrapperClassName={clsx(styles.network)}>
            <main>
                <h1>Client</h1>
                <Webserial
                    deviceId="client-L2"
                    baudRate={115200}
                    hideLogs
                    resetTrigger="::READY::"
                    output={
                        <NetworkDevice
                            config={{
                                mode: 'client',
                                ip: '192.168.0.2',
                                defaultGateway: '192.168.0.1',
                                radioAddress: 1969383796,
                                radioPower: 1,
                                radioGroup: 0
                            }}
                            hideIpConfig
                        />
                    }
                />
            </main>
        </Layout>
    );
});

export default ClientL2;
