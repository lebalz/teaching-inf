import { useExtensionStore } from '@tdev/pyodide-code/hooks/useExtensionStore';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import type { KeyboardEvent, MouseEvent } from 'react';
import iconExtension from '../../../client';
import { getIconPath } from '../../../icons';
import styles from './styles.module.scss';

interface IconGameProps {
    sceneId: string;
    className?: string;
}

const SCROLL_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '];

const IconGame = observer(({ sceneId, className }: IconGameProps) => {
    const store = useExtensionStore(iconExtension);
    const scene = store.useScene(sceneId);
    const { width, height, background_color, icons, show_fps, fps } = scene.snapshot;

    const handleClick = (event: MouseEvent<SVGSVGElement>) => {
        event.currentTarget.focus({ preventScroll: true });
        const bounds = event.currentTarget.getBoundingClientRect();
        if (bounds.width <= 0 || bounds.height <= 0) {
            return;
        }
        const x = ((event.clientX - bounds.left) / bounds.width) * width;
        const y = ((event.clientY - bounds.top) / bounds.height) * height;
        scene.handleClick(x, y);
    };

    const handleKeyDown = (event: KeyboardEvent<SVGSVGElement>) => {
        if (!scene.isConnected) {
            return;
        }
        if (SCROLL_KEYS.includes(event.key)) {
            event.preventDefault();
        }
        scene.handleKey(event.key);
    };

    return (
        <div className={clsx(styles.container, className)}>
            <svg
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                className={clsx(styles.scene)}
                role="application"
                aria-label={`Icon-Szene ${sceneId}`}
                tabIndex={0}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
            >
                <rect width={width} height={height} fill={background_color} />
                <g>
                    {icons.map((icon) => (
                        <path
                            key={icon.id}
                            d={getIconPath(icon.name)}
                            fill={icon.color}
                            transform={`translate(${icon.x} ${icon.y}) rotate(${icon.rotation}) scale(${icon.size / 12}) translate(-12 -12)`}
                        />
                    ))}
                </g>
                {show_fps && (
                    <text x={width - 8} y={18} textAnchor="end" className={styles.fps}>
                        {scene.isConnected ? fps : 0} FPS
                    </text>
                )}
            </svg>
            <span role="status" className={clsx(styles.status)}>
                {scene.isConnected ? 'Klicke auf ein Icon.' : 'Starte zuerst das Python-Programm.'}
            </span>
        </div>
    );
});

export default IconGame;
