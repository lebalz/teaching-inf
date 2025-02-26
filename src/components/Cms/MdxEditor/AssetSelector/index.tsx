import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { useStore } from '@tdev-hooks/useStore';
import Card from '@tdev-components/shared/Card';
import iFile from '@tdev-models/cms/iFile';
import Dir from '@tdev-components/Cms/Github/iFile/Dir';
import Button from '@tdev-components/shared/Button';
import { mdiFolderArrowLeftOutline, mdiFolderArrowUpOutline } from '@mdi/js';

interface Props<T extends iFile = iFile> {
    onSelect: (entry: T) => void;
    filter: (entry: iFile) => entry is T;
}

const AssetSelector = observer((props: Props) => {
    const cmsStore = useStore('cmsStore');
    const { viewStore } = cmsStore;
    const { assetEntrypoint } = viewStore;
    React.useEffect(() => {
        // always start with the active file as the entrypoint
        viewStore.setAssetEntrypoint(null);
    }, []);

    if (!assetEntrypoint) {
        return null;
    }
    return (
        <Card classNames={{ card: styles.assets, header: styles.header }} header={<h4>Verfügbare Bilder</h4>}>
            <div className={clsx(styles.selector)}>
                <div className={clsx(styles.pathNav)}>
                    <div className={clsx(styles.path)}>{assetEntrypoint.path}</div>
                    <Button
                        icon={mdiFolderArrowUpOutline}
                        title="Verzeichnis oberhalb öffnen"
                        onClick={() => {
                            viewStore.setAssetEntrypoint(assetEntrypoint.parent);
                        }}
                        color="primary"
                        disabled={!assetEntrypoint.parent || assetEntrypoint.parent.path === ''}
                    />
                </div>
                <Dir
                    dir={assetEntrypoint}
                    filter={props.filter}
                    useLocalMode
                    expandedOnLoad
                    expandedByDefault={['images', 'img']}
                    hideEmpty
                    showActions="never"
                    onSelect={props.onSelect}
                />
            </div>
        </Card>
    );
});

export default AssetSelector;
