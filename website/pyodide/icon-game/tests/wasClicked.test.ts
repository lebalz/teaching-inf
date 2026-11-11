import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { loadPyodide, type PyodideAPI } from 'pyodide';
import { beforeAll, describe, expect, it } from 'vitest';
import { registerPythonModule } from '../../../../packages/tdev/pyodide-code/workers/registerPythonModule';

let pyodide: PyodideAPI;

beforeAll(async () => {
    const require = createRequire(import.meta.url);
    const indexURL = `${path.dirname(require.resolve('pyodide/package.json'))}/`;
    pyodide = await loadPyodide({ indexURL });
    pyodide.registerJsModule('_icon_game_bridge', { use_scene: () => null });
    const source = readFileSync(new URL('../src/python/icon_game.py', import.meta.url), 'utf8');
    registerPythonModule(pyodide, 'icon_game', source);
    pyodide.runPython(`
from types import SimpleNamespace
from icon_game import was_clicked

def event(type, extension='icon_game', **payload):
    return SimpleNamespace(type=type, extension=extension, **payload)

def check(*events):
    return was_clicked(SimpleNamespace(events=events))
`);
}, 30000);

describe('was_clicked', () => {
    it.each([
        ['check()', 'None'],
        ["check(event('key', key='a'))", 'None'],
        ["check(event('click', extension='grid', x=1, y=2))", 'None'],
        ["check(event('click', x=1, y=2)).x", '1'],
        ["check(event('click', x=1, y=2), event('key'), event('click', x=3, y=4)).y", '4']
    ])('%s returns %s', (code, expected) => {
        expect(pyodide.runPython(`repr(${code})`)).toBe(expected);
    });
});
