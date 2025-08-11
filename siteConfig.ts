// This file is never changed by teaching-dev.
// Use it to override or extend your app configuration.

import { PluginConfig } from '@docusaurus/types';
import { mdiSourceCommit } from '@mdi/js';
import path from 'path';
import { VersionOptions } from '@docusaurus/plugin-content-docs';
import type { SiteConfigProvider } from '@tdev/siteConfig/siteConfig';
import {
    accountSwitcher,
    blog,
    loginProfileButton,
    requestTarget,
    taskStateOverview,
    devModeAccessLocalFS
} from './src/siteConfig/navbarItems';

const GIT_COMMIT_SHA = process.env.GITHUB_SHA || Math.random().toString(36).substring(7);
const CWD = process.cwd();
const ADMONITION_CONFIG = {
    admonitions: {
        keywords: ['aufgabe', 'finding'],
        extendDefaults: true
    }
};
const VERSIONS: { [version: string]: VersionOptions } = {
    current: {
        label: 'Material',
        banner: 'none'
    }
};
if (!process.env.DOCS_ONLY) {
    ['28Gb', '28Gj', '28Wa', '29Ga', '29Gj'].forEach((version) => {
        VERSIONS[version] = {
            label: version,
            banner: 'none'
        };
    });
}
const getSiteConfig: SiteConfigProvider = () => {
    return {
        title: 'Informatik',
        tagline: 'Gymnasium Biel-Seeland',
        url: 'https://inf.gbsl.website',
        gitHub: {
            orgName: 'lebalz',
            projectName: 'teaching-inf'
        },
        siteStyles: [
            require.resolve(
                path.resolve(CWD, 'node_modules/react-image-gallery/styles/css/image-gallery.css')
            ),
            'website/css/custom.scss'
        ],
        socialCard: 'img/social-card.png',
        logo: 'img/logo.png',
        navbarItems: [
            {
                to: 'playground',
                position: 'left',
                label: 'Playground'
            },
            blog,
            taskStateOverview,
            devModeAccessLocalFS,
            accountSwitcher,
            requestTarget,
            loginProfileButton
        ],
        footer: {
            links: [
                {
                    title: 'Tools',
                    items: [
                        {
                            label: 'VS Code',
                            to: 'https://code.visualstudio.com/'
                        },
                        {
                            label: 'Python',
                            to: 'https://www.python.org/'
                        }
                    ]
                },
                {
                    title: 'Links',
                    items: [
                        // {
                        //     label: 'Troubleshooting Office 365',
                        //     to: '/troubleshooting',
                        // },
                        {
                            label: 'Jupyterhub',
                            to: 'https://jupyter.gbsl.website'
                        }
                    ]
                },
                {
                    title: 'Gymnasium',
                    items: [
                        {
                            label: 'Passwort Zurücksetzen',
                            to: 'https://password.edubern.ch/'
                        },
                        {
                            label: 'Office 365',
                            to: 'https://office.com'
                        },
                        {
                            label: 'GBSL',
                            to: 'https://gbsl.ch'
                        },
                        {
                            label: 'Intranet',
                            to: 'https://erzbe.sharepoint.com/sites/GYMB/gbsl'
                        },
                        {
                            label: 'Stundenplan',
                            to: 'https://mese.webuntis.com/WebUntis/?school=gym_Biel-Bienne#/basic/main'
                        }
                    ]
                }
            ],
            copyright: `<a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.de">
                            <div style="display: flex; flex-direction: column; align-items: center;">
                              <img style="height: 1.6em" src="/img/by-nc-sa.eu.svg" alt="CC-BY-NC-SA">
                              <div>
                                Text und Bilder von Balthasar Hofer, Ausnahmen sind gekennzeichnet. 
                              </div>
                            </div>
                          </a>
                          <a 
                            class="badge badge--primary"
                            style="margin-top: 0.5rem;"
                            href="https://github.com/lebalz/teaching-inf/commits/${GIT_COMMIT_SHA}"
                          >
                              <svg viewBox="0 0 24 24" role="presentation" style="width: 0.9rem; height: 0.9rem; transform: translateY(15%) rotate(90deg); transform-origin: center center;"><path d="${mdiSourceCommit}" style="fill: currentcolor;"></path></svg> ${GIT_COMMIT_SHA.substring(0, 7)}
                          </a>`
        },
        themeConfig: {
            algolia: {
                appId: 'P2ENEETR74',
                apiKey: 'e5251468d5a81bb7569048e52f735999',
                indexName: 'inf-gbsl',
                searchPagePath: 'search'
            }
        },
        scripts: [
            {
                src: 'https://umami.gbsl.website/tell-me.js',
                ['data-website-id']: process.env.UMAMI_ID,
                ['data-domains']: 'inf.gbsl.website',
                async: true,
                defer: true
            }
        ],
        docs: {
            ...ADMONITION_CONFIG,
            versions: VERSIONS,
            lastVersion: 'current',
            routeBasePath: '/',
            exclude: ['tdev/**'],
            showLastUpdateTime: true,
            includeCurrentVersion: true,
            sidebarCollapsible: true
        },
        blog: { ...ADMONITION_CONFIG, exclude: ['tdev/**'] },
        pages: ADMONITION_CONFIG,
        transformers: {
            plugins: (plugins: PluginConfig[]) => {
                return [
                    ...plugins,
                    () => {
                        return {
                            name: 'yaml-loader-config',
                            configureWebpack(config, isServer, { currentBundler }) {
                                return {
                                    module: {
                                        rules: [
                                            {
                                                test: /\.ya?ml$/,
                                                use: 'yaml-loader'
                                            }
                                        ]
                                    }
                                };
                            }
                        };
                    }
                ] satisfies PluginConfig[];
            }
        }
    };
};

export default getSiteConfig;
