import { PluginOptions } from "@docusaurus/types";

export interface SiteConfig {
    title: string; // The title of the site.
    tagline: string; // The tagline of the site.
    url: string; // The base URL of the site.
    baseUrl: string; //The /<baseUrl>/ pathname under which your site is served. For GitHub pages deployment, it is often '/<projectName>/'.
    siteStyles: string[]; // Paths to CSS files to be included in the site. Loaded in order, after custom.scss.
    favicon: string; // The path to the favicon of the site (relative to /static).
    logo: string; // The path to the logo of the site (relative to /static).
    socialCard: string; // The path to the social card image (relative to /static).
    defaultLocale: string; // The default locale of the site.
    locales: string[]; // The locales supported by the site.
    beforeDefaultRemarkPlugins: PluginOptions[]; // List of plugins to be loaded before the default remark plugins.
    remarkPlugins: PluginOptions[]; // List of remark plugins to be loaded.
    rehypePlugins: PluginOptions[]; // List of rehype plugins to be loaded.
    gitHub: {
        orgName: string; // The name of the GitHub user / organization.
        projectName: string; // The name of the GitHub project.
    }
    siteStores: {[key: string]: iStore} // Made available under useStore('siteStore').myKey (TODO: Can we include a type here and have some sort of type map?)
    transformers: {[key: string]: (current: T) => T};
}

export type SiteConfigProvider = () => Partial<SiteConfig>;

/*
TOOD:
- Navbar items
- Footer items
- Stores ()
*/