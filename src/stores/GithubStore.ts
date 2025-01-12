import { action, computed, IObservableArray, observable } from 'mobx';
import { RootStore } from '@tdev-stores/rootStore';
import iStore from '@tdev-stores/iStore';
import { githubToken as apiGithubToken, GithubToken } from '@tdev-api/github';
import SessionStorage from './utils/SessionStorage';
import { Octokit } from '@octokit/rest';
import type { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods';
import siteConfig from '@generated/docusaurus.config';
import Dir from '@tdev-models/github/Dir';
import File from '@tdev-models/github/File';
import { computedFn } from 'mobx-utils';
import _ from 'lodash';
const { organizationName, projectName } = siteConfig;
if (!organizationName || !projectName) {
    throw new Error('"organizationName" and "projectName" must be set in docusaurus.config.ts');
}

export class GithubStore extends iStore {
    readonly root: RootStore;

    @observable accessor accessToken: string | undefined;
    @observable accessor expiresIn: number | undefined;

    @observable accessor refreshToken: string | undefined;
    @observable accessor refreshTokenExpiresIn: number | undefined;
    @observable accessor scope: string | undefined;
    @observable accessor tokenType: string | undefined;
    @observable accessor fetchedAt: Date | undefined;

    @observable accessor branch: string | undefined;
    /* contains branch <-> rootDirectory */
    entries = observable.map<string, IObservableArray<Dir | File>>([], { deep: false });

    @observable.ref accessor branches: RestEndpointMethodTypes['repos']['listBranches']['response']['data'] =
        [];
    @observable.ref accessor pulls: RestEndpointMethodTypes['pulls']['list']['response']['data'] = [];

    @observable accessor initialized = false;

    @observable.ref accessor octokit: Octokit | undefined;

    constructor(store: RootStore) {
        super();
        this.root = store;
        this.initialized = true;
        setTimeout(() => {
            // attempt to load the previous state of this store from localstorage
            this.rehydrate();
        }, 1);
    }

    @action
    rehydrate(_data?: GithubToken & { fetchedAt: number }) {
        if (this.accessToken) {
            return;
        }
        const data = SessionStorage.get('GithubToken', _data);
        if (data) {
            try {
                this.addToStore(data);
            } catch (e) {
                console.error(e);
                SessionStorage.remove('GithubToken');
            }
        }
    }

    @action
    addToStore(data: GithubToken & { fetchedAt: number }) {
        this.accessToken = data.access_token;
        this.expiresIn = data.expires_in;
        this.refreshToken = data.refresh_token;
        this.refreshTokenExpiresIn = data.refresh_token_expires_in;
        this.scope = data.scope;
        this.tokenType = data.token_type;
        this.fetchedAt = new Date(data.fetchedAt);
        if (this.isExpired) {
            console.log('Token expired, try to refresh');
            this.tryRefreshToken();
        } else {
            this.initOctokit();
        }
    }

    @action
    initOctokit() {
        if (this.isExpired) {
            this.octokit = undefined;
            return;
        }
        if (this.octokit) {
            return;
        }
        this.octokit = new Octokit({ auth: this.accessToken });
        this.load();
    }

    @computed
    get currentBranch() {
        if (!this.branch) {
            return [];
        }
        return this.entries.get(this.branch)?.filter((e) => e.level === 0) || [];
    }

    @action
    fetchAccessToken(code: string) {
        return this.withAbortController(`load-token`, (ct) => {
            return apiGithubToken(code, ct.signal)
                .then(
                    action(({ data }) => {
                        const now = Date.now();
                        this.addToStore({ ...data, fetchedAt: now });
                        SessionStorage.set('GithubToken', {
                            ...data,
                            fetchedAt: now
                        });
                        return data.access_token;
                    })
                )
                .catch((err) => {
                    console.error(err);
                    return null;
                });
        });
    }

    @action
    load() {
        return Promise.all([this.fetchFiles(), this.fetchPulls(), this.fetchBranches()]);
    }

    findEntry = computedFn(function (
        this: GithubStore,
        branch: string,
        path: string
    ): Dir | File | undefined {
        if (!this.entries.has(branch)) {
            return;
        }
        const ref = path.endsWith('/') ? path.replace(/\/+$/, '') : path;
        return this.entries.get(branch)!.find((entry) => entry.path === ref);
    });

    findChildren = computedFn(function (
        this: GithubStore,
        branch: string,
        parentPath: string
    ): (Dir | File)[] {
        if (!this.entries.has(branch)) {
            return [];
        }
        const ref = parentPath.endsWith('/') ? parentPath.replace(/\/+$/, '') : parentPath;
        return this.entries.get(branch)!.filter((entry) => entry.parentPath === ref);
    });

    @action
    fetchBranches() {
        if (!this.octokit) {
            return Promise.resolve([]);
        }
        return this.octokit.repos
            .listBranches({ repo: projectName!, owner: organizationName! })
            .then((res) => {
                if (res.status === 200) {
                    this.branches = res.data;
                }
            });
    }

    @action
    fetchPulls() {
        if (!this.octokit) {
            return Promise.resolve([]);
        }
        return this.octokit.pulls
            .list({ repo: projectName!, owner: organizationName!, state: 'open' })
            .then((res) => {
                if (res.status === 200) {
                    this.pulls = res.data.filter(
                        (pull) =>
                            pull.head.repo.name.toLowerCase() === projectName!.toLowerCase() &&
                            pull.head.repo.owner.login.toLowerCase() === organizationName!.toLowerCase()
                    );
                }
            });
    }

    @computed
    get nextPrName() {
        const maxNum = Math.max(1, ...this.pulls.map((p) => p.number));
        return `cms/pr-${maxNum + 1}`;
    }

    @action
    createNewBranchAndPull(name: string) {
        if (!this.octokit) {
            return Promise.resolve();
        }
        return this.octokit.git
            .getRef({
                owner: organizationName!,
                repo: projectName!,
                ref: 'heads/main' // or whatever base branch
            })
            .then((refRes) => {
                return this.octokit!.git.createRef({
                    owner: organizationName!,
                    repo: projectName!,
                    ref: `refs/heads/${name}`,
                    sha: refRes.data.object.sha
                });
            })
            .then(async (branchRes) => {
                const content = new TextEncoder().encode(`${new Date().toISOString()}: ${name}\n🚀`);
                const base64Content = btoa(String.fromCharCode(...content));
                await this.octokit!.repos.createOrUpdateFileContents({
                    owner: organizationName!,
                    repo: projectName!,
                    path: `${name}.txt`, // File path in repo
                    message: `Init ${name}`,
                    content: base64Content,
                    branch: branchRes.data.ref
                });
                return branchRes;
            })
            .then((branchRes) => {
                return this.octokit!.pulls.create({
                    owner: organizationName!,
                    repo: projectName!,
                    title: name,
                    head: branchRes.data.ref,
                    base: 'main', // or whatever base branch
                    body: 'New PR from CMS'
                });
            })
            .then(() => {
                return new Promise((resolve) => setTimeout(resolve, 3000));
            })
            .then(
                action(() => {
                    return this.load();
                })
            );
    }

    @action
    fetchFiles(branch: string = '', path: string = '') {
        if (!this.octokit) {
            return Promise.resolve([]);
        }

        return this.octokit.repos
            .getContent({
                owner: organizationName!,
                repo: projectName!,
                path: path
            })
            .then(
                action((res) => {
                    const entries = res.data;
                    if (Array.isArray(entries)) {
                        if (entries.length === 0) {
                            return [];
                        }
                        const branch = new URL(entries[0].url).searchParams.get('ref');
                        if (branch) {
                            if (!this.entries.has(branch)) {
                                this.entries.set(branch, observable.array([], { deep: false }));
                            }
                            if (!this.branch) {
                                this.branch = branch;
                            }
                            const arr = this.entries.get(branch)!;
                            entries.forEach((entry) => {
                                const old = arr.find((e) => e.path === entry.path);
                                if (old) {
                                    arr.remove(old);
                                }
                                switch (entry.type) {
                                    case 'dir':
                                        arr.push(new Dir(entry, this));
                                        break;
                                    case 'file':
                                        arr.push(new File(entry, this));
                                        break;
                                }
                            });
                            return arr;
                        }
                    }
                    return [];
                })
            );
    }

    @action
    tryRefreshToken() {
        /** not implemented yer, just clear() */
        this.clear();
    }

    @computed
    get isExpired() {
        if (!this.fetchedAt) {
            return true;
        }
        return this.fetchedAt.getTime() + this.expiresIn! * 1000 < Date.now();
    }

    @computed
    get isRefreshtokenExpired() {
        if (!this.fetchedAt) {
            return true;
        }
        return this.fetchedAt.getTime() + this.refreshTokenExpiresIn! * 1000 < Date.now();
    }

    @action
    clear() {
        this.accessToken = undefined;
        this.expiresIn = undefined;
        this.refreshToken = undefined;
        this.refreshTokenExpiresIn = undefined;
        this.scope = undefined;
        this.tokenType = undefined;
        this.fetchedAt = undefined;
        this.octokit = undefined;
        SessionStorage.remove('GithubToken');
    }
}
