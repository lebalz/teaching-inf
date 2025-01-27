# Teaching Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

> [!NOTE]
> Compatible with @docusaurus/faster (rspack and swc).

## ENV

| Variable                   | For         | Default                 | Example             | Description                                                                                                                                                        |
| :------------------------- | :---------- | :---------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| APP\_URL                   | Production  | `http://localhost:3000` |                     | Domain of the hosted app                                                                                                                                           |
| BACKEND\_URL               | Production  | `http://localhost:3002` |                     | Url of the API Endpoint                                                                                                                                            |
| CLIENT\_ID                 | Production  |                         |                     | Azure ID: Client ID                                                                                                                                                |
| TENANT\_ID                 | Production  |                         |                     | Azure AD: Tenant Id                                                                                                                                                |
| API\_URI                   | Production  |                         |                     | Azure AD: API Url                                                                                                                                                  |
| STUDENT\_USERNAME\_PATTERN | Production  |                         | `@edu`              | Users with usernames matching this RegExp pattern are displayed as students (regardless of admin status). If unset, all non-admin users are displayed as students. |
| TEST\_USERNAME             | Development |                         | `admin.bar@bazz.ch` | To log in offline. Must correspond to a user email found in the API's database.\*                                                                                  |

\* To change users, clear LocalStorage to delete the API key created upon first authentication.<br />

## Reveal.js

```bash
git submodule add https://github.com/hakimel/reveal.js.git static/p/reveal.js
# install gulp as dependency - not the latest version because of esm restrictions
yarn add --dev gulp@^4.0.2 gulp-connect@^5.7.0
# present reveal.js
yarn present
```

## Upgrade Docusaurus

To upgrade docusaurus, run:

```bash
yarn upgrade @docusaurus/core@latest @docusaurus/faster@latest @docusaurus/preset-classic@latest @docusaurus/theme-classic@latest @docusaurus/theme-common@latest @docusaurus/module-type-aliases@latest @docusaurus/plugin-rsdoctor@latest @docusaurus/tsconfig@latest @docusaurus/types@latest
```