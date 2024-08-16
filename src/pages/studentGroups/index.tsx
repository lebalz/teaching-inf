import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import Layout from '@theme/Layout';
import { observer } from 'mobx-react-lite';
import { useStore } from '@site/src/hooks/useStore';
import StudentGroup from '@site/src/components/StudentGroup';
import _ from 'lodash';
import Button from '@site/src/components/shared/Button';
import { mdiPlusCircleOutline } from '@mdi/js';

const StudentGroups = observer(() => {
    const groupStore = useStore('studentGroupStore');
    return (
        <Layout>
            <main className={clsx(styles.main)}>
                <h2>Lerngruppen</h2>
                <div>
                    <Button
                        onClick={() => {
                            groupStore.create(
                                'Neue Lerngruppe',
                                'Beschreibung'
                            );
                        }}
                        icon={mdiPlusCircleOutline}
                        color="primary"
                        text='Neue Lerngruppe erstellen'
                    />
                </div>
                <div className={clsx(styles.studentGroups)}>
                    {_.orderBy(groupStore.studentGroups, ['name', 'createdAt'], ['asc', 'desc']).map(
                        (group) => (
                            <StudentGroup key={group.id} studentGroup={group} />
                        )
                    )}
                </div>
            </main>
        </Layout>
    );
});
export default StudentGroups;
