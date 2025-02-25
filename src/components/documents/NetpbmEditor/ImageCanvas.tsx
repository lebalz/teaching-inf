import React from "react";
import styles from "./styles.module.scss";

interface Props {
    pixels?: Uint8ClampedArray;
    width: number;
    height: number;
}

const ImageCanvas = ({width, height, pixels}: Props) => {

    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    React.useEffect(() => {
        if (!pixels || pixels.length === 0 || width === 0 || height === 0) {
            return;
        }
        console.log(pixels, width, height);
        
        const imageData = new ImageData(pixels, width, height);
        canvasRef.current?.getContext('2d')?.putImageData(imageData, 0, 0);
    }, [pixels]);

    return <canvas ref={canvasRef} width={width} height={height} />;
}

export default ImageCanvas;