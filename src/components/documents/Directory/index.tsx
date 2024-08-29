import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { useFirstMainDocument } from '../../../hooks/useFirstMainDocument';
import Loader from '../../Loader';
import { MetaInit, ModelMeta } from '@site/src/models/documents/Directory';
import Icon from '@mdi/react';
import {
    mdiContentSaveEdit,
    mdiFileEdit,
    mdiFolder,
    mdiPlusCircle,
    mdiPlusCircleOutline,
    mdiRenameOutline
} from '@mdi/js';
import Details from '@theme/Details';
import Heading from '@theme/Heading';
import Button from '../../shared/Button';
import SyncStatus from '../../SyncStatus';

interface Props extends MetaInit {
    id: string;
    isExpanded?: boolean;
}

const Direcotry = observer((props: Props) => {
    const [meta] = React.useState(new ModelMeta(props));
    const doc = useFirstMainDocument(props.id, meta);
    const [isEditing, setIsEditing] = React.useState(false);
    const isInitialized = React.useRef(false);
    React.useEffect(() => {
        isInitialized.current = true;
    }, []);
    if (!doc) {
        return <Loader />;
    }
    return (
        <Details
            open={doc.isOpen}
            onToggle={(e) => {
                if (isInitialized.current) {
                    doc.setIsOpen(!doc.isOpen);
                }
            }}
            className={clsx(styles.dir)}
            summary={
                <summary className={clsx(styles.summary)}>
                    <Icon path={mdiFolder} size={1} />
                    <div className={clsx(styles.spacer)} />
                    {isEditing ? (
                        <>
                            <input
                                type="text"
                                placeholder="Suche..."
                                value={doc.name}
                                className={clsx(styles.textInput)}
                                onChange={(e) => {
                                    doc.setName(e.target.value);
                                }}
                                onBlur={() => {
                                    setIsEditing(false);
                                }}
                                autoFocus
                            />
                        </>
                    ) : (
                        <>
                            <h4 className={clsx(styles.dirName)}>{doc.name}</h4>
                            <Button
                                icon={mdiRenameOutline}
                                color="primary"
                                size={0.7}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsEditing(true);
                                }}
                            />
                        </>
                    )}
                    <div>
                        <SyncStatus model={doc} />
                    </div>
                    <div className={clsx(styles.spacer)} />
                    {doc.isOpen && (
                        <Button text="Neu" icon={mdiPlusCircleOutline} color="primary" size={0.7} />
                    )}
                </summary>
            }
        >
            <div className={clsx(styles.content)}></div>
        </Details>
    );
});

export default Direcotry;
