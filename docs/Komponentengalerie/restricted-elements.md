---
page_id: 55d68d05-6283-4263-b062-0c3321025478
---

import Restricted from '@tdev-components/documents/Restricted';
import BrowserWindow from '@tdev-components/BrowserWindow';

# Zugriffsbeschränkte Elemente

Wenn ein Element nur nach einer Freigabe angezeigt werden soll, eignet sich die `<Restricted>`-Komponente - sie versteckt ihren Inhalt, bis er freigegeben wurde.

```md
<Restricted id="43ba2a38-9612-402f-9daf-91204ff47a71">
Dieser Link wird nur bei entsprechender Berechtigung angezeigt:

[🔗 https://test.com/nicht-oeffentlicher-link](https://test.com/nicht-oeffentlicher-link)
</Restricted>
```

<BrowserWindow>
<Restricted id="43ba2a38-9612-402f-9daf-91204ff47a71">
Dieser Link wird nur bei entsprechender Berechtigung angezeigt:

[🔗 https://test.com/nicht-oeffentlicher-link](https://test.com/nicht-oeffentlicher-link)
</Restricted>
</BrowserWindow>

:::warning[Inhalt ist nicht geheim]
Obwohl der zugriffsbeschränkte Inhalt bei fehlender Berechtigung nicht im Browser angezeigt wird, ist er dennoch im Seitenquelltext enthalten. Versierte Nutzer:innen können also trotzdem darauf zugreifen.
:::
