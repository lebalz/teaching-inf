import React from 'react';
import clsx from 'clsx';

import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import Link from '@docusaurus/Link';
import { mdiAccountCircleOutline } from '@mdi/js';
import siteConfig from '@generated/docusaurus.config';
import { ApiState } from '@site/src/stores/iStore';
import { translate } from '@docusaurus/Translate';
import { useStore } from '@site/src/hooks/useStore';
import Button from '../shared/Button';
const { NO_AUTH } = siteConfig.customFields as { NO_AUTH?: boolean };

const LoginProfileButton = observer(() => {
    const userStore = useStore('userStore');
    const sessionStore = useStore('sessionStore');
    if (sessionStore.isLoggedIn || NO_AUTH) {
        return (
            <Button
                text={userStore.current?.firstName || 'Profil'}
                icon={mdiAccountCircleOutline}
                iconSide="left"
                apiState={userStore.current ? ApiState.IDLE : ApiState.LOADING}
                color="primary"
                href="/user"
                title="Persönlicher Bereich"
            />
        );
    }
    return (
        <>
            <div>
                <Link to={'/login'}>Login 🔑</Link>
            </div>
        </>
    );
});

export default LoginProfileButton;
