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
import DocumentRoot, { TypeMeta } from '@tdev-models/DocumentRoot';
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
    readonly type = DocumentType.DynamicDocumentRoots;
    _dynamicDocumentRoots = observable.array<DynamicDocumentRoot>([]);

    constructor(props: DocumentProps<DocumentType.DynamicDocumentRoots>, store: DocumentStore) {
        super(props, store);
        this._dynamicDocumentRoots.replace(props.data.documentRoots);
        this.loadDynamicDocumentRoots();
    }

    @action
    setData(data: TypeDataMapping[DocumentType.DynamicDocumentRoots], from: Source, updatedAt?: Date): void {
        this._dynamicDocumentRoots.replace(data.documentRoots);
        // this.loadDynamicDocumentRoots();
        if (from === Source.LOCAL) {
            this.save();
        } else {
            this.loadDynamicDocumentRoots();
        }
        if (updatedAt) {
            this.updatedAt = new Date(updatedAt);
        }
    }

    @action
    addDynamicDocumentRoot(id: string, name: string) {
        this.store.root.documentRootStore
            .create(id, new DynamicDocRootMeta({}, id, this.id, this.store.root.documentStore), {})
            .then((dynRoot) => {
                this.setData(
                    {
                        documentRoots: [...this._dynamicDocumentRoots, { id, name }]
                    },
                    Source.LOCAL,
                    new Date()
                );
                return this.saveNow();
            })
            .catch((e) => {
                const createdDynDoc = this.store.root.documentRootStore.find(id);
                if (createdDynDoc) {
                    this.store.root.documentRootStore.destroy(createdDynDoc);
                }
            });
    }

    @action
    removeDynamicDocumentRoot(id: string) {
        if (!this._dynamicDocumentRoots.find((dr) => dr.id === id)) {
            return;
        }
        const ddRoot = this.dynamicDocumentRoots.find((dr) => dr.id === id);
        if (ddRoot) {
            this.store.root.documentRootStore
                .destroy(ddRoot)
                .then(
                    action(() => {
                        this.setData(
                            { documentRoots: this._dynamicDocumentRoots.filter((dr) => dr.id !== id) },
                            Source.LOCAL,
                            new Date()
                        );
                        this.saveNow();
                    })
                )
                .catch((e) => {
                    console.log('No permission to delete document root');
                });
        } else {
            this.setData(
                { documentRoots: this._dynamicDocumentRoots.filter((dr) => dr.id !== id) },
                Source.LOCAL,
                new Date()
            );
            this.saveNow();
        }
    }

    get data(): TypeDataMapping[DocumentType.DynamicDocumentRoots] {
        return {
            documentRoots: this._dynamicDocumentRoots.slice()
        };
    }

    @action
    loadDynamicDocumentRoots() {
        this._dynamicDocumentRoots.forEach((dynamicDocumentRoot) => {
            if (this.store.root.documentRootStore.find(dynamicDocumentRoot.id)) {
                return;
            }
            this.store.root.documentRootStore.loadInNextBatch(
                dynamicDocumentRoot.id,
                new DynamicDocRootMeta({}, dynamicDocumentRoot.id, this.id, this.store.root.documentStore)
            );
        });
    }

    @computed
    get dynamicDocumentRoots(): DocumentRoot<DocumentType>[] {
        return this._dynamicDocumentRoots
            .map((dr) => this.store.root.documentRootStore.find(dr.id))
            .filter((d) => !!d);
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
