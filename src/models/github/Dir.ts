import type { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods';
import { GithubStore } from '@tdev-stores/GithubStore';
import { action, computed, observable } from 'mobx';
import iEntry, { iEntryProps } from './iEntry';
import { mdiFolder, mdiFolderOpen, mdiFolderOutline, mdiLoading } from '@mdi/js';
import { ApiState } from '@tdev-stores/iStore';

interface DirProps extends iEntryProps {}

class Dir extends iEntry {
    readonly type = 'dir';
    @observable accessor isOpen: boolean = false;
    @observable accessor apiState: ApiState = ApiState.IDLE;

    constructor(props: DirProps, store: GithubStore) {
        super(props, store);
    }

    @action
    setOpen(open: boolean) {
        this.isOpen = open;
        if (open) {
            this.fetchDirectory();
        }
    }

    @action
    fetchDirectory() {
        this.apiState = ApiState.SYNCING;
        this.store.fetchFiles(this.branch, this.path).then(
            action(() => {
                this.apiState = ApiState.IDLE;
            })
        );
    }

    @computed
    get isSyncing() {
        return this.apiState === ApiState.SYNCING;
    }

    @computed
    get iconColor() {
        return 'var(--ifm-color-primary)';
    }

    @computed
    get icon() {
        if (this.isSyncing) {
            return mdiLoading;
        }
        if (this.isOpen) {
            return mdiFolderOpen;
        }
        return mdiFolder;
    }
}

export default Dir;
