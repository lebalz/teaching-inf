import React, { useRef } from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.scss';
import HomepageCourses from '@tdev-components/HomepageCourses';
import { Content } from '@theme/BlogPostPage';
import _ from 'lodash';
import useIsMobileView from '@tdev-hooks/useIsMobileView';
import SourceRef from '@tdev-components/Figure/SourceRef';
import bib1 from './images/compsci-1.json';
import bib2 from './images/compsci-2.json';
import bib3 from './images/compsci-3.json';
import bib4 from './images/compsci-4.json';
import bib5 from './images/compsci-5.json';
import bib6 from './images/compsci-6.json';
import Button from '@tdev-components/shared/Button';
import { mdiShuffleVariant } from '@mdi/js';
import { SIZE_M, SIZE_S } from '@tdev-components/shared/iconSizes';

function HomepageHeader() {
    const { siteConfig } = useDocusaurusContext();
    return (
        <header className={clsx('hero hero--primary index-page', styles.heroBanner)}>
            <div className="container index-page-title">
                <h1 className="hero__title">{siteConfig.title}</h1>
                <p className="hero__subtitle">{siteConfig.tagline}</p>
            </div>
        </header>
    );
}
interface Props {
    readonly recentPosts: readonly { readonly content: Content }[];
}

const VideoWallpaper = ({
    src,
    bib,
    className
}: {
    src: string;
    bib: { author?: string };
    className?: string;
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    React.useEffect(() => {
        if (videoRef.current) {
            videoRef.current.muted = true;
            videoRef.current.play().catch((e) => {
                console.warn('Error playing video:', e);
            });
        }
    }, [src]);
    return (
        <div className={clsx(styles.container, className)}>
            <video
                ref={videoRef}
                preload="metadata"
                loop
                muted
                disablePictureInPicture
                disableRemotePlayback
                playsInline
                className={clsx(styles.videoWallpaper)}
            >
                <source src={src} type="video/mp4" />
            </video>
            <div className={clsx(styles.bib)}>
                <SourceRef bib={bib} />
            </div>
        </div>
    );
};

export default function Home({ recentPosts }: Props): React.ReactNode {
    const videos = React.useRef([
        { src: require('./images/compsci-1.mp4').default, bib: bib1 },
        { src: require('./images/compsci-2.mp4').default, bib: bib2 },
        { src: require('./images/compsci-3.mp4').default, bib: bib3 },
        { src: require('./images/compsci-4.mp4').default, bib: bib4 },
        { src: require('./images/compsci-5.mp4').default, bib: bib5 },
        { src: require('./images/compsci-6.mp4').default, bib: bib6 }
    ]);
    const [isShuffling, setIsShuffling] = React.useState(false);
    const [shuffleCounter, setShuffleCounter] = React.useState(0);
    const isMobile = useIsMobileView(450);
    const isTablet = useIsMobileView(750);
    const isLaptop = useIsMobileView(900);
    const isDesktop = useIsMobileView(1730);
    const isWide = useIsMobileView(2300);
    const videosToShow = React.useMemo(() => {
        console.log('Shuffle counter:', shuffleCounter);
        return _.shuffle(videos.current).slice(
            0,
            isMobile ? 1 : isTablet ? 2 : isLaptop ? 3 : isDesktop ? 4 : isWide ? 5 : 6
        );
    }, [isMobile, isTablet, isLaptop, isDesktop, isWide, shuffleCounter]);
    return (
        <div className={clsx('no-search')}>
            <Layout>
                <HomepageHeader />
                <main>
                    <div className={clsx(styles.galleryWrapper)}>
                        {videosToShow.map((vid, idx) => {
                            return (
                                <VideoWallpaper
                                    key={vid.src}
                                    src={vid.src}
                                    bib={vid.bib}
                                    className={clsx(
                                        videosToShow.length === 1 ? styles.single : undefined,
                                        idx > 1 && idx === videosToShow.length - 1 ? styles.last : undefined
                                    )}
                                />
                            );
                        })}
                    </div>
                    <div className={clsx(styles.shuffle)}>
                        <Button
                            icon={mdiShuffleVariant}
                            title="Videos neu sortieren"
                            onClick={() => {
                                if (isShuffling) {
                                    return;
                                }
                                setIsShuffling(true);
                                setTimeout(() => {
                                    setIsShuffling(false);
                                    setShuffleCounter((prev) => prev + 1);
                                }, 1500);
                            }}
                            color={isShuffling ? 'warning' : undefined}
                            className={clsx(styles.shuffleBtn, isShuffling ? styles.animate : undefined)}
                            size={SIZE_M}
                        />
                    </div>
                    <HomepageCourses />
                </main>
            </Layout>
        </div>
    );
}
