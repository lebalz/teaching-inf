import React from 'react';
import clsx from 'clsx';

import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { mdiAccountCircleOutline, mdiAccountSwitch, mdiCircle, mdiLogin } from '@mdi/js';
import siteConfig from '@generated/docusaurus.config';
import { ApiState } from '@site/src/stores/iStore';
import { useStore } from '@site/src/hooks/useStore';
import Button from '../../shared/Button';
import useIsBrowser from '@docusaurus/useIsBrowser';
import Popup from 'reactjs-popup';

const AccountSwitcher = observer(() => {
    const isBrowser = useIsBrowser();
    const userStore = useStore('userStore');

    if (!isBrowser || !userStore.current?.isAdmin) {
        return null;
    }
    return (
        <Popup
            trigger={
                <div className={styles.accountSwitcher}>
                    <Button
                        icon={mdiAccountSwitch}
                        size={0.8}
                        className={clsx(styles.accountSwitcherButton)}
                        iconSide="left"
                        color="primary"
                        title="Anderen Account Anzeigen"
                    />
                </div>
            }
            on={['click', 'hover']}
            closeOnDocumentClick
            closeOnEscape
        >
            <div className={clsx(styles.wrapper, 'card')}>
                <div className={clsx('card__header', styles.header)}>
                    <h4>Inhalte anzeigen für</h4>
                </div>
                <div className={clsx('card__body', styles.body)}>
                    <div className={styles.userList}>
                        {userStore.users.map((user) => (
                            <Button
                                key={user.id}
                                icon={mdiAccountCircleOutline}
                                size={0.8}
                                className={clsx(styles.userButton)}
                                iconSide="left"
                                color="primary"
                                title={`Inhalte anzeigen für ${user.firstName} ${user.lastName}`}
                                onClick={() => userStore.switchUser(user.id)}
                            >
                                {user.firstName} {user.lastName}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </Popup>
    );
});

export default AccountSwitcher;
