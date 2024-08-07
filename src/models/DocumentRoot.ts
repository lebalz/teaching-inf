import { action, computed, observable } from 'mobx';
import { DocumentRootBase as DocumentRootProps } from '../api/documentRoot';
import { DocumentRootStore } from '../stores/DocumentRootStore';
import { Access, Document, DocumentType, TypeDataMapping, TypeModelMapping } from '../api/document';
import { highestAccess } from './helpers/accessPolicy';

export abstract class TypeMeta<T extends DocumentType> {
    type: T;
    access?: Access;
    constructor(type: T, access?: Access) {
        this.type = type;
        this.access = access;
    }
    abstract get defaultData(): TypeDataMapping[T];
}

class DocumentRoot<T extends DocumentType> {
    readonly store: DocumentRootStore;
    readonly id: string;
    readonly meta: TypeMeta<T>;
    /**
     * dummy document roots are used to create new documents, which should not be
     * persisted to the api.
     * This is useful to support interactive behavior even for not logged in users or
     * in offline mode.
     */
    readonly _isDummy: boolean;

    @observable accessor _access: Access;
    @observable accessor sharedAccess: Access;

    constructor(
        props: DocumentRootProps,
        meta: TypeMeta<T>,
        store: DocumentRootStore,
        isDummy: boolean = false
    ) {
        this.store = store;
        this.meta = meta;
        this.id = props.id;
        this._access = props.access;
        this.sharedAccess = props.sharedAccess;
        this._isDummy = isDummy;
    }

    @computed
    get isDummy() {
        return this._isDummy || !this.store.root.sessionStore.isLoggedIn;
    }

    get type() {
        return this.meta.type;
    }

    get access() {
        if (this.meta.access) {
            return this.meta.access;
        }
        return this._access;
    }

    get loadStatus() {
        return this.store.apiStateFor(`load-${this.id}`);
    }

    @computed
    get permissions() {
        return [...this.store.currentUsersPermissions(this.id)];
    }

    @computed
    get permission() {
        return highestAccess(new Set([...this.permissions.map((p) => p.access), this.access]));
    }

    get documents() {
        const currentUserId = this.store.root.userStore.current?.id;
        if (!currentUserId) {
            return [];
        }
        return this.store.root.documentStore.findByDocumentRoot(this.id).filter((d) => {
            return (
                d.authorId === currentUserId ||
                highestAccess(new Set([this.permission]), this.sharedAccess) !== Access.None
            );
        });
    }

    /**
     * TODO: replace this placeholder to the currently viewed user
     * @default: should return the current viewed user id
     *      --> this is for users the current user id
     *      --> this is for admins the current viewed user id
     */
    @computed
    get viewedUserId() {
        return this.store.root.userStore.current?.id;
    }

    /**
     * All documents which
     * - **don't have a parent**
     * - having the **same type** as this document root
     *
     * @returns All main documents, **ordered by creation date**, oldest first.
     */
    @computed
    get mainDocuments(): TypeModelMapping[T][] {
        const docs = this.documents
            .filter((d) => d.isMain)
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()) as TypeModelMapping[T][];
        const byUser = docs.filter((d) => d.authorId === this.viewedUserId);

        if (
            this.sharedAccess === Access.None ||
            highestAccess(new Set([this.sharedAccess]), this.access) === Access.RW
        ) {
            return byUser;
        }
        if (byUser.length > 0) {
            return byUser;
        }
        return docs;
    }

    @computed
    get firstMainDocument(): TypeModelMapping[T] | undefined {
        return this.mainDocuments[0];
    }
}

export default DocumentRoot;
