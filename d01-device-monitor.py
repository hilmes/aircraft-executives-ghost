#!/usr/bin/env python3
"""
D01 Device Monitor - Detects charging case and ring connections
"""

import subprocess
import json
import time
import sys

class D01DeviceMonitor:
    def __init__(self):
        self.known_devices = set()
        self.d01_vendor_id = "0x05ac"
        self.d01_product_id = "0x022c"
        
    def get_current_usb_devices(self):
        """Get current USB devices as JSON"""
        try:
            result = subprocess.run([
                'system_profiler', 'SPUSBDataType', '-json'
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                return json.loads(result.stdout)
            return None
        except Exception as e:
            print(f"Error getting USB devices: {e}")
            return None
    
    def get_current_hid_devices(self):
        """Get current HID devices"""
        try:
            result = subprocess.run(['hidutil', 'list'], capture_output=True, text=True)
            if result.returncode == 0:
                return result.stdout
            return None
        except Exception as e:
            print(f"Error getting HID devices: {e}")
            return None
    
    def find_d01_devices(self, usb_data, hid_data):
        """Find D01 ring or charging case in device lists"""
        found_devices = []
        
        # Check USB devices
        if usb_data:
            for bus in usb_data.get('SPUSBDataType', []):
                devices = self.extract_usb_devices(bus)
                for device in devices:
                    if self.is_d01_device(device):
                        found_devices.append(('USB', device))
        
        # Check HID devices
        if hid_data:
            for line in hid_data.split('\n'):
                if self.d01_vendor_id in line and self.d01_product_id in line:
                    found_devices.append(('HID', line.strip()))
                elif self.d01_vendor_id in line:
                    # Might be a related Apple device
                    found_devices.append(('HID_APPLE', line.strip()))
        
        return found_devices
    
    def extract_usb_devices(self, bus_data):
        """Recursively extract all USB devices from bus data"""
        devices = []
        
        if isinstance(bus_data, dict):
            # If this is a device with vendor/product info
            if 'vendor_id' in bus_data and 'product_id' in bus_data:
                devices.append(bus_data)
            
            # Check for nested items
            if '_items' in bus_data:
                for item in bus_data['_items']:
                    devices.extend(self.extract_usb_devices(item))
        
        return devices
    
    def is_d01_device(self, device):
        """Check if device matches D01 specifications"""
        vendor_id = device.get('vendor_id', '').lower()
        product_id = device.get('product_id', '').lower()
        
        # Check for exact match
        if self.d01_vendor_id.lower() in vendor_id and self.d01_product_id.lower() in product_id:
            return True
        
        # Check for potential charging case (might have different product ID)
        if self.d01_vendor_id.lower() in vendor_id:
            return True
            
        return False
    
    def monitor_devices(self):
        """Monitor for device changes"""
        print("Monitoring for D01 devices...")
        print("Plug/unplug the charging case to see it detected")
        print("Press Ctrl+C to stop")
        
        try:
            while True:
                usb_data = self.get_current_usb_devices()
                hid_data = self.get_current_hid_devices()
                
                devices = self.find_d01_devices(usb_data, hid_data)
                
                current_device_set = set(str(d) for d in devices)
                
                # Check for new devices
                new_devices = current_device_set - self.known_devices
                removed_devices = self.known_devices - current_device_set
                
                if new_devices:
                    print(f"\n🔌 NEW DEVICES DETECTED:")
                    for device in new_devices:
                        print(f"  {device}")
                
                if removed_devices:
                    print(f"\n🔌 DEVICES REMOVED:")
                    for device in removed_devices:
                        print(f"  {device}")
                
                self.known_devices = current_device_set
                
                if devices:
                    print(f"\n📱 Currently connected D01 devices: {len(devices)}")
                    for device_type, device_info in devices:
                        print(f"  [{device_type}] {device_info}")
                
                time.sleep(2)  # Check every 2 seconds
                
        except KeyboardInterrupt:
            print("\nStopping device monitor...")

if __name__ == "__main__":
    monitor = D01DeviceMonitor()
    monitor.monitor_devices()