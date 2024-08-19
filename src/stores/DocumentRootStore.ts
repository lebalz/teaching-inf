import { action, observable, runInAction } from 'mobx';
import { RootStore } from './rootStore';
import { computedFn } from 'mobx-utils';
import DocumentRoot, { TypeMeta } from '../models/DocumentRoot';
import {
    Config,
    create as apiCreate,
    DocumentRootUpdate,
    find as apiFind,
    findMany as apiFindMany,
    update as apiUpdate,
    DocumentRoot as ApiDocumentRoot
} from '../api/documentRoot';
import iStore from './iStore';
import PermissionGroup from '../models/PermissionGroup';
import PermissionUser from '../models/PermissionUser';
import { DocumentType } from '../api/document';
import { debounce } from 'lodash';

export class DocumentRootStore extends iStore {
    readonly root: RootStore;
    documentRoots = observable.array<DocumentRoot<DocumentType>>([]);
    queued = new Map<string, TypeMeta<any>>();

    constructor(root: RootStore) {
        super();
        this.root = root;
    }

    @action
    addDocumentRoot(documentRoot: DocumentRoot<DocumentType>, cleanupOld: boolean = false) {
        const old = this.find(documentRoot.id);
        if (old) {
            this.documentRoots.remove(old);
            if (cleanupOld) {
                this.cleanupDocumentRoot(old);
            }
        }
        this.documentRoots.push(documentRoot);
        return documentRoot;
    }

    find = computedFn(
        function <Type extends DocumentType = DocumentType>(
            this: DocumentRootStore,
            id?: string
        ): DocumentRoot<Type> | undefined {
            if (!id) {
                return;
            }
            return this.documentRoots.find((d) => d.id === id) as DocumentRoot<Type> | undefined;
        },
        { keepAlive: true }
    );

    @action
    loadInNextBatch<Type extends DocumentType>(id: string, meta: TypeMeta<Type>) {
        if (this.queued.has(id)) {
            return;
        }
        this.queued.set(id, meta);
        this.loadQueued();
        if (this.queued.size > 42) {
            // max 2048 characters in URL - flush if too many
            this.loadQueued.flush();
        }
    }

    /**
     * load the documentRoots only
     * - after 10 ms of "silence" (=no further load-requests during this period)
     * - or after 15ms have elapsed
     * - or when more then 42 records are queued (@see loadInNextBatch)
     *    (otherwise the URL maxlength would be reached)
     */
    loadQueued = debounce(action(this._loadQueued), 10, {
        leading: false,
        trailing: true,
        maxWait: 15
    });

    @action
    _loadQueued() {
        const current = new Map([...this.queued]);
        this.queued.clear();
        const keys = [...current.keys()].sort();
        this.withAbortController(`load-queued-${keys.join('--')}`, async (signal) => {
            const models = await apiFindMany(keys, signal.signal);
            // create all loaded models
            models.data.forEach(
                action((data) => {
                    const meta = current.get(data.id);
                    if (!meta) {
                        return;
                    }
                    this.addApiResultToStore(data, meta);
                    current.delete(data.id);
                })
            );
            // create all missing root documents
            const created = await Promise.all(
                [...current.keys()].map((id) => {
                    return this.create(id, current.get(id) as TypeMeta<any>, {});
                })
            );
            // delete all created roots from the current map
            created
                .filter((docRoot) => !!docRoot)
                .forEach((docRoot) => {
                    current.delete(docRoot.id);
                });
            // mark all remaining roots as loaded
            [...current.keys()].forEach((id) => {
                const dummyModel = this.find(id);
                if (dummyModel && dummyModel.isDummy) {
                    dummyModel.setLoaded();
                }
            });
        });
    }

    @action
    load<Type extends DocumentType>(id: string, meta: TypeMeta<Type>) {
        return this.withAbortController(`load-${id}`, async (signal) => {
            const { data } = await apiFind(id, signal.signal);
            if (!data) {
                return;
            }
            return this.addApiResultToStore(data, meta);
        });
    }

    @action
    addApiResultToStore<Type extends DocumentType>(data: ApiDocumentRoot, meta: TypeMeta<Type>) {
        const documentRoot = new DocumentRoot(data, meta, this);
        runInAction(() => {
            this.addDocumentRoot(documentRoot, true);
            data.groupPermissions.forEach((gp) => {
                this.root.permissionStore.addGroupPermission(
                    new PermissionGroup({ ...gp, documentRootId: documentRoot.id }, this.root.permissionStore)
                );
            });
            data.userPermissions.forEach((up) => {
                this.root.permissionStore.addUserPermission(
                    new PermissionUser({ ...up, documentRootId: documentRoot.id }, this.root.permissionStore)
                );
            });
            data.documents.forEach((doc) => {
                this.root.documentStore.addToStore(doc, 'persisted-root');
            });
        });
        return documentRoot;
    }

    @action
    create<Type extends DocumentType>(id: string, meta: TypeMeta<Type>, config: Partial<Config>) {
        return this.withAbortController(`create-${id}`, async (signal) => {
            const { data } = await apiCreate(id, config, signal.signal);
            const docRoot = new DocumentRoot(data, meta, this);
            this.addDocumentRoot(docRoot, true);
            return docRoot;
        });
    }

    @action
    handleUpdate({ id, access, sharedAccess }: DocumentRootUpdate) {
        const model = this.find(id);
        if (model) {
            model.rootAccess = access;
            model.sharedAccess = sharedAccess;
        }
    }

    /**
     * returns userPermissions and! groupPermissions
     */
    currentUsersPermissions(documentRootId: string) {
        const currentUser = this.root.userStore.current;
        if (!currentUser) {
            return [];
        }
        return this.root.permissionStore
            .permissionsByDocumentRoot(documentRootId)
            .filter((p) => p.isAffectingUser(currentUser));
    }

    @action
    removeFromStore(documentRootId: string, cleanup: boolean = true) {
        const docRoot = this.find(documentRootId);
        if (docRoot) {
            this.documentRoots.remove(docRoot);
            if (cleanup) {
                this.cleanupDocumentRoot(docRoot);
            }
        }
    }

    @action
    cleanupDocumentRoot(documentRoot: DocumentRoot<DocumentType>) {
        documentRoot.documents.forEach((doc) => {
            this.root.documentStore.removeFromStore(doc.id);
        });
    }

    @action
    save(documentRoot: DocumentRoot<any>) {
        if (!this.root.sessionStore.isLoggedIn || !this.root.userStore.current?.isAdmin) {
            return Promise.resolve('error');
        }

        const model = {
            access: documentRoot.rootAccess,
            sharedAccess: documentRoot.sharedAccess
        };

        return this.withAbortController(`save-${documentRoot.id}`, (signal) => {
            return apiUpdate(documentRoot.id, model, signal.signal);
        }).catch(() => console.warn('Error saving document root'));
    }
}
