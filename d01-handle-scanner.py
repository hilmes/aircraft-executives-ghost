#!/usr/bin/env python3
"""
D01 Handle Scanner - Monitor specific HID handle
"""

import subprocess
import time

def scan_d01_handle():
    """Monitor the specific HID handle we know the D01 uses"""
    print("🔬 D01 Handle Scanner")
    print("=" * 50)
    print("Monitoring HID handle=521 (D01 ring)")
    print("Press buttons on your D01 ring now!")
    print("Press Ctrl+C to stop\n")
    
    try:
        # Monitor for the specific handle we saw in previous captures
        process = subprocess.Popen([
            'log', 'stream', '--predicate',
            'eventMessage CONTAINS "handle=521" OR '
            'eventMessage CONTAINS "buttonState" OR '
            '(subsystem == "com.apple.WindowServer" AND eventMessage CONTAINS "button")',
            '--style', 'compact'
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        event_count = 0
        
        while True:
            line = process.stdout.readline()
            if not line:
                break
                
            line = line.strip()
            if line:
                event_count += 1
                timestamp = time.strftime('%H:%M:%S')
                
                print(f"[{timestamp}] Event #{event_count}")
                print(f"  {line}")
                
                # Parse different event types
                if "handle=521" in line:
                    print(f"  🎯 D01 HID ACTIVITY!")
                    
                    if "length=" in line:
                        import re
                        length_match = re.search(r'length=(\d+)', line)
                        if length_match:
                            length = length_match.group(1)
                            print(f"     Data length: {length} bytes")
                
                if "buttonState" in line:
                    print(f"  🔴 BUTTON STATE CHANGE!")
                    
                if "SenderID" in line:
                    print(f"  📱 DEVICE EVENT!")
                
                print("-" * 60)
                
    except KeyboardInterrupt:
        print(f"\n🛑 Stopping scanner... Captured {event_count} events")
        process.terminate()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    scan_d01_handle()