import React, { ReactNode, useMemo } from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';
import { WEEK_DAYS } from '@tdev/helpers/time';
import * as MDI from '@mdi/js';
import Icon from '@mdi/react';
import _ from 'es-toolkit/compat';

export enum Type {
    Holiday = 'holiday',
    Event = 'event',
    Test = 'test',
    Info = 'info'
}

const ICON_MAPPING: { [key in Type]: string } = {
    [Type.Holiday]: MDI.mdiIsland,
    [Type.Event]: MDI.mdiCalendar,
    [Type.Test]: MDI.mdiSchool,
    [Type.Info]: MDI.mdiInformation
};

interface CellProps {
    value: string | ReactNode;
    icon?: ReactNode;
    align?: 'left' | 'center' | 'right' | 'justify' | 'char';
    date?: Date;
}

const ToDateString = ({ date }: { date: Date }): React.ReactNode => {
    const day = date.getDay();

    return (
        <span style={{ fontFamily: 'monospace' }}>
            {WEEK_DAYS[day]}. {String(date.getDate()).padStart(2, '0')}.
            {String(date.getMonth() + 1).padStart(2, '0')}.
        </span>
    );
};

const Cell = (props: CellProps): React.ReactNode => {
    const { value, icon, align, date } = props;
    const displayValue = date ? <ToDateString date={date} /> : value;

    return (
        <td align={align} className={clsx(styles.cell)}>
            {displayValue}
            {icon ? ' ' : ''}
            {icon}
        </td>
    );
};

export interface iRow {
    cells: (string | ReactNode)[];
    type?: Type;
    className?: string;
    color?: string;
    icon?: string;
}

interface RowProps extends iRow {
    alignments?: ('left' | 'center' | 'right' | 'justify' | 'char')[];
    dateIndex?: number;
}

const getDate = (date: string): Date | undefined => {
    const parts = date.match(/(?<d>\d+)\.(?<m>\d+)\.(?<y>\d+)/);
    if (!parts || !parts.groups) {
        return undefined;
    }
    return new Date(`${parts.groups.y}-${parts.groups.m}-${parts.groups.d}`);
};

const weekNumber = (date: Date): number => {
    const target = new Date(date.valueOf());
    const dayNr = (date.getUTCDay() + 6) % 7;
    target.setUTCDate(target.getUTCDate() - dayNr + 3);
    const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
    firstThursday.setUTCDate(firstThursday.getUTCDate() - ((firstThursday.getUTCDay() + 6) % 7) + 3);
    return Math.round(((target.getTime() - firstThursday.getTime()) / (24 * 60 * 60 * 1000) + 1) / 7);
};

const Row = (props: RowProps): React.ReactNode => {
    const { type, cells, className, color, icon: iconProp, alignments, dateIndex } = props;

    const icon = useMemo(() => {
        if (iconProp) {
            return (
                <Icon
                    path={MDI[_.camelCase(iconProp) as keyof typeof MDI] || MDI.mdiProgressQuestion}
                    size={0.5}
                />
            );
        } else if (type) {
            return <Icon path={ICON_MAPPING[type]} size={0.5} />;
        }
        return null;
    }, [iconProp, type]);

    const rowProps: React.HTMLAttributes<HTMLTableRowElement> = useMemo(() => {
        const props = { className: '' };
        if (className) {
            props.className = clsx(props.className, className);
        }
        if (type) {
            props.className = clsx(props.className, styles[type]);
        }
        return props;
    }, [className, type]);

    const date: Date | undefined = useMemo(() => {
        if (dateIndex !== undefined && dateIndex >= 0) {
            const c = cells[dateIndex];
            if (typeof c === 'string') {
                return getDate(c);
            }
        }
        return undefined;
    }, [cells, dateIndex]);

    const isCurrentWeek = useMemo(() => {
        return date && weekNumber(new Date()) === weekNumber(date);
    }, [date]);

    const cellProps = useMemo(() => {
        return cells.map((cell, idx) => {
            const cellProps: CellProps = {
                value: cell,
                icon: idx === 0 ? icon : undefined,
                align: alignments && alignments.length > idx ? alignments[idx] : 'left',
                date: dateIndex === idx ? date : undefined
            };

            return {
                ...cellProps,
                key: idx
            };
        });
    }, [alignments, cells, dateIndex, date, icon]);

    return (
        <tr
            {...rowProps}
            className={clsx(rowProps.className, isCurrentWeek && styles.currentWeek)}
            style={{ background: color }}
        >
            {cellProps.map((props, idx) => (
                <Cell {...props} key={idx} />
            ))}
        </tr>
    );
};

interface TableProps {
    header?: string[];
    rows: iRow[];
    alignments?: ('left' | 'center' | 'right' | 'justify' | 'char')[];
    size?: 'tiny' | 'small' | 'normal' | 'large';
    compact?: boolean;
    celled?: boolean;
    striped?: boolean;
    collapsing?: boolean;
    className?: string;
    selectable?: boolean;
    order?: (rows: iRow[]) => iRow[];
}

const SemesterTable = (props: TableProps): React.ReactNode => {
    const {
        header,
        className,
        rows: rawRows,
        alignments,
        size,
        compact,
        celled,
        striped,
        collapsing,
        selectable,
        order
    } = props;

    const dateIndex = useMemo(() => header?.indexOf('Datum') ?? -1, [header]);
    const rows = useMemo(() => (order ? order(rawRows) : rawRows), [order, rawRows]);
    const KWs = useMemo(() => {
        if (dateIndex === -1) {
            return [];
        }
        let currentWeek = -1;
        return rows.map((row) => {
            const cell = row.cells[dateIndex];
            if (typeof cell === 'string') {
                const date = getDate(cell);
                if (date) {
                    const week = weekNumber(date);
                    if (week !== currentWeek) {
                        currentWeek = week;
                        return week;
                    }
                }
            }
            return 0;
        });
    }, [dateIndex, rows]);

    return (
        <table
            style={{ display: 'table', borderCollapse: 'collapse' }}
            className={clsx(
                className,
                styles.semesterTable,
                styles[size as string],
                compact && styles.compact,
                celled && styles.celled,
                striped && styles.striped,
                collapsing && styles.collapsing,
                selectable && styles.selectable
            )}
        >
            <thead>
                {header && (
                    <tr>
                        {header.map((cell, idx) => {
                            const align = (alignments?.length || 0) > idx ? alignments![idx] : 'left';
                            return (
                                <th align={align} key={idx}>
                                    {cell}
                                </th>
                            );
                        })}
                    </tr>
                )}
            </thead>
            <tbody>
                {rows.map((row, idx) => (
                    <Row
                        alignments={alignments}
                        {...row}
                        key={idx}
                        dateIndex={dateIndex}
                        className={clsx(row.className, KWs[idx] > 0 && styles.firstOfWeek)}
                    />
                ))}
            </tbody>
        </table>
    );
};

export default SemesterTable;
