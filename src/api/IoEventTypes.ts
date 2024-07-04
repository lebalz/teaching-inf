import { User } from '../api/user';
import { rootStore } from '../stores/rootStore';

export enum IoEvent {
    NEW_RECORD = 'NEW_RECORD',
    CHANGED_RECORD = 'CHANGED_RECORD',
    DELETED_RECORD = 'DELETED_RECORD'
}

export enum RecordType {
    Document = 'Document',
    User = 'User'
}

type TypeRecordMap = {
    [RecordType.Document]: Document;
    [RecordType.User]: User;
};

export interface NewRecord<T extends RecordType> {
    type: T;
    record: TypeRecordMap[T];
}

export interface ChangedRecord<T extends RecordType> {
    type: T;
    record: TypeRecordMap[T];
}

export interface DeletedRecord {
    type: RecordType;
    id: string;
}

interface NotificationBase {
    to: string;
    toSelf?: true | boolean;
}

interface NotificationNewRecord extends NotificationBase {
    event: IoEvent.NEW_RECORD;
    message: NewRecord<RecordType>;
}

interface NotificationChangedRecord extends NotificationBase {
    event: IoEvent.CHANGED_RECORD;
    message: ChangedRecord<RecordType>;
}

interface NotificationDeletedRecord extends NotificationBase {
    event: IoEvent.DELETED_RECORD;
    message: DeletedRecord;
}

export type Notification = NotificationNewRecord | NotificationChangedRecord | NotificationDeletedRecord;

/**
 * client side initiated events
 */
export enum IoEvents {}

export type ServerToClientEvents = {
    [IoEvent.NEW_RECORD]: (message: NewRecord<RecordType>) => void;
    [IoEvent.CHANGED_RECORD]: (message: ChangedRecord<RecordType>) => void;
    [IoEvent.DELETED_RECORD]: (message: DeletedRecord) => void;
};

export interface ClientToServerEvents {}

export const RecordStoreMap: { [key in RecordType]: keyof typeof rootStore } = {
    User: 'userStore',
    Document: 'documentRootStore'
} as const;
