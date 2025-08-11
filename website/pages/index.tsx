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

const VideoWallpaper = ({ src, bib }: { src: string; bib: { author?: string } }) => {
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
        <div className={clsx(styles.container)}>
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
    const isMobile = useIsMobileView(400);
    const isTablet = useIsMobileView(750);
    const isLaptop = useIsMobileView(900);
    const isDesktop = useIsMobileView(1730);
    const isWide = useIsMobileView(2300);
    return (
        <div className={clsx('no-search')}>
            <Layout>
                <HomepageHeader />
                <main>
                    <div className={clsx(styles.galleryWrapper)}>
                        {_.shuffle(videos.current)
                            .slice(
                                0,
                                isMobile ? 1 : isTablet ? 2 : isLaptop ? 3 : isDesktop ? 4 : isWide ? 5 : 6
                            )
                            .map((vid) => {
                                return <VideoWallpaper key={vid.src} src={vid.src} bib={vid.bib} />;
                            })}
                    </div>
                    <HomepageCourses />
                </main>
            </Layout>
        </div>
    );
}
