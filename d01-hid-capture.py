#!/usr/bin/env python3
"""
D01 HID Event Capture - Direct HID input event monitoring
"""

import subprocess
import time
import threading
import json
import os
from collections import defaultdict

class D01HIDCapture:
    def __init__(self):
        self.device_address = "58:5E:42:B3:2C:66"
        self.running = False
        self.hid_events = []
        self.button_patterns = defaultdict(int)
        
    def monitor_hid_events(self):
        """Monitor HID-specific events using system log"""
        print("🎯 Monitoring HID input events...")
        print("Press buttons on the D01 ring now!")
        print("Press Ctrl+C to stop and analyze\n")
        
        try:
            # Focus on HID input events specifically
            process = subprocess.Popen([
                'log', 'stream', '--predicate',
                'subsystem CONTAINS "hid" OR '
                'category CONTAINS "HID" OR '
                'eventMessage CONTAINS "key" OR '
                'eventMessage CONTAINS "input" OR '
                'eventMessage CONTAINS "report"',
                '--style', 'compact'
            ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            
            self.running = True
            event_count = 0
            
            for line in process.stdout:
                if not self.running:
                    break
                    
                line = line.strip()
                if line and self.is_hid_input_event(line):
                    event_count += 1
                    timestamp = time.strftime('%H:%M:%S')
                    
                    print(f"[{timestamp}] HID Event #{event_count}")
                    print(f"  {line}")
                    
                    # Store event
                    event_data = {
                        'timestamp': time.time(),
                        'raw_line': line,
                        'event_number': event_count
                    }
                    self.hid_events.append(event_data)
                    
                    # Extract key information
                    if 'key' in line.lower():
                        print(f"  🔑 KEY EVENT DETECTED")
                    if 'report' in line.lower():
                        print(f"  📊 HID REPORT DETECTED")
                    if 'input' in line.lower():
                        print(f"  📥 INPUT EVENT DETECTED")
                        
                    print("-" * 60)
                    
        except KeyboardInterrupt:
            print(f"\n🛑 Stopping HID capture... Captured {len(self.hid_events)} events")
            self.running = False
            process.terminate()
            
        except Exception as e:
            print(f"Error monitoring HID events: {e}")
            self.running = False
    
    def is_hid_input_event(self, line):
        """Check if line contains HID input event"""
        hid_keywords = [
            'hid', 'keyboard', 'input', 'key', 'button', 
            'report', 'press', 'release', 'event'
        ]
        
        # Ignore noise from Bluetooth daemon
        noise_keywords = [
            'desense', 'coex', 'wlan', 'wifi', 'usb', 'core0', 'core1',
            'minimum nf value', 'connected usbs'
        ]
        
        line_lower = line.lower()
        
        # Must contain HID keywords and not be noise
        has_hid_keyword = any(keyword in line_lower for keyword in hid_keywords)
        is_noise = any(keyword in line_lower for keyword in noise_keywords)
        
        return has_hid_keyword and not is_noise
    
    def monitor_with_hammerspoon(self):
        """Use Hammerspoon to monitor events"""
        print("🔨 Starting Hammerspoon-based HID monitoring...")
        
        # Create temporary Hammerspoon script
        hammerspoon_script = '''
        local function logEvent(event)
            local eventType = event:getType()
            local timestamp = os.date("%H:%M:%S")
            
            if eventType == hs.eventtap.event.types.keyDown then
                local keyCode = event:getKeyCode()
                print(string.format("[%s] KEY DOWN: %d", timestamp, keyCode))
            elseif eventType == hs.eventtap.event.types.keyUp then
                local keyCode = event:getKeyCode()
                print(string.format("[%s] KEY UP: %d", timestamp, keyCode))
            elseif eventType == hs.eventtap.event.types.systemDefined then
                local systemKey = event:systemKey()
                if systemKey then
                    print(string.format("[%s] SYSTEM KEY: %d (%s)", 
                          timestamp, systemKey.key, systemKey.down and "DOWN" or "UP"))
                end
            end
            
            return false  -- Don't consume the event
        end
        
        local eventTap = hs.eventtap.new({
            hs.eventtap.event.types.keyDown,
            hs.eventtap.event.types.keyUp,
            hs.eventtap.event.types.systemDefined
        }, logEvent)
        
        eventTap:start()
        print("Hammerspoon event monitoring started. Press buttons on D01 ring.")
        '''
        
        # Write to temporary file
        script_path = "/tmp/d01_monitor.lua"
        with open(script_path, 'w') as f:
            f.write(hammerspoon_script)
        
        try:
            # Execute via Hammerspoon
            result = subprocess.run([
                'hs', '-c', f'dofile("{script_path}")'
            ], capture_output=True, text=True, timeout=30)
            
            print("Hammerspoon output:")
            print(result.stdout)
            if result.stderr:
                print("Errors:")
                print(result.stderr)
                
        except subprocess.TimeoutExpired:
            print("Hammerspoon monitoring timed out")
        except FileNotFoundError:
            print("Hammerspoon CLI not found. Install with: brew install hammerspoon")
        finally:
            # Clean up
            if os.path.exists(script_path):
                os.remove(script_path)
    
    def monitor_input_method(self):
        """Monitor using Input Method framework"""
        print("⌨️  Monitoring using Input Method events...")
        
        try:
            # Monitor for input method events
            process = subprocess.Popen([
                'log', 'stream', '--predicate',
                'subsystem CONTAINS "inputmethod" OR '
                'subsystem CONTAINS "TextInput" OR '
                'process == "TextInputMenuAgent"',
                '--style', 'compact'
            ], stdout=subprocess.PIPE, text=True)
            
            self.running = True
            
            for line in process.stdout:
                if not self.running:
                    break
                    
                if line.strip():
                    timestamp = time.strftime('%H:%M:%S')
                    print(f"[{timestamp}] {line.strip()}")
                    
        except KeyboardInterrupt:
            print("\n🛑 Stopping Input Method monitoring...")
            self.running = False
            process.terminate()
    
    def direct_key_monitoring(self):
        """Direct key event monitoring using multiple approaches"""
        print("🔍 Starting direct key event monitoring...")
        print("This will try multiple methods simultaneously")
        print("Press buttons on the D01 ring and watch for events\n")
        
        # Start multiple monitoring threads
        threads = []
        
        # Method 1: HID events
        thread1 = threading.Thread(target=self.monitor_hid_events)
        thread1.daemon = True
        threads.append(thread1)
        
        # Method 2: Input Method events  
        thread2 = threading.Thread(target=self.monitor_input_method)
        thread2.daemon = True
        threads.append(thread2)
        
        # Start all threads
        for thread in threads:
            thread.start()
        
        try:
            # Keep main thread alive
            while self.running:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n🛑 Stopping all monitoring threads...")
            self.running = False
        
        # Wait for threads to finish
        for thread in threads:
            thread.join(timeout=1)
    
    def analyze_captured_events(self):
        """Analyze captured HID events"""
        if not self.hid_events:
            print("No HID events captured")
            return
            
        print(f"\n📊 Analysis of {len(self.hid_events)} captured events:")
        
        # Group events by type
        event_types = defaultdict(int)
        for event in self.hid_events:
            line = event['raw_line'].lower()
            if 'key' in line:
                event_types['key_events'] += 1
            if 'report' in line:
                event_types['hid_reports'] += 1
            if 'input' in line:
                event_types['input_events'] += 1
        
        for event_type, count in event_types.items():
            print(f"  {event_type}: {count}")
        
        # Show timeline
        print(f"\nEvent timeline:")
        for i, event in enumerate(self.hid_events[-10:]):  # Show last 10 events
            timestamp = time.strftime('%H:%M:%S', time.localtime(event['timestamp']))
            print(f"  [{timestamp}] Event #{event['event_number']}")
    
    def start_capture(self, method='hid'):
        """Start HID event capture"""
        print("🚀 D01 HID Event Capture Starting...")
        print(f"Method: {method}")
        print("Make sure to press buttons on your D01 ring!\n")
        
        try:
            if method == 'hid':
                self.monitor_hid_events()
            elif method == 'hammerspoon':
                self.monitor_with_hammerspoon()
            elif method == 'input':
                self.monitor_input_method()
            elif method == 'all':
                self.direct_key_monitoring()
                
        finally:
            self.analyze_captured_events()

def main():
    print("🔬 D01 HID Event Capture")
    print("=" * 40)
    
    capture = D01HIDCapture()
    
    print("Available methods:")
    print("1. HID event monitoring (default)")
    print("2. Hammerspoon event tap")
    print("3. Input Method monitoring")
    print("4. All methods")
    
    # Default to HID monitoring
    method = 'hid'
    
    print(f"\nUsing method: {method}")
    print("Press buttons on your D01 ring to capture events!")
    
    capture.start_capture(method)

if __name__ == "__main__":
    main()