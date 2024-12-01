import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import Popup from 'reactjs-popup';
import Button from '@tdev-components/shared/Button';
import FromXlsxClipboard from '@tdev-components/shared/FromXlsxClipboard';
import { mdiClose, mdiFileExcelOutline } from '@mdi/js';
import { useStore } from '@tdev-hooks/useStore';
import Table from '@tdev-components/shared/Table';
import { translate } from '@docusaurus/Translate';
import { Access } from '@tdev-api/document';
import AccessSelector from '@tdev-components/PermissionsPanel/AccessSelector';
import CodeBlock from '@theme/CodeBlock';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

interface Props {
    className?: string;
    toAssign: { id: string; name?: string }[];
}

const COLORS = [
    ...['primary', 'success', 'warning', 'danger', 'info', 'secondary'].map(
        (c) => `var(--ifm-color-${c}-lightest)`
    )
] as const;

interface AssignedColumn {
    id: string;
    idx: number;
    name?: string;
}

const getPreview = (table: string[][], selectedColumn: number, cmsFor: string, sharedPermission: Access) => {
    const preview = table
        .flatMap((row) => {
            if (row[selectedColumn].trim().length === 0) {
                return null;
            }
            return {
                cmsData: {
                    for: cmsFor,
                    text: row[selectedColumn]
                },
                userPermission: {
                    access: sharedPermission,
                    userId: row[0]
                }
            };
        })
        .filter((x) => !!x);
    return JSON.stringify(preview, null, 2);
};

const createCmsTexts = (table: string[][], assigned: AssignedColumn[], sharedPermission: Access) => {
    return Promise.resolve();
};

const CmsXlsxImporter = observer((props: Props) => {
    const { toAssign } = props;
    const ref = React.useRef(null);
    const userStore = useStore('userStore');
    const [table, setTable] = React.useState<string[][]>([]);
    const [sharedPermission, setSharedPermission] = React.useState<Access>(Access.RO_User);
    const [assigned, setAssigned] = React.useState<AssignedColumn[]>([]);
    const [isOpen, setIsOpen] = React.useState(false);
    const reset = () => {
        setTable([]);
        setAssigned([]);
    };
    const closeTooltip = () => {
        (ref.current as any)?.close();
    };
    const isSingleAssignment = toAssign.length === 1;
    if (!userStore.current?.isAdmin || userStore.isUserSwitched) {
        return null;
    }
    return (
        <Popup
            trigger={
                <span className={clsx(styles.importer, props.className)}>
                    <Button
                        onClick={(e) => e.preventDefault()}
                        icon={mdiFileExcelOutline}
                        color={'green'}
                        noOutline={isOpen}
                    />
                </span>
            }
            on="click"
            modal
            overlayStyle={{ background: 'rgba(0,0,0,0.5)' }}
            onOpen={() => {
                setIsOpen(true);
            }}
            closeOnEscape={false}
            onClose={() => {
                setIsOpen(false);
                reset();
            }}
            ref={ref}
        >
            <div className={clsx(styles.wrapper, 'card')}>
                <div className={clsx('card__header', styles.header)}>
                    <h3>CMS Texte erstellen</h3>
                </div>
                <div className={clsx('card__body', styles.cardBody)}>
                    {table.length === 0 && (
                        <FromXlsxClipboard
                            matchUsers
                            onDone={(table) => {
                                const newTable = table?.filter(
                                    (row) => row.length > 0 && row[0].trim().length > 0
                                );
                                /**
                                 * table includes header
                                 */
                                if (!newTable || newTable.length <= 1) {
                                    return closeTooltip();
                                }
                                setTable(newTable);
                            }}
                            importLabel="Weiter"
                            cancelIcon={mdiClose}
                            includeHeader
                        />
                    )}
                    {table.length > 0 && (
                        <>
                            <div className={clsx('badge', 'badge--primary')}>
                                {table.length} Zeile{table.length > 1 ? 'n' : ''}
                            </div>
                            {toAssign.length > 1 && (
                                <div>
                                    {toAssign.map((assign, i) => {
                                        return (
                                            <Button
                                                onClick={() => {
                                                    setAssigned([
                                                        ...assigned.filter((a) => a.idx >= 0),
                                                        { id: assign.id, name: assign.name, idx: -1 }
                                                    ]);
                                                }}
                                                text={assign.name || assign.id}
                                                active={assigned.find((a) => a.id === assign.id)?.idx === -1}
                                                color={
                                                    COLORS[
                                                        assigned.findIndex((a) => a.id === assign.id) %
                                                            COLORS.length
                                                    ]
                                                }
                                            />
                                        );
                                    })}
                                </div>
                            )}
                            <Table
                                cells={table}
                                withHeader
                                highlightedColumns={assigned.map((a, idx) => ({
                                    index: a.idx,
                                    color: COLORS[idx % COLORS.length]
                                }))}
                                onSelectColumn={(idx) => {
                                    if (isSingleAssignment) {
                                        if (assigned.find((a) => a.idx === idx)) {
                                            setAssigned([]);
                                        } else {
                                            setAssigned([{ id: toAssign[0].id, idx }]);
                                        }
                                    } else {
                                        const assignTo = assigned.find((a) => a.idx === -1);
                                        if (!assignTo) {
                                            return;
                                        }
                                        setAssigned([
                                            ...assigned.filter((a) => a.idx !== -1),
                                            { id: assignTo.id, idx: idx, name: assignTo.name }
                                        ]);
                                    }
                                }}
                            />
                            <AccessSelector
                                accessTypes={[Access.RO_User, Access.RW_User, Access.None_User]}
                                access={sharedPermission}
                                onChange={(access) => setSharedPermission(access)}
                            />
                            {assigned.length > 0 && (
                                <>
                                    {assigned.length > 1 && (
                                        <Tabs>
                                            {assigned.map((assign, i) => (
                                                <TabItem value={assign.id} label={assign.name || assign.id}>
                                                    <CodeBlock
                                                        language="json"
                                                        showLineNumbers
                                                        title="Vorschau"
                                                    >
                                                        {getPreview(
                                                            table.slice(1),
                                                            assign.idx,
                                                            assign.name || assign.id,
                                                            sharedPermission
                                                        )}
                                                    </CodeBlock>
                                                </TabItem>
                                            ))}
                                        </Tabs>
                                    )}
                                    {assigned.length === 1 && (
                                        <CodeBlock
                                            language="json"
                                            showLineNumbers
                                            title="Vorschau"
                                            className={clsx(styles.previewCode)}
                                        >
                                            {getPreview(
                                                table.slice(1),
                                                assigned[0].idx,
                                                assigned[0].name || assigned[0].id,
                                                sharedPermission
                                            )}
                                        </CodeBlock>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
                {table.length > 0 && (
                    <div className="card__footer">
                        <div className={clsx('button-group', 'button-group--block')}>
                            <Button
                                text={'Abbrechen'}
                                onClick={() => {
                                    closeTooltip();
                                }}
                                color="black"
                            />
                            <Button
                                text={'CMS Texte erstellen'}
                                onClick={() => {
                                    createCmsTexts(table, assigned, sharedPermission).then(() => {
                                        closeTooltip();
                                    });
                                }}
                                color="primary"
                                disabled={assigned.length === 0}
                            />
                        </div>
                    </div>
                )}
            </div>
        </Popup>
    );
});

export default CmsXlsxImporter;
