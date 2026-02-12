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
const CLASS_DAY = {
    ['29Ga']: ['mi'],
    ['29Gj']: ['mi', 'fr'],
    ['28Gj']: ['fr'],
    ['28Gb']: ['di'],
    ['28Wa']: ['di']
};
const YEAR = 2026;
const SEMESTER = 'FS';

const needsEscape = (str) => {
    return /[:&*#|]/.test(str || '');
};

// const EVENTS = {
//     [40]: {
//         desc: /*'Umwelt- und Sozialwoche'*/ 'Kennenlernwoche GYM1',
//         type: 'holiday',
//         icon: 'mdiWalletTravel'
//     },
//     [41]: { desc: 'Herbstferien', details: '🏝️🏖️🏖️😎', type: 'holiday' },
//     [42]: { desc: 'Herbstferien', details: '🏝️🏖️🏖️😎', type: 'holiday' },
//     [52]: { desc: 'Winterferien', details: '🏂❄️⛷️🎄🧑‍🎄', icon: 'mdiPineTreeVariantOutline', type: 'holiday' },
//     [1]: { desc: 'Winterferien', details: '🏂❄️⛷️🎄🧑‍🎄', icon: 'mdiPineTreeVariantOutline', type: 'holiday' },
//     [7]: { desc: 'Sportwoche', type: 'holiday', icon: 'mdiWeatherSnowyHeavy' }
// };
const EVENTS = {
    [7]: { desc: 'Sportwoche', type: 'holiday', icon: 'mdiWeatherSnowyHeavy' },
    [14]: { desc: 'Sonderwoche', type: 'holiday', icon: 'mdiSchool' },
    [15]: { desc: 'Frühlingsferien', type: 'holiday', icon: 'mdiFlowerTulipOutline' },
    [16]: { desc: 'Frühlingsferien', type: 'holiday', icon: 'mdiFlowerTulipOutline' },
    [24]: { desc: 'Mündliche Maturwoche', type: 'holiday', icon: 'mdiSchool' },
    [28]: { desc: 'Sommerferien', type: 'holiday', icon: 'mdiBeach' }
};
const CLASS_EVENTS = {
    ['28Gb']: {
        [22]: { desc: 'Integrationstage', details: 'Gym 2 Klassen', type: 'holiday', date: '26.05.2026' }
    },
    ['28Gj']: {
        [20]: { desc: 'Auffahrt', details: 'Frei', type: 'holiday', date: '15.05.2026' }
    },
    ['29Ga']: {
        [8]: {
            desc: 'Exkursion Bio',
            details: 'Naturhistorisches Museum Bern',
            type: 'event',
            date: '18.02.2026'
        },
        [26]: { desc: 'Filmanlass', details: 'Alle GYM-1 Klassen GBSL', type: 'event', date: '24.06.2026' }
    },
    ['29Gj']: {
        [20]: { desc: 'Auffahrt', details: 'Frei', type: 'holiday', date: '15.05.2026' },
        [26]: { desc: 'Filmanlass', details: 'Alle GYM-1 Klassen GBSL', type: 'event', date: '24.06.2026' }
    },
    ['28Wa']: {
        [18]: {
            desc: 'Bundeshausbesuch',
            details: 'Sondersession NR, SR',
            type: 'event',
            date: '28.04.2026'
        },
        [26]: { desc: 'Triathlon', details: '', type: 'event', date: '23.06.2026' }
    }
};
// const CLASS_EVENTS = {
//     ['28Gb']: {},
//     ['28Gj']: {},
//     ['29Ga-HK']: {
//         [6]: { desc: 'Programmieren 1', details: 'Test', type: 'test', date: '04.02.2026' }
//     },
//     ['29Gj-HK']: {
//         [6]: { desc: 'Programmieren 1', details: 'Test', type: 'test', date: '04.02.2026' }
//     },
//     ['29Ga']: {
//         [47]: { desc: 'Informatik Biber', details: 'Wettbewerb', type: 'event', date: '18.11.2025' },
//         [6]: { desc: 'Programmieren 1', details: 'Test', type: 'test', date: '04.02.2026' },
//         [49]: {
//             desc: 'Kantonaler Fachschaftstag',
//             details: 'Auftrag Studienwahl',
//             type: 'holiday',
//             icon: 'mdiSleep',
//             date: '02.12.2025'
//         }
//     },
//     ['29Gj']: {
//         [47]: { desc: 'Informatik Biber', details: 'Wettbewerb', type: 'event', date: '19.11.2025' },
//         [6]: { desc: 'Programmieren 1', details: 'Test', type: 'test', date: '04.02.2026' }
//     }
// };

// SCHOOL_EVENTS = {
//     // [42]: { desc: 'Beginn BYOD-Tests', type: 'test', date: '14.10.2025' },
//     [5]: { desc: 'Notenschluss', type: 'event', date: '22.01.2026', icon: 'mdiFlagCheckered' },
//     [6]: { desc: 'Beginn Semester 2', type: 'event', date: '02.02.2026', icon: 'mdiRun' }
//     // [51]: [
//     //     { desc: 'Weihnachtskonzert', type: 'holiday', date: '20.12.2024' }
//     // ],
// };
SCHOOL_EVENTS = {
    [26]: { desc: 'Notenschluss', type: 'event', date: '25.06.2026', icon: 'mdiFlagCheckered' },
    [27]: {
        desc: 'SchiLw-Tag',
        details: 'Schulinterne Weiterbildung für Lehrpersonen',
        type: 'event',
        date: '01.07.2026',
        icon: 'mdiSchool'
    },
    [27]: {
        desc: 'Beginn Sommerferien',
        details: '',
        type: 'holiday',
        date: '04.07.2026',
        icon: 'mdiBeach'
    }
};

const SCHEDULE_GYM1_29_HS = [
    ['Einstieg', 'Inf-Webseite, BYOD'],
    ['ICT', 'BYOD Basics'],
    ['ICT', 'BYOD Basics'],
    ['ICT', 'BYOD Basics'],
    ['ICT', 'BYOD Basics'],
    ['Test Schriftlich', 'Kurztest schriftlich zu den BYOD Basics'],
    ['Test Praktisch', 'Kurztest praktisch zu den BYOD Basics'],
    ['Test Praktisch', 'Kurztest praktisch zu den BYOD Basics'],
    ['Test Praktisch', 'Kurztest praktisch zu den BYOD Basics / Vorbereitung "Informatik Biber"'],
    ['Test Praktisch', 'Kurztest praktisch zu den BYOD Basics / Vorbereitung "Informatik Biber"'],
    ['Programmieren 1', 'Übungs- und Fragestunde'],
    ['Programmieren 1', 'Kurztest Programmieren, Variablen, Ein- & Ausgabe'],
    ['Programmieren 1', '🎄Programmieren'],
    ['Digitale Dokumente', 'Struktur von Dokumenten'],
    ['Digitale Dokumente', 'Word Grundlagen'],
    ['Digitale Dokumente', 'Formatvorlagen in Word'],
    ['Digitale Dokumente', 'Formatvorlagen in Word']
];
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
    ['Programmieren 1', 'Variablen, Eingabe & Ausgabe'],
    ['Programmieren 1', 'Verzweigungen'],
    ['Programmieren 1', 'Listen'],
    ['Programmieren 1', 'Listen'],
    ['Programmieren 1', 'Abschluss']
];
const SCHEDULE_GYM1_29_FS = [
    ['Programmieren 1', 'Test'],
    ['Codes und Daten', 'Einstieg: Informationen vs. Daten, Zahlen speicherbar machen - Binärzahlen'],
    ['Codes und Daten', 'Zeichencodierung, ASCII, Unicode'],
    ['Codes und Daten', 'UTF-8, Datenkompression, Huffman-Codierung'],
    ['Codes und Daten', 'Bildcodierung, Farbtiefe, Auflösung'],
    ['Codes und Daten', 'Ton- und Videoformate, Datenmengen und Grössenordnungen'],
    ['Codes und Daten', 'Anwendungen'],
    ['Codes und Daten', 'Wiederholung, Prüfungsvorbereitung'],
    ['Codes und Daten', 'Test'],
    ['Computer', 'Rechnen mit Strom: Logische Schaltungen 1'],
    ['Computer', 'Rechnen mit Strom: Logische Schaltungen 2'],
    ['Computer', 'Rechnen mit Strom: Halbaddierer, Volladdierer'],
    ['Computer', '4'],
    ['Computer', '5'],
    ['Computer', '6']
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
    ['Projekt: Abschluss und Abgabe', '🚀🚦🧨🪚⚙️🌡🤖']
];

const SCHEDULE_GYM2_28_HS = [
    ['Kryptologie', 'Antike Verschlüsselungsverfahren'],
    ['Kryptologie', 'Symmetrische Verschlüsselung'],
    ['Kryptologie', 'Symmetrische Verschlüsselung'],
    ['Kryptologie', 'Asymmetrische Verschlüsselung'],
    ['Kryptologie', 'Hashfunktion'],
    ['Kryptologie', 'Digitale Signaturen'],
    ['Kryptologie', 'Wiederholung'],
    ['Kryptologie', 'Test'],
    ['Programmieren 2', 'Wiederholung, Einstieg MicroBit'],
    ['Programmieren 2', 'Datenstrukturen, Listen, MicroBit'],
    ['Programmieren 2', 'Robotik'],
    ['Programmieren 2', 'Robotik'],
    ['Programmieren 2', 'Robotik'],
    ['Programmieren 2', '"Wettbewerb: Robotik"', 'test'],
    ['Programmieren 2', 'Game of Life'],
    ['Computer', 'Logische Schaltungen 1'],
    ['Computer', 'Logische Schaltungen 2'],
    ['Computer', 'Halbaddierer'],
    ['Computer', 'Volladdierer, Speichern'],
    ['Netzwerke', 'Einstieg'],
    ['Netzwerke', 'Routing']
];
const SCHEDULE_GYM2_28_FS = [
    ['Robotik', 'Sensoren und Aktoren'],
    ['Robotik', 'Linienfolger'],
    ['Robotik', 'Vorbereitung Wettbewerb'],
    ['Robotik', 'Wettbewerb'],
    ['Netzwerke', 'Protokolle, Schichtenmodell'],
    ['Netzwerke', 'Routing, IP-Adresse'],
    ['Netzwerke', 'TCP/IP'],
    ['Netzwerke', 'DNS'],
    ['Netzwerke', 'ATProtokoll'],
    ['Projekt', '🚀🚦🧨🪚⚙️🌡🤖'],
    ['Projekt', '🚀🚦🧨🪚⚙️🌡🤖'],
    ['Projekt', '🚀🚦🧨🪚⚙️🌡🤖'],
    ['Projekt', '🚀🚦🧨🪚⚙️🌡🤖'],
    ['Projekt: Abschluss und Abgabe', '🚀🚦🧨🪚⚙️🌡🤖'],
    ['Projekt Austauschen', '↔️'],
    ['Abschluss Informatik', '']
];
const SCHEDULE_WINF_28_FS = [
    ['CSS & HTML', 'Style Framework Bootstrap'],
    ['Wordpress', 'Projektstart: Blueprint einer Marketingseite erstellen'],
    ['Wordpress', 'Wordpress aufsetzen, Themes suchen und installieren'],
    ['Wordpress', 'Seiten und Beiträge erstellen, Menüs und Widgets nutzen'],
    ['Wordpress', 'Seiten und Beiträge erstellen, Menüs und Widgets nutzen'],
    ['Wordpress', 'Anpassungen (CSS) und Optimierungen vornehmen'],
    ['Wordpress', 'Abgabe Projekt'],
    ['SQL', 'Einführung, simple Abfragen'],
    ['SQL', 'Simple Abfragen und Filterung'],
    ['SQL', 'Aggregierte Abfragen, Gruppieren, Statistiken'],
    ['SQL + Wordpress', 'SQL Abfragen in Wordpress nutzen'],
    ['SQL + Wordpress', 'SQL Abfragen in Wordpress nutzen'],
    ['SQL + Wordpress', 'SQL Abfragen in Wordpress nutzen'],
    ['Wordpress', 'Abgabe Projekt'],
    ['API', 'Externe Datenquellen und APIs nutzen'],
    ['API', 'Abschluss']
];

// const CLASS_SCHEDULE_MAP = {
//     ['29Ga']: SCHEDULE_GYM1_29_HS,
//     ['29Gj']: SCHEDULE_GYM1_29_HS,
//     ['29Ga-HK']: prepareHK(SCHEDULE_GYM1_PRAKTIKUM, ['A', 'B']),
//     ['29Gj-HK']: prepareHK(SCHEDULE_GYM1_PRAKTIKUM, ['A', 'B'])
// };
const CLASS_SCHEDULE_MAP = {
    ['28Wa']: SCHEDULE_WINF_28_FS
};
// const CLASS_SCHEDULE_MAP = {
//     ['29Ga']: SCHEDULE_GYM1_29_FS,
//     ['29Gj']: SCHEDULE_GYM1_29_FS
// };
Object.keys(CLASS_SCHEDULE_MAP).forEach((klasse) => {
    const cells = [];
    let subjectNr = 0;
    const klass = klasse.split('-')[0];
    const SCHEDULE = CLASS_SCHEDULE_MAP[klasse];
    const colSize = SCHEDULE[0].length + 1;
    Array(
        // 34,
        // 35,
        // 36,
        // 37,
        // 38,
        // 39,
        // 40,
        // 41,
        // 42,
        // 43,
        // 44,
        // 45,
        // 46,
        // 47,
        // 48,
        // 49,
        // 50,
        // 51,
        // 52,
        // 1,
        // 2,
        // 3,
        // 4,
        // 5,
        // 6,
        // 7
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20,
        21,
        22,
        23,
        24,
        25,
        26,
        27
    ).forEach((weekNr) => {
        const dates = CLASS_DAY[klasse].map((abbr_day) => {
            const day = DAYS[abbr_day];
            return moment()
                .year(YEAR + (SEMESTER == 'FS' ? 0 : weekNr < 30 ? 1 : 0))
                .week(weekNr)
                .day(day)
                .format('DD.MM.YYYY');
        });
        let progressSubjectNr = false;
        for (const date of dates) {
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
                progressSubjectNr = true;
            }
        }
        if (progressSubjectNr) {
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
            if (colSize === 4 && row.type) {
                row.cells.splice(1, 0, '');
            } else {
                row.cells.push('');
            }
        }
    });

    let first = true;
    const sortedByDate = cells.sort((a, b) => {
        const dateA = moment(a.cells[0], 'DD.MM.YYYY');
        const dateB = moment(b.cells[0], 'DD.MM.YYYY');
        return dateA.diff(dateB);
    });
    const yamlCells = sortedByDate.map((row) => {
        const cellType = row.type ? `\n  type: ${row.type}` : '';
        const icon = row.icon ? `\n  icon: ${row.icon}` : '';
        const col4 = row.cells[3] !== undefined ? `\n    - ${row.cells[3]}` : '';
        return `- cells:
    - ${needsEscape(row.cells[0]) ? `"${row.cells[0]}"` : (row.cells[0] ?? '')}
    - ${needsEscape(row.cells[1]) ? `"${row.cells[1]}"` : (row.cells[1] ?? '')}
    - ${needsEscape(row.cells[2]) ? `"${row.cells[2]}"` : (row.cells[2] ?? '')}${col4}${cellType}${icon}`;
    });
    console.log(yamlCells.join('\n'));
    console.log(`Writing ${klasse}-${SEMESTER}${YEAR}.yaml`);
    // console.log(prettyJson)
    fs.writeFileSync(
        `versioned_docs/version-${klass}/${klasse}-${SEMESTER}${YEAR}.yaml`,
        yamlCells.join('\n') + '\n',
        'utf-8'
    );
    // fs.writeFileSync(`./bin/${klasse}_${SEMESTER}${YEAR}.json`, prettyJson, 'utf8');
});
