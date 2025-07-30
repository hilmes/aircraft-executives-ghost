#!/usr/bin/env python3
"""
D01 Integrated System - Complete button remapping with HID capture
Combines HID signal capture with button remapping functionality
"""

import subprocess
import time
import json
import re
import threading
import os
from collections import defaultdict

class D01IntegratedSystem:
    def __init__(self):
        self.running = False
        self.config_file = os.path.expanduser("~/.d01-config.json")
        self.config = self.load_config()
        self.hid_reports = []
        self.button_events = []
        self.active_remapping = True
        
        # Button state tracking
        self.button_states = {}
        self.press_times = {}
        self.long_press_threshold = self.config.get('settings', {}).get('long_press_threshold', 800) / 1000
        
    def load_config(self):
        """Load button mapping configuration"""
        default_config = {
            'buttons': {
                'bottom_short': {'action': 'Start Recording', 'category': 'WisprFlow Actions'},
                'bottom_long': {'action': 'WisprFlow Control (Up Chevron)', 'category': 'WisprFlow Actions'},
                'top': {'action': 'Stop Recording', 'category': 'WisprFlow Actions'},
                'middle': {'action': 'Termius Next Tab', 'category': 'Application Control'},
            },
            'settings': {
                'long_press_threshold': 800,
                'enable_visual_feedback': True,
                'enable_capture_mode': False
            }
        }
        
        try:
            if os.path.exists(self.config_file):
                with open(self.config_file, 'r') as f:
                    loaded_config = json.load(f)
                    # Merge with defaults
                    for key, value in default_config.items():
                        if key not in loaded_config:
                            loaded_config[key] = value
                    return loaded_config
        except Exception as e:
            print(f"Error loading config: {e}")
            
        return default_config
    
    def start_integrated_system(self):
        """Start the complete D01 system"""
        print("🚀 D01 Integrated Ring System")
        print("=" * 50)
        print()
        
        # Check mode
        capture_mode = self.config.get('settings', {}).get('enable_capture_mode', False)
        
        if capture_mode:
            print("🔬 CAPTURE MODE - Analyzing button patterns")
            self.start_capture_mode()
        else:
            print("⚡ REMAPPING MODE - Active button remapping")
            self.start_remapping_mode()
    
    def start_capture_mode(self):
        """Capture and analyze HID patterns"""
        print("📊 Starting HID capture analysis...")
        print("Press different buttons on your D01 ring")
        print("The system will learn the button patterns")
        print("Press Ctrl+C to stop and see analysis\n")
        
        try:
            # Monitor for HID reports and button events
            process = subprocess.Popen([
                'log', 'stream', '--predicate',
                'eventMessage CONTAINS "Received input report indication" OR '
                'eventMessage CONTAINS "buttonState changed" OR '
                'eventMessage CONTAINS "Process button state"',
                '--style', 'compact'
            ], stdout=subprocess.PIPE, text=True)
            
            self.running = True
            report_count = 0
            
            while self.running:
                line = process.stdout.readline()
                if not line:
                    break
                    
                line = line.strip()
                if line:
                    result = self.analyze_hid_line(line)
                    if result:
                        report_count += 1
                        print(f"Event #{report_count}: {result}")
                        
        except KeyboardInterrupt:
            print(f"\n🛑 Capture complete! Analyzed {len(self.button_events)} button events")
            self.running = False
            process.terminate()
            self.show_capture_analysis()
    
    def start_remapping_mode(self):
        """Start active button remapping"""
        print("🎯 Button remapping active!")
        print("Current mappings:")
        for button, config in self.config['buttons'].items():
            print(f"  {button}: {config['action']}")
        print()
        
        # Start HID monitoring in background for remapping
        hid_thread = threading.Thread(target=self.monitor_for_remapping)
        hid_thread.daemon = True
        hid_thread.start()
        
        try:
            while self.running:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n🛑 Stopping D01 remapping system...")
            self.running = False
    
    def monitor_for_remapping(self):
        """Monitor HID events for active remapping"""
        try:
            process = subprocess.Popen([
                'log', 'stream', '--predicate',
                'eventMessage CONTAINS "buttonState changed"',
                '--style', 'compact'
            ], stdout=subprocess.PIPE, text=True)
            
            self.running = True
            
            while self.running:
                line = process.stdout.readline()
                if not line:
                    break
                    
                if "buttonState changed" in line:
                    self.handle_button_event(line)
                    
        except Exception as e:
            print(f"Error in remapping monitor: {e}")
        finally:
            process.terminate()
    
    def analyze_hid_line(self, line):
        """Analyze HID line and return structured data"""
        timestamp = time.time()
        
        if "Received input report indication" in line:
            # Parse HID report
            handle_match = re.search(r'handle=(\d+)', line)
            length_match = re.search(r'length=(\d+)', line)
            
            if handle_match and length_match:
                handle = handle_match.group(1)
                length = int(length_match.group(1))
                
                report_data = {
                    'type': 'hid_report',
                    'timestamp': timestamp,
                    'handle': handle,
                    'length': length
                }
                
                self.hid_reports.append(report_data)
                return f"HID Report - Handle: {handle}, Length: {length} bytes"
                
        elif "buttonState changed" in line:
            # Parse button state change
            state_match = re.search(r'buttonState changed \((\d+)->(\d+)\)', line)
            if state_match:
                old_state = int(state_match.group(1))
                new_state = int(state_match.group(2))
                
                button_event = {
                    'type': 'button_event',
                    'timestamp': timestamp,
                    'old_state': old_state,
                    'new_state': new_state,
                    'action': 'press' if new_state > old_state else 'release'
                }
                
                self.button_events.append(button_event)
                
                action = "PRESS" if new_state > old_state else "RELEASE"
                return f"Button {action} - State: {old_state}→{new_state}"
        
        return None
    
    def handle_button_event(self, line):
        """Handle button event for remapping"""
        state_match = re.search(r'buttonState changed \((\d+)->(\d+)\)', line)
        if not state_match:
            return
            
        old_state = int(state_match.group(1))
        new_state = int(state_match.group(2))
        current_time = time.time()
        
        if new_state > old_state:
            # Button pressed
            self.button_states['last_button'] = 'pressing'
            self.press_times['last_button'] = current_time
            
            if self.config.get('settings', {}).get('enable_visual_feedback', True):
                self.show_notification("D01: Button Pressed")
                
        else:
            # Button released
            if 'last_button' in self.press_times:
                press_duration = current_time - self.press_times['last_button']
                
                # Determine button type based on duration
                if press_duration >= self.long_press_threshold:
                    button_type = 'bottom_long'
                    action_name = "Long Press"
                else:
                    button_type = 'bottom_short'  # Assume bottom for now
                    action_name = "Short Press"
                
                # Execute mapped action
                self.execute_button_action(button_type, action_name)
                
                # Clean up
                del self.press_times['last_button']
                if 'last_button' in self.button_states:
                    del self.button_states['last_button']
    
    def execute_button_action(self, button_type, action_name):
        """Execute the configured action for a button"""
        button_config = self.config['buttons'].get(button_type, {})
        action = button_config.get('action')
        category = button_config.get('category')
        
        if not action:
            print(f"No action configured for {button_type}")
            return
            
        print(f"🎯 Executing: {action_name} → {action}")
        
        # Execute via AppleScript based on category
        if category == 'WisprFlow Actions':
            self.execute_wisprflow_action(action)
        elif category == 'Application Control':
            self.execute_app_control(action)
        elif category == 'Keyboard Shortcuts':
            self.execute_keyboard_shortcut(action)
            
        # Show feedback
        if self.config.get('settings', {}).get('enable_visual_feedback', True):
            self.show_notification(f"D01: {action}")
    
    def execute_wisprflow_action(self, action):
        """Execute WisprFlow actions"""
        wisprflow_commands = {
            'Start Recording': 'tell application "System Events" to keystroke "r" using {command down, shift down}',
            'Stop Recording': 'tell application "System Events" to keystroke "s" using {command down, shift down}',
            'WisprFlow Control (Up Chevron)': 'tell application "System Events" to key code 126 using {control down}',
            'Toggle Recording': 'tell application "System Events" to keystroke space using {command down, shift down}',
        }
        
        if action in wisprflow_commands:
            self.run_applescript(wisprflow_commands[action])
    
    def execute_app_control(self, action):
        """Execute application control actions"""
        app_commands = {
            'Termius Next Tab': 'tell application "System Events" to keystroke "]" using {command down, shift down}',
            'Next Tab (Cmd+Shift+])': 'tell application "System Events" to keystroke "]" using {command down, shift down}',
            'Previous Tab (Cmd+Shift+[)': 'tell application "System Events" to keystroke "[" using {command down, shift down}',
        }
        
        if action in app_commands:
            self.run_applescript(app_commands[action])
    
    def execute_keyboard_shortcut(self, action):
        """Execute keyboard shortcuts"""
        shortcuts = {
            'Cmd+C (Copy)': 'tell application "System Events" to keystroke "c" using command down',
            'Cmd+V (Paste)': 'tell application "System Events" to keystroke "v" using command down',
            'Return (Enter)': 'tell application "System Events" to key code 36',
            'Escape': 'tell application "System Events" to key code 53',
        }
        
        if action in shortcuts:
            self.run_applescript(shortcuts[action])
    
    def run_applescript(self, script):
        """Execute AppleScript command"""
        try:
            subprocess.run(['osascript', '-e', script], check=True)
        except subprocess.CalledProcessError as e:
            print(f"AppleScript error: {e}")
    
    def show_notification(self, message):
        """Show system notification"""
        try:
            subprocess.run([
                'osascript', '-e', 
                f'display notification "{message}" with title "D01 Ring"'
            ], check=True)
        except subprocess.CalledProcessError:
            pass
    
    def show_capture_analysis(self):
        """Show analysis of captured data"""
        print("\n" + "="*60)
        print("📊 D01 CAPTURE ANALYSIS")
        print("="*60)
        
        print(f"HID Reports captured: {len(self.hid_reports)}")
        print(f"Button events captured: {len(self.button_events)}")
        
        if self.button_events:
            # Analyze button patterns
            press_events = [e for e in self.button_events if e['action'] == 'press']
            release_events = [e for e in self.button_events if e['action'] == 'release']
            
            print(f"\nButton activity:")
            print(f"  Presses: {len(press_events)}")
            print(f"  Releases: {len(release_events)}")
            
            # Calculate press durations
            press_durations = []
            for i in range(len(self.button_events) - 1):
                if (self.button_events[i]['action'] == 'press' and 
                    self.button_events[i+1]['action'] == 'release'):
                    duration = self.button_events[i+1]['timestamp'] - self.button_events[i]['timestamp']
                    press_durations.append(duration)
            
            if press_durations:
                avg_duration = sum(press_durations) / len(press_durations)
                short_presses = len([d for d in press_durations if d < 0.5])
                long_presses = len([d for d in press_durations if d >= 0.5])
                
                print(f"\nPress analysis:")
                print(f"  Average duration: {avg_duration:.3f}s")
                print(f"  Short presses (< 0.5s): {short_presses}")
                print(f"  Long presses (≥ 0.5s): {long_presses}")
        
        print(f"\n🎯 System Status: Ready for button remapping!")
        print(f"Configuration file: {self.config_file}")

def main():
    system = D01IntegratedSystem()
    
    print("🔬 D01 Ring Integrated System")
    print("Choose mode:")
    print("1. Capture Mode - Analyze button patterns")
    print("2. Remapping Mode - Active button remapping")
    print()
    
    # Default to remapping mode
    mode = 'remapping'
    
    if mode == 'capture':
        system.config['settings']['enable_capture_mode'] = True
    
    print(f"Starting in {mode} mode...")
    system.start_integrated_system()

if __name__ == "__main__":
    main()