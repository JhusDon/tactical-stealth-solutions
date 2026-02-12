import socket

def listen_broadcast():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
    s.bind(("", 32108)) # Common P2P port, also try 0 to catch everything if possible? No.
    # We can bind to 0.0.0.0 and a specific port.
    # Let's try to just sniff common discovery ports: 3702 (Onvif), 1900 (SSDP), 32108 (P2P)
    
    print("Listening for UDP broadcasts on common ports...")
    
    drivers = [
        (3702, "ONVIF"),
        (1900, "SSDP/UPnP"),
        (32108, "P2P/TUTK"),
        (8899, "Onvif-Alt"),
        (5050, "V380")
    ]
    
    # We can't bind multiple sockets easily in one blocking script without Threads.
    # Let's use a simple scanner that sends a broad "Who is there" probe?
    pass

# Better approach: actively send discovery packets.
# ONVIF Probe
def send_onvif_probe():
    msg = '''<?xml version="1.0" encoding="UTF-8"?>
    <e:Envelope xmlns:e="http://www.w3.org/2003/05/soap-envelope"
        xmlns:w="http://schemas.xmlsoap.org/ws/2004/08/addressing"
        xmlns:d="http://schemas.xmlsoap.org/ws/2005/04/discovery"
        xmlns:dn="http://www.onvif.org/ver10/network/wsdl">
        <e:Header>
            <w:MessageID>uuid:84ede3de-7dec-11d0-c360-F01234567890</w:MessageID>
            <w:To e:mustUnderstand="true">urn:schemas-xmlsoap-org:ws:2005:04:discovery</w:To>
            <w:Action a:mustUnderstand="true">http://schemas.xmlsoap.org/ws/2005/04/discovery/Probe</w:Action>
        </e:Header>
        <e:Body>
            <d:Probe>
                <d:Types>dn:NetworkVideoTransmitter</d:Types>
            </d:Probe>
        </e:Body>
    </e:Envelope>'''
    
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
    s.settimeout(2)
    try:
        s.sendto(msg.encode(), ('239.255.255.250', 3702))
        print("Sent ONVIF probe...")
        while True:
            data, addr = s.recvfrom(1024)
            print(f"Received ONVIF response from {addr}: {data[:100]}...")
    except socket.timeout:
        print("No more ONVIF responses.")
    except Exception as e:
        print(f"Error: {e}")
    s.close()
    
if __name__ == "__main__":
    send_onvif_probe()
