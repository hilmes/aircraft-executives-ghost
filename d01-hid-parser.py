#!/usr/bin/env python3
"""
D01 HID Report Parser - Parse the specific HID reports we detected
"""

import subprocess
import time
import json
import re
from collections import defaultdict

class D01HIDParser:
    def __init__(self):
        self.running = False
        self.hid_reports = []
        self.button_events = []
        self.report_count = 0
        
    def parse_hid_capture(self):
        """Parse HID reports specifically"""
        print("🎯 D01 HID Report Parser")
        print("Press buttons on your D01 ring to see parsed HID data")
        print("Press Ctrl+C to stop and analyze patterns\n")
        
        try:
            # Focus on Bluetooth HID reports
            process = subprocess.Popen([
                'log', 'stream', '--predicate',
                'eventMessage CONTAINS "Received input report indication" OR '
                'eventMessage CONTAINS "buttonState changed" OR '
                'eventMessage CONTAINS "Process button state"',
                '--style', 'compact'
            ], stdout=subprocess.PIPE, text=True)
            
            self.running = True
            
            while self.running:
                line = process.stdout.readline()
                if not line:
                    break
                    
                line = line.strip()
                if line:
                    self.process_hid_line(line)
                    
        except KeyboardInterrupt:
            print(f"\n🛑 Stopping HID parser... Captured {self.report_count} reports")
            self.running = False
            process.terminate()
            self.analyze_patterns()
        except Exception as e:
            print(f"Error: {e}")
    
    def process_hid_line(self, line):
        """Process individual HID report line"""
        timestamp = time.strftime('%H:%M:%S')
        
        # Parse HID input reports
        if "Received input report indication" in line:
            self.report_count += 1
            
            # Extract handle and length
            handle_match = re.search(r'handle=(\d+)', line)
            length_match = re.search(r'length=(\d+)', line)
            
            handle = handle_match.group(1) if handle_match else "unknown"
            length = length_match.group(1) if length_match else "unknown"
            
            print(f"[{timestamp}] 📊 HID REPORT #{self.report_count}")
            print(f"  Handle: {handle}, Length: {length} bytes")
            
            # Store report data
            report_data = {
                'timestamp': time.time(),
                'handle': handle,
                'length': int(length) if length.isdigit() else 0,
                'raw_line': line
            }
            self.hid_reports.append(report_data)
            
            # Different lengths might indicate different types of input
            if length == "30":
                print(f"  📱 Type: Mouse/Trackpad data (30 bytes)")
            elif length == "22":
                print(f"  📱 Type: Extended input data (22 bytes)")
            elif length == "8":
                print(f"  📱 Type: Keyboard data (8 bytes)")
            else:
                print(f"  📱 Type: Unknown ({length} bytes)")
                
        # Parse button state changes
        elif "buttonState changed" in line:
            print(f"[{timestamp}] 🔴 BUTTON STATE CHANGE")
            print(f"  {line}")
            
            # Extract old and new states
            state_match = re.search(r'buttonState changed \((\d+)->(\d+)\)', line)
            if state_match:
                old_state = state_match.group(1)
                new_state = state_match.group(2)
                print(f"  Button: {old_state} → {new_state}")
                
                # Determine if press or release
                if old_state == "0" and new_state == "1":
                    print(f"  🔴 BUTTON PRESSED")
                elif old_state == "1" and new_state == "0":
                    print(f"  🔵 BUTTON RELEASED")
                
                button_event = {
                    'timestamp': time.time(),
                    'old_state': old_state,
                    'new_state': new_state,
                    'action': 'press' if new_state == "1" else 'release'
                }
                self.button_events.append(button_event)
                
        # Parse button processing
        elif "Process button state" in line:
            print(f"[{timestamp}] ⚙️  BUTTON PROCESSING")
            print(f"  {line}")
            
        print("-" * 60)
    
    def analyze_patterns(self):
        """Analyze captured HID patterns"""
        print("\n" + "="*80)
        print("📊 HID ANALYSIS RESULTS")
        print("="*80)
        
        print(f"Total HID reports: {len(self.hid_reports)}")
        print(f"Button events: {len(self.button_events)}")
        
        if self.hid_reports:
            # Analyze report lengths
            length_counts = defaultdict(int)
            handle_counts = defaultdict(int)
            
            for report in self.hid_reports:
                length_counts[report['length']] += 1
                handle_counts[report['handle']] += 1
            
            print(f"\n📏 Report length distribution:")
            for length, count in sorted(length_counts.items()):
                print(f"  {length} bytes: {count} reports")
                
            print(f"\n🔗 Handle distribution:")
            for handle, count in sorted(handle_counts.items()):
                print(f"  Handle {handle}: {count} reports")
        
        if self.button_events:
            print(f"\n🔴 Button event analysis:")
            press_count = sum(1 for e in self.button_events if e['action'] == 'press')
            release_count = sum(1 for e in self.button_events if e['action'] == 'release')
            
            print(f"  Presses: {press_count}")
            print(f"  Releases: {release_count}")
            
            # Show recent button events
            print(f"\n📋 Recent button events:")
            for event in self.button_events[-5:]:
                ts = time.strftime('%H:%M:%S', time.localtime(event['timestamp']))
                print(f"  [{ts}] {event['action'].upper()}: {event['old_state']}→{event['new_state']}")
        
        # Pattern recognition
        self.identify_button_patterns()
    
    def identify_button_patterns(self):
        """Try to identify which physical buttons correspond to which patterns"""
        print(f"\n🎯 BUTTON PATTERN IDENTIFICATION:")
        print("Based on the captured data, here's what we can determine:")
        
        if len(self.button_events) > 0:
            print("✅ The D01 ring is sending button events to macOS")
            print("✅ Button presses are being detected as state changes")
            
            # Analyze timing patterns
            if len(self.button_events) >= 2:
                press_times = []
                for i in range(1, len(self.button_events)):
                    if (self.button_events[i-1]['action'] == 'press' and 
                        self.button_events[i]['action'] == 'release'):
                        duration = self.button_events[i]['timestamp'] - self.button_events[i-1]['timestamp']
                        press_times.append(duration)
                
                if press_times:
                    avg_press_time = sum(press_times) / len(press_times)
                    print(f"✅ Average button press duration: {avg_press_time:.3f} seconds")
                    
                    # Categorize presses
                    short_presses = [t for t in press_times if t < 0.5]
                    long_presses = [t for t in press_times if t >= 0.5]
                    
                    print(f"📊 Short presses (< 0.5s): {len(short_presses)}")
                    print(f"📊 Long presses (≥ 0.5s): {len(long_presses)}")
        else:
            print("❌ No button events captured")
            print("💡 Try pressing different buttons on the D01 ring")
        
        print(f"\n🚀 NEXT STEPS:")
        print("1. The HID reports show the ring is communicating")
        print("2. Button state changes are being detected")
        print("3. We can now map these to specific actions")
        print("4. Try pressing different buttons to see various patterns")

def main():
    parser = D01HIDParser()
    parser.parse_hid_capture()

if __name__ == "__main__":
    main()