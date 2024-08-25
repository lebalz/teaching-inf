/**
 * A Markdown or MDX Page
 */

import { action, computed, observable } from 'mobx';
import { PageStore } from '../stores/PageStore';
import TaskState from './documents/TaskState';
import _ from 'lodash';
import iDocument from './iDocument';

export default class Page {
    readonly store: PageStore;
    readonly id: string;

    documentRootIds = observable.set<string>();
    documentRootPositionsY = observable.map<string, number>();

    constructor(id: string, store: PageStore) {
        this.id = id;
        this.store = store;
    }

    @action
    addDocumentRoot(doc: iDocument<any>, pagePosition: number) {
        this.documentRootIds.add(doc.documentRootId);
        this.documentRootPositionsY.set(doc.documentRootId, pagePosition);
    }

    @computed
    get documentRoots() {
        return this.store.root.documentRootStore.documentRoots.filter(
            (doc) => this.documentRootIds.has(doc.id) && !doc.isDummy
        );
    }

    @computed
    get documents() {
        return this.documentRoots
            .flatMap((doc) => doc.firstMainDocument)
            .filter((d) => this.positionYFor(d))
            .sort((a, b) => this.positionYFor(a)! - this.positionYFor(b)!);
    }

    @computed
    get taskStates(): TaskState[] {
        return this.documentRoots
            .flatMap((doc) => doc.firstMainDocument)
            .filter((d): d is TaskState => d instanceof TaskState)
            .filter((d) => this.positionYFor(d))
            .sort((a, b) => this.positionYFor(a)! - this.positionYFor(b)!);
    }

    @action
    loadOverview() {
        return this.store.loadAllDocuments(this);
    }

    positionYFor(doc?: iDocument<any>): number | undefined {
        if (!doc) {
            return;
        }
        return this.documentRootPositionsY.get(doc.documentRootId);
    }

    @computed
    get taskStatesByUsers() {
        return _.groupBy(
            this.documentRoots
                .flatMap((dr) => dr.allDocuments)
                .filter((doc): doc is TaskState => doc instanceof TaskState)
                .filter((doc) => doc.isMain && this.positionYFor(doc))
                .sort((a, b) => this.positionYFor(a)! - this.positionYFor(b)!),
            (doc) => doc.authorId
        );
    }
}
