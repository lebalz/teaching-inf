import { action, computed, IObservableArray, observable, reaction } from 'mobx';
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
import FileStub from '@tdev-models/github/FileStub';
const { organizationName, projectName } = siteConfig;
if (!organizationName || !projectName) {
    throw new Error('"organizationName" and "projectName" must be set in docusaurus.config.ts');
}
type Branch = RestEndpointMethodTypes['repos']['listBranches']['response']['data'][number];

export class GithubStore extends iStore {
    readonly root: RootStore;

    @observable accessor accessToken: string | undefined;
    @observable accessor expiresIn: number | undefined;

    @observable accessor refreshToken: string | undefined;
    @observable accessor refreshTokenExpiresIn: number | undefined;
    @observable accessor scope: string | undefined;
    @observable accessor tokenType: string | undefined;
    @observable accessor fetchedAt: Date | undefined;

    /* contains branch <-> rootDirectory */
    entries = observable.map<string, IObservableArray<Dir | File | FileStub>>([], { deep: false });

    @observable.ref accessor branches: RestEndpointMethodTypes['repos']['listBranches']['response']['data'] =
        [];

    @observable.ref accessor main: Branch | undefined;
    @observable.ref accessor branch: Branch | undefined;

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
        reaction(
            () => this.branch,
            action((branch) => {
                if (branch) {
                    this.fetchDirectory(branch.name);
                }
            })
        );
    }

    @action
    rehydrate(_data?: GithubToken & { fetchedAt: number }) {
        if (this.accessToken) {
            return;
        }
        const data = SessionStorage.get('GithubToken', _data);
        if (data) {
            try {
                this.addTokenToStore(data);
            } catch (e) {
                console.error(e);
                SessionStorage.remove('GithubToken');
            }
        }
    }

    @action
    addTokenToStore(data: GithubToken & { fetchedAt: number }) {
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
        return _.orderBy(this.entries.get(this.branch.name)?.filter((e) => e.level === 0) || [], ['name']);
    }

    @action
    setBranch(name: string) {
        const newBranch = this.branches.find((b) => b.name === name);
        if (!newBranch) {
            return;
        }
        this.branch = newBranch;
    }

    @action
    fetchAccessToken(code: string) {
        return this.withAbortController(`load-token`, (ct) => {
            return apiGithubToken(code, ct.signal)
                .then(
                    action(({ data }) => {
                        const now = Date.now();
                        this.addTokenToStore({ ...data, fetchedAt: now });
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
        return Promise.all([this.fetchBranches(), this.fetchPulls()]);
    }

    @computed
    get isOnMainBranch() {
        return this.main?.name === this.branchName;
    }

    @computed
    get currentEntries() {
        if (!this.branchName) {
            return [] as (Dir | File)[];
        }
        return this.entries.get(this.branchName) || [];
    }

    @computed
    get editedFile() {
        return this.currentEntries.find((f) => f.type === 'file' && f.isEditing) as File;
    }

    findEntry = computedFn(function <T = Dir | File>(
        this: GithubStore,
        branch: string,
        path: string
    ): T | undefined {
        if (!this.entries.has(branch)) {
            return undefined;
        }
        const ref = path.endsWith('/') ? path.replace(/\/+$/, '') : path;
        return this.entries.get(branch)!.find((entry) => entry.path === ref) as T;
    });

    findChildren = computedFn(function (this: GithubStore, branch: string, parentPath: string) {
        if (!this.entries.has(branch)) {
            return [];
        }
        const ref = parentPath.endsWith('/') ? parentPath.replace(/\/+$/, '') : parentPath;
        return this.entries.get(branch)!.filter((entry) => entry.parentPath === ref);
    });

    @computed
    get branchName() {
        return this.branch?.name;
    }
    @computed
    get branchNames() {
        return this.branches.map((b) => b.name);
    }

    @action
    fetchBranches() {
        if (!this.octokit) {
            return Promise.resolve([]);
        }
        return this.octokit.repos.listBranches({ repo: projectName!, owner: organizationName! }).then(
            action((res) => {
                this.branches = res.data;
                const main = res.data.find((b) => b.name === 'main' || b.name === 'master');
                if (main) {
                    this.main = main;
                    if (!this.branch) {
                        this.branch = main;
                    }
                }
            })
        );
    }

    @action
    fetchPulls() {
        if (!this.octokit) {
            return Promise.resolve([]);
        }
        return this.octokit.pulls
            .list({
                repo: projectName!,
                owner: organizationName!,
                state: 'all',
                per_page: 10,
                sort: 'created',
                direction: 'desc',
                page: 1
            })
            .then(
                action((res) => {
                    this.pulls = res.data.filter(
                        (pull) =>
                            pull.head.repo.name.toLowerCase() === projectName!.toLowerCase() &&
                            pull.head.repo.owner.login.toLowerCase() === organizationName!.toLowerCase()
                    );
                })
            );
    }

    @computed
    get nextPrName() {
        const maxNum = Math.max(1, ...this.pulls.map((p) => p.number));
        return `cms/pr-${maxNum + 1}`;
    }

    @action
    createNewBranch(name: string) {
        if (!this.octokit || !this.main) {
            return Promise.resolve();
        }

        return this.octokit!.git.createRef({
            owner: organizationName!,
            repo: projectName!,
            ref: `refs/heads/${name}`,
            sha: this.main.commit.sha
        }).then(
            action((res) => {
                const newBranch = {
                    name: name,
                    commit: {
                        sha: res.data.object.sha,
                        url: res.data.object.url
                    },
                    protected: false
                };
                this.branches = [...this.branches, newBranch];
                return newBranch;
            })
        );
    }

    @action
    createPull(branch: Branch, title: string, body?: string) {
        if (!this.octokit || !this.main) {
            return Promise.resolve();
        }
        return this.octokit.pulls.create({
            owner: organizationName!,
            repo: projectName!,
            title: title,
            head: branch.name,
            base: this.main.name, // or whatever base branch
            body: body
        });
    }

    @action
    createOrUpdateFile(path: string, content: string, sha?: string, commitMessage?: string) {
        const { branch } = this;
        if (!this.octokit || !branch) {
            return Promise.resolve();
        }
        const textContent = new TextEncoder().encode(content);
        const base64Content = btoa(String.fromCharCode(...textContent));
        const current = this.findEntry(branch.name, path) as File | undefined;
        return this.octokit!.repos.createOrUpdateFileContents({
            owner: organizationName!,
            repo: projectName!,
            path: path, // File path in repo
            message: commitMessage || (sha ? `Update: ${path}` : `Create ${path}`),
            content: base64Content,
            branch: branch.name,
            sha: sha
        }).then(
            action((res) => {
                const resContent = File.ValidateProps(res.data.content, 'stub');
                if (!resContent) {
                    return;
                }
                switch (res.status) {
                    case 200:
                        // file updated
                        if (current) {
                            const file = new File({ ...resContent, content: content }, this);
                            this.addFileToStore(branch.name, file);
                            file.setEditing(true);
                        }
                        break;
                    case 201:
                        // file created
                        const file = new File({ ...resContent, content: content }, this);
                        this.addFileToStore(branch.name, file);
                        break;
                }
            })
        );
    }

    @action
    addFileToStore(branchName: string, file: File) {
        if (!this.entries.has(branchName)) {
            this.entries.set(branchName, observable.array([], { deep: false }));
        }
        const old = this.findEntry(branchName, file.path);
        if (old) {
            this.entries.get(branchName)!.remove(old);
        }
        this.entries.get(branchName)!.push(file);
    }

    @action
    fetchDirectory(branchName: string, path: string = '') {
        if (!this.octokit || !this.branch) {
            return Promise.resolve([]);
        }
        return this.octokit.repos
            .getContent({
                owner: organizationName!,
                repo: projectName!,
                path: path,
                ref: branchName
            })
            .then(
                action((res) => {
                    const entries = res.data;
                    if (Array.isArray(entries)) {
                        if (entries.length === 0) {
                            return [];
                        }
                        if (!this.entries.has(branchName)) {
                            this.entries.set(branchName, observable.array([], { deep: false }));
                        }
                        const arr = this.entries.get(branchName)!;
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
                                    arr.push(new FileStub(entry, this));
                                    break;
                            }
                        });
                        return arr;
                    }
                    return [];
                })
            );
    }

    @action
    fetchFile(branchName: string, path: string, editAfterFetch: boolean = false) {
        if (!this.octokit || !this.branch) {
            return Promise.resolve();
        }
        return this.octokit.repos
            .getContent({
                owner: organizationName!,
                repo: projectName!,
                path: path,
                ref: branchName
            })
            .then(
                action((res) => {
                    if ('content' in res.data) {
                        const props = File.ValidateProps(res.data, 'stub');
                        if (props) {
                            const content = new TextDecoder().decode(
                                Uint8Array.from(atob(res.data.content), (c) => c.charCodeAt(0))
                            );
                            const file = new File({ ...props, content: content }, this);
                            this.addFileToStore(branchName, file);
                            if (editAfterFetch) {
                                file.setEditing(true);
                            }
                        }
                    }
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
