import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import Layout from '@theme/Layout';
import { observer } from 'mobx-react-lite';
import { useStore } from '@site/src/hooks/useStore';
import StudentGroup from '@site/src/components/StudentGroup';

const StudentGroups = observer(() => {
    const groupStore = useStore('studentGroupStore');
    return (
        <Layout>
            <main className={clsx(styles.main)}>
                <h2>Lerngruppen</h2>
                <div className={clsx(styles.studentGroups)}>
                    {groupStore.studentGroups.map((group, idx) => (
                        <StudentGroup key={idx} studentGroup={group} />
                    ))}
                </div>
            </main>
        </Layout>
    );
});
export default StudentGroups;
