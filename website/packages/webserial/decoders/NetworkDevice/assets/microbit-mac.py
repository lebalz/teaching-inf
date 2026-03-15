from microbit import *
import radio
import machine
import os

TTL_INIT = 10
ALLOW_PEER_TO_PEER = False
SEPARATOR = ' '
RESET_TRIGGER = '::READY::'
CONFIG_FILE = 'config.txt'

def pad0(text: str, n: int):
    return ("{0:0>" + str(n) + "}").format(text)

class MAC:
    BROADCAST_MAC = 'FF:FF:FF:FF:FF:FF'

    @staticmethod
    def is_broadcast(mac: str):
        return str(mac).strip().upper() == MAC.BROADCAST_MAC
    
    @staticmethod
    def microbit_mac():
        mid = hex(int.from_bytes(machine.unique_id(), "little"))[6:]
        return ":".join(mid[i:i+2] for i in range(0, 12, 2)).upper()

    @staticmethod
    def validate(mac: str):
        parts = str(mac).strip().split(':')
        if len(parts) != 6:
            raise Exception('MAC "' + mac + '" is invalid.')
        valid = [len(p) == 2 and int(p, 16) < 256 for p in parts]
        if sum(valid) != 6:
            raise Exception('MAC "' + mac + '" has invalid parts.')
    
    @staticmethod
    def parse(mac: str):
        try:
            MAC.validate(mac)
        except:
            print('MAC "' + mac + '" has invalid parts.')
            return
        return str(mac).strip().upper()

class IP:
    UNCONFIGURED = '0.0.0.0'
    LOOPBACK = '127.0.0.1'

    def __init__(self, ip):
        _ip = str(ip).strip()
        IP.validate(_ip)
        self.ip = _ip

    @property
    def is_loopback(self):
        return self.ip == IP.LOOPBACK

    @property
    def parts(self):
        return self.ip.split('.')

    @property
    def numeric(self):
        return int(''.join([pad0(hex(int(p))[2:], 2) for p in self.parts]), 16)

    @property
    def binary(self):
        return bin(self.numeric)[2:]

    def default_gateway_hex(self, mask = 24):
        binary = self.binary[0:mask] + '0' * (31 - mask) + '1'
        num = int(binary, 2)
        return hex(num)

    def is_broadcast(self, mask = 24):
        binary = self.binary[mask:]
        broadcast_addr = bin(2 ** (32 - mask) - 1)[2:]
        return binary == broadcast_addr

    def __eq__(self, other):
        if isinstance(other, IP):
            return self.ip == other.ip
        if type(other) == str:
            return self.ip == other
        return NotImplemented

    def __repr__(self):
        return 'IP(' + self.ip + ')'

    def __str__(self):
        return self.ip

    
    @staticmethod
    def validate(ip: str):
        parts = ip.strip().split('.')
        if len(parts) != 4:
            raise Exception('IP "' + ip + '" is invalid.')
        parts = [int(p) for p in parts]
        valid = [n >= 0 and n < 256 for n in parts]
        if sum(valid) != 4:
            raise Exception('IP "' + ip + '" has out of range parts.')
        

    @staticmethod
    def parse(ip: str):
        parts = str(ip).strip().split('.')
        if len(parts) != 4:
            return
        try:
            parts = [int(p) for p in parts]
            valid = [n >= 0 and n < 256 for n in parts]
            if sum(valid) == 4:
                return IP(ip)
        except:
            print('IP "' + ip + '" has non-integer parts.')
            return

class EthernetFrame:
    def __init__(self, dest, src, payload, timestamp = -1):
        self.dest = MAC.parse(dest)
        self.src = MAC.parse(src)
        if not self.dest or not self.src:
            raise Exception('Invalid MAC address in Ethernet frame.')
        self.payload = payload
        self.timestamp = timestamp
    
    def reset_timestamp(self):
        self.timestamp = -1

    @staticmethod
    def parse(data, timestamp):
        parts = data.split(SEPARATOR)
        if len(parts) < 4:
            return
        try:
            ts = int(parts[0])
        except:
            return
        if ts < 0:
            ts = timestamp
        dest = MAC.parse(parts[1])
        if not dest:
            return
        src = MAC.parse(parts[2])
        if not src:
            return
        payload = SEPARATOR.join(parts[3:])
        return EthernetFrame(dest, src, payload, ts)
    
    def __str__(self):
        # TIMESTAMP, DEST, SRC, HOPS, PAYLOAD
        return str(self.timestamp) + SEPARATOR + str(self.dest) + SEPARATOR + str(self.src) + SEPARATOR + self.payload

    def __repr__(self):
        return 'EthernetFrame(' + self.__str__() + ')'

class IPFrame:
    def __init__(self, src, dest, payload, ttl = TTL_INIT):
        self.ttl = ttl
        self.src = IP(src)
        self.dest = IP(dest)
        self.payload = payload

    @staticmethod
    def parse(data):
        parts = data.split(SEPARATOR)
        if len(parts) < 3:
            return
        try:
            ttl = int(parts[0])
        except:
            return
        src = IP.parse(parts[1])
        if not src:
            return
        dest = IP.parse(parts[2])
        if not dest:
            return
        payload = SEPARATOR.join(parts[3:])
        return IPFrame(src, dest, payload, ttl)

    def decrement_ttl(self):
        self.ttl -= 1
    
    def __str__(self):
        return str(self.ttl) + SEPARATOR + str(self.src) + SEPARATOR + str(self.dest) + SEPARATOR + self.payload

    def __repr__(self):
        return 'IPFrame(' + self.__str__() + ')'


class Mode:
    CLIENT = 'client'
    ROUTER = 'router'
    SWITCH = 'switch'

class Device:
    MAC = MAC.microbit_mac()

    def __init__(self, ip=None, network_mask=24, power=4):
        self.ip = IP.parse(ip if ip else IP.UNCONFIGURED)
        IP.validate(self.ip)
        # cidr notation, e.g. 24 for 255.255.255.0
        self.network_mask = network_mask
        self.power = power
        self.configure()
        self.pending_serial_messages = []

    def configure(self):
        radio.off()
        address = self.ip.default_gateway_hex(self.network_mask)
        group = int(self.ip.binary[self.network_mask - 8:self.network_mask], 2)
        radio.config(length=128, group=group, power=self.power, address=int(address))
        radio.on()

    def process_message(self, pkg: EthernetFrame):
        if pkg.dest == self.MAC or MAC.is_broadcast(pkg.dest):
            print(msg)

    def run(self):
        if uart.any():
            data = uart.readline()
            text = ''
            while data:
                text += data.decode('utf-8')
                data = uart.readline()
            if text.strip():
                self.pending_serial_messages.append(text.strip())
        raw = radio.receive_full()
        if not raw:
            return
        msg, rssi, timestamp = raw
        data = EthernetFrame.parse(raw, timestamp)
        if not data:
            return
        self.process_message(data)

    def send(self, dest, data):
        to = MAC.parse(dest)
        if not to:
            return
        msg = EthernetFrame(to, self.MAC, str(data))
        if to == self.MAC:
            return print(msg)
        radio.send(str(msg))

class Client(Device):
    def __init__(self, ip, network_mask=24, power=4):
        super().__init__(ip, network_mask, power)

class Switch(Device):
    def __init__(self, ip, network_mask=24, power=4):
        super().__init__(ip, network_mask, power)
        self.mac_table = {}

    def process_message(self, msg: EthernetFrame):
        if msg.dest in self.mac_table:
            # ok, we know the destination and can send the message directly with a set timestamp
        else:
            # we don't know the destination, so we flood the message to all other devices, but we reset the timestamp to filter out duplicates
            msg.reset_timestamp()

        # learn the source MAC
        # TODO: ditch messages with older timestamps
        self.mac_table[msg.src] = msg.timestamp

        if msg.src in self.mac_table:
            if msg.timstamp > 0:
        else:
        print(msg)
        if msg.dest == self.MAC:
            return
        # just flood the message to all other devices, no port concept possible with micro:bit radio
        radio.send(str(msg))

class Router(Device):
    def __init__(self, ip, network_mask=24, power=4):
        super().__init__(ip, network_mask, power)

    def process_message(self, msg: Message):
        if msg.dest == self.ip:
            print(msg)
            return
        if msg.dest.binary[0:self.network_mask] != self.ip.binary[0:self.network_mask]:
            return
        print(msg)
        msg.decrement_ttl()
        radio.send(str(msg))

class SerialMessage:
    CONFIG = '::CONFIG::'
    SEND = '::SEND::'

    @staticmethod
    def parse(message: str):
        parts = message.split(SEPARATOR)
        if len(parts) < 1:
            return
        code = parts[0]
        if code == SerialMessage.CONFIG and len(parts) == 3:
            return {
                'type': 'set_config',
                'mode': parts[1],
                'ip': parts[2]
            }
        elif code == SerialMessage.CONFIG and len(parts) == 1:
            return {
                'type': 'get_config'
            }
        elif code == SerialMessage.SEND and len(parts) >= 3:
            ip = IP.parse(parts[1])
            msg = SEPARATOR.join(parts[2:])
            if not ip or not msg.strip():
                return
            return {
                'type': 'send',
                'dest': str(ip),
                'message': msg.strip()
            }
        else:
            return    

class Config:
    mode: str
    ip: str
    device: Device
    def __init__(self, mode, ip):
        self.mode = 'client'
        self.ip = '192.168.0.1'
        self.set_ip(ip, False)
        self.set_mode(mode, False)
        self.configure(True)

    def set_ip(self, ip: str, reconfigure = False):
        if IP.parse(ip):
            self.ip = ip.strip()
            if reconfigure:
                self.configure()

    def set_mode(self, mode, reconfigure = False):
        if mode in [Mode.CLIENT, Mode.ROUTER, Mode.SWITCH] and mode != self.mode:
            self.mode = mode
            if reconfigure:
                self.configure()

    def configure(self, skipDump = False):
        if self.mode == Mode.CLIENT:
            self.device = Client(self.ip)
        elif self.mode == Mode.SWITCH:
            self.device = Switch(self.ip)
        if skipDump:
            return
        self.dump()

    @property
    def icon(self):
        if self.mode == Mode.CLIENT:
            return Image('00000:09990:09090:09990:0000')
        elif self.mode == Mode.SWITCH:
            return Image('00090:99999:00000:99999:09000')
        elif self.mode == Mode.ROUTER:
            return Image('99099:90009:00900:90009:99099')
        else:
            return '?'

    def run(self):
        self.device.run()
        if len(self.device.pending_serial_messages) > 0:
            for text in self.device.pending_serial_messages:
                msg = SerialMessage.parse(text)
                if msg:
                    if msg['type'] == 'set_config':
                        self.set_mode(msg['mode'])
                        self.set_ip(msg['ip'])
                        self.configure()
                    elif msg['type'] == 'get_config':
                        print(str(self))
                    elif msg['type'] == 'send':
                        self.device.send(msg['dest'], msg['message'])
            self.device.pending_serial_messages = []

    def __str__(self):
        return self.mode + SEPARATOR + self.ip

    def restore(self):
        files = os.listdir()
        if CONFIG_FILE in files:
            with open(CONFIG_FILE) as file:
                parts = file.read().split(SEPARATOR)
            if len(parts) == 2:
                self.set_mode(parts[0])
                self.set_ip(parts[1])
                self.configure()

    def dump(self):
        with open(CONFIG_FILE, 'w') as file:
            file.write(self.mode + SEPARATOR + str(self.ip))
        
        

print(RESET_TRIGGER)

config = Config('client', '192.168.12.1')
config.restore()
display.show(config.icon)
current_config = str(config)
print(current_config)
while True:
    config.run()
    if button_b.was_pressed():
        if config.mode == Mode.CLIENT:
            config.set_mode(Mode.SWITCH, True)
        else:
            config.set_mode(Mode.CLIENT, True)
    str_config = str(config)
    if str_config != current_config:
        current_config = str_config
        display.show(config.icon)
        print(current_config)
    if button_a.was_pressed():
        config.device.send(IP.LOOPBACK, 'Ping')
        
    