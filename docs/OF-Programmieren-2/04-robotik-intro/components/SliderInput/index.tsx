import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import Slider from 'rc-slider/lib/Slider';
import 'rc-slider/assets/index.css';

interface Props {
    label: string;
    className?: string;
    labelClassName?: string;
    onChange?: (value: number) => void;
    value?: number;
    defaultValue?: number;
    min?: number;
    max?: number;
    dots?: boolean;
}

const SliderInput = (props: Props) => {
    const [value, setValue] = React.useState(props.value ?? props.defaultValue ?? props.min ?? 0);

    return (
        <div className={clsx(styles.color, props.className)}>
            <span className={clsx(styles.label, props.labelClassName)}>{props.label}</span>
            <Slider
                value={props.value ?? value}
                onChange={(c) => {
                    if (typeof c === 'number') {
                        props.onChange?.(c);
                        if (props.value === undefined) {
                            setValue(c);
                        }
                    }
                }}
                min={props.min ?? 0}
                max={props.max ?? 255}
                dots={props.dots ?? false}
            />
            <span className={clsx(styles.value)}>{Math.round(props.value ?? value)}</span>
        </div>
    );
};

export default SliderInput;
