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
import { mdiContentSave, mdiSend, mdiTagEdit } from '@mdi/js';
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
                            text={decoder.config.mode}
                            onClick={() => {
                                decoder.nextMode();
                            }}
                            color="blue"
                        />
                        {decoder.ipInput.length === 0 ? (
                            <>
                                <Badge>{decoder.config.ip}</Badge>
                                <Button
                                    onClick={() => {
                                        console.log('set', decoder.config?.ip);
                                        decoder.setIpInput(decoder.config?.ip || '192.168.0.1');
                                    }}
                                    icon={mdiTagEdit}
                                    size={SIZE_S}
                                />
                            </>
                        ) : (
                            <>
                                <TextInput
                                    onChange={(text) => {
                                        decoder.setIpInput(text);
                                    }}
                                    label="Daten"
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
                                />
                            </>
                        )}
                    </div>
                    <div className={clsx(styles.messages)}>
                        <div className={clsx(styles.input)}>
                            <TextInput
                                onChange={(text) => {
                                    decoder.setMessage(text);
                                }}
                                label="Daten"
                                value={decoder.message}
                                onEnter={() => {
                                    decoder.sendMessage();
                                }}
                                className={clsx(styles.textInput)}
                                labelClassName={clsx(styles.label)}
                            />
                            <TextInput
                                onChange={(text) => {
                                    decoder.setReceiverIp(text);
                                }}
                                label="Empfänger (IP)"
                                value={decoder.receiverIp}
                                onEnter={() => {
                                    decoder.sendMessage();
                                }}
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
