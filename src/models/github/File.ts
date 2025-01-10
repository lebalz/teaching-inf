import { GithubStore } from '@tdev-stores/GithubStore';
import iEntry, { iEntryProps } from './iEntry';

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
}

export default File;
