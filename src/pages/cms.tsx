import React from 'react';
import clsx from 'clsx';
import styles from './login.module.scss';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { observer } from 'mobx-react-lite';
import { useStore } from '@tdev-hooks/useStore';
import CodeBlock from '@theme/CodeBlock';
import File from '@tdev-components/Github/iFile/File';
import Dir from '@tdev-components/Github/iFile/Dir';
import MdxEditor from '@tdev-components/MdxEditor';
import Selector from '@tdev-components/Github/Branch/Selector';
import { useGithubAccess } from '@tdev-hooks/useGithubAccess';
import { Redirect } from '@docusaurus/router';
import Details from '@theme/Details';
import { ApiState } from '@tdev-stores/iStore';
import Loader from '@tdev-components/Loader';
import Card from '@tdev-components/shared/Card';

function HomepageHeader() {
    const { siteConfig } = useDocusaurusContext();
    return (
        <header className={clsx('hero hero--primary', 'gugus', styles.heroBanner)}>
            <div className="container">
                <h1 className="hero__title">{siteConfig.title}</h1>
                <p className="hero__subtitle">{siteConfig.tagline}</p>
            </div>
        </header>
    );
}

const GhCallback = observer(() => {
    const cmsStore = useStore('cmsStore');
    const access = useGithubAccess();
    const { settings, github } = cmsStore;
    if (access === 'no-token') {
        return <Redirect to={'/gh-login'} />;
    }
    if (access === 'loading' || !settings || !github) {
        return <Layout>Loading...</Layout>;
    }
    return (
        <Layout>
            <HomepageHeader />
            <main>
                <Selector
                    onSelect={(branchName) => {
                        if (cmsStore.refNames.includes(branchName)) {
                            cmsStore.setBranch(branchName);
                        } else {
                            github.createNewBranch(branchName).then((branch) => {
                                cmsStore.setBranch(branchName);
                            });
                        }
                    }}
                />
                {cmsStore.editedFile && cmsStore.editedFile.content ? (
                    <MdxEditor file={cmsStore.editedFile} key={cmsStore.editedFile.downloadUrl} />
                ) : (
                    <>
                        {github.apiStates.get(`${settings.activeBranchName}:${settings.activePath}`) ===
                            ApiState.SYNCING && (
                            <Card>
                                <Loader
                                    label={`${settings.activeBranchName}:${settings.activePath} wird geladen...`}
                                    size={2}
                                />
                            </Card>
                        )}
                    </>
                )}
                <Details summary={'Files'}>
                    <h4>Files</h4>
                    <ul>
                        {cmsStore.refsRootEntries.map((entry, idx) => {
                            if (entry.type === 'file' || entry.type === 'file_stub') {
                                return <File file={entry} key={entry.path} />;
                            }
                            return <Dir dir={entry} key={entry.path} />;
                        })}
                    </ul>
                </Details>
                <Details summary={'PRs'}>
                    <h4>Pulls</h4>
                    <ul>
                        {github.pulls.map((pull, idx) => {
                            return (
                                <li
                                    key={idx}
                                >{`#${pull.number}: ${pull.title} --> ${pull.head.ref} ${pull.head.repo.owner.login}`}</li>
                            );
                        })}
                    </ul>
                </Details>
            </main>
        </Layout>
    );
});
export default GhCallback;
