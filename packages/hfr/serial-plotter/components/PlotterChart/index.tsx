import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import Decoder from '../../models/Decoder';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { IfmColors } from '@tdev-components/shared/Colors';
import { Formatters } from '../helpers';

interface Props {
    decoder: Decoder;
    minValue?: number;
    maxValue?: number;
    unit?: string;
    xTimeFormatter?: (timestamp: number, idx?: number) => string;
    timeFormatter?: keyof typeof Formatters;
    animate?: boolean;
    strokeWidth?: number;
    showGrid?: boolean;
}

export const COLORS = [
    IfmColors.blue,
    IfmColors.green,
    IfmColors.orange,
    IfmColors.red,
    IfmColors.gray,
    IfmColors.lightBlue
];

const PlotterChart = observer((props: Props) => {
    const { decoder } = props;

    return (
        <div className={clsx(styles.chart)}>
            <LineChart
                style={{
                    width: '100%',
                    maxWidth: '95vw',
                    height: '100%',
                    maxHeight: '70vh',
                    aspectRatio: 1.618
                }}
                responsive
                data={decoder.sampledData}
                margin={{
                    top: 5,
                    right: 0,
                    left: 0,
                    bottom: 5
                }}
            >
                {props.showGrid && <CartesianGrid strokeDasharray="3 3" />}
                <XAxis
                    dataKey={'timestamp'}
                    tickFormatter={
                        props.xTimeFormatter ??
                        (props.timeFormatter ? Formatters[props.timeFormatter] : undefined)
                    }
                />
                <YAxis
                    unit={props.unit}
                    domain={[props.minValue ?? 'dataMin', props.maxValue ?? 'dataMax']}
                />
                <Tooltip
                    cursor={{
                        stroke: 'var(--ifm-font-color-base)'
                    }}
                    contentStyle={{
                        backgroundColor: 'var(--ifm-background-surface-color)',
                        borderColor: 'var(--ifm-color-content-secondary)'
                    }}
                    labelFormatter={(label, payload) => {
                        return typeof label === 'number' ? (Formatters.ms(label) ?? label) : label;
                    }}
                />
                <Legend />
                {decoder.dataLabels.map((label, idx) => (
                    <Line
                        key={idx}
                        type="monotone"
                        dataKey={label}
                        dot={decoder.data.length <= 20}
                        stroke={COLORS[idx]}
                        isAnimationActive={!!props.animate}
                        strokeWidth={props.strokeWidth ?? 2}
                    />
                ))}
            </LineChart>
        </div>
    );
});

export default PlotterChart;
