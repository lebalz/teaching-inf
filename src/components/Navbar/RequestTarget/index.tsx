import React from 'react';
import clsx from 'clsx';

import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import {
    mdiAccountCircleOutline,
    mdiAccountSwitch,
    mdiHomeAccount,
    mdiLaptop,
    mdiShieldAccount,
    mdiTarget,
    mdiTargetAccount
} from '@mdi/js';
import { useStore } from '@tdev-hooks/useStore';
import Button from '@tdev-components/shared/Button';
import useIsBrowser from '@docusaurus/useIsBrowser';
import Popup from 'reactjs-popup';
import _ from 'lodash';
import { useLocation } from '@docusaurus/router';
import { Confirm } from '@tdev-components/shared/Button/Confirm';

const ReguestTarget = observer(() => {
    const isBrowser = useIsBrowser();
    const userStore = useStore('userStore');
    const studentGroupStore = useStore('studentGroupStore');
    const socketStore = useStore('socketStore');
    const location = useLocation();

    const klass = location.pathname.split('/')[1];

    if (!isBrowser || !userStore.current?.hasElevatedAccess) {
        return null;
    }
    return (
        <Popup
            trigger={
                <div className={styles.accountSwitcher}>
                    <Button
                        icon={mdiLaptop}
                        size={0.8}
                        className={clsx(styles.navTarget)}
                        iconSide="left"
                        color="primary"
                        title={`Aktuelle Seite anzeigen für`}
                        onClick={() => userStore.switchUser(undefined)}
                    />
                </div>
            }
            on={['click']}
            closeOnDocumentClick
            closeOnEscape
        >
            <div className={clsx(styles.wrapper, 'card')}>
                <div className={clsx('card__header', styles.header)}>
                    <h4>Diese Seite anzeigen für:</h4>
                </div>
                <div className={clsx('card__body', styles.body)}>
                    <div className={clsx(styles.groups)}>
                        {studentGroupStore.managedStudentGroups.map((group) => {
                            return (
                                <div key={group.id} className={clsx(styles.group)}>
                                    <Button
                                        icon={mdiTarget}
                                        size={0.8}
                                        className={clsx(styles.accountSwitcherButton)}
                                        color="primary"
                                        title={`Seite für ${group.name} anzeigen`}
                                        onClick={() => {
                                            socketStore.requestNavigation([group.id], [], {
                                                type: 'target',
                                                target: location.pathname
                                            });
                                        }}
                                    >
                                        {group.name} ({(socketStore.connectedClients.get(group.id) || 1) - 1})
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </Popup>
    );
});

export default ReguestTarget;
