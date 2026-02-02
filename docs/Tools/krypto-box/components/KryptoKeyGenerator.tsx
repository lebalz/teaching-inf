import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import TextInput from '@tdev-components/shared/TextInput';
import Card from '@tdev-components/shared/Card';
import PriSvg from '!!raw-loader!../assets/pri.svg';
import PubSvg from '!!raw-loader!../assets/pub.svg';
import Button from '@tdev-components/shared/Button';
import { mdiDownload } from '@mdi/js';
import { SIZE_S } from '@tdev-components/shared/iconSizes';

interface Props {}

const svgDefs = (type: 'pub' | 'pri', mainColor: string) => {
    const fillColor = type === 'pri' ? '#1d1d1b' : '#ffffff';
    return `<defs>
    <style>
      .center-1, .center-2, .shadow {
        fill: ${mainColor};
      }

      .text {
        fill: #1d1d1b;
        font-family: ArialMT, Arial;
        font-size: 55.93px;
      }
      .pub.text {
        fill: #ffffff;
        font-size: 52.48px;
      }

      .center-2, .rm-center, .roller, .shadow {
        stroke: #1d1d1b;
        stroke-miterlimit: 10;
      }

      .center-2, .rm-center, .shadow {
        stroke-width: .5px;
      }

      .rm-center {
        fill: none;
      }

      .${type}>.roller {
        fill: ${fillColor};
      }

      .shadow {
        filter: brightness(65%);
      }
      .shadow-2 {
        filter: brightness(90%);
      }
    </style>
  </defs>`;
};

const svgCode = (type: 'pub' | 'pri', mainColor: string) => {
    const svg = (type === 'pri' ? PriSvg : PubSvg) as unknown as string;
    const svgWithColors = svg.replace('<defs></defs>', svgDefs(type, mainColor));
    return svgWithColors;
};

const getSvgName = (type: 'pub' | 'pri', mainColor: string) => {
    return `krypto-key-${type}-${mainColor.replace('#', '')}.svg`;
};

const KryptoKeyGenerator = (props: Props) => {
    const [main, setMain] = React.useState('#e3d200');

    return (
        <div className={clsx(styles.kryptoKeyGenerator)}>
            <div className={clsx(styles.inputs)}>
                <TextInput
                    type="color"
                    value={main}
                    onChange={(val) => setMain(val)}
                    label="Hauptfarbe"
                    className={clsx(styles.colorInput)}
                    noAutoFocus
                />
            </div>
            <div className={clsx(styles.output)}>
                <Card classNames={{ card: styles.card }}>
                    <div
                        className={clsx(styles.key)}
                        dangerouslySetInnerHTML={{ __html: svgCode('pri', main) }}
                    />
                    <Button
                        icon={mdiDownload}
                        size={SIZE_S}
                        className={clsx(styles.downloadBadge)}
                        onClick={() => {
                            const blob = new Blob([svgCode('pri', main)], {
                                type: 'image/svg+xml'
                            });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = getSvgName('pri', main);
                            link.click();
                            URL.revokeObjectURL(url);
                        }}
                    />
                </Card>
                <Card classNames={{ card: styles.card }}>
                    <div
                        className={clsx(styles.key)}
                        dangerouslySetInnerHTML={{ __html: svgCode('pub', main) }}
                    />
                    <Button
                        icon={mdiDownload}
                        size={SIZE_S}
                        className={clsx(styles.downloadBadge)}
                        onClick={() => {
                            const blob = new Blob([svgCode('pub', main)], {
                                type: 'image/svg+xml'
                            });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = getSvgName('pub', main);
                            link.click();
                            URL.revokeObjectURL(url);
                        }}
                    />
                </Card>
            </div>
        </div>
    );
};

export default KryptoKeyGenerator;
