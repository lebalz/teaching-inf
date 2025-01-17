import { action, computed, observable } from 'mobx';
import Github from './Github';
import { ApiState } from '@tdev-stores/iStore';

interface Props {
    name: string;
    commit: {
        sha: string;
        url: string;
    };
}

export enum MergeStatus {
    Unchecked = 'unchecked',
    Ready = 'ready',
    Conflict = 'conflict'
}

class Branch {
    readonly gitProvider: Github;
    readonly name: string;
    readonly sha: string;
    readonly url: string;
    @observable accessor mergeStatus: MergeStatus = MergeStatus.Unchecked;
    @observable accessor fastForwardStatus: MergeStatus = MergeStatus.Unchecked;
    @observable accessor apiStatus: ApiState = ApiState.IDLE;
    @observable accessor isMerged: boolean = false;

    constructor(props: Props, github: Github) {
        this.gitProvider = github;
        this.name = props.name;
        this.sha = props.commit.sha;
        this.url = props.commit.url;
    }

    @computed
    get needsSync() {
        return this.mergeStatus === MergeStatus.Unchecked;
    }

    @action
    sync() {
        this.setSyncStatus(ApiState.SYNCING);
        Promise.all([this.syncMergeStatus(false)]).then(
            action(() => {
                this.setSyncStatus(ApiState.IDLE);
            })
        );
    }

    @computed
    get canFastForward() {
        return this.fastForwardStatus === MergeStatus.Ready;
    }

    @action
    setMergeStatus(status: MergeStatus) {
        this.mergeStatus = status;
    }

    @action
    setFastForwardStatus(status: MergeStatus) {
        this.fastForwardStatus = status;
    }

    @action
    setSyncStatus(status: ApiState) {
        this.apiStatus = status;
    }

    @action
    syncMergeStatus(updateSync: boolean = true) {
        if (updateSync) {
            this.setSyncStatus(ApiState.SYNCING);
        }
        this.gitProvider.fetchMergeStatus(this.name).then(
            action((res) => {
                this.setMergeStatus(res);
                if (res === MergeStatus.Conflict) {
                    this.syncFastForwardStatus();
                } else {
                    this.syncIsMerged();
                    if (updateSync) {
                        this.setSyncStatus(ApiState.IDLE);
                    }
                }
            })
        );
    }

    @action
    syncIsMerged() {
        console.log('check Is Merged');
        this.gitProvider.fetchIsBranchMerged(this).then(
            action((isMerged) => {
                console.log('Is Merged', isMerged);
                this.isMerged = isMerged;
            })
        );
    }

    @action
    syncFastForwardStatus(updateSync: boolean = true) {
        const { defaultBranchName } = this.gitProvider;
        if (!defaultBranchName) {
            return this.setFastForwardStatus(MergeStatus.Unchecked);
        }
        if (updateSync) {
            this.setSyncStatus(ApiState.SYNCING);
        }
        this.gitProvider.fetchMergeStatus(defaultBranchName, this.name).then(
            action((res) => {
                this.setFastForwardStatus(res);
                if (updateSync) {
                    this.setSyncStatus(ApiState.IDLE);
                }
            })
        );
    }
}

export default Branch;
