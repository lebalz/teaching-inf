require('dotenv').config();
import { themes as prismThemes } from 'prism-react-renderer';
import type { Config, CurrentBundler } from '@docusaurus/types';
import dynamicRouterPlugin, { Config as DynamicRouteConfig} from './src/plugins/plugin-dynamic-routes';
import type { VersionOptions } from '@docusaurus/plugin-content-docs';
import type * as Preset from '@docusaurus/preset-classic';
import path from 'path';

import strongPlugin, { visitor as captionVisitor } from './src/plugins/remark-strong/plugin';
import deflistPlugin from './src/plugins/remark-deflist/plugin';
import mdiPlugin from './src/plugins/remark-mdi/plugin';
import kbdPlugin from './src/plugins/remark-kbd/plugin';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { mdiSourceCommit } from '@mdi/js';
import defboxPlugin from './src/plugins/remark-code-defbox/plugin';
import flexCardsPlugin from './src/plugins/remark-flex-cards/plugin';
import imagePlugin, { CaptionVisitor } from './src/plugins/remark-images/plugin';
import linkAnnotationPlugin from './src/plugins/remark-link-annotation/plugin';
import mediaPlugin from './src/plugins/remark-media/plugin';
import detailsPlugin from './src/plugins/remark-details/plugin';
import pagePlugin from './src/plugins/remark-page/plugin';
import pdfPlugin from './src/plugins/remark-pdf/plugin';
import commentPlugin from './src/plugins/remark-comments/plugin';
import themeCodeEditor from './src/plugins/theme-code-editor'
import enumerateAnswersPlugin from './src/plugins/remark-enumerate-components/plugin';
import { v4 as uuidv4 } from 'uuid';
import matter from 'gray-matter';
import { promises as fs } from 'fs';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const BUILD_LOCATION = __dirname;
const GIT_COMMIT_SHA = process.env.GITHUB_SHA || Math.random().toString(36).substring(7);
const BASE_URL = '/';

const BEFORE_DEFAULT_REMARK_PLUGINS = [
  flexCardsPlugin,
  [
    deflistPlugin,
    {
      tagNames: {
        dl: 'Dl',
      },
    }
  ],
  [
    imagePlugin,
    { 
      tagNames: { 
        sourceRef: 'SourceRef', 
        figure: 'Figure'
      },
      captionVisitors: [
        (ast, caption) => captionVisitor(ast, caption, { className: 'boxed' })
      ] satisfies CaptionVisitor[]
    }
  ],
  detailsPlugin,
  defboxPlugin
];

const REMARK_PLUGINS = [
  [strongPlugin, { className: 'boxed' }],
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
  remarkMath,
  [
    enumerateAnswersPlugin,
    {
      componentsToEnumerate: ['Answer', 'TaskState', 'SelfCheckTaskState'],
    }
  ],
  pdfPlugin,
  pagePlugin,
  [
    commentPlugin,
    {
      commentableJsxFlowElements: ['dd', 'DefHeading', 'figcaption', 'String'],
      ignoreJsxFlowElements: ['summary', 'dt'],
      ignoreCodeBlocksWithMeta: /live_py/
    }
  ],
  [
      linkAnnotationPlugin,
      {
          prefix: '👉',
          postfix: null
      }
  ]
];
const REHYPE_PLUGINS = [
  rehypeKatex
]

const pdfjsDistPath = path.dirname(require.resolve('pdfjs-dist/package.json'));
const cMapsDir = path.join(pdfjsDistPath, 'cmaps');
const getCopyPlugin = (
  currentBundler: CurrentBundler
): typeof CopyWebpackPlugin => {
  if (currentBundler.name === 'rspack') {
    // @ts-expect-error: this exists only in Rspack
    return currentBundler.instance.CopyRspackPlugin;
  }
  return CopyWebpackPlugin;
}

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
    /** User.ts#isStudent returns `true` for users matching this pattern. If unset, it returns `true` for all non-admin users. */
    STUDENT_USERNAME_PATTERN: process.env.STUDENT_USERNAME_PATTERN,
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
    GIT_COMMIT_SHA: GIT_COMMIT_SHA
  },
  future: {
    experimental_faster: {
      /**
       * no config options for swcJsLoader so far. 
       * Instead configure it over the jsLoader in the next step 
       */
      swcJsLoader: false, 
      swcJsMinimizer: true,
      swcHtmlMinimizer: true,
      lightningCssMinimizer: true,
      rspackBundler: true,
      mdxCrossCompilerCache: true,
    },
  },
  webpack: {
    jsLoader: (isServer) => {
      const defaultOptions = require("@docusaurus/faster").getSwcLoaderOptions({isServer});
      return {
        loader: 'builtin:swc-loader', // (only works with Rspack)
        options: {
          ...defaultOptions,
          jsc: {
            parser: {
              ...defaultOptions.jsc.parser,
              decorators: true
            },
            transform: {
              ...defaultOptions.jsc.transform,
              decoratorVersion: '2022-03'
            }
          }
        },
      }
    },
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'de',
    locales: ['de'],
  },
  markdown: {
    parseFrontMatter: async (params) => {
      const result = await params.defaultParseFrontMatter(params);
      /**
       * don't edit blogs frontmatter
       */
      if (params.filePath.startsWith(`${BUILD_LOCATION}/blog/`)) {
        return result;
      }
      if (process.env.NODE_ENV !== 'production') {
        let needsRewrite = false;
        /**
         * material on ofi.gbsl.website used to have 'sidebar_custom_props.id' as the page id.
         * Rewrite it as 'page_id' and remove it in case it's present.
         */
        if ('sidebar_custom_props' in result.frontMatter && 'id' in (result.frontMatter as any).sidebar_custom_props) {
          if (!('page_id' in result.frontMatter)) {
            result.frontMatter.page_id = (result.frontMatter as any).sidebar_custom_props.id;
            needsRewrite = true;
          }
          delete (result.frontMatter as any).sidebar_custom_props.id;
          if (Object.keys((result.frontMatter as any).sidebar_custom_props).length === 0) {
            delete result.frontMatter.sidebar_custom_props;
          }
        }
        if (!('page_id' in result.frontMatter)) {
          result.frontMatter.page_id = uuidv4();
          needsRewrite = true;
        }
        if (needsRewrite) {
          await fs.writeFile(
            params.filePath,
            matter.stringify(params.fileContent, result.frontMatter),
            { encoding: 'utf-8' }
          )
        }
      }
      return result;
    }
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
          sidebarCollapsible: true,
          sidebarCollapsed: false,
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
        { to: '/blog', label: 'Blog', position: 'left' },
        {
          type: 'custom-taskStateOverview',
          position: 'left'
        },
        {
          type: 'custom-accountSwitcher',
          position: 'right'
        },
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
      copyright: `<a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.de">
                <div style="display: flex; flex-direction: column; align-items: center;">
                  <img style="height: 1.6em" src="${BASE_URL}img/by-nc-sa.eu.svg" alt="CC-BY-NC-SA">
                  <div>
                    Text und Bilder von Balthasar Hofer, Ausnahmen sind gekennzeichnet. 
                  </div>
                </div>
              </a>
              <a 
                class="badge badge--primary"
                style="margin-top: 0.5rem;"
                href="https://github.com/lebalz/teaching-inf/commit/${GIT_COMMIT_SHA}"
              >
                  <svg viewBox="0 0 24 24" role="presentation" style="width: 0.9rem; height: 0.9rem; transform: translateY(15%) rotate(90deg); transform-origin: center center;"><path d="${mdiSourceCommit}" style="fill: currentcolor;"></path></svg> ${GIT_COMMIT_SHA.substring(0, 7)}
              </a>`
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'typescript', 'json', 'python'],
    },
    algolia: {
      appId: 'P2ENEETR74',
      apiKey: 'e5251468d5a81bb7569048e52f735999',
      indexName: 'inf-gbsl',
      searchPagePath: 'search',
    }
  } satisfies Preset.ThemeConfig,
  plugins: [
    'docusaurus-plugin-sass',
    [
      dynamicRouterPlugin,
      {
        routes: [
          {
            path: '/rooms/',
            component: '@tdev-components/Rooms',
          }
        ]
      } satisfies DynamicRouteConfig
    ],
    process.env.RSDOCTOR === 'true' && [
      'rsdoctor',
      {
        rsdoctorOptions: {
          /* Options */
        },
      },
    ],
    () => {
      return {
        name: 'alias-configuration',
        configureWebpack(config, isServer, utils, content) {
          return {
            resolve: {
              alias: {
                '@tdev-components': path.resolve(__dirname, './src/components'),
                '@tdev-hooks': path.resolve(__dirname, './src/hooks'),
                '@tdev-models': path.resolve(__dirname, './src/models'),
                '@tdev-stores': path.resolve(__dirname, './src/stores'),
                '@tdev-api': path.resolve(__dirname, './src/api'),
                '@tdev': path.resolve(__dirname, './src'),
              }
            }
          }
        }
      }
    },
    () => {
      return {
        name: 'pdfjs-copy-dependencies',
        configureWebpack(config, isServer, {currentBundler}) {
          const Plugin = getCopyPlugin(currentBundler);
            return {
                resolve: {
                  alias: {
                    canvas: false
                  }
                },
                plugins: [
                  new Plugin({
                    patterns: [
                      {
                        from: cMapsDir,
                        to: 'cmaps/'
                      }
                    ]
                  })
                ]
            };
        }
      }
    },
    () => {
      return {
          name: 'excalidraw-config',
          configureWebpack(config, isServer, {currentBundler}) {
            return {
              module: {
                rules: [
                  {
                    test: /\.excalidraw$/,
                    type: 'json',
                  },
                  {
                    test: /\.excalidrawlib$/,
                    type: 'json',
                  }
                ]
              },
              plugins: [
                new currentBundler.instance.DefinePlugin({
                  'process.env.IS_PREACT': JSON.stringify('false')
                }),
              ]
            }
          }
      }
    },
    () => {
      return {
          name: 'yaml-loader-config',
          configureWebpack(config, isServer, {currentBundler}) {
            return {
              module: {
                rules: [
                  {
                    test: /\.ya?ml$/,
                    use: 'yaml-loader'
                  }
                ]
              }
            }
          }
      }
    }
  ],
  themes: [
    [
      themeCodeEditor, 
      {
        brythonSrc: 'https://cdn.jsdelivr.net/npm/brython@3.13.0/brython.min.js',
        brythonStdlibSrc: 'https://cdn.jsdelivr.net/npm/brython@3.13.0/brython_stdlib.js',
        libDir: '/bry-libs/'
      }
    ]
  ],
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
  ],
};

export default config;