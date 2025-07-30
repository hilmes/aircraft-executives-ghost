#!/usr/bin/env python3
"""
D01 Ring Configuration Interface
Interactive GUI for configuring button mappings and gestures
"""

import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import json
import os
from collections import defaultdict

class D01ConfigInterface:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("D01 Ring Configuration")
        self.root.geometry("800x600")
        
        self.config_file = os.path.expanduser("~/.d01-config.json")
        self.config = self.load_config()
        
        # Available actions
        self.available_actions = {
            'Keyboard Shortcuts': [
                'Cmd+C (Copy)', 'Cmd+V (Paste)', 'Cmd+Z (Undo)', 'Cmd+Y (Redo)',
                'Cmd+A (Select All)', 'Cmd+S (Save)', 'Cmd+O (Open)', 'Cmd+N (New)',
                'Cmd+W (Close)', 'Cmd+T (New Tab)', 'Cmd+Shift+T (Reopen Tab)',
                'Cmd+L (Address Bar)', 'Cmd+R (Refresh)', 'Cmd+F (Find)',
                'Cmd+Space (Spotlight)', 'Cmd+Tab (App Switch)', 'Cmd+` (Window Switch)',
                'Space (Play/Pause)', 'Cmd+Up (Volume Up)', 'Cmd+Down (Volume Down)',
                'F11 (Fullscreen)', 'Escape', 'Return (Enter)', 'Delete', 'Backspace'
            ],
            'WisprFlow Actions': [
                'Start Recording', 'Stop Recording', 'Toggle Recording',
                'Cancel Recording', 'Confirm Dictation', 'WisprFlow Control (Up Chevron)',
                'Process and Insert', 'Clear Dictation', 'Repeat Last'
            ],
            'Application Control': [
                'Next Tab (Cmd+Shift+])', 'Previous Tab (Cmd+Shift+[)',
                'Close Tab (Cmd+W)', 'New Tab (Cmd+T)', 
                'Termius Next Tab', 'Termius Previous Tab',
                'Focus Address Bar', 'Focus Search', 'Scroll Up', 'Scroll Down',
                'Page Up', 'Page Down', 'Home', 'End'
            ],
            'System Control': [
                'Mission Control', 'Show Desktop', 'Launchpad', 'Notification Center',
                'Screenshot (Cmd+Shift+3)', 'Screenshot Selection (Cmd+Shift+4)',
                'Lock Screen', 'Sleep', 'Do Not Disturb Toggle',
                'Brightness Up', 'Brightness Down', 'Keyboard Brightness Up', 'Keyboard Brightness Down'
            ],
            'Mouse Actions': [
                'Left Click', 'Right Click', 'Middle Click', 'Double Click',
                'Scroll Up', 'Scroll Down', 'Scroll Left', 'Scroll Right',
                'Mouse Forward', 'Mouse Back'
            ],
            'Custom Commands': [
                'Run AppleScript', 'Run Shell Command', 'Open Application',
                'Open URL', 'Type Text', 'Wait/Delay', 'Send Notification'
            ]
        }
        
        self.setup_ui()
        
    def load_config(self):
        """Load existing configuration"""
        default_config = {
            'buttons': {
                'bottom_short': {'action': 'Start Recording', 'category': 'WisprFlow Actions'},
                'bottom_long': {'action': 'WisprFlow Control (Up Chevron)', 'category': 'WisprFlow Actions'},
                'top': {'action': 'Stop Recording', 'category': 'WisprFlow Actions'},
                'middle': {'action': 'Termius Next Tab', 'category': 'Application Control'},
            },
            'gestures': {
                'diagonal_swipe': {'action': 'Return (Enter)', 'category': 'Keyboard Shortcuts'},
                'double_tap': {'action': 'Escape', 'category': 'Keyboard Shortcuts'},
            },
            'settings': {
                'long_press_threshold': 800,  # milliseconds
                'double_tap_threshold': 300,
                'swipe_sensitivity': 30,
                'enable_haptic_feedback': True,
                'enable_visual_feedback': True
            },
            'applications': {
                'Termius': {
                    'middle_button': 'Next Tab (Cmd+Shift+])'
                },
                'Safari': {
                    'middle_button': 'New Tab (Cmd+T)'
                },
                'Chrome': {
                    'middle_button': 'New Tab (Cmd+T)'
                }
            }
        }
        
        try:
            if os.path.exists(self.config_file):
                with open(self.config_file, 'r') as f:
                    loaded_config = json.load(f)
                    # Merge with defaults to ensure all keys exist
                    for key, value in default_config.items():
                        if key not in loaded_config:
                            loaded_config[key] = value
                    return loaded_config
        except Exception as e:
            print(f"Error loading config: {e}")
            
        return default_config
    
    def save_config(self):
        """Save configuration to file"""
        try:
            with open(self.config_file, 'w') as f:
                json.dump(self.config, f, indent=2)
            messagebox.showinfo("Success", f"Configuration saved to {self.config_file}")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to save configuration: {e}")
    
    def setup_ui(self):
        """Setup the user interface"""
        # Create notebook for tabs
        notebook = ttk.Notebook(self.root)
        notebook.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Button Mappings Tab
        self.setup_button_tab(notebook)
        
        # Gestures Tab  
        self.setup_gesture_tab(notebook)
        
        # Application-Specific Tab
        self.setup_application_tab(notebook)
        
        # Settings Tab
        self.setup_settings_tab(notebook)
        
        # Device Scanner Tab
        self.setup_scanner_tab(notebook)
        
        # Control buttons
        self.setup_control_buttons()
    
    def setup_button_tab(self, notebook):
        """Setup button mapping tab"""
        button_frame = ttk.Frame(notebook)
        notebook.add(button_frame, text="Button Mappings")
        
        # Title
        title = ttk.Label(button_frame, text="D01 Ring Button Mappings", font=('Arial', 16, 'bold'))
        title.pack(pady=10)
        
        # Button mapping grid
        mapping_frame = ttk.Frame(button_frame)
        mapping_frame.pack(fill=tk.BOTH, expand=True, padx=20)
        
        buttons = [
            ('bottom_short', 'Bottom Button (Short Press)'),
            ('bottom_long', 'Bottom Button (Long Press)'),
            ('top', 'Top Button'),
            ('middle', 'Middle Button')
        ]
        
        self.button_vars = {}
        
        for i, (button_id, button_name) in enumerate(buttons):
            # Button label
            label = ttk.Label(mapping_frame, text=button_name, font=('Arial', 12))
            label.grid(row=i, column=0, sticky=tk.W, pady=5, padx=5)
            
            # Category selection
            category_var = tk.StringVar()
            category_combo = ttk.Combobox(mapping_frame, textvariable=category_var, 
                                        values=list(self.available_actions.keys()),
                                        width=20, state="readonly")
            category_combo.grid(row=i, column=1, pady=5, padx=5)
            
            # Action selection
            action_var = tk.StringVar()
            action_combo = ttk.Combobox(mapping_frame, textvariable=action_var, width=30)
            action_combo.grid(row=i, column=2, pady=5, padx=5)
            
            # Load current values
            current_config = self.config['buttons'].get(button_id, {})
            if 'category' in current_config:
                category_var.set(current_config['category'])
                action_combo['values'] = self.available_actions[current_config['category']]
            if 'action' in current_config:
                action_var.set(current_config['action'])
            
            # Bind category change to update actions
            def update_actions(event, av=action_var, ac=action_combo, cv=category_var):
                if cv.get():
                    ac['values'] = self.available_actions[cv.get()]
                    av.set('')  # Clear action when category changes
            
            category_combo.bind('<<ComboboxSelected>>', update_actions)
            
            self.button_vars[button_id] = (category_var, action_var)
    
    def setup_gesture_tab(self, notebook):
        """Setup gesture mapping tab"""
        gesture_frame = ttk.Frame(notebook)
        notebook.add(gesture_frame, text="Gestures")
        
        title = ttk.Label(gesture_frame, text="Gesture Mappings", font=('Arial', 16, 'bold'))
        title.pack(pady=10)
        
        # Gesture info
        info_text = """
        Configure gestures detected by the D01 ring:
        • Diagonal Swipe: Quick diagonal mouse movement
        • Double Tap: Two rapid taps on the ring
        • Hold and Move: Hold button while moving ring
        """
        info_label = ttk.Label(gesture_frame, text=info_text, justify=tk.LEFT)
        info_label.pack(pady=10)
        
        # Gesture mapping grid
        gesture_mapping_frame = ttk.Frame(gesture_frame)
        gesture_mapping_frame.pack(fill=tk.BOTH, expand=True, padx=20)
        
        gestures = [
            ('diagonal_swipe', 'Diagonal Swipe'),
            ('double_tap', 'Double Tap'),
            ('hold_and_move', 'Hold and Move')
        ]
        
        self.gesture_vars = {}
        
        for i, (gesture_id, gesture_name) in enumerate(gestures):
            # Gesture label
            label = ttk.Label(gesture_mapping_frame, text=gesture_name, font=('Arial', 12))
            label.grid(row=i, column=0, sticky=tk.W, pady=5, padx=5)
            
            # Category selection
            category_var = tk.StringVar()
            category_combo = ttk.Combobox(gesture_mapping_frame, textvariable=category_var,
                                        values=list(self.available_actions.keys()),
                                        width=20, state="readonly")
            category_combo.grid(row=i, column=1, pady=5, padx=5)
            
            # Action selection
            action_var = tk.StringVar()
            action_combo = ttk.Combobox(gesture_mapping_frame, textvariable=action_var, width=30)
            action_combo.grid(row=i, column=2, pady=5, padx=5)
            
            # Load current values
            current_config = self.config['gestures'].get(gesture_id, {})
            if 'category' in current_config:
                category_var.set(current_config['category'])
                action_combo['values'] = self.available_actions[current_config['category']]
            if 'action' in current_config:
                action_var.set(current_config['action'])
            
            # Bind category change
            def update_gesture_actions(event, av=action_var, ac=action_combo, cv=category_var):
                if cv.get():
                    ac['values'] = self.available_actions[cv.get()]
                    av.set('')
            
            category_combo.bind('<<ComboboxSelected>>', update_gesture_actions)
            
            self.gesture_vars[gesture_id] = (category_var, action_var)
    
    def setup_application_tab(self, notebook):
        """Setup application-specific mappings"""
        app_frame = ttk.Frame(notebook)
        notebook.add(app_frame, text="App-Specific")
        
        title = ttk.Label(app_frame, text="Application-Specific Mappings", font=('Arial', 16, 'bold'))
        title.pack(pady=10)
        
        info_text = "Configure different button behaviors for specific applications"
        info_label = ttk.Label(app_frame, text=info_text)
        info_label.pack(pady=5)
        
        # Application list
        app_list_frame = ttk.Frame(app_frame)
        app_list_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=10)
        
        # Add scrollable list of applications
        self.app_tree = ttk.Treeview(app_list_frame, columns=('button', 'action'), show='tree headings')
        self.app_tree.heading('#0', text='Application')
        self.app_tree.heading('button', text='Button')
        self.app_tree.heading('action', text='Action')
        
        scrollbar = ttk.Scrollbar(app_list_frame, orient=tk.VERTICAL, command=self.app_tree.yview)
        self.app_tree.configure(yscrollcommand=scrollbar.set)
        
        self.app_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Load application mappings
        self.load_app_mappings()
        
        # Add/Edit buttons
        app_button_frame = ttk.Frame(app_frame)
        app_button_frame.pack(pady=10)
        
        ttk.Button(app_button_frame, text="Add App Mapping", 
                  command=self.add_app_mapping).pack(side=tk.LEFT, padx=5)
        ttk.Button(app_button_frame, text="Edit Selected", 
                  command=self.edit_app_mapping).pack(side=tk.LEFT, padx=5)
        ttk.Button(app_button_frame, text="Remove Selected", 
                  command=self.remove_app_mapping).pack(side=tk.LEFT, padx=5)
    
    def setup_settings_tab(self, notebook):
        """Setup settings tab"""
        settings_frame = ttk.Frame(notebook)
        notebook.add(settings_frame, text="Settings")
        
        title = ttk.Label(settings_frame, text="D01 Ring Settings", font=('Arial', 16, 'bold'))
        title.pack(pady=10)
        
        # Settings grid
        settings_grid = ttk.Frame(settings_frame)
        settings_grid.pack(fill=tk.BOTH, expand=True, padx=20)
        
        self.setting_vars = {}
        
        settings = [
            ('long_press_threshold', 'Long Press Threshold (ms)', 'int', 100, 2000),
            ('double_tap_threshold', 'Double Tap Threshold (ms)', 'int', 100, 1000),
            ('swipe_sensitivity', 'Swipe Sensitivity', 'int', 10, 100),
            ('enable_haptic_feedback', 'Enable Haptic Feedback', 'bool', None, None),
            ('enable_visual_feedback', 'Enable Visual Feedback', 'bool', None, None)
        ]
        
        for i, (setting_id, setting_name, setting_type, min_val, max_val) in enumerate(settings):
            label = ttk.Label(settings_grid, text=setting_name)
            label.grid(row=i, column=0, sticky=tk.W, pady=5, padx=5)
            
            if setting_type == 'int':
                var = tk.IntVar(value=self.config['settings'].get(setting_id, 500))
                scale = ttk.Scale(settings_grid, from_=min_val, to=max_val, 
                                variable=var, orient=tk.HORIZONTAL, length=200)
                scale.grid(row=i, column=1, pady=5, padx=5)
                
                # Value label
                value_label = ttk.Label(settings_grid, textvariable=var)
                value_label.grid(row=i, column=2, pady=5, padx=5)
                
            elif setting_type == 'bool':
                var = tk.BooleanVar(value=self.config['settings'].get(setting_id, True))
                checkbox = ttk.Checkbutton(settings_grid, variable=var)
                checkbox.grid(row=i, column=1, pady=5, padx=5)
            
            self.setting_vars[setting_id] = var
    
    def setup_scanner_tab(self, notebook):
        """Setup device scanner tab"""
        scanner_frame = ttk.Frame(notebook)
        notebook.add(scanner_frame, text="Device Scanner")
        
        title = ttk.Label(scanner_frame, text="D01 Ring Device Scanner", font=('Arial', 16, 'bold'))
        title.pack(pady=10)
        
        info_text = """
        Use this scanner to detect and map D01 ring button presses.
        This will help identify which physical buttons correspond to which signals.
        """
        info_label = ttk.Label(scanner_frame, text=info_text, justify=tk.LEFT)
        info_label.pack(pady=10)
        
        # Device ID input
        device_frame = ttk.Frame(scanner_frame)
        device_frame.pack(pady=5)
        
        ttk.Label(device_frame, text="D01 Device ID (optional):").pack(side=tk.LEFT)
        self.device_id_var = tk.StringVar(value="58:5E:42:B3:2C:66")
        device_entry = ttk.Entry(device_frame, textvariable=self.device_id_var, width=20)
        device_entry.pack(side=tk.LEFT, padx=5)
        
        ttk.Button(device_frame, text="Detect Device", 
                  command=self.detect_d01_device).pack(side=tk.LEFT, padx=5)
        
        # Scanner controls
        control_frame = ttk.Frame(scanner_frame)
        control_frame.pack(pady=10)
        
        self.scan_button = ttk.Button(control_frame, text="Start Scanner", 
                                     command=self.start_device_scanner)
        self.scan_button.pack(side=tk.LEFT, padx=5)
        
        self.stop_button = ttk.Button(control_frame, text="Stop Scanner", 
                                     command=self.stop_device_scanner, state=tk.DISABLED)
        self.stop_button.pack(side=tk.LEFT, padx=5)
        
        ttk.Button(control_frame, text="Clear Results", 
                  command=self.clear_scanner_results).pack(side=tk.LEFT, padx=5)
        
        # Status display
        self.scanner_status = ttk.Label(scanner_frame, text="Scanner ready", 
                                       font=('Arial', 10, 'bold'))
        self.scanner_status.pack(pady=5)
        
        # Results display
        results_frame = ttk.Frame(scanner_frame)
        results_frame.pack(fill=tk.BOTH, expand=True, pady=10, padx=20)
        
        ttk.Label(results_frame, text="Detected Button Events:", font=('Arial', 12, 'bold')).pack(anchor=tk.W)
        
        # Create scrollable text widget for results
        text_frame = ttk.Frame(results_frame)
        text_frame.pack(fill=tk.BOTH, expand=True)
        
        self.scanner_results = tk.Text(text_frame, height=15, wrap=tk.WORD, font=('Courier', 10))
        scrollbar_scanner = ttk.Scrollbar(text_frame, orient=tk.VERTICAL, command=self.scanner_results.yview)
        self.scanner_results.configure(yscrollcommand=scrollbar_scanner.set)
        
        self.scanner_results.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar_scanner.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Button mapping section
        mapping_frame = ttk.Frame(scanner_frame)
        mapping_frame.pack(fill=tk.X, pady=10, padx=20)
        
        ttk.Label(mapping_frame, text="Quick Button Mapping:", font=('Arial', 12, 'bold')).pack(anchor=tk.W)
        
        quick_frame = ttk.Frame(mapping_frame)
        quick_frame.pack(fill=tk.X, pady=5)
        
        ttk.Label(quick_frame, text="Last detected event:").pack(side=tk.LEFT)
        ttk.Button(quick_frame, text="Map to Bottom Short", 
                  command=lambda: self.quick_map_button('bottom_short')).pack(side=tk.LEFT, padx=5)
        ttk.Button(quick_frame, text="Map to Bottom Long", 
                  command=lambda: self.quick_map_button('bottom_long')).pack(side=tk.LEFT, padx=5)
        ttk.Button(quick_frame, text="Map to Top", 
                  command=lambda: self.quick_map_button('top')).pack(side=tk.LEFT, padx=5)
        ttk.Button(quick_frame, text="Map to Middle", 
                  command=lambda: self.quick_map_button('middle')).pack(side=tk.LEFT, padx=5)
        
        # Scanner state
        self.scanner_process = None
        self.scanner_running = False
        self.last_detected_event = None
    
    def setup_control_buttons(self):
        """Setup control buttons at bottom"""
        button_frame = ttk.Frame(self.root)
        button_frame.pack(fill=tk.X, padx=10, pady=5)
        
        ttk.Button(button_frame, text="Save Configuration", 
                  command=self.save_configuration).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Load Configuration", 
                  command=self.load_configuration).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Reset to Defaults", 
                  command=self.reset_configuration).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Test Configuration", 
                  command=self.test_configuration).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Apply & Close", 
                  command=self.apply_and_close).pack(side=tk.RIGHT, padx=5)
    
    def load_app_mappings(self):
        """Load application mappings into tree view"""
        for app_name, mappings in self.config['applications'].items():
            app_item = self.app_tree.insert('', 'end', text=app_name)
            for button, action in mappings.items():
                self.app_tree.insert(app_item, 'end', text='', values=(button, action))
    
    def add_app_mapping(self):
        """Add new application mapping"""
        # Create dialog for adding app mapping
        dialog = tk.Toplevel(self.root)
        dialog.title("Add Application Mapping")
        dialog.geometry("400x300")
        
        # App name
        ttk.Label(dialog, text="Application Name:").pack(pady=5)
        app_name_var = tk.StringVar()
        ttk.Entry(dialog, textvariable=app_name_var, width=30).pack(pady=5)
        
        # Button selection
        ttk.Label(dialog, text="Button:").pack(pady=5)
        button_var = tk.StringVar()
        button_combo = ttk.Combobox(dialog, textvariable=button_var,
                                   values=['middle_button', 'top_button', 'bottom_short', 'bottom_long'])
        button_combo.pack(pady=5)
        
        # Action selection
        ttk.Label(dialog, text="Action Category:").pack(pady=5)
        category_var = tk.StringVar()
        category_combo = ttk.Combobox(dialog, textvariable=category_var,
                                     values=list(self.available_actions.keys()))
        category_combo.pack(pady=5)
        
        ttk.Label(dialog, text="Action:").pack(pady=5)
        action_var = tk.StringVar()
        action_combo = ttk.Combobox(dialog, textvariable=action_var)
        action_combo.pack(pady=5)
        
        def update_actions_dialog(event):
            if category_var.get():
                action_combo['values'] = self.available_actions[category_var.get()]
        
        category_combo.bind('<<ComboboxSelected>>', update_actions_dialog)
        
        def save_app_mapping():
            app_name = app_name_var.get()
            button = button_var.get()
            action = action_var.get()
            
            if app_name and button and action:
                if app_name not in self.config['applications']:
                    self.config['applications'][app_name] = {}
                self.config['applications'][app_name][button] = action
                
                # Refresh tree view
                self.app_tree.delete(*self.app_tree.get_children())
                self.load_app_mappings()
                
                dialog.destroy()
            else:
                messagebox.showerror("Error", "Please fill all fields")
        
        ttk.Button(dialog, text="Save", command=save_app_mapping).pack(pady=10)
        ttk.Button(dialog, text="Cancel", command=dialog.destroy).pack(pady=5)
    
    def edit_app_mapping(self):
        """Edit selected application mapping"""
        # Implementation for editing
        pass
    
    def remove_app_mapping(self):
        """Remove selected application mapping"""
        selected = self.app_tree.selection()
        if selected:
            if messagebox.askyesno("Confirm", "Remove selected mapping?"):
                # Remove from config and refresh tree
                pass
    
    def save_configuration(self):
        """Save current configuration"""
        # Update config from UI
        for button_id, (category_var, action_var) in self.button_vars.items():
            self.config['buttons'][button_id] = {
                'category': category_var.get(),
                'action': action_var.get()
            }
        
        for gesture_id, (category_var, action_var) in self.gesture_vars.items():
            self.config['gestures'][gesture_id] = {
                'category': category_var.get(),
                'action': action_var.get()
            }
        
        for setting_id, var in self.setting_vars.items():
            self.config['settings'][setting_id] = var.get()
        
        self.save_config()
    
    def load_configuration(self):
        """Load configuration from file"""
        file_path = filedialog.askopenfilename(
            title="Load Configuration",
            filetypes=[("JSON files", "*.json"), ("All files", "*.*")]
        )
        if file_path:
            try:
                with open(file_path, 'r') as f:
                    self.config = json.load(f)
                messagebox.showinfo("Success", "Configuration loaded successfully")
                # Refresh UI
                self.refresh_ui()
            except Exception as e:
                messagebox.showerror("Error", f"Failed to load configuration: {e}")
    
    def reset_configuration(self):
        """Reset to default configuration"""
        if messagebox.askyesno("Confirm", "Reset all settings to defaults?"):
            self.config = self.load_config()  # This loads defaults
            self.refresh_ui()
    
    def test_configuration(self):
        """Test current configuration"""
        messagebox.showinfo("Test", "Configuration test would be implemented here")
    
    def apply_and_close(self):
        """Apply configuration and close"""
        self.save_configuration()
        self.root.destroy()
    
    def refresh_ui(self):
        """Refresh UI with current configuration"""
        # Update button mappings
        for button_id, (category_var, action_var) in self.button_vars.items():
            config = self.config['buttons'].get(button_id, {})
            category_var.set(config.get('category', ''))
            action_var.set(config.get('action', ''))
        
        # Update gesture mappings
        for gesture_id, (category_var, action_var) in self.gesture_vars.items():
            config = self.config['gestures'].get(gesture_id, {})
            category_var.set(config.get('category', ''))
            action_var.set(config.get('action', ''))
        
        # Update settings
        for setting_id, var in self.setting_vars.items():
            var.set(self.config['settings'].get(setting_id, var.get()))
        
        # Refresh app tree
        self.app_tree.delete(*self.app_tree.get_children())
        self.load_app_mappings()
    
    def start_device_scanner(self):
        """Start the device scanner"""
        import subprocess
        import threading
        import time
        
        if self.scanner_running:
            return
            
        self.scanner_running = True
        self.scan_button.config(state=tk.DISABLED)
        self.stop_button.config(state=tk.NORMAL)
        self.scanner_status.config(text="🔍 Scanner running - Press buttons on D01 ring!")
        
        def scanner_thread():
            try:
                # Get device ID from UI
                device_id = self.device_id_var.get().strip()
                
                # Start the HID scanner process - cast a wide net for D01 events
                if device_id:
                    # If we have device ID, look for ANY events from that device
                    predicate = f'eventMessage CONTAINS "{device_id}"'
                else:
                    # Otherwise look for D01-specific patterns
                    predicate = (
                        'eventMessage CONTAINS "D01" OR '
                        'eventMessage CONTAINS "0x05ac" OR '
                        'eventMessage CONTAINS "buttonState" OR '
                        'eventMessage CONTAINS "input report" OR '
                        'eventMessage CONTAINS "HID" OR '
                        'eventMessage CONTAINS "keyboard" OR '
                        'eventMessage CONTAINS "SenderID"'
                    )
                
                self.scanner_process = subprocess.Popen([
                    'log', 'stream', '--predicate', predicate,
                    '--style', 'compact'
                ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
                
                while self.scanner_running:
                    line = self.scanner_process.stdout.readline()
                    if not line:
                        break
                        
                    line = line.strip()
                    if line:
                        self.process_scanner_line(line)
                        
            except Exception as e:
                self.scanner_results.insert(tk.END, f"Scanner error: {e}\n")
            finally:
                if self.scanner_process:
                    self.scanner_process.terminate()
        
        # Start scanner in background thread
        thread = threading.Thread(target=scanner_thread)
        thread.daemon = True
        thread.start()
    
    def stop_device_scanner(self):
        """Stop the device scanner"""
        self.scanner_running = False
        
        if self.scanner_process:
            self.scanner_process.terminate()
            self.scanner_process = None
            
        self.scan_button.config(state=tk.NORMAL)
        self.stop_button.config(state=tk.DISABLED)
        self.scanner_status.config(text="Scanner stopped")
    
    def process_scanner_line(self, line):
        """Process a line from the scanner"""
        import re
        import time
        
        timestamp = time.strftime('%H:%M:%S')
        
        # First, show ALL events from the D01 device for debugging
        device_id = self.device_id_var.get().strip()
        if device_id and device_id in line:
            result_text = f"[{timestamp}] 📱 D01 EVENT: {line}\n"
            self.scanner_results.insert(tk.END, result_text)
            self.scanner_results.see(tk.END)
        
        # Then parse specific event types
        if "buttonState changed" in line:
            # Parse button state change
            state_match = re.search(r'buttonState changed \((\d+)->(\d+)\)', line)
            if state_match:
                old_state = state_match.group(1)
                new_state = state_match.group(2)
                
                if old_state == "0" and new_state == "1":
                    event_type = "🔴 BUTTON PRESS"
                elif old_state == "1" and new_state == "0":
                    event_type = "🔵 BUTTON RELEASE"
                else:
                    event_type = f"📊 STATE CHANGE {old_state}→{new_state}"
                
                result_text = f"[{timestamp}] {event_type} - {line}\n"
                self.scanner_results.insert(tk.END, result_text)
                self.scanner_results.see(tk.END)
                
                # Store last event for quick mapping
                self.last_detected_event = {
                    'timestamp': timestamp,
                    'old_state': old_state,
                    'new_state': new_state,
                    'type': event_type,
                    'raw_line': line
                }
                
        elif "Received input report indication" in line:
            # Parse HID report
            handle_match = re.search(r'handle=(\d+)', line)
            length_match = re.search(r'length=(\d+)', line)
            
            if handle_match and length_match:
                handle = handle_match.group(1)
                length = length_match.group(1)
                
                result_text = f"[{timestamp}] 📡 HID Report: Handle={handle}, Length={length}\n"
                self.scanner_results.insert(tk.END, result_text)
                self.scanner_results.see(tk.END)
                
        elif any(keyword in line.lower() for keyword in ['hid', 'keyboard', 'input', 'key', 'button']):
            # Show any other potentially relevant events
            result_text = f"[{timestamp}] 🔍 POSSIBLE EVENT: {line}\n"
            self.scanner_results.insert(tk.END, result_text)
            self.scanner_results.see(tk.END)
    
    def clear_scanner_results(self):
        """Clear scanner results"""
        self.scanner_results.delete('1.0', tk.END)
        self.last_detected_event = None
    
    def quick_map_button(self, button_type):
        """Quick map the last detected event to a button"""
        if not self.last_detected_event:
            messagebox.showwarning("No Event", "No button event detected yet. Press a button on the D01 ring first.")
            return
            
        # For simplicity, we'll just show what would be mapped
        event_info = self.last_detected_event
        
        result = messagebox.askyesno(
            "Confirm Mapping",
            f"Map the last detected event to '{button_type}'?\n\n"
            f"Event: {event_info['type']}\n"
            f"Time: {event_info['timestamp']}\n"
            f"State: {event_info['old_state']}→{event_info['new_state']}\n\n"
            f"This will help the system recognize this button pattern."
        )
        
        if result:
            # Store the mapping in config
            if 'device_mappings' not in self.config:
                self.config['device_mappings'] = {}
                
            self.config['device_mappings'][button_type] = {
                'pattern': f"{event_info['old_state']}->{event_info['new_state']}",
                'timestamp': event_info['timestamp'],
                'type': event_info['type']
            }
            
            messagebox.showinfo("Mapping Saved", 
                              f"Button pattern mapped to '{button_type}'!\n"
                              f"The system will now recognize this button.")
            
            # Add to scanner results
            self.scanner_results.insert(tk.END, 
                                       f"✅ MAPPED: {event_info['type']} → {button_type}\n\n")
            self.scanner_results.see(tk.END)
    
    def detect_d01_device(self):
        """Detect D01 ring device and update device ID field"""
        import subprocess
        
        try:
            # Check Bluetooth devices
            result = subprocess.run([
                'system_profiler', 'SPBluetoothDataType'
            ], capture_output=True, text=True)
            
            if "D01 Pro" in result.stdout:
                # Extract address from Bluetooth info
                lines = result.stdout.split('\n')
                for i, line in enumerate(lines):
                    if "D01 Pro" in line:
                        # Look for address in nearby lines
                        for j in range(max(0, i-5), min(len(lines), i+5)):
                            if "Address:" in lines[j]:
                                address = lines[j].split("Address:")[1].strip()
                                self.device_id_var.set(address)
                                self.scanner_results.insert(tk.END, 
                                    f"✅ D01 Pro detected: {address}\n")
                                messagebox.showinfo("Device Found", 
                                    f"D01 Pro found!\nAddress: {address}")
                                return
                
                messagebox.showinfo("Device Found", 
                    "D01 Pro found but couldn't extract address")
            else:
                messagebox.showwarning("Device Not Found", 
                    "D01 Pro not found in Bluetooth devices.\n"
                    "Make sure it's connected and try again.")
                
        except Exception as e:
            messagebox.showerror("Detection Error", f"Error detecting device: {e}")
    
    def run(self):
        """Run the configuration interface"""
        self.root.mainloop()

if __name__ == "__main__":
    app = D01ConfigInterface()
    app.run()