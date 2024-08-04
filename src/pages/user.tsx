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
                <CodeBlock language="json" title="API-User Props" showLineNumbers>
                    {JSON.stringify(current?.props, null, 2)}
                </CodeBlock>
                <h3>MSAL</h3>
                <CodeBlock language="json" title="MSAL-User" showLineNumbers>
                    {JSON.stringify(sessionStore.account, null, 2)}
                </CodeBlock>

                <h2>Logout</h2>
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
            </main>
        </Layout>
    );
});
export default UserPage;
