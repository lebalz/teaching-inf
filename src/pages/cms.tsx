import React from 'react';
import clsx from 'clsx';
import styles from './login.module.scss';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Link from '@docusaurus/Link';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { observer } from 'mobx-react-lite';
import { Redirect, useHistory } from '@docusaurus/router';
import { tokenRequest } from '@tdev/authConfig';
import siteConfig from '@generated/docusaurus.config';
import Translate from '@docusaurus/Translate';
import { useStore } from '@tdev-hooks/useStore';
import { useLocation } from '@docusaurus/router';
import CodeBlock from '@theme/CodeBlock';
import Button from '@tdev-components/shared/Button';
import File from '@tdev-components/Github/iFile/File';
import Dir from '@tdev-components/Github/iFile/Dir';

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
    return (
        <Layout>
            <HomepageHeader />
            <main>
                <CodeBlock className="language-json" title="Github Token">
                    {JSON.stringify({ accessToken: githubStore.accessToken }, null, 2)}
                </CodeBlock>
                <details>
                    <CodeBlock className="language-json" title="Github Token">
                        {JSON.stringify(
                            githubStore.entries.get(githubStore.branch || '')?.map((e) => e.props),
                            null,
                            2
                        )}
                    </CodeBlock>
                </details>
                <ul>
                    {githubStore.currentBranch.map((entry, idx) => {
                        if (entry.type === 'file') {
                            return <File file={entry} key={entry.path} />;
                        }
                        return <Dir dir={entry} key={entry.path} />;
                    })}
                </ul>
            </main>
        </Layout>
    );
});
export default GhCallback;
