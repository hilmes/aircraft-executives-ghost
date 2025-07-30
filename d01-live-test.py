#!/usr/bin/env python3
"""
D01 Live Test - Direct connection to capture button presses
"""

import hid
import time

def test_d01_connection():
    """Test direct connection to D01 ring"""
    print("🎯 D01 Live Connection Test")
    print("=" * 40)
    
    try:
        # Connect to D01 ring
        device = hid.device()
        device.open(0x05AC, 0x022C)  # D01 Pro
        
        print("✅ Connected to D01 Pro!")
        print(f"Product: {device.get_product_string()}")
        print(f"Manufacturer: {device.get_manufacturer_string()}")
        print()
        
        print("🎯 Ready to capture button presses!")
        print("Press buttons on your D01 ring now...")
        print("Press Ctrl+C to stop")
        print()
        
        packet_count = 0
        last_data = None
        
        while True:
            # Read with timeout
            data = device.read(64, timeout_ms=100)
            
            if data and data != last_data:
                packet_count += 1
                timestamp = time.strftime('%H:%M:%S')
                
                print(f"[{timestamp}] 📡 Packet #{packet_count}")
                print(f"  Raw bytes: {' '.join(f'{b:02X}' for b in data)}")
                
                # Show non-zero bytes (likely button data)
                non_zero = [(i, b) for i, b in enumerate(data) if b != 0]
                if non_zero:
                    print(f"  🔴 Active bytes: {non_zero}")
                    
                    # Try to identify button patterns
                    if len(non_zero) == 1:
                        pos, val = non_zero[0]
                        print(f"  🎯 Single button: Position {pos}, Value 0x{val:02X}")
                        
                        # Common button values
                        if val == 0x01:
                            print(f"     Likely: Bottom button")
                        elif val == 0x02:
                            print(f"     Likely: Top button")
                        elif val == 0x04:
                            print(f"     Likely: Middle button")
                        elif val == 0x08:
                            print(f"     Likely: Side button")
                
                else:
                    print(f"  ⚪ All zeros (button release)")
                
                print("-" * 50)
                last_data = data[:]
                
    except KeyboardInterrupt:
        print(f"\n🛑 Stopping test... Captured {packet_count} packets")
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        
        if "access denied" in str(e).lower():
            print("\n💡 Solution: Grant Input Monitoring permissions")
            print("   System Settings > Privacy & Security > Input Monitoring")
            print("   Add Terminal or your terminal app")
        elif "busy" in str(e).lower():
            print("\n💡 Device might be in use by another application")
            print("   Try closing other apps that might access the D01")
        
    finally:
        try:
            device.close()
        except:
            pass

if __name__ == "__main__":
    test_d01_connection()