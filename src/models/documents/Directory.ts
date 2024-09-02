import { action, computed, observable } from 'mobx';
import iDocument, { Source } from '../iDocument';
import { DocumentType, Document as DocumentProps, TypeDataMapping, Access } from '@site/src/api/document';
import DocumentStore from '@site/src/stores/DocumentStore';
import { TypeMeta } from '../DocumentRoot';
import { formatDateTime } from '../helpers/date';
import _ from 'lodash';
import File from './File';

export interface MetaInit {
    readonly?: boolean;

    name?: string;
    isOpen?: boolean;
}

export class ModelMeta extends TypeMeta<DocumentType.Dir> {
    readonly type = DocumentType.Dir;
    readonly readonly?: boolean;
    readonly isOpen: boolean;
    readonly name: string;
    constructor(props: Partial<MetaInit>) {
        super(DocumentType.Dir, props.readonly ? Access.RO_User : undefined);
        this.readonly = props.readonly;
        this.name = props.name || `Ordner ${formatDateTime(new Date())}`;
        this.isOpen = props.isOpen || false;
    }

    get defaultData(): TypeDataMapping[DocumentType.Dir] {
        return {
            name: this.name
        };
    }
}

class Directory extends iDocument<DocumentType.Dir> {
    @observable accessor name: string;
    @observable accessor isOpen: boolean;

    constructor(props: DocumentProps<DocumentType.Dir>, store: DocumentStore) {
        super(props, store);
        this.name = props.data?.name || this.meta.name;
        this.isOpen = this.meta.isOpen;
    }

    @action
    setData(data: TypeDataMapping[DocumentType.Dir], from: Source, updatedAt?: Date): void {
        this.name = data.name;
        if (from === Source.LOCAL) {
            this.save();
        }
        if (updatedAt) {
            this.updatedAt = new Date(updatedAt);
        }
    }

    get data(): TypeDataMapping[DocumentType.Dir] {
        return {
            name: this.name
        };
    }

    @computed
    get meta(): ModelMeta {
        if (this.root?.type === DocumentType.Dir) {
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
    get files() {
        if (!this.root) {
            return [];
        }
        return this.root.documents.filter(
            (d) => d.parentId === this.id && d.type === DocumentType.File
        ) as File[];
    }

    @computed
    get directories() {
        if (!this.root) {
            return [];
        }
        return this.root.documents.filter(
            (d) => d.parentId === this.id && d.type === DocumentType.Dir
        ) as Directory[];
    }
}

export default Directory;
