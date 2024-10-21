---
sidebar_custom_props:
  id: 7bba8b20-4c82-4fa7-a0de-a3a428423e20
page_id: 7bba8b20-4c82-4fa7-a0de-a3a428423e20
---

# Schlüsselwörter in Python

## Schlüsselwörter

Python kennt `35` **Schlüsselwörter**, sie sind im folgenden aufgelistet.

<div className="small-table no-table-header">

|          |            |           |            |          |
| :------- | :--------- | :-------- | :--------- | :------- |
| `False`  | `await`    | `else`    | `import`   | `pass`   |
| `None`   | `break`    | `except`  | `in`       | `raise`  |
| `True`   | `class`    | `finally` | `is`       | `return` |
| `and`    | `continue` | `for`     | `lambda`   | `try`    |
| `as`     | `def`      | `from`    | `nonlocal` | `while`  |
| `assert` | `del`      | `global`  | `not`      | `with`   |
| `async`  | `elif`     | `if`      | `or`       | `yield`  |

</div>

:::danger[Achtung]
Diese Schlüsselwörter sollten **nicht** als Namen für eine Variable oder für ein Unterprogramm verwendet werden.
:::
## Spezielle Zeichen in Python:

### Feldtrenner (_delimiter_)

<div className="small-table no-table-header">

|      |      |      |      |       |       |       |
| :--- | :--- | :--- | :--- | :---- | :---- | :---- |
| `(`  | `)`  | `[`  | `]`  | `{`   | `}`   |       |
| `,`  | `:`  | `.`  | `;`  | `@`   | `=`   | `->`  |
| `+=` | `-=` | `*=` | `/=` | `//=` | `%=`  | `@=`  |
| `&=` | `    | =`   | `^=` | `>>=` | `<<=` | `**=` |

</div>

### Zeichen mit spezieller Bedeutung

- `'` Markiert einen Texte
- `"` Markiert einen Texte
- `#` Kommentar
- `\` Spezielles Steuerzeichen, bspw. um eine **n**eue Zeile zu machen: `\n`  
  ```py live_py slim
  print('Zeile 1\nZeile 2')
  ```
- `%` der Modulo-Operator - er gibt den ganzzahligen Rest einer Division zurück

### Operatoren

<div className="small-table no-table-header">

|      |      |      |      |      |      |      |     |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | --- |
| `+`  | `-`  | `*`  | `**` | `/`  | `//` | `%`  |     |
| `<<` | `>>` | `&`  | `    | `    | `^`  | `~`  | `@` |
| `<`  | `>`  | `<=` | `>=` | `==` | `!=` | `:=` |     |

</div>
