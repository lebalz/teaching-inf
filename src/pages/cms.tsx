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
import { ApiState } from '@tdev-stores/iStore';
import { mdiLoading } from '@mdi/js';
import MdxEditor from '@tdev-components/MdxEditor';
import Selector from '@tdev-components/Github/Branch/Selector';

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
                <Selector
                    onSelect={(branchName) => {
                        if (githubStore.branchNames.includes(branchName)) {
                            githubStore.setBranch(branchName);
                        } else {
                            githubStore.createNewBranch(branchName).then((branch) => {
                                githubStore.setBranch(branchName);
                            });
                        }
                    }}
                />
                <CodeBlock className="language-json" title="Github Token">
                    {JSON.stringify({ accessToken: githubStore.accessToken }, null, 2)}
                </CodeBlock>
                <h4>Files</h4>
                <ul>
                    {githubStore.currentBranch.map((entry, idx) => {
                        if (entry.type === 'file' || entry.type === 'file_stub') {
                            return <File file={entry} key={entry.path} />;
                        }
                        return <Dir dir={entry} key={entry.path} />;
                    })}
                </ul>
                {githubStore.editedFile && githubStore.editedFile.content && (
                    <MdxEditor file={githubStore.editedFile} key={githubStore.editedFile.downloadUrl} />
                )}
                <h4>Pulls</h4>
                <ul>
                    {githubStore.pulls.map((pull, idx) => {
                        return (
                            <li
                                key={idx}
                            >{`#${pull.number}: ${pull.title} --> ${pull.head.ref} ${pull.head.repo.owner.login}`}</li>
                        );
                    })}
                </ul>
            </main>
        </Layout>
    );
});
export default GhCallback;
