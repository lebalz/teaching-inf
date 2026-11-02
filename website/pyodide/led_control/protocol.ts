export interface Led {
    hue: number;
    saturation: number;
    brightness: number;
}

export type LedUpdate = Partial<Led>;
