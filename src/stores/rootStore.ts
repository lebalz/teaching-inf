import React from "react";
import { DocumentRootStore } from "./DocumentRootStore";
import { UserStore } from "./UserStore";
import { SessionStore } from "./SessionStore";
import { SocketDataStore } from "./SocketDataStore";


export class RootStore {
    documentRootStore: DocumentRootStore;
    userStore: UserStore;
    sessionStore: SessionStore;
    socketStore: SocketDataStore;

    constructor() {
        this.documentRootStore = new DocumentRootStore(this);
        this.sessionStore = new SessionStore(this);
        this.userStore = new UserStore(this);
        this.socketStore = new SocketDataStore(this);
    }
}


export const rootStore = Object.freeze(new RootStore());
export const storesContext = React.createContext(rootStore);
export const StoresProvider = storesContext.Provider;