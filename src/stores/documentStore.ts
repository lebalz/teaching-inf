import { action, observable } from 'mobx';
import { RootStore } from './rootStore';
import { computedFn } from 'mobx-utils';
import Document from '../models/Document';
import { type RouterType } from '@docusaurus/types';

export class DocumentStore {
    readonly root: RootStore;

    @observable accessor clicks: number = 0;
    static accessor libDir: string = '/bry-libs/';
    static syncMaxOnceEvery: number = 1000;
    static router: RouterType = 'hash';


    documents = observable.array<Document>([]);
    
    constructor(root: RootStore) {
        this.root = root;
    }

    /**
     * only to demonstrate that mobx reactivity 
     * works across stores
     */
    @action
    setClicks(clicks: number) {
        this.clicks = clicks;
        this.documents.forEach((d) => {
            d.setCode(`print('Clicked ${clicks} times')`);
        });
    }

    @action
    addDocument(document: Document) {
        this.documents.push(document);
    }

    find = computedFn(
        function (this: DocumentStore, id?: string): Document | undefined {
            if (!id) {
                return;
            }
            return this.documents.find((d) => d.id === id) as Document | undefined;
        },
        { keepAlive: true }
    );

}