import React from 'react';
import Snowfall from 'react-snowfall';
import sf1 from './images/snowflake_1.png';
import sf2 from './images/snowflake_2.png';
import sf_s from './images/snowflake_special.png';
const MAX_SPEED = 20 as const;
const DEFAULT_AMOUNT = 150 as const;
const FACTOR = 0.7 as const;
interface Props {
    zIndex?: number;
}
const Winter = (props: Props) => {
    const [amount, setAmount] = React.useState(DEFAULT_AMOUNT + 0);
    const [wind, setWind] = React.useState(1);
    const [speed, setSpeed] = React.useState(1);
    const [images, setImages] = React.useState<HTMLImageElement[]>([]);

    React.useEffect(() => {
        let tx = 0;
        let ty = 0;
        const onMouse = (ev: MouseEvent) => {
            const mx = ev.movementX;
            const my = ev.movementY;
            let dt = Math.sqrt(mx * mx + my * my);
            setWind(Math.abs(mx) > 3 ? mx : 3 * Math.sign(mx));
            if (dt > MAX_SPEED) {
                dt = MAX_SPEED;
            }
            setSpeed(dt + 1);
            setAmount(dt + DEFAULT_AMOUNT);
        };
        const onTouch = (ev: TouchEvent) => {
            const x = ev.touches[0].clientX;
            const y = ev.touches[0].clientY;
            const mx = tx - x;
            const my = ty - y;
            tx = x;
            ty = y;
            let dt = Math.sqrt(mx * mx + my * my);
            setWind(mx);
            setSpeed(dt > MAX_SPEED ? MAX_SPEED : dt + 1);
            setAmount(dt + DEFAULT_AMOUNT);
        };
        window.addEventListener('mousemove', onMouse);
        window.addEventListener('touchmove', onTouch);
        return () => {
            window.removeEventListener('mousemove', onMouse);
            window.removeEventListener('touchmove', onTouch);
        };
    }, []);

    React.useEffect(() => {
        const imgs = [
            sf1,
            sf2,
            sf1,
            sf2,
            sf1,
            sf2,
            sf1,
            sf2,
            sf1,
            sf2,
            sf1,
            sf2,
            sf1,
            sf2,
            sf1,
            sf2,
            sf_s
        ].map((src) => {
            const img = new Image();
            img.src = src;
            return img;
        });
        setImages(imgs);
    }, []);

    React.useEffect(() => {
        const disposer = setInterval(() => {
            setSpeed((prev) => {
                if (prev > 1) {
                    return prev * FACTOR;
                }
                return prev;
            });
            setWind((prev) => {
                if (Math.abs(prev) > 1) {
                    return prev * FACTOR;
                }
                return prev;
            });
            setAmount((prev) => {
                if (prev > DEFAULT_AMOUNT) {
                    return prev * 0.9;
                }
                return prev;
            });
        }, 2000);
        return () => {
            clearInterval(disposer);
        };
    }, []);

    return (
        <div>
            <Snowfall
                style={{
                    position: 'fixed',
                    width: '100vw',
                    height: '100vh',
                    zIndex: props.zIndex
                }}
                snowflakeCount={amount}
                wind={[0 < wind ? 0 : wind, wind > 0 ? wind : 0]}
                speed={[0.1, speed]}
                radius={[5, 23]}
                images={images}
            />
        </div>
    );
};

export default Winter;
