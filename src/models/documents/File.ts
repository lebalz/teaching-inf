import { action, computed, observable } from 'mobx';
import iDocument, { Source } from '../iDocument';
import { DocumentType, Document as DocumentProps, TypeDataMapping, Access } from '@site/src/api/document';
import DocumentStore from '@site/src/stores/DocumentStore';
import { TypeMeta } from '../DocumentRoot';
import { formatDateTime } from '../helpers/date';
import _ from 'lodash';

export interface MetaInit {
    readonly?: boolean;

    name?: string;
}

export class ModelMeta extends TypeMeta<DocumentType.File> {
    readonly type = DocumentType.File;
    readonly readonly?: boolean;
    readonly name: string;
    constructor(props: Partial<MetaInit>) {
        super(DocumentType.File, props.readonly ? Access.RO_User : undefined);
        this.readonly = props.readonly;
        this.name = props.name || `File ${formatDateTime(new Date())}`;
    }

    get defaultData(): TypeDataMapping[DocumentType.File] {
        return {
            name: this.name
        };
    }
}

class File extends iDocument<DocumentType.File> {
    @observable accessor name: string;
    @observable accessor isOpen: boolean = false;

    constructor(props: DocumentProps<DocumentType.File>, store: DocumentStore) {
        super(props, store);
        this.name = props.data?.name || this.meta.name;
    }

    @action
    setData(data: TypeDataMapping[DocumentType.File], from: Source, updatedAt?: Date): void {
        this.name = data.name;
        if (from === Source.LOCAL) {
            this.save();
        }
        if (updatedAt) {
            this.updatedAt = new Date(updatedAt);
        }
    }

    get data(): TypeDataMapping[DocumentType.File] {
        return {
            name: this.name
        };
    }

    @computed
    get meta(): ModelMeta {
        if (this.root?.type === DocumentType.File) {
            return this.root.meta as ModelMeta;
        }
        return new ModelMeta({});
    }

    @action
    setIsOpen(isOpen: boolean) {
        this.isOpen = isOpen;
    }

    @action
    setName(name: string) {
        this.setData({ name: name }, Source.LOCAL, new Date());
    }

    @computed
    get document() {
        return this.store.findByParentId(this.id);
    }
}

export default File;
