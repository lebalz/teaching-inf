import { action, observable } from 'mobx';
import { RootStore } from './rootStore';
import { computedFn } from 'mobx-utils';
import StudentGroup from '../models/StudentGroup';
import iStore from './iStore';
import {
    create as apiCreate,
    all as apiAll,
    update as apiUpdate,
    addUser as apiAddUser,
    removeUser as apiRemoveUser
} from '../api/studentGroup';
import User from '../models/User';

export class StudentGroupStore extends iStore<`members-${string}`> {
    readonly root: RootStore;
    studentGroups = observable.array<StudentGroup>([]);

    constructor(root: RootStore) {
        super();
        this.root = root;
    }

    find = computedFn(
        function (this: StudentGroupStore, id?: string): StudentGroup | undefined {
            if (!id) {
                return;
            }
            return this.studentGroups.find((d) => d.id === id);
        },
        { keepAlive: true }
    );

    @action
    create(name: string, description: string, parentId?: string) {
        return this.withAbortController(`create-${name}`, async (signal) => {
            return apiCreate({ name, description, parentId }, signal.signal).then(({ data }) => {
                const group = new StudentGroup(data, this);
                this.studentGroups.push(group);
                return group;
            });
        });
    }

    @action
    addToStore(studentGroup: StudentGroup) {
        const old = this.find(studentGroup.id);
        if (old) {
            this.studentGroups.remove(old);
        }
        this.studentGroups.push(studentGroup);
    }

    @action
    save(studentGroup: StudentGroup) {
        return this.withAbortController(`save-${studentGroup.id}`, async (signal) => {
            return apiUpdate(studentGroup.id, studentGroup.props, signal.signal).then(({ data }) => {
                const group = new StudentGroup({ ...data, userIds: [...studentGroup.userIds] }, this);
                this.addToStore(group);
                return group;
            });
        });
    }

    @action
    addUser(studentGroup: StudentGroup, user: User) {
        return this.withAbortController(`members-add-${studentGroup.id}-${user.id}`, async (signal) => {
            return apiAddUser(studentGroup.id, user.id, signal.signal).then(
                action(({ data }) => {
                    studentGroup.userIds.add(user.id);
                    return studentGroup;
                })
            );
        });
    }

    @action
    removeUser(studentGroup: StudentGroup, user: User) {
        return this.withAbortController(`members-rm-${studentGroup.id}-${user.id}`, async (signal) => {
            return apiRemoveUser(studentGroup.id, user.id, signal.signal).then(
                action(({ data }) => {
                    studentGroup.userIds.delete(user.id);
                    return studentGroup;
                })
            );
        });
    }

    @action
    load() {
        return this.withAbortController('load-all', async (signal) => {
            return apiAll(signal.signal).then(
                action(({ data }) => {
                    const groups = data.map((group) => new StudentGroup(group, this));
                    this.studentGroups.replace(groups);
                    return groups;
                })
            );
        });
    }

    @action
    cleanup() {
        this.studentGroups.clear();
        this.abortControllers.forEach((ctrl) => {
            ctrl.abort('cleanup store');
        });
    }

    get users() {
        return this.root.userStore.users;
    }
}
