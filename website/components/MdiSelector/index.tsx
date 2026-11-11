import * as Mdi from '@mdi/js';
import Icon from '@mdi/react';
import styles from '@tdev-components/MdiSelector/styles.module.scss';
import Button from '@tdev-components/shared/Button';
import CopyBadge from '@tdev-components/shared/CopyBadge';
import { SIZE_XS } from '@tdev-components/shared/iconSizes';
import TextInput from '@tdev-components/shared/TextInput';
import clsx from 'clsx';
import _ from 'es-toolkit/compat';
import React from 'react';

interface Props {
    // Optional top margin for the filter bar
    filterBarTop?: string | number;
    copyBadges?: ('mdi' | 'dashed' | 'directive' | 'name')[];
}

const DownloadBadge = ({ name, svgPath }: { name: string; svgPath: string }) => {
    return (
        <Button
            icon={Mdi.mdiDownload}
            size={SIZE_XS}
            className={clsx(styles.downloadBadge)}
            onClick={() => {
                const content = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="presentation"><path d="${svgPath}" style="fill: currentcolor;"></path></svg>`;
                const blob = new Blob([content], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${name}.svg`;
                link.click();
                URL.revokeObjectURL(url);
            }}
        />
    );
};

const MdiSelector = (props: Props): React.ReactNode => {
    const [showNr, setShowNr] = React.useState(300);
    const [icons, setIcons] = React.useState<string[]>([]);
    const [filter, setFilter] = React.useState('');
    const { filterBarTop, copyBadges = ['mdi', 'dashed', 'directive'] } = props;
    const badges = new Set(copyBadges);

    React.useEffect(() => {
        setShowNr(300);
        if (filter.trim() === '') {
            setIcons(Object.keys(Mdi));
            return;
        }
        const trm = new RegExp(`${filter}`, 'i');
        const icos = Object.keys(Mdi).filter((ico) => trm.test(ico));
        setIcons(icos);
    }, [filter]);
    return (
        <div>
            <div className={clsx(styles.header)} style={{ top: filterBarTop ?? 0 }}>
                <TextInput
                    type="search"
                    value={filter}
                    onChange={(text) => setFilter(text)}
                    placeholder="🔎 Suche"
                    className={clsx(styles.filter)}
                />
                <span className={styles.spacer}></span>
                <span className={styles.spacer}></span>
                <span className="badge badge--primary">{icons.length}</span>
            </div>
            <div className={clsx(styles.icons)}>
                {icons.slice(0, showNr).map((ico, idx) => {
                    const dashed = _.startCase(ico).split(' ').slice(1).join('-');
                    return (
                        <div key={idx} className={clsx(styles.icon)}>
                            <Icon path={Mdi[ico as keyof typeof Mdi]} size={1.8} />
                            <DownloadBadge name={ico} svgPath={Mdi[ico as keyof typeof Mdi]} />
                            {badges.has('name') && (
                                <CopyBadge className={styles.copyBadge} value={dashed.toLowerCase()} />
                            )}
                            {badges.has('dashed') && (
                                <CopyBadge className={styles.copyBadge} value={dashed.replace('-', ' ')} />
                            )}
                            {badges.has('mdi') && (
                                <CopyBadge
                                    className={styles.copyBadge}
                                    label={`mdi${dashed.charAt(0)}...`}
                                    value={ico}
                                />
                            )}
                            {badges.has('directive') && (
                                <CopyBadge
                                    className={styles.copyBadge}
                                    label={`:mdi[${dashed.charAt(0)}...]`}
                                    value={`:mdi[${dashed}]`.toLowerCase()}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
            <div>
                <span className={clsx('badge', 'badge--secondary')}>{showNr}</span>{' '}
                <span
                    className={clsx('badge', 'badge--primary')}
                    onClick={() => {
                        setShowNr(showNr + 100);
                    }}
                    style={{ cursor: 'pointer' }}
                >
                    Show 100 More
                </span>
            </div>
        </div>
    );
};
export default MdiSelector;
