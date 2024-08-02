import { action, computed, observable, reaction } from 'mobx';
import { DocumentRootStore } from '../../stores/DocumentRootStore';
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
    type InitState as Meta,
    type LogMessage,
    type Version,
    Status
} from 'docusaurus-live-brython/theme/CodeEditor/WithScript/Types';
import { runCode } from 'docusaurus-live-brython/theme/CodeEditor/WithScript/bryRunner';
import iDocument from '../iDocument';
import {
    DocumentType,
    Document as DocumentProps,
    ScriptData,
    ScriptVersionData
} from '@site/src/api/document';
import DocumentStore from '@site/src/stores/DocumentStore';
import siteConfig from '@generated/docusaurus.config';
import { ScriptMeta } from '@site/src/theme/CodeEditor/WithScript/ScriptContext';
import globalData from '@generated/globalData';
import { ThemeOptions } from 'docusaurus-live-brython';
import { ApiState } from '@site/src/stores/iStore';
import ScriptVersion from './ScriptVersion';

// /**
//  * Set some configuration options
//  */
// DocumentRootStore.syncMaxOnceEvery = syncMaxOnceEvery;
// DocumentRootStore.libDir = libDir;
// DocumentRootStore.router = siteConfig.future.experimental_router;

const BRYTHON_CONFIG = globalData['docusaurus-live-brython'].default as ThemeOptions;

export default class Script extends iDocument<DocumentType.Script> {
    @observable accessor code: string;
    @observable accessor isExecuting: boolean = false;
    @observable accessor showRaw: boolean = false;
    @observable accessor isLoaded: boolean = false;
    @observable accessor _status: Status = Status.IDLE;
    @observable accessor isGraphicsmodalOpen: boolean = false;
    @observable accessor isPasted: boolean = false;
    logs = observable.array<LogMessage>([], { deep: false });

    constructor(props: DocumentProps<DocumentType.Script>, store: DocumentStore) {
        super(props, store);
        this.code = props.data.code ?? this.meta.initCode;
        /**
         * TODO: derive this from the api state
         */
        this.isLoaded = true;
    }

    @computed
    get meta(): ScriptMeta {
        if (this.root?.type === DocumentType.Script) {
            return this.root.meta as ScriptMeta;
        }
        return new ScriptMeta({});
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
        this.logs.push({ output: message.output, timeStamp: Date.now(), type: message.type });
    }

    @action
    setCode(code: string, action?: 'insert' | 'remove' | string) {
        if (this.isPasted && action === 'remove') {
            return;
        }
        this.code = code;
        const updatedAt = new Date();
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
        this.saveNow();
    }

    @action
    loadVersions() {
        // nop
    }

    get versions(): ScriptVersion[] {
        return (this.root?.documents || []).filter(
            (doc) => doc.type === DocumentType.ScriptVersion
        ) as ScriptVersion[];
    }

    @action
    _addVersion(version: Version) {
        if (!this.isVersioned) {
            return;
        }
        const versionData: ScriptVersionData = {
            code: version.code,
            version: version.version,
            pasted: version.pasted
        };
        this.store.create({
            documentRootId: this.documentRootId,
            data: versionData,
            type: DocumentType.ScriptVersion
        });
    }

    addVersion = throttle(this._addVersion, 1000, {
        leading: false,
        trailing: true
    });

    @computed
    get _codeToExecute() {
        return `${this.preCode}\n${this.code}\n${this.postCode}`;
    }

    @computed
    get data(): ScriptData {
        return {
            code: this.code
        };
    }

    @action
    setData(data: ScriptData) {
        this.setCode(data.code);
    }

    @action
    execScript() {
        if (this.hasGraphicsOutput) {
            this.isGraphicsmodalOpen = true;
        }
        this.isExecuting = true;
        runCode(
            this.code,
            this.preCode,
            this.postCode,
            this.codeId,
            BRYTHON_CONFIG.libDir, // TODO: get this dynamically
            siteConfig.future.experimental_router
        );
    }

    @action
    saveNow() {
        /**
         * call the api to save the code...
         */
        this.store.save(this);
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
        return (
            this.hasTurtleOutput || this.hasCanvasOutput || GRAPHICS_OUTPUT_TESTER.test(this._codeToExecute)
        );
    }

    @computed
    get hasTurtleOutput() {
        return TURTLE_IMPORTS_TESTER.test(this._codeToExecute);
    }

    @computed
    get hasCanvasOutput() {
        return (
            CANVAS_OUTPUT_TESTER.test(this._codeToExecute) || GRID_IMPORTS_TESTER.test(this._codeToExecute)
        );
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

    subscribe(listener: () => void, selector: keyof Script) {
        if (Array.isArray(this[selector])) {
            return reaction(() => (this[selector] as Array<any>).length, listener);
        }
        return reaction(() => this[selector], listener);
    }

    @computed
    get pristineCode() {
        return this._pristineCode;
    }

    @action
    setIsPasted(isPasted: boolean) {
        this.isPasted = isPasted;
    }
    @action
    setShowRaw(showRaw: boolean) {
        this.showRaw = showRaw;
    }
    @action
    setStatus(status: Status) {
        this._status = status;
    }
    @computed
    get status() {
        if (this.root?.status === ApiState.SYNCING) {
            return Status.SYNCING;
        }
        if (this.store.apiStateFor(`save-${this.id}`) === ApiState.SYNCING) {
            return Status.SYNCING;
        }
        return this._status;
    }

    get isVersioned() {
        return this.meta.versioned;
    }
    get _pristineCode() {
        return this.meta.initCode;
    }

    @computed
    get codeId() {
        return `code.${this.meta.title || this.meta.lang}.${this.id}`.replace(/(-|\.)/g, '_');
    }
    get source() {
        return 'browser';
    }
    get _lang() {
        return this.meta.lang;
    }
    get preCode() {
        return this.meta.preCode;
    }
    get postCode() {
        return this.meta.postCode;
    }

    get lang() {
        if (this.root?.meta)
            if (this._lang === 'py') {
                return 'python';
            }
        return this._lang;
    }
}
