---
page_id: f632a479-cfe4-4a98-848a-a0dd0e0f6535
---

import SelfCheckTaskState from '@tdev-components/documents/SelfCheck/SelfCheckTaskState';
import SelfCheckContainer from '@tdev-components/documents/SelfCheck/SelfCheckContainer';
import { SelfCheckStateType } from '@tdev-components/documents/SelfCheck/shared';
import Solution from '@tdev-components/documents/Solution';
import BrowserWindow from '@tdev-components/BrowserWindow';

# Selfcheck

<BrowserWindow>
:::note[1. Aufgabe]
<SelfCheckTaskState id="df3313a5-c18f-4220-9dfe-cf4314c1b7b9" solutionId="e92b6f49-396e-48bc-8a6c-4ca94947210d">
</SelfCheckTaskState>

Erstelle eine Lösung für die Aufgabe.

<SelfCheckContainer taskStateId="df3313a5-c18f-4220-9dfe-cf4314c1b7b9">
<Solution id="e92b6f49-396e-48bc-8a6c-4ca94947210d">
Hallo Welt 🌍
</Solution>
</SelfCheckContainer>
:::

<SelfCheckContainer
taskStateId="df3313a5-c18f-4220-9dfe-cf4314c1b7b9"
alwaysVisibleForTeacher={false}
visibleTo={SelfCheckStateType.WAITING_FOR_SOLUTION}>
:::warning[Auf Musterlösung warten]
Die Lehrperson wird dir die Musterlösung bald freischalten.
:::
</SelfCheckContainer>

<SelfCheckContainer
    taskStateId="df3313a5-c18f-4220-9dfe-cf4314c1b7b9"
    alwaysVisibleForTeacher={false}
    visibleFrom={SelfCheckStateType.REVIEWING_SOLUTION}>
:::warning[Selbstständig korrigieren]
Vergleiche deine Lösung nun mit der Musterlösung und korrigiere deine Antwort.
:::
</SelfCheckContainer>


<SelfCheckContainer taskStateId="df3313a5-c18f-4220-9dfe-cf4314c1b7b9"
    alwaysVisibleForTeacher={false}
    visibleFrom={SelfCheckStateType.QUESTION}
    visibleTo={SelfCheckStateType.QUESTION}>
:::warning[Frage?]
Wenn du während des Unterrichts eine Frage hast, dann kannst du jederzeit die Lehrperson rufen.
:::
</SelfCheckContainer>
</BrowserWindow>
