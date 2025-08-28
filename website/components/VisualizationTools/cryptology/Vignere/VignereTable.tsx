import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { useStore } from '@tdev-hooks/useStore';
import { action } from 'mobx';

interface Props {}
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const VignereTable = observer((props: Props) => {
    const store = useStore('siteStore');
    const { vignere } = store.toolsStore;

    return (
        <table className={clsx(styles.vignereTable)}>
            <tbody>
                <tr className={clsx(styles.line, styles.header)}>
                    <td></td>
                    {ALPHABET.split('').map((char, idx) => (
                        <td key={char} className={clsx(styles.alphabet, styles[`col-${idx + 1}`])}>
                            {char}
                        </td>
                    ))}
                </tr>
                {ALPHABET.split('').map((rowChar, rowIndex) => (
                    <tr key={rowChar} className={clsx(styles.line)}>
                        <td className={clsx(styles.alphabet)}>{rowChar}</td>
                        {ALPHABET.split('').map((colChar, idx) => {
                            const shiftedIndex = (idx + rowIndex) % ALPHABET.length;
                            return (
                                <td
                                    key={colChar}
                                    className={clsx(styles.col, styles[`col-${idx + 1}`])}
                                    onClick={action(() => {
                                        vignere.addStep({
                                            keyChar: rowChar,
                                            textChar: colChar,
                                            cipherChar: ALPHABET[shiftedIndex]
                                        });
                                    })}
                                >
                                    {ALPHABET[shiftedIndex]}
                                </td>
                            );
                        })}
                    </tr>
                ))}
            </tbody>
        </table>
    );
});

export default VignereTable;
