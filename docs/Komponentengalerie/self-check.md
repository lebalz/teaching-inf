---
page_id: f632a479-cfe4-4a98-848a-a0dd0e0f6535
---

import SelfCheckTaskState from '@tdev-components/documents/SelfCheck/SelfCheckTaskState';
import SelfCheckContent from '@tdev-components/documents/SelfCheck/SelfCheckContent';
import SelfCheck from '@tdev-components/documents/SelfCheck';
import { SelfCheckStateType } from '@tdev-components/documents/SelfCheck/models';
import Solution from '@tdev-components/documents/Solution';
import BrowserWindow from '@tdev-components/BrowserWindow';

# Selfcheck

<BrowserWindow>
<SelfCheck taskStateId="df3313a5-c18f-4220-9dfe-cf4314c1b7b9" solutionId="e92b6f49-396e-48bc-8a6c-4ca94947210d">
:::note[1. Aufgabe]
<SelfCheckTaskState />

Erstelle eine Lösung für die Aufgabe.

<SelfCheckContent>
<Solution id="e92b6f49-396e-48bc-8a6c-4ca94947210d">
Hallo Welt 🌍
</Solution>
</SelfCheckContent>
:::

<SelfCheckContent alwaysVisibleForTeacher={false} visibleTo={SelfCheckStateType.WaitingForSolution}>
:::warning[Auf Musterlösung warten]
Die Lehrperson wird dir die Musterlösung bald freischalten.
:::
</SelfCheckContent>

<SelfCheckContent alwaysVisibleForTeacher={false} visibleFrom={SelfCheckStateType.Reviewing}>
:::warning[Selbstständig korrigieren]
Vergleiche deine Lösung nun mit der Musterlösung und korrigiere deine Antwort.
:::
</SelfCheckContent>

<SelfCheckContent alwaysVisibleForTeacher={false} visibleFrom={SelfCheckStateType.Question} visibleTo={SelfCheckStateType.Question}>
:::warning[Frage?]
Wenn du während des Unterrichts eine Frage hast, dann kannst du jederzeit die Lehrperson rufen.
:::
</SelfCheckContent>
</SelfCheck>
</BrowserWindow>
