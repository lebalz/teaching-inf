import { action, observable } from 'mobx';
import { RootStore } from './rootStore';
import { computedFn } from 'mobx-utils';
import {
    Document as DocumentProps,
    DocumentType,
    find as apiFind,
    update as apiUpdate,
    create as apiCreate
} from '@site/src/api/document';
import Script from '@site/src/models/documents/Script';
import TaskState from '@site/src/models/documents/TaskState';
import iStore from './iStore';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import iDocument from '../models/iDocument';

export interface TypeModelMapping {
    [DocumentType.Script]: Script;
    [DocumentType.TaskState]: TaskState;
}
type DocumentTypes = Script | TaskState;

class DocumentStore extends iStore {
    readonly root: RootStore;
    documents = observable.array<DocumentTypes>([]);

    constructor(root: RootStore) {
        super();
        this.root = root;
    }

    createModel<T extends DocumentType>(data: DocumentProps<T>): TypeModelMapping[T];
    createModel(data: DocumentProps<DocumentType>): Script | TaskState {
        switch (data.type) {
            case DocumentType.Script:
                return new Script(data as DocumentProps<DocumentType.Script>, this);
            case DocumentType.TaskState:
                return new TaskState(data as DocumentProps<DocumentType.TaskState>, this);
            default:
                throw new Error(`Unsupported document type: ${data.type}`);
        }
    }

    @action
    addDocument(document) {
        this.documents.push(document);
    }

    find = computedFn(
        function (this: DocumentStore, id?: string) {
            if (!id) {
                return;
            }
            return this.documents.find((d) => d.id === id);
        },
        { keepAlive: true }
    );

    findByDocumentRoot = computedFn(
        function (this: DocumentStore, documentRootId?: string) {
            if (!documentRootId) {
                return [];
            }
            return this.documents.filter((d) => d.documentRootId === documentRootId);
        },
        { keepAlive: true }
    );

    @action
    addToStore<Type extends DocumentType>(
        data: DocumentProps<Type> | undefined | null
    ): TypeModelMapping[Type] | undefined {
        /**
         * Adds a new model to the store. Existing models with the same id are replaced.
         */
        if (!data) {
            return;
        }
        const model = this.createModel(data);

        this.removeFromStore(model.id);
        this.documents.push(model);
        return model as TypeModelMapping[Type];
    }

    @action
    removeFromStore(id: string): DocumentTypes | undefined {
        /**
         * Removes the model to the store
         */
        const old = this.find(id);
        if (old) {
            this.documents.remove(old);
            old.cleanup();
        }
        return old;
    }

    @action
    loadModel<Type extends DocumentType>(id: string) {
        if (!id) {
            return Promise.resolve(undefined);
        }
        return this.withAbortController(`load-${id}`, (sig) => {
            return apiFind<Type>(id, sig.signal);
        })
            .then(
                action(({ data }) => {
                    if (data && Object.keys(data).length > 0) {
                        return this.addToStore(data);
                    } else {
                        /** apparently the model is not present anymore - remove it from the store */
                        return this.removeFromStore(id);
                    }
                })
            )
            .catch((err) => {
                if (axios.isCancel(err)) {
                    return;
                } else if (err.response) {
                    /**
                     * https://github.com/axios/axios#handling-errors
                     * the api responded with a non-2xx status code - apparently the model is not present anymore
                     * and can/should be removed from the store
                     */
                    this.removeFromStore(id);
                    return;
                }
            });
    }

    @action
    save<Type extends DocumentType>(
        model: iDocument<Type>,
        replaceStoreModel: boolean = false
    ): Promise<TypeModelMapping[Type] | undefined> {
        if (model.isDirty && !model.root.isDummy) {
            const { id } = model;
            return this.withAbortController(`save-${id}`, (sig) => {
                return apiUpdate(model.id, model.data, sig.signal);
            }).then(
                action(({ data }) => {
                    if (data) {
                        if (replaceStoreModel) {
                            return this.addToStore(data);
                        }
                        return this.createModel(data);
                    }
                    return undefined;
                })
            );
        }
        return Promise.resolve(undefined);
    }

    @action
    create<Type extends DocumentType>(model: { documentRootId: string } & Partial<DocumentProps<Type>>) {
        return this.withAbortController(`create-${model.id || uuidv4()}`, (sig) => {
            return apiCreate<Type>(model, sig.signal);
        }).then(
            action(({ data }) => {
                return this.addToStore(data);
            })
        );
    }
}

export default DocumentStore;
