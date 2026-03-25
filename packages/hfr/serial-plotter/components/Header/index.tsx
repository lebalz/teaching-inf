import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import Decoder from '../../models/Decoder';
import Badge from '@tdev-components/shared/Badge';
import { Formatters } from '../helpers';
import { COLORS } from '../PlotterChart';
import Icon from '@mdi/react';
import { mdiCameraTimer } from '@mdi/js';
import { SIZE_XS } from '@tdev-components/shared/iconSizes';
import ExcelExport from '../ExcelExport';
import Card from '@tdev-components/shared/Card';

interface Props {
    decoder: Decoder;
}

const Header = observer((props: Props) => {
    const { decoder } = props;
    return (
        <Card classNames={{ card: clsx(styles.card), body: clsx(styles.header) }}>
            {decoder.data.length > 0 && (
                <>
                    <ExcelExport decoder={decoder} />
                    <div style={{ flex: 1 }} />
                </>
            )}
            <Badge># {decoder.data.length}</Badge>
            <Badge color="blue">
                <Icon path={mdiCameraTimer} size={SIZE_XS} />
                {Formatters.ms(decoder.current?.timestamp || 0)}
            </Badge>
            {decoder.dataLabels.map((label, idx) => (
                <Badge key={idx} color={COLORS[idx % COLORS.length]}>
                    {label}: {decoder.current?.[label].toFixed(2) || 'N/A'}
                </Badge>
            ))}
        </Card>
    );
});

export default Header;
