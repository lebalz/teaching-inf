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
import { DocumentType } from '@tdev-api/document';
import CodeBlock from '@theme/CodeBlock';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import { CmsTextEntries } from '../WithCmsText';
import DocumentStore from '@tdev-stores/DocumentStore';
import CmsText from '@tdev-models/documents/CmsText';
import { Source } from '@tdev-models/iDocument';
import { ApiState } from '@tdev-stores/iStore';

interface Props {
    className?: string;
    toAssign: CmsTextEntries;
}

const COLORS = ['primary', 'success', 'warning', 'danger', 'info', 'secondary'] as const;
const IFM_COLORS = [...COLORS.map((c) => `var(--ifm-color-${c}-lightest)`)] as const;

interface AssignedColumn {
    id: string;
    idx: number;
    name?: string;
}

const getPreview = (table: string[][], selectedColumn: number, docRootId: string) => {
    const preview = table
        .flatMap((row) => {
            if ((row[selectedColumn] || '').trim().length === 0) {
                return null;
            }
            return {
                authorId: row[0],
                documentRootId: docRootId,
                data: {
                    text: row[selectedColumn]
                }
            };
        })
        .filter((x) => !!x);
    return JSON.stringify(preview, null, 2);
};

const createCmsTexts = (documentStore: DocumentStore, table: string[][], assignments: AssignedColumn[]) => {
    const { documentRootStore } = documentStore.root;

    const promises = assignments.flatMap((assignment) => {
        const documentRoot = documentRootStore.find(assignment.id);
        if (!documentRoot) {
            return Promise.resolve();
        }
        return table.flatMap((row) => {
            const userId = row[0];
            const doc = documentRoot.allDocuments.find((d) => d.isMain && d.authorId === userId) as CmsText;
            if (doc) {
                // update the document with the new text when needed
                if (doc.text === row[assignment.idx]) {
                    return Promise.resolve();
                }
                doc.setData({ text: row[assignment.idx] }, Source.LOCAL);
                return doc.saveNow();
            }
            // create a new document with the text
            return documentStore.create({
                type: DocumentType.CmsText,
                authorId: userId,
                documentRootId: assignment.id,
                data: { text: row[assignment.idx] }
            });
        });
    });
    return Promise.all(promises);
};

const CmsXlsxImporter = observer((props: Props) => {
    const { toAssign } = props;
    const ref = React.useRef(null);
    const userStore = useStore('userStore');
    const documentStore = useStore('documentStore');
    const [table, setTable] = React.useState<string[][]>([]);
    const [assigned, setAssigned] = React.useState<AssignedColumn[]>([
        { id: Object.values(toAssign)[0], idx: -1, name: Object.keys(toAssign)[0] }
    ]);
    const [ready, setReady] = React.useState(false);
    const [isOpen, setIsOpen] = React.useState(false);
    const reset = () => {
        setTable([]);
        setAssigned([]);
    };
    const closeTooltip = () => {
        (ref.current as any)?.close();
    };
    const assignmentCount = Object.values(toAssign).length;
    const isSingleAssignment = assignmentCount === 1;
    if (!userStore.current?.isAdmin || userStore.isUserSwitched) {
        return null;
    }
    const currentAssignment = assigned.find((b) => b.idx === -1);

    const persistedAssignments = assigned.filter((a) => a.idx >= 0);
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
                documentStore.apiLoadDocumentsFrom(Object.values(toAssign)).then((models) => {
                    if (
                        documentStore.apiStateFor(`load-docs-${Object.values(toAssign).join('::')}`) ===
                        ApiState.SUCCESS
                    ) {
                        setReady(true);
                    } else {
                        console.log('Error loading documents');
                    }
                });
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
                            {assignmentCount > 1 && (
                                <>
                                    {currentAssignment && (
                                        <p>
                                            Wählen die Spalte für den CMS Text{' '}
                                            <span
                                                className={clsx(
                                                    'badge',
                                                    `badge--${COLORS[assigned.findIndex((a) => a.id === currentAssignment?.id) % COLORS.length]}`
                                                )}
                                            >
                                                {currentAssignment?.name ||
                                                    currentAssignment?.id.substring(0, 7)}
                                            </span>{' '}
                                            aus.
                                        </p>
                                    )}
                                    <div className={clsx(styles.names, 'button-group', 'button--block')}>
                                        {Object.entries(toAssign).map(([name, docRootId], i) => {
                                            return (
                                                <Button
                                                    onClick={() => {
                                                        setAssigned([
                                                            ...persistedAssignments.filter(
                                                                (a) => a.id !== docRootId
                                                            ),
                                                            { id: docRootId, name: name, idx: -1 }
                                                        ]);
                                                    }}
                                                    text={name || docRootId}
                                                    active={
                                                        assigned.find((a) => a.id === docRootId)?.idx === -1
                                                    }
                                                    color={
                                                        COLORS[
                                                            assigned.findIndex((a) => a.id === docRootId) %
                                                                COLORS.length
                                                        ]
                                                    }
                                                    key={docRootId}
                                                />
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                            <Table
                                cells={table}
                                withHeader
                                highlightedColumns={persistedAssignments.map((a, idx) => ({
                                    index: a.idx,
                                    color: IFM_COLORS[idx % IFM_COLORS.length]
                                }))}
                                trimmedCells={{ [0]: 7 }}
                                onSelectColumn={(idx) => {
                                    if (isSingleAssignment) {
                                        if (assigned.find((a) => a.idx === idx)) {
                                            setAssigned([]);
                                        } else {
                                            setAssigned([{ id: Object.values(toAssign)[0], idx }]);
                                        }
                                    } else {
                                        const assignNext = Object.entries(toAssign).find(
                                            ([_name, docRootId]) => !assigned.find((b) => b.id === docRootId)
                                        );
                                        if (!currentAssignment) {
                                            if (assignNext) {
                                                setAssigned([
                                                    ...assigned,
                                                    { id: assignNext[1], idx: idx, name: assignNext[0] }
                                                ]);
                                            }
                                            return;
                                        }
                                        const newAssignments = [
                                            ...assigned.filter((a) => a.id !== currentAssignment.id),
                                            {
                                                id: currentAssignment.id,
                                                idx: idx,
                                                name: currentAssignment.name
                                            }
                                        ];
                                        if (assignNext) {
                                            newAssignments.push({
                                                id: assignNext[1],
                                                idx: -1,
                                                name: assignNext[0]
                                            });
                                        }
                                        setAssigned(newAssignments);
                                    }
                                }}
                            />
                            {persistedAssignments.length > 0 && (
                                <>
                                    {persistedAssignments.length > 1 && (
                                        <Tabs className={clsx(styles.tabs)}>
                                            {persistedAssignments.map((assign, i) => (
                                                <TabItem
                                                    value={assign.id}
                                                    label={assign.name || assign.id}
                                                    key={assign.id}
                                                >
                                                    <CodeBlock
                                                        language="json"
                                                        showLineNumbers
                                                        title="Vorschau"
                                                        className={clsx(styles.previewCode)}
                                                    >
                                                        {getPreview(
                                                            table.slice(1),
                                                            assign.idx,
                                                            assign.name || assign.id
                                                        )}
                                                    </CodeBlock>
                                                </TabItem>
                                            ))}
                                        </Tabs>
                                    )}
                                    {persistedAssignments.length === 1 && (
                                        <CodeBlock
                                            language="json"
                                            showLineNumbers
                                            title="Vorschau"
                                            className={clsx(styles.previewCode)}
                                        >
                                            {getPreview(
                                                table.slice(1),
                                                persistedAssignments[0].idx,
                                                persistedAssignments[0].name || persistedAssignments[0].id
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
                                    createCmsTexts(documentStore, table.slice(1), persistedAssignments)
                                        .then(() => {
                                            closeTooltip();
                                        })
                                        .catch((e) => {
                                            console.error(e);
                                        });
                                }}
                                color="primary"
                                disabled={persistedAssignments.length === 0}
                            />
                        </div>
                    </div>
                )}
            </div>
        </Popup>
    );
});

export default CmsXlsxImporter;
