import socket
import subprocess
import time
import sys
import threading
import re

RESULTS_FILE = "scan_results.txt"

def log(message):
    print(message)
    with open(RESULTS_FILE, "a") as f:
        f.write(message + "\n")

def get_arp_devices():
    devices = []
    try:
        output = subprocess.check_output("arp -a", shell=True).decode('utf-8')
        for line in output.split('\n'):
            # Extract IP from "(1.2.3.4)"
            match = re.search(r'\(([\d\.]+)\)', line)
            if match:
                devices.append(match.group(1))
    except:
        pass
    return devices

def scan_target(ip):
    log(f"[*] Scanning Target: {ip}")
    
    ports = [80, 8080, 554, 1935, 81, 8899, 34567, 5000, 6666, 8000, 8081]
    
    log(f"[*] Checking TCP ports on {ip}...")
    for p in ports:
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(0.5)
            res = s.connect_ex((ip, p))
            if res == 0:
                log(f"    [+] TCP Port {p} OPEN")
            s.close()
        except:
            pass

def main():
    print("\n" + "="*50)
    print("IMPROVED AP PROBE")
    print("="*50)
    print("1. Disconnect from Home WiFi.")
    print("2. Connect to Camera WiFi.")
    print("3. IMPORTANT: Wait 10 seconds after connecting.")
    
    input("\n>>> PRESS ENTER WHEN CONNECTED <<<")
    
    print("\n[+] Analysing Network...")
    time.sleep(2)
    
    # 1. ARP Scan (Who is talking?)
    devices = get_arp_devices()
    log(f"[+] ARP Table content: {devices}")
    
    # 2. Heuristic Scan (Common Camera Gateways)
    # Even if we have a self-assigned IP (169.254...), the camera might be at fixed IP.
    common_gateways = ["192.168.1.1", "192.168.1.254", "10.10.10.1", "10.10.10.254", "192.168.10.1"]
    
    targets = set(devices + common_gateways)
    
    for ip in targets:
        # Filter out multicast/broadcast
        if ip.endswith(".255") or ip.startswith("224."): continue
        
        # Quick ping check
        try:
            res = subprocess.call(["ping", "-c", "1", "-t", "1", ip], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            if res == 0:
                log(f"[+] Host {ip} is UP! Scanning...")
                scan_target(ip)
        except:
            pass
            
    print("\n" + "="*50)
    print("SCAN COMPLETE! Check scan_results.txt")

if __name__ == "__main__":
    main()
