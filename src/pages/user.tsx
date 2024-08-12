import React from 'react';
import clsx from 'clsx';
import styles from './user.module.scss';
import Layout from '@theme/Layout';
import { observer } from 'mobx-react-lite';
import { Redirect } from '@docusaurus/router';
import { mdiLogout, mdiRefresh } from '@mdi/js';
import { useMsal } from '@azure/msal-react';
import { useIsAuthenticated } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import siteConfig from '@generated/docusaurus.config';
import { useStore } from '../hooks/useStore';
import CodeBlock from '@theme/CodeBlock';
import Button from '../components/shared/Button';
import Loader from '../components/Loader';
const { NO_AUTH } = siteConfig.customFields as { TEST_USERNAME?: string; NO_AUTH?: boolean };

const UserPage = observer(() => {
    const sessionStore = useStore('sessionStore');
    const userStore = useStore('userStore');
    const isAuthenticated = useIsAuthenticated();
    const { inProgress } = useMsal();
    const { current } = userStore;
    if (
        !NO_AUTH &&
        ((sessionStore.currentUserId && !sessionStore.isLoggedIn) || inProgress !== InteractionStatus.None)
    ) {
        return <Loader />;
    }
    if (!NO_AUTH && !(sessionStore.isLoggedIn || isAuthenticated)) {
        return <Redirect to={'/login'} />;
    }
    return (
        <Layout>
            <main className={clsx(styles.main)}>
                <h2>User</h2>
                <h3>
                    Eingeloggt als {current?.firstName} {current?.lastName}
                </h3>

                <a
                    className={clsx('button', 'button--secondary')}
                    href={`mailto:balthasar.hofer@gbsl.ch?subject=[${window.location.hostname}]: Datenlöschung für ${current?.email}&body=Guten Tag%0D%0A%0D%0A
Hiermit beantrage ich die vollständige und unwiderrufliche Löschung meiner Daten der Webseite ${window.location.hostname}.%0D%0A%0D%0A

E-Mail: ${current?.email}%0D%0A
Account-ID: ${current?.id}%0D%0A%0D%0A

Bitte bestätigen Sie die Löschung meiner Daten.%0D%0A%0D%0A

Freundliche Grüsse,%0D%0A
${current?.firstName} ${current?.lastName} &cc=${current?.email}`}
                >
                    Datenlöschung beantragen
                </a>
                <h2>Logout</h2>
                <span style={{ display: 'flex', gap: '1em' }}>
                    <Button
                        onClick={() => sessionStore.logout()}
                        text="Logout"
                        title="User Abmelden"
                        color="red"
                        icon={mdiLogout}
                        iconSide="left"
                        noOutline
                        className={clsx(styles.logout)}
                    />
                    <Button
                        text="LocalStorage löschen"
                        icon={mdiRefresh}
                        iconSide="left"
                        onClick={() => {
                            localStorage.clear();
                            window.location.reload();
                        }}
                        color="orange"
                        noOutline
                    />
                </span>
            </main>
        </Layout>
    );
});
export default UserPage;
