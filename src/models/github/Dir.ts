import type { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods';
import { GithubStore } from '@tdev-stores/GithubStore';
import { action, computed } from 'mobx';
import iEntry, { iEntryProps } from './iEntry';

interface DirProps extends iEntryProps {}

class Dir extends iEntry {
    readonly type = 'dir';

    constructor(props: DirProps, store: GithubStore) {
        super(props, store);
    }

    @action
    fetchDirectory() {
        this.store.fetchFiles(this.branch, this.path);
    }
}

export default Dir;
