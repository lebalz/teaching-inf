import { action, observable } from 'mobx';
import { RootStore } from './rootStore';
import { computedFn } from 'mobx-utils';
import PermissionUser from '../models/PermissionUser';
import PermissionGroup from '../models/PermissionGroup';
import iStore from './iStore';
import {
    GroupPermission,
    UserPermission,
    createGroupPermission as createGroupPermissionApi,
    createUserPermission as createUserPermissionApi,
    updateGroupPermission as updateGroupPermissionApi,
    updateUserPermission as updateUserPermissionApi,
    deleteUserPermission as deleteUserPermissionApi,
    deleteGroupPermission as deleteGroupPermissionApi,
    permissionsFor
} from '@site/src/api/permission';
import DocumentRoot from '../models/DocumentRoot';
import User from '../models/User';
import { Access } from '../api/document';
import StudentGroup from '../models/StudentGroup';

class PermissionStore extends iStore<`update-${string}`> {
    readonly root: RootStore;
    userPermissions = observable.array<PermissionUser>([]);
    groupPermissions = observable.array<PermissionGroup>([]);
    @observable accessor permissionsLoadedForDocumentRootIds = new Set<string>();

    constructor(root: RootStore) {
        super();
        this.root = root;
    }

    findUserPermission = computedFn(
        function (this: PermissionStore, id?: string): PermissionUser | undefined {
            if (!id) {
                return;
            }
            return this.userPermissions.find((d) => d.id === id);
        },
        { keepAlive: true }
    );

    findGroupPermission = computedFn(
        function (this: PermissionStore, id?: string): PermissionGroup | undefined {
            if (!id) {
                return;
            }
            return this.groupPermissions.find((d) => d.id === id);
        },
        { keepAlive: true }
    );

    userPermissionsByDocumentRoot = computedFn(
        function (this: PermissionStore, documentRootId?: string): PermissionUser[] {
            if (!documentRootId) {
                return [];
            }
            return this.userPermissions.filter((p) => p.documentRootId === documentRootId);
        },
        { keepAlive: true }
    );

    groupPermissionsByDocumentRoot = computedFn(
        function (this: PermissionStore, documentRootId?: string): PermissionGroup[] {
            if (!documentRootId) {
                return [];
            }
            return this.groupPermissions.filter((p) => p.documentRootId === documentRootId);
        },
        { keepAlive: true }
    );

    permissionsByDocumentRoot(documentRootId?: string): (PermissionUser | PermissionGroup)[] {
        if (!documentRootId) {
            return [];
        }
        return [
            ...this.userPermissionsByDocumentRoot(documentRootId),
            ...this.groupPermissionsByDocumentRoot(documentRootId)
        ];
    }

    get studentGroups() {
        return this.root.studentGroupStore.studentGroups;
    }

    @action
    addUserPermission(userPermission: PermissionUser) {
        const old = this.findUserPermission(userPermission.id);
        if (old) {
            if (old.access === userPermission.access) {
                return;
            }
            this.userPermissions.remove(old);
        }
        this.userPermissions.push(userPermission);
    }

    @action
    addGroupPermission(groupPermission: PermissionGroup) {
        const old = this.findUserPermission(groupPermission.id);
        if (old) {
            if (old.access === groupPermission.access) {
                return;
            }
            this.userPermissions.remove(old);
        }
        this.groupPermissions.push(groupPermission);
    }

    @action
    createUserPermission(documentRoot: DocumentRoot<any>, user: User, access: Access) {
        this.withAbortController(`create-${documentRoot.id}-${user.id}`, async (signal) => {
            return createUserPermissionApi(
                {
                    userId: user.id,
                    access: access,
                    documentRootId: documentRoot.id
                },
                signal.signal
            ).then(({ data }) => {
                console.log('user permission', data);
                this.addUserPermission(new PermissionUser(data, this));
            });
        });
    }

    @action
    createGroupPermission(documentRoot: DocumentRoot<any>, group: StudentGroup, access: Access) {
        this.withAbortController(`create-${documentRoot.id}-${group.id}`, async (signal) => {
            return createGroupPermissionApi(
                {
                    groupId: group.id,
                    access: access,
                    documentRootId: documentRoot.id
                },
                signal.signal
            ).then(({ data }) => {
                this.addGroupPermission(new PermissionGroup(data, this));
            });
        });
    }

    @action
    handleUserPermissionUpdate(permission: UserPermission) {
        this.withAbortController(`update-${permission.id}`, async (signal) => {
            return updateUserPermissionApi(permission.id, permission.access, signal.signal).then(
                ({ data }) => {
                    this.addUserPermission(new PermissionUser(data, this));
                }
            );
        });
    }

    @action
    handleGroupPermissionUpdate(permission: GroupPermission) {
        this.withAbortController(`update-${permission.id}`, async (signal) => {
            return updateGroupPermissionApi(permission.id, permission.access, signal.signal).then(
                ({ data }) => {
                    this.addGroupPermission(new PermissionGroup(data, this));
                }
            );
        });
    }

    @action
    deleteUserPermission(permission?: PermissionUser) {
        if (!permission) {
            return Promise.resolve();
        }
        this.withAbortController(`destroy-${permission.id}`, async (signal) => {
            return deleteUserPermissionApi(permission.id, signal.signal).then(
                action(({ data }) => {
                    this.userPermissions.remove(permission);
                })
            );
        });
    }

    @action
    deleteGroupPermission(permission?: PermissionGroup) {
        if (!permission) {
            return Promise.resolve();
        }
        this.withAbortController(`destroy-${permission.id}`, async (signal) => {
            return deleteGroupPermissionApi(permission.id, signal.signal).then(
                action(({ data }) => {
                    this.groupPermissions.remove(permission);
                })
            );
        });
    }

    @action
    loadPermissions(documentRoot: DocumentRoot<any>) {
        if (this.permissionsLoadedForDocumentRootIds.has(documentRoot.id)) {
            return Promise.resolve();
        }
        this.withAbortController(`load-permissions-${documentRoot.id}`, async (signal) => {
            return permissionsFor(documentRoot.id, signal.signal).then(({ data }) => {
                const docRootId = data.id;
                data.userPermissions.forEach((p) => {
                    this.addUserPermission(new PermissionUser({ ...p, documentRootId: docRootId }, this));
                });
                data.groupPermissions.forEach((p) => {
                    this.addGroupPermission(new PermissionGroup({ ...p, documentRootId: docRootId }, this));
                });
                this.permissionsLoadedForDocumentRootIds.add(documentRoot.id);
            });
        });
    }
}

export default PermissionStore;
