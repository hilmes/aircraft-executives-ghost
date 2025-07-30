#!/usr/bin/env python3
"""
D01 Gesture Scanner - Look for iOS-style gestures and touch events
"""

import subprocess
import time
import threading

class D01GestureScanner:
    def __init__(self):
        self.running = False
        self.event_count = 0
        
    def monitor_touch_events(self):
        """Monitor for touch and gesture events"""
        print("🔍 Monitoring touch/gesture events...")
        
        try:
            process = subprocess.Popen([
                'log', 'stream', '--predicate',
                'eventMessage CONTAINS "touch" OR '
                'eventMessage CONTAINS "gesture" OR '
                'eventMessage CONTAINS "swipe" OR '
                'eventMessage CONTAINS "tap" OR '
                'eventMessage CONTAINS "pinch" OR '
                'eventMessage CONTAINS "rotate" OR '
                'eventMessage CONTAINS "zoom"',
                '--style', 'compact'
            ], stdout=subprocess.PIPE, text=True)
            
            while self.running:
                line = process.stdout.readline()
                if not line:
                    break
                    
                if line.strip():
                    self.log_event("TOUCH/GESTURE", line.strip())
                    
        except Exception as e:
            print(f"Touch monitoring error: {e}")
        finally:
            process.terminate()
    
    def monitor_multitouch_events(self):
        """Monitor multitouch framework events"""
        print("🔍 Monitoring multitouch events...")
        
        try:
            process = subprocess.Popen([
                'log', 'stream', '--predicate',
                'subsystem CONTAINS "multitouch" OR '
                'subsystem CONTAINS "MultitouchSupport" OR '
                'eventMessage CONTAINS "MTDevice" OR '
                'eventMessage CONTAINS "multitouch"',
                '--style', 'compact'
            ], stdout=subprocess.PIPE, text=True)
            
            while self.running:
                line = process.stdout.readline()
                if not line:
                    break
                    
                if line.strip():
                    self.log_event("MULTITOUCH", line.strip())
                    
        except Exception as e:
            print(f"Multitouch monitoring error: {e}")
        finally:
            process.terminate()
    
    def monitor_coremedia_events(self):
        """Monitor Core Media and AVFoundation events"""
        print("🔍 Monitoring Core Media events...")
        
        try:
            process = subprocess.Popen([
                'log', 'stream', '--predicate',
                'subsystem CONTAINS "coremedia" OR '
                'subsystem CONTAINS "avfoundation" OR '
                'eventMessage CONTAINS "AVCapture" OR '
                'eventMessage CONTAINS "camera" OR '
                'eventMessage CONTAINS "media"',
                '--style', 'compact'
            ], stdout=subprocess.PIPE, text=True)
            
            while self.running:
                line = process.stdout.readline()
                if not line:
                    break
                    
                if line.strip():
                    self.log_event("COREMEDIA", line.strip())
                    
        except Exception as e:
            print(f"Core Media monitoring error: {e}")
        finally:
            process.terminate()
    
    def monitor_accessibility_events(self):
        """Monitor accessibility and assistive technology events"""
        print("🔍 Monitoring accessibility events...")
        
        try:
            process = subprocess.Popen([
                'log', 'stream', '--predicate',
                'subsystem CONTAINS "accessibility" OR '
                'eventMessage CONTAINS "AX" OR '
                'eventMessage CONTAINS "VoiceOver" OR '
                'eventMessage CONTAINS "assistive" OR '
                'eventMessage CONTAINS "switch" OR '
                'eventMessage CONTAINS "control"',
                '--style', 'compact'
            ], stdout=subprocess.PIPE, text=True)
            
            while self.running:
                line = process.stdout.readline()
                if not line:
                    break
                    
                if line.strip():
                    self.log_event("ACCESSIBILITY", line.strip())
                    
        except Exception as e:
            print(f"Accessibility monitoring error: {e}")
        finally:
            process.terminate()
    
    def monitor_iokit_events(self):
        """Monitor IOKit events for device-specific protocols"""
        print("🔍 Monitoring IOKit events...")
        
        try:
            process = subprocess.Popen([
                'log', 'stream', '--predicate',
                'subsystem == "com.apple.iokit" AND ('
                'eventMessage CONTAINS "AppleMultitouch" OR '
                'eventMessage CONTAINS "AppleHID" OR '
                'eventMessage CONTAINS "device" OR '
                'eventMessage CONTAINS "report"'
                ')',
                '--style', 'compact'
            ], stdout=subprocess.PIPE, text=True)
            
            while self.running:
                line = process.stdout.readline()
                if not line:
                    break
                    
                if line.strip():
                    self.log_event("IOKIT", line.strip())
                    
        except Exception as e:
            print(f"IOKit monitoring error: {e}")
        finally:
            process.terminate()
    
    def monitor_system_events(self):
        """Monitor System Events for custom gestures"""
        print("🔍 Monitoring System Events...")
        
        try:
            process = subprocess.Popen([
                'log', 'stream', '--predicate',
                'process == "System Events" OR '
                'eventMessage CONTAINS "SystemEvents" OR '
                'eventMessage CONTAINS "AppleScript" OR '
                'eventMessage CONTAINS "automation"',
                '--style', 'compact'
            ], stdout=subprocess.PIPE, text=True)
            
            while self.running:
                line = process.stdout.readline()
                if not line:
                    break
                    
                if line.strip():
                    self.log_event("SYSTEM_EVENTS", line.strip())
                    
        except Exception as e:
            print(f"System Events monitoring error: {e}")
        finally:
            process.terminate()
    
    def log_event(self, category, line):
        """Log an event with filtering for D01-related content"""
        # Check if this might be D01-related
        d01_indicators = [
            'd01', '05ac', '022c', '58:5e:42', 'pro',
            'ring', 'button', 'gesture', 'touch'
        ]
        
        line_lower = line.lower()
        is_d01_related = any(indicator in line_lower for indicator in d01_indicators)
        
        if is_d01_related:
            self.event_count += 1
            timestamp = time.strftime('%H:%M:%S')
            
            print(f"[{timestamp}] {category} #{self.event_count}")
            print(f"  {line}")
            
            # Highlight specific patterns
            if 'touch' in line_lower:
                print(f"  🔴 TOUCH EVENT DETECTED!")
            if 'gesture' in line_lower:
                print(f"  👆 GESTURE EVENT DETECTED!")
            if 'button' in line_lower:
                print(f"  🔘 BUTTON EVENT DETECTED!")
            if any(term in line_lower for term in ['swipe', 'tap', 'pinch']):
                print(f"  ✋ iOS-STYLE GESTURE DETECTED!")
                
            print("-" * 80)
    
    def start_gesture_scan(self):
        """Start comprehensive gesture monitoring"""
        print("🎯 D01 Gesture & Touch Scanner")
        print("=" * 60)
        print("Looking for iOS-style gestures and touch events...")
        print("Press/swipe/gesture on your D01 ring!")
        print("Press Ctrl+C to stop\n")
        
        self.running = True
        
        # Start all monitoring methods
        methods = [
            self.monitor_touch_events,
            self.monitor_multitouch_events,
            self.monitor_coremedia_events,
            self.monitor_accessibility_events,
            self.monitor_iokit_events,
            self.monitor_system_events
        ]
        
        threads = []
        for method in methods:
            thread = threading.Thread(target=method)
            thread.daemon = True
            threads.append(thread)
            thread.start()
        
        try:
            while self.running:
                time.sleep(1)
        except KeyboardInterrupt:
            print(f"\n🛑 Stopping gesture scanner... Found {self.event_count} relevant events")
            self.running = False
            time.sleep(1)

def main():
    scanner = D01GestureScanner()
    
    print("This scanner looks for iOS-style gestures that the D01 ring might be sending:")
    print("- Touch events")
    print("- Multitouch framework events") 
    print("- Gesture recognition")
    print("- Accessibility events")
    print("- Custom device protocols")
    print()
    
    scanner.start_gesture_scan()

if __name__ == "__main__":
    main()