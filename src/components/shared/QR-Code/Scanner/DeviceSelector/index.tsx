import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import Loader from '@tdev-components/Loader';
import Button from '@tdev-components/shared/Button';
import { useClientLib } from '@tdev-hooks/useClientLib';
import type { default as QrScannerLib } from '@yudiel/react-qr-scanner';

interface Props {
    useDevices: typeof QrScannerLib.useDevices;
}
const DeviceSelector = observer((props: Props) => {
    const devices = props.useDevices();
    return <pre>{JSON.stringify(devices, null, 2)}</pre>;
});

export default DeviceSelector;
