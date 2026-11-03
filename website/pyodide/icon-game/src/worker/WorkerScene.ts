import type { ExecutionEventSource } from '@tdev/pyodide-code/events';
import type { WorkerContext } from '@tdev/pyodide-code/extensions';
import { getIconPath, getIconShortName } from '../../icons';
import {
    DEFAULT_SCENE_CONFIGURATION,
    type IconSnapshot,
    type SceneConfiguration,
    type SceneSnapshot
} from '../../protocol';

interface IconOptions {
    color?: string;
    speed_x?: number;
    speed_y?: number;
    rotation?: number;
}

const SCENE_OPTIONS = ['width', 'height', 'background_color', 'show_fps'];
const FPS_SAMPLE_DURATION_MS = 500;

export default class WorkerScene {
    readonly events: ExecutionEventSource;
    private readonly context: WorkerContext<SceneSnapshot>;
    private readonly id: string;
    private readonly sceneIcons = new Set<IconSnapshot>();
    private configuration: SceneConfiguration = { ...DEFAULT_SCENE_CONFIGURATION };
    private nextIconId = 0;
    private fpsSampleStart: number | undefined;
    private fpsFrameCount = 0;
    private fps = 0;

    constructor(context: WorkerContext<SceneSnapshot>, id: string) {
        this.context = context;
        this.id = id;
        this.events = context.events.source(id);
    }

    get width(): number {
        return this.configuration.width;
    }

    get height(): number {
        return this.configuration.height;
    }

    get background_color(): string {
        return this.configuration.background_color;
    }

    get show_fps(): boolean {
        return this.configuration.show_fps;
    }

    get icons(): IconSnapshot[] {
        // A snapshot keeps removal during Python iteration from skipping the next icon.
        return [...this.sceneIcons];
    }

    configure(options: Partial<SceneConfiguration> = {}) {
        if (!options || typeof options !== 'object') {
            throw new Error(
                'Scene configuration must contain width, height, background_color, or show_fps options.'
            );
        }
        for (const option of Object.keys(options)) {
            if (!SCENE_OPTIONS.includes(option)) {
                throw new Error(`Unknown scene configuration option: ${option}`);
            }
        }
        const configuration = { ...this.configuration, ...options };
        this.validateConfiguration(configuration);
        this.configuration = configuration;
    }

    reset() {
        this.sceneIcons.clear();
    }

    add_icon(
        name: string,
        x: number = this.width / 2,
        y: number = this.height / 2,
        size: number = this.width * 0.1,
        options: IconOptions = {}
    ): IconSnapshot {
        const id = this.nextIconId;
        const icon: IconSnapshot = {
            get id() {
                return id;
            },
            name,
            get name_short() {
                return getIconShortName(this.name);
            },
            x,
            y,
            size,
            speed_x: options.speed_x ?? 0,
            speed_y: options.speed_y ?? 0,
            color: options.color ?? 'white',
            rotation: options.rotation ?? 0
        };
        this.validateIcon(icon);
        this.nextIconId += 1;
        this.sceneIcons.add(icon);
        return icon;
    }

    remove_icon(icon: IconSnapshot) {
        this.sceneIcons.delete(icon);
    }

    render() {
        this.validateConfiguration(this.configuration);
        const icons = [...this.sceneIcons].map((icon) => {
            this.validateIcon(icon);
            return { ...icon };
        });
        this.recordFrame(performance.now());
        this.context.send(this.id, { ...this.configuration, icons, fps: this.fps });
    }

    private recordFrame(now: number) {
        if (this.fpsSampleStart === undefined) {
            this.fpsSampleStart = now;
            return;
        }
        this.fpsFrameCount += 1;
        const elapsed = now - this.fpsSampleStart;
        if (elapsed < FPS_SAMPLE_DURATION_MS) {
            return;
        }
        this.fps = Math.round((this.fpsFrameCount * 1000) / elapsed);
        this.fpsSampleStart = now;
        this.fpsFrameCount = 0;
    }

    private validateConfiguration(configuration: SceneConfiguration) {
        if (!Number.isFinite(configuration.width) || configuration.width <= 0) {
            throw new Error('Scene width must be a positive finite number.');
        }
        if (!Number.isFinite(configuration.height) || configuration.height <= 0) {
            throw new Error('Scene height must be a positive finite number.');
        }
        if (typeof configuration.background_color !== 'string' || !configuration.background_color.trim()) {
            throw new Error('Scene background_color must be a non-empty CSS color string.');
        }
        if (typeof configuration.show_fps !== 'boolean') {
            throw new Error('Scene show_fps must be a boolean.');
        }
    }

    private validateIcon(icon: IconSnapshot) {
        getIconPath(icon.name);
        if (!Number.isFinite(icon.x) || !Number.isFinite(icon.y)) {
            throw new Error('Icon coordinates must be finite numbers.');
        }
        if (!Number.isFinite(icon.size) || icon.size <= 0) {
            throw new Error('Icon size must be a positive finite number.');
        }
        if (typeof icon.color !== 'string' || !icon.color.trim()) {
            throw new Error('Icon color must be a non-empty CSS color string.');
        }
        if (!Number.isFinite(icon.speed_x) || !Number.isFinite(icon.speed_y)) {
            throw new Error('Icon speed_x and speed_y must be finite numbers.');
        }
        if (!Number.isFinite(icon.rotation)) {
            throw new Error('Icon rotation must be a finite number in degrees.');
        }
    }
}
