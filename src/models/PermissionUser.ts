import { action, observable } from 'mobx';
import { Access } from '../api/document';
import PermissionStore from '../stores/PermissionStore';
import { UserPermission } from '../api/permission';
import User from './User';

class PermissionUser {
    readonly store: PermissionStore;

    readonly id: string;
    readonly userId: string;
    readonly documentRootId: string;

    @observable accessor _access: Access;

    constructor(props: UserPermission, store: PermissionStore) {
        this.store = store;
        this._access = props.access;
        this.id = props.id;
        this.userId = props.userId;
        this.documentRootId = props.documentRootId;
    }

    isAffectingUser(user: User) {
        return this.userId === user.id;
    }

    get user() {
        return this.store.root.userStore.find(this.userId);
    }

    @action
    set access(access: Access) {
        this.access = access;
    }

    get access() {
        return this._access;
    }

    @action
    delete() {
        this.store.deleteUserPermission(this);
    }
}

export default PermissionUser;
