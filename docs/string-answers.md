import String from '@site/src/components/documents/String';

# String Answers

```md
<String id="c9c2ecab-98b0-4696-b44a-8fdf79b8daac" />
```

<String id="c9c2ecab-98b0-4696-b44a-8fdf79b8daac" />

## Label

```md
<String id="0c63f1d6-fbd7-42f5-a553-4e3716355083" label="Aufgabe 1"/>
```

<String id="0c63f1d6-fbd7-42f5-a553-4e3716355083" label="Aufgabe 1"/>

## Platzhalter
```md
<String id="4612436b-b10e-4e6d-9a40-ea04f701bf87" placeholder="Eine Zahl" />
```
<String id="4612436b-b10e-4e6d-9a40-ea04f701bf87" placeholder="Eine Zahl" />

## Standardwert
```md
<String id="1218a15f-094d-44e9-b5e1-51108d5532a1" default="Hello World"/>
```
<String id="1218a15f-094d-44e9-b5e1-51108d5532a1" default="Hello World"/>

## Lösung
Es können auch Lösungen hinterlegt werden um die Eingabe zu überprüfen. Durch einen Klick auf den Button (alternativ mit [[ctrl + :mdi[keyboard-return]]] bzw. [[cmd + :mdi[keyboard-return]]]) wird die Eingabe überprüft.

<String solution="Lösung" placeholder="Die Lösung ist 'Lösung'" id="6970d5f8-0015-40a8-97d4-e576dd1b4b3c"/>

### Textlösung
```md
<String id="a1eb0082-4eb1-4247-8448-ca971ac02238" solution="Hello"/>
```
<String id="a1eb0082-4eb1-4247-8448-ca971ac02238" solution="Hello"/>

:::warning[Beachte Exakte Übereinstimmung]
Hier muss alles exakt übereinstimmen - inkl. Gross- und Kleinschreibung, Leerzeichen, etc.
:::

### Lösung vorbereiten
Die eingebene Lösung wird vor der Überprüfung vorbereitet. Dies kann z.B. genutzt werden um alle Zeichen zu entfernen, die nicht Buchstaben sind.
```md
<String id="cd49abd7-e957-49b5-b262-600f98c96b5d" solution="Hello World" sanitizer={(val) => val.toLowerCase().replace(/[^a-zA-Z]/g, '')} />
```
<String id="cd49abd7-e957-49b5-b262-600f98c96b5d" solution="Hello World" sanitizer={(val) => val.toLowerCase().replace(/[^a-zA-Z]/g, '')} />

:::info[Beachte]
Nun funktioniert auch die Eingabe __HELLO WORLD!__ oder __hello world.__ oder __h e l l o w o r l d__.
:::


## Temporäre Komponente (nicht persistiert)

Ohne `id` wird der Zustand nicht gespeichert, was mit einem :mdi[flash-triangle-outline]{.orange} markiert wird.

```md
<String />
```

<String />