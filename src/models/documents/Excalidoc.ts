import { action, computed, observable } from 'mobx';
import iDocument, { Source } from '../iDocument';
import {
    DocumentType,
    Document as DocumentProps,
    TaskStateData,
    StateType,
    TypeDataMapping,
    Access
} from '@site/src/api/document';
import DocumentStore from '@site/src/stores/DocumentStore';
import { TypeMeta } from '../DocumentRoot';

export interface MetaInit {
    readonly?: boolean;
}

// TODO: replace all DocumentType.Excalidoc values to your new models Type
export class ModelMeta extends TypeMeta<DocumentType.Excalidoc> {
    readonly type = DocumentType.Excalidoc;

    constructor(props: Partial<MetaInit>) {
        super(DocumentType.Excalidoc, props.readonly ? Access.RO_User : undefined);
    }

    get defaultData(): TypeDataMapping[DocumentType.Excalidoc] {
        return {
            
        };
    }
}

class Excalidoc extends iDocument<DocumentType.Excalidoc> {
    constructor(props: DocumentProps<DocumentType.Excalidoc>, store: DocumentStore) {
        super(props, store);
    }

    @action
    setData(data: TypeDataMapping[DocumentType.Excalidoc], from: Source, updatedAt?: Date): void {
        // TODO: change state according to data
        if (from === Source.LOCAL) {
            this.save();
        }
        if (updatedAt) {
            this.updatedAt = new Date(updatedAt);
        }
    }

    get data(): TypeDataMapping[DocumentType.Excalidoc] {
        // TODO: return correct data
        return {} as any;
    }

    @computed
    get meta(): ModelMeta {
        if (this.root?.type === DocumentType.Excalidoc) {
            return this.root.meta as ModelMeta;
        }
        return new ModelMeta({});
    }
}

export default Excalidoc;
