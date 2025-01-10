import { GithubStore } from '@tdev-stores/GithubStore';
import iEntry, { iEntryProps } from './iEntry';
import { computed } from 'mobx';
import { mdiFile, mdiFileCode, mdiFileDocumentOutline, mdiFileImage, mdiFilePdfBox } from '@mdi/js';

interface FileProps extends iEntryProps {
    size: number;
    download_url: string | null;
}

class File extends iEntry {
    readonly type = 'file';
    readonly size: number;
    readonly download_url: string | null;

    constructor(props: FileProps, store: GithubStore) {
        super(props, store);
        this.size = props.size;
        this.download_url = props.download_url;
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
}

export default File;
