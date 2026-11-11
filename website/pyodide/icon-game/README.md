# Icon-Spiel

Voraussetzung ist eine Teaching-Dev-Website mit installiertem `pyodide-code`-Package und `webio.gameloop`. Kopiere diesen vollständigen Ordner nach `website/pyodide/icon-game` und ergänze im vorhandenen Pyodide-Plugin die `extensions`-Liste:

```ts
extensions: [
    './website/pyodide/icon-game'
]
```

Starte den Entwicklungsserver neu. Der Browser-Store wird automatisch angelegt.

## Im Unterrichtsmaterial verwenden

```mdx
import IconGame from '@tdev/pyodide/icon-game/src/components/IconGame';

<IconGame sceneId="snowfall" />
```

```python
from icon_game import use_scene
from webio import gameloop, run

scene = use_scene('snowfall')
scene.configure(width=400, height=800, background_color='black')
scene.add_icon('mdiSnowflake', 200, 0, 12, speed_y=80, color='lightblue', rotation=30)
scene.add_icon('mdiCircle', 200, 400, 6, color='#ff8800')

@gameloop(fps=30, sources=[scene])
def update(ctx):
    for snowflake in scene.icons:
        if snowflake.name_short != 'snowflake':
            continue
        snowflake.x += snowflake.speed_x * ctx.dt
        snowflake.y += snowflake.speed_y * ctx.dt
        snowflake.rotation += 45 * ctx.dt
        if snowflake.y > scene.height:
            scene.remove_icon(snowflake)
    scene.render()

await run()
```

`ctx.dt` ist die seit dem letzten Frame verstrichene Zeit in Sekunden. `render()` überträgt den aktuellen Zustand als eine Nachricht an die Anzeige. Änderungen an Icons werden bis dahin nur im Worker gespeichert.

`configure(show_fps=False)`
: Blendet die kleine FPS-Anzeige oben rechts aus; mit `show_fps=True` wird sie wieder eingeblendet. Standard: `True`. Die Anzeige misst die Aufrufe von `scene.render()` im Worker über ungefähr eine halbe Sekunde. Die Einstellung wird mit dem nächsten `scene.render()` sichtbar. Ohne laufendes Programm zeigt die Anzeige `0 FPS`.

`scene.add_icon(name, x=width/2, y=height/2, size=width*0.1, color='white', speed_x=0, speed_y=0, rotation=0)`
: Erzeugt ein MDI-Icon mit Mittelpunkt `(x, y)` und halber Symbolgrösse `size`. `name` unterstützt Camel-Case und Dash-Case mit oder ohne MDI-Präfix: `'mdiAlarmPlus'`, `'alarmPlus'`, `'mdi-alarm-plus'` und `'alarm-plus'` ergeben dasselbe Icon. Das gilt auch beim Ändern von `icon.name`; der Handle behält die eingegebene Schreibweise. Unbekannte Namen werden abgewiesen. `color`, `speed_x`, `speed_y` und `rotation` sind benannte Argumente.
`scene.add_icon('alarm-plus')`
: Ohne Positions- und Grössenangaben liegt das Icon in der Mitte der aktuellen Szene: `x = scene.width / 2`, `y = scene.height / 2`, `size = scene.width * 0.1`. `size` bleibt die halbe Symbolgrösse. Die Standardwerte werden beim Hinzufügen berechnet; spätere Änderungen der Szenengrösse verändern bestehende Icons nicht.
`icon.name`, `icon.x`, `icon.y`, `icon.size`, `icon.speed_x`, `icon.speed_y`, `icon.color`, `icon.rotation`
: Veränderbare Eigenschaften eines Handles. `rotation` ist die Drehung in Grad um die Mitte, positiv im Uhrzeigersinn; Standard ist `0`. Negative Werte und Werte über `360` sind erlaubt, sofern sie endlich sind. Bewegung und Drehung werden im Python-Code aktualisiert.
`icon.size`
: Veränderbare halbe Symbolgrösse in Pixeln. Mit `icon.size += 2 * ctx.dt` wächst das Icon in der Update-Funktion. Die Grösse muss positiv und endlich bleiben; `scene.render()` zeigt die Änderung an.
`icon.name_short`
: Schreibgeschützter Name in Dash-Case ohne MDI-Präfix, beispielsweise `'alarm-plus'`. Wird aus `icon.name` abgeleitet und passt sich bei Namensänderungen automatisch an.
`speed_x`, `speed_y`
: Veränderbare Geschwindigkeiten in Pixeln pro Sekunde; beide standardmässig `0`. Positive Werte zeigen nach rechts bzw. unten. Der Python-Code aktualisiert `x` und `y` mit der jeweiligen Geschwindigkeit und `ctx.dt`.
`scene.icons`
: Momentaufnahme der Handles. Während der Iteration können Elemente entfernt werden. Später hinzugefügte Icons werden über früheren gezeichnet.
`scene.remove_icon(icon)`
: Entfernt den angegebenen Handle aus der Szene.
`scene.reset()`
: Entfernt alle Icons und behält die Szenenkonfiguration.
`scene.render()`
: Überträgt Symbolnamen, Positionen, Grössen, Drehungen und CSS-Farben gemeinsam an die Anzeige.

Punkte werden mit `scene.add_icon('mdiCircle', x, y, size)` erstellt. Ein Symbol lässt sich beispielsweise mit `icon.name = 'mdiRocketLaunch'` ändern; `icon.rotation = 90` dreht es. Änderungen werden beim nächsten `scene.render()` sichtbar.

`was_clicked(ctx)`
: Liefert den letzten Klick auf eine Icon-Szene im aktuellen Frame oder `None`, wenn nicht geklickt wurde. Der Klick enthält die Szenenkoordinaten in `click.x` und `click.y`. Import: `from icon_game import was_clicked`.

```py
@gameloop(fps=30, sources=[scene])
def update(ctx):
    click = was_clicked(ctx)
    if click:
        scene.add_icon('mdiStar', click.x, click.y, 10)
    scene.render()
```

Klickereignisse enthalten `x` und `y` im `payload`, bereits in die konfigurierten Szenenkoordinaten umgerechnet. Das SVG passt sich schmalen Fenstern an. Mehrere Ansichten derselben `sceneId` teilen ihren Zustand.
