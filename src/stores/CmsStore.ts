import { action, computed, observable, reaction } from 'mobx';
import { RootStore } from '@tdev-stores/rootStore';
import iStore from '@tdev-stores/iStore';
import {
    githubToken as apiGithubToken,
    load as apiLoadSettings,
    update as apiUpdateSettings,
    FullCmsSettings
} from '@tdev-api/cms';
import siteConfig from '@generated/docusaurus.config';
import Dir from '@tdev-models/cms/Dir';
import File from '@tdev-models/cms/File';
import { computedFn } from 'mobx-utils';
import _ from 'lodash';
import Settings, { REFRESH_THRESHOLD } from '@tdev-models/cms/Settings';
import Github from '@tdev-models/cms/Github';
const { organizationName, projectName } = siteConfig;
if (!organizationName || !projectName) {
    throw new Error('"organizationName" and "projectName" must be set in docusaurus.config.ts');
}

export class CmsStore extends iStore<`update-settings` | `load-settings` | `load-token`> {
    readonly root: RootStore;
    @observable.ref accessor settings: Settings | undefined;
    @observable.ref accessor github: Github | undefined;

    @observable accessor initialized = false;

    constructor(store: RootStore) {
        super();
        this.root = store;
        reaction(
            () => this.activeBranchName,
            action((branch) => {
                if (branch && this.github) {
                    this.github.fetchDirectory(branch);
                }
            })
        );
        reaction(
            () => this.settings?.token,
            action((token) => {
                if (token) {
                    this._initializeGithub();
                }
            })
        );
    }

    @action
    _initializeGithub() {
        if (!this.settings || this.settings.isExpired) {
            return;
        }
        this.github = new Github(this.settings.token, this);
        this.github.load();
        const { activePath, activeBranchName } = this.settings;
        if (activeBranchName) {
            this.github.fetchDirectory(activeBranchName).then(() => {
                if (activePath) {
                    this.github?.fetchFile(activeBranchName, activePath);
                }
            });
        }
    }

    @computed
    get activeBranchName() {
        return this.settings?.activeBranchName || this.github?.main?.name;
    }

    @computed
    get branchEntries() {
        if (!this.activeBranchName || !this.github) {
            return [] as (Dir | File)[];
        }
        return this.github.entries.get(this.activeBranchName) || [];
    }

    @computed
    get refNames(): string[] {
        return this.github?.refs.map((b) => b.name) || [];
    }

    /**
     * all files belonging to the current branch and located at the root level
     */
    @computed
    get refsRootEntries() {
        if (!this.settings) {
            return [];
        }
        return _.orderBy(this.branchEntries.filter((e) => e.level === 0) || [], ['name']);
    }

    @computed
    get editedFile() {
        return this.settings?.activeFile;
    }

    @action
    setBranch(name: string) {
        this.settings?.setActiveBranchName(name);
    }

    @action
    fetchAccessToken(code: string) {
        return this.withAbortController(`load-token`, (ct) => {
            return apiGithubToken(code, ct.signal)
                .then(
                    action(({ data }) => {
                        if (data.token && data.tokenExpiresAt) {
                            this.settings = new Settings(data as FullCmsSettings, this);
                            return this.settings;
                        }
                        return null;
                    })
                )
                .catch((err) => {
                    console.error(err);
                    return null;
                });
        });
    }

    @computed
    get isOnMainBranch() {
        return this.github?.main?.name === this.activeBranchName;
    }

    findEntry = computedFn(function <T = Dir | File>(
        this: CmsStore,
        branch: string,
        path: string
    ): T | undefined {
        if (!this.github?.entries.has(branch)) {
            return undefined;
        }
        const fPath = path.endsWith('/') ? path.replace(/\/+$/, '') : path;
        return this.github.entries.get(branch)!.find((entry) => entry.path === fPath) as T;
    });

    findChildren = computedFn(function (this: CmsStore, branch: string, parentPath: string) {
        if (!this.github?.entries.has(branch)) {
            return [];
        }
        const ref = parentPath.endsWith('/') ? parentPath.replace(/\/+$/, '') : parentPath;
        return this.github.entries.get(branch)!.filter((entry) => entry.parentPath === ref);
    });

    @action
    setFileEditingState(file: File, isEditing: boolean) {
        this.settings?.setLocation(file.branch, isEditing ? file.path : null);
    }

    @action
    initialize() {
        if (this.initialized) {
            return;
        }
        this.loadSettings().then(
            action((res) => {
                this.initialized = true;
            })
        );
    }

    @computed
    get needsGithubLogin() {
        return this.initialized && !this.settings;
    }

    @action
    loadSettings() {
        return this.withAbortController(`load-settings`, (ct) => {
            return apiLoadSettings(ct.signal).then(
                action(({ data }) => {
                    if (data.token && data.tokenExpiresAt) {
                        this.settings = new Settings(data as FullCmsSettings, this);
                        return this.settings;
                    }
                    return null;
                })
            );
        });
    }

    @action
    saveSettings() {
        const { settings } = this;
        if (!settings || !settings.isDirty) {
            return Promise.resolve();
        }
        return this.withAbortController(`update-settings`, (ct) => {
            return apiUpdateSettings(settings.dirtyProps, ct.signal)
                .then(
                    action(() => {
                        settings.updatedAt = new Date();
                        settings._pristine = settings.props;
                        if (settings.expiresInSeconds < REFRESH_THRESHOLD) {
                            this.loadSettings();
                        }
                    })
                )
                .catch((err) => {
                    return this.loadSettings();
                });
        });
    }
}
