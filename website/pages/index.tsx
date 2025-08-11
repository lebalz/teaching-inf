import React, { useRef } from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.scss';
import HomepageCourses from '@tdev-components/HomepageCourses';
import { Content } from '@theme/BlogPostPage';
import _ from 'lodash';
import useIsMobileView from '@tdev-hooks/useIsMobileView';

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

const VideoWallpaper = ({ src }: { src: string }) => {
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
    );
};

export default function Home({ recentPosts }: Props): React.ReactNode {
    const videos = React.useRef([
        require('./images/compsci-1.mp4').default,
        require('./images/compsci-2.mp4').default,
        require('./images/compsci-3.mp4').default,
        require('./images/compsci-4.mp4').default,
        require('./images/compsci-5.mp4').default,
        require('./images/compsci-6.mp4').default
    ]);
    const isMobile = useIsMobileView(450);
    const isTablet = useIsMobileView(750);
    const isLaptop = useIsMobileView(900);
    const isDesktop = useIsMobileView(1800);
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
                            .map((src) => {
                                return <VideoWallpaper key={src} src={src} />;
                            })}
                    </div>
                    <HomepageCourses />
                </main>
            </Layout>
        </div>
    );
}
