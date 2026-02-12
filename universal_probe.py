import socket
import subprocess
import time
import sys
import threading
import re
import binascii

RESULTS_FILE = "universal_scan_results.txt"

def log(message):
    print(message)
    with open(RESULTS_FILE, "a") as f:
        f.write(message + "\n")

def get_arp_devices():
    devices = []
    try:
        output = subprocess.check_output("arp -a", shell=True).decode('utf-8')
        for line in output.split('\n'):
            match = re.search(r'\(([\d\.]+)\)', line)
            if match:
                devices.append(match.group(1))
    except:
        pass
    return devices

def scan_tcp(ip):
    log(f"[*] [TCP] Scanning common ports on {ip}...")
    ports = [80, 8080, 554, 1935, 81, 8899, 34567, 5000, 6666, 8000, 8081, 10000]
    found = False
    for p in ports:
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(0.5)
            res = s.connect_ex((ip, p))
            if res == 0:
                log(f"    [+] TCP Port {p} OPEN")
                found = True
            s.close()
        except:
            pass
    if not found:
        log("    [-] No common TCP ports open.")

def scan_udp_magic(ip):
    log(f"[*] [UDP] Sending Magic Packets to {ip}...")
    
    payloads = {
        "V380 (5050)": (5050, bytes.fromhex("020000000000000000000000")),
        "Tuya (6666)": (6666, b'{"active":2,"version":"3.3"}'),
        "TUTK (32100)": (32100, b'\x01\x00\x00\x00'),
        "Goke (8899)": (8899, b'\x00\x00\x00\x00'),
        "SSDP (1900)": (1900, b'M-SEARCH * HTTP/1.1\r\nMAN: "ssdp:discover"\r\nMX: 3\r\nST: ssdp:all\r\n\r\n'),
        "WSD (3702)": (3702, b'<Probe><Types>dn:NetworkVideoTransmitter</Types></Probe>') # Simplified ONVIF
    }
    
    for name, (port, data) in payloads.items():
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.settimeout(2.0)
            s.sendto(data, (ip, port))
            try:
                resp, _ = s.recvfrom(2048)
                log(f"    [!] RESPONSE from {name}: {binascii.hexlify(resp)}")
            except socket.timeout:
                pass
            except Exception as e:
                log(f"    [E] Error {name}: {e}")
            s.close()
        except:
            pass

def main():
    print("\n" + "="*50)
    print("UNIVERSAL CAMERA PROBE")
    print("="*50)
    print("1. Disconnect from Home WiFi.")
    print("2. Connect to Camera WiFi.")
    print("3. Wait 10s.")
    
    input("\n>>> PRESS ENTER WHEN CONNECTED <<<")
    
    print("\n[+] Analysing Network...")
    time.sleep(2)
    
    # Discovery
    devices = get_arp_devices()
    targets = set(devices + ["192.168.255.1"]) # Add the known IP from previous run
    
    for ip in targets:
        if ip.endswith(".255") or ip.startswith("224."): continue
        
        # Ping check
        try:
            res = subprocess.call(["ping", "-c", "1", "-t", "1", ip], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            if res == 0:
                log(f"\n[+] Target Detected: {ip}")
                scan_tcp(ip)
                scan_udp_magic(ip)
        except:
            pass
            
    print("\n" + "="*50)
    print("SCAN COMPLETE! Please check universal_scan_results.txt")

if __name__ == "__main__":
    main()
