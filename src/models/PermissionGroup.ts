import { action, computed, observable } from 'mobx';
import { Access } from '../api/document';
import PermissionStore from '../stores/PermissionStore';
import { GroupPermission } from '../api/permission';
import User from './User';

class PermissionGroup {
    readonly store: PermissionStore;

    readonly id: string;
    readonly documentRootId: string;
    readonly groupId: string;

    @observable accessor _access: Access;

    constructor(props: GroupPermission, store: PermissionStore) {
        this.store = store;
        this.id = props.id;
        this._access = props.access;
        this.documentRootId = props.documentRootId;
        this.groupId = props.groupId;
    }

    get access() {
        return this._access;
    }

    @action
    set access(access: Access) {
        this._access = access;
    }

    @computed
    get group() {
        return this.store.root.studentGroupStore.find(this.groupId);
    }

    @computed
    get userIds() {
        return new Set(...(this.group?.userIds || []));
    }

    @computed
    get users() {
        return this.store.root.userStore.users.filter((u) => this.userIds.has(u.id));
    }

    isAffectingUser(user: User) {
        return this.userIds.has(user.id);
    }

    @action
    delete() {
        this.store.deleteGroupPermission(this);
    }
}

export default PermissionGroup;
