#!/usr/bin/env python3
"""
D01 Direct Access - Try to access the device directly via hidapi
"""

import hid
import time

def scan_hid_devices():
    """Scan for all HID devices and look for D01"""
    print("🔍 Scanning HID devices...")
    devices = hid.enumerate()
    
    d01_devices = []
    print(f"Found {len(devices)} HID devices total")
    print()
    
    for device in devices:
        vendor_id = device.get('vendor_id', 0)
        product_id = device.get('product_id', 0)
        
        # Look for D01 (vendor: 0x05AC, product: 0x022C)
        if vendor_id == 0x05AC and product_id == 0x022C:
            d01_devices.append(device)
            print("🎯 FOUND D01 DEVICE!")
            print(f"  Vendor ID: 0x{vendor_id:04X}")
            print(f"  Product ID: 0x{product_id:04X}")
            print(f"  Product: {device.get('product_string', 'Unknown')}")
            print(f"  Manufacturer: {device.get('manufacturer_string', 'Unknown')}")
            print(f"  Path: {device.get('path', 'Unknown')}")
            print()
    
    # Also show Apple devices (might be D01 with different product ID)
    apple_devices = [d for d in devices if d.get('vendor_id') == 0x05AC]
    print(f"Found {len(apple_devices)} Apple HID devices:")
    
    for device in apple_devices:
        vendor_id = device.get('vendor_id', 0)
        product_id = device.get('product_id', 0)
        product_name = device.get('product_string', 'Unknown')
        
        print(f"  0x{vendor_id:04X}:0x{product_id:04X} - {product_name}")
        
        # Check if this could be our D01
        if any(term in product_name.lower() for term in ['d01', 'ring', 'keyboard']):
            print(f"    ⭐ This might be the D01!")
            d01_devices.append(device)
    
    return d01_devices

def test_device_access(device_info):
    """Try to access a device and read input"""
    vendor_id = device_info.get('vendor_id')
    product_id = device_info.get('product_id')
    
    print(f"\n🔌 Attempting to connect to device 0x{vendor_id:04X}:0x{product_id:04X}")
    
    try:
        device = hid.device()
        device.open(vendor_id, product_id)
        
        print("✅ Successfully connected!")
        print(f"Product: {device.get_product_string()}")
        print(f"Manufacturer: {device.get_manufacturer_string()}")
        print()
        
        print("📡 Monitoring for input (press buttons on D01 ring)...")
        print("Press Ctrl+C to stop")
        
        packet_count = 0
        
        while True:
            # Try to read with short timeout
            data = device.read(64, timeout_ms=500)
            
            if data:
                packet_count += 1
                timestamp = time.strftime('%H:%M:%S')
                
                print(f"[{timestamp}] Packet #{packet_count}")
                print(f"  Length: {len(data)} bytes")
                print(f"  Raw: {' '.join(f'{b:02X}' for b in data)}")
                print(f"  ASCII: {''.join(chr(b) if 32 <= b <= 126 else '.' for b in data)}")
                
                # Check for non-zero data (likely button press)
                non_zero = [b for b in data if b != 0]
                if non_zero:
                    print(f"  🔴 NON-ZERO DATA: {' '.join(f'{b:02X}' for b in non_zero)}")
                    print(f"  📊 This looks like input activity!")
                
                print("-" * 60)
            
    except Exception as e:
        print(f"❌ Failed to connect: {e}")
        
        if "access denied" in str(e).lower():
            print("💡 Try running with sudo or grant Input Monitoring permissions")
        elif "device not found" in str(e).lower():
            print("💡 Device might not be connected or accessible")
            
    finally:
        try:
            device.close()
        except:
            pass

def main():
    print("🔬 D01 Direct HID Access")
    print("=" * 50)
    print("This will try to access the D01 ring directly via HID")
    print()
    
    # First scan for devices
    d01_devices = scan_hid_devices()
    
    if not d01_devices:
        print("❌ No D01 devices found!")
        print()
        print("Possible reasons:")
        print("- Device not connected")
        print("- Device using non-standard HID protocol")
        print("- macOS blocking access to the device")
        print("- Device has different vendor/product ID than expected")
        return
    
    print(f"Found {len(d01_devices)} potential D01 device(s)")
    print()
    
    # Try to access each device
    for i, device in enumerate(d01_devices):
        print(f"Testing device {i+1}/{len(d01_devices)}...")
        test_device_access(device)
        
        if i < len(d01_devices) - 1:
            print("\n" + "="*60)

if __name__ == "__main__":
    main()