import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import TextAreaInput from '../TextAreaInput';
import { useStore } from '@tdev-hooks/useStore';
import Button from '../Button';
import Table from '../Table';
import { mdiCheckboxBlank, mdiCheckboxBlankBadge, mdiCheckboxBlankOutline, mdiCheckboxMarked } from '@mdi/js';

interface Props {
    matchUsers?: boolean;
    onDone?: (table?: string[][]) => void;
}

const FromXlsxClipboard = observer((props: Props) => {
    const [table, setTable] = React.useState<string[][]>([]);
    const [text, setText] = React.useState('');
    const [withHeader, setWithHeader] = React.useState(true);
    const userStore = useStore('userStore');
    React.useEffect(() => {
        const rows = text
            .trim()
            .split('\n')
            .filter((r) => r.trim().length > 0);
        const content = rows
            .map((row, idx) => {
                const cells = row.split('\t');
                if (props.matchUsers) {
                    const user = userStore.users.find((u) => u.searchRegex.test(row));
                    if (user) {
                        cells.unshift(user.id);
                    } else {
                        if (props.matchUsers && withHeader && idx === 0) {
                            cells.unshift('User ID');
                        } else {
                            cells.unshift('');
                        }
                    }
                }
                return cells;
            })
            .filter((row) => row.length > 0);
        const columns = Math.max(...content.map((c) => c.length));
        content.forEach((row) => {
            while (row.length < columns) {
                row.push('');
            }
        });
        console.log(text, rows, content);
        setTable(content);
    }, [text, withHeader]);

    return (
        <div className={clsx(styles.xlsxImport, 'card')}>
            <div className="card__header">
                <h3>Excel-Zellen einfügen</h3>
            </div>
            <div className="card__body">
                <p>
                    Kopierte Excel-Zellen hier per <kbd>Strg</kbd> + <kbd>V</kbd> einfügen.
                </p>
                <div className={clsx(styles.main)}>
                    <div className={clsx(styles.input)}>
                        <TextAreaInput
                            onChange={setText}
                            className={clsx(styles.textArea)}
                            placeholder="Excel-Zellen hier einfügen"
                        />
                        <Button
                            icon={withHeader ? mdiCheckboxMarked : mdiCheckboxBlankOutline}
                            onClick={() => setWithHeader(!withHeader)}
                            color={withHeader ? 'green' : 'black'}
                            text="Erste Zeile als Header verwenden"
                            iconSide="left"
                        />
                    </div>
                    <div className={clsx(styles.preview)}>
                        {table.length > 0 && <Table cells={table} withHeader={withHeader} />}
                    </div>
                </div>
            </div>
            <div className="card__footer">
                <div className={clsx('button-group', 'button-group--block')}>
                    <Button
                        text="Abbrechen"
                        onClick={() => {
                            if (props.onDone) {
                                props.onDone();
                            }
                        }}
                        color="black"
                    />
                    <Button
                        text="Importieren"
                        onClick={() => {
                            if (props.onDone) {
                                props.onDone(table.slice(withHeader ? 1 : 0));
                            }
                        }}
                        color="primary"
                    />
                </div>
            </div>
        </div>
    );
});

export default FromXlsxClipboard;
