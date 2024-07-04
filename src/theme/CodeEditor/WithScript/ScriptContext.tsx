import React from "react";
import { observer } from "mobx-react-lite";
import { InitState } from "docusaurus-live-brython/theme/CodeEditor/WithScript/Types";
import Document from "@site/src/models/Document";
import { useStore } from "@site/src/hooks/useStore";
export const Context = React.createContext<Document | undefined>(undefined);
import { v4 as uuidv4 } from 'uuid';

const ScriptContext = observer((props: InitState & { children: React.ReactNode; }) => {
    const [id, setId] = React.useState<string>(props.id || uuidv4());
    const documentStore = useStore('documentStore');
    React.useEffect(() => {
        const doc = documentStore.find(id);
        if (doc) {
            return;
        }
        const document = new Document({...props, id: id}, documentStore);
        documentStore.addDocument(document);
    }, [props.id, documentStore]);

    if (!documentStore.find(id)) {
        return <div>Load</div>;
    }
    return (
        <Context.Provider value={documentStore.find(id)}>
            {props.children}
        </Context.Provider>
    );
});

export default ScriptContext;