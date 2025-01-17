import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { useStore } from '@tdev-hooks/useStore';
import { GhBranch } from '@tdev-models/cms/Github';
import { Delete } from '@tdev-components/shared/Button/Delete';
import Badge from '@tdev-components/shared/Badge';
import Icon, { Stack } from '@mdi/react';
import {
    mdiAlert,
    mdiCircleOutline,
    mdiCircleSmall,
    mdiGit,
    mdiMerge,
    mdiReload,
    mdiSourceBranch,
    mdiSourceBranchSync,
    mdiSourceMerge,
    mdiSyncCircle
} from '@mdi/js';
import { Confirm } from '@tdev-components/shared/Button/Confirm';
import { default as BranchModel, MergeStatus } from '@tdev-models/cms/Branch';
import Button from '@tdev-components/shared/Button';
import { ApiState } from '@tdev-stores/iStore';
interface Props {
    branch: BranchModel;
}

const Branch = observer((props: Props) => {
    const cmsStore = useStore('cmsStore');
    const github = cmsStore.github;
    const { branch } = props;
    React.useEffect(() => {
        if (github?.defaultBranchName) {
            console.log('Syncing branch', github?.defaultBranchName, branch.name);
            branch.sync();
        }
    }, [github?.defaultBranchName, branch]);
    if (!github) {
        return null;
    }
    const associatedPr = cmsStore.findPrByBranch(branch.name);

    return (
        <div className={clsx(styles.branch)}>
            <div>{branch.name}</div>
            {associatedPr && (
                <>
                    <div className={clsx(styles.spacer)}></div>
                    <Badge noPaddingRight>
                        {associatedPr.title}
                        <Stack color="var(--ifm-color-success)" size={0.8}>
                            <Icon path={mdiCircleOutline} size={0.8} />
                            <Icon path={mdiCircleSmall} size={0.8} />
                        </Stack>
                    </Badge>
                </>
            )}
            <div className={clsx(styles.spacer)}></div>
            {github.defaultBranchName !== branch.name ? (
                <>
                    <Button
                        icon={mdiReload}
                        color="grey"
                        onClick={() => {
                            branch.sync();
                        }}
                        title="Branch Status aktualisieren"
                        spin={branch.apiStatus === ApiState.SYNCING || branch.needsSync}
                    />
                    {branch.canFastForward && (
                        <Button
                            icon={mdiSyncCircle}
                            color="green"
                            text="Fast Forward"
                            onClick={() => {
                                console.log('Fast Forward');
                            }}
                        />
                    )}
                    {branch.mergeStatus === MergeStatus.Conflict && (
                        <Button
                            icon={mdiAlert}
                            color="orange"
                            text="Merge-Konflikte"
                            href={associatedPr?.html_url}
                        />
                    )}
                    {branch.isMerged ? (
                        <Badge noPaddingLeft>
                            <Icon path={mdiSourceMerge} size={0.8} color="var(--ifm-color-violet)" /> Merged
                        </Badge>
                    ) : (
                        <Confirm
                            icon={mdiMerge}
                            color="green"
                            onConfirm={() => {
                                console.log('Merge');
                            }}
                            disabled={branch.mergeStatus !== MergeStatus.Ready}
                            text={''}
                            confirmText="Mergen?"
                            title={`In den ${github.defaultBranchName}-Branch Mergen`}
                        />
                    )}
                    <Delete
                        onDelete={() => {
                            if (associatedPr) {
                                github.closeAndDeletePr(associatedPr.number);
                            } else {
                                github.deleteBranch(branch.name);
                            }
                        }}
                        className={clsx(styles.delete)}
                        text={''}
                    />
                </>
            ) : (
                <Badge noPadding title="Standard Branch">
                    <Icon path={mdiGit} size={0.8} color="var(--ifm-color-blue)" />
                </Badge>
            )}
        </div>
    );
});

export default Branch;
