#!/usr/bin/env python3
"""
D01 Debug Scanner - Show ALL activity from D01 device
"""

import subprocess
import time

def debug_d01_activity():
    """Show all D01 device activity"""
    device_address = "58:5E:42:B3:2C:66"
    
    print("🔬 D01 Debug Scanner")
    print("=" * 50)
    print(f"Monitoring device: {device_address}")
    print("Press buttons on your D01 ring now!")
    print("This will show ALL system events related to your device")
    print("Press Ctrl+C to stop\n")
    
    try:
        # Monitor ALL events containing the device address
        process = subprocess.Popen([
            'log', 'stream', '--predicate',
            f'eventMessage CONTAINS "{device_address}"',
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
                
                # Highlight interesting patterns
                if any(keyword in line.lower() for keyword in ['button', 'key', 'press', 'input', 'report']):
                    print(f"  ⭐ This looks like input activity!")
                
                print("-" * 60)
                
    except KeyboardInterrupt:
        print(f"\n🛑 Stopping scanner... Captured {event_count} events")
        process.terminate()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    debug_d01_activity()