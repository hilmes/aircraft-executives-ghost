#!/usr/bin/env python3
"""
D01 Bluetooth Packet Sniffer
Uses macOS Bluetooth tools to capture low-level packets
"""

import subprocess
import time
import re
import json

class BluetoothSniffer:
    def __init__(self):
        self.device_address = "58:5E:42:B3:2C:66"
        self.packets = []
        
    def check_bluetooth_tools(self):
        """Check if required Bluetooth tools are available"""
        tools = ['hcitool', 'bluetoothctl', 'btmon']
        available = []
        
        for tool in tools:
            try:
                subprocess.run([tool, '--help'], 
                             capture_output=True, check=False)
                available.append(tool)
            except FileNotFoundError:
                pass
                
        print(f"Available Bluetooth tools: {available}")
        return available
    
    def get_bluetooth_info(self):
        """Get Bluetooth device information"""
        try:
            # Get Bluetooth device info
            result = subprocess.run([
                'system_profiler', 'SPBluetoothDataType', '-json'
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                data = json.loads(result.stdout)
                return data
            
        except Exception as e:
            print(f"Error getting Bluetooth info: {e}")
            
        return None
    
    def monitor_bluetooth_events(self):
        """Monitor Bluetooth events using macOS log"""
        print("🔍 Monitoring Bluetooth HID events...")
        print("Press buttons on D01 ring to see events")
        print("Press Ctrl+C to stop\n")
        
        try:
            # Monitor system log for HID events
            process = subprocess.Popen([
                'log', 'stream', '--predicate', 
                'eventMessage CONTAINS "HID" OR eventMessage CONTAINS "58:5E:42:B3:2C:66"',
                '--style', 'compact'
            ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            
            for line in process.stdout:
                if 'HID' in line or self.device_address in line:
                    timestamp = time.strftime('%H:%M:%S')
                    print(f"[{timestamp}] {line.strip()}")
                    
        except KeyboardInterrupt:
            print("\n🛑 Stopping Bluetooth monitoring...")
            process.terminate()
    
    def analyze_hid_descriptor(self):
        """Analyze HID descriptor if available"""
        print("🔍 Analyzing HID descriptor...")
        
        # Try to get HID descriptor using IORegistry
        try:
            result = subprocess.run([
                'ioreg', '-n', 'IOBluetoothHIDDriver', '-r'
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                print("IOBluetoothHIDDriver registry:")
                print(result.stdout)
                
        except Exception as e:
            print(f"Error getting HID descriptor: {e}")
    
    def scan_bluetooth_services(self):
        """Scan for Bluetooth services on D01 device"""
        print(f"🔍 Scanning Bluetooth services for {self.device_address}...")
        
        try:
            # Use sdptool if available
            result = subprocess.run([
                'sdptool', 'browse', self.device_address
            ], capture_output=True, text=True, timeout=10)
            
            if result.returncode == 0:
                print("Available services:")
                print(result.stdout)
            else:
                print("sdptool not available or failed")
                
        except (FileNotFoundError, subprocess.TimeoutExpired):
            print("Bluetooth service scanning not available")

def main():
    print("🔬 D01 Bluetooth Protocol Sniffer")
    print("=" * 40)
    
    sniffer = BluetoothSniffer()
    
    # Check available tools
    available_tools = sniffer.check_bluetooth_tools()
    
    # Get device info
    bt_info = sniffer.get_bluetooth_info()
    if bt_info:
        print("\n📱 Bluetooth Device Info:")
        # Extract D01 info from JSON if present
        for device_type in bt_info.get('SPBluetoothDataType', []):
            for key, value in device_type.items():
                if isinstance(value, dict) and 'D01' in str(value):
                    print(f"  {key}: {value}")
    
    print("\nChoose analysis method:")
    print("1. Monitor HID events (log stream)")
    print("2. Analyze HID descriptor")
    print("3. Scan Bluetooth services")
    print("4. All of the above")
    
    choice = input("Enter choice (1-4): ").strip()
    
    if choice in ['1', '4']:
        sniffer.monitor_bluetooth_events()
    
    if choice in ['2', '4']:
        sniffer.analyze_hid_descriptor()
        
    if choice in ['3', '4']:
        sniffer.scan_bluetooth_services()

if __name__ == "__main__":
    main()