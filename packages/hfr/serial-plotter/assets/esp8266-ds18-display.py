import machine, onewire, ds18x20, time
import ssd1306
import gfx
import gc

i2c = machine.I2C(scl=machine.Pin(5), sda=machine.Pin(4), freq=100000)
WIDTH = 64
HEIGHT = 48
GRAPH_OFFSET = 26
GRAPH_H = HEIGHT - GRAPH_OFFSET
oled = ssd1306.SSD1306_I2C(WIDTH, HEIGHT, i2c)
graphics = gfx.GFX(WIDTH, HEIGHT, oled.pixel)
data = []

WHITE = 0
BLACK = 1

ds_pin = machine.Pin(13)
ds_sensor = ds18x20.DS18X20(onewire.OneWire(ds_pin))
update_time = time.ticks_ms()

roms = ds_sensor.scan()
r0 = roms[0]

def update_display(n, temperature, measurements):
    oled.fill(0)
    nstr = str(n)
    oled.text(' ' * (8 - len(nstr)) + nstr, 0, 0, 1)
    temp = f'{temperature:.2f}'
    oled.text(temp + ' ' * (7 - len(temp)) + 'C', 0, 12, 1)
    graphics.circle(51, 16, 2, 1) 
    minval = min(measurements)
    maxval = max(measurements)
    step = max(1, WIDTH / len(measurements))
    diff = max(maxval - minval, 0.05)
    for i in range(len(measurements) - 1):
        x0 = int(i * step)
        x1 = int((i + 1) * step)
        y0 = HEIGHT - int((measurements[i] - minval) * GRAPH_H / diff) - 1
        y1 = HEIGHT - int((measurements[i + 1] - minval) * GRAPH_H / diff) - 1
        graphics.line(x0, y0, x1, y1, 1)

    oled.show()

print('')
print('::READY::')
t0 = time.ticks_ms()
i = 0
while True:
    i = i + 1
    ds_sensor.convert_temp()
    temp = ds_sensor.read_temp(r0)
    t_ms = time.ticks_ms() - t0

    data.append(temp)
    if len(data) > WIDTH:
        data.pop(0)
    update_display(i, temp, data)
    print(f'{t_ms} {temp}')
    time.sleep_ms(1000)
    if i % 5 == 0:
        gc.collect()
