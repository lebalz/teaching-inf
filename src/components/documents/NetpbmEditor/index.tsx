import { observer } from 'mobx-react-lite';
import styles from './styles.module.scss';
import React from 'react';
import clsx from 'clsx';
import { ParserResult } from './types';
import ImageCanvas from './ImageCanvas';
import NetpbmGraphic, { MetaInit, ModelMeta } from '@tdev-models/documents/NetpbmGrapic';
import { useFirstMainDocument } from '@tdev-hooks/useFirstMainDocument';
import { Source } from '@tdev-models/iDocument';
import SyncStatus from '@tdev-components/SyncStatus';
import Icon from '@mdi/react';
import {
    mdiAlertCircle,
    mdiAlertCircleOutline,
    mdiCheckAll,
    mdiFlashTriangle,
    mdiFormatTextRotationAngleUp
} from '@mdi/js';
import Button from '@tdev-components/shared/Button';
import { SIZE_S } from '@tdev-components/shared/iconSizes';

const StateIcons = observer(({ doc }: { doc: NetpbmGraphic }) => (
    <span className={clsx(styles.stateIcons)}>
        <SyncStatus model={doc} size={0.7} />
        {doc.root?.isDummy && (
            <Icon path={mdiFlashTriangle} size={0.7} color="orange" title="Wird nicht gespeichert." />
        )}
    </span>
));

interface Props extends MetaInit {
    id: string;
    noEditor?: boolean;
    hideWarning?: boolean;
}

const NetpbmEditor = observer((props: Props) => {
    const [meta] = React.useState(new ModelMeta(props));
    const doc = useFirstMainDocument(props.id, meta);

    return (
        <div className={clsx(styles.netpbm)}>
            <div className={clsx(styles.editor, { [styles.hidden]: props.noEditor })}>
                <div className={styles.textAreaWrapper}>
                    {!props.hideWarning && <StateIcons doc={doc} />}
                    <Button
                        icon={mdiFormatTextRotationAngleUp}
                        onClick={() => {
                            doc.format();
                        }}
                        size={SIZE_S}
                    />
                    <textarea
                        rows={12}
                        className={clsx(styles.editorTextArea)}
                        onChange={(e) => doc.setData({ imageData: e.target.value }, Source.LOCAL)}
                        value={doc.data.imageData}
                        disabled={props.readonly}
                    />
                </div>
                <div
                    className={clsx(styles.validationWrapper, 'alert', {
                        ['alert--secondary']: !doc.hasErrorsOrWarnings,
                        ['alert--warning']: doc.hasWarnings && !doc.hasErrors,
                        ['alert--danger']: doc.hasErrors
                    })}
                >
                    {doc.hasErrorsOrWarnings ? (
                        <details>
                            <summary>
                                {doc.hasErrors && (
                                    <>
                                        <span>Fehler in den Bilddaten</span>
                                        <span className={styles.iconContainer}>
                                            <Icon path={mdiAlertCircle} size={0.8} color="red" />
                                        </span>
                                    </>
                                )}
                                {!doc.hasErrors && doc.hasWarnings && (
                                    <>
                                        <span>Warnungen anzeigen</span>
                                        <span className={styles.iconContainer}>
                                            <Icon path={mdiAlertCircleOutline} size={0.8} color="orange" />
                                        </span>
                                    </>
                                )}
                            </summary>
                            <ul>
                                {doc.warnings.map((warnung, index) => (
                                    <li key={index}>⚠️ {warnung}</li>
                                ))}
                                {doc.errors.map((error, index) => (
                                    <li key={index}>❌ {error}</li>
                                ))}
                            </ul>
                        </details>
                    ) : (
                        <>
                            <span>Keine Fehler gefunden</span>
                            <span className={styles.iconContainer}>
                                <Icon path={mdiCheckAll} size={0.8} />
                            </span>
                        </>
                    )}
                </div>
            </div>
            <div className={clsx(styles.output)}>
                <ImageCanvas width={doc.width} height={doc.height} pixels={doc.pixels} />
            </div>
        </div>
    );
});

export default NetpbmEditor;
