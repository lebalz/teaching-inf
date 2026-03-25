import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import Decoder from '../../models/Decoder';
import { Formatters } from '../helpers';

interface Props {
    decoder: Decoder;
}

const PlotterTable = observer((props: Props) => {
    const { decoder } = props;
    return (
        <table className={clsx(styles.table)}>
            <thead>
                <tr>
                    <th>Zeit</th>
                    {decoder.dataLabels.map((label, idx) => (
                        <th key={idx}>{label}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {decoder.recentData.map((dataPoint, idx) => (
                    <tr key={idx}>
                        <td>{Formatters.ms(dataPoint.timestamp)}</td>
                        {decoder.dataLabels.map((label, i) => (
                            <td key={i}>{dataPoint[label].toFixed(4)}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
});

export default PlotterTable;
