import WebserialStore from '@tdev/webserial/stores/WebserialStore';

export const PluginName = 'serial-plotter';

declare module '@tdev-api/document' {
    export interface ViewStoreTypeMapping {
        ['webserialStore']: WebserialStore;
    }
}
