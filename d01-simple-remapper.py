#!/usr/bin/env python3
"""
D01 Simple Remapper - Based on confirmed button behavior
Long press = Hold mic/record, Short press = Enter
"""

import time
import subprocess
import json
import os

class D01SimpleRemapper:
    def __init__(self):
        self.config_file = os.path.expanduser("~/.d01-simple-config.json")
        self.button_state = False
        self.press_start_time = None
        self.long_press_threshold = 0.8  # 800ms
        
        # Load or create simple config
        self.config = self.load_simple_config()
        
    def load_simple_config(self):
        """Load simple configuration"""
        default_config = {
            "primary_button": {
                "short_press": {
                    "action": "enter_key",
                    "description": "Send Enter key"
                },
                "long_press": {
                    "action": "wisprflow_record",
                    "description": "Hold down mic and record (WisprFlow)"
                }
            },
            "settings": {
                "long_press_threshold_ms": 800,
                "enable_notifications": True
            }
        }
        
        try:
            if os.path.exists(self.config_file):
                with open(self.config_file, 'r') as f:
                    return json.load(f)
        except Exception as e:
            print(f"Config load error: {e}")
            
        return default_config
    
    def save_config(self):
        """Save configuration"""
        try:
            with open(self.config_file, 'w') as f:
                json.dump(self.config, f, indent=2)
            print(f"✅ Configuration saved to {self.config_file}")
        except Exception as e:
            print(f"Config save error: {e}")
    
    def execute_enter_key(self):
        """Execute Enter key action"""
        try:
            subprocess.run([
                'osascript', '-e', 
                'tell application "System Events" to key code 36'  # Enter key
            ], check=True)
            
            if self.config['settings']['enable_notifications']:
                self.show_notification("D01: Enter")
                
            print("🔵 Executed: Enter key")
            
        except Exception as e:
            print(f"Error executing Enter: {e}")
    
    def start_wisprflow_recording(self):
        """Start WisprFlow recording (long press start)"""
        try:
            # WisprFlow start recording command
            subprocess.run([
                'osascript', '-e',
                'tell application "System Events" to keystroke "r" using {command down, shift down}'
            ], check=True)
            
            if self.config['settings']['enable_notifications']:
                self.show_notification("D01: Recording Started")
                
            print("🔴 Started: WisprFlow recording")
            
        except Exception as e:
            print(f"Error starting recording: {e}")
    
    def stop_wisprflow_recording(self):
        """Stop WisprFlow recording (long press end)"""
        try:
            # WisprFlow stop recording command
            subprocess.run([
                'osascript', '-e',
                'tell application "System Events" to keystroke "s" using {command down, shift down}'
            ], check=True)
            
            if self.config['settings']['enable_notifications']:
                self.show_notification("D01: Recording Stopped")
                
            print("⏹️ Stopped: WisprFlow recording")
            
        except Exception as e:
            print(f"Error stopping recording: {e}")
    
    def show_notification(self, message):
        """Show system notification"""
        try:
            subprocess.run([
                'osascript', '-e',
                f'display notification "{message}" with title "D01 Ring"'
            ], check=True)
        except:
            pass  # Notifications are optional
    
    def handle_button_press(self):
        """Handle button press start"""
        if not self.button_state:
            self.button_state = True
            self.press_start_time = time.time()
            print(f"🔴 Button pressed at {time.strftime('%H:%M:%S')}")
            
            # Start recording immediately for long press
            self.start_wisprflow_recording()
    
    def handle_button_release(self):
        """Handle button release"""
        if self.button_state and self.press_start_time:
            press_duration = time.time() - self.press_start_time
            
            if press_duration >= self.long_press_threshold:
                # Long press - stop recording
                print(f"🔵 Long press released ({press_duration:.2f}s)")
                self.stop_wisprflow_recording()
            else:
                # Short press - stop recording and send Enter
                print(f"🔵 Short press released ({press_duration:.2f}s)")
                self.stop_wisprflow_recording()
                time.sleep(0.1)  # Brief delay
                self.execute_enter_key()
            
            # Reset state
            self.button_state = False
            self.press_start_time = None
    
    def simulate_button_test(self):
        """Simulate button presses for testing"""
        print("🧪 D01 Button Simulation Test")
        print("=" * 40)
        print("Current mappings:")
        print(f"  Short press: {self.config['primary_button']['short_press']['description']}")
        print(f"  Long press: {self.config['primary_button']['long_press']['description']}")
        print(f"  Threshold: {self.config['settings']['long_press_threshold_ms']}ms")
        print()
        
        # Test short press
        print("Testing SHORT press...")
        self.handle_button_press()
        time.sleep(0.3)  # 300ms press
        self.handle_button_release()
        
        time.sleep(2)
        
        # Test long press
        print("Testing LONG press...")
        self.handle_button_press()
        time.sleep(1.2)  # 1200ms press
        self.handle_button_release()
        
        print("\n✅ Test complete!")
    
    def show_status(self):
        """Show current configuration status"""
        print("📊 D01 Simple Remapper Status")
        print("=" * 40)
        print(f"Config file: {self.config_file}")
        print(f"Long press threshold: {self.config['settings']['long_press_threshold_ms']}ms")
        print(f"Notifications: {self.config['settings']['enable_notifications']}")
        print()
        print("Button mappings:")
        print(f"  🔘 Short press: {self.config['primary_button']['short_press']['description']}")
        print(f"  🔘 Long press: {self.config['primary_button']['long_press']['description']}")
        print()
        print("Status: Ready for integration with gesture detection")

def main():
    remapper = D01SimpleRemapper()
    
    print("🎯 D01 Simple Remapper")
    print("Based on confirmed button behavior:")
    print("- Long press: Hold mic and record")
    print("- Short press: Enter key")
    print()
    
    print("Options:")
    print("1. Show status")
    print("2. Test button simulation") 
    print("3. Save current config")
    
    choice = input("Choose option (1-3): ").strip()
    
    if choice == '1':
        remapper.show_status()
    elif choice == '2':
        remapper.simulate_button_test()
    elif choice == '3':
        remapper.save_config()
    else:
        remapper.show_status()

if __name__ == "__main__":
    main()