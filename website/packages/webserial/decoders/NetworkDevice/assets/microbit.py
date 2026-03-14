from microbit import *
import radio
TTL_INIT = 10
ALLOW_PEER_TO_PEER = False
SEPARATOR = ' '
RESET_TRIGGER = '::READY::'

def pad0(text: str, n: int):
    return ("{0:0>" + str(n) + "}").format(text)

class IP:
    LOOPBACK = '127.0.0.1'

    def __init__(self, ip):
        IP.validate(ip)
        self.ip = ip.strip()

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
        parts = ip.strip().split('.')
        if len(parts) != 4:
            return
        try:
            parts = [int(p) for p in parts]
            valid = [n >= 0 and n < 256 for n in parts]
            if sum(valid) == 4:
                return IP(ip)
        except:
            return

class Message:
    def __init__(self, src, dest, message, ttl = TTL_INIT):
        self.src = src if type(src) is IP else IP(src)
        self.dest = dest if type(src) is IP else IP(dest)
        self.message = message
        self.ttl = ttl

    @staticmethod
    def parse(message):
        parts = message.split(SEPARATOR)
        if len(parts) < 3:
            return
        ttl = int(parts[0])
        src = IP.parse(parts[1])
        if not src:
            return
        dest = IP.parse(parts[2])
        if not dest:
            return
        msg = SEPARATOR.join(parts[3:])
        return Message(src, dest, msg, ttl)

    def decrement_ttl(self):
        self.ttl -= 1
    
    def __str__(self):
        return str(self.ttl) + ' ' + str(self.src) + SEPARATOR + str(self.dest) + SEPARATOR + self.message

    def __repr__(self):
        return 'Message(' + self.__str__() + ')'


class Mode:
    CLIENT = 'client'
    ROUTER = 'router'
    SWITCH = 'switch'

class Device:
    def __init__(self, ip, power=4):
        myip = IP.parse(ip)
        if not myip:
            raise Exception('IP "' + ip + '" is invalid.')
        self.ip = myip
        self.config(power)
        self.pending_serial_messages = []

    def config(self, power = 4):
        radio.off()
        group = int(self.ip.parts[3])
        radio.config(length=128, group=group, power=power)
        radio.on()

    def process_message(self, msg: Message):
        # drop dead packages or packages sent peer to peer
        if msg.ttl <= 0 or (not ALLOW_PEER_TO_PEER and msg.ttl == TTL_INIT):
            return
        if msg.dest.ip == self.ip.ip:
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
        raw = radio.receive()
        if not raw:
            return
        msg = Message.parse(raw)
        if not msg:
            return
        self.process_message(msg)

    def send(self, dest, message):
        to = IP.parse(dest)
        if not to:
            return
        msg = Message(self.ip, to, message)
        if to.is_loopback:
            return print(msg)
        radio.send(str(msg))
        

class Client(Device):
    def __init__(self, ip):
        super().__init__(ip)

class Switch(Device):
    def __init__(self, ip, suffix = 24):
        super().__init__(ip)
        self.suffix = suffix

    def process_message(self, msg: Message):
        if msg.dest == self.ip:
            print(msg)
            return
        if msg.dest.binary[0:self.suffix] != self.ip.binary[0:self.suffix]:
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
        self.configure()

    def set_ip(self, ip: str, reconfigure = True):
        if IP.parse(ip):
            self.ip = ip.strip()
            if reconfigure:
                self.configure()

    def set_mode(self, mode, reconfigure = True):
        if mode in [Mode.CLIENT, Mode.ROUTER, Mode.SWITCH] and mode != self.mode:
            self.mode = mode
            if reconfigure:
                self.configure()

    def configure(self):
        if self.mode == Mode.CLIENT:
            self.device = Client(self.ip)
        elif self.mode == Mode.SWITCH:
            self.device = Switch(self.ip)

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
                        self.set_mode(msg['mode'], False)
                        self.set_ip(msg['ip'], False)
                        self.configure()
                    elif msg['type'] == 'get_config':
                        print(str(self))
                    elif msg['type'] == 'send':
                        self.device.send(msg['dest'], msg['message'])
            self.device.pending_serial_messages = []

    def __str__(self):
        return self.mode + SEPARATOR + self.ip

print(RESET_TRIGGER)
config = Config('client', '192.168.0.1')
display.show(config.icon)
current_config = str(config)
print(current_config)
while True:
    config.run()
    if button_b.was_pressed():
        if config.mode == Mode.CLIENT:
            config.set_mode(Mode.SWITCH)
        else:
            config.set_mode(Mode.CLIENT)
    str_config = str(config)
    if str_config != current_config:
        current_config = str_config
        display.show(config.icon)
        print(current_config)
    if button_a.was_pressed():
        config.device.send(config.ip, 'Ping')
        
    