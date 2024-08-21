import React from 'react';
import { observer } from 'mobx-react-lite';
import { InitState } from 'docusaurus-live-brython/theme/CodeEditor/WithScript/Types';
import Script, { ScriptMeta } from '@site/src/models/documents/Script';
import { useFirstMainDocument } from '@site/src/hooks/useFirstMainDocument';
import Loader from '@site/src/components/Loader';
import CodeBlock from '@theme/CodeBlock';
import useIsBrowser from '@docusaurus/useIsBrowser';
import { useStore as useMobxStore } from '@site/src/hooks/useStore';
import clsx from 'clsx';
import styles from './styles.module.scss';
export const Context = React.createContext<Script | undefined>(undefined);

const ScriptContext = observer((props: InitState & { children: JSX.Element }) => {
    const userStore = useMobxStore('userStore');
    const isBrowser = useIsBrowser();
    const [meta] = React.useState(new ScriptMeta(props));
    const doc = useFirstMainDocument(props.id, meta);
    if (!isBrowser) {
        return <CodeBlock language={props.lang}>{props.code}</CodeBlock>;
    }

    if (!doc || !doc.isInitialized) {
        return (
            <div style={{ position: 'relative' }}>
                <CodeBlock language={props.lang}>{props.code}</CodeBlock>
                <Loader label="Editor laden..." overlay />
            </div>
        );
    }
    return (
        <div className={clsx(styles.editor)}>
            {props.id && userStore.isUserSwitched && (
                <span className={clsx('badge', 'badge--primary', styles.badge)}>
                    {userStore.viewedUser?.nameShort}
                </span>
            )}
            <Context.Provider value={doc}>{props.children}</Context.Provider>
        </div>
    );
});

export default ScriptContext;
