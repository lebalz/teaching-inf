import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { default as DirModel } from '@tdev-models/cms/Dir';
import Card from '@tdev-components/shared/Card';
import Dir from '@tdev-components/Cms/Github/iFile/Dir';
import Avatar from '@tdev-components/shared/Avatar';
import { useStore } from '@tdev-hooks/useStore';
import Button from '@tdev-components/shared/Button';
import { mdiAccountCircle, mdiAlertDecagram, mdiCheckDecagram, mdiLogoutVariant } from '@mdi/js';
import Icon from '@mdi/react';
import { SIZE_XS } from '@tdev-components/shared/iconSizes';
import AccountOptions from '@tdev-components/Cms/Github/AccountOptions';
import Popup from 'reactjs-popup';
import UserAvatar from '@tdev-components/Cms/Github/AccountOptions/UserAvatar';

interface Props {
    dir?: DirModel;
    className?: string;
    contentClassName?: string;
    showActions?: 'always' | 'hover';
    compact?: boolean;
    showAvatar?: boolean;
}

const Directory = observer((props: Props) => {
    const { dir } = props;
    const cmsStore = useStore('cmsStore');
    const { github } = cmsStore;
    React.useEffect(() => {
        if (dir && !dir.isOpen) {
            console.log('Open from Directory.tsx');
            dir.setOpen(true);
        }
    }, [dir]);
    if (!dir) {
        return null;
    }

    return (
        <div className={clsx(styles.directory, props.className, props.compact && styles.compact)}>
            {props.showAvatar && <UserAvatar showOptions />}
            <Card
                classNames={{
                    body: styles.cardBody,
                    card: props.contentClassName
                }}
            >
                <ul className={clsx(styles.dirTree)}>
                    <Dir dir={dir} showActions={props.showActions} />
                </ul>
            </Card>
        </div>
    );
});

export default Directory;
