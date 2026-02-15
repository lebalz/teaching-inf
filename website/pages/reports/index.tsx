import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { useStore } from '@tdev-hooks/useStore';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import SelectInput from '@tdev-components/shared/SelectInput';
import { orderBy } from 'es-toolkit/array';
import DocumentReport from './DocumentReport';

interface Props {}

const Reports = observer((props: Props) => {
    const userStore = useStore('userStore');
    const pageStore = useStore('pageStore');
    const componentStore = useStore('componentStore');
    const [version, setVersion] = React.useState<string>('');
    const [pagePath, setPagePath] = React.useState<string | null>(null);
    React.useEffect(() => {
        pageStore.loadPageIndex().then(() => {
            const version = pageStore.sidebarVersions[0]?.versionPath || '/';
            setVersion(version);
            const def = '/OF-Programmieren-1/functions/';
            const page = pageStore.pages.find((p) => p.path === def);
            if (page) {
                pageStore.loadLinkedDocumentRoots(page);
            }
            setPagePath(page?.path || null);
        });
    }, [pageStore]);

    const page = pageStore.findByPath(pagePath || undefined);
    return (
        <Layout wrapperClassName={clsx(styles.reportsPage)}>
            <Heading as="h1">Reports {version}</Heading>
            <div className={clsx(styles.selection)}>
                <SelectInput
                    options={pageStore.sidebarVersions.map((v) => ({
                        value: v.versionPath
                    }))}
                    onChange={(val) => {
                        setVersion(val);
                    }}
                    value={version}
                />
                <SelectInput
                    options={orderBy(
                        pageStore.pages
                            .filter((p) => p.studentGroupName === version)
                            .map((v) => ({
                                value: v.path
                            })),
                        ['value'],
                        ['asc']
                    )}
                    onChange={(val) => {
                        setPagePath(val || null);
                        const page = pageStore.findByPath(val);
                        if (page) {
                            pageStore.loadLinkedDocumentRoots(page);
                        }
                    }}
                    value={pagePath || ''}
                />
            </div>
            {page && (
                <div>
                    {page.documentRoots.map((root) => {
                        const doc = root.firstMainDocument;
                        if (!doc) {
                            return null;
                        }
                        return <DocumentReport key={doc.id} doc={doc} />;
                    })}
                    {/* <h2>{page.documentRoots.length} Document Roots</h2> */}
                    {/* <CodeBlock language="json">{JSON.stringify(page.documentRootConfigs, null, 2)}</CodeBlock> */}
                </div>
            )}
        </Layout>
    );
});

export default Reports;
