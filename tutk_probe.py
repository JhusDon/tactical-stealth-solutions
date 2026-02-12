import socket
import struct
import binascii
import time

# Configuration
UID = "JPL8KZRA179YNPZE111A"
# License Key found in binary?
LICENSE_KEY = "TM9R4CGDG9869ETV111A"

DEST_IPS = ["192.168.255.1", "255.255.255.255", "192.168.255.255"]
PORTS = [32100, 10000, 80, 554, 8080]

def create_tutk_packets():
    packets = []
    
    # 1. 0x01 LAN Search (Standard)
    packets.append(bytes.fromhex("01000000"))
    
    # 2. UID Packet
    packets.append(UID.encode() + b'\x00'*(20-len(UID)))
    
    # 3. License Key Packet (Why not?)
    packets.append(LICENSE_KEY.encode() + b'\x00'*(20-len(LICENSE_KEY)))
    
    # 4. "IOTC_Login_Req" style
    # Header: 20 00 (Cmd 0x20) + Length ...
    # Try a generic "Hello"
    packets.append(b'\x20\x00\x00\x00' + UID.encode().ljust(20, b'\x00'))

    return packets

def broadcast_probe():
    print(f"[*] Starting BROADCAST Probe for UID {UID}")
    
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
    s.settimeout(2.0)
    
    pkts = create_tutk_packets()
    
    found = False
    
    for port in PORTS:
        for ip in DEST_IPS:
            # Skip unicast if it's the 192.168.255.1 and we want to try generic first?
            # actually just blast everything.
            
            for i, pkt in enumerate(pkts):
                try:
                    #print(f"  -> Sending Pkt {i} to {ip}:{port}")
                    s.sendto(pkt, (ip, port))
                except Exception as e:
                    # e.g. Network unreachable if alias dropped
                    pass
            
    # Listen for ANY response
    start_time = time.time()
    while time.time() - start_time < 5.0:
        try:
            data, addr = s.recvfrom(2048)
            print(f"\n[!!!] RESPONSE RECEIVED from {addr}:")
            print(f"      HEX: {binascii.hexlify(data)}")
            print(f"      ASCII: {data}")
            found = True
        except socket.timeout:
            pass
        except Exception as e:
            pass
            
    if not found:
        print("\n[-] Silent. No response to broadcasts.")
    else:
        print("\n[+] Scan finished with responses!")

if __name__ == "__main__":
    broadcast_probe()
