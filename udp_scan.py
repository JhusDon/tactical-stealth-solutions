import socket
import threading
import time

target = "192.168.178.85"
# Common P2P / Camera UDP ports
common_ports = [32100, 32108, 80, 8080, 5050, 6677, 554, 1935, 1234, 10000, 10001, 8899, 34567, 3702, 1900]

def scan_udp(port):
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(2.0)
        # UDP is connectionless; we must send data to see if we get a response or ICMP unreachable
        # Sending a dummy payload
        s.sendto(b'ping', (target, port))
        try:
            data, addr = s.recvfrom(1024)
            print(f"[+] UDP Port {port} OPEN - Response: {data}")
        except socket.timeout:
            # Timeout doesn't strictly mean closed, but means no active response to garbage
            pass
        except ConnectionRefusedError:
             # This (ICMP Port Unreachable) actually means CLOSED
             pass
        s.close()
    except Exception as e:
        print(f"Error checking {port}: {e}")

print(f"Scanning common UDP ports on {target}...")
threads = []
for p in common_ports:
    t = threading.Thread(target=scan_udp, args=(p,))
    t.start()
    threads.append(t)

for t in threads:
    t.join()
print("Scan complete.")
