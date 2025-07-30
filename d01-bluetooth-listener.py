#!/usr/bin/env python3
"""
D01 Bluetooth HID Listener
Captures raw Bluetooth HID signals from the D01 ring
"""

import subprocess
import threading
import time
import re
import json
import os
from collections import defaultdict

class BluetoothHIDListener:
    def __init__(self):
        self.device_address = "58:5E:42:B3:2C:66"
        self.device_name = "D01 Pro"
        self.running = False
        self.raw_packets = []
        self.button_patterns = defaultdict(int)
        self.last_packet = None
        self.packet_count = 0
        
    def check_bluetooth_connection(self):
        """Check if D01 ring is connected"""
        try:
            result = subprocess.run([
                'system_profiler', 'SPBluetoothDataType'
            ], capture_output=True, text=True)
            
            # Check if device is listed (even if not explicitly "Connected: Yes")
            if self.device_address in result.stdout and "D01 Pro" in result.stdout:
                print(f"✅ {self.device_name} found in Bluetooth devices")
                print(f"   Address: {self.device_address}")
                return True
            else:
                print(f"❌ {self.device_name} not found in Bluetooth devices")
                print("Available Bluetooth devices:")
                # Show available devices for debugging
                lines = result.stdout.split('\n')
                for line in lines:
                    if 'Address:' in line and '58:5E:42' not in line:
                        print(f"   {line.strip()}")
                return False
                
        except Exception as e:
            print(f"Error checking Bluetooth connection: {e}")
            return False
    
    def start_packet_capture(self):
        """Start capturing Bluetooth HID packets"""
        print("🎯 Starting Bluetooth HID packet capture...")
        print("Press buttons on the D01 ring to see HID data")
        print("Press Ctrl+C to stop and analyze\n")
        
        # Method 1: Monitor system log for HID events
        self.monitor_system_log()
    
    def monitor_system_log(self):
        """Monitor macOS system log for HID events"""
        try:
            # Monitor system log for Bluetooth HID events
            process = subprocess.Popen([
                'log', 'stream', '--predicate',
                'subsystem CONTAINS "bluetooth" OR subsystem CONTAINS "hid" OR '
                'eventMessage CONTAINS "HID" OR eventMessage CONTAINS "58:5E:42:B3:2C:66"',
                '--style', 'compact'
            ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            
            self.running = True
            
            for line in process.stdout:
                if not self.running:
                    break
                    
                line = line.strip()
                if line and self.is_relevant_hid_event(line):
                    self.process_hid_event(line)
                    
        except KeyboardInterrupt:
            print("\n🛑 Stopping packet capture...")
            self.running = False
            process.terminate()
            
        except Exception as e:
            print(f"Error monitoring system log: {e}")
            self.running = False
    
    def is_relevant_hid_event(self, line):
        """Check if log line contains relevant HID events"""
        keywords = [
            'hid', 'bluetooth', 'key', 'button', 'input',
            self.device_address.lower(), 'd01', 'keyboard'
        ]
        
        line_lower = line.lower()
        return any(keyword in line_lower for keyword in keywords)
    
    def process_hid_event(self, line):
        """Process a HID event line from system log"""
        timestamp = time.strftime('%H:%M:%S')
        self.packet_count += 1
        
        print(f"[{timestamp}] Packet #{self.packet_count}")
        print(f"  Raw: {line}")
        
        # Try to extract hex data from the line
        hex_pattern = r'([0-9a-fA-F]{2}(?:\s+[0-9a-fA-F]{2})*)'
        hex_matches = re.findall(hex_pattern, line)
        
        if hex_matches:
            for hex_data in hex_matches:
                self.analyze_hex_data(hex_data.strip())
        
        # Look for specific HID-related keywords
        if 'key' in line.lower():
            print(f"  🔑 Key event detected")
            
        if 'report' in line.lower():
            print(f"  📊 HID report detected")
            
        print("-" * 60)
    
    def analyze_hex_data(self, hex_string):
        """Analyze hex data for button patterns"""
        try:
            # Convert hex string to bytes
            hex_bytes = bytes.fromhex(hex_string.replace(' ', ''))
            
            if len(hex_bytes) > 0:
                print(f"  Hex: {hex_string}")
                print(f"  Bytes: {[f'0x{b:02X}' for b in hex_bytes]}")
                
                # Check for non-zero bytes (likely button presses)
                non_zero_bytes = [b for b in hex_bytes if b != 0]
                if non_zero_bytes:
                    print(f"  🔴 Non-zero bytes: {[f'0x{b:02X}' for b in non_zero_bytes]}")
                    
                    # Pattern analysis
                    pattern = hex_string.replace(' ', '')
                    self.button_patterns[pattern] += 1
                
                # Store packet for analysis
                packet_info = {
                    'timestamp': time.time(),
                    'hex_string': hex_string,
                    'bytes': list(hex_bytes),
                    'non_zero_count': len(non_zero_bytes)
                }
                self.raw_packets.append(packet_info)
                
        except ValueError:
            # Not valid hex data
            pass
    
    def monitor_hidutil_events(self):
        """Alternative method: Monitor hidutil for events"""
        print("🔍 Monitoring HID device events...")
        
        try:
            # Get initial HID device list
            result = subprocess.run(['hidutil', 'list'], capture_output=True, text=True)
            initial_devices = set(result.stdout.split('\n'))
            
            while self.running:
                # Check for changes in HID devices
                result = subprocess.run(['hidutil', 'list'], capture_output=True, text=True)
                current_devices = set(result.stdout.split('\n'))
                
                new_devices = current_devices - initial_devices
                removed_devices = initial_devices - current_devices
                
                if new_devices:
                    print("🔌 New HID device events:")
                    for device in new_devices:
                        if device.strip():
                            print(f"  + {device}")
                
                if removed_devices:
                    print("🔌 Removed HID device events:")
                    for device in removed_devices:
                        if device.strip():
                            print(f"  - {device}")
                
                initial_devices = current_devices
                time.sleep(0.5)
                
        except KeyboardInterrupt:
            print("\n🛑 Stopping HID monitoring...")
            self.running = False
    
    def monitor_ioreg_changes(self):
        """Monitor IORegistry for changes"""
        print("🔍 Monitoring IORegistry for Bluetooth changes...")
        
        try:
            # Initial state
            result = subprocess.run([
                'ioreg', '-n', 'IOBluetoothHIDDriver', '-r'
            ], capture_output=True, text=True)
            initial_state = result.stdout
            
            while self.running:
                # Check current state
                result = subprocess.run([
                    'ioreg', '-n', 'IOBluetoothHIDDriver', '-r'
                ], capture_output=True, text=True)
                current_state = result.stdout
                
                if current_state != initial_state:
                    print("🔄 IORegistry change detected!")
                    # Find differences
                    initial_lines = set(initial_state.split('\n'))
                    current_lines = set(current_state.split('\n'))
                    
                    new_lines = current_lines - initial_lines
                    removed_lines = initial_lines - current_lines
                    
                    if new_lines:
                        print("➕ New entries:")
                        for line in new_lines:
                            if line.strip():
                                print(f"  {line}")
                    
                    if removed_lines:
                        print("➖ Removed entries:")
                        for line in removed_lines:
                            if line.strip():
                                print(f"  {line}")
                    
                    initial_state = current_state
                    print("-" * 60)
                
                time.sleep(1)
                
        except KeyboardInterrupt:
            print("\n🛑 Stopping IORegistry monitoring...")
            self.running = False
    
    def analyze_captured_data(self):
        """Analyze all captured packet data"""
        print("\n" + "="*80)
        print("📊 PACKET ANALYSIS SUMMARY")
        print("="*80)
        
        print(f"Total packets captured: {len(self.raw_packets)}")
        print(f"Unique patterns found: {len(self.button_patterns)}")
        
        if self.button_patterns:
            print("\n🔥 Most common patterns:")
            sorted_patterns = sorted(self.button_patterns.items(), 
                                   key=lambda x: x[1], reverse=True)
            
            for pattern, count in sorted_patterns[:10]:
                print(f"  Pattern: {pattern} (occurred {count} times)")
        
        # Analyze button press sequences
        if len(self.raw_packets) > 1:
            print("\n🎯 Button press sequence analysis:")
            self.analyze_button_sequences()
        
        # Save data for further analysis
        self.save_analysis_data()
    
    def analyze_button_sequences(self):
        """Analyze sequences to identify button press patterns"""
        press_sequences = []
        
        for i in range(1, len(self.raw_packets)):
            prev_packet = self.raw_packets[i-1]
            curr_packet = self.raw_packets[i]
            
            # Look for transitions (zero to non-zero = press, non-zero to zero = release)
            prev_nonzero = prev_packet['non_zero_count'] > 0
            curr_nonzero = curr_packet['non_zero_count'] > 0
            
            if not prev_nonzero and curr_nonzero:
                press_sequences.append(('PRESS', curr_packet))
                print(f"  🔴 BUTTON PRESS: {curr_packet['hex_string']}")
                
            elif prev_nonzero and not curr_nonzero:
                press_sequences.append(('RELEASE', prev_packet))
                print(f"  🔵 BUTTON RELEASE: {prev_packet['hex_string']}")
        
        print(f"\nDetected {len([s for s in press_sequences if s[0] == 'PRESS'])} button presses")
    
    def save_analysis_data(self):
        """Save captured data for analysis"""
        data = {
            'device_info': {
                'address': self.device_address,
                'name': self.device_name
            },
            'capture_session': {
                'timestamp': time.time(),
                'packet_count': len(self.raw_packets),
                'duration': time.time() - (self.raw_packets[0]['timestamp'] if self.raw_packets else time.time())
            },
            'packets': self.raw_packets,
            'patterns': dict(self.button_patterns)
        }
        
        filename = f"d01_capture_{int(time.time())}.json"
        try:
            with open(filename, 'w') as f:
                json.dump(data, f, indent=2)
            print(f"\n💾 Analysis data saved to: {filename}")
        except Exception as e:
            print(f"Error saving data: {e}")
    
    def start_listening(self, method='log'):
        """Start listening for Bluetooth HID signals"""
        if not self.check_bluetooth_connection():
            print("Please ensure the D01 ring is connected via Bluetooth")
            return False
        
        print(f"🚀 Starting Bluetooth HID listener (method: {method})")
        
        try:
            if method == 'log':
                self.start_packet_capture()
            elif method == 'hidutil':
                self.monitor_hidutil_events()
            elif method == 'ioreg':
                self.monitor_ioreg_changes()
            elif method == 'all':
                # Start all methods in separate threads
                threads = [
                    threading.Thread(target=self.start_packet_capture),
                    threading.Thread(target=self.monitor_hidutil_events),
                    threading.Thread(target=self.monitor_ioreg_changes)
                ]
                
                for thread in threads:
                    thread.daemon = True
                    thread.start()
                
                # Wait for keyboard interrupt
                try:
                    while self.running:
                        time.sleep(1)
                except KeyboardInterrupt:
                    print("\n🛑 Stopping all monitoring threads...")
                    self.running = False
                    
        except KeyboardInterrupt:
            print("\n🛑 Stopping Bluetooth HID listener...")
            self.running = False
        
        finally:
            if self.raw_packets:
                self.analyze_captured_data()
        
        return True

def main():
    print("🔬 D01 Bluetooth HID Listener")
    print("=" * 50)
    
    listener = BluetoothHIDListener()
    
    # Default to system log monitoring
    method = 'log'
    
    print(f"Starting listener with method: {method}")
    print("Make sure to press buttons on the D01 ring to generate HID events")
    print("Press Ctrl+C to stop\n")
    
    listener.start_listening(method)

if __name__ == "__main__":
    main()