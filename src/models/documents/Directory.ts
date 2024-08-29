import { action, computed, observable } from 'mobx';
import iDocument, { Source } from '../iDocument';
import { DocumentType, Document as DocumentProps, TypeDataMapping, Access } from '@site/src/api/document';
import DocumentStore from '@site/src/stores/DocumentStore';
import { TypeMeta } from '../DocumentRoot';
import { formatDateTime } from '../helpers/date';

export interface MetaInit {
    readonly?: boolean;

    name?: string;
    isExpanded?: boolean;
    sanitizer?: (val: string) => string;
    checker?: (val: string | undefined) => boolean;
}

export class ModelMeta extends TypeMeta<DocumentType.Dir> {
    readonly type = DocumentType.Dir;
    readonly readonly?: boolean;
    readonly isExpanded: boolean;
    readonly name: string;
    constructor(props: Partial<MetaInit>) {
        super(DocumentType.Dir, props.readonly ? Access.RO_User : undefined);
        this.readonly = props.readonly;
        this.name = props.name || `Ordner ${formatDateTime(new Date())}`;
        this.isExpanded = props.isExpanded || false;
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
        this.isOpen = this.meta.isExpanded;
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
}

export default Directory;
