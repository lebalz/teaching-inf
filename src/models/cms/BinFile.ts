import { CmsStore } from '@tdev-stores/CmsStore';
import { observable } from 'mobx';
import { BinFileProps, FileProps, iFileStub } from './FileStub';
import { ApiState } from '@tdev-stores/iStore';

class BinFile extends iFileStub {
    readonly type = 'bin_file';
    blob: Blob;
    src: string;

    @observable accessor apiState: ApiState = ApiState.IDLE;

    constructor(props: BinFileProps, store: CmsStore) {
        super(props, store);
        this.blob = new Blob([props.binData], { type: `${this.mimeType}/${this.mimeExtension}` });
        this.src = URL.createObjectURL(this.blob);
    }

    get canEdit() {
        return false;
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
            rawBase64: this.src
        };
    }
}

export default BinFile;
