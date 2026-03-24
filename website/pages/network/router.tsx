import clsx from 'clsx';
import Layout from '@theme/Layout';
import { observer } from 'mobx-react-lite';
import styles from './styles.module.scss';
import Router from '@tdev/packages/webserial/decoders/NetworkDevice/components/Router';

const RouterPage = observer((): React.ReactNode => {
    return (
        <Layout title={`Network Microbit Router`} wrapperClassName={clsx(styles.network)}>
            <main>
                <h1>Router</h1>
                <Router syncQueryString />
            </main>
        </Layout>
    );
});

export default RouterPage;
