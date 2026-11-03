# Scored quizzes from lesson content

## Local references

- `docs/Onboarding/03-Quiz.mdx`: student introduction to question types, assessment, resets, randomisation, and points.
- `docs/OF-Kryptologie/05-Kryptoanalyse/10-Fragen.mdx`: existing topic quiz; verify answers independently rather than treating examples as an answer authority.
- `src/components/documents/Assessable/helpers/scoring.tsx`: scoring helpers.
- `src/models/documents/Assessable/`: `AssessableMeta.ts`, `ChoiceAnswer.ts`, `TrueFalseAnswer.ts`, `Quiz.ts`, and `iAssessable.ts` define indexing, misses, inheritance, and totals.
- `src/plugins/remark-transform-assessable-components/plugin.ts` and `tests/plugin.test.ts`: author-facing MDX transformation.
- `src/components/documents/Assessable/Quiz/` and `Feedback/Hint/`: controls, offline behaviour, and conditional feedback.

## Design and syntax

Read the complete source lesson and identify the concepts and operations students should understand. A programming lesson can ask students to trace a program or choose a correction; a concepts lesson can ask them to classify or apply a concept. Keep questions focused and independently answerable.

Use single choice for one selection, `multiple` for selecting every correct alternative, and `TrueFalseAnswer` for an unambiguous proposition. Say «Wählen Sie alle korrekten Aussagen» for multiple choice. Avoid «alle oben genannten», references to option numbers, and dependencies on question order when randomising.

- `Quiz` needs a fresh UUIDv4 `id`. A separate quiz page also needs a fresh `page_id`.
- `ChoiceAnswer` contains a prompt and one direct Markdown list of alternatives. Keep blank lines around that list. The plugin transforms the first direct list into options; additional direct lists can accidentally become options. Use prose or a blockquote for list-like prompts instead.
- `correct={[2]}` means the **second alternative in source order**, starting at **1**. Randomisation does not change the key. Without `multiple`, only one selection is possible even if several indices are accepted; normally specify one correct index.
- Use `multiple correct={[1, 3]}` for multiple choice. Give every multiple-choice question its own `multipleChoicePoints(...)` when the quiz defaults to `points(...)`.
- `TrueFalseAnswer correct={true}` or `correct={false}` wraps a statement with no alternatives list.
- The plugin generates local `qid="q1"`, `qid="q2"`, etc., `questionIds`, `optionsCount`, and option wrappers. Do not hand-write generated wrappers or metadata.
- Meaningful explicit keys such as `qid="list-index"` keep new questions stable through later reordering; these are local strings, not UUIDs. Only use explicit `qid` when explicitly asked to. Otherwise omit `qid` for automatic enumeration. Keys must be unique within a quiz.
- Children inside `Quiz` do not need independent UUID `id` props. Standalone questions outside a quiz need fresh UUIDs.
- When modifying a used quiz with implicit keys, preserve the old effective `q1`, `q2`, etc. by making them explicit before adding/reordering questions. Preserve explicit keys. Give a different task a new key; give a new quiz a new UUID.
- Keep questions directly inside one quiz; do not nest quizzes.

## Scoring

Import helpers from `@tdev-components/documents/Assessable/helpers/scoring`.

| Helper                                                                                 | Meaning                                                                                                                                              | Use                                                             |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `points(forCorrect = 1, forIncorrect = 0, forUnanswered = 0)`                          | Fixed award for correct, wrong, or unanswered responses                                                                                              | Single choice and true/false                                    |
| `multipleChoicePoints(maxPoints, deductionPerWrongChoice, allowNegativeTotal = false)` | Maximum minus a deduction for each incorrectly selected alternative **and each omitted correct alternative**; floor at zero unless negatives enabled | Multiple choice; pass the third argument explicitly for clarity |
| `noPoints()`                                                                           | No points evaluation                                                                                                                                 | Optional unscored item; omit its maximum from the total         |

`Quiz scoring={points(1)}` provides the **default for each question**. A question's own `scoring` overrides it. The quiz sums question maxima and scores; this does not limit the whole quiz to one point. `points()` cannot score multiple-choice decisions and can throw in development when used for them.

For `multipleChoicePoints(2, 1, false)`, `correct={[1, 3]}`, and four alternatives:

| Selected alternatives | Mistakes                                   | Points |
| --------------------- | ------------------------------------------ | ------ |
| 1 and 3               | None                                       | 2      |
| 1 only                | Omitted 3                                  | 1      |
| 1, 2 and 3            | Incorrectly selected 2                     | 1      |
| 2 and 4               | Two incorrect selections and two omissions | 0      |
| None                  | Two omissions                              | 0      |

Check unanswered cases against the model: for a nonempty correct set, `ChoiceAnswer.misses` includes omitted correct answers even when nothing is selected. Leaving a multiple-choice question blank does not always give zero: `multipleChoicePoints(3, 1, false)` with two correct alternatives yields **1 point** for no selections. Choose maxima/deductions deliberately, normally ensuring blank answers earn zero, and explain the rule in the intro. Use negative scores only when requested or pedagogically justified and disclosed. `minPoints` is a lower bound on quiz total, not a pass mark.

## Complete MDX pattern

This assumes the source lesson introduced Python lists and zero-based indexing. Replace both UUID placeholders with generated UUIDv4 values before writing a real page. Adapt the questions to the actual document. Maximum: **4 points** (1 + 2 + 1).

```mdx
---
page_id: REPLACE_WITH_NEW_PAGE_UUID
sidebar_label: Quiz zu Listen
---

import Quiz from '@tdev-components/documents/Assessable/Quiz';
import ChoiceAnswer from '@tdev-components/documents/Assessable/ChoiceAnswer';
import TrueFalseAnswer from '@tdev-components/documents/Assessable/TrueFalseAnswer';
import Hint from '@tdev-components/documents/Assessable/Feedback/Hint';
import { points, multipleChoicePoints } from '@tdev-components/documents/Assessable/helpers/scoring';

# Quiz zu Listen

Prüfen Sie Ihr Verständnis der Listen. Sie können höchstens **4 Punkte** erreichen.
Bei Mehrfachauswahl gibt es pro falsch ausgewählter oder ausgelassener korrekter
Antwort 1 Punkt Abzug, höchstens bis auf 0 Punkte. Beenden Sie das Quiz, um Ihre
Antworten auszuwerten. Anschliessend können Sie es zurücksetzen und erneut lösen.

<Quiz id="REPLACE_WITH_NEW_QUIZ_UUID" scoring={points(1)} resetMode="all">

<ChoiceAnswer qid="erstes-element" correct={[2]}>
Welcher Ausdruck liefert das erste Element von `noten = [4.5, 5, 6]`?

1. `noten[1]`
2. `noten[0]`
3. `noten[3]`

<Hint when="assessed">
Der erste Listenindex ist 0. `noten[0]` liefert deshalb `4.5`.
</Hint>
</ChoiceAnswer>

<ChoiceAnswer qid="indizes" multiple correct={[1, 3]} scoring={multipleChoicePoints(2, 1, false)}>
Gegeben ist `noten = [4.5, 5, 6]`. Wählen Sie alle korrekten Aussagen.

1. Die Liste enthält drei Elemente.
2. Der letzte gültige Index ist 3.
3. `noten[1]` liefert `5`.
4. `noten[0]` liefert `6`.

<Hint when="assessed">
Die Indizes sind 0, 1 und 2. Das Element mit Index 1 hat den Wert `5`.
</Hint>
</ChoiceAnswer>

<TrueFalseAnswer qid="laenge" correct={false}>
Der letzte gültige Index einer nicht leeren Python-Liste ist gleich ihrer Länge.

<Hint when="assessed">
Der letzte gültige Index ist die Länge minus 1.
</Hint>
</TrueFalseAnswer>

</Quiz>
```

When appending to a lesson, keep its frontmatter and add only missing imports, the heading/intro, and quiz. For a separate page, link to the actual source using its correct relative path.

## Behaviour and verification

`randomizeQuestions` and `randomizeOptions` are optional: use only with order-independent content. `resetMode` accepts `all` (default), `incorrect`, or `noReset`; choose for the practice/assessment intent. `shuffleOnReset` is available when reshuffling is wanted. `keepExpanded` accepts `all`, `correct`, `selected`, or `none` for post-assessment option display.

In a normal signed-in quiz, students submit the whole quiz rather than individual questions. Assessed answers are locked until a permitted reset. `Hint when="assessed"` inside a question shows explanatory feedback after assessment. The Offline Quiz cannot save or assess answers; a logged-out preview is not a scoring test.

Before delivering, check source coverage, every 1-based answer index/boolean, multiple-choice overrides, blank/wrong/partial/full-credit cases, and the sum of maxima. Check submission, feedback, and reset in a suitable document context when available. Keep the teacher's answer/coverage notes separate from ordinary student-facing prose.
