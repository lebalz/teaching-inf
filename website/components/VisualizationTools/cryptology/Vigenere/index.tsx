import { mdiRestore, mdiUndo } from '@mdi/js';
import Button from '@tdev-components/shared/Button';
import { useStore } from '@tdev-hooks/useStore';
import clsx from 'clsx';
import { action } from 'mobx';
import { observer } from 'mobx-react-lite';
import shared from '../styles.module.scss';
import styles from './styles.module.scss';
import VigenereStep from './VigenereStep';
import VigenereTable from './VigenereTable';

interface Props {}

const Vigenere = observer((props: Props) => {
    const store = useStore('siteStore');
    const { vignere } = store.toolsStore;
    return (
        <div className={clsx('hero', 'shadow--lw', shared.container)}>
            <div className="container">
                <p className="hero__subtitle">Vigenère-Chiffre</p>
                <div></div>
                <div className={clsx(styles.vignere)}>
                    <div className={clsx(styles.table)}>
                        <div className={clsx(styles.labelPlaintext)}>Klartext (p)</div>
                        <div className={clsx(styles.labelKey)}>Schlüssel (k)</div>
                        <VigenereTable />
                    </div>
                    <div className={clsx(styles.controls)}>
                        <div className={clsx(styles.modes)}>
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
                        <VigenereStep />
                    </div>
                </div>
            </div>
        </div>
    );
});

export default Vigenere;
