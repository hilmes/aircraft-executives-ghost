#!/usr/bin/env python3
"""
D01 IOKit Interceptor - Capture input events at IOKit level
"""

import subprocess
import time
import re

class IOKitInterceptor:
    def __init__(self):
        self.device_address = "58:5E:42:B3:2C:66"
        
    def monitor_io_events(self):
        """Monitor IOKit HID events"""
        print("🔍 Monitoring IOKit HID events...")
        print("Press buttons on D01 ring to see raw events")
        print("Press Ctrl+C to stop\n")
        
        try:
            # Monitor for HID events in system log
            process = subprocess.Popen([
                'log', 'stream', '--predicate',
                'subsystem == "com.apple.iokit" AND category == "HID"'
            ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            
            for line in process.stdout:
                if any(keyword in line.lower() for keyword in ['hid', 'keyboard', 'button', '5ac', '22c']):
                    timestamp = time.strftime('%H:%M:%S')
                    print(f"[{timestamp}] {line.strip()}")
                    
        except KeyboardInterrupt:
            print("\n🛑 Stopping IOKit monitoring...")
            process.terminate()
    
    def monitor_input_events(self):
        """Monitor input events using different approach"""
        print("🔍 Monitoring system input events...")
        print("Press buttons to see events\n")
        
        try:
            # Try monitoring using different system tools
            process = subprocess.Popen([
                'log', 'stream', '--predicate',
                'eventMessage CONTAINS "key" OR eventMessage CONTAINS "button" OR eventMessage CONTAINS "HID"',
                '--style', 'compact'
            ], stdout=subprocess.PIPE, text=True)
            
            for line in process.stdout:
                if line.strip():
                    print(f"{time.strftime('%H:%M:%S')} | {line.strip()}")
                    
        except KeyboardInterrupt:
            print("\n🛑 Stopping input monitoring...")
            process.terminate()
    
    def scan_ioreg_for_d01(self):
        """Scan IORegistry for D01 device"""
        print("🔍 Scanning IORegistry for D01 device...")
        
        try:
            # Search for Bluetooth HID devices
            result = subprocess.run([
                'ioreg', '-n', 'IOBluetoothHIDDriver', '-r'
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                lines = result.stdout.split('\n')
                d01_section = False
                
                for line in lines:
                    if '58:5E:42:B3:2C:66' in line or 'D01' in line:
                        d01_section = True
                        print("🎯 Found D01 in IORegistry:")
                        
                    if d01_section:
                        print(line)
                        # Stop after showing the relevant section
                        if line.strip() == '' and d01_section:
                            break
            
            # Also check for generic Bluetooth devices
            result2 = subprocess.run([
                'ioreg', '-c', 'IOBluetoothDevice'
            ], capture_output=True, text=True)
            
            if result2.returncode == 0:
                if '58:5E:42:B3:2C:66' in result2.stdout:
                    print("\n🎯 Found D01 Bluetooth device in IORegistry")
                    # Extract relevant section
                    lines = result2.stdout.split('\n')
                    for i, line in enumerate(lines):
                        if '58:5E:42:B3:2C:66' in line:
                            # Show context around the match
                            start = max(0, i-5)
                            end = min(len(lines), i+10)
                            for j in range(start, end):
                                print(lines[j])
                            break
                            
        except Exception as e:
            print(f"Error scanning IORegistry: {e}")

def main():
    print("🔬 D01 IOKit Interceptor")
    print("=" * 30)
    
    interceptor = IOKitInterceptor()
    
    print("\nChoose monitoring method:")
    print("1. IOKit HID events")
    print("2. System input events")
    print("3. Scan IORegistry for D01")
    print("4. All methods")
    
    choice = input("Enter choice (1-4): ").strip()
    
    if choice in ['3', '4']:
        interceptor.scan_ioreg_for_d01()
        
    if choice in ['1', '4']:
        print("\n" + "-"*50)
        interceptor.monitor_io_events()
        
    if choice in ['2', '4']:
        print("\n" + "-"*50)
        interceptor.monitor_input_events()

if __name__ == "__main__":
    main()