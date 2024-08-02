import api from './base';
import { AxiosPromise } from 'axios';

export enum Access {
    RO = 'RO',
    RW = 'RW',
    None = 'None'
}

export enum DocumentType {
    Script = 'script',
    TaskState = 'task_state'
}
export interface ScriptData {
    code: string;
}

export interface TaskStateData {
    state: 'set' | 'unset' | 'question' | string;
}

export interface TypeDataMapping {
    [DocumentType.Script]: ScriptData;
    [DocumentType.TaskState]: TaskStateData;
    // Add more mappings as needed
}

export interface Document<Type extends DocumentType> {
    id: string;
    type: Type;
    authorId: string;

    parentId: string;
    documentRootId: string;

    data: TypeDataMapping[Type];

    createdAt: string;
    updatedAt: string;
}

export function find<Type extends DocumentType>(
    id: string,
    signal: AbortSignal
): AxiosPromise<Document<Type>> {
    return api.get(`/documents/${id}`, { signal });
}

export function create<Type extends DocumentType>(
    data: Partial<Document<Type>>,
    signal: AbortSignal
): AxiosPromise<Document<Type>> {
    return api.post(`/documents`, data, { signal });
}

export function update<Type extends DocumentType>(
    id: string,
    data: TypeDataMapping[Type],
    signal: AbortSignal
): AxiosPromise<Document<Type>> {
    return api.put(`/documents/${id}`, { data }, { signal });
}
