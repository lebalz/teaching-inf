import { defineClientExtension } from '@tdev/pyodide-code/extensions';
import type { LedUpdate } from './protocol';
import LedStore from './src/stores/LedStore';

export default defineClientExtension<LedUpdate, LedStore>({
    createStore: () => new LedStore(),
    handleMessage: (store, { targetId, payload }) => {
        const clock = store.useLED(targetId);
        const { hue, saturation, brightness } = payload;
        if (hue !== undefined && saturation !== undefined && brightness !== undefined) {
            clock.setHSL(hue, saturation, brightness);
        }
    }
});
