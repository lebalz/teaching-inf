import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { useStore } from '@tdev-hooks/useStore';
import { ScriptMeta } from '@tdev-models/documents/Script';
import { MetaProps } from '@tdev/theme/CodeBlock';
import { useFirstRealMainDocument } from '@tdev-hooks/useFirstRealMainDocument';
import Loader from '@tdev-components/Loader';
import PermissionsPanel from '@tdev-components/PermissionsPanel';
import { useFirstMainDocument } from '@tdev-hooks/useFirstMainDocument';
import CodeEditorComponent from '..';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import ErrorBoundary from '@docusaurus/ErrorBoundary';
import CodeBlock from '@theme/CodeBlock';
import Card from '@tdev-components/shared/Card';
import Button from '@tdev-components/shared/Button';

export interface Props extends Omit<MetaProps, 'live_jsx' | 'live_py' | 'title'> {
    title?: string;
    code?: string;
    showLineNumbers?: boolean;
    className?: string;
    children?: React.ReactNode;
}

const getInitialCode = (props: Props) => {
    const childData: string | undefined = props.children
        ? typeof props.children === 'string'
            ? props.children // inline-text
            : Array.isArray(props.children) // expectation: the relevant data is provided
              ? //    code-block     >    it's first child contains the text
                props.children[0]?.props?.children?.props?.children
              : undefined
        : undefined;
    return childData || props.code || '';
};

const SvgEditor = observer((props: Props) => {
    const id = props.slim ? undefined : props.id;
    const [meta] = React.useState(
        new ScriptMeta({ title: 'SVG', ...props, code: getInitialCode(props), lang: 'svg' })
    );
    const doc = useFirstMainDocument(id, meta);
    if (!ExecutionEnvironment.canUseDOM || !doc) {
        return <CodeBlock language="svg">{props.code}</CodeBlock>;
    }
    if (!doc.canDisplay && props.id) {
        return (
            <div>
                <PermissionsPanel documentRootId={props.id} />
            </div>
        );
    }

    return (
        <div className={clsx(styles.svgEditor)}>
            <div className={clsx(styles.editor)}>
                <CodeEditorComponent script={doc} className={clsx(styles.code)} />
            </div>
            <Card classNames={{ card: styles.svgCard, body: styles.svgCardBody }}>
                <ErrorBoundary
                    fallback={({ error, tryAgain }) => (
                        <div>
                            <div className={clsx('alert', 'alert--danger')} role="alert">
                                <div>Invalides SVG 😵‍💫: {error.message}</div>
                                Ändere den Code und versuche es erneut 😎.
                                <Button onClick={tryAgain}>Nochmal versuchen</Button>
                            </div>
                        </div>
                    )}
                >
                    <div className={clsx(styles.svgResult)} dangerouslySetInnerHTML={{ __html: doc?.code }} />
                    {/* <div className={clsx(styles.svgResult)}>
                    </div> */}
                </ErrorBoundary>
            </Card>
        </div>
    );
});

export default SvgEditor;
