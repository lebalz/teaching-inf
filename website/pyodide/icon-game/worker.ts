import source from '!!raw-loader!./src/python/icon_game.py';
import { defineWorkerExtension } from '@tdev/pyodide-code/extensions';
import type { SceneSnapshot } from './protocol';
import WorkerScene from './src/worker/WorkerScene';

export default defineWorkerExtension<SceneSnapshot>(
    (context) => {
        const scenes = new Map<string, WorkerScene>();
        return {
            _icon_game_bridge: {
                use_scene: (id: string) => {
                    const existingScene = scenes.get(id);
                    if (existingScene) {
                        return existingScene;
                    }
                    const scene = new WorkerScene(context, id);
                    scenes.set(id, scene);
                    return scene;
                }
            }
        };
    },
    { icon_game: source }
);
