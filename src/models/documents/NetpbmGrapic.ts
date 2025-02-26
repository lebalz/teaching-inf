import { action, computed, observable } from 'mobx';
import iDocument, { Source } from '@tdev-models/iDocument';
import { DocumentType, Document as DocumentProps, TypeDataMapping, Access } from '@tdev-api/document';
import DocumentStore from '@tdev-stores/DocumentStore';
import { TypeMeta } from '@tdev-models/DocumentRoot';

export interface MetaInit {
    readonly?: boolean; // TODO: Do we need this here?
    default?: string; // TODO: Do we need this here?
    // TODO: Do we need noEditor?
}

export class ModelMeta extends TypeMeta<DocumentType.NetpbmGraphic> {
    readonly type = DocumentType.NetpbmGraphic;
    readonly readonly?: boolean;
    readonly default?: string; // TODO: Do we need this here?
    // TODO: Do we need noEditor?

    constructor(props: Partial<MetaInit>) {
        super(DocumentType.NetpbmGraphic, props.readonly ? Access.RO_User : undefined);
        this.readonly = props.readonly;
        this.default = props.default;
    }

    get defaultData(): TypeDataMapping[DocumentType.NetpbmGraphic] {
        return {
            imageData: this.default || ''
        };
    }
}

class NetpbmGraphic extends iDocument<DocumentType.NetpbmGraphic> {
    @observable accessor imageData: string;
    constructor(props: DocumentProps<DocumentType.NetpbmGraphic>, store: DocumentStore) {
        super(props, store);
        this.imageData = props.data?.imageData || '';
    }

    @action
    setData(data: TypeDataMapping[DocumentType.NetpbmGraphic], from: Source, updatedAt?: Date): void {
        this.imageData = data.imageData;
        if (from === Source.LOCAL) {
            this.save();
        }
        if (updatedAt) {
            this.updatedAt = new Date(updatedAt);
        }
    }

    get data(): TypeDataMapping[DocumentType.NetpbmGraphic] {
        return {
            imageData: this.imageData
        };
    }

    @computed
    get meta(): ModelMeta {
        if (this.root?.type === DocumentType.NetpbmGraphic) {
            return this.root.meta as ModelMeta;
        }
        return new ModelMeta({});
    }
}

export default NetpbmGraphic;
