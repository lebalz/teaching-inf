import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { useStore } from '@tdev-hooks/useStore';
import { default as PrModel } from '@tdev-models/cms/PR';
import Badge from '@tdev-components/shared/Badge';
import Icon, { Stack } from '@mdi/react';
import { Confirm } from '@tdev-components/shared/Button/Confirm';
import {
    mdiCircleOutline,
    mdiCircleSmall,
    mdiCloseCircle,
    mdiLoading,
    mdiMerge,
    mdiReload,
    mdiSourceCommit,
    mdiSourceMerge,
    mdiSyncCircle
} from '@mdi/js';
import Button from '@tdev-components/shared/Button';
import { ApiState } from '@tdev-stores/iStore';

interface Props {
    pr: PrModel;
}

const PR = observer((props: Props) => {
    const cmsStore = useStore('cmsStore');
    const { pr } = props;
    const github = cmsStore.github;
    React.useEffect(() => {
        if (github?.defaultBranchName) {
            pr.sync();
        }
    }, [pr]);

    if (!github) {
        return null;
    }

    return (
        <div className={clsx(styles.PR)}>
            <Badge noPaddingRight>
                {pr.title}
                <Stack color="var(--ifm-color-success)" size={0.8}>
                    <Icon path={mdiCircleOutline} size={0.8} />
                    <Icon path={mdiCircleSmall} size={0.8} />
                </Stack>
            </Badge>
            <Button
                icon={pr.apiState === ApiState.SYNCING ? mdiLoading : mdiReload}
                spin={pr.apiState === ApiState.SYNCING}
                color="grey"
                onClick={() => {
                    pr.sync();
                }}
                size={0.8}
                title="PR Status aktualisieren"
            />
            <div className={clsx(styles.spacer)}></div>
            {pr.branch && pr.branch.aheadBy > 0 && (
                <Badge noPaddingLeft style={{ gap: 0 }}>
                    <Icon path={mdiSourceCommit} size={0.8} />+{pr.branch.aheadBy}
                    {pr.branch.behindBy > 0 && `/-${pr.branch.behindBy}`}
                </Badge>
            )}
            {pr.merged && (
                <Badge noPaddingLeft title={`Merged: ${pr.mergedAt}`}>
                    <Icon path={mdiSourceMerge} size={0.8} color="var(--ifm-color-violet)" /> Merged
                </Badge>
            )}
            {pr.state === 'closed' && (
                <Badge noPaddingLeft title={`Merged: ${pr.updatedAt}`}>
                    <Icon path={mdiCloseCircle} size={0.8} color="var(--ifm-color-danger)" /> Closed
                </Badge>
            )}
            {pr.isSynced && (
                <>
                    {pr.rebaseable && (
                        <Button
                            icon={mdiSyncCircle}
                            color="green"
                            text="Fast Forward"
                            onClick={() => {
                                console.log('Fast Forward');
                            }}
                        />
                    )}
                    <Confirm
                        icon={mdiMerge}
                        color="green"
                        onConfirm={() => {
                            console.log('Merge');
                        }}
                        disabled={!pr.mergeable}
                        text={''}
                        confirmText="Mergen?"
                        title={`In den ${github.defaultBranchName}-Branch Mergen: ${pr.mergeableState}`}
                    />
                </>
            )}
        </div>
    );
});

export default PR;
