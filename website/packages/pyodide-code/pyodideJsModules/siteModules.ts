import type { ModuleType } from '@tdev/pyodide-code/pyodideJsModules';

/**
 * this file is to add custom pyodide js modules for the teaching-dev website
 * ensure to remove this file from the updateTdev.config.yaml to avoid overwriting
 */

declare module '@tdev/pyodide-code/pyodideJsModules' {
    export interface MessageTypeMap {
        clock: {
            type: 'clock';
            id: string;
            clockType: 'hours' | 'minutes' | 'seconds';
            value: number;
            timeStamp: number;
        };
        led_control: {
            type: 'led';
            id: string;
            value: [number, number, number];
            timeStamp: number;
        };
    }
}

export const siteModules: Partial<ModuleType> = {
    clock: (ctx) => {
        const { sendMessage, getTime } = ctx;
        return {
            use_clock: (id: string) => {
                let hours = 0;
                let minutes = 0;
                let seconds = 0;
                return {
                    get minutes() {
                        return minutes;
                    },
                    get hours() {
                        return hours;
                    },
                    get seconds() {
                        return seconds;
                    },
                    reset: () => {
                        hours = 0;
                        minutes = 0;
                        seconds = 0;
                        ['hours', 'minutes', 'seconds'].forEach((clockType) => {
                            sendMessage({
                                type: 'clock',
                                clockType: clockType as 'hours' | 'minutes' | 'seconds',
                                value: 0,
                                id: id,
                                timeStamp: getTime()
                            });
                        });
                    },
                    set_time: (h: number, m: number, s: number) => {
                        hours = h;
                        minutes = m;
                        seconds = s;
                        [
                            ['hours', h],
                            ['minutes', m],
                            ['seconds', s]
                        ].forEach(([clockType, value]) => {
                            sendMessage({
                                type: 'clock',
                                clockType: clockType as 'hours' | 'minutes' | 'seconds',
                                value: value as number,
                                id: id,
                                timeStamp: getTime()
                            });
                        });
                    },
                    set_hours: (deg: number) => {
                        hours = deg;
                        sendMessage({
                            type: 'clock',
                            clockType: 'hours',
                            value: deg,
                            id: id,
                            timeStamp: getTime()
                        });
                    },
                    set_minutes: (deg: number) => {
                        minutes = deg;
                        sendMessage({
                            type: 'clock',
                            clockType: 'minutes',
                            value: deg,
                            id: id,
                            timeStamp: getTime()
                        });
                    },
                    set_seconds: (deg: number) => {
                        seconds = deg;
                        sendMessage({
                            type: 'clock',
                            clockType: 'seconds',
                            value: deg,
                            id: id,
                            timeStamp: getTime()
                        });
                    }
                };
            }
        };
    },
    led_control: (ctx) => {
        const { sendMessage, getTime } = ctx;
        return {
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
                        sendMessage({
                            type: 'led',
                            value: [hue, saturation, brightness],
                            id: id,
                            timeStamp: getTime()
                        });
                    },
                    set_hsl: (h: number, m: number, s: number) => {
                        hue = h;
                        saturation = m;
                        brightness = s;
                        sendMessage({
                            type: 'led',
                            value: [hue, saturation, brightness],
                            id: id,
                            timeStamp: getTime()
                        });
                    }
                };
            }
        };
    }
};
