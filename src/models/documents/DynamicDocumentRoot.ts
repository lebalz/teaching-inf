import { action, computed } from 'mobx';
import iDocument, { Source } from '@tdev-models/iDocument';
import { DocumentType, Document as DocumentProps, TypeDataMapping, Access } from '@tdev-api/document';
import DocumentStore from '@tdev-stores/DocumentStore';
import { TypeMeta } from '@tdev-models/DocumentRoot';

export interface MetaInit {
    readonly?: boolean;
}

export class ModelMeta extends TypeMeta<DocumentType.DynamicDocumentRoot> {
    readonly type = DocumentType.DynamicDocumentRoot;
    readonly name: string;

    constructor(props: Partial<MetaInit>, name: string) {
        super(DocumentType.DynamicDocumentRoot, props.readonly ? Access.RO_User : undefined);
        this.name = name;
    }

    get defaultData(): TypeDataMapping[DocumentType.DynamicDocumentRoot] {
        return {};
    }
}

class DynamicDocumentRoot extends iDocument<DocumentType.DynamicDocumentRoot> {
    constructor(props: DocumentProps<DocumentType.DynamicDocumentRoot>, store: DocumentStore) {
        super(props, store);
        throw new Error('Model not implemented.');
    }

    @action
    setData(data: TypeDataMapping[DocumentType.DynamicDocumentRoot], from: Source, updatedAt?: Date): void {
        throw new Error('Method not implemented.');
    }

    get data(): TypeDataMapping[DocumentType.DynamicDocumentRoot] {
        return {};
    }

    @computed
    get meta(): ModelMeta {
        throw new Error('Method not implemented.');
    }
}

export default DynamicDocumentRoot;
