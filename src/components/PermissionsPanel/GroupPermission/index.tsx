import React from 'react';
import clsx from 'clsx';
import styles from '../Permission.module.scss';
import { observer } from 'mobx-react-lite';
import AccessSelector from '../AccessSelector';
import Button from '../../shared/Button';
import { mdiDelete } from '@mdi/js';
import PermissionGroup from '@site/src/models/PermissionGroup';

interface Props {
    permission: PermissionGroup;
}

const GroupPermission = observer((props: Props) => {
    const { permission } = props;
    return (
        <div className={clsx(styles.permission)}>
            <span className={clsx(styles.audience)}>{permission.group?.name || permission.id}</span>
            <span className={clsx(styles.spacer)} />
            <AccessSelector
                access={permission.access}
                onChange={(access) => {
                    permission.access = access;
                }}
            />
            <span className={clsx(styles.actions)}>
                <Button
                    onClick={() => {
                        permission.delete();
                    }}
                    color="red"
                    icon={mdiDelete}
                />
            </span>
        </div>
    );
});

export default GroupPermission;
