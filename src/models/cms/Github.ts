import { CmsStore } from '@tdev-stores/CmsStore';
import { action, computed, IObservableArray, observable } from 'mobx';
import { Octokit, RestEndpointMethodTypes } from '@octokit/rest';
import siteConfig from '@generated/docusaurus.config';
import FileStub from './FileStub';
import Dir from './Dir';
import File from './File';
const { organizationName, projectName } = siteConfig;
type Branch = RestEndpointMethodTypes['repos']['listBranches']['response']['data'][number];

class Github {
    readonly store: CmsStore;

    /* contains branch <-> rootDirectory */
    entries = observable.map<string, IObservableArray<Dir | File | FileStub>>([], { deep: false });
    @observable.ref accessor octokit: Octokit;

    @observable.ref accessor refs: RestEndpointMethodTypes['repos']['listBranches']['response']['data'] = [];

    @observable.ref accessor main: Branch | undefined;

    @observable.ref accessor pulls: RestEndpointMethodTypes['pulls']['list']['response']['data'] = [];

    constructor(accessToken: string, store: CmsStore) {
        this.store = store;
        this.octokit = new Octokit({ auth: accessToken });
    }

    @action
    load() {
        return Promise.all([this.fetchBranches(), this.fetchPulls()]);
    }

    @action
    fetchBranches() {
        return this.octokit.repos.listBranches({ repo: projectName!, owner: organizationName! }).then(
            action((res) => {
                this.refs = res.data;
                const main = res.data.find((b) => b.name === 'main' || b.name === 'master');
                if (main) {
                    this.main = main;
                }
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
                this.refs = [...this.refs, newBranch];
                return newBranch;
            })
        );
    }

    @action
    createPull(ref: Branch, title: string, body?: string) {
        if (!this.main) {
            return Promise.resolve();
        }
        return this.octokit.pulls.create({
            owner: organizationName!,
            repo: projectName!,
            title: title,
            head: ref.name,
            base: this.main.name, // or whatever base branch
            body: body
        });
    }

    @action
    saveFile(file: File, commitMessage?: string) {
        return this.createOrUpdateFile(file.path, file.content, file.branch, file.sha, commitMessage);
    }

    @action
    createOrUpdateFile(path: string, content: string, refName: string, sha?: string, commitMessage?: string) {
        const textContent = new TextEncoder().encode(content);
        const base64Content = btoa(String.fromCharCode(...textContent));
        const current = this.store.findEntry(refName, path) as File | undefined;
        return this.octokit!.repos.createOrUpdateFileContents({
            owner: organizationName!,
            repo: projectName!,
            path: path, // File path in repo
            message: commitMessage || (sha ? `Update: ${path}` : `Create ${path}`),
            content: base64Content,
            branch: refName,
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
                            this.addFileEntry(refName, file);
                            file.setEditing(true);
                        }
                        break;
                    case 201:
                        // file created
                        const file = new File({ ...resContent, content: content }, this.store);
                        this.addFileEntry(refName, file);
                        break;
                }
            })
        );
    }

    @action
    fetchDirectory(refName: string, path: string = '') {
        return this.octokit.repos
            .getContent({
                owner: organizationName!,
                repo: projectName!,
                path: path,
                ref: refName
            })
            .then(
                action((res) => {
                    const entries = res.data;
                    if (Array.isArray(entries)) {
                        if (entries.length === 0) {
                            return [];
                        }
                        if (!this.entries.has(refName)) {
                            this.entries.set(refName, observable.array([], { deep: false }));
                        }
                        const arr = this.entries.get(refName)!;
                        entries.forEach((entry) => {
                            const old = arr.find((e) => e.path === entry.path);
                            if (old) {
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
    fetchFile(refName: string, path: string, editAfterFetch: boolean = false) {
        return this.octokit.repos
            .getContent({
                owner: organizationName!,
                repo: projectName!,
                path: path,
                ref: refName
            })
            .then(
                action((res) => {
                    if ('content' in res.data) {
                        const props = File.ValidateProps(res.data, 'stub');
                        if (props) {
                            const content = new TextDecoder().decode(
                                Uint8Array.from(atob(res.data.content), (c) => c.charCodeAt(0))
                            );
                            const file = new File({ ...props, content: content }, this.store);
                            this.addFileEntry(refName, file);
                            if (editAfterFetch) {
                                file.setEditing(true);
                            }
                        }
                    }
                })
            );
    }

    /**
     * This method adds the File only to the entries map - it won't create or update the file on GitHub.
     */
    @action
    addFileEntry(refName: string, file: File) {
        if (!this.entries.has(refName)) {
            this.entries.set(refName, observable.array([], { deep: false }));
        }
        const old = this.store.findEntry(refName, file.path);
        if (old) {
            this.entries.get(refName)!.remove(old);
        }
        this.entries.get(refName)!.push(file);
    }
}

export default Github;
