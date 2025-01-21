import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { useStore } from '@tdev-hooks/useStore';
import { default as DirModel } from '@tdev-models/cms/Dir';
import Card from '@tdev-components/shared/Card';
import File from '@tdev-components/Github/iFile/File';
import Dir from '@tdev-components/Github/iFile/Dir';
import Icon from '@mdi/react';

interface Props {
    dir?: DirModel;
}

const Directory = observer((props: Props) => {
    const { dir } = props;
    // const cmsStore = useStore('cmsStore');
    if (!dir) {
        return null;
    }

    return (
        <div className={clsx(styles.directory)}>
            <Card
                header={
                    <h4>
                        <Icon path={dir.icon} color={dir.iconColor} size={0.8} />
                        {dir.name}
                    </h4>
                }
            >
                <ul>
                    {dir.children.map((entry, idx) => {
                        if (entry.type === 'file' || entry.type === 'file_stub') {
                            return <File file={entry} key={entry.path} />;
                        }
                        return <Dir dir={entry} key={entry.path} />;
                    })}
                </ul>
            </Card>
        </div>
    );
});

export default Directory;
