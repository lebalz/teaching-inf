import clsx from 'clsx';
import * as React from 'react';
import containerStyles from '../container.module.scss';
import styles from './styles.module.scss';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import Css from './Css';

const CMYK = () => {
    const [c, setC] = React.useState(90);
    const [m, setM] = React.useState(70);
    const [y, setY] = React.useState(50);
    const [k, setK] = React.useState(30);
    const [r, setR] = React.useState(0);
    const [g, setG] = React.useState(0);
    const [b, setB] = React.useState(0);

    React.useEffect(() => {
        setR(Math.round(255 * (1 - c * 0.01) * (1 - k * 0.01)));
        setG(Math.round(255 * (1 - m * 0.01) * (1 - k * 0.01)));
        setB(Math.round(255 * (1 - y * 0.01) * (1 - k * 0.01)));
    }, [c, m, y, k]);

    return (
        <div
            className={clsx('hero', 'shadow--lw', containerStyles.container, styles.cmyk)}
            style={{ background: `rgb(${r},${g},${b})` }}
        >
            <div className="container">
                <p className="hero__subtitle">CMYK</p>
                <div className={clsx(styles.color, styles.cyan)}>
                    <span className={clsx(styles.label)}>Cyan</span>
                    <Slider
                        value={c}
                        onChange={(c) => {
                            if (typeof c === 'number') {
                                setC(c);
                            }
                        }}
                        min={0}
                        max={100}
                        dots={false}
                    />
                    <span className={clsx(styles.value)}>{`${c} %`}</span>
                </div>
                <div className={clsx(styles.color, styles.magenta)}>
                    <span className={clsx(styles.label)}>Magenta</span>
                    <Slider
                        value={m}
                        onChange={(c) => {
                            if (typeof c === 'number') {
                                setM(c);
                            }
                        }}
                        min={0}
                        max={100}
                        dots={false}
                    />
                    <span className={clsx(styles.value)}>{`${m} %`}</span>
                </div>
                <div className={clsx(styles.color, styles.yellow)}>
                    <span className={clsx(styles.label)} title="Yellow">
                        Yellow
                    </span>
                    <Slider
                        value={y}
                        onChange={(c) => {
                            if (typeof c === 'number') {
                                setY(c);
                            }
                        }}
                        min={0}
                        max={100}
                        dots={false}
                    />
                    <span className={clsx(styles.value)}>{`${y} %`}</span>
                </div>
                <div className={clsx(styles.color, styles.key)}>
                    <span className={clsx(styles.label)}>Key</span>
                    <Slider
                        value={k}
                        onChange={(c) => {
                            if (typeof c === 'number') {
                                setK(c);
                            }
                        }}
                        min={0}
                        max={100}
                        dots={false}
                    />
                    <span className={clsx(styles.value)}>{`${k} %`}</span>
                </div>
                <Css hex={[r, g, b]} value={`rgb(${r}, ${g}, ${b})`} />
            </div>
        </div>
    );
};

export default CMYK;
