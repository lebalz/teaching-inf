import {
    mdiClose,
    mdiDotsHorizontalCircleOutline,
    mdiDotsVerticalCircleOutline,
    mdiRenameOutline,
    mdiTrashCan,
    mdiTrashCanOutline
} from '@mdi/js';
import styles from './styles.module.scss';
import Button from '@site/src/components/shared/Button';
import Directory from '@site/src/models/documents/FileSystem/Directory';
import File from '@site/src/models/documents/FileSystem/File';
import { observer } from 'mobx-react-lite';
import Popup from 'reactjs-popup';
import clsx from 'clsx';
import Icon from '@mdi/react';
import React from 'react';

interface Props {
    item: File | Directory;
}

const Actions = observer((props: Props) => {
    const [confirmDelete, setConfirmDelete] = React.useState(false);
    const { item } = props;
    return (
        <>
            <Button
                icon={mdiRenameOutline}
                color="primary"
                size={0.7}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    item.setIsEditing(true);
                }}
            />
            <Popup
                trigger={
                    <span>
                        <Button
                            icon={mdiDotsHorizontalCircleOutline}
                            size={0.8}
                            color="black"
                            className={clsx(styles.black)}
                        />
                    </span>
                }
                on="click"
                position={['bottom right']}
                arrow={false}
                offsetX={20}
                offsetY={5}
                repositionOnResize
            >
                <div className={clsx('card', styles.card)}>
                    <div className={clsx('card__body', styles.body)}>
                        <div className={clsx(styles.delete, 'button-group button-group--block')}>
                            {confirmDelete && (
                                <Button
                                    icon={mdiClose}
                                    iconSide="left"
                                    size={1}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setConfirmDelete(false);
                                    }}
                                />
                            )}
                            <Button
                                text={confirmDelete ? 'Ja' : 'Löschen'}
                                color="red"
                                icon={confirmDelete ? mdiTrashCan : mdiTrashCanOutline}
                                size={1}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (confirmDelete) {
                                        item.delete();
                                    } else {
                                        setConfirmDelete(true);
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </Popup>
        </>
    );
});
export default Actions;
