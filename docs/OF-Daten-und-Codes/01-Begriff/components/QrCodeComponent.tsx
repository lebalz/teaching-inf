import QrCode from '@tdev-components/shared/QrCode';
import { useStore } from '@tdev-hooks/useStore';
import { observer } from 'mobx-react-lite';

const QrCodeComponent = observer(() => {
    const userStore = useStore('userStore');
    const user = userStore.viewedUser;
    return <QrCode withInput size="30em" text={user?.name || 'Hallo Welt'} download />;
});

export default QrCodeComponent;
