import socket
import subprocess
import threading
import time
import sys
import re

# Configuration
COMMON_PORTS = [554, 80, 8080, 81, 1935, 8899, 34567, 5000]
RTSP_PATHS = [
    "/live/ch0",
    "/live/ch1",
    "/stream1",
    "/stream2",
    "/11",
    "/12",
    "/media/video1",
    "/h264_stream",
    "/onvif1"
]

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        # Doesn't need to be reachable
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except Exception:
        return None

def get_subnet(ip):
    parts = ip.split('.')
    return f"{parts[0]}.{parts[1]}.{parts[2]}"

def ping_host(ip):
    try:
        # '-c 1' sends 1 packet, '-W 500' waits 500ms (Mac/BSD syntax might differ slightly, using standard)
        # standard mac ping: ping -c 1 -W 500 <ip> (wait is in ms in some versions, s in others. 
        # Mac ping -W is in milliseconds usually, but sometimes seconds. Safe bet is a small timeout.)
        # Actually macOS ping -W is in milliseconds. 
        subprocess.check_output(
            ["ping", "-c", "1", "-t", "1", ip], 
            stderr=subprocess.STDOUT
        )
        return True
    except subprocess.CalledProcessError:
        return False

def check_port(ip, port):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(1.0)
    try:
        result = s.connect_ex((ip, port))
        s.close()
        return result == 0
    except:
        return False

def check_rtsp_url(ip, port, path):
    url = f"rtsp://{ip}:{port}{path}"
    # We could try a Describe request via socket, but for now just constructing URLs
    # A robust check involves sending an RTSP DESCRIBE packet.
    return url

def scan_network_segment(subnet):
    print(f"[*] Scanning subnet {subnet}.0/24 ...")
    active_hosts = []
    
    # 1. Ping sweep (simplified: just ping specific range or rely on ARP)
    # Better approach for Mac: ping broadcast address or just scan ARP table
    # But ARP table only populates if we talked to them.
    # Let's try a quick loop for 1-254 (threaded)
    
    def pinger(i):
        ip = f"{subnet}.{i}"
        if ping_host(ip):
           pass # ARP table will update
           
    # Using thread pool for speed
    threads = []
    for i in range(1, 255):
        t = threading.Thread(target=pinger, args=(i,))
        t.start()
        threads.append(t)
        # limit concurrency
        if len(threads) > 50:
            for t in threads: t.join()
            threads = []
            
    for t in threads: t.join()
    
    # 2. Read ARP table
    try:
        arp_output = subprocess.check_output(["arp", "-a"]).decode('utf-8')
        for line in arp_output.split('\n'):
            # Mac ARP format: "? (192.168.1.5) at ..."
            match = re.search(r'\(([\d\.]+)\)', line)
            if match:
                active_hosts.append(match.group(1))
    except Exception as e:
        print(f"[!] Error reading ARP table: {e}")
        
    return list(set(active_hosts))

def probe_camera(ip):
    print(f"\n[?] Probing {ip}...")
    open_ports = []
    for port in COMMON_PORTS:
        if check_port(ip, port):
            open_ports.append(port)
            print(f"    [+] Port {port} is OPEN")
            
    if not open_ports:
        return
        
    # Suggest URLs
    if 554 in open_ports:
        print(f"    [!] RTSP Port found! Potential URLs:")
        for path in RTSP_PATHS:
            print(f"        rtsp://{ip}:554{path}")
        print(f"        rtsp://admin:admin@{ip}:554/live/ch0 (Try with credentials)")

    if 80 in open_ports or 8080 in open_ports:
         p = 80 if 80 in open_ports else 8080
         print(f"    [!] HTTP Port found! specific web interface might be at http://{ip}:{p}")

print("--- Camera Probe Tool ---")
local_ip = get_local_ip()
if not local_ip:
    print("Could not determine local IP. Are you connected to WiFi?")
    sys.exit(1)

subnet = get_subnet(local_ip)
print(f"Local IP: {local_ip}")
print("Scanning for devices...")

hosts = scan_network_segment(subnet)
print(f"Found {len(hosts)} devices in ARP table.")

for host in hosts:
    if host == local_ip: continue
    # Filter out gateway if ending in .1 (usually)
    if host.endswith(".1"): continue 
    
    probe_camera(host)

print("\n--- Scan Complete ---")
print("If you see an IP with Port 554 open, that is likely your camera.")
print("Try opening the RTSP URL in VLC Player to verify.")
