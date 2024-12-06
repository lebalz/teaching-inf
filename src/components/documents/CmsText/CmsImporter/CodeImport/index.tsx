import React from 'react';
import { observer } from 'mobx-react-lite';
import styles from './styles.module.scss';
import clsx from 'clsx';
import CodeEditor from '@tdev-components/shared/CodeEditor';
import UserTable from '@tdev-components/Admin/UserTable';
import Button from '@tdev-components/shared/Button';
import SelectUser from '@tdev-components/Admin/SelectUser';

interface Props {
    onDone: (data: string[][]) => void;
    onClose: () => void;
    cancelIcon?: string;
    cancelLabel?: string;
    importLabel?: string;
}

const CodeImport = observer((props: Props) => {
    return (
        <div className={clsx(styles.codeImport, 'card')}>
            <div className="card__header">
                <h3>Code Import</h3>
            </div>
            <div className="card__body">
                <div className={clsx(styles.main)}>
                    <SelectUser mode="single" />
                    <div className={clsx(styles.input)}>
                        <CodeEditor aceClassName={clsx(styles.editor)} />
                    </div>
                </div>
            </div>
            <div className="card__footer">
                <div className={clsx('button-group', 'button-group--block')}>
                    <Button
                        text={props.cancelIcon ? (undefined as any) : props.cancelLabel || 'Abbrechen'}
                        onClick={() => {
                            props.onClose();
                        }}
                        icon={props.cancelIcon}
                        title={props.cancelIcon ? props.cancelLabel || 'Abbrechen' : undefined}
                        color="black"
                    />
                    <Button text={props.importLabel || 'Importieren'} onClick={() => {}} color="primary" />
                </div>
            </div>
        </div>
    );
});

export default CodeImport;
