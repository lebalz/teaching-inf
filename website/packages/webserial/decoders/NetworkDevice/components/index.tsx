import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { useStore } from '@tdev-hooks/useStore';
import { useDeviceId } from '@tdev/webserial/hooks/useDeviceId';
import Decoder from '../models/Decoder';
import { useFullscreenTargetId } from '@tdev-hooks/useFullscreenTargetId';
import Button from '@tdev-components/shared/Button';
import Logs from '@tdev-components/documents/CodeEditor/Editor/Footer/Logs';
import Badge from '@tdev-components/shared/Badge';
import TextInput from '@tdev-components/shared/TextInput';
import { mdiCloseCircle, mdiContentSave, mdiRestore, mdiSend, mdiSquareEditOutline } from '@mdi/js';
import { SIZE_S } from '@tdev-components/shared/iconSizes';
import CopyBadge from '@tdev-components/shared/CopyBadge';
import { Config } from '../models/DeviceConfig';
import Icon from '@mdi/react';
import Card from '@tdev-components/shared/Card';
// @ts-ignore
import Details from '@theme/Details';
import Frames from './Frame/Frames';
import Alert from '@tdev-components/shared/Alert';

interface Props {
    config?: Config;
    canChangeMode?: boolean;
}

const NetworkDevice = observer((props: Props) => {
    const subscriptionId = React.useId();
    const viewStore = useStore('viewStore');
    const webserialStore = viewStore.useStore('webserialStore');
    const deviceId = useDeviceId();
    const fullscreenTargetId = useFullscreenTargetId();
    const device = webserialStore.devices.get(deviceId);
    const isFullscreen = viewStore.isFullscreenTarget(fullscreenTargetId);
    const decoder = React.useMemo(() => {
        if (device) {
            return new Decoder(subscriptionId, device, props.config);
        }
    }, [device, subscriptionId, props.config]);

    if (!(decoder && device)) {
        return <div>Netzwerk</div>;
    }

    return (
        <div className={clsx(styles.networkDevice, isFullscreen && styles.fullscreen)}>
            {decoder.config && (
                <div>
                    <div className={clsx(styles.config)}>
                        <CopyBadge
                            value={decoder.config.mac}
                            label={`MAC: ${decoder.config.mac}`}
                            color="blue"
                        />
                        {decoder.config.ip && (
                            <CopyBadge
                                value={decoder.config.ip}
                                label={`IP: ${decoder.config.ip}`}
                                color="blue"
                            />
                        )}
                        {decoder.config.defaultGateway && (
                            <Badge>{`Gateway: ${decoder.config.defaultGateway}`}</Badge>
                        )}
                        <Badge>{decoder.config.radio.address}</Badge>
                        <Badge>{decoder.config.radio.group}</Badge>
                        <Badge>{decoder.config.radio.power}</Badge>
                        <Button
                            title="Konfiguration zurücksetzen"
                            icon={mdiRestore}
                            onClick={() => {
                                decoder.resetConfig();
                            }}
                        />
                        {props.canChangeMode && (
                            <Button
                                icon={decoder.config.icon}
                                iconSide="left"
                                text={decoder.config.mode}
                                onClick={() => {
                                    decoder.nextMode();
                                }}
                                color="blue"
                            />
                        )}
                        {decoder.deviceIp.length === 0 ? (
                            <div className={clsx(styles.ip)}>
                                <Button
                                    onClick={() => {
                                        decoder.setDeviceIp(decoder.config?.ip || '192.168.0.1');
                                    }}
                                    text={`IP: ${decoder.config.ip}`}
                                    icon={mdiSquareEditOutline}
                                    color="blue"
                                />
                            </div>
                        ) : (
                            <div
                                className={clsx(
                                    styles.ip,
                                    styles.editing,
                                    decoder.isValidDeviceIp ? styles.valid : styles.invalid
                                )}
                            >
                                <TextInput
                                    onChange={(text) => {
                                        decoder.setDeviceIp(text || ' ');
                                    }}
                                    label="IP"
                                    labelClassName={clsx(styles.label)}
                                    value={decoder.deviceIp}
                                    onEnter={() => {
                                        decoder.flashDeviceIp();
                                    }}
                                />
                                <Button
                                    onClick={() => {
                                        decoder.flashDeviceIp();
                                    }}
                                    icon={mdiContentSave}
                                    color="green"
                                    size={SIZE_S}
                                />
                                <Button
                                    onClick={() => {
                                        decoder.setDeviceIp('');
                                    }}
                                    icon={mdiCloseCircle}
                                    color="black"
                                    size={SIZE_S}
                                />
                            </div>
                        )}
                    </div>
                    <Card classNames={{ body: clsx(styles.configMode) }}>
                        <Icon path={decoder.config.icon} size={4} color="var(--ifm-color-blue)" />
                        <Badge>{decoder.config.mode}</Badge>
                    </Card>
                    <div className={clsx(styles.input)}>
                        <TextInput
                            onChange={(text) => {
                                decoder.setMessage(text);
                            }}
                            label="Nachricht"
                            value={decoder.message}
                            noAutoFocus
                            className={clsx(styles.textInput)}
                            labelClassName={clsx(styles.label)}
                        />
                        <div className={clsx(styles.message)}>
                            <TextInput
                                onChange={(text) => {
                                    decoder.setReceiverMac(text);
                                }}
                                label="MAC Empfangsgerät"
                                value={decoder.receiverMac}
                                onEnter={() => {
                                    decoder.send_L2();
                                }}
                                noAutoFocus
                                placeholder={decoder.config.mac}
                                className={clsx(styles.receiverIpInput)}
                                labelClassName={clsx(styles.label)}
                            />
                            <Button
                                onClick={() => {
                                    decoder.send_L2();
                                }}
                                icon={mdiSend}
                                disabled={!decoder.canSendL2}
                            />
                        </div>
                        {decoder.config.ip && (
                            <div className={clsx(styles.message)}>
                                <TextInput
                                    onChange={(text) => {
                                        decoder.setReceiverIp(text);
                                    }}
                                    label="IP Empfangsgerät"
                                    value={decoder.receiverIp}
                                    onEnter={() => {
                                        decoder.send_L3();
                                    }}
                                    noAutoFocus
                                    placeholder={decoder.config.ip.split('.').slice(0, 3).join('.') + '.1'}
                                    className={clsx(styles.receiverIpInput)}
                                    labelClassName={clsx(styles.label)}
                                />
                                <Button
                                    onClick={() => {
                                        decoder.send_L3();
                                    }}
                                    icon={mdiSend}
                                    disabled={!decoder.canSendL3}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
            {decoder.error && (
                <Alert
                    type="danger"
                    onDiscard={() => {
                        decoder.clearError();
                    }}
                    title="Fehler"
                >
                    {decoder.error}
                </Alert>
            )}
            <Frames decoder={decoder} />
            <Details summary="Logs">
                <Logs
                    messages={(device.receivedData[device.size - 1] === ''
                        ? device.receivedData.slice(0, -1)
                        : device.receivedData
                    ).map((d) => ({
                        type: 'log',
                        message: d
                    }))}
                    maxLines={20}
                />
            </Details>
        </div>
    );
});

export default NetworkDevice;
