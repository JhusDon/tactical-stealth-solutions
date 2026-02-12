import socket
import threading
import time
import binascii

TARGET_IP = "192.168.178.85"
TIMEOUT = 3

# Known Magic Packets
PAYLOADS = {
    "V380 (UDP 5050)": {
        "port": 5050,
        "payload": bytes.fromhex("020000000000000000000000") # Basic V380 checking
    },
    "Tuya (UDP 6666)": {
        "port": 6666,
        "payload": b'{"ip":"192.168.178.85","gwId":"","active":2,"ability":0,"mode":0,"encrypt":true,"productKey":"","version":"3.3"}' # Partial Tuya 3.3 probe
    },
    "Tuya (UDP 6667)": {
        "port": 6667,
        "payload": b'hello' # Often encrypted, but might trigger a refuse
    },
    "TUTK (UDP 32100)": {
        "port": 32100,
        "payload": b'\x01\x00\x00\x00' # Generic tickle
    },
    "DV380 (UDP 32108)": {
        "port": 32108,
        "payload": b'\x00' * 10
    }
}

def probe_protocol(name, data):
    port = data["port"]
    payload = data["payload"]
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(TIMEOUT)
        print(f"[*] Sending {name} probe to {TARGET_IP}:{port}...")
        s.sendto(payload, (TARGET_IP, port))
        
        try:
            resp, addr = s.recvfrom(2048)
            print(f"    [!] RESPONSE from {name}: {binascii.hexlify(resp)}")
            return True
        except socket.timeout:
            print(f"    [-] No response for {name}")
    except Exception as e:
        print(f"    [!] Error: {e}")
    finally:
        s.close()
    return False

print(" Starting Magic Probe for Proprietary Protocols...")
found = False
for name, data in PAYLOADS.items():
    if probe_protocol(name, data):
        found = True

if not found:
    print("\nNo proprietary protocols identified with standard payloads.")
    print("Possibilities:\n1. Custom Protocol\n2. Device requires specific 'handshake' or server mediation.")
else:
    print("\n[!] Potential Protocol Identified! See above.")
