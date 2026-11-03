# Local MDX authoring tools

## Find syntax and implementations

The upstream reference is [Teaching Dev documentation](https://teaching-dev.gbsl.website/). Its editable MDX sources live in [tdev-website/docs on GitHub](https://github.com/GBSL-Informatik/teaching-dev/tree/main/tdev-website/docs), with component and Markdown/plugin examples in the [gallery](https://github.com/GBSL-Informatik/teaching-dev/tree/main/tdev-website/docs/gallery). Use the rendered reference for usage and the MDX source to see exact imports, directives, code-fence metadata, and component nesting. Browse the actual directory before constructing a deeper link. If the published site is unavailable, use the GitHub sources.

These are external framework references; this repository's `docs/` contains the teaching material. Upstream `main` and the published site may differ from the version synchronized here. Resolve discrepancies using the local component implementation, enabled plugins, and site-specific overrides; do not upgrade the framework merely to match an upstream example.

`src/siteConfig/markdownPluginConfigs.ts` defines remark/rehype transformations; `docusaurus.config.ts` registers custom admonitions. Read the relevant plugin and `tests/plugin.test.ts` under `src/plugins/` for advanced syntax. Package plugins live under `packages/tdev/` with their own docs/tests. This site has no upstream `tdev-website/docs/gallery/` tree.

`src/theme/MDXComponents.tsx` provides global components. Check `website/components/` before `src/components/` for imports through `@tdev-components/...`, and `website/pyodide/` for site-specific Python activities. Reuse interactive visualisations that support the goal rather than rebuilding them in lesson JSX.

Useful lesson examples:

- `docs/OF-Kryptologie/01-Grundbegriffe.mdx`: concepts, formulas, definitions, answer fields, and solutions.
- `docs/OF-Daten-und-Codes/05-UTF8/index.mdx`: tables, decoder, and practical coding exercise.
- `docs/OF-Programmieren-1/07-Variablen/index.mdx`: programming concepts and live Python exercises.
- `docs/OF-Netzwerke/03-DNS/index.mdx`: objectives, diagrams, OS-specific instructions, and tasks.

These establish conventions, not infallible facts or IDs to copy.

## Exercises, answers, and solutions

Use `Answer type="state"` for completion and `Answer type="text"` for written responses; add the controls the activity needs. `TaskState` also tracks progress. `Solution` holds a model solution with the site's solution controls; inspect its implementation before changing visibility behaviour.

Generate a separate UUIDv4 for each placeholder in this pattern:

````mdx
::::aufgabe[Programm erklären]
<Answer type="state" id="NEW_STATE_UUID" />

Welche Ausgabe erzeugt das Programm? Begründen Sie Ihre Antwort.

```py
werte = [2, 4, 6]
print(werte[1])
```

<Answer type="text" id="NEW_ANSWER_UUID" />

<Solution id="NEW_SOLUTION_UUID">
Die Ausgabe ist `4`, da die Indizierung bei 0 beginnt.
</Solution>
::::
````

## Runnable code

- Preserve fence language, runtime, `id`, and metadata unless a runtime change is requested. Lessons commonly use `py live_py` (Brython); Pyodide uses `py live_pyo`. Check library and extension support before choosing a runtime.
- Persisted student editors need fresh UUID metadata: `py live_py id=UUID` or `py live_pyo id=UUID`. Match a nearby working editor for options. Short nonpersistent demonstrations often use `slim`.
- See `packages/tdev/pyodide-code/docs/README.mdx` for Pyodide examples and `packages/tdev/brython-code/` for Brython. Browser Python is not unrestricted local Python.
- The markdown configuration extracts fenced code for `Pyodide`, `HtmlIDE`, `HtmlEditor`, `SvgEditor`, and others. Preserve working child-code patterns rather than guessing props or stripping metadata.

## Directives and presentation

| Purpose                 | Syntax / local source                                                                              |
| ----------------------- | -------------------------------------------------------------------------------------------------- |
| Exercise                | `:::aufgabe[Title]` with activity content and appropriate answer/progress controls                 |
| Definition / insight    | `:::definition[Title]`, `:::insight[Title]`, `:::finding[Title]`                                   |
| Code definition box     | `:::def[Title]`; `src/plugins/remark-code-defbox/`                                                 |
| Collapsible explanation | `:::details[Title]`; `src/plugins/remark-details/`                                                 |
| Cards / flex            | `:::cards` or `:::flex`, `::br` between items; `src/plugins/remark-flex-cards/`                    |
| Definition list         | Term on its own line then `: Definition`; `:::dd` for block content; `src/plugins/remark-deflist/` |
| Keyboard shortcut       | `[[Ctrl]] + [[C]]`; `src/plugins/remark-kbd/`                                                      |
| Icon                    | `:mdi[arrow-right]`; `src/plugins/remark-mdi/`                                                   |
| Boxed emphasis          | `__text__` is boxed by `remark-strong`; `**text**` is ordinary bold                                |
| File tree               | `:::tree` with a list; inspect `src/plugins/remark-file-trees/` for attributes                     |
| Mathematics             | `$...$` inline, `$$...$$` display; remark-math and KaTeX                                           |
| Diagrams                | Mermaid fences, or Graphviz via `packages/tdev/remark-graphviz/`                                   |

Use longer outer directive fences when nesting, e.g. `::::aufgabe` around `:::details`. Keep blank lines around Markdown blocks inside JSX. Escape literal braces and angle brackets when MDX would interpret them as expressions/tags. Close code fences explicitly.

Import `Steps` from `@tdev-components/Steps` for user-action sequences benefiting from step styling. Use ordinary lists for enumerations, algorithms, and quiz alternatives. For OS instructions, import `OsTabs` from `@tdev-components/OsTabs` and follow local examples with global `TabItem`.

## Images, media, and links

- Image alt text becomes the displayed caption. Sizing uses e.g. `![Caption --width=600px](images/example.png)`; inspect `src/plugins/remark-images/` for supported sizing/inline options.
- Attribution can come from adjacent JSON with the image basename. Preserve it; use a neighbouring JSON and the plugin as the schema reference.
- Prefer relative links to local source lessons/assets. Current docs are served at the site root (`routeBasePath: '/'`); do not assume a `/docs/` URL prefix or rename files solely to adjust displayed titles.
- Inspect `src/plugins/remark-media/` and `packages/tdev/remark-pdf/` for exact media/PDF syntax. External embeds should support the lesson and follow existing conventions.
