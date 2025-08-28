import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import VignereStep from './VignereStep';
import { action } from 'mobx';
import { useStore } from '@tdev-hooks/useStore';
import Button from '@tdev-components/shared/Button';
import { mdiRestore, mdiStepBackward, mdiUndo } from '@mdi/js';
import VignereTable from './VignereTable';

interface Props {}

const Vignere = observer((props: Props) => {
    const store = useStore('siteStore');
    const { vignere } = store.toolsStore;
    return (
        <div className={clsx(styles.vignere)}>
            <div className={clsx(styles.table)}>
                <div className={clsx(styles.labelPlaintext)}>Klartext (p)</div>
                <div className={clsx(styles.labelKey)}>Schlüssel (k)</div>
                <VignereTable />
            </div>
            <div className={clsx(styles.controls)}>
                <div className={clsx(styles.modes)}>
                    <div className={clsx(styles.modeButtons, 'button-group')}>
                        <Button
                            text="Verschlüsseln"
                            color="primary"
                            active={vignere.mode === 'encrypt'}
                            onClick={action(() => vignere.setMode('encrypt'))}
                        />
                        <Button
                            text="Entschlüsseln"
                            color="primary"
                            active={vignere.mode === 'decrypt'}
                            onClick={action(() => vignere.setMode('decrypt'))}
                        />
                    </div>
                    {vignere.state.length > 0 && (
                        <>
                            <Button
                                icon={mdiUndo}
                                title="Schritt zurück"
                                color="secondary"
                                onClick={action(() => {
                                    vignere.undo();
                                })}
                            />
                            <Button
                                icon={mdiRestore}
                                title="Zurücksetzen"
                                color="orange"
                                onClick={action(() => vignere.reset())}
                            />
                        </>
                    )}
                </div>
                <VignereStep />
            </div>
        </div>
    );
});

export default Vignere;
