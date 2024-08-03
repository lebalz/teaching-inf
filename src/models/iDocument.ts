import { action, computed, observable } from 'mobx';
import { Document as DocumentProps, TypeDataMapping, DocumentType } from '../api/document';
import DocumentStore from '../stores/DocumentStore';

abstract class iDocument<Type extends DocumentType> {
    readonly store: DocumentStore;
    readonly id: string;
    readonly authorId: string;
    readonly parentId: string | null | undefined;
    readonly documentRootId: string;
    readonly type: Type;
    readonly _pristine: TypeDataMapping[Type];

    readonly createdAt: Date;
    @observable.ref accessor updatedAt: Date;

    constructor(props: DocumentProps<Type>, store: DocumentStore) {
        this.store = store;
        this.id = props.id;
        this.authorId = props.authorId;
        this.parentId = props.parentId;
        this.documentRootId = props.documentRootId;
        this.type = props.type;
        this._pristine = props.data;

        this.createdAt = new Date(props.createdAt);
        this.updatedAt = new Date(props.updatedAt);
    }

    @computed
    get props(): DocumentProps<Type> {
        return {
            id: this.id,
            authorId: this.authorId,
            parentId: this.parentId,
            documentRootId: this.documentRootId,
            type: this.type,
            data: this.data,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString()
        };
    }

    @action
    reset() {
        this.setData({ ...this._pristine }, true);
    }

    abstract get data(): TypeDataMapping[Type];

    abstract setData(data: TypeDataMapping[Type], persist: boolean, updatedAt?: Date): void;

    @computed
    get isDirty() {
        return this._pristine !== this.data;
    }

    @computed
    get isMain() {
        return !this.parentId && this.root?.type === this.type;
    }

    @computed
    get root() {
        return this.store.root.documentRootStore.find(this.documentRootId);
    }

    @action
    cleanup() {
        /**
         * cancel pending actions and cleanup if needed...
         */
    }
}

export default iDocument;
