import machine, onewire, ds18x20, time
'''
Setup a oneWire instance to communicate with any OneWire device
  rot -> 5v
  gelb -> gnd
  grün -> vcc (GPIO PIN)
'''
ds_pin = machine.Pin(2) # on D2
ds_sensor = ds18x20.DS18X20(onewire.OneWire(ds_pin))

roms = ds_sensor.scan()
print('')
print('::READY::')
t0 = time.ticks_ms()
while True:
  ds_sensor.convert_temp()
  for rom in roms:
    temp = ds_sensor.read_temp(rom)
    t_ms = time.ticks_ms() - t0
    print(f'{t_ms} {temp}')
  time.sleep_ms(1000)