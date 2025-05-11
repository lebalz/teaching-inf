import React from 'react';
import { observer } from 'mobx-react-lite';
import { Document, ImageRun, Packer, Paragraph } from 'docx';
import { saveAs } from 'file-saver';
import { mdiDownload } from '@mdi/js';
import { useStore } from '@tdev-hooks/useStore';
import User from '@tdev-models/User';
import Button from '@tdev-components/shared/Button';
interface Props {
    personalize?: boolean;
}

const ProbeV28 = observer((props: Props) => {
    const userStore = useStore('userStore');
    const viewedUser = userStore.viewedUser;
    if (!viewedUser && props.personalize) {
        return null;
    }

    const t1 = `Berner Schulen kämpfen gegen Handyobsession

Teenager am Bildschirm
`;

    const t2 = `



Der Bund
Regina Schneeberger 
Adrian Moser (Fotos)

26.08.2024

1	Handyloser Unterricht
 
Smartphones wrden an der Schule Munzinger in einen Schrank verbannt. Auch andernorts wird händeringend nach Lösungen gesucht. Die Jugendlichen sind im Unterricht handylos. Dafür wird mit den Tablets Medienkompetenz geschult. Die Sache mit den Handys war ausser Kontrolle geraten. Das merkte Schulleiter Giuliano Picciati eines Morgens, als er in seinem Büro sass. «Ständig machte es tsss tsss tsss», sagt er. Die konfiszierten Mobiltelefone, die beim Pult des Schulleiters lagerten, vibrierten im Sekundentakt. Zumindest teilweise kamen die Nachrichten von jenen Schülerinnen und Schülern, die ihre Handdys noch hatten. Obwohl die Handys während des Unterrichts eigentlich tabu waren, weder sicht- noch hörbar im Rucksack oder im Spind hätten verstaut sein müssen. «Da merkten wir, dass das Suchtpotenzial für die Jugendlichen zu gross ist.»

Inhaltsverzeichnis

Picciati, ein Schulleiter, wie man ihn sich vorstellt, ruhig, bestimmt, natürliche Autorität, sagt: «Wir wussten, so geht es nicht weiter.» Dann kam die Idee mit der Handygarage.
Seit gut einem Jahr parkieren die Jugendlichen an der Schule Munzinger in Bern ihre Mobiltelefone morgens in einer hölzernen Box mit zahlreichen Fächern. Die Lehrerin oder der Lehrer schliesst die Geräte im Klassenzimmer im Schrank ein, verwahrt sie hinter blickdichten Türen. Da bleiben sie bis um 12 Uhr. Nach der Mittagspause kommen sie wieder in die Garage. «Seither haben wir kaum mehr Probleme», sagt der Schulleiter.

`;

    const t3 = `
Abbildung 1: Schulleiterin Barabara Muntwyler und Schulleiter Giuliano Picciati mussten handeln.

Doch sollten die Jugendlichen nicht gerade in der Schule lernen, mit den Handys umzugehen? Picciati sagt: «Wir sprechen im Unterricht ja trotzdem über Medienkompetenz.» Ausserdem hätten alle ein Tablet, mit dem sie lernen würden, im Internet zu recherchieren.
`;

    const t4 = `
Abbildung 2: Hier werden die Mobiltelefone parkiert.
Die Schule Munzinger ist nicht die Einzige, die den Smartphones den Kampf ansagt. Auch im Stadtberner Lorraine-Schulhaus gilt seit den Sommerferien ein neues Handyregime. «Vorher war es ein Katz-und-Maus-Spiel», sagt Schulleiter Jürg Läderach. Die Jugendlichen seien ewig auf die Toilette verschwunden oder hätten unter dem Pult getibt. Nun landen die Handys auch dort während des Unterrichts in einer Kiste.
Immer mehr Schulen im Kanton Bern überlegen sich solche oder ähnliche Lösungen. Weil es anders nicht mehr geht. Das stellt Franziska Schwab vom Lehrpersonenverband Bildung Bern fest. «Die Geräte saugen die ganze Aufmerksamkeit ab», sagt sie. Dass Mobiltelefone für Kinder und Jugendliche zum Problem werden können, zeigen diverse Studien. Die möglichen Folgen eines übermässigen Konsums: Konzentrations- und Schlafstörungen, Depressionen.

Auch Schulen aus anderen Kantonen kennen Handyverbote:
-	Sekundarschulen in Arbon (TG)
-	Sekundarschulen in Muttenz (BL)
-	Schulen Würenlos (AG)
-	Schulen Neuenhof (AG)
Je jünger die Kinder sind, desto enger sollte der Smartphonegebrauch begleitet werden. Gemäss Florian Bühler, Forscher in der Abteilung Entwicklungspsychologie an der Universität Bern, herrscht in der Wissenschaft ein Konsens darüber, dass die meisten jungen Menschen erst ab 12 Jahren bereit sind für ein eigenes Smartphone, wie er kürzlich gegenüber dieser Zeitung sagte.
2	Rote Karte beim Regelverstoss
Lehrerin Annegret Paerschke sagt: «Seit wir die Regel haben, ist die Atmosphäre viel positiver.» Die Jugendlichen könnten sich besser konzentrieren. Und sie müsse nicht stäntig kontrollieren und auf Konfrontationskurs gehen. Die Lehrerin bewilligt aber auch Ausnahmen. Beispielsweise wenn eine Jugendliche sich beworben hat und auf den Anruf des Lehrbetriebs wartet.
2.1	Sanktionen und Regelverstösse 
Regelverstösse kommen nur noch selten vor. Wenn doch, gibt es beim ersten Mal eine Gelbe Karte ohne grosse Konsequenzen. Beim widerholten Foul landet das Telefon bis Schulschluss im Büro der Schulleitung. Das Gerät muss danach für eine Woche zu Hause bleiben. Die Handys über längere Zeit einziehen, wie das früher mancherorts gehandhabt wurde, macht heute kaum noch eine Schule. Der Grund: Das private Eigentum darf ausserhalb der Unterrichtszeit nicht beschlagnahmt werden – würden sich Eltern wehren, gäbe es rechtliche Probleme.
2.2	Im Schullager
Länger ohne Handy sind die Schülerinnen und Schüler hingegen während der Landschulwoche. Denn dort gilt in der Klasse von Annegret Paerschke: Die Mobiltelefone bleiben zu Hause. «Die Eltern sind dankbar dafür, die Jugendlichen eher nicht», so die Lehrerin. Allerdings wüssten sie im Nachhinein meist die Vorteile zu schätzen.
`;

    const t5 = `
Abbildung 3: Ohne Smartphone ins Klassenlager: Aline war erst skeptisch.

Aline ist Sprechrin des Schülerrats. Die 14-Jährige formuliert und argumentiert überlegt, wie es sich für ihr Amt gehört. Während sie im Unterricht problemlos auf das Smartphone verzichten kann, bereitete es ihr in der Landschulwoche mehr Mühe. 
«Tief im Innern weiss ich schon, dass es gut ist, wenn man das Handy nicht mitnehmen darf. Manchmal hätte ich aber auch gerne meinen Freundinnen oder meiner Familie geschrieben oder ihnen ein Foto geschickt.» 
Aber: Sie hätten im Lager fiel mehr miteinander gesprochen. Statt gechattet und gegamt hätten sie sich die Zeit mit Brettspielen vertrieben. «Der Zusammenhalt war besser.»
2.3	Pausenhof
Punkt 10 Uhr klingelt im altehrwürdigen Schulhaus die Glocke zur grossen Pause. Die Jugendlichen strömen nach draussen. Manche sitzen unter den Bäumen beisammen, plaudern, essen Sandwichs. Eine Gruppe spielt nebenan Fussball, eine andere Gruppe Basketball. Niemand starrt auf einen Bildschirm.
Abbildungsverzeichnis

`;

    const generateFromUrl = async (user?: User) => {
        const bild1 = await fetch('/img/of-word/v28/Bild1.jpg').then((r) => r.arrayBuffer());
        const bild2 = await fetch('/img/of-word/v28/Bild2.jpg').then((r) => r.arrayBuffer());
        const bild3 = await fetch('/img/of-word/v28/Bild3.jpg').then((r) => r.arrayBuffer());
        const bild4 = await fetch('/img/of-word/v28/Bild4.jpg').then((r) => r.arrayBuffer());
        const name = `${user?.firstName || 'Test'}${user?.lastName || 'Person'}`;
        const hash = name
            .split('')
            .map((c) => c.charCodeAt(0))
            .reduce((v, s) => v + (s + 1), 1);
        const hash100raw = Math.floor(hash / 100);
        const hash100 = hash100raw % 16;
        const hash10 = Math.floor((hash - hash100raw * 100) / 10) % 16;
        const hash1 = hash - hash100raw * 100 - hash10 * 10;
        const color = `F${hash100.toString(16)}F${hash10.toString(16)}F${hash1.toString(16)}`.toUpperCase();
        const SIZE = 300;

        const doc = new Document({
            creator: name,
            description: `Test für ${name}, ${new Date().toISOString()}`,
            title: `Word Prüfung GBSL`,
            keywords: `ofi, msword, test, ${name}`,
            background: {
                color: color
            },
            sections: [
                {
                    children: [
                        ...t1.split('\n').map((l) => new Paragraph(l)),
                        new Paragraph({
                            children: [
                                new ImageRun({
                                    type: 'jpg',
                                    data: bild1,
                                    transformation: {
                                        width: SIZE,
                                        height: (SIZE / 454) * 302
                                    },
                                    altText: {
                                        title: `Bild 1 für ${name}`,
                                        description: `${user?.id || ''}\n${new Date().toISOString()} - Bild 1`,
                                        name: 'Bild 1'
                                    }
                                })
                            ]
                        }),
                        ...t2.split('\n').map((l) => new Paragraph(l)),
                        new Paragraph({
                            children: [
                                new ImageRun({
                                    type: 'jpg',
                                    data: bild2,
                                    transformation: {
                                        width: SIZE,
                                        height: (SIZE / 606) * 403
                                    },
                                    altText: {
                                        title: `Bild 2 für ${name}`,
                                        description: `${user?.id || ''}\n${new Date().toISOString()} - Bild 2`,
                                        name: 'Bild 2'
                                    }
                                })
                            ]
                        }),
                        ...t3.split('\n').map((l) => new Paragraph(l)),
                        new Paragraph({
                            children: [
                                new ImageRun({
                                    type: 'jpg',
                                    data: bild3,
                                    transformation: {
                                        width: SIZE,
                                        height: (SIZE / 454) * 302
                                    },
                                    altText: {
                                        title: `Bild 3 für ${name}`,
                                        description: `${user?.id || ''}\n${new Date().toISOString()} - Bild 3`,
                                        name: 'Bild 3'
                                    }
                                })
                            ]
                        }),
                        ...t4.split('\n').map((l) => new Paragraph(l)),
                        new Paragraph({
                            children: [
                                new ImageRun({
                                    type: 'jpg',
                                    data: bild4,
                                    transformation: {
                                        width: SIZE,
                                        height: (SIZE / 606) * 403
                                    },
                                    altText: {
                                        title: `Bild 4 für ${name}`,
                                        description: `${user?.id || ''}\n${new Date().toISOString()} - Bild 4`,
                                        name: 'Bild 4'
                                    }
                                })
                            ]
                        }),
                        ...t5.split('\n').map((l) => new Paragraph(l))
                    ]
                }
            ]
        });
        Packer.toBlob(doc).then((blob) => {
            saveAs(blob, `probe_${user?.firstName || 'v'}_${user?.lastName || '28'}.docx`.toLowerCase());
        });
    };
    return (
        <>
            <Button
                icon={mdiDownload}
                text={`Vorlage für ${viewedUser?.nameShort || 'Jahrgang 28'}`}
                onClick={() => {
                    generateFromUrl(viewedUser);
                }}
                color="green"
                iconSide="left"
            />
        </>
    );
});

export default ProbeV28;
