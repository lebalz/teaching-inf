import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { useFirstMainDocument } from '../../../hooks/useFirstMainDocument';
import Loader from '../../Loader';
import { default as DirctoryModel, MetaInit, ModelMeta } from '@site/src/models/documents/Directory';
import Icon from '@mdi/react';
import { mdiFolder, mdiRenameOutline } from '@mdi/js';
import Details from '@theme/Details';
import Button from '../../shared/Button';
import SyncStatus from '../../SyncStatus';
import NewItem from './NewItem';
import File from '../File';

interface Props extends MetaInit {
    id: string;
}

const Directory = observer((props: Props) => {
    const [meta] = React.useState(new ModelMeta(props));
    const doc = useFirstMainDocument(props.id, meta);
    const isInitialized = React.useRef(false);
    React.useEffect(() => {
        isInitialized.current = true;
    }, []);
    if (!doc) {
        return <Loader />;
    }
    return <DirectoryComponent dir={doc} />;
});

interface DirectoryProps {
    dir: DirctoryModel;
}

export const DirectoryComponent = observer((props: DirectoryProps) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const isInitialized = React.useRef(false);
    const { dir } = props;
    React.useEffect(() => {
        isInitialized.current = true;
    }, []);
    return (
        <Details
            open={dir.isOpen}
            onToggle={(e) => {
                if (isInitialized.current && e.currentTarget === e.target) {
                    dir.setIsOpen(!dir.isOpen);
                }
            }}
            className={clsx(styles.dir)}
            summary={
                <summary className={clsx(styles.summary)}>
                    <Icon path={mdiFolder} size={1} className={clsx(styles.icon)} />
                    <div className={clsx(styles.spacer)} />
                    {isEditing ? (
                        <>
                            <input
                                type="text"
                                placeholder="Ordnername..."
                                value={dir.name}
                                className={clsx(styles.textInput)}
                                onChange={(e) => {
                                    dir.setName(e.target.value);
                                }}
                                onBlur={() => {
                                    setIsEditing(false);
                                }}
                                autoFocus
                            />
                        </>
                    ) : (
                        <>
                            <h4 className={clsx(styles.dirName)}>{dir.name}</h4>
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
                        <SyncStatus model={dir} />
                    </div>
                    <div className={clsx(styles.spacer)} />
                    <div className={clsx(styles.actions)}>{dir.isOpen && <NewItem directory={dir} />}</div>
                </summary>
            }
        >
            <div className={clsx(styles.content)}>
                {dir.files.map((file) => {
                    return <File key={file.id} file={file} />;
                })}
                {dir.directories.map((dir) => {
                    return <DirectoryComponent key={dir.id} dir={dir} />;
                })}
            </div>
        </Details>
    );
});

export default Directory;
