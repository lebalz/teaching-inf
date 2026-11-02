# LED

Voraussetzung ist eine Teaching-Dev-Website mit installiertem `pyodide-code`-Package. Kopiere diesen vollständigen Ordner nach `website/pyodide/LED` und ergänze im vorhandenen Pyodide-Plugin die `extensions`-Liste:

```ts
extensions: [
    './website/pyodide/LED'
]
```

Starte den Entwicklungsserver neu. Der Browser-Store wird automatisch angelegt; Änderungen am `SiteStore` sind nicht nötig.

## Im Unterrichtsmaterial verwenden

```mdx
import LED from '@tdev/pyodide/led_control/src/components/LED';

<LED ledId="meine-led" />
```

```python
from led_control import use_led

led = use_led('meine-led')
led.set_hsl(hue=120, saturation=100, brightness=50)
```