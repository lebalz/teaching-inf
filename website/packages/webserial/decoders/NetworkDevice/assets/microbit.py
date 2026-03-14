from microbit import *
import radio
TTL_INIT = 10
ALLOW_PEER_TO_PEER = False
SEPARATOR = ' '

def pad0(text: str, n: int):
    return ("{0:0>" + str(n) + "}").format(text)

class IP:
    def __init__(self, ip):
        IP.validate(ip)
        self.ip = ip

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
        raw = radio.receive()
        if not raw:
            return
        msg = Message.parse(raw)
        if not msg:
            return
        self.process_message(msg)

    def send(self, dest, message):
        to = IP.parse(dest)
        msg = Message(self.ip, to, message)
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

    def __str__(self):
        return self.mode + SEPARATOR + self.ip

    def parse(self, config: str):
        parts = config.split(SEPARATOR)
        self.set_mode(parts[0], False)
        self.set_ip(parts[1], False)
        self.configure()
    
config = Config('client', '192.168.0.1')

while True:
    config.run()
    if button_b.was_pressed():
        if config.mode == Mode.CLIENT:
            config.set_mode(Mode.SWITCH)
        else:
            config.set_mode(Mode.CLIENT)
        display.show(config.icon)
        print(str(config))
    if button_a.was_pressed() and config.mode == Mode.CLIENT:
        config.device.send('192.168.0.2', 'Echo Foo Bar!')
        
    