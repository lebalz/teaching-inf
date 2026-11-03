import { createRequire } from 'node:module';
import path from 'node:path';
import { loadPyodide, type PyodideAPI } from 'pyodide';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import WorkerScene from '../src/worker/WorkerScene';

let pyodide: PyodideAPI;
let scene: WorkerScene;

beforeAll(async () => {
    const require = createRequire(import.meta.url);
    const indexURL = `${path.dirname(require.resolve('pyodide/package.json'))}/`;
    pyodide = await loadPyodide({ indexURL });
}, 30000);

beforeEach(() => {
    scene = new WorkerScene(
        {
            editorId: 'test',
            send: vi.fn(),
            sendAndWait: vi.fn(),
            events: {
                source: (targetId) => ({ extension: 'icon_game', targetId, executionId: 1 })
            }
        },
        'test'
    );
    pyodide.globals.set('scene', scene);
});

describe('add_icon Python arguments', () => {
    it.each([
        ["scene.add_icon('ski')", {}],
        ["scene.add_icon('ski', color='red')", { color: 'red' }],
        ["scene.add_icon('ski', 10, color='red')", { x: 10, color: 'red' }],
        ["scene.add_icon('ski', 10, 20, color='red')", { x: 10, y: 20, color: 'red' }],
        ["scene.add_icon('ski', 10, 20, 30, color='red')", { x: 10, y: 20, size: 30, color: 'red' }],
        ["scene.add_icon('ski', 10, 20, 30)", { x: 10, y: 20, size: 30 }],
        ["scene.add_icon('ski', y=20)", { y: 20 }],
        [
            "scene.add_icon('ski', rotation=90, color='red', size=30, speed_y=2, y=20, speed_x=1, x=10)",
            { x: 10, y: 20, size: 30, color: 'red', rotation: 90, speed_x: 1, speed_y: 2 }
        ],
        [
            "scene.add_icon('ski', x=10, speed_x=1, y=20, speed_y=2, size=30, color='red', rotation=90)",
            { x: 10, y: 20, size: 30, color: 'red', rotation: 90, speed_x: 1, speed_y: 2 }
        ]
    ])('supports %s', (code, overrides) => {
        pyodide.runPython(code);
        expect(scene.icons).toHaveLength(1);
        expect(scene.icons[0]).toMatchObject({
            name: 'ski',
            x: 200,
            y: 100,
            size: 40,
            color: 'white',
            speed_x: 0,
            speed_y: 0,
            rotation: 0,
            ...overrides
        });
    });

    it('uses the configured scene dimensions for omitted coordinates', () => {
        scene.configure({ width: 800, height: 600 });
        pyodide.runPython("scene.add_icon('ski', color='red')");
        expect(scene.icons[0]).toMatchObject({ x: 400, y: 300, size: 80, color: 'red' });
    });

    it.each([
        ["scene.add_icon('ski', 10, x=20)", 'supplied both positionally and by name'],
        ["scene.add_icon('ski', colour='red')", 'Unknown icon option: colour'],
        ["scene.add_icon('ski', 10, 20, 30, 40)", 'at most three positional coordinates'],
        ["scene.add_icon('ski', size=-1)", 'Icon size must be a positive finite number']
    ])('rejects %s without adding an icon', (code, message) => {
        expect(() => pyodide.runPython(code)).toThrow(message);
        expect(scene.icons).toHaveLength(0);
    });
});
