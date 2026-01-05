import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@tdev-hooks/useStore';
import Button from '@tdev-components/shared/Button';
import { mdiClock } from '@mdi/js';

interface Props {
    clockId: string;
}

const TryUserClock = observer((props: Props) => {
    const { clockId } = props;
    const siteStore = useStore('siteStore');
    const clock = siteStore.clocks.useClock(clockId);

    return (
        <Button
            text="Ausprobieren"
            onClick={() => {
                const hours = window.prompt('Stunden (0-23)?');
                const minutes = window.prompt('Minuten (0-59)?');
                const seconds = window.prompt('Sekunden (0-59)?');
                const h = parseInt(hours || '0', 10);
                const m = parseInt(minutes || '0', 10);
                const s = parseInt(seconds || '0', 10);
                clock.setClock((360 / 12) * h, (360 / 60) * m, (360 / 60) * s);
            }}
            size={1.5}
            icon={mdiClock}
            iconSide="left"
            color="green"
        />
    );
});

export default TryUserClock;
