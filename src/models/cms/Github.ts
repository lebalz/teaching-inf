import { CmsStore } from '@tdev-stores/CmsStore';
import { action, computed, IObservableArray, observable } from 'mobx';
import { Octokit, RestEndpointMethodTypes as GhTypes } from '@octokit/rest';
import siteConfig from '@generated/docusaurus.config';
import FileStub from './FileStub';
import Dir from './Dir';
import File from './File';
import { ApiState } from '@tdev-stores/iStore';
const { organizationName, projectName } = siteConfig;

type GhRepo = GhTypes['repos']['get']['response']['data'];
type GhBranch = GhTypes['repos']['listBranches']['response']['data'][number];
type GhPr =
    | GhTypes['pulls']['list']['response']['data'][number]
    | GhTypes['pulls']['create']['response']['data'];

class Github {
    readonly store: CmsStore;

    /* contains branch <-> rootDirectory */
    entries = observable.map<string, IObservableArray<Dir | File | FileStub>>([], { deep: false });
    @observable.ref accessor octokit: Octokit;

    @observable.ref accessor branches: GhBranch[] = [];

    @observable.ref accessor pulls: GhPr[] = [];

    @observable.ref accessor repo: GhRepo | undefined;

    apiStates = observable.map<string, ApiState>([], { deep: false });

    constructor(accessToken: string, store: CmsStore) {
        this.store = store;
        this.octokit = new Octokit({ auth: accessToken });
    }

    @action
    load() {
        return Promise.all([this.fetchRepo(), this.fetchBranches(), this.fetchPulls()]);
    }

    @action
    fetchRepo() {
        return this.octokit.repos.get({ repo: projectName!, owner: organizationName! }).then(
            action((res) => {
                this.repo = res.data;
            })
        );
    }

    @computed
    get defaultBranchName() {
        if (!this.repo) {
            return undefined;
        }
        return this.repo.default_branch;
    }

    @computed
    get defaultBranch() {
        if (!this.repo) {
            return undefined;
        }
        return this.branches.find((ref) => ref.name === this.defaultBranchName);
    }

    @action
    fetchBranches() {
        return this.octokit.repos.listBranches({ repo: projectName!, owner: organizationName! }).then(
            action((res) => {
                this.branches = res.data;
            })
        );
    }

    @action
    fetchPulls() {
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
        const now = new Date().toISOString().replace('T', '--').replaceAll(':', '-').slice(0, 16);
        return `cms/pr-${now}`;
    }

    @action
    saveFileInNewBranchAndCreatePr(file: File, newBranch: string) {
        this.createNewBranch(newBranch)
            .then(async () => {
                await this.createOrUpdateFile(file.path, file.content, newBranch, file.sha);
                await this.createPull(newBranch, newBranch);
                this.store.settings?.setLocation(newBranch, file.path);
            })
            .catch(() => {
                return this.deleteBranch(newBranch).catch(() => {
                    console.warn('Failed to delete branch', newBranch);
                });
            });
    }

    @action
    closeAndDeletePr(prNumber: number) {
        const pr = this.pulls.find((p) => p.number === prNumber);
        if (!pr) {
            return;
        }
        this.closePr(prNumber).then(() => {
            this.deleteBranch(pr.head.ref).catch(() => {
                console.warn('Failed to delete branch', pr.head.ref);
            });
        });
    }

    @action
    deleteBranch(name: string) {
        return this.octokit.git
            .deleteRef({
                owner: organizationName!,
                repo: projectName!,
                ref: `heads/${name}`
            })
            .then(
                action(() => {
                    this.branches = this.branches.filter((b) => b.name !== name);
                })
            );
    }

    @action
    closePr(prNumber: number) {
        return this.octokit.pulls
            .update({
                owner: organizationName!,
                repo: projectName!,
                pull_number: prNumber,
                state: 'closed'
            })
            .then(
                action(() => {
                    this.pulls = this.pulls.filter((p) => p.number !== prNumber);
                })
            );
    }

    @action
    createNewBranch(name: string) {
        if (!this.defaultBranch) {
            return Promise.resolve();
        }

        return this.octokit.git
            .createRef({
                owner: organizationName!,
                repo: projectName!,
                ref: `refs/heads/${name}`,
                sha: this.defaultBranch.commit.sha
            })
            .then(
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
    createPull(branch: string, title: string, body?: string) {
        if (!this.defaultBranchName) {
            return Promise.resolve();
        }
        return this.octokit.pulls
            .create({
                owner: organizationName!,
                repo: projectName!,
                title: title,
                head: branch,
                base: this.defaultBranchName, // or whatever base branch
                body: body
            })
            .then((res) => {
                this.pulls = [...this.pulls, res.data];
                return res.data;
            });
    }

    @action
    saveFile(file: File, commitMessage?: string) {
        return this.createOrUpdateFile(file.path, file.content, file.branch, file.sha, commitMessage);
    }

    @action
    createOrUpdateFile(path: string, content: string, branch: string, sha?: string, commitMessage?: string) {
        const textContent = new TextEncoder().encode(content);
        const base64Content = btoa(String.fromCharCode(...textContent));
        const current = this.store.findEntry(branch, path) as File | undefined;
        return this.octokit!.repos.createOrUpdateFileContents({
            owner: organizationName!,
            repo: projectName!,
            path: path, // File path in repo
            message: commitMessage || (sha ? `Update: ${path}` : `Create ${path}`),
            content: base64Content,
            branch: branch,
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
                            const file = new File({ ...resContent, content: content }, this.store);
                            this._addFileEntry(branch, file);
                            file.setEditing(true);
                        }
                        break;
                    case 201:
                        // file created
                        const file = new File({ ...resContent, content: content }, this.store);
                        this._addFileEntry(branch, file);
                        break;
                }
            })
        );
    }

    @action
    fetchDirectory(branch: string, path: string = '') {
        return this.octokit.repos
            .getContent({
                owner: organizationName!,
                repo: projectName!,
                path: path,
                ref: branch
            })
            .then(
                action((res) => {
                    const entries = res.data;
                    if (Array.isArray(entries)) {
                        if (entries.length === 0) {
                            return [];
                        }
                        if (!this.entries.has(branch)) {
                            this.entries.set(branch, observable.array([], { deep: false }));
                        }
                        const arr = this.entries.get(branch)!;
                        entries.forEach((entry) => {
                            const old = arr.find((e) => e.path === entry.path);
                            if (old) {
                                if (old.sha === entry.sha) {
                                    return;
                                }
                                arr.remove(old);
                            }
                            switch (entry.type) {
                                case 'dir':
                                    arr.push(new Dir(entry, this.store));
                                    break;
                                case 'file':
                                    arr.push(new FileStub(entry, this.store));
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
    fetchFile(branch: string, path: string, editAfterFetch: boolean = false) {
        const apiId = `${branch}:${path}`;
        this.apiStates.set(apiId, ApiState.SYNCING);
        return this.octokit.repos
            .getContent({
                owner: organizationName!,
                repo: projectName!,
                path: path,
                ref: branch
            })
            .then(
                action((res) => {
                    if ('content' in res.data) {
                        const props = File.ValidateProps(res.data, 'stub');
                        if (props) {
                            this.apiStates.delete(apiId);
                            const content = new TextDecoder().decode(
                                Uint8Array.from(atob(res.data.content), (c) => c.charCodeAt(0))
                            );
                            const file = new File({ ...props, content: content }, this.store);
                            this._addFileEntry(branch, file);
                            if (editAfterFetch) {
                                file.setEditing(true);
                            }
                            return;
                        }
                    }
                    this.apiStates.set(apiId, ApiState.ERROR);
                })
            )
            .catch(
                action((err) => {
                    console.log('Error fetching file', err);
                    this.apiStates.set(apiId, ApiState.ERROR);
                })
            );
    }

    /**
     * This method adds the File only to the entries map - it won't create or update the file on GitHub.
     */
    @action
    _addFileEntry(refName: string, file: File) {
        if (!this.entries.has(refName)) {
            this.entries.set(refName, observable.array([], { deep: false }));
        }
        const old = this.store.findEntry(refName, file.path);
        if (old) {
            this.entries.get(refName)!.remove(old);
        }
        this.entries.get(refName)!.push(file);
    }

    @action
    _addBranchEntry(branch: GhBranch) {
        this.branches = [...this.branches.filter((ref) => ref.name !== branch.name), branch];
    }
}

export default Github;
