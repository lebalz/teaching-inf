import React from 'react';
import clsx from 'clsx';
import styles from './login.module.scss';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { observer } from 'mobx-react-lite';
import { useHistory } from '@docusaurus/router';
import { useStore } from '@tdev-hooks/useStore';
import { useLocation } from '@docusaurus/router';
import CodeBlock from '@theme/CodeBlock';

function HomepageHeader() {
    const { siteConfig } = useDocusaurusContext();
    return (
        <header className={clsx('hero hero--primary', styles.heroBanner)}>
            <div className="container">
                <h1 className="hero__title">{siteConfig.title}</h1>
                <p className="hero__subtitle">{siteConfig.tagline}</p>
            </div>
        </header>
    );
}

const GhCallback = observer(() => {
    const githubStore = useStore('githubStore');
    const location = useLocation();
    const history = useHistory();
    const code = new URLSearchParams(location.search).get('code');

    React.useEffect(() => {
        if (githubStore.accessToken) {
            return;
        }
        if (code) {
            githubStore.fetchAccessToken(code).then((token) => {
                console.log('Token:', token);
                if (token) {
                    history.push('/cms');
                } else {
                    history.push('/gh-login');
                }
            });
        }
    }, [code]);
    return (
        <Layout>
            <HomepageHeader />
            <main>
                <CodeBlock className="language-json">
                    {JSON.stringify({ code, accessToken: githubStore.accessToken }, null, 2)}
                </CodeBlock>
            </main>
        </Layout>
    );
});
export default GhCallback;
