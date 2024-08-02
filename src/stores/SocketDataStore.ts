import { RootStore } from './rootStore';
import { io, Socket } from 'socket.io-client';
import { action, makeObservable, observable, reaction } from 'mobx';
import { default as api, checkLogin as pingApi } from '../api/base';
import axios from 'axios';
import iStore from './iStore';
import {
    ChangedRecord,
    ClientToServerEvents,
    DeletedRecord,
    IoEvent,
    IoEvents,
    NewRecord,
    RecordStoreMap,
    RecordType,
    ServerToClientEvents
} from '../api/IoEventTypes';
import { BACKEND_URL } from '../authConfig';
interface Message {
    time: number;
}

export class SocketDataStore {
    private readonly root: RootStore;
    abortControllers = new Map<string, AbortController>();

    @observable.ref accessor socket: Socket<ServerToClientEvents, ClientToServerEvents>;

    messages = observable<Message>([]);

    @observable accessor isLive: boolean = false;

    @observable accessor isConfigured = false;

    constructor(root: RootStore) {
        this.root = root;

        api.interceptors.response.use(
            (res) => res,
            (error) => {
                if (error.response?.status === 401) {
                    this.disconnect();
                }
                return Promise.reject(error);
            }
        );
        reaction(
            () => this.isLive,
            action((isLive) => {
                console.log('Socket.IO live:', isLive);
            })
        );
    }

    withAbortController<T>(sigId: string, fn: (ct: AbortController) => Promise<T>) {
        const sig = new AbortController();
        if (this.abortControllers.has(sigId)) {
            this.abortControllers.get(sigId).abort();
        }
        this.abortControllers.set(sigId, sig);
        return fn(sig)
            .catch((err) => {
                if (axios.isCancel(err)) {
                    return { data: null };
                }
                throw err;
            })
            .finally(() => {
                if (this.abortControllers.get(sigId) === sig) {
                    this.abortControllers.delete(sigId);
                }
            });
    }

    @action
    reconnect() {
        this.disconnect();
        this.connect();
    }

    @action
    disconnect() {
        if (this.socket?.connected) {
            this.socket.disconnect();
        }
        const dummySock = io({ autoConnect: false });
        dummySock.disconnect();
        this.socket = dummySock;
        this.setLiveState(false);
    }

    @action
    setLiveState(isLive: boolean) {
        this.isLive = isLive;
    }

    connect() {
        if (this.socket?.connected) {
            return;
        }
        const ws_url = BACKEND_URL;
        this.socket = io(ws_url, {
            withCredentials: true,
            transports: ['websocket']
        });
        this._socketConfig();
        this.socket.connect();
    }
    _socketConfig() {
        if (!this.socket) {
            return;
        }
        this.socket.on('connect', () => {
            /**
             * maybe there is a newer version to add headers?
             * @see https://socket.io/docs/v4/client-options/#extraheaders
             */
            api.defaults.headers.common['x-metadata-socketid'] = this.socket.id;
            this.setLiveState(true);
        });

        this.socket.on('disconnect', () => {
            console.log('disconnect', this.socket.id);
            this.setLiveState(false);
        });
        this.socket.on('connect_error', (err) => {
            console.log('connection error', err);
            this.setLiveState(false);
            this.checkLogin().then((reconnect) => {
                if (reconnect) {
                    this.reconnect();
                }
            });
        });
        this.socket.on(IoEvent.NEW_RECORD, this.createRecord.bind(this));
        this.socket.on(IoEvent.CHANGED_RECORD, this.updateRecord.bind(this));
        this.socket.on(IoEvent.DELETED_RECORD, this.deleteRecord.bind(this));
        this.socket.on(IoEvent.PING, this.onPing.bind(this));
    }

    @action
    onPing({ time }) {
        this.messages.push({ time });
    }

    @action
    createRecord({ type, record }: NewRecord<RecordType>) {
        console.log('createRecord', type, record);
    }

    @action
    updateRecord({ type, record }: ChangedRecord<RecordType>) {
        console.log('changedRecord', type, record);
    }

    @action
    deleteRecord({ type, id }: DeletedRecord) {
        console.log('deletedRecord', type, id);
    }

    checkLogin() {
        if (this.root.sessionStore.isLoggedIn) {
            return this.withAbortController('ping', (sig) => {
                return pingApi(sig.signal)
                    .then(({ status }) => {
                        if (status === 200 && !this.isLive) {
                            return true;
                        } else {
                            return false;
                        }
                    })
                    .catch((err) => {
                        return false;
                    });
            });
        }
        return Promise.resolve(false);
    }

    @action
    resetUserData() {
        this.disconnect();
        api.defaults.headers.common['x-metadata-socketid'] = undefined;
        this.messages.clear();
    }

    @action
    configure() {
        return this.checkLogin()
            .then((reconnect) => {
                if (reconnect) {
                    this.reconnect();
                }
                return [];
            })
            .finally(
                action(() => {
                    this.isConfigured = true;
                })
            );
    }

    @action
    cleanup() {
        this.disconnect();
    }
}
