from microbit import *
import radio
import machine
import os

TTL_INIT = 10
ALLOW_PEER_TO_PEER = False
SEPARATOR = ' '
RESET_TRIGGER = '::READY::'
CONFIG_FILE = 'config.txt'
PACKAGE_BUFFER_SIZE = 32

def pad0(text: str, n: int):
    return ("{0:0>" + str(n) + "}").format(text)

class MAC:
    BROADCAST_MAC = 'FF:FF:FF:FF:FF:FF'

    @staticmethod
    def is_broadcast(mac):
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
    def __init__(self, _id, dest, src, payload, timestamp = -1):
        # this is needed only because we use radio and thus a message can be received multiple times when in reach of multiple devices.
        self._id = _id
        self.dest = MAC.parse(dest)
        self.src = MAC.parse(src)
        if not self.dest or not self.src:
            raise Exception('Invalid MAC address in Ethernet frame.')
        self.payload = payload
        self.timestamp = timestamp
    
    def set_timestamp(self, timestamp):
        self.timestamp = timestamp

    @staticmethod
    def parse(data):
        parts = data.split(SEPARATOR)
        if len(parts) < 4:
            return
        try:
            _id = int(parts[0])
            ts = int(parts[1])
        except:
            return
        dest = MAC.parse(parts[2])
        if not dest:
            return
        src = MAC.parse(parts[3])
        if not src:
            return
        payload = SEPARATOR.join(parts[4:])
        return EthernetFrame(_id, dest, src, payload, ts)

    def __str__(self):
        # TIMESTAMP, ID, DEST, SRC, PAYLOAD
        return str(self.timestamp) + SEPARATOR + str(self._id) + SEPARATOR + str(self.dest) + SEPARATOR + str(self.src) + SEPARATOR + self.payload

    def __repr__(self):
        return 'EthernetFrame(' + self.__str__() + ')'

class ARPFrame:
    def __init__(self, sender_mac, sender_ip, dest_ip):
        self.sender_mac = MAC.parse(sender_mac)
        self.sender_ip = IP.parse(sender_ip)
        self.dest_ip = IP.parse(dest_ip)

    @staticmethod
    def parse(data):
        parts = data.split(SEPARATOR)
        if len(parts) != 4:
            return
        if parts[0] != 'ARP':
            return
        sender_mac = MAC.parse(parts[1])
        if not sender_mac:
            return
        sender_ip = IP.parse(parts[2])
        if not sender_ip:
            return
        dest_ip = IP.parse(parts[3])
        if not dest_ip:
            return
        return ARPFrame(sender_mac, sender_ip, dest_ip)

    def __str__(self):
        return 'ARP' + SEPARATOR + str(self.sender_mac) + SEPARATOR + str(self.sender_ip) + SEPARATOR + str(self.dest_ip)

class IPFrame:
    def __init__(self, src, dest, payload, ttl = TTL_INIT):
        self.ttl = ttl
        self.src = IP(src)
        self.dest = IP(dest)
        self.payload = payload

    @staticmethod
    def parse(data):
        parts = data.split(SEPARATOR)
        if len(parts) < 4:
            return
        if parts[0] != 'IP':
            return
        try:
            ttl = int(parts[1])
        except:
            return
        src = IP.parse(parts[2])
        if not src:
            return
        dest = IP.parse(parts[3])
        if not dest:
            return
        payload = SEPARATOR.join(parts[4:])
        return IPFrame(src, dest, payload, ttl)

    def decrement_ttl(self):
        self.ttl -= 1
    
    def __str__(self):
        return 'IP' + SEPARATOR + str(self.ttl) + SEPARATOR + str(self.src) + SEPARATOR + str(self.dest) + SEPARATOR + self.payload

    def __repr__(self):
        return 'IPFrame(' + self.__str__() + ')'


class Mode:
    CLIENT = 'client'
    ROUTER = 'router'
    SWITCH = 'switch'
    MODES = [CLIENT, ROUTER, SWITCH]

class ErrorMessage:
    def __init__(self, message):
        self.message = message

    def __str__(self):
        return 'ERROR: ' + self.message

class Device:
    MAC = MAC.microbit_mac()

    def __init__(self, ip, network_mask, radio_address, radio_group, radio_power):
        self.ip = IP.parse(ip)
        # cidr notation, e.g. 24 for 255.255.255.0
        self.network_mask = network_mask
        self.radio_power = radio_power
        self.radio_group = radio_group
        self.radio_address = radio_address
        self.default_gateway = None
        self.default_gateway_mac = None
        self.configure()
        self.pending_serial_messages = []
        self._received_pkg_ids: list = [None] * PACKAGE_BUFFER_SIZE
        self._received_pkg_ids_idx = 0
        self._pkg_id = 0

    def configure(self):
        radio.off()
        radio.config(length=128, group=self.radio_group, power=self.radio_power, address=self.radio_address)
        radio.on()

    def process_message(self, pkg: EthernetFrame, received_at: int):
        if pkg.timestamp < 1:
            return
        if pkg.dest == self.MAC or MAC.is_broadcast(pkg.dest):
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
        raw = radio.receive_full()
        if not raw:
            return
        msg, rssi, timestamp = raw
        pkg = EthernetFrame.parse(msg)
        if not pkg:
            return
        if self._is_double_receive(pkg):
            return
        if MAC.is_broadcast(pkg.dest) and pkg.src == self.MAC:
            # this is a package we sent, drop it.
            return
        self.process_message(pkg, timestamp)

    def _is_double_receive(self, pkg: EthernetFrame, skip_cache = False):
        pkg_id = (pkg._id, pkg.src)
        if pkg_id in self._received_pkg_ids:
            return True
        if not skip_cache:
            self._received_pkg_ids[self._received_pkg_ids_idx] = pkg_id
            self._received_pkg_ids_idx = (self._received_pkg_ids_idx + 1) % PACKAGE_BUFFER_SIZE
        return False

    def send_L2(self, dest, data):
        to = MAC.parse(dest)
        if not to:
            return self.pending_serial_messages.append(str(ErrorMessage('Cannot send L2 message without a valid destination MAC address.')))
        _id = self._pkg_id
        self._pkg_id += 1
        msg = EthernetFrame(_id, to, self.MAC, str(data))
        if to == self.MAC:
            return print(msg)
        radio.send(str(msg))

    def send_L3(self, dest, data):
        if not self.default_gateway:
            return self.pending_serial_messages.append(str(ErrorMessage('Cannot send L3 message without default gateway configured.')))
        if not self.default_gateway_mac:
            radio.send(str(ARPFrame(self.MAC, self.ip, self.default_gateway)))
            return self.pending_serial_messages.append(str(ErrorMessage('Cannot send L3 message without default gateway MAC address resolved. Sent ARP request to resolve it.')))
        if not self.ip:
            return self.pending_serial_messages.append(str(ErrorMessage('Cannot send L3 message without IP address configured.')))
        to = IP.parse(dest)
        if not to:
            return self.pending_serial_messages.append(str(ErrorMessage('Cannot send L3 message without a valid destination IP address.')))
        ipframe = IPFrame(self.ip, to, data)
        msg = EthernetFrame(self._pkg_id, self.default_gateway_mac, self.MAC, str(ipframe))
        self._pkg_id += 1
        if to == self.ip:
            return print(msg)
        radio.send(str(msg))

class Client(Device):
    def __init__(self, ip, network_mask, radio_address, radio_group, radio_power):
        super().__init__(ip, network_mask, radio_address, radio_group, radio_power)
    
    def process_message(self, pkg: EthernetFrame, received_at: int):
        if pkg.timestamp < 1:
            return
        if pkg.dest == self.MAC or MAC.is_broadcast(pkg.dest):
            arp_frame = ARPFrame.parse(pkg.payload)
            if arp_frame:
                if arp_frame.dest_ip == self.ip and arp_frame.sender_ip == self.default_gateway:
                    self.default_gateway_mac = arp_frame.sender_mac
                    
                return
            print(pkg)

class Switch(Device):
    def __init__(self, radio_address, radio_group, radio_power):
        super().__init__(None, 24, radio_address, radio_group, radio_power)
        self.mac_table = {}

    def process_message(self, msg: EthernetFrame, received_at: int):
        is_known_dest = self.mac_table.get(msg.dest, -1) > 0
        if msg.timestamp > 0:
            # drop, since it was sent by another switch/router that already knew the destination.
            return
        if not is_known_dest:
            # we don't know the destination, so we flood the message to all other devices, but we 
            # reset the timestamp to ensure the package gets dropped when received by the destination.
            msg.set_timestamp(0)

        if msg.timestamp == -1:
            # learn the source MAC when the package arrives directly from the sender (timestamp -1)
            self.mac_table[msg.src] = received_at

        print(msg)
        if msg.dest == self.MAC:
            return
        # just flood the message to all other devices, no port concept possible with micro:bit radio
        radio.send(str(msg))

class Router(Device):
    def __init__(self, ip, network_mask, radio_address, radio_group, radio_power):
        super().__init__(ip, network_mask, radio_address, radio_group, radio_power)
        if not self.ip:
            raise Exception('Router must have a valid IP address configured.')
        self.mac_table = {}
        self.ip_table = {}

    def process_message(self, msg: EthernetFrame, received_at: int):
        is_known_dest = self.mac_table.get(msg.dest, -1) > 0
        if msg.timestamp > 0:
            # drop, since it was sent by another switch/router that already knew the destination.
            return
        
        if msg.timestamp == -1:
            # learn the source MAC when the package arrives directly from the sender (timestamp -1)
            self.mac_table[msg.src] = received_at

        ip_frame = IPFrame.parse(msg.payload)
        if ip_frame:
            # learn the ip-mac mapping
            self.ip_table[ip_frame.src] = msg.src
            if ip_frame.dest == self.ip:
                # message for us, so we process it (here we just print it).
                print(ip_frame)
                return
            else:
                # message for another IP, so we need to forward it, but first we decrement the TTL and drop it if TTL is 0.
                ip_frame.decrement_ttl()
                if ip_frame.ttl < 1:
                    return
                if ip_frame.dest.is_broadcast(self.network_mask):
                    broadcast_frame = EthernetFrame(self._pkg_id, MAC.BROADCAST_MAC, self.MAC, str(ip_frame))
                    radio.send(str(broadcast_frame))
                elif ip_frame.dest in self.ip_table:
                    next_hop_mac = self.ip_table[ip_frame.dest]
                    forward_frame = EthernetFrame(self._pkg_id, next_hop_mac, self.MAC, str(ip_frame))
                    radio.send(str(forward_frame))
                else:
                    # destination not in our routing table, so we just print it to tdev which should delegate it to the default gateway.
                    print(ip_frame)
                    return
                self._pkg_id += 1
        else:
            arp_frame = ARPFrame.parse(msg.payload)
            if arp_frame:
                if arp_frame.dest_ip == self.ip:
                    self.ip_table[arp_frame.sender_ip] = arp_frame.sender_mac
                    # this is an ARP request for our IP, so we reply with an ARP response containing our MAC address.
                    arp_response = ARPFrame(self.MAC, self.ip, arp_frame.sender_ip)
                    response_frame = EthernetFrame(self._pkg_id, arp_frame.sender_mac, self.MAC, str(arp_response))
                    radio.send(str(response_frame))
                    self._pkg_id += 1
                return
            # act as a layer 2 switch if the payload is no valid IP frame, since we cannot route it.
            if not is_known_dest:
                # we don't know the destination, so we flood the message to all other devices, but we 
                # reset the timestamp to ensure the package gets dropped when received by the destination.
                msg.set_timestamp(0)
            print(msg)
            if msg.dest == self.MAC:
                return
            # just flood the message to all other devices, no port concept possible with micro:bit radio
            radio.send(str(msg))

class SerialMessage:
    CONFIG = '::CONFIG::'
    SEND_L2 = '::L2::'
    SEND_L3 = '::L3::'

    @staticmethod
    def parse(message: str):
        parts = message.split(SEPARATOR)
        if len(parts) < 1:
            return
        code = parts[0]
        if code == SerialMessage.CONFIG and len(parts) == 3:
            return {
                'type': 'set_config',
                'data': SEPARATOR.join(parts[1:])
            }
        elif code == SerialMessage.CONFIG and len(parts) == 1:
            return {
                'type': 'get_config'
            }
        elif code == SerialMessage.SEND_L2 and len(parts) >= 3:
            mac = MAC.parse(parts[1])
            msg = SEPARATOR.join(parts[2:])
            if not mac:
                return
            return {
                'type': 'send_L2',
                'dest': mac,
                'message': msg.strip()
            }
        elif code == SerialMessage.SEND_L3 and len(parts) >= 3:
            ip = IP.parse(parts[1])
            msg = SEPARATOR.join(parts[2:])
            if not ip or not msg.strip():
                return
            return {
                'type': 'send_L3',
                'dest': str(ip),
                'message': msg.strip()
            }
        else:
            return    

class Config:
    device: Device
    
    @staticmethod
    def parse_value(value, is_int = False):
        if value == 'None':
            return None
        if not is_int:
            return value
        try:
            return int(value)
        except:
            return None

    def __init__(self, mode, ip = None):
        self.mode = 'client'
        self.ip = None
        self.radio = (None, None, 4) # address, group, power
        self.network_mask = 24
        self.configure(mode, ip, None, None, 4, True)
    
    def set_mode(self, mode, skipDump = False):
        self.configure(mode, self.ip, self.radio[0], self.radio[1], self.radio[2], skipDump)

    def configure(self, mode, ip=None, address = None, group = None, power: int = 4, skipDump = False):
        new_ip = IP.parse(str(ip))
        if new_ip:
            self.ip = new_ip.ip
        else:
            self.ip = None

        if mode in Mode.MODES:
            self.mode = mode
        val = [None, None, 4] # address, group, power

        if address is not None:
            val[0] = address
        elif new_ip:
            val[0] = int(new_ip.default_gateway_hex(self.network_mask), 16)
        else:
            val[0] = int(0x75626974) # default micro:bit radio address

        if group is not None:
            val[1] = group
        elif new_ip:
            val[1] = int(new_ip.binary[self.network_mask - 8:self.network_mask], 2)
        else:
            val[1] = 0 # default group

        val[2] = power
        self.radio = tuple(val)
        if self.mode == Mode.CLIENT:
            self.device = Client(self.ip, 24, self.radio[0], self.radio[1], self.radio[2])
        elif self.mode == Mode.SWITCH:
            self.device = Switch(self.radio[0], self.radio[1], self.radio[2])
        elif self.mode == Mode.ROUTER:
            if not self.ip:
                print(str(ErrorMessage('Router must have a valid IP address configured.')))
                return self.configure(Mode.CLIENT, ip, address, group, power, skipDump)
            self.device = Router(self.ip, 24, self.radio[0], self.radio[1], self.radio[2])
        self.changed = True
        if skipDump:
            return
        self.dump()

    def configure_from_string(self, config_str):
        parts = config_str.split(SEPARATOR)
        if len(parts) != 5:
            return
        p = Config.parse_value
        try:
            pwr = int(parts[4])
        except:
            pwr = 4
        self.configure(p(parts[0]), p(parts[1]), p(parts[2], True), p(parts[3], True), pwr)

    def dump(self):
        with open(CONFIG_FILE, 'w') as file:
            file.write(str(self))

    def restore(self):
        files = os.listdir()
        if CONFIG_FILE in files:
            with open(CONFIG_FILE) as file:
                config = file.read()
            self.configure_from_string(config)

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
                        self.configure_from_string(msg['data'])
                    elif msg['type'] == 'get_config':
                        print(str(self))
                    elif msg['type'] == 'send_L2':
                        self.device.send_L2(msg['dest'], msg['message'])
                    elif msg['type'] == 'send_L3':
                        self.device.send_L3(msg['dest'], msg['message'])
            self.device.pending_serial_messages = []

    def __str__(self):
        # mode ip radio_address radio_group radio_power
        return self.mode + SEPARATOR + str(self.ip) + SEPARATOR + str(self.radio[0]) + SEPARATOR + str(self.radio[1]) + SEPARATOR + str(self.radio[2])
    
    def send_config(self):
        print(Device.MAC + SEPARATOR + str(self))
        
        

print(RESET_TRIGGER)

config = Config('client')
config.restore()
display.show(config.icon)
while True:
    config.run()
    if button_b.was_pressed():
        if config.mode == Mode.CLIENT:
            config.set_mode(Mode.SWITCH)
        elif config.mode == Mode.SWITCH:
            config.set_mode(Mode.ROUTER)
        else:
            config.set_mode(Mode.CLIENT)
    if config.changed:
        config.changed = False
        display.show(config.icon)
        config.send_config()
    if button_a.was_pressed():
        if config.device.ip:
            config.device.send_L3(IP.LOOPBACK, 'Ping')
        else:
            config.device.send_L2(config.device.MAC, 'Ping')
        
    