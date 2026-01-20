import { RootStore } from '@tdev-stores/rootStore';
import { ToolsStore } from './ToolsStore';
import { action } from 'mobx';
import { Message } from '@tdev/pyodide-code/pyodideJsModules';

export default class SiteStore {
    toolsStore: ToolsStore;

    constructor(root: RootStore) {
        this.toolsStore = new ToolsStore(root);
    }

    get clockStore() {
        return this.toolsStore.clockStore;
    }

    @action
    handleMessage(from: string, message: any) {
        switch (from) {
            case 'pyodide':
                const pyodideMessage = message as Message;
                switch (pyodideMessage.type) {
                    case 'clock':
                        const clock = this.clockStore.useClock(message.id);
                        switch (message.clockType) {
                            case 'hours':
                                clock.setHours(message.value);
                                break;
                            case 'minutes':
                                clock.setMinutes(message.value);
                                break;
                            case 'seconds':
                                clock.setSeconds(message.value);
                                break;
                        }
                        break;
                }

                break;
            default:
                // handle other messages here
                break;
        }
    }
}
