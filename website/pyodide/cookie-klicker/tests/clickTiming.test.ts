import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ExecutionEvent } from '../../../../packages/tdev/pyodide-code/events';
import type { ClientContext } from '../../../../packages/tdev/pyodide-code/extensions';
import type PyodideCode from '../../../../packages/tdev/pyodide-code/models/PyodideCode';
import ExtensionEventStore from '../../../../packages/tdev/pyodide-code/stores/ExtensionEventStore';
import type PyodideStore from '../../../../packages/tdev/pyodide-code/stores/PyodideStore';
import CookieStore from '../src/stores/CookieStore';

const createSession = () => {
    const executions = new Map([['editor', 1]]);
    const deliverEvent = vi
        .fn<(event: ExecutionEvent) => Promise<'accepted'>>()
        .mockResolvedValue('accepted');
    const events = new ExtensionEventStore({ executions, deliverEvent } as unknown as PyodideStore);
    const cookies = new CookieStore({ name: 'cookie_klicker', events, root: {} as ClientContext['root'] });
    const code = { id: 'editor', executionStartedAt: 1000 } as PyodideCode;
    const start = (executionId: number, startedAt: number) => {
        executions.set(code.id, executionId);
        code.executionStartedAt = startedAt;
        events.open(code, executionId, [
            { extension: 'cookie_klicker', targetId: 'cookie', executionId },
            { extension: 'cookie_klicker', targetId: 'second-cookie', executionId }
        ]);
    };
    const clickIntervals = () =>
        deliverEvent.mock.calls
            .filter(([event]) => event.event.type === 'click')
            .map(
                ([event]) => (event.event.payload as { time_since_last_click: number }).time_since_last_click
            );
    start(1, 1000);
    return { code, cookies, events, executions, start, clickIntervals, deliverEvent };
};

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(1000);
});

afterEach(() => vi.useRealTimers());

describe('Cookie click timing', () => {
    it.each([undefined, NaN, Infinity, -Infinity])(
        'reports -1 for an unavailable start time (%s), then measures subsequent clicks normally',
        (startedAt) => {
            const session = createSession();
            Object.assign(session.code, { executionStartedAt: startedAt });
            const cookie = session.cookies.useCookie('cookie');
            vi.setSystemTime(2000);
            cookie.handleClick();
            vi.setSystemTime(2750);
            cookie.handleClick();
            expect(session.clickIntervals()).toEqual([-1, 0.75]);
        }
    );

    it('measures the first click from program start, including time before cookie creation', () => {
        const session = createSession();
        vi.setSystemTime(3500);
        session.cookies.useCookie('cookie').handleClick();
        expect(session.clickIntervals()).toEqual([2.5]);
    });

    it('measures subsequent clicks from the previous click, independently of key events', () => {
        const session = createSession();
        const cookie = session.cookies.useCookie('cookie');
        vi.setSystemTime(2000);
        cookie.handleClick();
        vi.setSystemTime(2500);
        cookie.handleKey('ArrowLeft');
        vi.setSystemTime(2750);
        cookie.handleClick();
        cookie.handleClick();
        expect(session.clickIntervals()).toEqual([1, 0.75, 0]);
    });

    it('tracks each cookie separately', () => {
        const session = createSession();
        vi.setSystemTime(2000);
        session.cookies.useCookie('cookie').handleClick();
        vi.setSystemTime(3000);
        session.cookies.useCookie('second-cookie').handleClick();
        vi.setSystemTime(3500);
        session.cookies.useCookie('cookie').handleClick();
        expect(session.clickIntervals()).toEqual([1, 2, 1.5]);
    });

    it('resets the first-click baseline when the same cookie is used in a new program run', () => {
        const session = createSession();
        const cookie = session.cookies.useCookie('cookie');
        vi.setSystemTime(2000);
        cookie.handleClick();
        session.events.close('editor', 1);
        session.start(2, 10000);
        vi.setSystemTime(10500);
        cookie.handleClick();
        expect(session.clickIntervals()).toEqual([1, 0.5]);
    });

    it('ignores clicks while disconnected or when the execution has expired', () => {
        const session = createSession();
        const cookie = session.cookies.useCookie('cookie');
        session.executions.delete('editor');
        cookie.handleClick();
        expect(session.deliverEvent).not.toHaveBeenCalled();
        session.events.close('editor', 1);
        cookie.handleClick();
        expect(session.deliverEvent).not.toHaveBeenCalled();
        session.start(2, 4000);
        vi.setSystemTime(6000);
        cookie.handleClick();
        expect(session.clickIntervals()).toEqual([2]);
    });
});
