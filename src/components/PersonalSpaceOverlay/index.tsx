import styles from './styles.module.scss';
import Popup from 'reactjs-popup';
import clsx from 'clsx';
import { mdiCloseCircleOutline, mdiFolderHomeOutline } from '@mdi/js';
import Button from '@tdev-components/shared/Button';
import Directory from '@tdev-components/documents/FileSystem/Directory';
import React from 'react';
import { PopupActions } from 'reactjs-popup/dist/types';

const PersonalSpaceOverlay = () => {
    const popupRef = React.useRef<PopupActions>(null);

    return (
        <Popup
            trigger={
                <div>
                    <Button
                        className={clsx('button--block')}
                        onClick={(e) => {
                            e.preventDefault();
                        }}
                        icon={mdiFolderHomeOutline}
                        color="blue"
                        iconSide="left"
                    />
                </div>
            }
            on="click"
            modal
            closeOnDocumentClick={false}
            overlayStyle={{ background: 'rgba(0,0,0,0.5)', maxWidth: '100vw' }}
            ref={popupRef}
            closeOnEscape
        >
            <div className={clsx(styles.container)}>
                <Button
                    icon={mdiCloseCircleOutline}
                    className={clsx(styles.closeButton)}
                    color="red"
                    onClick={() => popupRef.current?.close()}
                />
                <Directory id="61c3cb82-f8ef-43e0-a103-e650f63953a2" name="Persönlicher Bereich" />
            </div>
        </Popup>
    );
};

export default PersonalSpaceOverlay;
