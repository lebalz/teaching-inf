import React from 'react';

import ColorPicker from '@radial-color-picker/react-color-picker';
import Card from '@tdev-components/shared/Card';
import Slider from 'rc-slider/lib/Slider';
import 'rc-slider/assets/index.css';
import SliderInput from './SliderInput';

interface Props {}

const HslColorPicker = (props: Props) => {
    const [hue, setHue] = React.useState(0);
    const [luminance, setLuminance] = React.useState(50);
    const [saturation, setSaturation] = React.useState(100);
    return (
        <Card>
            <ColorPicker
                onChange={(hue) => {
                    setHue(hue);
                }}
                onInput={(hue) => {
                    setHue(hue);
                }}
                hue={hue}
                variant="persistent"
                luminosity={luminance}
                saturation={saturation}
            />

            <div>
                <SliderInput
                    label="Farbton (Hue)"
                    value={hue}
                    min={0}
                    max={360}
                    onChange={(value) => setHue(value)}
                />
                <SliderInput
                    label="Sättigung (Saturation)"
                    min={0}
                    max={100}
                    defaultValue={saturation}
                    onChange={(value) => setSaturation(value)}
                />
                <SliderInput
                    label="Helligkeit (Luminance)"
                    defaultValue={luminance}
                    onChange={(value) => {
                        setLuminance(value);
                    }}
                    min={0}
                    max={100}
                />
                Ausgewählte Farbe:{' '}
                <code>
                    hsl({Math.round(hue)}, {Math.round(saturation)}%, {Math.round(luminance)}%)
                </code>
            </div>
        </Card>
    );
};

export default HslColorPicker;
