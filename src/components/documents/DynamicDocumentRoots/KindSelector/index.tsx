import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { RoomKind } from '@tdev-api/document';
import DynamicDocumentRoot from '@tdev-models/documents/DynamicDocumentRoot';

interface Props {
    dynamicRoot: DynamicDocumentRoot;
}

const RoomTypeLabel: { [key in RoomKind]: string } = {
    [RoomKind.Messages]: 'Textnachrichten'
};

const RoomTypeDescription: { [key in RoomKind]: string } = {
    [RoomKind.Messages]: 'Textnachrichten können in einem Chat versandt- und empfangen werden.'
};

const ValidRoomKind = new Set<string>(Object.values(RoomKind));

const KindSelector = observer((props: Props) => {
    const { dynamicRoot } = props;
    const invalidRoomKind = !ValidRoomKind.has(dynamicRoot.props?.kind || '');
    return (
        <div className={clsx(styles.kindSelector)}>
            <select
                className={clsx(styles.select, invalidRoomKind && styles.invalid)}
                value={dynamicRoot.props?.kind || ''}
                onChange={(e) => {
                    dynamicRoot.setKind(e.target.value as RoomKind);
                }}
            >
                {invalidRoomKind && (
                    <option value={dynamicRoot.props?.kind || ''} disabled>
                        {dynamicRoot.props?.kind || '-'}
                    </option>
                )}
                {Object.values(RoomKind).map((type) => (
                    <option key={type} value={type} title={RoomTypeDescription[type]}>
                        {RoomTypeLabel[type]}
                    </option>
                ))}
            </select>
        </div>
    );
});

export default KindSelector;
