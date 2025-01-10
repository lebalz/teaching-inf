import { GithubStore } from '@tdev-stores/GithubStore';
import { computed } from 'mobx';

export interface iEntryProps {
    name: string;
    path: string;
    sha: string;
    url: string;
    html_url: string | null;
    git_url: string | null;
    _links: {
        git: string | null;
        html: string | null;
        self: string;
    };
}

abstract class iEntry {
    abstract readonly type: string;
    readonly store: GithubStore;

    readonly name: string;
    readonly path: string;
    readonly sha: string;
    readonly url: string;
    readonly html_url: string | null;
    readonly git_url: string | null;
    readonly _links: {
        git: string | null;
        html: string | null;
        self: string;
    };

    constructor(props: iEntryProps, store: GithubStore) {
        this.store = store;

        this.name = props.name;
        this.path = props.path;
        this.sha = props.sha;
        this.url = props.url;
        this.html_url = props.html_url;
        this.git_url = props.git_url;
        this._links = props._links;
    }

    @computed
    get props() {
        return {
            type: this.type,
            name: this.name,
            path: this.path,
            url: this.url
        };
    }

    @computed
    get level() {
        if (!this.path.includes('/')) {
            return 0;
        }
        return this.path.split('/').filter(Boolean).length;
    }

    @computed
    get parentPath() {
        return this.path.replace(this.name, '').replace(/\/+$/, '');
    }

    @computed
    get parent() {
        return this.store.findEntry(this.branch, this.parentPath);
    }

    @computed
    get children() {
        return this.store.findChildren(this.branch, this.path);
    }

    @computed
    get URL() {
        return new URL(this.url);
    }

    @computed
    get branch() {
        return this.URL.searchParams.get('ref')!;
    }
}

export default iEntry;
