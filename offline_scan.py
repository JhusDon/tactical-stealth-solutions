import socket
import subprocess
import time
import sys
import threading

RESULTS_FILE = "scan_results.txt"

def log(message):
    print(message)
    with open(RESULTS_FILE, "a") as f:
        f.write(message + "\n")

def get_gateway():
    try:
        # MacOS specific
        cmd = "netstat -rn | grep default | grep en0 | awk '{print $2}'"
        gateway = subprocess.check_output(cmd, shell=True).decode('utf-8').strip().split('\n')[0]
        return gateway
    except:
        return None

def scan_target(ip):
    log(f"[*] Scanning Target: {ip}")
    
    # 1. TCP Connect Scan (Fast, Top 100 ports + Camera Ports)
    ports = [80, 8080, 554, 1935, 81, 8899, 34567, 5000, 6666, 8000, 8081]
    
    log(f"[*] Checking common TCP ports on {ip}...")
    for p in ports:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(1.0)
        res = s.connect_ex((ip, p))
        if res == 0:
            log(f"    [+] TCP Port {p} OPEN")
        s.close()

    # 2. Curl Check (HTTP)
    log(f"[*] Checking HTTP/RTSP endpoints...")
    try:
        subprocess.check_output(f"curl -I --connect-timeout 2 http://{ip}", shell=True)
        log("    [+] HTTP Response detected at root /")
    except:
        pass
        
    try:
        subprocess.check_output(f"curl -v --connect-timeout 2 rtsp://{ip}", shell=True)
        log("    [+] RTSP Response detected")
    except:
        pass

def main():
    print("\n" + "="*50)
    print("OFFLINE CAMERA SCANNER")
    print("="*50)
    print("This script helps us scan the camera even without internet.")
    print("INSTRUCTIONS:")
    print("1. Disconnect from your home WiFi.")
    print("2. Connect to the Camera's WiFi (AP Mode).")
    print("3. Wait until the WiFi icon stops blinking.")
    
    input("\n>>> PRESS ENTER ONCE YOU ARE CONNECTED TO THE CAMERA <<<")
    
    print("\n[+] Detecting connection...")
    time.sleep(2)
    
    gateway = get_gateway()
    if not gateway:
        print("[!] Could not detect Gateway IP. Are you connected?")
        # Fallback scan of local subnet?
        log("[!] Fatal: No gateway found.")
        return

    log(f"[+] Detected Gateway (Camera) IP: {gateway}")
    
    # Scan the Gateway
    scan_target(gateway)
    
    # Sometimes cameras are at .1, sometimes they are the gateway.
    # Let's also scan .1 if gateway is distinct or just to be safe
    base = ".".join(gateway.split(".")[:3])
    possible_ips = [f"{base}.1", f"{base}.100", f"{base}.254"]
    
    for ping_ip in possible_ips:
        if ping_ip != gateway:
            # Quick ping
            res = subprocess.call(["ping", "-c", "1", "-t", "1", ping_ip], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            if res == 0:
                log(f"[+] Found active device at {ping_ip}")
                scan_target(ping_ip)

    print("\n" + "="*50)
    print("SCAN COMPLETE!")
    print(f"Results saved to: {RESULTS_FILE}")
    print("="*50)
    print("4. Switch your WiFi back to the Internet.")
    print("5. Tell the AI agent 'I am back' and upload the results.")

if __name__ == "__main__":
    main()
