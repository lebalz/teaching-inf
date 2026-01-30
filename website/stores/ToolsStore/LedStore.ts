import { LED } from '@tdev/packages/pyodide-code/models/LED';
import { action, observable } from 'mobx';

class LedStore {
    @observable.ref accessor defaultLed = new LED();
    leds = observable.map<string, LED>([], { deep: false });

    @action
    useLED(id: string) {
        if (this.leds.has(id)) {
            const led = this.leds.get(id)!;
            return led;
        }
        const led = new LED();
        this.leds.set(id, led);
        return led;
    }

    @action
    setHSL(id: string, hue: number, saturation: number, brightness: number) {
        if (this.leds.has(id)) {
            const led = this.leds.get(id)!;
            led.setHSL(hue, saturation, brightness);
            return;
        }
        const led = new LED();
        led.setHSL(hue, saturation, brightness);
        this.leds.set(id, led);
    }
}

export default LedStore;
