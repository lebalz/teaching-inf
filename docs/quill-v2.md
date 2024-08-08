import QuillV2 from '@site/src/components/documents/QuillV2';


# Quill V2: Text Documents

Mit Quill lassen sich einfache, formatierte Texteingaben erstellen. Die Eingabe kann dabei beliebig formatiert werden. Es stehen die beiden Themes `snow` und `bubble` zur Verfügung.

Standardmässig wird das `snow` Theme verwendet.
```md
<QuillV2 id="d20ee4cf-537a-4a21-91e3-25f5e88339ff" />
```
<QuillV2 id="d20ee4cf-537a-4a21-91e3-25f5e88339ff" />

Wahlweise kann auch das `bubble` Theme verwendet werden.
```md
<QuillV2 theme="bubble" id="c927c357-4898-4d0c-9878-df0c0100abb3"/>
```
<QuillV2 theme="bubble" id="c927c357-4898-4d0c-9878-df0c0100abb3"/>

## Toolbar anpassen
Die Toolbar kann angepasst werden, indem die gewünschten Buttons definiert werden. Die Buttons können dabei in Gruppen zusammengefasst werden.

Es sind folgende Optionen verfügbar:
- `bold`
- `italic`
- `underline`
- `h1`
- `h2`
- `h3`
- `color`
- `background`
- `ul`
- `ol`
- `code`
- `image`

Beispiel:

```md
<QuillV2 toolbar={{image: true, code: true}} id="05551c8e-cecb-4446-8338-65dac7e6c711" />
```
<QuillV2 toolbar={{image: true, code: true}} id="05551c8e-cecb-4446-8338-65dac7e6c711" />



:::info[Dependencies]
```json
{
  "dependencies": {
    "heic2any": "^0.0.4",
    "react-quilljs": "^2.0.4",
    "@botom/quill-resize-module": "^2.0.1"
  }
}
```
:::