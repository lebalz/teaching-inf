from microbit import running_time, display, Image, button_a, button_b, uart
from radio import config as r_config, on as r_on, off as r_off, send as r_send, receive as r_receive
from machine import unique_id

TTL_INIT = 10
SEPARATOR = ' '
RESET_TRIGGER = '::READY::'
CONFIG_FILE = 'config.txt'
PACKAGE_BUFFER_SIZE = 32
BROADCAST_MAC = 'FF:FF:FF:FF:FF:FF'
IP_LOOPBACK = '127.0.0.1'
MODE_CLIENT = 'client'
MODE_ROUTER = 'router'
MODE_SWITCH = 'switch'
MODES = (MODE_CLIENT, MODE_ROUTER, MODE_SWITCH)
SM_CONFIG = '::CONFIG::'
SM_SEND_L2 = '::L2::'
SM_SEND_L3 = '::L3::'
_ICONS = {
    MODE_CLIENT: '00000:09990:09090:09990:00000',
    MODE_SWITCH: '00090:99999:00000:99999:09000',
    MODE_ROUTER: '99099:90009:00900:90009:99099',
}

def mac_is_broadcast(mac):
    return str(mac).strip().upper() == BROADCAST_MAC

def microbit_mac():
    mid = hex(int.from_bytes(unique_id(), "little"))[6:]
    return ":".join(mid[i:i+2] for i in range(0, 12, 2)).upper()

def mac_parse(mac):
    mac = str(mac).strip().upper()
    parts = mac.split(':')
    if len(parts) != 6:
        return
    for p in parts:
        if len(p) != 2:
            return
        try:
            int(p, 16)
        except:
            return
    return mac

def ip_parse(ip):
    ip = str(ip).strip()
    parts = ip.split('.')
    if len(parts) != 4:
        return
    try:
        for p in parts:
            n = int(p)
            if n < 0 or n >= 256:
                return
        return ip
    except:
        return

def ip_numeric(ip):
    n = 0
    for p in ip.split('.'):
        n = (n << 8) | int(p)
    return n

def ip_binary(ip):
    return bin(ip_numeric(ip))[2:]

def ip_default_gateway(ip, mask=24):
    b = ip_binary(ip)
    binary = b[0:mask] + '0' * (31 - mask) + '1'
    num = int(binary, 2)
    return '.'.join(str((num >> (8 * i)) % 256) for i in range(3, -1, -1))

def ip_in_same_subnet(a, b, mask=24):
    return ip_binary(a)[0:mask] == ip_binary(b)[0:mask]

def ip_is_broadcast(ip, mask=24):
    binary = ip_binary(ip)[mask:]
    broadcast_addr = bin(2 ** (32 - mask) - 1)[2:]
    return binary == broadcast_addr

DEVICE_MAC = microbit_mac()

class EthernetFrame:
    __slots__ = ('_id', 'dest', 'src', 'payload', 'timestamp')
    def __init__(self, _id, dest, src, payload, timestamp=-1):
        self._id = _id
        self.dest = mac_parse(dest)
        self.src = mac_parse(src)
        if not self.dest or not self.src:
            raise Exception('Invalid MAC in EthernetFrame.' + str(dest) + ' -> ' + str(src))
        self.payload = payload
        self.timestamp = timestamp

    def __str__(self):
        return SEPARATOR.join((str(self.timestamp), str(self._id), self.dest, self.src, self.payload))

def parse_ethernet(data):
    parts = str(data).split(SEPARATOR)
    if len(parts) < 4:
        return
    try:
        ts = int(parts[0])
        _id = int(parts[1])
    except:
        return
    dest = mac_parse(parts[2])
    if not dest:
        return
    src = mac_parse(parts[3])
    if not src:
        return
    return EthernetFrame(_id, dest, src, SEPARATOR.join(parts[4:]), ts)

class ARPFrame:
    __slots__ = ('sender_mac', 'sender_ip', 'dest_ip')
    def __init__(self, sender_mac, sender_ip, dest_ip):
        self.sender_mac = mac_parse(sender_mac)
        self.sender_ip = ip_parse(sender_ip)
        self.dest_ip = ip_parse(dest_ip)

    def __str__(self):
        return SEPARATOR.join(('ARP', str(self.sender_mac), str(self.sender_ip), str(self.dest_ip)))

def parse_arp(data):
    parts = data.split(SEPARATOR)
    if len(parts) != 4 or parts[0] != 'ARP':
        return
    sender_mac = mac_parse(parts[1])
    if not sender_mac:
        return
    sender_ip = ip_parse(parts[2])
    if not sender_ip:
        return
    dest_ip = ip_parse(parts[3])
    if not dest_ip:
        return
    return ARPFrame(sender_mac, sender_ip, dest_ip)

class IPFrame:
    __slots__ = ('ttl', 'src', 'dest', 'payload')
    def __init__(self, src, dest, payload, ttl=TTL_INIT):
        self.ttl = ttl
        self.src = src
        self.dest = dest
        self.payload = payload

    def __str__(self):
        return SEPARATOR.join(('IP', str(self.ttl), self.src, self.dest, self.payload))

def parse_ip_frame(data):
    parts = data.split(SEPARATOR)
    if len(parts) < 4 or parts[0] != 'IP':
        return
    try:
        ttl = int(parts[1])
    except:
        return
    src = ip_parse(parts[2])
    if not src:
        return
    dest = ip_parse(parts[3])
    if not dest:
        return
    return IPFrame(src, dest, SEPARATOR.join(parts[4:]), ttl)

class Device:
    __slots__ = ('ip', 'default_gateway', 'default_gateway_mac', 'network_mask', 'radio_power', 'radio_group', 'radio_address', 'pending_serial_messages', '_received_pkg_ids', '_received_pkg_ids_idx', '_pkg_id', '_pending_frames')

    def __init__(self, ip, default_gateway, network_mask, radio_address, radio_group, radio_power):
        self.ip = ip
        self.default_gateway = default_gateway
        self.default_gateway_mac = None
        self.network_mask = network_mask
        self.radio_power = radio_power
        self.radio_group = radio_group
        self.radio_address = radio_address
        r_off()
        r_config(length=128, group=radio_group, power=radio_power, address=radio_address)
        r_on()
        self.pending_serial_messages = []
        self._received_pkg_ids = [None] * PACKAGE_BUFFER_SIZE
        self._received_pkg_ids_idx = 0
        self._pkg_id = 0
        self._pending_frames = []

    def process_message(self, pkg, received_at):
        if pkg.timestamp < 1:
            return
        if pkg.dest == DEVICE_MAC or mac_is_broadcast(pkg.dest):
            print(pkg)

    def run(self):
        if uart.any():
            data = uart.readline()
            text = ''
            while data:
                text += data.decode('utf-8')
                data = uart.readline()
            if text.strip():
                self.pending_serial_messages.append(text.strip())
        raw = r_receive()
        if not raw:
            return
        print('Raw', raw)
        pkg = parse_ethernet(raw)
        timestamp = running_time()
        if not pkg:
            return
        if self._is_double_receive(pkg):
            return
        if mac_is_broadcast(pkg.dest) and pkg.src == DEVICE_MAC:
            return
        self.process_message(pkg, timestamp)
        self._process_pending_frames()

    def _process_pending_frames(self):
        if not self._pending_frames:
            return
        now = running_time()
        i = 0
        while i < len(self._pending_frames):
            if now - self._pending_frames[i][0] >= 500:
                self._pending_frames.pop(i)
            else:
                i += 1
        i = 0
        while i < len(self._pending_frames):
            ts, to, data = self._pending_frames[i]
            if self.can_deliver_l3(to):
                self._pending_frames.pop(i)
                r_send(str(self.create_ip_frame(to, data)))
            else:
                i += 1

    def can_deliver_l3(self, dest):
        return False

    def _is_double_receive(self, pkg):
        if pkg.timestamp < 0:
            return False
        pkg_id = (pkg._id, pkg.src)
        if pkg_id in self._received_pkg_ids:
            return True
        self._received_pkg_ids[self._received_pkg_ids_idx] = pkg_id
        self._received_pkg_ids_idx = (self._received_pkg_ids_idx + 1) % PACKAGE_BUFFER_SIZE
        return False

    def send_L2(self, dest, data):
        to = mac_parse(dest)
        if not to:
            return print('ERROR: Invalid destination MAC.')
        msg = EthernetFrame(self._pkg_id, to, DEVICE_MAC, str(data))
        self._pkg_id += 1
        if to == DEVICE_MAC:
            return print(msg)
        r_send(str(msg))

    def send_arp(self, dest_ip, timestamp=-1):
        arp = ARPFrame(DEVICE_MAC, self.ip, dest_ip)
        r_send(str(EthernetFrame(self._pkg_id, BROADCAST_MAC, DEVICE_MAC, str(arp), timestamp)))
        self._pkg_id += 1

class Switch(Device):
    __slots__ = ('mac_table',)

    def __init__(self, radio_address, radio_group, radio_power):
        super().__init__(None, None, 24, radio_address, radio_group, radio_power)
        self.mac_table = {}

    def process_message(self, msg, received_at):
        is_known_dest = self.mac_table.get(msg.dest, -1) > 0
        if msg.timestamp > 0:
            return
        if msg.timestamp == -1:
            self.mac_table[msg.src] = received_at
            msg.timestamp = received_at
        if not is_known_dest:
            msg.timestamp = 0
        print(msg)
        if msg.dest == DEVICE_MAC:
            return
        r_send(str(msg))

class Client(Device):
    __slots__ = ()

    def handle_package(self, pkg):
        arp_frame = parse_arp(pkg.payload)
        if arp_frame and arp_frame.dest_ip == self.ip and arp_frame.sender_ip == self.default_gateway:
            self.default_gateway_mac = arp_frame.sender_mac
        print(pkg)

    def process_message(self, pkg, received_at):
        if pkg.timestamp < 0:
            return
        if pkg.timestamp == 0 and pkg.src == DEVICE_MAC:
            return
        if pkg.dest == DEVICE_MAC or mac_is_broadcast(pkg.dest):
            self.handle_package(pkg)

    def create_ip_frame(self, dest_ip, data):
        ipframe = IPFrame(self.ip, dest_ip, data)
        pkg = EthernetFrame(self._pkg_id, self.default_gateway_mac, DEVICE_MAC, str(ipframe))
        self._pkg_id += 1
        return pkg

    def can_deliver_l3(self, dest_ip):
        return not self.default_gateway_mac

    def send_L3(self, dest, data):
        if not self.default_gateway:
            return print('ERROR: No default gateway configured.')
        if not self.ip:
            return print('ERROR: No IP address configured.')
        to = ip_parse(dest)
        if not to:
            return print('ERROR: Invalid destination IP.')
        if not self.default_gateway_mac:
            self._pending_frames.append((running_time(), to, data))
            self.send_arp(self.default_gateway)
            return
        msg = self.create_ip_frame(to, data)
        if to == self.ip:
            return print(msg)
        r_send(str(msg))

class Router(Device):
    __slots__ = ('mac_table', 'ip_table')

    def __init__(self, ip, default_gateway, network_mask, radio_address, radio_group, radio_power):
        super().__init__(ip, default_gateway, network_mask, radio_address, radio_group, radio_power)
        if not self.ip:
            raise Exception('Router must have a valid IP.')
        self.mac_table = {}
        self.ip_table = {}

    def create_ip_frame(self, dest_ip, data):
        next_hop_mac = self.ip_table[dest_ip]
        pkg = EthernetFrame(self._pkg_id, next_hop_mac, DEVICE_MAC, data)
        self._pkg_id += 1
        return pkg

    def can_deliver_l3(self, dest_ip):
        return dest_ip in self.ip_table

    def process_message(self, msg, received_at):
        is_known_dest = self.mac_table.get(msg.dest, -1) > 0
        if msg.timestamp > 0:
            return
        if msg.timestamp == -1:
            self.mac_table[msg.src] = received_at
        ip_frame = parse_ip_frame(msg.payload)
        if ip_frame:
            self.ip_table[ip_frame.src] = msg.src
            if ip_frame.dest == self.ip:
                print(ip_frame)
                return
            else:
                ip_frame.ttl -= 1
                if ip_frame.ttl < 1:
                    return
                if ip_is_broadcast(ip_frame.dest, self.network_mask):
                    r_send(str(EthernetFrame(self._pkg_id, BROADCAST_MAC, DEVICE_MAC, str(ip_frame))))
                    self._pkg_id += 1
                    return
                if ip_frame.dest in self.ip_table:
                    r_send(str(self.create_ip_frame(ip_frame.dest, str(ip_frame))))
                elif ip_in_same_subnet(self.ip, ip_frame.dest, self.network_mask):
                    self._pending_frames.append((running_time(), ip_frame.dest, str(ip_frame)))
                    self.send_arp(ip_frame.dest, received_at)
                else:
                    print(ip_frame)
                    return
        else:
            arp_frame = parse_arp(msg.payload)
            if arp_frame:
                if arp_frame.dest_ip == self.ip:
                    print(msg)
                    self.ip_table[arp_frame.sender_ip] = arp_frame.sender_mac
                    self.send_arp(arp_frame.sender_ip, received_at)
                return
            if not is_known_dest:
                msg.timestamp = 0
            print(msg)
            if msg.dest == DEVICE_MAC:
                return
            r_send(str(msg))

def parse_config_value(value, is_int=False, default=None):
    if value == 'None':
        return default
    if not is_int:
        return value
    try:
        return int(value)
    except:
        return default

def parse_serial(message):
    parts = message.split(SEPARATOR)
    code = parts[0]
    if code == SM_CONFIG:
        if len(parts) == 7:
            return ('set_config', SEPARATOR.join(parts[1:]))
        if len(parts) == 1:
            return ('get_config',)
    elif code == SM_SEND_L2 and len(parts) >= 3:
        mac = mac_parse(parts[1])
        if not mac:
            return
        return ('send_L2', mac, SEPARATOR.join(parts[2:]).strip())
    elif code == SM_SEND_L3 and len(parts) >= 3:
        ip = ip_parse(parts[1])
        msg = SEPARATOR.join(parts[2:]).strip()
        if not ip or not msg:
            return
        return ('send_L3', ip, msg)

class Config:
    __slots__ = ('mode', 'ip', 'default_gateway', 'radio', 'network_mask', 'device', 'changed')

    def __init__(self, mode, ip=None):
        self.mode = MODE_CLIENT
        self.ip = None
        self.default_gateway = None
        self.radio = (None, None, 4)
        self.network_mask = 24
        self.device = None
        self.changed = False
        self.configure(mode, ip, None, None, None, 4, True)

    def set_mode(self, mode, skip_dump=False):
        self.configure(mode, self.ip, self.default_gateway, self.radio[0], self.radio[1], self.radio[2], skip_dump)

    def configure(self, mode, ip=None, default_gateway=None, address=None, group=None, power=None, skip_dump=False):
        new_ip = ip_parse(str(ip))
        self.ip = new_ip
        new_dg = ip_parse(str(default_gateway))
        if not new_dg and new_ip:
            new_dg = ip_default_gateway(new_ip, self.network_mask)
        self.default_gateway = new_dg

        if mode in MODES:
            self.mode = mode
        val_addr = address if address is not None else (ip_numeric(new_dg) if new_dg else int(0x75626974))
        val_group = group if group is not None else (int(ip_binary(new_ip)[self.network_mask - 8:self.network_mask], 2) if new_ip else 0)
        val_power = power if power is not None else 4
        self.radio = (val_addr, val_group, val_power)

        if self.mode == MODE_CLIENT:
            self.device = Client(self.ip, self.default_gateway, self.network_mask, val_addr, val_group, val_power)
        elif self.mode == MODE_SWITCH:
            self.device = Switch(val_addr, val_group, val_power)
        elif self.mode == MODE_ROUTER:
            if not self.ip:
                print('ERROR: Router must have a valid IP.')
                return self.configure(MODE_CLIENT, ip, default_gateway, address, group, power, skip_dump)
            self.device = Router(self.ip, self.default_gateway, self.network_mask, val_addr, val_group, val_power)
        self.changed = True
        if not skip_dump:
            self.dump()

    def configure_from_string(self, config_str):
        parts = config_str.split(SEPARATOR)
        if len(parts) != 6:
            return
        p = parse_config_value
        print(config_str)
        self.configure(p(parts[0]), p(parts[1]), p(parts[2]), p(parts[3], True), p(parts[4], True), p(parts[5], True, 4))

    def dump(self):
        with open(CONFIG_FILE, 'w') as file:
            file.write(str(self))

    def restore(self):
        from os import listdir
        if CONFIG_FILE in listdir():
            with open(CONFIG_FILE) as file:
                self.configure_from_string(file.read())

    def run(self):
        self.device.run()
        if self.device.pending_serial_messages:
            for text in self.device.pending_serial_messages:
                msg = parse_serial(text)
                if msg:
                    if msg[0] == 'set_config':
                        self.configure_from_string(msg[1])
                    elif msg[0] == 'get_config':
                        self.send_config()
                    elif msg[0] == 'send_L2':
                        self.device.send_L2(msg[1], msg[2])
                    elif msg[0] == 'send_L3':
                        self.device.send_L3(msg[1], msg[2])
            self.device.pending_serial_messages = []

    def __str__(self):
        return SEPARATOR.join((self.mode, str(self.ip), str(self.default_gateway), str(self.radio[0]), str(self.radio[1]), str(self.radio[2])))

    def send_config(self):
        print(DEVICE_MAC + SEPARATOR + str(self))


print(RESET_TRIGGER)
config = Config(MODE_CLIENT)
config.restore()
display.show(Image(_ICONS[config.mode]))
while True:
    config.run()
    if button_b.was_pressed():
        if config.mode == MODE_CLIENT:
            config.set_mode(MODE_SWITCH)
        elif config.mode == MODE_SWITCH:
            config.set_mode(MODE_ROUTER)
        else:
            config.set_mode(MODE_CLIENT)
    if config.changed:
        config.changed = False
        display.show(Image(_ICONS[config.mode]))
        config.send_config()
    if button_a.was_pressed():
        if config.device.ip:
            config.device.send_L3(IP_LOOPBACK, 'Ping')
        else:
            config.device.send_L2(DEVICE_MAC, 'Ping')
