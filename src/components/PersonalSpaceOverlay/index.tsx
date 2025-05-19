import styles from './styles.module.scss';
import Popup from 'reactjs-popup';
import clsx from 'clsx';
import { mdiCloseCircleOutline, mdiFolderHomeOutline } from '@mdi/js';
import Button from '@tdev-components/shared/Button';
import Directory from '@tdev-components/documents/FileSystem/Directory';
import React from 'react';
import { PopupActions } from 'reactjs-popup/dist/types';
import siteConfig from '@generated/docusaurus.config';
const { PERSNAL_SPACE_DOC_ROOT_ID } = siteConfig.customFields as { PERSNAL_SPACE_DOC_ROOT_ID: string };

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
            <div className={clsx(styles.container)} onClick={() => popupRef.current?.close()}>
                <Directory id={PERSNAL_SPACE_DOC_ROOT_ID} name="Persönlicher Bereich" />
            </div>
        </Popup>
    );
};

export default PersonalSpaceOverlay;
