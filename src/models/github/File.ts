import { GithubStore } from '@tdev-stores/GithubStore';
import { action, computed, observable } from 'mobx';
import { FileProps, iFileStub } from './FileStub';

class File extends iFileStub {
    readonly type = 'file';

    _pristine: string;
    @observable accessor content: string;
    // unobserved content - always in sync with content
    refContent: string;

    @observable accessor _isEditing: boolean = false;

    constructor(props: FileProps, store: GithubStore) {
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
        return this._isEditing;
    }

    @action
    setEditing(editing: boolean) {
        if (editing === this._isEditing) {
            return;
        }
        if (editing) {
            this.store.editedFile?.setEditing(false);
        }
        this._isEditing = editing;
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
