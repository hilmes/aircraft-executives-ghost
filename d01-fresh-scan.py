#!/usr/bin/env python3
"""
D01 Fresh Scanner - Try multiple detection methods
"""

import subprocess
import time
import threading

class D01FreshScanner:
    def __init__(self):
        self.running = False
        self.event_count = 0
        
    def method1_bluetooth_hid(self):
        """Method 1: Monitor Bluetooth HID subsystem"""
        print("🔍 Method 1: Bluetooth HID monitoring...")
        
        try:
            process = subprocess.Popen([
                'log', 'stream', '--predicate',
                'subsystem == "com.apple.bluetooth" AND category == "HID"',
                '--style', 'compact'
            ], stdout=subprocess.PIPE, text=True)
            
            while self.running:
                line = process.stdout.readline()
                if not line:
                    break
                    
                if line.strip():
                    self.log_event("BT-HID", line.strip())
                    
        except Exception as e:
            print(f"Method 1 error: {e}")
        finally:
            process.terminate()
    
    def method2_window_server(self):
        """Method 2: Monitor WindowServer events"""
        print("🔍 Method 2: WindowServer event monitoring...")
        
        try:
            process = subprocess.Popen([
                'log', 'stream', '--predicate',
                'process == "WindowServer" AND ('
                'eventMessage CONTAINS "button" OR '
                'eventMessage CONTAINS "key" OR '
                'eventMessage CONTAINS "input"'
                ')',
                '--style', 'compact'
            ], stdout=subprocess.PIPE, text=True)
            
            while self.running:
                line = process.stdout.readline()
                if not line:
                    break
                    
                if line.strip():
                    self.log_event("WindowServer", line.strip())
                    
        except Exception as e:
            print(f"Method 2 error: {e}")
        finally:
            process.terminate()
    
    def method3_hid_system(self):
        """Method 3: Monitor HID system events"""
        print("🔍 Method 3: HID system monitoring...")
        
        try:
            process = subprocess.Popen([
                'log', 'stream', '--predicate',
                'subsystem == "com.apple.iokit" AND ('
                'eventMessage CONTAINS "HID" OR '
                'eventMessage CONTAINS "input"'
                ')',
                '--style', 'compact'
            ], stdout=subprocess.PIPE, text=True)
            
            while self.running:
                line = process.stdout.readline()
                if not line:
                    break
                    
                if line.strip():
                    self.log_event("HID-System", line.strip())
                    
        except Exception as e:
            print(f"Method 3 error: {e}")
        finally:
            process.terminate()
    
    def method4_keyboard_events(self):
        """Method 4: Monitor keyboard/input events"""
        print("🔍 Method 4: Keyboard event monitoring...")
        
        try:
            process = subprocess.Popen([
                'log', 'stream', '--predicate',
                'eventMessage CONTAINS "keyCode" OR '
                'eventMessage CONTAINS "keyDown" OR '
                'eventMessage CONTAINS "keyUp" OR '
                'eventMessage CONTAINS "systemDefined"',
                '--style', 'compact'
            ], stdout=subprocess.PIPE, text=True)
            
            while self.running:
                line = process.stdout.readline()
                if not line:
                    break
                    
                if line.strip():
                    self.log_event("Keyboard", line.strip())
                    
        except Exception as e:
            print(f"Method 4 error: {e}")
        finally:
            process.terminate()
    
    def log_event(self, method, line):
        """Log an event with timestamp"""
        self.event_count += 1
        timestamp = time.strftime('%H:%M:%S')
        
        print(f"[{timestamp}] {method} #{self.event_count}")
        print(f"  {line}")
        
        # Check for D01-related content
        if any(term in line.lower() for term in ['d01', '05ac', '022c', '58:5e:42']):
            print(f"  ⭐ POSSIBLE D01 ACTIVITY!")
        
        print("-" * 80)
    
    def start_comprehensive_scan(self):
        """Start all monitoring methods simultaneously"""
        print("🚀 D01 Comprehensive Scanner")
        print("=" * 60)
        print("Starting multiple monitoring methods...")
        print("Press buttons on your D01 ring - we'll catch it!")
        print("Press Ctrl+C to stop\n")
        
        self.running = True
        
        # Start all methods in separate threads
        methods = [
            self.method1_bluetooth_hid,
            self.method2_window_server,
            self.method3_hid_system,
            self.method4_keyboard_events
        ]
        
        threads = []
        for method in methods:
            thread = threading.Thread(target=method)
            thread.daemon = True
            threads.append(thread)
            thread.start()
        
        try:
            # Keep main thread alive
            while self.running:
                time.sleep(1)
        except KeyboardInterrupt:
            print(f"\n🛑 Stopping all scanners... Total events: {self.event_count}")
            self.running = False
            
            # Wait a bit for threads to finish
            time.sleep(1)

def main():
    scanner = D01FreshScanner()
    
    print("This will try 4 different methods to detect your D01 ring:")
    print("1. Bluetooth HID monitoring")
    print("2. WindowServer event monitoring") 
    print("3. HID system monitoring")
    print("4. Keyboard event monitoring")
    print()
    print("If ANY of these detect button presses, we'll see them!")
    print()
    
    scanner.start_comprehensive_scan()

if __name__ == "__main__":
    main()