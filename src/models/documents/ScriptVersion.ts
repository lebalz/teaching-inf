import iDocument from '../iDocument';
import { DocumentType, Document as DocumentProps, ScriptVersionData } from '@site/src/api/document';
import DocumentStore from '@site/src/stores/DocumentStore';
import { Version } from 'docusaurus-live-brython/theme/CodeEditor/WithScript/Types';

class ScriptVersion extends iDocument<DocumentType.ScriptVersion> implements Version {
    constructor(props: DocumentProps<DocumentType.ScriptVersion>, store: DocumentStore) {
        super(props, store);
    }

    setData(data: ScriptVersionData): void {
        throw new Error('ScriptVersions can not be updated.');
    }

    get data() {
        return this._pristine;
    }

    get code() {
        return this.data.code;
    }

    get version() {
        return this.data.version;
    }

    get pasted() {
        return this.data.pasted;
    }
}

export default ScriptVersion;
