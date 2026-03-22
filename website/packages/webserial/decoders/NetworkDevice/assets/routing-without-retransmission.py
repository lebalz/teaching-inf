from micropython import const
from microbit import running_time, display, Image, button_a, button_b, uart
import radio
from machine import unique_id
from os import listdir

TTL_INIT = const(10)
SEPARATOR = ' '
RESET_TRIGGER = '::READY::'
CONFIG_FILE = 'config.txt'
PACKAGE_BUFFER_SIZE = const(32)
DEFAULT_POWER = const(4)

def report(message):
    print(message)

def report_error(message):
    print('ERROR: ' + message)

_uid = hex(int.from_bytes(unique_id(), "little"))[6:]
BBC_MAC = ":".join(_uid[i:i+2] for i in range(0, 12, 2)).upper()
del _uid
BROADCAST_MAC = 'FF:FF:FF:FF:FF:FF'

def is_broadcast_mac(mac):
    return str(mac).strip().upper() == BROADCAST_MAC

def parse_mac(mac):
    parts = str(mac).strip().split(':')
    if len(parts) != 6:
        return
    try:
        for p in parts:
            if len(p) != 2 or int(p, 16) >= 256:
                return
    except:
        return
    return str(mac).strip().upper()



def parse_ip(ip):
    parts = str(ip).strip().split('.')
    if len(parts) != 4:
        return
    try:
        for p in parts:
            n = int(p)
            if n < 0 or n >= 256:
                return
        return IP(ip)
    except:
        return

class IP:
    def __init__(self, ip):
        self.ip = str(ip).strip()

    @property
    def numeric(self):
        n = 0
        for p in self.ip.split('.'):
            n = (n << 8) | int(p)
        return n

    @property
    def binary(self):
        return bin(self.numeric)[2:]

    def default_gateway(self, mask = 24):
        binary = self.binary[0:mask] + '0' * (31 - mask) + '1'
        num = int(binary, 2)
        return IP('.'.join([str((num >> (8 * i)) % 256) for i in range(4)[::-1]]))

    def is_broadcast(self, mask=24):
        return self.binary[mask:] == bin(2 ** (32 - mask) - 1)[2:]

    def __eq__(self, other):
        if isinstance(other, IP):
            return self.ip == other.ip
        if type(other) == str:
            return self.ip == other
        return NotImplemented

    def __str__(self):
        return self.ip

def parse_eth(data):
    parts = str(data).split(SEPARATOR)
    if len(parts) < 4:
        return
    try:
        ts = int(parts[0])
        _id = int(parts[1])
    except:
        return
    dest = parse_mac(parts[2])
    if not dest:
        return
    src = parse_mac(parts[3])
    if not src:
        return
    payload = SEPARATOR.join(parts[4:])
    return EthernetFrame(_id, dest, src, payload, ts)

class EthernetFrame:
    def __init__(self, _id, dest, src, payload, timestamp=-1):
        self._id = _id
        self.dest = dest
        self.src = src
        self.payload = payload
        self.timestamp = timestamp

    def set_timestamp(self, timestamp):
        self.timestamp = timestamp

    def __str__(self):
        return SEPARATOR.join((str(self.timestamp), str(self._id), self.dest, self.src, self.payload))


def parse_arp(data):
    parts = data.split(SEPARATOR)
    if len(parts) != 4:
        return
    if parts[0] != 'ARP':
        return
    sender_mac = parse_mac(parts[1])
    if not sender_mac:
        return
    sender_ip = parse_ip(parts[2])
    if not sender_ip:
        return
    dest_ip = parse_ip(parts[3])
    if not dest_ip:
        return
    return ARPFrame(sender_mac, sender_ip, dest_ip)

class ARPFrame:
    def __init__(self, sender_mac, sender_ip, dest_ip):
        self.sender_mac = sender_mac
        self.sender_ip = sender_ip
        self.dest_ip = dest_ip

    def __str__(self):
        return SEPARATOR.join(('ARP', str(self.sender_mac), str(self.sender_ip), str(self.dest_ip)))


def parse_ip_frame(data):
    parts = data.split(SEPARATOR)
    if len(parts) < 4:
        return
    if parts[0] != 'IP':
        return
    try:
        ttl = int(parts[1])
    except:
        return
    src = parse_ip(parts[2])
    if not src:
        return
    dest = parse_ip(parts[3])
    if not dest:
        return
    payload = SEPARATOR.join(parts[4:])
    return IPFrame(src, dest, payload, ttl)

class IPFrame:
    def __init__(self, src, dest, payload, ttl=TTL_INIT):
        self.ttl = ttl
        self.src = src
        self.dest = dest
        self.payload = payload


    def decrement_ttl(self):
        self.ttl -= 1

    def __str__(self):
        return SEPARATOR.join(('IP', str(self.ttl), str(self.src), str(self.dest), self.payload))


CLIENT_MODE = 'client'
SWITCH_MODE = 'switch'
ROUTER_MODE = 'router'

MODES = [CLIENT_MODE, ROUTER_MODE, SWITCH_MODE]

class Device:
    def __init__(self, ip, default_gateway, network_mask, radio_address, radio_group, radio_power):
        self.ip = parse_ip(ip)
        self.default_gateway = parse_ip(default_gateway)
        self.default_gateway_mac = None
        # cidr notation, e.g. 24 for 255.255.255.0
        self.network_mask = network_mask
        self.radio_power = radio_power
        self.radio_group = radio_group
        self.radio_address = radio_address
        self.configure()
        self.pending_serial_messages = []
        self._received_pkg_ids = [None] * PACKAGE_BUFFER_SIZE
        self._received_pkg_ids_idx = 0
        self._pkg_id = 0

    def configure(self):
        radio.off()
        radio.config(length=128, group=self.radio_group, power=self.radio_power, address=self.radio_address)
        radio.on()

    def process_message(self, pkg, received_at):
        if pkg.timestamp < 1:
            return
        if pkg.dest == BBC_MAC or is_broadcast_mac(pkg.dest):
            report(pkg)

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
        pkg = parse_eth(raw)
        timestamp = running_time()
        if not pkg:
            return
        if self._is_double_receive(pkg):
            return
        if is_broadcast_mac(pkg.dest) and pkg.src == BBC_MAC:
            # this is a package we sent, drop it.
            return
        self.process_message(pkg, timestamp)

    def _is_double_receive(self, pkg):
        if pkg.timestamp < 0:
            # only consider packages with a valid timestamp for double receive detection, since packages with timestamp -1 are received directly from the sender and thus not affected by double receive.
            return False
        pkg_id = (pkg._id, pkg.src)
        if pkg_id in self._received_pkg_ids:
            return True
        self._received_pkg_ids[self._received_pkg_ids_idx] = pkg_id
        self._received_pkg_ids_idx = (self._received_pkg_ids_idx + 1) % PACKAGE_BUFFER_SIZE
        return False

    def send_L2(self, dest, data):
        to = parse_mac(dest)
        if not to:
            return report_error('Cannot send L2 message without a valid destination MAC address.')
        msg = EthernetFrame(self._pkg_id, to, BBC_MAC, str(data))
        self._pkg_id += 1
        if to == BBC_MAC:
            return report(msg)
        radio.send(str(msg))

    def send_L3(self, dest, data):
        if not self.default_gateway:
            return report_error('Cannot send L3 message without default gateway configured.')
        to = parse_ip(dest)
        if not to:
            return report_error('Keine gültige IP Adresse angegeben: ' + dest)
        if not self.default_gateway_mac:
            self.send_arp(str(self.default_gateway))
            return report_error('Unbekannte MAC Adresse des Routers. ARP Nachricht gesendet.')
        if not self.ip:
            return report_error('Cannot send L3 message without IP address configured.')
        ipframe = IPFrame(self.ip, to, data)
        msg = EthernetFrame(self._pkg_id, self.default_gateway_mac, BBC_MAC, str(ipframe))
        self._pkg_id += 1
        if to == self.ip:
            return report(msg)
        radio.send(str(msg))
    
    def send_arp(self, to_ip, sender_mac = BROADCAST_MAC, timestamp = -1):
        arp_response = ARPFrame(BBC_MAC, self.ip, to_ip)
        response_frame = EthernetFrame(self._pkg_id, sender_mac, BBC_MAC, str(arp_response), timestamp)
        self._pkg_id += 1
        radio.send(str(response_frame))


class Client(Device):
    def __init__(self, ip, default_gateway, network_mask, radio_address, radio_group, radio_power):
        super().__init__(ip, default_gateway, network_mask, radio_address, radio_group, radio_power)

    def handle_package(self, pkg):
        arp_frame = parse_arp(pkg.payload)
        if arp_frame and arp_frame.dest_ip == self.ip and arp_frame.sender_ip == self.default_gateway:
            self.default_gateway_mac = arp_frame.sender_mac
        report(pkg)

    def process_message(self, pkg, received_at):
        if pkg.timestamp < 0:
            return
        if pkg.timestamp == 0 and pkg.src == BBC_MAC:
            # this is a package we sent and is received again due to broadcast, drop it.
            return
        if pkg.dest == BBC_MAC or is_broadcast_mac(pkg.dest):
            self.handle_package(pkg)

class Switch(Device):
    def __init__(self, radio_address, radio_group, radio_power):
        super().__init__(None, None, 24, radio_address, radio_group, radio_power)
        self.mac_table = {}

    def process_message(self, msg, received_at):
        is_known_dest = self.mac_table.get(msg.dest, -1) > 0
        if msg.timestamp > 0:
            # drop, since it was sent by another switch/router that already knew the destination.
            return

        if msg.timestamp == -1:
            # learn the source MAC when the package arrives directly from the sender (timestamp -1)
            self.mac_table[msg.src] = received_at
            msg.set_timestamp(received_at)

        if not is_known_dest:
            # we don't know the destination, so we flood the message to all other devices, but we
            # reset the timestamp to ensure the package gets dropped when received by the destination.
            msg.set_timestamp(0)

        report(str(msg))
        if msg.dest == BBC_MAC:
            return
        # just flood the message to all other devices, no port concept possible with micro:bit radio
        radio.send(str(msg))

class Router(Device):
    def __init__(self, ip, default_gateway, network_mask, radio_address, radio_group, radio_power):
        super().__init__(ip, default_gateway, network_mask, radio_address, radio_group, radio_power)
        if not self.ip:
            raise Exception('Router must have a valid IP address configured.')
        self.mac_table = {}
        self.ip_table = {}

    def process_message(self, msg, received_at):
        is_known_dest = self.mac_table.get(msg.dest, -1) > 0
        if msg.timestamp > 0:
            # drop, since it was sent by another switch/router that already knew the destination.
            return

        if msg.timestamp == -1:
            # learn the source MAC when the package arrives directly from the sender (timestamp -1)
            self.mac_table[msg.src] = received_at
        ip_frame = parse_ip_frame(msg.payload)
        if ip_frame:
            # learn the ip-mac mapping
            self.ip_table[ip_frame.src.ip] = msg.src
            if ip_frame.dest == self.ip:
                # message for us, so we process it (here we just print it).
                report(msg)
                return
            else:
                # message for another IP, so we need to forward it, but first we decrement the TTL and drop it if TTL is 0.
                ip_frame.decrement_ttl()
                if ip_frame.ttl < 1:
                    return
                if ip_frame.dest.is_broadcast(self.network_mask):
                    broadcast_frame = EthernetFrame(self._pkg_id, BROADCAST_MAC, BBC_MAC, str(ip_frame), running_time())
                    radio.send(str(broadcast_frame))
                elif ip_frame.dest.ip in self.ip_table:
                    next_hop_mac = self.ip_table[ip_frame.dest.ip]
                    forward_frame = EthernetFrame(self._pkg_id, next_hop_mac, BBC_MAC, str(ip_frame), running_time())
                    radio.send(str(forward_frame))
                else:
                    # destination not in our routing table, so we just print it to tdev which should delegate it to the default gateway.
                    report(msg)
                    return
                self._pkg_id += 1
        else:
            arp_frame = parse_arp(msg.payload)
            if arp_frame:
                if arp_frame.dest_ip == self.ip:
                    report(msg)
                    sender_ip = str(arp_frame.sender_ip)
                    sender_mac = str(arp_frame.sender_mac)
                    self.ip_table[sender_ip] = sender_mac
                    # this is an ARP request for our IP, so we reply with an ARP response containing our MAC address.
                    self.send_arp(sender_ip, sender_mac, received_at)
                return
            # act as a layer 2 switch if the payload is no valid IP frame, since we cannot route it.
            if not is_known_dest:
                # we don't know the destination, so we flood the message to all other devices, but we
                # reset the timestamp to ensure the package gets dropped when received by the destination.
                msg.set_timestamp(0)
            else:
                # we know the destination, so we set the timestamp to ensure the package gets dropped when received by the destination.
                msg.set_timestamp(received_at)
            report(msg)
            if msg.dest == BBC_MAC:
                return
            # just flood the message to all other devices, no port concept possible with micro:bit radio
            radio.send(str(msg))


SM_CONFIG = '::CONFIG::'
SM_SEND_L2 = '::L2::'
SM_SEND_L3 = '::L3::'


def parse_serial_msg(message):
    parts = message.split(SEPARATOR)
    if len(parts) < 1:
        return
    code = parts[0]
    if code == SM_CONFIG and len(parts) == 7:
        return ('set_config', SEPARATOR.join(parts[1:]))
    elif code == SM_CONFIG and len(parts) == 1:
        return ('get_config',)
    elif code == SM_SEND_L2 and len(parts) >= 3:
        mac = parse_mac(parts[1])
        msg = SEPARATOR.join(parts[2:])
        if not mac:
            return
        return ('send_L2', mac, msg.strip())
    elif code == SM_SEND_L3 and len(parts) >= 3:
        ip = parse_ip(parts[1])
        msg = SEPARATOR.join(parts[2:])
        if not ip or not msg.strip():
            return
        return ('send_L3', str(ip), msg.strip())

def parse_value(value, is_int = False, default = None):
    if value == 'None':
        return default
    if not is_int:
        return value
    try:
        return int(value)
    except:
        return default


CLIENT_IMG = Image('00000:09990:09090:09990:0000')
SWITCH_IMG = Image('00090:99999:00000:99999:09000')
ROUTER_IMG = Image('99099:90009:00900:90009:99099')

class Config:
    def __init__(self, mode, ip = None):
        self.mode = 'client'
        self.ip = None
        self.default_gateway = None
        self.radio = (int(0x75626974), 0, DEFAULT_POWER) # address, group, power
        self.network_mask = 24
        self.device = Device(self.ip, self.default_gateway, self.network_mask, self.radio[0], self.radio[1], self.radio[2])
        self.configure(mode, ip, None, None, None, DEFAULT_POWER, True)

    def set_mode(self, mode, skip_dump = False):
        self.configure(mode, self.ip, self.default_gateway, self.radio[0], self.radio[1], self.radio[2], skip_dump)

    def configure(self, mode, ip=None, default_gateway=None, address = None, group = None, power = None, skip_dump = False):
        new_ip = parse_ip(str(ip))
        if new_ip:
            self.ip = new_ip.ip
        else:
            self.ip = None
        new_dg = parse_ip(str(default_gateway))
        if new_dg:
            self.default_gateway = new_dg.ip
        else:
            self.default_gateway = None

        if mode in MODES:
            self.mode = mode
        val = [int(0x75626974), 0, DEFAULT_POWER] # address, group, power

        if address is not None:
            val[0] = address        
        if group is not None:
            val[1] = group
        if power is not None:
            val[2] = power

        self.radio = tuple(val)
        if self.mode == CLIENT_MODE:
            self.device = Client(self.ip, self.default_gateway, self.network_mask, self.radio[0], self.radio[1], self.radio[2])
        elif self.mode == SWITCH_MODE:
            self.device = Switch(self.radio[0], self.radio[1], self.radio[2])
        elif self.mode == ROUTER_MODE:
            if not self.ip:
                report_error('Router must have a valid IP address configured.')
                return self.configure(CLIENT_MODE, ip, default_gateway, address, group, power, skip_dump)
            self.device = Router(self.ip, self.default_gateway, self.network_mask, self.radio[0], self.radio[1], self.radio[2])
        self.changed = True
        if skip_dump:
            return
        self.dump()

    def configure_from_string(self, config_str):
        parts = config_str.split(SEPARATOR)
        if len(parts) != 6:
            return
        p = parse_value
        self.configure(p(parts[0]), p(parts[1]), p(parts[2]), p(parts[3], True), p(parts[4], True), p(parts[5], True, DEFAULT_POWER))

    def dump(self):
        with open(CONFIG_FILE, 'w') as file:
            file.write(str(self))

    def restore(self):
        files = listdir()
        if CONFIG_FILE in files:
            with open(CONFIG_FILE) as file:
                config = file.read()
            self.configure_from_string(config)

    @property
    def icon(self):
        if self.mode == CLIENT_MODE:
            return CLIENT_IMG
        elif self.mode == SWITCH_MODE:
            return SWITCH_IMG
        elif self.mode == ROUTER_MODE:
            return ROUTER_IMG
        else:
            return '?'

    def run(self):
        self.device.run()
        if self.device.pending_serial_messages:
            for text in self.device.pending_serial_messages:
                msg = parse_serial_msg(text)
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
        report(SEPARATOR.join((SM_CONFIG, BBC_MAC, str(self))))



report(RESET_TRIGGER)

config = Config('client')
config.restore()
display.show(config.icon)
while True:
    config.run()
    if button_b.was_pressed():
        report(RESET_TRIGGER)
    if config.changed:
        config.changed = False
        display.show(config.icon)
        config.send_config()
    if button_a.was_pressed():
        if config.device.ip:
            if config.device.default_gateway:
                ts = running_time() if config.mode == ROUTER_MODE else -1
                config.device.send_arp(config.device.default_gateway, BROADCAST_MAC, ts)
            else:
                config.device.send_L2(BROADCAST_MAC, 'Ping')
        else:
            config.device.send_L2(BROADCAST_MAC, 'Ping')
