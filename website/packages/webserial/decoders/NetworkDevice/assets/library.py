from microbit import running_time, display, Image, button_a, button_b, uart
import radio
from machine import unique_id
from os import listdir
TTL_INIT = 10
ALLOW_PEER_TO_PEER = False
S = ' '
RESET_TRIGGER = '::READY::'
CONFIG_FILE = 'config.txt'
PACKAGE_BUFFER_SIZE = 32
DEFAULT_POWER = 4
def pad0(text: str, n: int):
	return ("{0:0>" + str(n) + "}").format(text)
def report(message):
	print(message)
def report_error(message):
	print('ERROR: ' + message)
bbc_id = hex(int.from_bytes(unique_id(), "little"))[6:]
MICROBIT_MAC = ":".join(bbc_id[i:i+2] for i in range(0, 12, 2)).upper()
BROADCAST_MAC = 'FF:FF:FF:FF:FF:FF'
def is_broadcast_mac(mac):
	return str(mac).strip().upper() == BROADCAST_MAC
def validate_mac(mac):
	parts = str(mac).strip().split(':')
	if len(parts) != 6: raise Exception('MAC "' + mac + '" is invalid.')
	valid = [len(p) == 2 and int(p, 16) < 256 for p in parts]
	if sum(valid) != 6: raise Exception('MAC "' + mac + '" has invalid parts.')
def parse_mac(mac):
	try:
		validate_mac(mac)
	except:
		report_error('MAC "' + mac + '" has invalid parts.')
		return
	return str(mac).strip().upper()
IP_UNCONFIGURED = '0.0.0.0'
IP_LOOPBACK = '127.0.0.1'
def validate_ip(ip: str):
	parts = ip.strip().split('.')
	if len(parts) != 4: raise Exception('IP "' + ip + '" is invalid.')
	parts = [int(p) for p in parts]
	valid = [n >= 0 and n < 256 for n in parts]
	if sum(valid) != 4: raise Exception('IP "' + ip + '" has out of range parts.')
def parse_ip(ip: str):
	parts = str(ip).strip().split('.')
	if len(parts) != 4: return
	try:
		parts = [int(p) for p in parts]
		valid = [n >= 0 and n < 256 for n in parts]
		if sum(valid) == 4: return IP(ip)
	except:
		report_error('IP "' + ip + '" has non-integer parts.')
		return
class IP:
	def __init__(self, ip):
		_ip = str(ip).strip()
		validate_ip(_ip)
		self.ip = _ip
	@property
	def is_loopback(self):
		return self.ip == IP_LOOPBACK
	@property
	def parts(self):
		return self.ip.split('.')
	@property
	def numeric(self):
		return int(''.join([pad0(hex(int(p))[2:], 2) for p in self.parts]), 16)
	@property
	def binary(self):
		return bin(self.numeric)[2:]
	def default_gateway(self, mask = 24):
		binary = self.binary[0:mask] + '0' * (31 - mask) + '1'
		num = int(binary, 2)
		return IP('.'.join([str((num >> (8 * i)) % 256) for i in range(4)[::-1]]))
	def is_broadcast(self, mask = 24):
		binary = self.binary[mask:]
		broadcast_addr = bin(2 ** (32 - mask) - 1)[2:]
		return binary == broadcast_addr
	def __eq__(self, other):
		if isinstance(other, IP): return self.ip == other.ip
		if type(other) == str: return self.ip == other
		return NotImplemented
	def __repr__(self):
		return 'IP(' + self.ip + ')'
	def __str__(self):
		return self.ip
def parse_eth(data):
	parts = str(data).split(S)
	if len(parts) < 4: return
	try:
		ts = int(parts[0])
		_id = int(parts[1])
	except:
		return
	dest = parse_mac(parts[2])
	if not dest: return
	src = parse_mac(parts[3])
	if not src: return
	payload = S.join(parts[4:])
	return EthernetFrame(_id, dest, src, payload, ts)
class EthernetFrame:
	def __init__(self, _id, dest, src, payload, timestamp = -1):
		self._id = _id
		self.dest = parse_mac(dest)
		self.src = parse_mac(src)
		if not self.dest or not self.src: raise Exception('Invalid MAC address in Ethernet frame.')
		self.payload = payload
		self.timestamp = timestamp
	def set_timestamp(self, timestamp):
		self.timestamp = timestamp
	def __str__(self):
		return str(self.timestamp) + S + str(self._id) + S + str(self.dest) + S + str(self.src) + S + self.payload
	def __repr__(self):
		return 'EthernetFrame(' + self.__str__() + ')'
def parse_arp(data):
	parts = data.split(S)
	if len(parts) != 4: return
	if parts[0] != 'ARP': return
	sender_mac = parse_mac(parts[1])
	if not sender_mac: return
	sender_ip = parse_ip(parts[2])
	if not sender_ip: return
	dest_ip = parse_ip(parts[3])
	if not dest_ip: return
	return ARPFrame(sender_mac, sender_ip, dest_ip)
class ARPFrame:
	def __init__(self, sender_mac, sender_ip, dest_ip):
		self.sender_mac = parse_mac(sender_mac)
		self.sender_ip = parse_ip(sender_ip)
		self.dest_ip = parse_ip(dest_ip)
	def __str__(self):
		return 'ARP' + S + str(self.sender_mac) + S + str(self.sender_ip) + S + str(self.dest_ip)
def parse_ip_frame(data):
	parts = data.split(S)
	if len(parts) < 4: return
	if parts[0] != 'IP': return
	try:
		ttl = int(parts[1])
	except:
		return
	src = parse_ip(parts[2])
	if not src: return
	dest = parse_ip(parts[3])
	if not dest: return
	payload = S.join(parts[4:])
	return IPFrame(src, dest, payload, ttl)
class IPFrame:
	def __init__(self, src, dest, payload, ttl = TTL_INIT):
		self.ttl = ttl
		self.src = IP(src)
		self.dest = IP(dest)
		self.payload = payload
	def decrement_ttl(self):
		self.ttl -= 1
	def __str__(self):
		return 'IP' + S + str(self.ttl) + S + str(self.src) + S + str(self.dest) + S + self.payload
	def __repr__(self):
		return 'IPFrame(' + self.__str__() + ')'
class Mode:
	CLIENT = 'client'
	ROUTER = 'router'
	SWITCH = 'switch'
	MODES = [CLIENT, ROUTER, SWITCH]
class Device:
	def __init__(self, ip, default_gateway, network_mask, radio_address, radio_group, radio_power):
		self.ip = parse_ip(ip)
		self.default_gateway = parse_ip(default_gateway)
		self.default_gateway_mac = None
		self.network_mask = network_mask
		self.radio_power = radio_power
		self.radio_group = radio_group
		self.radio_address = radio_address
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
		if pkg.timestamp < 1: return
		if pkg.dest == self.MAC or is_broadcast_mac(pkg.dest): report(pkg)
	def run(self):
		if uart.any():
			data = uart.readline()
			text = ''
			while data:
				text += data.decode('utf-8')
				data = uart.readline()
			if text.strip(): self.pending_serial_messages.append(text.strip())
		raw = radio.receive()
		if not raw: return
		pkg = parse_eth(raw)
		timestamp = running_time()
		if not pkg: return
		if self._is_double_receive(pkg): return
		if is_broadcast_mac(pkg.dest) and pkg.src == self.MAC: return
		self.process_message(pkg, timestamp)
	def _is_double_receive(self, pkg: EthernetFrame):
		if pkg.timestamp < 0: return False
		pkg_id = (pkg._id, pkg.src)
		if pkg_id in self._received_pkg_ids: return True
		self._received_pkg_ids[self._received_pkg_ids_idx] = pkg_id
		self._received_pkg_ids_idx = (self._received_pkg_ids_idx + 1) % PACKAGE_BUFFER_SIZE
		return False
	def send_L2(self, dest, data):
		to = parse_mac(dest)
		if not to: return report_error('Cannot send L2 message without a valid destination MAC address.')
		msg = EthernetFrame(self._pkg_id, to, self.MAC, str(data))
		self._pkg_id += 1
		if to == self.MAC: return report(msg)
		radio.send(str(msg))
	def send_L3(self, dest, data):
		if not self.default_gateway: return report_error('Cannot send L3 message without default gateway configured.')
		to = parse_ip(dest)
		if not to: return report_error('Keine gültige IP Adresse angegeben: ' + dest)
		if not self.default_gateway_mac:
			self.send_arp(str(self.default_gateway))
			return report_error('Unbekannte MAC Adresse des Routers. ARP Nachricht gesendet.')
		if not self.ip: return report_error('Cannot send L3 message without IP address configured.')
		ipframe = IPFrame(self.ip, to, data)
		msg = EthernetFrame(self._pkg_id, self.default_gateway_mac, self.MAC, str(ipframe))
		self._pkg_id += 1
		if to == self.ip: return report(msg)
		radio.send(str(msg))
	def send_arp(self, to_ip, sender_mac = BROADCAST_MAC, timestamp = -1):
		arp_response = ARPFrame(self.MAC, self.ip, to_ip)
		response_frame = EthernetFrame(self._pkg_id, sender_mac, self.MAC, str(arp_response), timestamp)
		self._pkg_id += 1
		radio.send(str(response_frame))
class Client(Device):
	def __init__(self, ip, default_gateway, network_mask, radio_address, radio_group, radio_power):
		super().__init__(ip, default_gateway, network_mask, radio_address, radio_group, radio_power)
	def handle_package(self, pkg: EthernetFrame):
		arp_frame = parse_arp(pkg.payload)
		if arp_frame and arp_frame.dest_ip == self.ip and arp_frame.sender_ip == self.default_gateway: self.default_gateway_mac = arp_frame.sender_mac
		report(pkg)
	def process_message(self, pkg: EthernetFrame, received_at: int):
		if pkg.timestamp < 0: return
		if pkg.timestamp == 0 and pkg.src == self.MAC: return
		if pkg.dest == self.MAC or is_broadcast_mac(pkg.dest): self.handle_package(pkg)
class Switch(Device):
	def __init__(self, radio_address, radio_group, radio_power):
		super().__init__(None, None, 24, radio_address, radio_group, radio_power)
		self.mac_table = {}
	def process_message(self, msg: EthernetFrame, received_at: int):
		is_known_dest = self.mac_table.get(msg.dest, -1) > 0
		if msg.timestamp > 0: return
		if msg.timestamp == -1:
			self.mac_table[msg.src] = received_at
			msg.set_timestamp(received_at)
		if not is_known_dest: msg.set_timestamp(0)
		report(str(msg))
		if msg.dest == self.MAC: return
		radio.send(str(msg))
class Router(Device):
	def __init__(self, ip, default_gateway, network_mask, radio_address, radio_group, radio_power):
		super().__init__(ip, default_gateway, network_mask, radio_address, radio_group, radio_power)
		if not self.ip: raise Exception('Router must have a valid IP address configured.')
		self.mac_table = {}
		self.ip_table = {}
	def process_message(self, msg: EthernetFrame, received_at: int):
		is_known_dest = self.mac_table.get(msg.dest, -1) > 0
		if msg.timestamp > 0: return
		if msg.timestamp == -1: self.mac_table[msg.src] = received_at
		ip_frame = parse_ip_frame(msg.payload)
		if ip_frame:
			self.ip_table[ip_frame.src.ip] = msg.src
			if ip_frame.dest == self.ip:
				report(msg)
				return
			else:
				ip_frame.decrement_ttl()
				if ip_frame.ttl < 1: return
				if ip_frame.dest.is_broadcast(self.network_mask):
					broadcast_frame = EthernetFrame(self._pkg_id, BROADCAST_MAC, self.MAC, str(ip_frame), running_time())
					radio.send(str(broadcast_frame))
				elif ip_frame.dest.ip in self.ip_table:
					next_hop_mac = self.ip_table[ip_frame.dest.ip]
					forward_frame = EthernetFrame(self._pkg_id, next_hop_mac, self.MAC, str(ip_frame), running_time())
					radio.send(str(forward_frame))
				else:
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
					self.send_arp(sender_ip, sender_mac, received_at)
				return
			if not is_known_dest: msg.set_timestamp(0)
			else: msg.set_timestamp(received_at)
			report(msg)
			if msg.dest == self.MAC: return
			radio.send(str(msg))
SM_CONFIG = '::CONFIG::'
SM_SEND_L2 = '::L2::'
SM_SEND_L3 = '::L3::'
def parse_serial_msg(message: str):
	parts = message.split(S)
	if len(parts) < 1: return
	code = parts[0]
	if code == SM_CONFIG and len(parts) == 7:
		return {
			'type': 'set_config',
			'data': S.join(parts[1:])
		}
	elif code == SM_CONFIG and len(parts) == 1:
		return {
			'type': 'get_config'
		}
	elif code == SM_SEND_L2 and len(parts) >= 3:
		mac = parse_mac(parts[1])
		msg = S.join(parts[2:])
		if not mac: return
		return {
			'type': 'send_L2',
			'dest': mac,
			'message': msg.strip()
		}
	elif code == SM_SEND_L3 and len(parts) >= 3:
		ip = parse_ip(parts[1])
		msg = S.join(parts[2:])
		if not ip or not msg.strip(): return
		return {
			'type': 'send_L3',
			'dest': str(ip),
			'message': msg.strip()
		}
	else: return
def parse_value(value, is_int = False, default = None):
	if value == 'None': return default
	if not is_int: return value
	try:
		return int(value)
	except:
		return default
class Config:
	device: Device
	def __init__(self, mode, ip = None):
		self.mode = 'client'
		self.ip = None
		self.default_gateway = None
		self.radio = (None, None, DEFAULT_POWER) # address, group, power
		self.network_mask = 24
		self.configure(mode, ip, None, None, None, DEFAULT_POWER, True)
	def set_mode(self, mode, skip_dump = False):
		self.configure(mode, self.ip, self.default_gateway, self.radio[0], self.radio[1], self.radio[2], skip_dump)
	def configure(self, mode, ip=None, default_gateway=None, address = None, group = None, power = None, skip_dump = False):
		new_ip = parse_ip(str(ip))
		if new_ip: self.ip = new_ip.ip
		else: self.ip = None
		new_dg = parse_ip(str(default_gateway))
		if not new_dg and new_ip: new_dg = new_ip.default_gateway(self.network_mask)
		if new_dg: self.default_gateway = new_dg.ip
		else: self.default_gateway = None
		if mode in Mode.MODES: self.mode = mode
		val = [None, None, DEFAULT_POWER] # address, group, power
		if address is not None: val[0] = address
		elif new_dg: val[0] = new_dg.numeric
		else: val[0] = int(0x75626974) # default micro:bit radio address
		if group is not None: val[1] = group
		elif new_ip: val[1] = int(new_ip.binary[self.network_mask - 8:self.network_mask], 2)
		else: val[1] = 0 # default group
		if power is not None: val[2] = power
		else: val[2] = DEFAULT_POWER
		self.radio = tuple(val)
		if self.mode == Mode.CLIENT: self.device = Client(self.ip, self.default_gateway, self.network_mask, self.radio[0], self.radio[1], self.radio[2])
		elif self.mode == Mode.SWITCH: self.device = Switch(self.radio[0], self.radio[1], self.radio[2])
		elif self.mode == Mode.ROUTER:
			if not self.ip:
				report_error('Router must have a valid IP address configured.')
				return self.configure(Mode.CLIENT, ip, default_gateway, address, group, power, skip_dump)
			self.device = Router(self.ip, self.default_gateway, self.network_mask, self.radio[0], self.radio[1], self.radio[2])
		self.changed = True
		if skip_dump: return
		self.dump()
	def configure_from_string(self, config_str):
		parts = config_str.split(S)
		if len(parts) != 6: return
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
		if self.mode == Mode.CLIENT: return Image('00000:09990:09090:09990:0000')
		elif self.mode == Mode.SWITCH: return Image('00090:99999:00000:99999:09000')
		elif self.mode == Mode.ROUTER: return Image('99099:90009:00900:90009:99099')
		else: return '?'
	def run(self):
		self.device.run()
		if len(self.device.pending_serial_messages) > 0:
			for text in self.device.pending_serial_messages:
				msg = parse_serial_msg(text)
				if msg:
					if msg['type'] == 'set_config': self.configure_from_string(msg['data'])
					elif msg['type'] == 'get_config': self.send_config()
					elif msg['type'] == 'send_L2': self.device.send_L2(msg['dest'], msg['message'])
					elif msg['type'] == 'send_L3': self.device.send_L3(msg['dest'], msg['message'])
			self.device.pending_serial_messages = []
	def __str__(self):
		return self.mode + S + str(self.ip) + S + str(self.default_gateway) + S + str(self.radio[0]) + S + str(self.radio[1]) + S + str(self.radio[2])
	def send_config(self):
		report(SM_CONFIG + S + MICROBIT_MAC + S + str(self))
report(RESET_TRIGGER)
config = Config('client')
config.restore()
display.show(config.icon)
while True:
	config.run()
	if button_b.was_pressed(): report(RESET_TRIGGER)
	if config.changed:
		config.changed = False
		display.show(config.icon)
		config.send_config()
	if button_a.was_pressed():
		if config.device.ip:
			if config.device.default_gateway:
				ts = running_time() if config.mode == Mode.ROUTER else -1
				config.device.send_arp(config.device.default_gateway, BROADCAST_MAC, ts)
			else: config.device.send_L2(BROADCAST_MAC, 'Ping')
		else: config.device.send_L2(BROADCAST_MAC, 'Ping')