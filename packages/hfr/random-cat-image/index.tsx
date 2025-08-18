import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@tdev-hooks/useStore';
import Figure from '@tdev-components/Figure';
import SourceRef from '@tdev-components/Figure/SourceRef';
import Button from '@tdev-components/shared/Button';
import { mdiReload } from '@mdi/js';
import { SIZE_S } from '@tdev-components/shared/iconSizes';
import styles from './styles.module.scss';
import clsx from 'clsx';

interface Props {
    defaultLabel?: string;
    label?: string;
    noReload?: boolean;
}
const RandomCatImage = observer(({ defaultLabel, label, noReload }: Props) => {
    const userStore = useStore('userStore');
    const [reloadKey, setReloadKey] = React.useState(1);
    const url = React.useMemo(() => {
        if (!userStore.current) {
            return `https://cataas.com/cat/says/${label ?? defaultLabel ?? 'inf.gbsl.website'}?fontSize=80&fontColor=red&time=${reloadKey}`;
        }
        return `https://cataas.com/cat/says/${label ?? userStore.current.name}?fontSize=80&fontColor=red&time=${reloadKey}`;
    }, [userStore.current, label, defaultLabel, reloadKey]);
    return (
        <Figure>
            <img style={{ maxWidth: 'min(90vw, 100%)', width: '250px' }} src={url} />
            <span className="caption inline">
                <SourceRef
                    bib={{ author: 'Kevin', source: url, licence: 'Public Domain' }}
                    className="inline"
                />
            </span>
            {!noReload && (
                <span className={clsx(styles.reloadButton)}>
                    <Button
                        onClick={() => setReloadKey((prev) => prev + 1)}
                        icon={mdiReload}
                        size={SIZE_S}
                        color="grey"
                    />
                </span>
            )}
        </Figure>
    );
});

export default RandomCatImage;
