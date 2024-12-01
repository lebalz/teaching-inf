import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';

interface Props {
    withHeader?: boolean;
    cells: (string | number | boolean | null | undefined)[][];
    className?: string;
}

const Table = observer((props: Props) => {
    return (
        <table className={clsx(styles.table, props.className)}>
            {props.withHeader && (
                <thead>
                    <tr>
                        {props.cells[0].map((cell, i) => (
                            <th key={i}>{cell}</th>
                        ))}
                    </tr>
                </thead>
            )}
            <tbody>
                {props.cells.slice(props.withHeader ? 1 : 0).map((row, i) => (
                    <tr key={i}>
                        {row.map((cell, j) => (
                            <td key={j}>{cell}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
});

export default Table;
