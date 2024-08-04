import React from 'react';
import { observer } from 'mobx-react-lite';
import { InitState } from 'docusaurus-live-brython/theme/CodeEditor/WithScript/Types';
import Script, { ScriptMeta } from '@site/src/models/documents/Script';
import { useFirstMainDocument } from '@site/src/hooks/useFirstMainDocument';
import Loader from '@site/src/components/Loader';
export const Context = React.createContext<Script | undefined>(undefined);

const ScriptContext = observer((props: InitState & { children: JSX.Element }) => {
    const [meta] = React.useState(new ScriptMeta(props));
    const doc = useFirstMainDocument(props.id, meta);

    if (!doc) {
        return <Loader label="Code laden..." />;
    }
    return <Context.Provider value={doc}>{props.children}</Context.Provider>;
});

export default ScriptContext;
