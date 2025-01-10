import React from 'react';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { default as FileModel } from '@tdev-models/github/File';
import shared from '../styles.module.scss';
interface Props {
    file: FileModel;
}

const File = observer((props: Props) => {
    const { file } = props;
    return (
        <li>
            <span className={clsx(shared.item)}>📄 {file.name}</span>
        </li>
    );
});
export default File;
