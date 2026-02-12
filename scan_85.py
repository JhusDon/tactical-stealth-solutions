import socket
import threading
import sys
import time

target_ip = "192.168.178.85"
open_ports = []
threads = []

def scan_port(port):
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(0.5) # Fast timeout
        result = s.connect_ex((target_ip, port))
        if result == 0:
            print(f"[+] Port {port} is OPEN")
            open_ports.append(port)
        s.close()
    except:
        pass

print(f"Scanning all 65535 ports on {target_ip}...")
start_time = time.time()

# Chunking to avoid "Too many open files"
for i in range(1, 65536):
    t = threading.Thread(target=scan_port, args=(i,))
    threads.append(t)
    t.start()
    
    # Simple concurrency limit (e.g. 500 threads)
    if len(threads) >= 500:
        for t in threads:
            t.join()
        threads = []
        # Progress indication every 1000 ports
        if i % 1000 == 0:
            print(f"Scanned up to port {i}...", end='\r')

for t in threads:
    t.join()

print(f"\nScan complete in {time.time() - start_time:.2f}s")
if open_ports:
    print(f"Open ports: {open_ports}")
else:
    print("No open ports found.")
