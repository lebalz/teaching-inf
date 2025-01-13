import React from 'react';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { default as DirModel } from '@tdev-models/github/Dir';
import File from '../File';
import shared from '../styles.module.scss';
import styles from './styles.module.scss';
import Icon from '@mdi/react';

interface Props {
    dir: DirModel;
}

const Dir = observer((props: Props) => {
    const { dir } = props;
    return (
        <li className={clsx(shared.item)}>
            <Icon spin={dir.isSyncing} path={dir.icon} size={0.8} color={dir.iconColor} />
            <span
                className={clsx(styles.dir)}
                onClick={() => {
                    dir.setOpen(!dir.isOpen);
                }}
            >
                {dir.name}
            </span>
            {dir.isOpen && dir.children.length > 0 && (
                <ul>
                    {dir.children.map((child, idx) => {
                        return <>{child.type === 'file' ? <File file={child} /> : <Dir dir={child} />}</>;
                    })}
                </ul>
            )}
        </li>
    );
});
export default Dir;
