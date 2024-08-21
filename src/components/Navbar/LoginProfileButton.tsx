import React from 'react';
import clsx from 'clsx';

import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import Link from '@docusaurus/Link';
import { mdiAccountCircleOutline, mdiCircle, mdiCircleSmall, mdiLogin } from '@mdi/js';
import siteConfig from '@generated/docusaurus.config';
import { ApiState } from '@site/src/stores/iStore';
import { useStore } from '@site/src/hooks/useStore';
import Button from '../shared/Button';
import Icon from '@mdi/react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import useBaseUrl from '@docusaurus/useBaseUrl';
const { NO_AUTH } = siteConfig.customFields as { NO_AUTH?: boolean };

const LoginButton = () => {
    return (
        <Button href={useBaseUrl('/login')} text="Login" icon={mdiLogin} color="primary" iconSide="left" />
    );
};

const LoginProfileButton = observer(() => {
    const userStore = useStore('userStore');
    const sessionStore = useStore('sessionStore');
    const socketStore = useStore('socketStore');

    return (
        <BrowserOnly fallback={<LoginButton />}>
            {() => {
                if (sessionStore.isLoggedIn || NO_AUTH) {
                    return (
                        <div className={styles.profileButton}>
                            <Button
                                text={userStore.current?.nameShort || 'Profil'}
                                icon={mdiAccountCircleOutline}
                                iconSide="left"
                                apiState={userStore.current ? ApiState.IDLE : ApiState.SYNCING}
                                color="primary"
                                href="/user"
                                title="Persönlicher Bereich"
                            />
                            <Icon
                                path={mdiCircle}
                                size={0.3}
                                color={
                                    socketStore.isLive
                                        ? 'var(--ifm-color-success)'
                                        : 'var(--ifm-color-danger)'
                                }
                                className={clsx(styles.liveIndicator)}
                            />
                        </div>
                    );
                }
                return <LoginButton />;
            }}
        </BrowserOnly>
    );
});

export default LoginProfileButton;
