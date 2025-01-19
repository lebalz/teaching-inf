import { CmsStore } from '@tdev-stores/CmsStore';
import { computed } from 'mobx';
import FileStub from './FileStub';

export interface iEntryProps {
    name: string;
    path: string;
    sha: string;
    url: string;
    html_url: string | null;
    git_url: string | null;
}

abstract class iEntry {
    abstract readonly type: 'file' | 'file_stub' | 'dir';
    readonly store: CmsStore;

    readonly name: string;
    readonly path: string;
    readonly sha: string;
    readonly url: string;
    readonly htmlUrl: string | null;
    readonly gitUrl: string | null;

    constructor(props: iEntryProps, store: CmsStore) {
        this.store = store;

        this.name = props.name;
        this.path = props.path;
        this.sha = props.sha;
        this.url = props.url;
        this.htmlUrl = props.html_url;
        this.gitUrl = props.git_url;
    }

    @computed
    get props(): iEntryProps {
        return {
            name: this.name,
            path: this.path,
            url: this.url,
            git_url: this.gitUrl,
            html_url: this.htmlUrl,
            sha: this.sha
        };
    }

    isFile(): this is File | FileStub {
        return this.type === 'file' || this.type === 'file_stub';
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
