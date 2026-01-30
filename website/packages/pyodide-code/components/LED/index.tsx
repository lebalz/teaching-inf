import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { useStore } from '@tdev-hooks/useStore';
import Card from '@tdev-components/shared/Card';
import CopyBadge from '@tdev-components/shared/CopyBadge';
import React from 'react';
import ColorPicker from '@radial-color-picker/react-color-picker';

interface Props {
    ledId: string;
}

const LED = observer((props: Props) => {
    const { ledId } = props;
    const siteStore = useStore('siteStore');
    const led = siteStore.toolsStore.ledStore.useLED(ledId);
    return (
        <Card
            classNames={{ body: clsx(styles.ledCard), card: clsx(styles.card) }}
            header={
                <h3>
                    LED: <CopyBadge value={ledId} className={clsx(styles.id)} />
                </h3>
            }
        >
            <div
                style={{
                    background: `hsl(${led.hsl[0]}, ${led.hsl[1]}%, ${led.hsl[2]}%)`
                }}
                className={clsx(styles.led)}
            >
                <ColorPicker
                    key={led.hsl.join('-')}
                    variant="persistent"
                    hue={led.hsl[0]}
                    saturation={led.hsl[1]}
                    luminosity={led.hsl[2]}
                />
            </div>
        </Card>
    );
});

export default LED;
