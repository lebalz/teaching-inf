---
page_id: 55d68d05-6283-4263-b062-0c3321025478
---

import AccessControlledElement from '@tdev-components/documents/AccessControlledElement';
import BrowserWindow from '@tdev-components/BrowserWindow';

# Zugriffsgesteuerte Elemente

Der Inhalt wird angezeigt, wenn
- der Benutzer eingeloggt ist, und
- entweder Zugriff auf das Dokument hat, oder Admin ist

Ansonsten wird nichts angezeigt.

```md
<AccessControlledElement id="43ba2a38-9612-402f-9daf-91204ff47a71">
Dieser Link wird nur angezeigt, wenn Sie eingeloggt sind und zur Ansicht dieses Dokuments berechtigt sind:

[🔗 https://test.com/nicht-oeffentlicher-link](https://test.com/nicht-oeffentlicher-link)
</AccessControlledElement>
```

<BrowserWindow>
<AccessControlledElement id="43ba2a38-9612-402f-9daf-91204ff47a71">
Dieser Link wird nur angezeigt, wenn Sie eingeloggt sind und zur Ansicht dieses Dokuments berechtigt sind:

[🔗 https://test.com/nicht-oeffentlicher-link](https://test.com/nicht-oeffentlicher-link)
</AccessControlledElement>
</BrowserWindow>

:::warning[Daten sind nicht geheim]
Obwohl das Element im Browser nicht angezeigt wird, ist sein Inhalt dennoch im Seitenquelltext enthalten. Versierte Besucher:innen können diesen also problemlos herausfinden.
:::
