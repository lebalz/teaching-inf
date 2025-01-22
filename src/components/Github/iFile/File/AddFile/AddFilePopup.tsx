import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { useStore } from '@tdev-hooks/useStore';
import Popup from 'reactjs-popup';
import AddFile from '.';
import Button from '@tdev-components/shared/Button';
import { mdiFilePlus } from '@mdi/js';

interface Props {}

const AddFilePopup = observer((props: Props) => {
    const cmsStore = useStore('cmsStore');

    return (
        <Popup
            trigger={
                <span>
                    <Button icon={mdiFilePlus} color="blue" size={0.8} />
                </span>
            }
            on="click"
            modal
            overlayStyle={{ background: 'rgba(0,0,0,0.5)' }}
        >
            <AddFile />
        </Popup>
    );
});

export default AddFilePopup;
