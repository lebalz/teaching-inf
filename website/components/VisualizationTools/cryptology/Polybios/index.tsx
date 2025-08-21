import clsx from 'clsx';
import * as React from 'react';
import shared from '../styles.module.scss';
import styles from './styles.module.scss';
import { useStore } from '@tdev/hooks/useStore';
import { action } from 'mobx';
import { observer } from 'mobx-react-lite';
import Button from '@tdev-components/shared/Button';
import { mdiKeyboardReturn, mdiShuffleVariant } from '@mdi/js';
import { SIZE_S } from '@tdev-components/shared/iconSizes';
import CopyBadge from '@tdev-components/shared/CopyBadge';
import TextInput from '@tdev-components/shared/TextInput';

export default observer(() => {
    const store = useStore('siteStore').toolsStore.polybios;
    const [newAlphabet, setNewAlphabet] = React.useState<string>('');

    return (
        <div className={clsx('hero', 'shadow--lw', shared.container)}>
            <div className="container">
                <p className="hero__subtitle">Polybios-Chiffre</p>
                <div className={clsx(styles.polybios)}>
                    <div className={clsx(styles.square)}>
                        <div className={clsx(styles.item, styles.head)}></div>
                        <div className={clsx(styles.item, styles.head)}>1</div>
                        <div className={clsx(styles.item, styles.head)}>2</div>
                        <div className={clsx(styles.item, styles.head)}>3</div>
                        <div className={clsx(styles.item, styles.head)}>4</div>
                        <div className={clsx(styles.item, styles.head)}>5</div>
                        {store.alphabet.map((char, idx) => (
                            <React.Fragment key={idx}>
                                {idx % 5 === 0 && (
                                    <div className={clsx(styles.item, styles.side)}>{idx / 5 + 1}</div>
                                )}
                                <div className={styles.item}>{char === ' ' ? '⎵' : char}</div>
                            </React.Fragment>
                        ))}
                    </div>
                    <div className={clsx(styles.actions)}>
                        <Button
                            text="Alphabet mischen"
                            icon={mdiShuffleVariant}
                            size={SIZE_S}
                            iconSide="left"
                            noOutline
                            color="primary"
                            onClick={() => store.shuffleAlphabet()}
                        />
                        <div className={clsx(styles.inputContainer)}>
                            <TextInput
                                label="Alphabet"
                                value={newAlphabet}
                                labelClassName={styles.label}
                                onChange={action((value) => {
                                    setNewAlphabet(value.toUpperCase());
                                })}
                                onEnter={action(() => {
                                    store.setAlphabet(newAlphabet.split(''));
                                    setNewAlphabet('');
                                })}
                                noSpellCheck
                                noAutoFocus
                            />
                            <Button
                                icon={mdiKeyboardReturn}
                                title="Alphabet setzen"
                                size={SIZE_S}
                                onClick={() => {
                                    store.setAlphabet(newAlphabet.split(''));
                                    setNewAlphabet('');
                                }}
                            />
                        </div>
                        <CopyBadge
                            value={store.alphabet.join('')}
                            label="Schlüssel kopieren"
                            size={SIZE_S}
                            className={styles.copyBadge}
                        />
                    </div>
                </div>
                <h4>Klartext</h4>
                <div className={shared.inputContainer}>
                    <textarea
                        className={clsx(shared.input)}
                        value={store.text}
                        onChange={(e) => {
                            const pos = Math.max(e.target.selectionStart, e.target.selectionEnd);
                            store.setText(e.target.value);
                            queueMicrotask(() => {
                                e.target.setSelectionRange(pos, pos);
                            });
                        }}
                        onFocus={action(() => store.setSource('text'))}
                        rows={5}
                        placeholder="Klartext"
                    ></textarea>
                    {store.source === 'text' && <div className={shared.active}></div>}
                </div>
                <h4>Geheimtext</h4>
                <div className={shared.inputContainer}>
                    <textarea
                        className={clsx(shared.input)}
                        value={store.cipherText}
                        onChange={(e) => {
                            const pos = Math.max(e.target.selectionStart, e.target.selectionEnd);
                            store.setCipherText(e.target.value);
                            queueMicrotask(() => {
                                e.target.setSelectionRange(pos, pos);
                            });
                        }}
                        onFocus={action(() => store.setSource('cipher'))}
                        rows={5}
                        placeholder="Polybios Verschlüsselter Geheimtext"
                    ></textarea>
                    {store.source === 'cipher' && <div className={shared.active}></div>}
                </div>
            </div>
        </div>
    );
});
