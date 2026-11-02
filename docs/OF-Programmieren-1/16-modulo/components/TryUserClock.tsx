import { mdiClock } from '@mdi/js';
import Button from '@tdev-components/shared/Button';
import { useExtensionStore } from '@tdev/pyodide-code/hooks/useExtensionStore';
import clockExtension from '@tdev/pyodide/clock/client';
import { observer } from 'mobx-react-lite';

interface Props {
    clockId: string;
}

const TryUserClock = observer((props: Props) => {
    const { clockId } = props;
    const clockStore = useExtensionStore(clockExtension);
    const clock = clockStore.useClock(clockId);

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
