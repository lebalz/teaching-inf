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
import { mdiCloseCircle, mdiContentSave, mdiSend, mdiSquareEditOutline } from '@mdi/js';
import { SIZE_S } from '@tdev-components/shared/iconSizes';

interface Props {}

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
            return new Decoder(subscriptionId, device);
        }
    }, [device, subscriptionId]);

    if (!(decoder && device)) {
        return <div>Netzwerk</div>;
    }

    return (
        <div className={clsx(styles.networkDevice, isFullscreen && styles.fullscreen)}>
            {decoder.config && (
                <div>
                    <div className={clsx(styles.config)}>
                        <Button
                            icon={decoder.config.icon}
                            iconSide="left"
                            text={decoder.config.mode}
                            onClick={() => {
                                decoder.nextMode();
                            }}
                            color="blue"
                        />
                        {decoder.ipInput.length === 0 ? (
                            <div className={clsx(styles.ip)}>
                                <Button
                                    onClick={() => {
                                        decoder.setIpInput(decoder.config?.ip || '192.168.0.1');
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
                                    decoder.isValidInputIp ? styles.valid : styles.invalid
                                )}
                            >
                                <TextInput
                                    onChange={(text) => {
                                        decoder.setIpInput(text || ' ');
                                    }}
                                    label="IP"
                                    labelClassName={clsx(styles.label)}
                                    value={decoder.ipInput}
                                    onEnter={() => {
                                        decoder.applyIpInput();
                                    }}
                                />
                                <Button
                                    onClick={() => {
                                        decoder.applyIpInput();
                                    }}
                                    icon={mdiContentSave}
                                    color="green"
                                    size={SIZE_S}
                                    disabled={!decoder.isValidInputIp}
                                />
                                <Button
                                    onClick={() => {
                                        decoder.setIpInput('');
                                    }}
                                    icon={mdiCloseCircle}
                                    color="black"
                                    size={SIZE_S}
                                />
                            </div>
                        )}
                    </div>
                    <div className={clsx(styles.input)}>
                        <TextInput
                            onChange={(text) => {
                                decoder.setReceiverIp(text);
                            }}
                            label="IP Empfangsgerät"
                            value={decoder.receiverIp}
                            onEnter={() => {
                                decoder.sendMessage();
                            }}
                            noAutoFocus
                            placeholder={decoder.config.ip.split('.').slice(0, 3).join('.') + '.1'}
                            className={clsx(styles.receiverIpInput)}
                            labelClassName={clsx(styles.label)}
                        />
                        <div className={clsx(styles.message)}>
                            <TextInput
                                onChange={(text) => {
                                    decoder.setMessage(text);
                                }}
                                label="Nachricht"
                                value={decoder.message}
                                onEnter={() => {
                                    decoder.sendMessage();
                                }}
                                noAutoFocus
                                className={clsx(styles.textInput)}
                                labelClassName={clsx(styles.label)}
                            />
                            <Button
                                onClick={() => {
                                    decoder.sendMessage();
                                }}
                                icon={mdiSend}
                                disabled={!decoder.canSend}
                            />
                        </div>
                    </div>
                </div>
            )}
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
        </div>
    );
});

export default NetworkDevice;
