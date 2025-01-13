import React from 'react';
import _ from 'lodash';
import { useLexicalNodeRemove } from '@mdxeditor/editor';
import { mdiClose, mdiCloseBox } from '@mdi/js';
import clsx from 'clsx';
import { Delete } from '@tdev-components/shared/Button/Delete';

export interface Props {
    className?: string;
}

const RemoveJsxNode = (props: Props) => {
    const remover = useLexicalNodeRemove();
    return (
        <span className={clsx(props.className)}>
            <Delete
                icon={mdiCloseBox}
                iconOutline={mdiClose}
                text={null}
                confirmMessage="Entfernen"
                color="black"
                onDelete={() => {
                    remover();
                }}
            />
        </span>
    );
};

export default RemoveJsxNode;
