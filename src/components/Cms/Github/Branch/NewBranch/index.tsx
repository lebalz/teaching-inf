import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { observer } from 'mobx-react-lite';
import { useStore } from '@tdev-hooks/useStore';
import Popup from 'reactjs-popup';
import Card from '@tdev-components/shared/Card';
import { mdiClose, mdiFlashTriangle, mdiSourceBranch, mdiSourceBranchPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@tdev-components/shared/Button';
import Alert from '@tdev-components/shared/Alert';
import TextInput from '@tdev-components/shared/TextInput';

interface Props {
    onDone: (branch?: string) => void;
    onDiscard: () => void;
}

const NewBranch = observer((props: Props) => {
    const cmsStore = useStore('cmsStore');

    const [branchName, setBranchName] = React.useState(cmsStore.github?.nextBranchName || '');
    const [isCreating, setIsCreating] = React.useState(false);
    const [isError, setIsError] = React.useState(false);

    return (
        <Card
            header={
                <h4>
                    <Icon path={mdiSourceBranchPlus} color="var(--ifm-color-blue)" size={0.6} /> Neuen Branch
                    erstellen.
                </h4>
            }
            footer={
                <div className={clsx('button-group', 'button-group--block')}>
                    <Button
                        onClick={() => {
                            props.onDiscard();
                        }}
                        icon={mdiClose}
                        color="black"
                        iconSide="left"
                    >
                        Abbrechen
                    </Button>
                    <Button
                        onClick={() => {
                            if (!cmsStore.github) {
                                return props.onDone();
                            }
                            setIsCreating(true);

                            cmsStore.github
                                .createNewBranch(branchName)
                                .then((branch) => {
                                    cmsStore.setBranch(branchName);
                                    props.onDone(branchName);
                                })
                                .catch(() => {
                                    setIsError(true);
                                    setIsCreating(false);
                                });
                        }}
                        title={isError ? 'Fehler beim Erstellen' : 'Erstelle neuen Branch'}
                        spin={isCreating}
                        disabled={isError}
                        icon={isError ? mdiFlashTriangle : mdiSourceBranchPlus}
                        color={isError ? 'ref' : 'green'}
                        iconSide="right"
                    >
                        {isError ? 'Fehler' : 'Branch Erstellen'}
                    </Button>
                </div>
            }
        >
            {isError && (
                <Alert type="danger" title="Fehler beim Erstellen">
                    Es ist ein Fehler beim Erstellen des Branches aufgetreten. Laden Sie die Seite neu und
                    versuchen Sie es erneut.
                </Alert>
            )}
            <TextInput value={branchName} onChange={setBranchName} label="Name" noSpellCheck />
        </Card>
    );
});

export default NewBranch;
