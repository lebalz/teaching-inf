import * as React from 'react';
import { useEffect, useState } from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';
import { shuffle } from 'es-toolkit/compat';
import { PENTA_TABLE } from '@tdev-components/VisualizationTools/Pentacode';
import { useStore } from '@tdev/hooks/useStore';
import { action } from 'mobx';
import Button from '@tdev-components/shared/Button';
import { SIZE_S } from '@tdev-components/shared/iconSizes';
import TextInput from '@tdev-components/shared/TextInput';
import { observer } from 'mobx-react-lite';

const ImageEncryption = observer(() => {
    const SRC_IMAGE_ID = React.useId();
    const SRC_CANVAS_ID = React.useId();
    const DEST_CANVAS_ID = React.useId();

    const [imageDataUrl, setImageDataUrl] = useState<string | null>();
    const [srcImageLoaded, setSrcImageLoaded] = useState<boolean>(false);
    const [resultReady, setResultReady] = useState<boolean>(false);
    const [mode, setMode] = React.useState<'CBC' | 'ECB'>('ECB');
    const [key, setKey] = React.useState('');
    const [iv, setIv] = React.useState('');
    const store = useStore('siteStore').toolsStore;

    // TODO: Refactor to use less flags and to store cipher image data in store.
    useEffect(() => {
        setImageDataUrl(store.imageEncryption?.imageDataUrl || '');
        setSrcImageLoaded(store.imageEncryption?.srcImageLoaded);
        setResultReady(store.imageEncryption?.resultReady);
        setMode(store.imageEncryption?.mode || 'ECB');
        setKey(store.imageEncryption?.key || '');
        setIv(store.imageEncryption?.iv || '');
    }, []);

    useEffect(() => {
        return action(() => {
            store.imageEncryption = {
                imageDataUrl: imageDataUrl ?? '',
                srcImageLoaded,
                resultReady,
                mode,
                key,
                iv
            };
        });
    }, [imageDataUrl, srcImageLoaded, resultReady, mode, key, iv]);

    useEffect(() => {
        setResultReady(false);
    }, [mode]);

    function asCharCodes(value: string) {
        return value.split('').map((c) => c.charCodeAt(0) % 256);
    }

    const uploadImage = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                setImageDataUrl(result);
            };
            reader.readAsDataURL(file);
        }
    };

    function onImageLoaded() {
        setResultReady(false);
        resizeCanvasToSrcImage(SRC_CANVAS_ID);
        drawSrcImage();
        setSrcImageLoaded(true);
    }

    function getSrcImage(): HTMLImageElement {
        return document.getElementById(SRC_IMAGE_ID) as HTMLImageElement;
    }

    function resizeCanvasToSrcImage(canvasId: string) {
        if (!imageDataUrl) {
            return;
        }

        const srcImage = getSrcImage();
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        canvas.width = srcImage.width;
        canvas.height = srcImage.height;
    }

    function drawSrcImage() {
        if (!imageDataUrl) {
            return;
        }

        const srcCanvas = document.getElementById(SRC_CANVAS_ID) as HTMLCanvasElement;
        const srcCtxt = srcCanvas.getContext('2d');
        srcCtxt?.drawImage(getSrcImage(), 0, 0);
    }

    async function encrypt() {
        resizeCanvasToSrcImage(DEST_CANVAS_ID);

        const srcCanvas = document.getElementById(SRC_CANVAS_ID) as HTMLCanvasElement;
        const destCanvas = document.getElementById(DEST_CANVAS_ID) as HTMLCanvasElement;

        const srcImage = getSrcImage();
        const srcCtxt = srcCanvas.getContext('2d');
        if (!srcCtxt) {
            return;
        }
        const srcImageData = srcCtxt.getImageData(0, 0, srcImage.width, srcImage.height);
        const destImageData = srcCtxt.createImageData(srcImageData);

        const srcRgbBytes = extractRgbBytes(srcImageData);
        const destRgbBytes = mode === 'ECB' ? encryptEcb(srcRgbBytes) : encryptCbc(srcRgbBytes);

        destImageData.data.set(inflateToRgbaBytes(destRgbBytes, 255));
        destCanvas?.getContext('2d')?.putImageData(destImageData, 0, 0);

        setResultReady(true);
    }

    function extractRgbBytes(imageData: ImageData): Uint8ClampedArray {
        return imageData.data.filter((value, idx) => (idx + 1) % 4 != 0);
    }

    function inflateToRgbaBytes(rgbBytes: Uint8ClampedArray, aValue: number): Uint8ClampedArray {
        const mapped: number[] = Array.from(rgbBytes).flatMap((val, idx) =>
            idx % 3 === 2 ? [val, aValue] : [val]
        );
        return Uint8ClampedArray.from(mapped);
    }

    function encryptEcb(plaintextBytes: Uint8ClampedArray): Uint8ClampedArray {
        const keyBytes = asCharCodes(key);
        return plaintextBytes.map(
            (plaintextByte, keyByteIdx) => plaintextByte ^ keyBytes[keyByteIdx % key.length]
        );
    }

    function encryptCbc(plaintextBytes: Uint8ClampedArray): Uint8ClampedArray {
        const chainedBlock = asCharCodes(iv);
        const keyBytes = asCharCodes(key);
        return plaintextBytes.map((plaintextByte, plaintextByteIdx) => {
            const keyByteIndex = plaintextByteIdx % key.length;
            const ciphertextByte = plaintextByte ^ chainedBlock[keyByteIndex] ^ keyBytes[keyByteIndex];
            chainedBlock[keyByteIndex] = ciphertextByte;

            return ciphertextByte;
        });
    }

    return (
        <div className={clsx('hero', 'shadow--lw', styles.container)}>
            <div className="container">
                <p className="hero__subtitle">Bildverschlüsselung</p>
                <h4>Modus</h4>
                <div className={clsx('button-group', styles.modes)}>
                    <Button
                        active={mode === 'ECB'}
                        size={SIZE_S}
                        onClick={() => setMode('ECB')}
                        text="ECB"
                        color="primary"
                    />
                    <Button
                        active={mode === 'CBC'}
                        size={SIZE_S}
                        onClick={() => setMode('CBC')}
                        text="CBC"
                        color="primary"
                    />
                </div>
                <div className={styles.stringInputContainer}>
                    <TextInput
                        label="Schlüssel"
                        value={key}
                        onChange={(txt) => {
                            setKey(txt);
                        }}
                        placeholder="Schlüssel"
                        type="text"
                    />
                </div>
                {mode === 'CBC' && (
                    <div className={styles.stringInputContainer}>
                        <h4>
                            <label htmlFor="cbc-iv">Initialvektor (IV)</label>
                            {iv.length !== key.length && (
                                <span
                                    className={clsx('badge', 'badge--danger', styles.errorBadge)}
                                    title="Der IV muss die gleiche Länge haben wie der Schlüssel"
                                >
                                    Länge
                                </span>
                            )}
                        </h4>
                        <div className={clsx(styles.iv, 'button-group')}>
                            <TextInput
                                id="cbc-iv"
                                value={iv}
                                onChange={(txt) => {
                                    setIv(txt);
                                }}
                                placeholder="Der IV muss die gleiche Länge haben wie der Schlüssel"
                                type="text"
                                className={clsx(iv.length !== key.length && styles.invalid)}
                            />
                            <Button
                                text="Zufällig Setzen"
                                color="primary"
                                onClick={() => {
                                    if (key.length === 0) {
                                        return setIv('');
                                    }
                                    const alphabet = Object.keys(PENTA_TABLE).filter(
                                        (char) => char.length === 1
                                    );
                                    const rand = shuffle(
                                        Array(Math.floor(key.length / alphabet.length) + 2)
                                            .fill('')
                                            .reduce((prev, curr) => [...prev, ...alphabet], [])
                                    );
                                    setIv(rand.slice(0, key.length).join(''));
                                }}
                            />
                        </div>
                    </div>
                )}

                <input type="file" id="input-upload-image" accept=".png,.jpg,.jpeg" onChange={uploadImage} />

                <button
                    className={clsx('button', 'button--primary', styles.btnUploadImage)}
                    onClick={() => document.getElementById('input-upload-image')?.click()}
                >
                    🖼️ Bild auswählen
                </button>

                <img
                    id={SRC_IMAGE_ID}
                    src={imageDataUrl ?? undefined}
                    className={styles.hidden}
                    onLoad={onImageLoaded}
                />

                <div className={styles.canvasesContainer}>
                    <h4>Unverschlüsseltes Bild</h4>
                    <div className={clsx(styles.image, !imageDataUrl && styles.hidden)}>
                        <canvas id={SRC_CANVAS_ID} />
                    </div>

                    <h4>Verschlüsseltes Bild</h4>
                    <div className={clsx(styles.image, !resultReady && styles.hidden)}>
                        <canvas id={DEST_CANVAS_ID} />
                    </div>
                </div>

                <button
                    className={clsx('button', 'button--primary')}
                    onClick={encrypt}
                    disabled={!(srcImageLoaded && key && (mode === 'ECB' || iv))}
                >
                    🔑 Verschlüsseln
                </button>
            </div>
        </div>
    );
});

export default ImageEncryption;
