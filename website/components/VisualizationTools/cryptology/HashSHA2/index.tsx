import clsx from 'clsx';
import styles from '../styles.module.scss';
// @ts-ignore
import { useStore } from '@tdev/hooks/useStore';
import { observer } from 'mobx-react-lite';

const HashSHA2 = observer(() => {
    const store = useStore('siteStore').toolsStore;
    const { text, hash } = store.hashSha256;

    return (
        <div className={clsx('hero', 'shadow--lw', styles.container)}>
            <div className="container">
                <p className="hero__subtitle">SHA-256 Hash</p>
                <h4>Input</h4>
                <textarea
                    className={clsx(styles.input)}
                    value={text}
                    onChange={(e) => {
                        store.setSha256Text(e.target.value);
                    }}
                    rows={5}
                    placeholder="Text"
                ></textarea>
                <h4>SHA-256 Hash</h4>
                <textarea
                    className={clsx(styles.input)}
                    value={hash}
                    readOnly
                    placeholder="SHA256-Hash"
                ></textarea>
            </div>
        </div>
    );
});

export default HashSHA2;
