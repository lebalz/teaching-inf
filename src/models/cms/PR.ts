import { action, computed, observable } from 'mobx';
import Github from './Github';
import { ApiState } from '@tdev-stores/iStore';

type PRRef = {
    label: string;
    ref: string;
    sha: string;
    repo: {
        name: string;
        owner: {
            login: string;
        };
    };
};

interface Props {
    number: number;
    state: string;
    updated_at: string;
    merged_at: string | null;
    draft?: boolean;
    created_at: string;
    body: string | null;
    title: string;
    head: PRRef;
    base: PRRef;
    html_url: string;
}

class PR {
    readonly gitProvider: Github;
    readonly number: number;
    readonly title: string;
    readonly body: string;

    readonly draft: boolean;
    readonly updatedAt: Date;
    readonly createdAt: Date;
    readonly mergedAt: Date | null;
    readonly state: string;
    // readonly head: PRRef;
    readonly htmlUrl: string;
    readonly branchName: string;
    readonly owner: string; // e.g github username

    @observable accessor headSha: string;
    @observable accessor merged: boolean | undefined;
    @observable accessor mergeable: boolean | undefined;
    @observable accessor rebaseable: boolean | undefined;
    @observable accessor mergeableState: string | undefined;

    @observable accessor apiState: ApiState = ApiState.IDLE;
    @observable accessor isSynced: boolean = false;

    constructor(props: Props, github: Github) {
        this.gitProvider = github;
        this.number = props.number;
        // this.head = props.head;
        this.headSha = props.head.sha;
        this.branchName = props.head.ref;
        this.owner = props.head.repo.owner.login;

        this.body = props.body || '';
        this.title = props.title;
        this.state = props.state;
        this.htmlUrl = props.html_url;
        this.draft = !!props.draft;
        this.updatedAt = new Date(props.updated_at);
        this.createdAt = new Date(props.created_at);
        this.mergedAt = props.merged_at ? new Date(props.merged_at) : null;
    }

    @computed
    get branch() {
        return this.gitProvider.store.findBranch(this.branchName);
    }

    @action
    setApiState(state: ApiState) {
        this.apiState = state;
    }

    @action
    sync(syncBranch = true) {
        this.setApiState(ApiState.SYNCING);
        const promises = [
            this.gitProvider
                .fetchPrState(this.number)
                .then(
                    action((res) => {
                        this.merged = res.merged;
                        this.mergeable = !!res.mergeable;
                        this.rebaseable = !!res.rebaseable;
                        this.mergeableState = res.mergeable_state;
                        this.headSha = res.head.sha;
                        this.isSynced = true;
                    })
                )
                .catch((err) => {
                    console.log('error fetching pr state', err);
                })
        ];
        if (syncBranch && this.branch) {
            promises.push(this.branch.sync());
        }
        Promise.all(promises).finally(() => {
            this.setApiState(ApiState.IDLE);
        });
    }
}

export default PR;
