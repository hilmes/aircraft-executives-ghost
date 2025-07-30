#!/usr/bin/env python3
"""
D01 Bluetooth Remapper - System-wide button remapping using configuration
"""

import json
import os
import time
import subprocess
import threading
from collections import defaultdict

class BluetoothRemapper:
    def __init__(self):
        self.config_file = os.path.expanduser("~/.d01-config.json")
        self.config = self.load_config()
        self.running = False
        self.button_states = {}
        self.press_times = {}
        
    def load_config(self):
        """Load configuration from file"""
        try:
            if os.path.exists(self.config_file):
                with open(self.config_file, 'r') as f:
                    return json.load(f)
        except Exception as e:
            print(f"Error loading config: {e}")
            
        # Return default config if file doesn't exist
        return {
            'buttons': {
                'bottom_short': {'action': 'Start Recording', 'category': 'WisprFlow Actions'},
                'bottom_long': {'action': 'WisprFlow Control (Up Chevron)', 'category': 'WisprFlow Actions'},
                'top': {'action': 'Stop Recording', 'category': 'WisprFlow Actions'},
                'middle': {'action': 'Termius Next Tab', 'category': 'Application Control'},
            },
            'settings': {
                'long_press_threshold': 800,
                'double_tap_threshold': 300,
                'enable_visual_feedback': True
            }
        }
    
    def get_frontmost_app(self):
        """Get the currently active application"""
        try:
            result = subprocess.run([
                'osascript', '-e', 'tell application "System Events" to get name of first application process whose frontmost is true'
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                return result.stdout.strip()
        except Exception as e:
            print(f"Error getting frontmost app: {e}")
        
        return None
    
    def execute_action(self, action, category):
        """Execute the configured action"""
        print(f"Executing: {action} ({category})")
        
        if category == 'WisprFlow Actions':
            self.execute_wisprflow_action(action)
        elif category == 'Keyboard Shortcuts':
            self.execute_keyboard_shortcut(action)
        elif category == 'Application Control':
            self.execute_app_control(action)
        elif category == 'System Control':
            self.execute_system_control(action)
        elif category == 'Mouse Actions':
            self.execute_mouse_action(action)
        elif category == 'Custom Commands':
            self.execute_custom_command(action)
        
        # Show visual feedback if enabled
        if self.config.get('settings', {}).get('enable_visual_feedback', True):
            self.show_notification(f"D01: {action}")
    
    def execute_wisprflow_action(self, action):
        """Execute WisprFlow-specific actions"""
        actions = {
            'Start Recording': 'tell application "System Events" to keystroke "r" using {command down, shift down}',
            'Stop Recording': 'tell application "System Events" to keystroke "s" using {command down, shift down}',
            'Toggle Recording': 'tell application "System Events" to keystroke space using {command down, shift down}',
            'Cancel Recording': 'tell application "System Events" to key code 53',  # Escape
            'Confirm Dictation': 'tell application "System Events" to key code 36',  # Return
            'WisprFlow Control (Up Chevron)': 'tell application "System Events" to key code 126 using {control down}',  # Ctrl+Up
            'Process and Insert': 'tell application "System Events" to keystroke "p" using {command down, shift down}',
            'Clear Dictation': 'tell application "System Events" to keystroke "c" using {command down, shift down}',
            'Repeat Last': 'tell application "System Events" to keystroke "l" using {command down, shift down}'
        }
        
        if action in actions:
            self.run_applescript(actions[action])
    
    def execute_keyboard_shortcut(self, action):
        """Execute keyboard shortcuts"""
        shortcuts = {
            'Cmd+C (Copy)': 'tell application "System Events" to keystroke "c" using command down',
            'Cmd+V (Paste)': 'tell application "System Events" to keystroke "v" using command down',
            'Cmd+Z (Undo)': 'tell application "System Events" to keystroke "z" using command down',
            'Cmd+Y (Redo)': 'tell application "System Events" to keystroke "y" using command down',
            'Cmd+A (Select All)': 'tell application "System Events" to keystroke "a" using command down',
            'Cmd+S (Save)': 'tell application "System Events" to keystroke "s" using command down',
            'Cmd+T (New Tab)': 'tell application "System Events" to keystroke "t" using command down',
            'Cmd+W (Close)': 'tell application "System Events" to keystroke "w" using command down',
            'Cmd+Tab (App Switch)': 'tell application "System Events" to keystroke tab using command down',
            'Cmd+Space (Spotlight)': 'tell application "System Events" to keystroke space using command down',
            'Space (Play/Pause)': 'tell application "System Events" to key code 49',  # Space
            'Escape': 'tell application "System Events" to key code 53',
            'Return (Enter)': 'tell application "System Events" to key code 36',
            'Delete': 'tell application "System Events" to key code 51',
            'Backspace': 'tell application "System Events" to key code 51'
        }
        
        if action in shortcuts:
            self.run_applescript(shortcuts[action])
    
    def execute_app_control(self, action):
        """Execute application-specific controls"""
        app = self.get_frontmost_app()
        
        # Application-specific mappings
        app_mappings = self.config.get('applications', {}).get(app, {})
        
        controls = {
            'Next Tab (Cmd+Shift+])': 'tell application "System Events" to keystroke "]" using {command down, shift down}',
            'Previous Tab (Cmd+Shift+[)': 'tell application "System Events" to keystroke "[" using {command down, shift down}',
            'Close Tab (Cmd+W)': 'tell application "System Events" to keystroke "w" using command down',
            'New Tab (Cmd+T)': 'tell application "System Events" to keystroke "t" using command down',
            'Termius Next Tab': 'tell application "System Events" to keystroke "]" using {command down, shift down}',
            'Termius Previous Tab': 'tell application "System Events" to keystroke "[" using {command down, shift down}',
            'Focus Address Bar': 'tell application "System Events" to keystroke "l" using command down',
            'Focus Search': 'tell application "System Events" to keystroke "f" using command down',
            'Scroll Up': 'tell application "System Events" to key code 116',  # Page Up
            'Scroll Down': 'tell application "System Events" to key code 121',  # Page Down
        }
        
        if action in controls:
            self.run_applescript(controls[action])
    
    def execute_system_control(self, action):
        """Execute system-level controls"""
        controls = {
            'Mission Control': 'tell application "System Events" to key code 160',  # F3
            'Show Desktop': 'tell application "System Events" to key code 103',  # F11
            'Screenshot (Cmd+Shift+3)': 'tell application "System Events" to keystroke "3" using {command down, shift down}',
            'Screenshot Selection (Cmd+Shift+4)': 'tell application "System Events" to keystroke "4" using {command down, shift down}',
            'Lock Screen': 'tell application "System Events" to keystroke "q" using {command down, control down}',
            'Volume Up': 'tell application "System Events" to set volume output volume (output volume of (get volume settings) + 10)',
            'Volume Down': 'tell application "System Events" to set volume output volume (output volume of (get volume settings) - 10)',
        }
        
        if action in controls:
            self.run_applescript(controls[action])
    
    def execute_mouse_action(self, action):
        """Execute mouse actions"""
        # Mouse actions would require additional libraries or system calls
        print(f"Mouse action: {action} (not implemented)")
    
    def execute_custom_command(self, action):
        """Execute custom commands"""
        print(f"Custom command: {action} (not implemented)")
    
    def run_applescript(self, script):
        """Run AppleScript command"""
        try:
            subprocess.run(['osascript', '-e', script], check=True)
        except subprocess.CalledProcessError as e:
            print(f"AppleScript error: {e}")
    
    def show_notification(self, message):
        """Show notification"""
        try:
            subprocess.run([
                'osascript', '-e', 
                f'display notification "{message}" with title "D01 Ring"'
            ], check=True)
        except subprocess.CalledProcessError:
            pass  # Notifications not critical
    
    def monitor_system_events(self):
        """Monitor system events for D01 input"""
        print("🔍 Monitoring system events for D01 ring input...")
        print("This is a placeholder - actual Bluetooth HID monitoring would be implemented here")
        
        # Placeholder for actual event monitoring
        # In reality, this would capture HID reports from the D01 ring
        
        try:
            while self.running:
                # Simulate button presses for testing
                time.sleep(1)
                
        except KeyboardInterrupt:
            print("\n🛑 Stopping event monitoring...")
            self.running = False
    
    def handle_button_press(self, button_type):
        """Handle button press based on configuration"""
        button_config = self.config['buttons'].get(button_type, {})
        action = button_config.get('action')
        category = button_config.get('category')
        
        if action and category:
            self.execute_action(action, category)
        else:
            print(f"No action configured for {button_type}")
    
    def start_remapping(self):
        """Start the Bluetooth remapping service"""
        print("🚀 Starting D01 Bluetooth Remapper")
        print(f"Configuration loaded from: {self.config_file}")
        print("Press Ctrl+C to stop\n")
        
        # Print current configuration
        print("Current button mappings:")
        for button, config in self.config['buttons'].items():
            action = config.get('action', 'Not set')
            print(f"  {button}: {action}")
        print()
        
        self.running = True
        
        # Start monitoring in a separate thread
        monitor_thread = threading.Thread(target=self.monitor_system_events)
        monitor_thread.daemon = True
        monitor_thread.start()
        
        # Keep main thread alive
        try:
            while self.running:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n🛑 Stopping D01 Bluetooth Remapper...")
            self.running = False

def main():
    print("🔬 D01 Bluetooth Remapper")
    print("=" * 40)
    
    remapper = BluetoothRemapper()
    
    print("1. Start remapping service")
    print("2. Test button actions")
    print("3. Show current configuration")
    print("4. Open configuration interface")
    
    choice = input("Choose option (1-4): ").strip()
    
    if choice == '1':
        remapper.start_remapping()
    elif choice == '2':
        print("\nTesting button actions:")
        for button_type in ['bottom_short', 'bottom_long', 'top', 'middle']:
            print(f"Testing {button_type}...")
            remapper.handle_button_press(button_type)
            time.sleep(1)
    elif choice == '3':
        print(f"\nCurrent configuration:")
        print(json.dumps(remapper.config, indent=2))
    elif choice == '4':
        print("Opening configuration interface...")
        subprocess.run(['python3', 'd01-config-interface.py'])

if __name__ == "__main__":
    main()