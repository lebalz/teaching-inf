export interface SceneConfiguration {
    width: number;
    height: number;
    background_color: string;
    show_fps: boolean;
}

export interface IconSnapshot {
    readonly id: number;
    x: number;
    y: number;
    size: number;
    color: string;
    name: string;
    readonly name_short: string;
    speed_x: number;
    speed_y: number;
    rotation: number;
}

export interface SceneSnapshot extends SceneConfiguration {
    icons: readonly IconSnapshot[];
    fps: number;
}

export const DEFAULT_SCENE_CONFIGURATION: Readonly<SceneConfiguration> = {
    width: 400,
    height: 200,
    background_color: 'black',
    show_fps: true
};
