import React from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import siteConfig from '@generated/docusaurus.config';
import { useStore } from '@tdev-hooks/useStore';
import useIsBrowser from '@docusaurus/useIsBrowser';
const { DOCS_ONLY } = siteConfig.customFields as { DOCS_ONLY?: boolean };

interface Klass {
    label: string;
    uri: string;
}

interface Course {
    title: string;
    classes: (string | Klass)[];
}

const CourseList: Course[] = [];

if (!DOCS_ONLY) {
    CourseList.push({
        title: 'Gym 1',
        classes: ['28Gb', '28Gj']
    });
    CourseList.push({
        title: 'Ehemalige',
        classes: [
            {
                uri: 'https://ofi.24.gbsl.website',
                label: '24'
            },
            {
                uri: 'https://ef.24.gbsl.website/24ef/home',
                label: '24 EF'
            },
            {
                uri: 'https://ofi.25.gbsl.website/25h/home',
                label: '25h'
            },
            {
                uri: 'https://ofi.26.gbsl.website',
                label: '26'
            },
            {
                uri: 'https://ofi.25.gbsl.website/24w/home',
                label: '24w'
            }
        ]
    });
}

// const CourseComponent = (course: Course) => {
const CourseComponent = ({ course }: { course: Course }) => {
    return (
        <div className={clsx('card margin--md shadow--md')}>
            <div className="card__header">
                <h3>{course.title}</h3>
            </div>
            <div className="card__body">
                {course.classes.map((cl, idx) => {
                    const isString = typeof cl === 'string';
                    const to = isString ? `${cl}/home` : cl.uri;
                    const label = isString ? cl : cl.label;
                    return (
                        <Link
                            key={idx}
                            to={to}
                            className="button button--outline button--secondary margin--xs"
                        >
                            {label}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default function HomepageCourses() {
    const userStore = useStore('userStore');
    const isBrowser = useIsBrowser();
    return (
        <section className={styles.features}>
            <div className="container">
                <div className="row">
                    {CourseList.map((course, idx) => (
                        <CourseComponent key={idx} course={course} />
                    ))}
                </div>
                <div className="row">
                    {isBrowser &&
                        (DOCS_ONLY ||
                            process.env.NODE_ENV === 'development' ||
                            userStore.current?.isAdmin) && (
                            <CourseComponent
                                course={{ title: 'All Docs', classes: [{ label: 'Docs', uri: '/home' }] }}
                            />
                        )}
                </div>
            </div>
        </section>
    );
}
