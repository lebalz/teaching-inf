import { GithubStore } from '@tdev-stores/GithubStore';
import iEntry, { iEntryProps } from './iEntry';
import { action, computed, observable } from 'mobx';
import { mdiFileCode, mdiFileDocumentOutline, mdiFileImage, mdiFilePdfBox } from '@mdi/js';
import axios from 'axios';

export interface FileProps extends iEntryProps {
    size: number;
    download_url: string | null;
}

class File extends iEntry {
    readonly type = 'file';
    readonly size: number;
    readonly downloadUrl: string;
    _pristine: string | undefined;
    @observable accessor content: string | undefined;
    // unobserved content - always in sync with content
    refContent: string | undefined;

    @observable accessor isEditing: boolean = false;

    constructor(props: FileProps, store: GithubStore) {
        super(props, store);
        this.size = props.size;
        this.downloadUrl = props.download_url!;
    }

    @action
    setEditing(editing: boolean) {
        if (editing === this.isEditing) {
            return;
        }
        if (editing) {
            this.store.editedFile?.setEditing(false);
        }
        this.isEditing = editing;
    }

    @computed
    get extension() {
        return this.name.split('.').pop() || '';
    }

    @computed
    get isImage() {
        return /(jpg|jpeg|png|gif|bmp|webp|svg|avif|tiff|ico|heic|heif)$/i.test(this.extension);
    }

    @computed
    get isPdf() {
        return /(pdf)$/i.test(this.extension);
    }

    @computed
    get isCode() {
        return /(js|jsx|ts|tsx|py|java|cpp|c|cs|php|rb|go|rs|swift|json|yml|yaml|md|mdx|html|css)$/i.test(
            this.extension
        );
    }

    @computed
    get iconColor() {
        if (this.isImage) {
            return 'var(--ifm-color-blue)';
        }
        if (this.isCode) {
            return 'var(--ifm-color-success)';
        }
        if (this.isPdf) {
            return 'var(--ifm-color-danger)';
        }
        return undefined;
    }

    @computed
    get icon() {
        if (this.isImage) {
            return mdiFileImage;
        }
        if (this.isCode) {
            return mdiFileCode;
        }
        if (this.isPdf) {
            return mdiFilePdfBox;
        }
        return mdiFileDocumentOutline;
    }

    @action
    setContent(content: string) {
        this.content = content;
        this.refContent = content;
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

    @action
    fetchContent() {
        return axios
            .get(this.downloadUrl, {
                params: {
                    _t: Date.now()
                }
            })
            .then(
                action((res) => {
                    if (res.status !== 200) {
                        console.log('Shibby');
                    }
                    this._pristine = res.data;
                    this.setContent(res.data);
                })
            );
    }
}

export default File;
