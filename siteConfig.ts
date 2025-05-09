// This file is never changed by teaching-dev.
// Use it to override or extend your app configuration.

import { Config, PluginConfig, PresetConfig, PresetConfigDefined } from '@docusaurus/types';
import { mdiSourceCommit } from '@mdi/js';
import path from 'path';
import { Options as DocsOptions } from '@docusaurus/plugin-content-docs';
import { Options as BlogOptions } from '@docusaurus/plugin-content-blog';
import { Options as PageOptions } from '@docusaurus/plugin-content-pages';

import {
    accountSwitcher,
    blog,
    loginProfileButton,
    requestTarget,
    taskStateOverview
} from './src/siteConfig/navbarItems';
import { SiteConfigProvider } from './src/siteConfig/siteConfig';
const GIT_COMMIT_SHA = process.env.GITHUB_SHA || Math.random().toString(36).substring(7);
const CWD = process.cwd();
const getSiteConfig: SiteConfigProvider = () => {
    return {
        title: 'Informatik',
        tagline: 'Gymnasium Biel-Seeland',
        url: 'https://inf.gbsl.website',
        gitHub: {
            orgName: 'lebalz',
            repoName: 'teaching-inf'
        },
        siteStyles: [
            require.resolve(
                path.resolve(CWD, 'node_modules/react-image-gallery/styles/css/image-gallery.css')
            )
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
            },
            'themeConfig.algolia': () => ({
                // TODO: Suggest algolia config field.
                appId: 'Z6FIZQ5MSD',
                apiKey: '7152c9a398beb4325de68df4f6a62acd',
                indexName: 'gbsl-silasberger',
                searchPagePath: 'search'
            }),
            scripts: () => {
                return [
                    {
                        src: 'https://umami.gbsl.website/tell-me.js',
                        ['data-website-id']: process.env.UMAMI_ID,
                        ['data-domains']: 'inf.gbsl.website',
                        async: true,
                        defer: true
                    }
                ] satisfies Config['scripts'];
            },
            presets: (presets: PresetConfig[]) => {
                const config = presets.find(
                    (preset) => Array.isArray(preset) && preset[0] === 'classic'
                ) as PresetConfigDefined;
                const untouchedPresets = presets.filter((p) => p !== config);
                const classicPreset = config[1] as {
                    docs: DocsOptions;
                    blog: BlogOptions;
                    pages: PageOptions;
                };
                return [
                    ...untouchedPresets,
                    [
                        config[0],
                        {
                            ...classicPreset,
                            docs: {
                                ...classicPreset.docs,
                                admonitions: {
                                    keywords: ['aufgabe', 'finding'],
                                    extendDefaults: true
                                }
                            },
                            blog: {
                                ...classicPreset.blog,
                                admonitions: {
                                    keywords: ['aufgabe', 'finding'],
                                    extendDefaults: true
                                }
                            },
                            pages: {
                                ...classicPreset.pages,
                                admonitions: {
                                    keywords: ['aufgabe', 'finding'],
                                    extendDefaults: true
                                }
                            }
                        }
                    ]
                ];
            }
        }
    };
};

export default getSiteConfig;
