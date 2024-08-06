import api from './base';
import { AxiosPromise } from 'axios';
import { Access, Document, DocumentType } from './document';
import { GroupPermissionBase, UserPermissionBase } from './permission';

export interface RootGroupPermission {
    id: string;
    rootGroupPermissions: string;
    access: Access;
}

export interface DocumentRootBase {
    id: string;
    access: Access;
    sharedAccess: Access;
}

export interface DocumentRoot extends DocumentRootBase {
    userPermissions: UserPermissionBase[];
    groupPermissions: GroupPermissionBase[];
    documents: Document<DocumentType>[];
}

export interface Config {
    access?: Access;
    sharedAccess?: Access;
    userPermissions: Omit<UserPermissionBase, 'id'>[];
    groupPermissions: Omit<GroupPermissionBase, 'id'>[];
}

export function find(id: string, signal: AbortSignal): AxiosPromise<DocumentRoot> {
    return api.get(`/documentRoots/${id}`, { signal });
}

export function create(
    id: string,
    data: Partial<Config> = {},
    signal: AbortSignal
): AxiosPromise<DocumentRoot> {
    return api.post(`/documentRoots/${id}`, data, { signal });
}
