#!/usr/bin/env python3
"""
D01 Bluetooth HID Protocol Analyzer
Captures and analyzes raw HID reports from the D01 ring via Bluetooth
"""

import hid
import time
import struct
import threading
from collections import defaultdict

# D01 Pro Bluetooth HID identifiers
VENDOR_ID = 0x05AC
PRODUCT_ID = 0x022C
DEVICE_ADDRESS = "58:5E:42:B3:2C:66"

class BluetoothHIDAnalyzer:
    def __init__(self):
        self.device = None
        self.running = False
        self.raw_reports = []
        self.report_patterns = defaultdict(int)
        self.button_states = {}
        
    def find_d01_device(self):
        """Find D01 ring in HID device list"""
        print("Scanning for D01 devices...")
        devices = hid.enumerate()
        
        d01_devices = []
        for device_info in devices:
            if (device_info['vendor_id'] == VENDOR_ID and 
                device_info['product_id'] == PRODUCT_ID):
                d01_devices.append(device_info)
                print(f"Found D01: {device_info}")
        
        return d01_devices
    
    def connect_to_device(self):
        """Connect to D01 ring via HID"""
        try:
            self.device = hid.device()
            self.device.open(VENDOR_ID, PRODUCT_ID)
            
            # Get device info
            manufacturer = self.device.get_manufacturer_string()
            product = self.device.get_product_string()
            serial = self.device.get_serial_number_string()
            
            print(f"Connected to: {product}")
            print(f"Manufacturer: {manufacturer}")
            print(f"Serial: {serial}")
            
            return True
            
        except Exception as e:
            print(f"Failed to connect: {e}")
            return False
    
    def parse_hid_report(self, data):
        """Parse raw HID report and extract button information"""
        if not data or len(data) == 0:
            return None
            
        # Convert to hex string for pattern analysis
        hex_data = data.hex().upper()
        
        # Basic HID report structure analysis
        report = {
            'timestamp': time.time(),
            'raw_data': data,
            'hex': hex_data,
            'length': len(data),
            'report_id': data[0] if len(data) > 0 else 0,
        }
        
        # Analyze common HID report structures
        if len(data) >= 2:
            report['modifier_keys'] = data[0] if data[0] != 0 else None
            report['keycode'] = data[1] if data[1] != 0 else None
            
        if len(data) >= 8:
            # Standard keyboard HID report (8 bytes)
            report['key_array'] = data[2:8]
            report['pressed_keys'] = [k for k in data[2:8] if k != 0]
        
        # Look for button patterns
        self.analyze_button_patterns(data, report)
        
        return report
    
    def analyze_button_patterns(self, data, report):
        """Analyze data for button press patterns"""
        # Look for bit patterns that might indicate button states
        if len(data) >= 1:
            byte0 = data[0]
            # Check individual bits
            for bit in range(8):
                if byte0 & (1 << bit):
                    report[f'bit_{bit}'] = True
        
        if len(data) >= 2:
            byte1 = data[1]
            for bit in range(8):
                if byte1 & (1 << bit):
                    report[f'byte1_bit_{bit}'] = True
    
    def log_report(self, report):
        """Log HID report for analysis"""
        if report:
            self.raw_reports.append(report)
            pattern = report['hex']
            self.report_patterns[pattern] += 1
            
            # Print interesting reports (non-zero data)
            if any(b != 0 for b in report['raw_data']):
                print(f"📡 HID Report: {report['hex']} | Length: {report['length']}")
                
                if report.get('keycode'):
                    print(f"   └─ Keycode: 0x{report['keycode']:02X}")
                    
                if report.get('pressed_keys'):
                    print(f"   └─ Keys: {[hex(k) for k in report['pressed_keys']]}")
                
                # Show bit analysis
                bits = []
                if len(report['raw_data']) >= 1:
                    byte0 = report['raw_data'][0]
                    for bit in range(8):
                        if byte0 & (1 << bit):
                            bits.append(f"B0.{bit}")
                            
                if len(report['raw_data']) >= 2:
                    byte1 = report['raw_data'][1]
                    for bit in range(8):
                        if byte1 & (1 << bit):
                            bits.append(f"B1.{bit}")
                
                if bits:
                    print(f"   └─ Bits: {', '.join(bits)}")
                    
                print()
    
    def start_capture(self):
        """Start capturing HID reports"""
        if not self.connect_to_device():
            return False
            
        self.running = True
        print("🎯 Starting HID capture...")
        print("Press buttons on the D01 ring to see HID reports")
        print("Press Ctrl+C to stop and analyze\n")
        
        try:
            while self.running:
                # Read HID report with timeout
                raw_data = self.device.read(64, timeout_ms=100)
                
                if raw_data:
                    report = self.parse_hid_report(raw_data)
                    self.log_report(report)
                    
        except KeyboardInterrupt:
            print("\n🛑 Stopping capture...")
            self.running = False
            
        finally:
            if self.device:
                self.device.close()
                
        self.analyze_captured_data()
    
    def analyze_captured_data(self):
        """Analyze all captured HID reports"""
        print("\n" + "="*60)
        print("📊 CAPTURE ANALYSIS")
        print("="*60)
        
        print(f"Total reports captured: {len(self.raw_reports)}")
        print(f"Unique patterns: {len(self.report_patterns)}")
        
        # Show most common patterns
        print("\n🔥 Most common HID patterns:")
        sorted_patterns = sorted(self.report_patterns.items(), 
                               key=lambda x: x[1], reverse=True)
        
        for pattern, count in sorted_patterns[:10]:
            print(f"  {pattern} (×{count})")
        
        # Analyze button press patterns
        self.analyze_button_sequences()
    
    def analyze_button_sequences(self):
        """Analyze sequences to identify button mappings"""
        print("\n🎯 Button Pattern Analysis:")
        
        # Look for press/release sequences
        sequences = []
        for i in range(1, len(self.raw_reports)):
            prev_report = self.raw_reports[i-1]
            curr_report = self.raw_reports[i]
            
            # Look for transitions from 0 to non-zero (button press)
            if (all(b == 0 for b in prev_report['raw_data']) and 
                any(b != 0 for b in curr_report['raw_data'])):
                sequences.append(('PRESS', curr_report))
                
            # Look for transitions from non-zero to 0 (button release)  
            elif (any(b != 0 for b in prev_report['raw_data']) and
                  all(b == 0 for b in curr_report['raw_data'])):
                sequences.append(('RELEASE', prev_report))
        
        # Group by button patterns
        button_patterns = defaultdict(list)
        for action, report in sequences:
            pattern = report['hex']
            button_patterns[pattern].append(action)
            
        for pattern, actions in button_patterns.items():
            print(f"  Pattern {pattern}: {actions}")

if __name__ == "__main__":
    print("🔬 D01 Bluetooth HID Protocol Analyzer")
    print("=" * 50)
    
    analyzer = BluetoothHIDAnalyzer()
    
    # First, find the D01 device
    devices = analyzer.find_d01_device()
    
    if not devices:
        print("❌ No D01 devices found!")
        print("Make sure the ring is connected via Bluetooth")
        exit(1)
    
    # Start capturing
    analyzer.start_capture()