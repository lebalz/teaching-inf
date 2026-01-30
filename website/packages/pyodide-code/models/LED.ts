import { action, computed, observable } from 'mobx';

export class LED {
    /** hours, minutes and seconds ALWAYS in degrees */
    @observable accessor hsl: [number, number, number] = [0, 100, 50];

    @action
    reset() {
        this.setHSL(0, 0, 0);
    }

    @action
    setHSL(h: number, s: number, l: number) {
        if (h < 0 || h > 360) {
            h = 0;
            l = 0;
        }
        this.hsl = [h, s, l];
    }
    set_hsl = this.setHSL;
}
