import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';

const Ratespiel = () => {
    const [runCnt, setRunCnt] = React.useState(0);
    React.useEffect(() => {
        if (runCnt <= 0) {
            return;
        }
        const rnd = Math.floor(Math.random() * 100);
        let zahl = -1;
        for (let i = 1; i < 11; i++) {
            const res = prompt(`${i}/10 Versuchen: Gib eine ganze Zahl zwischen 0 und 100 ein.`);
            if (res === null) {
                break;
            }
            zahl = Number.parseInt(res, 10);
            if (Number.isNaN(zahl)) {
                zahl = -1;
            }
            if (zahl === rnd) {
                alert(`Yay 🎉, du hast die Zahl ${rnd} in ${i} Versuchen gefunden! 🥳`);
                break;
            } else if (zahl < rnd) {
                alert(`Die eingegebene Zahl ${zahl} ist zu klein 😪`);
            } else {
                alert(`Die eingegebene Zahl ${zahl} ist zu gross 😫`);
            }
        }
        if (zahl !== rnd) {
            alert(`🤬 du hast verloren, die gesuchte Zahl war ${rnd}`);
        }
    }, [runCnt]);

    return (
        <button
            className={clsx('button', 'button--success', styles.button)}
            onClick={() => setRunCnt(runCnt + 1)}
        >
            Ratespiel Starten
        </button>
    );
};

export default Ratespiel;
