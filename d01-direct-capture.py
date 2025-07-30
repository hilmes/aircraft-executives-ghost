#!/usr/bin/env python3
"""
D01 Direct Input Capture - Monitor system input events directly
"""

import subprocess
import time
import threading
import json
import os
import signal
import sys
from collections import defaultdict

class D01DirectCapture:
    def __init__(self):
        self.running = False
        self.events = []
        self.event_count = 0
        self.log_file = os.path.expanduser("~/d01_capture.log")
        
        # Clear previous log
        open(self.log_file, 'w').close()
        
    def monitor_key_events(self):
        """Monitor keyboard events using caffeinate to detect key presses"""
        print("🎯 Monitoring keyboard events...")
        print("Press buttons on your D01 ring - you should see events appear below:")
        print()
        
        try:
            # Use log stream to monitor keyboard events
            process = subprocess.Popen([
                'log', 'stream', '--predicate',
                'eventMessage CONTAINS "keyCode" OR '
                'eventMessage CONTAINS "keyDown" OR '
                'eventMessage CONTAINS "keyUp" OR '
                'subsystem == "com.apple.HIToolbox"',
                '--style', 'compact',
                '--color', 'none'
            ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            
            self.running = True
            
            while self.running:
                line = process.stdout.readline()
                if not line:
                    break
                    
                line = line.strip()
                if line and self.is_input_event(line):
                    self.process_input_event(line)
                    
        except Exception as e:
            print(f"Error monitoring events: {e}")
        finally:
            process.terminate()
    
    def monitor_volume_keys(self):
        """Monitor volume key events which the D01 might send"""
        print("🔊 Monitoring volume/media key events...")
        
        try:
            # Monitor for system-defined events (volume keys)
            process = subprocess.Popen([
                'log', 'stream', '--predicate',
                'eventMessage CONTAINS "volume" OR '
                'eventMessage CONTAINS "media" OR '
                'eventMessage CONTAINS "NX_KEYTYPE" OR '
                'subsystem == "com.apple.audio"',
                '--style', 'compact'
            ], stdout=subprocess.PIPE, text=True)
            
            while self.running:
                line = process.stdout.readline()
                if not line:
                    break
                    
                line = line.strip()
                if line:
                    self.process_media_event(line)
                    
        except Exception as e:
            print(f"Error monitoring media events: {e}")
        finally:
            process.terminate()
    
    def is_input_event(self, line):
        """Check if line contains input event"""
        input_keywords = [
            'keycode', 'keydown', 'keyup', 'key', 'input', 'event',
            'hitoolbox', 'keyboard', 'button'
        ]
        
        line_lower = line.lower()
        return any(keyword in line_lower for keyword in input_keywords)
    
    def process_input_event(self, line):
        """Process input event line"""
        self.event_count += 1
        timestamp = time.strftime('%H:%M:%S')
        
        print(f"[{timestamp}] 🎹 INPUT EVENT #{self.event_count}")
        print(f"  {line}")
        
        # Log to file
        event_data = {
            'timestamp': time.time(),
            'type': 'INPUT_EVENT',
            'raw_line': line,
            'event_number': self.event_count
        }
        
        self.log_event(event_data)
        print("-" * 60)
    
    def process_media_event(self, line):
        """Process media/volume event line"""
        self.event_count += 1
        timestamp = time.strftime('%H:%M:%S')
        
        print(f"[{timestamp}] 📻 MEDIA EVENT #{self.event_count}")
        print(f"  {line}")
        
        # Log to file
        event_data = {
            'timestamp': time.time(),
            'type': 'MEDIA_EVENT',
            'raw_line': line,
            'event_number': self.event_count
        }
        
        self.log_event(event_data)
        print("-" * 60)
    
    def log_event(self, event_data):
        """Log event to file"""
        try:
            with open(self.log_file, 'a') as f:
                f.write(json.dumps(event_data) + '\n')
        except Exception as e:
            print(f"Error logging event: {e}")
    
    def monitor_simple_test(self):
        """Simple test - just monitor for any system changes"""
        print("🧪 Simple monitoring test...")
        print("Press any key on keyboard OR D01 ring buttons")
        print("You should see immediate feedback for keyboard keys")
        print()
        
        try:
            # Monitor general system events
            process = subprocess.Popen([
                'log', 'stream', '--level', 'info',
                '--style', 'compact'
            ], stdout=subprocess.PIPE, text=True)
            
            self.running = True
            line_count = 0
            
            while self.running and line_count < 50:  # Limit output
                line = process.stdout.readline()
                if not line:
                    break
                    
                line = line.strip()
                if line and ('key' in line.lower() or 'input' in line.lower() or 'event' in line.lower()):
                    line_count += 1
                    timestamp = time.strftime('%H:%M:%S')
                    print(f"[{timestamp}] {line}")
                    
                    # Log significant events
                    if any(word in line.lower() for word in ['keycode', 'button', 'press']):
                        print("  ^^ This looks like a key/button event!")
                        
        except Exception as e:
            print(f"Error in simple test: {e}")
        finally:
            process.terminate()
    
    def start_capture(self, mode='simple'):
        """Start input capture"""
        print("🚀 D01 Direct Input Capture")
        print(f"Mode: {mode}")
        print(f"Log file: {self.log_file}")
        print()
        
        # Set up signal handler for clean exit
        def signal_handler(sig, frame):
            print("\n🛑 Stopping capture...")
            self.running = False
            self.show_summary()
            sys.exit(0)
        
        signal.signal(signal.SIGINT, signal_handler)
        
        if mode == 'simple':
            self.monitor_simple_test()
        elif mode == 'keyboard':
            self.monitor_key_events()
        elif mode == 'media':
            self.monitor_volume_keys()
        elif mode == 'all':
            # Run multiple monitors in threads
            threads = [
                threading.Thread(target=self.monitor_key_events),
                threading.Thread(target=self.monitor_volume_keys)
            ]
            
            for thread in threads:
                thread.daemon = True
                thread.start()
            
            # Keep main thread alive
            try:
                while self.running:
                    time.sleep(1)
            except KeyboardInterrupt:
                pass
        
        self.show_summary()
    
    def show_summary(self):
        """Show capture summary"""
        print("\n📊 CAPTURE SUMMARY")
        print("=" * 40)
        print(f"Total events captured: {self.event_count}")
        
        # Analyze log file
        if os.path.exists(self.log_file):
            try:
                with open(self.log_file, 'r') as f:
                    lines = f.readlines()
                    
                event_types = defaultdict(int)
                for line in lines:
                    try:
                        event = json.loads(line.strip())
                        event_types[event['type']] += 1
                    except:
                        continue
                
                if event_types:
                    print("Event breakdown:")
                    for event_type, count in event_types.items():
                        print(f"  {event_type}: {count}")
                else:
                    print("No structured events logged")
                    
                print(f"\nRaw log entries: {len(lines)}")
                print(f"Log file: {self.log_file}")
                
            except Exception as e:
                print(f"Error analyzing log: {e}")

def main():
    print("🔬 D01 Direct Input Capture")
    print("=" * 40)
    print()
    print("This will monitor system events to detect D01 ring input")
    print("Choose monitoring mode:")
    print("1. Simple test (recommended)")
    print("2. Keyboard events only")  
    print("3. Media/volume events only")
    print("4. All event types")
    print()
    
    # Default to simple test
    mode = 'simple'
    print(f"Using mode: {mode}")
    print()
    print("🎯 INSTRUCTIONS:")
    print("1. First, test with regular keyboard keys to verify it's working")
    print("2. Then try pressing buttons on your D01 ring")
    print("3. Look for any events that appear when you press D01 buttons")
    print("4. Press Ctrl+C to stop and see summary")
    print()
    
    capture = D01DirectCapture()
    capture.start_capture(mode)

if __name__ == "__main__":
    main()