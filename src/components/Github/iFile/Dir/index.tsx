import React from 'react';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { default as DirModel } from '@tdev-models/github/Dir';
import File from '../File';
import shared from '../styles.module.scss';

interface Props {
    dir: DirModel;
}

const Dir = observer((props: Props) => {
    const { dir } = props;
    return (
        <li>
            <span
                className={clsx(shared.item)}
                onClick={() => {
                    dir.fetchDirectory();
                }}
            >
                📁 {dir.name}
            </span>
            {dir.children.length > 0 && (
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
