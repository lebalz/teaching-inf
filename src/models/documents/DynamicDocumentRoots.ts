import { action, computed, observable } from 'mobx';
import iDocument, { Source } from '@tdev-models/iDocument';
import {
    DocumentType,
    Document as DocumentProps,
    TypeDataMapping,
    Access,
    DynamicDocumentRoot
} from '@tdev-api/document';
import DocumentStore from '@tdev-stores/DocumentStore';
import { TypeMeta } from '@tdev-models/DocumentRoot';
import { ModelMeta as DynamicDocRootMeta } from '@tdev-models/documents/DynamicDocumentRoot';

export interface MetaInit {
    readonly?: boolean;
}

export class ModelMeta extends TypeMeta<DocumentType.DynamicDocumentRoots> {
    readonly type = DocumentType.DynamicDocumentRoots;

    constructor(props: Partial<MetaInit>) {
        super(DocumentType.DynamicDocumentRoots, props.readonly ? Access.RO_User : undefined);
    }

    get defaultData(): TypeDataMapping[DocumentType.DynamicDocumentRoots] {
        return {
            documentRoots: []
        };
    }
}

class DynamicDocumentRoots extends iDocument<DocumentType.DynamicDocumentRoots> {
    dynamicDocumentRoots = observable.array<DynamicDocumentRoot>([]);

    constructor(props: DocumentProps<DocumentType.DynamicDocumentRoots>, store: DocumentStore) {
        super(props, store);
        this.dynamicDocumentRoots.replace(props.data.documentRoots);
        this.loadDynamicDocumentRoots();
    }

    @action
    setData(data: TypeDataMapping[DocumentType.DynamicDocumentRoots], from: Source, updatedAt?: Date): void {
        this.dynamicDocumentRoots.replace(data.documentRoots);
        this.loadDynamicDocumentRoots();
        if (from === Source.LOCAL) {
            this.save();
        }
        if (updatedAt) {
            this.updatedAt = new Date(updatedAt);
        }
    }

    get data(): TypeDataMapping[DocumentType.DynamicDocumentRoots] {
        return {
            documentRoots: this.dynamicDocumentRoots.slice()
        };
    }

    @action
    loadDynamicDocumentRoots() {
        this.dynamicDocumentRoots.forEach((dynamicDocumentRoot) => {
            if (this.store.root.documentRootStore.find(dynamicDocumentRoot.id)) {
                return;
            }
            this.store.root.documentRootStore.loadInNextBatch(
                dynamicDocumentRoot.id,
                new DynamicDocRootMeta({}, dynamicDocumentRoot.name),
                {
                    documents: true,
                    userPermissions: true,
                    groupPermissions: true
                }
            );
        });
    }

    @computed
    get meta(): ModelMeta {
        if (this.root?.type === DocumentType.DynamicDocumentRoots) {
            return this.root.meta as ModelMeta;
        }
        return new ModelMeta({});
    }
}

export default DynamicDocumentRoots;
