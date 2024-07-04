import api from './base';
import { AxiosPromise } from 'axios';

export enum Access {
    RO = 'RO',
    RW = 'RW',
    None = 'None'
}

export interface Document {
    id: string;
    authorId: string;
    type: string;
    data: Object;

    parentId: string;
    documentRootId: string;

    createdAt: string;
    updatedAt: string;
}

export interface RootGroupPermission {
    id: string;
    rootGroupPermissions: string;
    access: Access;
}

export interface DocumentRoot {
    id: string;
    access: Access;
    documents: Document[];
}

export function currentUser(signal: AbortSignal): AxiosPromise<Document> {
    return api.get('/user', { signal });
}

export function logout(signal: AbortSignal): AxiosPromise<void> {
    return api.post('/logout', {}, { signal });
}
