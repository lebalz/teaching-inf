import React from "react";
import { DocumentStore } from "./documentStore";


export class RootStore {
    documentStore: DocumentStore;

    constructor() {
        this.documentStore = new DocumentStore(this);
    }
}


export const rootStore = Object.freeze(new RootStore());
export const storesContext = React.createContext(rootStore);
export const StoresProvider = storesContext.Provider;