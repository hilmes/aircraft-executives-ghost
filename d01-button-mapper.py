#!/usr/bin/env python3
"""
D01 Button Mapper - Live button press detection and mapping
"""

import hid
import time

# D01 Pro identifiers
VENDOR_ID = 0x05AC
PRODUCT_ID = 0x022C

class D01ButtonMapper:
    def __init__(self):
        self.device = None
        self.last_report = None
        self.button_names = {
            # We'll discover these through testing
            'unknown_buttons': {}
        }
        
    def connect(self):
        """Connect to D01 ring"""
        try:
            self.device = hid.device()
            self.device.open(VENDOR_ID, PRODUCT_ID)
            
            print(f"✅ Connected to: {self.device.get_product_string()}")
            return True
            
        except Exception as e:
            print(f"❌ Connection failed: {e}")
            return False
    
    def detect_button_press(self, current_report, last_report):
        """Detect which button was pressed by comparing reports"""
        if not last_report:
            return None
            
        # Compare bytes to find differences
        changes = []
        for i, (curr, last) in enumerate(zip(current_report, last_report)):
            if curr != last:
                changes.append({
                    'byte_index': i,
                    'old_value': last,
                    'new_value': curr,
                    'diff': curr ^ last  # XOR to see bit changes
                })
        
        return changes if changes else None
    
    def format_report(self, data):
        """Format HID report for display"""
        if not data:
            return "No data"
            
        hex_str = ' '.join(f'{b:02X}' for b in data)
        bits_str = ' '.join(f'{b:08b}' for b in data[:4])  # Show first 4 bytes as bits
        
        return f"HEX: {hex_str}\nBITS: {bits_str}"
    
    def analyze_changes(self, changes):
        """Analyze what changed between reports"""
        analysis = []
        
        for change in changes:
            byte_idx = change['byte_index']
            old_val = change['old_value']
            new_val = change['new_value']
            diff = change['diff']
            
            # Check which bits changed
            changed_bits = []
            for bit in range(8):
                if diff & (1 << bit):
                    old_bit = (old_val >> bit) & 1
                    new_bit = (new_val >> bit) & 1
                    changed_bits.append(f"bit{bit}: {old_bit}→{new_bit}")
            
            analysis.append(f"Byte[{byte_idx}]: 0x{old_val:02X}→0x{new_val:02X} ({', '.join(changed_bits)})")
        
        return analysis
    
    def start_mapping(self):
        """Start live button mapping"""
        if not self.connect():
            return
            
        print("\n🎯 D01 Button Mapping Mode")
        print("Press buttons on the ring to see HID reports")
        print("Press Ctrl+C to stop\n")
        
        button_count = 0
        
        try:
            while True:
                # Read HID report
                data = self.device.read(64, timeout_ms=100)
                
                if data:
                    # Check if this report is different from last
                    if data != self.last_report:
                        
                        # Detect if this is a button press (non-zero data)
                        if any(b != 0 for b in data):
                            button_count += 1
                            print(f"🔴 BUTTON PRESS #{button_count}")
                            print(f"Time: {time.strftime('%H:%M:%S')}")
                            print(self.format_report(data))
                            
                            # Analyze changes from last report
                            if self.last_report:
                                changes = self.detect_button_press(data, self.last_report)
                                if changes:
                                    print("Changes:")
                                    for analysis in self.analyze_changes(changes):
                                        print(f"  {analysis}")
                            print("-" * 50)
                            
                        # Detect button release (return to zeros)
                        elif self.last_report and any(b != 0 for b in self.last_report):
                            print(f"🔵 BUTTON RELEASE")
                            print(f"Time: {time.strftime('%H:%M:%S')}")
                            print("All bytes returned to zero")
                            print("-" * 50)
                        
                        self.last_report = data[:]  # Copy the data
                        
        except KeyboardInterrupt:
            print("\n🛑 Stopping button mapping...")
            
        finally:
            if self.device:
                self.device.close()
        
        print(f"\n📊 Session Summary: {button_count} button presses detected")

if __name__ == "__main__":
    print("🔬 D01 Button Mapper")
    print("=" * 30)
    
    mapper = D01ButtonMapper()
    
    # Check if device is available
    devices = hid.enumerate()
    d01_found = False
    
    for device_info in devices:
        if (device_info['vendor_id'] == VENDOR_ID and 
            device_info['product_id'] == PRODUCT_ID):
            d01_found = True
            print(f"📱 Found D01: {device_info.get('product_string', 'Unknown')}")
            break
    
    if not d01_found:
        print("❌ D01 ring not found!")
        print("Make sure it's connected via Bluetooth")
        exit(1)
    
    mapper.start_mapping()