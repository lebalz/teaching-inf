import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { ApiState } from '@site/src/stores/iStore';
import iDocument from '@site/src/models/iDocument';
import Icon from '@mdi/react';
import { mdiCheckCircle, mdiCloseCircle, mdiLoading, mdiSync } from '@mdi/js';
import useIsBrowser from '@docusaurus/useIsBrowser';

interface Props {
    model: iDocument<any>;
    size: string | number | null | undefined;
}
const SyncStatus = observer((props: Props) => {
    const isBrowser = useIsBrowser();
    if (!isBrowser) {
        return null;
    }

    switch (props.model.state) {
        case ApiState.SYNCING:
            return <Icon path={mdiSync} spin={-2} color="var(--ifm-color-primary)" size={props.size} />;
        case ApiState.SUCCESS:
            return <Icon path={mdiCheckCircle} color="var(--ifm-color-success)" size={props.size} />;
        case ApiState.ERROR:
            return <Icon path={mdiCloseCircle} color="var(--ifm-color-danger)" size={props.size} />;
    }
    return null;
});

export default SyncStatus;
