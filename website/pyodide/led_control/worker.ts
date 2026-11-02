import { defineWorkerExtension } from '@tdev/pyodide-code/extensions';
import type { LedUpdate } from './protocol';

export default defineWorkerExtension<LedUpdate>((context) => ({
    led_control: {
        use_led: (id: string) => {
            let hue = 0;
            let saturation = 100;
            let brightness = 50;
            return {
                get hue() {
                    return hue;
                },
                get saturation() {
                    return saturation;
                },
                get brightness() {
                    return brightness;
                },
                get hsl() {
                    return [hue, saturation, brightness];
                },
                reset: () => {
                    hue = 0;
                    saturation = 100;
                    brightness = 50;
                    context.send(id, { hue, saturation, brightness });
                },
                set_hsl: (hue: number, saturation: number, brightness: number) => {
                    if (typeof hue === 'object') {
                        const args = hue as { hue: number; saturation: number; brightness: number };
                        context.send(id, args);
                        return;
                    }
                    context.send(id, { hue, saturation, brightness });
                }
            };
        }
    }
}));
