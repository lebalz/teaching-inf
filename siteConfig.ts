// This file is never changed by teaching-dev.
// Use it to override or extend your app configuration.

import { mdiSourceCommit } from '@mdi/js';
import path from 'path';
import { EditUrlFunction, VersionOptions } from '@docusaurus/plugin-content-docs';
import type { SiteConfigProvider } from '@tdev/siteConfig/siteConfig';
import * as yaml from 'js-yaml';
import fs from 'fs';
import {
    accountSwitcher,
    blog,
    loginProfileButton,
    requestTarget,
    taskStateOverview,
    devModeAccessLocalFS,
    personalSpaceOverlay
} from './src/siteConfig/navbarItems';
import { brythonCodePluginConfig } from './src/siteConfig/pluginConfigs';
import { themes as prismThemes } from 'prism-react-renderer';
import versions from './versions.json' with { type: 'json' };
console.log('versions.json', versions);

const raw = fs.readFileSync('./material.config.yaml', 'utf8');
type MatrialConfigEntry = {
    from: string;
    to: string;
    ignore: string[];
};
const matrialConfig: Partial<{ [key: string]: MatrialConfigEntry[] }> = yaml.load(raw) || {};

const getEditUrl = (props: Parameters<EditUrlFunction>[0]) => {
    const { version, docPath, versionDocsDirPath } = props;
    const joinPath = (parts: string[]) => `/${versionDocsDirPath}/${parts.join('/')}`;
    if (version === 'current') {
        return joinPath([docPath]);
    }
    if (!(version in matrialConfig)) {
        return joinPath([docPath]);
    }
    const config = matrialConfig[version as keyof typeof matrialConfig] ?? [];
    const parts = docPath.split('/');
    const getSourceFilePath = (absParts: string[], relParts: string[]) => {
        if (absParts.length === 0) {
            return joinPath(relParts);
        }
        const item = config.find(({ to }) => to === joinPath(absParts));
        if (item && !item.ignore.find((pattern) => relParts.join('/').startsWith(pattern))) {
            return path.join(item.from, ...relParts);
        }
        return getSourceFilePath(absParts.slice(0, -1), [absParts[absParts.length - 1], ...relParts]);
    };
    return getSourceFilePath(parts, []);
};

const GIT_COMMIT_SHA = process.env.GITHUB_SHA || Math.random().toString(36).substring(7);
const BUILD_ARCHIVE = process.env.BUILD_ARCHIVE === 'true';

declare module '@tdev/siteConfig/siteConfig' {
    export interface TdevConfig {
        isArchiveBuild?: boolean;
    }
}

const VERSIONS: { [version: string]: VersionOptions } = {
    current: {
        label: 'Material',
        banner: 'none'
    }
};
if (!process.env.DOCS_ONLY) {
    versions.forEach((version) => {
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
        url: 'https://inf.28.gbsl.website',
        gitHub: {
            orgName: 'lebalz',
            projectName: 'teaching-inf'
        },
        siteStyles: ['website/css/custom.scss'],
        socialCard: 'img/social-card.png',
        logo: 'img/logo.png',
        personalSpaceDocRootId: 'e1097f86-c945-4c06-81cd-bb52c8811cb8',
        navbarItems: [
            blog,
            taskStateOverview,
            devModeAccessLocalFS,
            accountSwitcher,
            requestTarget,
            personalSpaceOverlay,
            loginProfileButton
        ],
        showEditThisPage: 'teachers',
        showEditThisPageOptions: ['github', 'github-dev', 'cms'],
        editThisPageCmsUrl: '/cms/',
        tdevConfig: {
            taskStateOverview: {
                hideTeachers: true
            },
            excalidraw: {
                excalidoc: true
            },
            isArchiveBuild: BUILD_ARCHIVE
        },
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
                        },
                        {
                            label: 'Excalidraw',
                            to: '/excalidraw'
                        }
                    ]
                },
                {
                    title: 'Gymnasium',
                    items: [
                        {
                            label: 'GBSL',
                            to: 'https://gbsl.ch'
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
                          </a>`
        },
        themeConfig: {
            docs: {
                sidebar: {
                    hideable: true
                }
            },
            prism: {
                theme: prismThemes.github,
                darkTheme: prismThemes.dracula,
                additionalLanguages: ['bash', 'typescript', 'json', 'python', 'armasm']
            }
        },
        scripts: [
            {
                src: 'https://umami.gbsl.website/tell-me.js',
                ['data-website-id']: process.env.UMAMI_ID,
                ['data-domains']: 'inf.28.gbsl.website',
                async: true,
                defer: true
            }
        ],
        plugins: [
            brythonCodePluginConfig(),
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
        ],
        docs: {
            versions: VERSIONS,
            lastVersion: 'current',
            routeBasePath: '/',
            exclude: process.env.NODE_ENV === 'production' ? ['tdev/**'] : [],
            showLastUpdateTime: true,
            includeCurrentVersion: true,
            sidebarCollapsible: true,
            editUrl: (fConfig) => {
                return getEditUrl(fConfig);
            }
        },
        blog: {},
        apiDocumentProviders: [
            require.resolve('@tdev/netpbm-graphic/register'),
            require.resolve('@tdev/text-message/register'),
            require.resolve('@tdev/pyodide-code/register'),
            require.resolve('@tdev/brython-code/register'),
            require.resolve('@tdev/webserial/register'),
            require.resolve('@tdev/page-read-check/register')
        ]
    };
};

export default getSiteConfig;
