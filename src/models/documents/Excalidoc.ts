import { action, computed, observable } from 'mobx';
import iDocument, { Source } from '../iDocument';
import { DocumentType, Document as DocumentProps, TypeDataMapping, Access } from '@site/src/api/document';
import DocumentStore from '@site/src/stores/DocumentStore';
import { TypeMeta } from '../DocumentRoot';
import { BinaryFiles } from '@excalidraw/excalidraw/types/types';
import { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';
import { getNonDeletedElements, getSceneVersion } from '@excalidraw/excalidraw';

export interface MetaInit {
    readonly?: boolean;
}

export class ModelMeta extends TypeMeta<DocumentType.Excalidoc> {
    readonly type = DocumentType.Excalidoc;

    constructor(props: Partial<MetaInit>) {
        super(DocumentType.Excalidoc, props.readonly ? Access.RO_User : undefined);
    }

    get defaultData(): TypeDataMapping[DocumentType.Excalidoc] {
        return {
            elements: [],
            files: {}
        };
    }
}

class Excalidoc extends iDocument<DocumentType.Excalidoc> {
    @observable.ref accessor elements: readonly ExcalidrawElement[];
    @observable.ref accessor localElements: readonly ExcalidrawElement[]; // local changes, including deleted elements
    @observable.ref accessor files: BinaryFiles;
    constructor(props: DocumentProps<DocumentType.Excalidoc>, store: DocumentStore) {
        super(props, store);
        this.elements = props.data.elements || [];
        this.localElements = props.data.elements || [];
        this.files = props.data.files || {};
    }

    @action
    setData(data: TypeDataMapping[DocumentType.Excalidoc], from: Source, updatedAt?: Date): void {
        if (from === Source.LOCAL) {
            if (getSceneVersion(data.elements) !== this.localSceneVersion) {
                this.localElements = data.elements;
                const updatedElements = getNonDeletedElements(data.elements);
                const presentFileIds = new Set(
                    updatedElements.map((element) => (element.type === 'image' ? element.fileId : null))
                );
                const updatedFiles: BinaryFiles = { ...data.files };
                Object.entries(data.files).forEach(([fileId, file]) => {
                    if (!presentFileIds.has(file.id)) {
                        delete updatedFiles[fileId];
                    }
                });
                this.elements = updatedElements;
                this.files = updatedFiles;
                this.save();
            }
        } else {
            // when the changes are from the api, then throw away local history...
            // TODO: fix this, if needed
            this.elements = data.elements;
            this.localElements = data.elements;
            this.files = data.files;
        }
        if (updatedAt) {
            this.updatedAt = new Date(updatedAt);
        }
    }

    @computed
    get sceneVersion(): number {
        return getSceneVersion(this.elements);
    }

    @computed
    get localSceneVersion(): number {
        return getSceneVersion(this.localElements);
    }

    get data(): TypeDataMapping[DocumentType.Excalidoc] {
        return {
            elements: this.elements,
            files: this.files
        };
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
