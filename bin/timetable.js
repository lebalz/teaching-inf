const moment = require('moment');
const fs = require('fs');
const path = require('path');

const DAYS = {
    mo: 'Moday',
    di: 'Tuesday',
    mi: 'Wednesday',
    do: 'Thursday',
    fr: 'Friday',
    sa: 'Saturday',
    so: 'Sunday'
};
// 30.6.2022 Notenschluss
const EVENTS = {
    [40]: { desc: 'Kennenlernwoche GYM1', type: 'holiday', icon: 'mdiWalletTravel' },
    [41]: { desc: 'Herbstferien', details: '🏝️🏖️🏖️😎', type: 'holiday' },
    [42]: { desc: 'Herbstferien', details: '🏝️🏖️🏖️😎', type: 'holiday' },
    [52]: { desc: 'Winterferien', details: '🏂❄️⛷️🎄🧑‍🎄', icon: 'mdiPineTreeVariantOutline', type: 'holiday' },
    [1]: { desc: 'Winterferien', details: '🏂❄️⛷️🎄🧑‍🎄', icon: 'mdiPineTreeVariantOutline', type: 'holiday' },
    [7]: { desc: 'Sportwoche', type: 'holiday' }
};
const CLASS_EVENTS = {
    ['29Ga-HK']: {
        [6]: { desc: 'Programmieren 1', details: 'Test', type: 'test', date: '04.02.2026' }
    },
    ['29Gj-HK']: {
        [6]: { desc: 'Programmieren 1', details: 'Test', type: 'test', date: '04.02.2026' }
    },
    ['29Ga']: {
        [46]: { desc: 'Informatik Biber', details: 'Wettbewerb', type: 'event', date: '11.11.2025' },
        [6]: { desc: 'Programmieren 1', details: 'Test', type: 'test', date: '04.02.2026' }
    },
    ['29Gj']: {
        [46]: { desc: 'Informatik Biber', details: 'Wettbewerb', type: 'event', date: '12.11.2025' },
        [49]: {
            desc: 'Kantonaler Fachschaftstag',
            details: 'Auftrag Studienwahl',
            type: 'holiday',
            icon: 'mdiSleep',
            date: '02.12.2025'
        },
        [6]: { desc: 'Programmieren 1', details: 'Test', type: 'test', date: '04.02.2026' }
    }
};

SCHOOL_EVENTS = {
    [42]: { desc: 'Beginn BYOD-Tests', type: 'test', date: '14.10.2025' },
    [5]: { desc: 'Notenschluss', type: 'event', date: '22.01.2026', icon: 'mdiFlagCheckered' },
    [6]: { desc: 'Beginn Semester 2', type: 'event', date: '02.02.2026', icon: 'mdiRun' }
    // [51]: [
    //     { desc: 'Weihnachtskonzert', type: 'holiday', date: '20.12.2024' }
    // ],
    // [4]: { desc: 'Notenschluss', type: 'event', date: '23.01.2025' }
};

const CLASS_DAY = {
    ['29Ga']: 'di',
    ['29Gj']: 'mi',
    ['29Ga-HK']: 'mi',
    ['29Gj-HK']: 'mi'
};
const YEAR = 2025;
const SEMESTER = 'HS';

const SCHEDULE_GYM1_HS = [
    ['Einstieg', 'Informatik, BYOD'],
    ['ICT', 'BYOD Basics'],
    ['ICT', 'BYOD Basics'],
    ['Digitale Dokumente', 'Struktur von Dokumenten'],
    ['Digitale Dokumente', 'Word Grundlagen'],
    ['Digitale Dokumente', 'Formatvorlagen in Word'],
    ['Digitale Dokumente', 'Formatvorlagen in Word'],
    ['Digitale Dokumente', 'Inhaltsverzeichnis und Seitennummerierung in Word'],
    ['Digitale Dokumente', 'Gemeinsames Arbeiten an Dokumenten'],
    ['ICT', 'Kurztest Office'],
    ['Webseiten', 'HTML'],
    ['Webseiten', 'CSS'],
    ['Webseiten', 'Suchmaschinen'],
    ['Webseiten', 'Steckbrief Webseite'],
    ['Programmieren 1', 'Micro:Bit 🤖'],
    ['Programmieren 1', 'Micro:Bit 🤖'],
    ['Programmieren 1', 'Micro:Bit 🤖'],
    ['Programmieren 1', 'Wiederholung']
];
const SCHEDULE_GYM1_PRAKTIKUM = [
    ['Programmieren 1', 'Algorithmen & RoboZZle'],
    ['Programmieren 1', 'Algorithmen & Einstieg Turtlegrafik'],
    ['Programmieren 1', 'Wiederholte Ausführung'],
    ['Programmieren 1', 'Unterprogramme und Fehler'],
    ['Programmieren 1', 'Parameter'],
    ['Programmieren 1', 'Kurztest Programmieren, Variablen, Ein- & Ausgabe'],
    ['Programmieren 1', 'Variablen, Eingabe & Ausgabe'],
    ['Programmieren 1', 'Verzweigungen'],
    ['Programmieren 1', 'Robotik Micro:Bit 🤖'],
    ['Programmieren 1', 'Robotik Micro:Bit 🤖']
];
const SCHEDULE_EF_HS1 = [
    ['Programmieren', 'Infrastruktur, Installation, Git, Markdown, Python Grundlagen'],
    ['Programmieren', 'Datenstrukturen - Listen'],
    ['Programmieren', 'Strings, Eingabe, Game-Loop'],
    ['Programmieren', 'Funktionen, Referenzen'],
    ['Programmieren', 'Arbeiten am NumTrip Game']
];

const SCHEDULE_EF_HS2 = [
    ['Datenbanken', "Relationale DB's, Einführund SQL"],
    ['Datenbanken', "Relationale DB's, Datenmodellierung, ER-Diagramme, SQL Abfragen"],
    ['Datenbanken', "Relationale DB's, Tabellen erstellen, SQL CREATE, INSERT, UPDATE, DELETE"],
    ['Datenbanken', "Relationale DB's, Tabellen erstellen, SQL CRUD"],
    ['Datenbanken', 'Test'],
    ['Robotik', 'Einstieg, Zustandsmaschinen, EV3'],
    ['Robotik', 'Vorbereitungen RobOlympics'],
    ['Robotik', 'Zustandsmaschinen, Zustandsdiagramme'],
    ['Robotik', 'Zustandsmaschinen, Zustandsdiagramme'],
    ['Robotik', 'Test'],
    ['Algorithmik', 'Effizienz'],
    ['Algorithmik', 'O(n) Notation, Sortieren'],
    ['Algorithmik', 'Suchen, Sortieren'],
    ['Algorithmik', 'N+1 Problem'],
    ['Algorithmik', 'Wiederholung'],
    ['Algorithmik', 'Test']
];
const SCHEDULE_EF_FS2 = [
    ['Datenbanken', "Relationale DB's, Einführund SQL"],
    ['Datenbanken', "Relationale DB's, Datenmodellierung, ER-Diagramme, SQL Abfragen"],
    ['Datenbanken', "Relationale DB's, Tabellen erstellen, SQL CREATE, INSERT, UPDATE, DELETE"],
    ['Datenbanken', "Relationale DB's, Tabellen erstellen, SQL CRUD"],
    ['Datenbanken', 'Test'],
    ['Robotik', 'Einstieg, Zustandsmaschinen, EV3'],
    ['Robotik', 'Vorbereitungen RobOlympics'],
    ['Robotik', 'Zustandsmaschinen, Zustandsdiagramme'],
    ['Robotik', 'Zustandsmaschinen, Zustandsdiagramme'],
    ['Robotik', 'Test'],
    ['Algorithmik', 'Effizienz'],
    ['Algorithmik', 'O(n) Notation, Sortieren'],
    ['Algorithmik', 'Suchen, Sortieren'],
    ['Algorithmik', 'N+1 Problem'],
    ['Algorithmik', 'Wiederholung'],
    ['Algorithmik', 'Test']
];

const SCHEDULE_EF_FS4 = [
    ['Algorithmik', 'A-Stern'],
    ['Algorithmik', 'Abschluss, Repetition'],
    ['Algorithmik', 'Test'],
    ['Rechnen mit Strom', 'Logische Bausteine'],
    ['Rechnen mit Strom', ''],
    ['Rechnen mit Strom', ''],
    ['Rechnen mit Strom', ''],
    ['Rechnen mit Strom', ''],
    ['Rechnen mit Strom', 'Test'],
    ['Wiederholung & Fragestunde', '']
];

const SCHEDULE_GYM2_HS_DB = [
    ['Daten und Datenbanken', 'Excel'],
    ['Daten und Datenbanken', 'Excel'],
    ['Daten und Datenbanken', 'Excel und SQL'],
    ['Daten und Datenbanken', 'SQL'],
    ['Daten und Datenbanken', 'SQL'],
    ['Daten und Datenbanken', 'SQL'],
    ['Daten und Datenbanken', 'Wiederholung'],
    ['Daten und Datenbanken', 'Test'],
    ['Netzwerke', 'Protokolle, Schichtenmodell'],
    ['Netzwerke', 'Routing, IP-Adresse'],
    ['Netzwerke', 'TCP/IP'],
    ['Netzwerke', 'Routing, DNS'],
    ['Netzwerke', 'Routing, DNS'],
    ['Netzwerke', 'Wiederholung'],
    ['Netzwerke', 'Test'],
    ['Kryptologie', 'Antike Verschlüsselung'],
    ['Kryptologie', 'Symmetrische Verschlüsselung'],
    ['Kryptologie', 'Hashfunktion'],
    ['Kryptologie', 'Asymmetrische Verschlüsselung'],
    ['Kryptologie', 'Digitale Signaturen'],
    ['Kryptologie', 'Kryptologie im Alltag'],
    ['Kryptologie', 'Test'],
    ['Programmieren 2', 'Datenstrukturen und Listen'],
    ['Programmieren 2', 'Algorithmen und Sortieren'],
    ['Programmieren 2', 'Robotik'],
    ['Programmieren 2', 'Robotik'],
    ['Programmieren 2', 'Robotik'],
    ['Programmieren 2', 'Test Abgabe Robotik-Projekt']
];

/**
 *
 * @param {string[][]} schedule
 */
const prepareHK = (schedule, hk = ['A', 'B']) => {
    const newSchedule = [];
    schedule.forEach((data) => {
        hk.forEach((hk) => {
            newSchedule.push([hk, ...data]);
        });
    });
    return newSchedule;
};

const SCHEDULE_GYM2_HS = [
    ['Netzwerke', 'Schichtenmodell, TCP/IP'],
    ['Netzwerke', 'Codierung, IP-Adresse'],
    ['Netzwerke', 'Routing & DNS'],
    ['Netzwerke', 'Protokolle, World Wide Web'],
    ['Netzwerke', 'Workshop'],
    ['Netzwerke', 'Wiederholung'],
    ['Netzwerke', 'Test'],
    ['Kryptologie', 'Antike Verschlüsselungsverfahren + Informatik Biber'],
    ['Kryptologie', 'Symmetrische Verschlüsselung'],
    ['Kryptologie', 'Asymmetrische Verschlüsselung'],
    ['Kryptologie', 'Hashfunktion'],
    ['Kryptologie', 'Digitale Signaturen'],
    ['Kryptologie', 'Kryptologie im Alltag'],
    ['Kryptologie', 'Test'],
    ['Kryptologie', 'Steganographie'],
    ['Programmieren 2', 'Listen & Game'],
    ['Programmieren 2', 'Game'],
    ['Programmieren 2', 'Game'],
    ['Programmieren 2', 'Game']
];

const SCHEDULE_GYM2_FS = [
    ['Computer', 'Logische Schaltungen 1'],
    ['Computer', 'Logische Schaltungen 2'],
    ['Computer', 'Video erstellen: Halbaddierer'],
    ['Computer', 'Video finalisieren&schneiden'],
    ['Computer', 'Rechnerarchitektur'],
    ['Computer', 'Rechnerarchitektur'],
    ['Computer', 'Betriebssysteme'],
    ['Bilder', 'Grafikformate'],
    ['Bilder', 'Kompression'],
    ['Bilder', 'Urheberrecht'],
    ['Projekt', '🚀🚦🧨🪚⚙️🌡🤖'],
    ['Projekt', '🚀🚦🧨🪚⚙️🌡🤖'],
    ['Projekt', '🚀🚦🧨🪚⚙️🌡🤖'],
    ['Projekt', '🚀🚦🧨🪚⚙️🌡🤖'],
    ['Projekt', '🚀🚦🧨🪚⚙️🌡🤖'],
    ['Projekt', '🚀🚦🧨🪚⚙️🌡🤖'],
    ['Projekt Austauschen', ''],
    ['🚧', '']
];
const SCHEDULE_GYM2_26_FS = [
    ['Kryptologie', 'Symmetrische Verschlüsselung'],
    ['Kryptologie', "Kerckhoff's Prinzip, Asymmetrische Verschlüsselung"],
    ['Kryptologie', 'Signaturverfahren'],
    ['Kryptologie und Netzwerke', 'Wiederholung'],
    ['Kryptologie und Netzwerke', 'Test'],
    ['Programmieren 2', 'Datenstrukturen, Listen, MicroBit'],
    ['Programmieren 2', 'Robotik'],
    ['Programmieren 2', 'Robotik'],
    ['Programmieren 2', 'Robotik'],
    ['Programmieren 2', 'Wettbewerb: Robotik', 'test'],
    ['Projekt', '🚀🚦🧨🪚⚙️🌡🤖'],
    ['Projekt', '🚀🚦🧨🪚⚙️🌡🤖'],
    ['Projekt', '🚀🚦🧨🪚⚙️🌡🤖'],
    ['Projekt', '🚀🚦🧨🪚⚙️🌡🤖'],
    ['Projekt: Abschluss und Abgabe', '🚀🚦🧨🪚⚙️🌡🤖'],
    ['Projekt Austauschen, Abschluss', ''],
    ['Abschluss Informatik', '']
];

const CLASS_SCHEDULE_MAP = {
    ['29Ga']: SCHEDULE_GYM1_HS,
    ['29Gj']: SCHEDULE_GYM1_HS,
    ['29Ga-HK']: prepareHK(SCHEDULE_GYM1_PRAKTIKUM, ['A', 'B']),
    ['29Gj-HK']: prepareHK(SCHEDULE_GYM1_PRAKTIKUM, ['A', 'B'])
};

Object.keys(CLASS_SCHEDULE_MAP).forEach((klasse) => {
    const cells = [];
    let subjectNr = 0;
    const klass = klasse.split('-')[0];
    const SCHEDULE = CLASS_SCHEDULE_MAP[klasse];
    const colSize = SCHEDULE[0].length + 1;
    Array(
        34,
        35,
        36,
        37,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        46,
        47,
        48,
        49,
        50,
        51,
        52,
        1,
        2,
        3,
        4,
        5,
        6,
        7
    ).forEach((weekNr) => {
        const date = moment()
            .year(YEAR + (weekNr < 30 ? 1 : 0))
            .week(weekNr)
            .day(DAYS[CLASS_DAY[klasse]])
            .format('DD.MM.YYYY');
        if (EVENTS[date]) {
            cells.push({
                cells: [date, EVENTS[date].desc, EVENTS[date].details || ''],
                type: EVENTS[date].type,
                icon: EVENTS[date].icon
            });
        } else if (EVENTS[weekNr]) {
            cells.push({
                cells: [date, EVENTS[weekNr].desc, EVENTS[weekNr].details || ''],
                type: EVENTS[weekNr].type,
                icon: EVENTS[weekNr].icon
            });
        } else if (CLASS_EVENTS[klasse][date]) {
            cells.push({
                cells: [date, CLASS_EVENTS[klasse][date].desc, CLASS_EVENTS[klasse][date].details || ''],
                type: CLASS_EVENTS[klasse][date].type,
                icon: CLASS_EVENTS[klasse][date].icon
            });
        } else if (CLASS_EVENTS[klasse][weekNr]) {
            cells.push({
                cells: [
                    CLASS_EVENTS[klasse][weekNr].date,
                    CLASS_EVENTS[klasse][weekNr].desc,
                    CLASS_EVENTS[klasse][weekNr].details || ''
                ],
                type: CLASS_EVENTS[klasse][weekNr].type,
                icon: CLASS_EVENTS[klasse][weekNr].icon
            });
        } else if (SCHEDULE[subjectNr]) {
            const isTest = /test/gi.test(SCHEDULE[subjectNr].join(' '));
            cells.push({
                cells: [date, ...SCHEDULE[subjectNr].slice(0, 3)],
                type: isTest ? 'test' : undefined
            });
            subjectNr += 1;
        }
        if (SCHOOL_EVENTS[weekNr]) {
            if (Array.isArray(SCHOOL_EVENTS[weekNr])) {
                SCHOOL_EVENTS[weekNr].forEach((event) => {
                    cells.push({
                        cells: [event.date, event.desc, event.details || ''],
                        type: event.type,
                        icon: event.icon
                    });
                });
            } else {
                cells.push({
                    cells: [
                        SCHOOL_EVENTS[weekNr].date,
                        SCHOOL_EVENTS[weekNr].desc,
                        SCHOOL_EVENTS[weekNr].details || ''
                    ],
                    type: SCHOOL_EVENTS[weekNr].type,
                    icon: SCHOOL_EVENTS[weekNr].icon
                });
            }
        }
    });
    cells.forEach((row, idx) => {
        while (row.cells.length < colSize) {
            row.cells.push('');
        }
    });

    let first = true;
    console.log(cells);
    const sortedByDate = cells.sort((a, b) => {
        const dateA = moment(a.cells[0], 'DD.MM.YYYY');
        const dateB = moment(b.cells[0], 'DD.MM.YYYY');
        return dateA.diff(dateB);
    });
    const yamlCells = sortedByDate.map((row) => {
        const cellType = row.type ? `\n  type: ${row.type}` : '';
        const icon = row.icon ? `\n  icon: ${row.icon}` : '';
        return `- cells:
    - ${row.cells[0] ?? ''}
    - ${row.cells[1] ?? ''}
    - ${row.cells[2] ?? ''}${cellType}${icon}`;
    });
    console.log(`Writing ${klasse}_${SEMESTER}${YEAR}.json`);
    // console.log(prettyJson)
    fs.writeFileSync(
        `versioned_docs/version-${klass}/${klasse}_${SEMESTER}${YEAR}.yaml`,
        yamlCells.join('\n') + '\n',
        'utf-8'
    );
    // fs.writeFileSync(`./bin/${klasse}_${SEMESTER}${YEAR}.json`, prettyJson, 'utf8');
});
