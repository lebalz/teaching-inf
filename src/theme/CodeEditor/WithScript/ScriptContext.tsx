import React, { useId } from 'react';
import { observer } from 'mobx-react-lite';
import { InitState } from 'docusaurus-live-brython/theme/CodeEditor/WithScript/Types';
import Script from '@site/src/models/documents/Script';
import { useStore } from '@site/src/hooks/useStore';
import { useDocumentRoot } from '@site/src/hooks/useDocumentRoot';
import { Access, Document, DocumentType, TypeDataMapping } from '@site/src/api/document';
import { TypeMeta } from '@site/src/models/DocumentRoot';
export const Context = React.createContext<Script | undefined>(undefined);

export class ScriptMeta extends TypeMeta<DocumentType.Script> {
    readonly type = DocumentType.Script;
    readonly title: string;
    readonly lang: 'py' | string;
    readonly preCode: string;
    readonly postCode: string;
    readonly readonly: boolean;
    readonly versioned: boolean;
    readonly initCode: string;

    constructor(props: Partial<Omit<InitState, 'id'>>) {
        super(DocumentType.Script, props.readonly ? Access.RO : undefined);
        this.title = props.title || '';
        this.lang = props.lang || 'py';
        this.preCode = props.preCode || '';
        this.postCode = props.postCode || '';
        this.readonly = props.readonly || false;
        this.versioned = props.versioned || false;
        this.initCode = props.code || '';
    }

    get defaultData(): TypeDataMapping[DocumentType.Script] {
        return {
            code: this.initCode
        };
    }
}

const ScriptContext = observer((props: InitState & { children: React.ReactNode }) => {
    const [meta] = React.useState(new ScriptMeta(props));
    const documentRootId = useDocumentRoot(props.id, meta);
    const documentRootStore = useStore('documentRootStore');
    const documentRoot = documentRootStore.find<DocumentType.Script>(documentRootId);

    if (!documentRoot || !documentRoot.firstMainDocument) {
        return <div>Load</div>;
    }
    return <Context.Provider value={documentRoot.firstMainDocument}>{props.children}</Context.Provider>;
});

export default ScriptContext;
