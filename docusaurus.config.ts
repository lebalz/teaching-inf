require('dotenv').config();
import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type { VersionOptions } from '@docusaurus/plugin-content-docs';
import type * as Preset from '@docusaurus/preset-classic';

import strongPlugin from './src/plugins/remark-strong/plugin';
import deflistPlugin from './src/plugins/remark-deflist/plugin';
import mdiPlugin from './src/plugins/remark-mdi/plugin';
import kbdPlugin from './src/plugins/remark-kbd/plugin';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { mdiSourceCommit } from '@mdi/js';
import defboxPlugin from './src/plugins/remark-code-defbox/plugin';
import flexCardsPlugin from './src/plugins/remark-flex-cards/plugin';
import imagePlugin from './src/plugins/remark-images/plugin';
import mediaPlugin from './src/plugins/remark-media/plugin';
import detailsPlugin from './src/plugins/remark-details/plugin';

const GIT_COMMIT_SHA = process.env.GITHUB_SHA || Math.random().toString(36).substring(7);
const BASE_URL = '/';

const BEFORE_DEFAULT_REMARK_PLUGINS = [
  flexCardsPlugin,
  [
      imagePlugin,
      { tagNames: { sourceRef: 'SourceRef', figure: 'Figure' } }
  ],
  detailsPlugin,
  defboxPlugin
];

const REMARK_PLUGINS = [  
  [strongPlugin, { className: 'boxed' }],
  [
      deflistPlugin,
      {
          tagNames: {
              dl: 'Dl',
          },
      }
  ],
  [
      mdiPlugin,
      {
          colorMapping: {
              green: 'var(--ifm-color-success)',
              red: 'var(--ifm-color-danger)',
              orange: 'var(--ifm-color-warning)',
              yellow: '#edcb5a',
              blue: '#3578e5',
              cyan: '#01f0bc'
          },
          defaultSize: '1.25em'
      }
  ],
  mediaPlugin,
  kbdPlugin,
  remarkMath
];
const REHYPE_PLUGINS = [
  rehypeKatex
]

const VERSIONS: { [version: string]: VersionOptions } = {
  current: {
      label: 'Material',
      banner: 'none'
  }
};
if (!process.env.DOCS_ONLY) {
  ['28Gb', '28Gj'].forEach(version => {
      VERSIONS[version] = {
          label: version,
          banner: 'none'
      }
  });
}

const config: Config = {
  title: 'Informatik',
  tagline: 'Gymnasium Biel-Seeland',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://inf.gbsl.website',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'lebalz', // Usually your GitHub org/user name.
  projectName: 'teaching-inf', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  
  customFields: {
    /** Use Testuser in local dev: set TEST_USERNAME to the test users email adress*/
    TEST_USERNAME: process.env.TEST_USERNAME,
    NO_AUTH: process.env.NODE_ENV !== 'production' && !!process.env.TEST_USERNAME,
    /** The Domain Name where the api is running */
    APP_URL: process.env.NETLIFY 
      ? process.env.DEPLOY_PRIME_URL 
      : process.env.APP_URL || 'http://localhost:3000',
    /** The Domain Name of this app */
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:3002',
    /** The application id generated in https://portal.azure.com */
    CLIENT_ID: process.env.CLIENT_ID,
    /** Tenant / Verzeichnis-ID (Mandant) */
    TENANT_ID: process.env.TENANT_ID,
    /** The application id uri generated in https://portal.azure.com */
    API_URI: process.env.API_URI,
    GIT_COMMIT_SHA: GIT_COMMIT_SHA,
},

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'de',
    locales: ['de'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: (params) => {
              if (params.version === 'current') {
                  return `https://github.com/lebalz/teaching-inf/edit/main/${params.versionDocsDirPath}/${params.docPath}`
              }
          },
          path: 'docs',
          includeCurrentVersion: true,
          lastVersion: 'current',
          showLastUpdateTime: true,
          routeBasePath: '/',
          admonitions: {
              keywords: ['aufgabe', 'finding'],
              extendDefaults: true,
          },
          versions: VERSIONS,
          remarkPlugins: REMARK_PLUGINS,
          rehypePlugins: REHYPE_PLUGINS,
          beforeDefaultRemarkPlugins: BEFORE_DEFAULT_REMARK_PLUGINS,
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/lebalz/teaching-inf/edit/main/',
            remarkPlugins: REMARK_PLUGINS,
            rehypePlugins: REHYPE_PLUGINS,
            admonitions: {
                keywords: ['aufgabe', 'finding'],
                extendDefaults: true,
            },
            postsPerPage: 15,
            beforeDefaultRemarkPlugins: BEFORE_DEFAULT_REMARK_PLUGINS,
        },
        pages: {
          admonitions: {
              keywords: ['aufgabe', 'finding'],
              extendDefaults: true,
          },
          remarkPlugins: REMARK_PLUGINS,
          rehypePlugins: REHYPE_PLUGINS,
          beforeDefaultRemarkPlugins: BEFORE_DEFAULT_REMARK_PLUGINS,
        },
        theme: {
          customCss: [
            './src/css/custom.scss',
             require.resolve('./node_modules/react-image-gallery/styles/css/image-gallery.css')
          ]
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/social-card.png',
    navbar: {
      title: 'Informatik',
      logo: {
        alt: 'Teaching Inf Logo',
        src: 'img/logo.png',
      },
      items: [
        {
            to: 'playground',
            position: 'left',
            label: 'Playground'
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {
            type: 'custom-loginProfileButton',
            position: 'right'
        },
      ],
    },
    footer: {
      style: 'dark',
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
                      to: 'https://jupyter.gbsl.website',
                  }
              ],
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
                      to: 'https://office.com',
                  },
                  {
                      label: 'GBSL',
                      to: 'https://gbsl.ch',
                  },
                  {
                      label: 'Intranet',
                      to: 'https://erzbe.sharepoint.com/sites/GYMB/gbsl'
                  },
                  {
                      label: 'Stundenplan',
                      to: 'https://mese.webuntis.com/WebUntis/?school=gym_Biel-Bienne#/basic/main',
                  },
              ],
          }
      ],
      copyright: `<a 
                class="footer__link-item"
                href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.de"
              >
                <img style="height: 1.6em" src="${BASE_URL}img/by-nc-sa.eu.svg" alt="CC-BY-NC-SA"> 
                Text und Bilder von Balthasar Hofer, Ausnahmen sind gekennzeichnet. 
              </a>
              <br />
              <a 
                class="badge badge--primary"
                href="https://github.com/lebalz/teaching-inf/commit/${GIT_COMMIT_SHA}"
              >
                  <svg viewBox="0 0 24 24" role="presentation" style="width: 0.9rem; height: 0.9rem; transform: translateY(15%) rotate(90deg); transform-origin: center center;"><path d="${mdiSourceCommit}" style="fill: currentcolor;"></path></svg> ${GIT_COMMIT_SHA.substring(0, 7)}
              </a>`
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
  plugins: ['docusaurus-plugin-sass'],
  themes: ['docusaurus-live-brython'],
  scripts: [
    {
      src: 'https://umami.gbsl.website/tell-me.js',
      ['data-website-id']: process.env.UMAMI_ID,
      ['data-domains']: 'inf.gbsl.website',
      async: true,
      defer: true
    }
  ],
  stylesheets: [
    {
      href: 'https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css',
      type: 'text/css',
      integrity:
        'sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM',
      crossorigin: 'anonymous',
    },
  ]
};

export default config;