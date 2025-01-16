import { CmsStore } from '@tdev-stores/CmsStore';
import { action, computed, observable } from 'mobx';
import { FileProps, iFileStub } from './FileStub';
import { ApiState } from '@tdev-stores/iStore';

class File extends iFileStub {
    readonly type = 'file';

    _pristine: string;
    @observable accessor content: string;
    // unobserved content - always in sync with content
    refContent: string;

    @observable accessor apiState: ApiState = ApiState.IDLE;

    constructor(props: FileProps, store: CmsStore) {
        super(props, store);
        this._pristine = props.content;
        this.content = props.content;
        this.refContent = props.content;
    }

    get canEdit() {
        return true;
    }

    @computed
    get isEditing() {
        return this.store.editedFile === this;
    }

    @action
    setEditing(editing: boolean) {
        this.store.setIsEditing(this, editing);
    }

    @action
    setContent(content: string, isInit: boolean = false) {
        this.content = content;
        this.refContent = content;
        if (isInit) {
            this._pristine = content;
        }
    }

    @computed
    get isOnMainBranch() {
        const main = this.store.github?.defaultBranch?.name;
        if (!main) {
            return undefined;
        }
        return main === this.branch;
    }

    @action
    save(commitMessage?: string) {
        this.apiState = ApiState.SYNCING;
        this.store.github?.saveFile(this, commitMessage);
    }

    @computed
    get isDirty() {
        return this.content !== this._pristine;
    }

    @action
    reset() {
        if (this._pristine) {
            this.setContent(this._pristine);
        }
    }

    get props(): FileProps {
        return {
            name: this.name,
            path: this.path,
            url: this.url,
            git_url: this.gitUrl,
            html_url: this.htmlUrl,
            sha: this.sha,
            download_url: this.downloadUrl,
            size: this.size,
            content: this.content
        };
    }
}

export default File;
