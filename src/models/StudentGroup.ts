import { action, computed, observable } from 'mobx';
import { StudentGroup as StudentGroupProps } from '../api/studentGroup';
import { StudentGroupStore } from '../stores/StudentGroupStore';
import { formatDateTime } from './helpers/date';
import User from './User';

class StudentGroup {
    readonly store: StudentGroupStore;

    readonly id: string;
    @observable accessor name: string;
    @observable accessor description: string;

    userIds = observable.set<string>([]);

    @observable accessor parentId: string | undefined;

    readonly createdAt: Date;
    readonly updatedAt: Date;

    constructor(props: StudentGroupProps, store: StudentGroupStore) {
        this.store = store;
        this.id = props.id;

        this.name = props.name;
        this.description = props.description;

        this.userIds.replace(props.userIds);
        this.parentId = props.parentId;

        this.updatedAt = new Date(props.updatedAt);
        this.createdAt = new Date(props.createdAt);
    }

    @computed
    get users() {
        return this.store.users.filter((u) => this.userIds.has(u.id));
    }

    get fCreatedAt() {
        return formatDateTime(this.createdAt);
    }

    get fUpdatedAt() {
        return formatDateTime(this.updatedAt);
    }

    @computed
    get students() {
        return this.store.root.userStore.users.filter((u) => this.userIds.has(u.id));
    }

    @action
    addStudent(student: User) {
        this.store.addUser(this, student);
    }

    @action
    removeStudent(student: User) {
        this.store.removeUser(this, student);
    }
}

export default StudentGroup;
