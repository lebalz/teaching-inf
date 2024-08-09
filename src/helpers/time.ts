import _ from 'lodash';
import { iRow } from '../components/SemesterTable';

export const SECOND_MS = 1000;
export const MINUTE_MS = 60 * SECOND_MS;
export const HOUR_MS = 60 * MINUTE_MS;
export const DAY_MS = 24 * HOUR_MS;
export type WeekDay = 'So' | 'Mo' | 'Di' | 'Mi' | 'Do' | 'Fr' | 'Sa';
export const WEEK_DAYS: WeekDay[] = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

export const slimTime = (ms: number) => {
    const t = new Date(ms).toISOString().slice(11, -5);
    if (t.startsWith('00:00')) {
        return `${t.slice(6).replace(/^0+/, '')}s`;
    }
    if (t.startsWith('00')) {
        return `${t.slice(3).replace(/^0+/, '')}m`;
    }
    return `${t.replace(/^0+/, '')}h`;
};

export const formatTime = (ms: number) => {
    const t = new Date(ms).toISOString().slice(11, -5);
    if (t.startsWith('00')) {
        return `${t.slice(3)} m`;
    }
    return `${t} h`;
};

export const formatDate = (date: Date) => {
    const [year, month, day] = date.toISOString().slice(0, 10).split('-');
    return `${day}.${month}.${year}`;
};

/**
 * expected format: dd.mm.YYYY
 */
const getDate = (date: string) => {
    const [dd, mm, YYYY] = date.split('.').map(Number.parseInt);
    return new Date(YYYY, mm - 1, dd);
};

/**
 * Expects the date in the first column. Format: dd.mm.YYYY
 */
export const SortTimeTableByDate = (dateIdx: number = 0) => {
    return (rows: iRow[]): iRow[] => {
        rows.sort((a: iRow, b: iRow) => {
            const dateA = getDate(a.cells[dateIdx] as string).getTime();
            const dateB = getDate(b.cells[dateIdx] as string).getTime();
            return dateA - dateB;
        });
        return rows;
    };
};