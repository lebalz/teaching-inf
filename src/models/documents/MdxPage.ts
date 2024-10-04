import { action, computed } from 'mobx';
import iDocument, { Source } from '@tdev-models/iDocument';
import { DocumentType, Document as DocumentProps, TypeDataMapping, Access } from '@tdev-api/document';
import DocumentStore from '@tdev-stores/DocumentStore';
import { TypeMeta } from '@tdev-models/DocumentRoot';

export interface MetaInit {
    readonly?: boolean;
}

export class ModelMeta extends TypeMeta<DocumentType.MdxPage> {
    readonly type = DocumentType.MdxPage;

    constructor(props: Partial<MetaInit>) {
        super(DocumentType.MdxPage, props.readonly ? Access.RO_User : undefined);
    }

    get defaultData(): TypeDataMapping[DocumentType.MdxPage] {
        return {};
    }
}

class MdxPage extends iDocument<DocumentType.MdxPage> {
    constructor(props: DocumentProps<DocumentType.MdxPage>, store: DocumentStore) {
        super(props, store);
    }

    @action
    setData(data: TypeDataMapping[DocumentType.MdxPage], from: Source, updatedAt?: Date): void {
        throw new Error('Nothing to set on MdxPage');
    }

    get data(): TypeDataMapping[DocumentType.MdxPage] {
        return {} as any;
    }

    @computed
    get meta(): ModelMeta {
        if (this.root?.type === DocumentType.MdxPage) {
            return this.root.meta as ModelMeta;
        }
        return new ModelMeta({});
    }
}

export default MdxPage;
