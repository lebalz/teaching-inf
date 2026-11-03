---
name: mdx-docs
description: Create or revise student-facing lessons, exercises, learning objectives, and scored MDX quizzes under docs/ in teaching-inf using tdev components and remark plugins. Use when a teacher requests teaching material or a Quiz based on an existing MDX document; not for developing the Teaching Dev framework.
---

# Teaching material for teaching-inf

Help teachers author material for students at Gymnasium Biel-Seeland. This repository consumes Teaching Dev; lessons teach informatics (and some mathematics), rather than how to develop the framework.

## Find the teaching context first

- Read the complete source document for a document-based task, including exercises, examples, objectives, and relevant linked prerequisites. Inspect neighbouring pages and the topic index to establish level, vocabulary, sequence, and form of address.
- Work in `docs/`: collections include `OF-Programmieren-1`, `OF-Programmieren-2`, `OF-Daten-und-Codes`, `OF-Kryptologie`, `OF-Netzwerke`, `OF-BigData-KI`, `WMS-WINF`, and `Math`. Follow the topic's numbered file/folder convention; lessons use both standalone `.mdx` files and folders with `index.mdx`.
- `sidebars.ts` generates navigation from the directory tree. Preserve frontmatter such as `sidebar_position`, `sidebar_label`, and `sidebar_custom_props.source`; inspect `_category_.yml` before adding categories. Match neighbouring metadata rather than creating a navigation scheme.
- `material.config.yaml` distributes source material to class versions. Author in `docs/`; do not manually change `versioned_docs/`, `versioned_sidebars/`, or run material synchronization merely to write a lesson. Check distribution rules if asked to make material available to a class: an explicitly listed source file may not include a new sibling.
- `docs/Packages/` is generated package documentation, ignored by Git and populated from `packages/`. Use it or the original package docs as a reference, not a lesson destination. `src/`, `packages/tdev/`, and `updateSync/` largely come from upstream via `updateTdev.config.yaml`; ordinary content requests do not require changing them. `website/` holds site-specific components, styles, pages, and Python extensions.

Repository paths here and in references are relative to the repository root unless stated otherwise. Teaching Dev's upstream reference documentation is published at [teaching-dev.gbsl.website](https://teaching-dev.gbsl.website/); its MDX sources are in [GBSL-Informatik/teaching-dev → tdev-website/docs](https://github.com/GBSL-Informatik/teaching-dev/tree/main/tdev-website/docs). Consult these for component usage, concepts, and plugin examples. Those upstream paths are not local paths in this repository. Check examples against the locally installed implementation and site configuration: upstream `main` and the published docs may describe a newer version. See [MDX authoring tools](references/mdx-authoring.md) for lookup guidance.

## Write for learners

- Write in Swiss Standard German: `ss`, proper umlauts, and local mathematical notation. Use the neighbouring lesson's form of address (usually **Sie**). Preserve identifiers, paths, and literal output.
- Explain ideas using established prerequisites, concrete examples, short explanations, and precise terms. Distinguish an analogy from the actual mechanism it illustrates.
- Let the learning goal shape the material: activate an idea, demonstrate it, then provide practice and feedback where useful. Do not force short additions into a full lesson template.
- Make tasks actionable: state the expected result, starting material, and where students record their answer. Scaffold initial practice and offer transfer/extension tasks when appropriate. Do not require knowledge introduced only on later pages.
- Use `:::aufgabe[Title]` for exercises, `:::definition[Title]` for formal concepts, and `:::insight[Title]` or `:::finding[Title]` for key observations. Use tips/warnings sparingly. Keep explanations in prose; use tables for comparisons and definition lists for useful vocabulary.
- Embed the activity students need directly. `CodeShowcase` helps when teaching MDX source itself; normal lessons should show the exercise, editor, or visualisation without framework API exposition.
- Preserve attribution and source metadata. Verify facts and computed answers; do not propagate errors from older lessons. Resolve source errors affecting a quiz's answer key and report them to the teacher.

## Preserve page and answer identity

- Preserve existing `page_id`, persisted component `id`, and explicit quiz `qid` values during edits or moves. These identify saved student work.
- Generate fresh random UUIDv4 values for a new page's `page_id` and each new persisted component's `id`, including copied activities. Use `node -e 'console.log(require("node:crypto").randomUUID())'` or another UUID generator. Never invent UUIDs or reuse IDs from examples.
- Quiz children use local question keys rather than individual UUIDs; read [Scored quizzes](references/quizzes.md) before authoring or changing a quiz. Reordering existing implicitly keyed questions can associate saved answers with different questions.
- Keep assets alongside lessons in the existing `images/`, `img/`, `assets/`, or `files/` convention. Preserve relative links and attribution when moving content.

## Choose the site's existing tools

Read [MDX authoring tools](references/mdx-authoring.md) for exercise/solution patterns, runnable code, directives, media, and the local source map. Use `@tdev-components/...` for components or `@tdev/...` for packages; aliases can resolve site-specific implementations in `website/` before core implementations.

Some components are global in `src/theme/MDXComponents.tsx`, including `Answer`, `Solution`, `TaskState`, `Tabs`, and `TabItem`. Import other components explicitly. Import `Quiz`, `ChoiceAnswer`, and `TrueFalseAnswer` under those exact names: the remark transform recognises them by name.

## Create a quiz from a document

When a teacher asks for a quiz, produce actual MDX material with `Quiz` and explicit scoring. Read [Scored quizzes](references/quizzes.md) for a complete pattern and scoring semantics.

Base questions on the document's learning goals and examples, balancing recall, understanding, and application at the established level. Use plausible misconceptions as distractors; avoid ambiguous alternatives, answer-position clues, and trivia. Follow requested count, difficulty, and placement. Otherwise choose a proportionate set and append it to the source lesson; use a neighbouring quiz page when requested or when that is the topic's established pattern. A separate page should link to the source lesson.

Verify every answer and point allocation. Give the teacher a brief coverage and total-points summary; do not expose the answer key in ordinary student-facing introductory prose. Use feedback shown after assessment to explain answers where useful.

## Validate proportionately

- Check frontmatter, fresh-ID uniqueness, local links/assets, resolved imports, directive nesting, and code-fence closure. Preserve runnable code metadata.
- Compile structural MDX changes with the configured before-default remark, remark, and rehype plugins from `src/siteConfig/markdownPluginConfigs.ts`, including custom admonitions in `docusaurus.config.ts`. A generic Markdown parser misses quiz and live-code transformations.
- Preview layout/interaction changes when feasible. `yarn start:fast OF-Kryptologie` (replace the topic) restricts development docs and excludes archives. Check sidebar reachability. Scoring needs a signed-in document context: the unauthenticated Offline Quiz cannot assess or save answers.
- For quizzes, verify fully correct, partial, wrong, and unanswered responses, maximum total, and reset behaviour. If browser assessment is unavailable, check against the helper/model implementation and state the limitation.
- `format:check` excludes Markdown/MDX. A full `yarn build` has pre/post hooks synchronizing package and class material; prefer focused compilation/preview for content edits, and inspect generated changes if a full build is needed.

Report edited files, teaching purpose, validation performed, and unresolved rendering/scoring limitations. Claim browser preview or successful assessment only when actually checked.
