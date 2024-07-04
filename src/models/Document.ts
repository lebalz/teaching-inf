import { action, computed, observable, reaction } from 'mobx';
import { DocumentRootStore } from '../stores/DocumentRootStore';
import { v4 as uuidv4 } from 'uuid';
import throttle from 'lodash/throttle';
import { 
    CANVAS_OUTPUT_TESTER, 
    DOM_ELEMENT_IDS, 
    GRAPHICS_OUTPUT_TESTER, 
    GRID_IMPORTS_TESTER, 
    TURTLE_IMPORTS_TESTER 
} from 'docusaurus-live-brython/theme/CodeEditor/constants';
import { 
    type InitState, 
    type LogMessage, 
    type Version,
    Status
} from 'docusaurus-live-brython/theme/CodeEditor/WithScript/Types';
import { runCode } from 'docusaurus-live-brython/theme/CodeEditor/WithScript/bryRunner';


export default class Document {
    readonly store: DocumentRootStore;
    readonly isVersioned: boolean;
    readonly _pristineCode: string;
    readonly id: string;
    readonly codeId: string;
    readonly source: 'local' | 'remote';
    readonly _lang: 'py' | string;
    readonly preCode: string;
    readonly postCode: string;
    @observable accessor createdAt: Date;
    @observable accessor updatedAt: Date;
    @observable accessor code: string;
    @observable accessor isExecuting: boolean;
    @observable accessor showRaw: boolean;
    @observable accessor isLoaded: boolean;
    @observable accessor status: Status = Status.IDLE;
    @observable accessor isGraphicsmodalOpen: boolean;
    @observable accessor isPasted: boolean = false;
    versions = observable.array<Version>([], {deep: false});
    logs = observable.array<LogMessage>([], {deep: false});


    constructor(props: InitState, store: DocumentRootStore) {
        this.store = store;
        this.id = props.id || uuidv4();
        this.source = props.id ? 'remote' : 'local';
        this._lang = props.lang;
        this.isExecuting = false;
        this.showRaw = false;
        this.isLoaded = true;
        this.isVersioned = props.versioned && this.source === 'remote';

        this._pristineCode = props.code;
        this.code = props.code;
        if (this.isVersioned) {
            this.versions.push({code: props.code, createdAt: new Date(), version: 1});
        }
        this.preCode = props.preCode;
        this.postCode = props.postCode;
        this.codeId = `code.${props.title || props.lang}.${this.id}`.replace(/(-|\.)/g, '_');
        this.updatedAt = new Date();
        this.createdAt = new Date();
    }

    @action
    clearLogMessages() {
        this.logs.clear();
    }

    @action
    setExecuting(isExecuting: boolean) {
        this.isExecuting = isExecuting;
    }

    @action
    addLogMessage(message: LogMessage) {
        this.logs.push({output: message.output, timeStamp: Date.now(), type: message.type});
    }

    @action
    setCode(code: string, action?: 'insert' | 'remove' | string) {
        if (this.isPasted && action === 'remove') {
            return;
        }
        this.code = code;
        const updatedAt = new Date();
        this.updatedAt = updatedAt;
        if (this.isVersioned) {
            this.addVersion({
                code: code,
                createdAt: updatedAt,
                version: this.versions.length + 1,
                pasted: this.isPasted
            });
        }
        if (this.isPasted) {
            this.isPasted = false;
        }

        /**
         * call the api to save the code...
         */
    }

    @action
    loadVersions() {
        // nop
    }

    
    @action
    _addVersion(version: Version) {
        if (!this.isVersioned) {
            return;
        }
        this.versions.push(version);
    }

    addVersion = throttle(
        this._addVersion,
        DocumentRootStore.syncMaxOnceEvery,
        {leading: false, trailing: true}
    );

    @computed
    get _codeToExecute() {
        return `${this.preCode}\n${this.code}\n${this.postCode}`;
    }

    @action
    execScript() {
        if (this.hasGraphicsOutput) {
            this.isGraphicsmodalOpen = true;
        }
        this.isExecuting = true;
        runCode(this.code, this.preCode, this.postCode, this.codeId, DocumentRootStore.libDir, DocumentRootStore.router);
    }

    @action
    saveNow() {
        /**
         * call the api to save the code...
         */
    }

    /**
     * stop the script from running
     * wheter the script is running or not is derived from the
     * `data--start-time` attribute on the communicator element.
     * This is used in combination with the game loop
     */
    @action
    stopScript() {
        const code = document?.getElementById(DOM_ELEMENT_IDS.communicator(this.codeId));
        if (code) {
            code.removeAttribute('data--start-time');
        }
    }

    @computed
    get hasGraphicsOutput() {
        return this.hasTurtleOutput || this.hasCanvasOutput || GRAPHICS_OUTPUT_TESTER.test(this._codeToExecute);
    }

    @computed
    get hasTurtleOutput() {
        return TURTLE_IMPORTS_TESTER.test(this._codeToExecute);
    }


    @computed
    get hasCanvasOutput() {
        return CANVAS_OUTPUT_TESTER.test(this._codeToExecute) || GRID_IMPORTS_TESTER.test(this._codeToExecute);
    }

    @computed
    get hasEdits() {
        return this.code !== this.pristineCode;
    }

    @computed
    get versionsLoaded() {
        return true;
    }


    @action
    closeGraphicsModal() {
        this.isGraphicsmodalOpen = false;
    }

    subscribe(listener: () => void, selector: keyof Document) {
        if (Array.isArray(this[selector])) {
            return reaction(
                () => (this[selector] as Array<any>).length,
                listener
            );
        }
        return reaction(
            () => this[selector],
            listener
        );
    }

    @computed
    get pristineCode() {
        return this._pristineCode;
    }

    @action
    setIsPasted(isPasted: boolean) {
        this.isPasted = isPasted;
    };
    @action
    setShowRaw(showRaw: boolean) {
        this.showRaw = showRaw;
    };
    @action
    setStatus(status: Status) {
        this.status = status;
    };

    get lang() {
        if (this._lang === 'py') {
            return 'python';
        }
        return this._lang;
    }
}