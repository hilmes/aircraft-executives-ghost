#!/usr/bin/env python3
"""
D01 Ring Firmware-Level Remapping Tool
Intercepts HID reports and modifies them before OS processing
"""

import hid
import struct
import time

# D01 Pro HID identifiers (from Bluetooth scan)
VENDOR_ID = 0x05AC  # Apple VID (likely rebranded)
PRODUCT_ID = 0x022C
DEVICE_ADDRESS = "58:5E:42:B3:2C:66"

class D01Remapper:
    def __init__(self):
        self.device = None
        self.running = False
        self.button_states = {}
        self.press_times = {}
        self.long_press_threshold = 0.8  # 800ms for long press
        
    def connect(self):
        """Connect to D01 ring via HID"""
        try:
            # Try to open HID device
            self.device = hid.device()
            self.device.open(VENDOR_ID, PRODUCT_ID)
            print(f"Connected to D01 Pro: {self.device.get_product_string()}")
            return True
        except Exception as e:
            print(f"Failed to connect: {e}")
            return False
    
    def remap_buttons(self, raw_report):
        """
        Remap button presses at HID level with long press detection
        Modify HID report before OS sees it
        """
        if len(raw_report) < 2:
            return raw_report
            
        # Parse HID report (device-specific format)
        report_id = raw_report[0]
        button_state = raw_report[1]
        current_time = time.time()
        
        # Track button press timing
        bottom_pressed = bool(button_state & 0x01)
        top_pressed = bool(button_state & 0x02)
        middle_pressed = bool(button_state & 0x04)
        
        # Handle bottom button (hold to record, release to stop)
        remapped = 0
        if bottom_pressed:
            if 'bottom' not in self.press_times:
                # Button just pressed - start recording immediately
                self.press_times['bottom'] = current_time
                self.button_states['bottom'] = 'pressing'
                remapped = 0x10  # Start WisprFlow recording
                print("Bottom button pressed - Start WisprFlow recording")
            # While held down, continue sending start signal
            elif self.button_states['bottom'] == 'pressing':
                # Check if we've crossed long press threshold
                press_duration = current_time - self.press_times['bottom']
                if press_duration >= self.long_press_threshold:
                    self.button_states['bottom'] = 'long_pressed'
                    print("Long press threshold reached - continuing recording")
                # Keep sending recording signal while held
                remapped = 0x10
        else:
            if 'bottom' in self.press_times:
                # Button released - stop recording
                press_duration = current_time - self.press_times['bottom']
                if press_duration >= self.long_press_threshold:
                    # Was a long press - stop and process
                    remapped = 0x80  # Stop WisprFlow and process
                    print("Long press released - Stop and process WisprFlow")
                else:
                    # Was a short press - just stop
                    remapped = 0x20  # Stop WisprFlow
                    print("Short press released - Stop WisprFlow")
                
                # Clean up tracking
                del self.press_times['bottom']
                if 'bottom' in self.button_states:
                    del self.button_states['bottom']
        
        # Top button (volume up) -> Different custom code  
        if top_pressed:
            remapped |= 0x20  # Custom keycode
            
        # Middle button -> Another custom code
        if middle_pressed:
            remapped |= 0x40  # Custom keycode
            
        # Rebuild HID report
        new_report = bytearray(raw_report)
        new_report[1] = remapped
        
        return bytes(new_report)
    
    def start_remapping(self):
        """Main remapping loop"""
        if not self.connect():
            return
            
        self.running = True
        print("Starting firmware-level remapping...")
        
        try:
            while self.running:
                # Read raw HID report
                raw_data = self.device.read(64, timeout_ms=100)
                
                if raw_data:
                    # Remap at firmware level
                    remapped_data = self.remap_buttons(raw_data)
                    
                    # Send modified report to virtual HID device
                    # (Would need virtual HID driver implementation)
                    self.send_virtual_hid(remapped_data)
                    
        except KeyboardInterrupt:
            print("Stopping remapper...")
        finally:
            if self.device:
                self.device.close()
    
    def send_virtual_hid(self, data):
        """Send remapped HID data as virtual device"""
        # Method 1: Use AppleScript to send keystrokes
        self.send_via_applescript(data)
        
        # Method 2: Future - actual virtual HID device
        # self.send_via_virtual_device(data)
        
    def send_via_applescript(self, data):
        """Send keystrokes via AppleScript (temporary solution)"""
        if len(data) < 2:
            return
            
        keycode = data[1]
        
        # Map our custom codes to AppleScript keystrokes
        if keycode == 0x10:  # Start recording
            os.system('osascript -e "tell application \\"System Events\\" to keystroke \\"r\\" using {command down, shift down}"')
        elif keycode == 0x20:  # Stop recording
            os.system('osascript -e "tell application \\"System Events\\" to keystroke \\"s\\" using {command down, shift down}"')
        elif keycode == 0x40:  # Middle button
            os.system('osascript -e "tell application \\"System Events\\" to keystroke \\"]\\\" using {command down, shift down}"')
        elif keycode == 0x80:  # Long press control
            os.system('osascript -e "tell application \\"System Events\\" to key code 126 using {control down}"')  # Ctrl+Up
            
        print(f"Sent keycode via AppleScript: 0x{keycode:02x}")

if __name__ == "__main__":
    remapper = D01Remapper()
    remapper.start_remapping()