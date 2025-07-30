# D01 Ring Button Mappings

## Device Information
- **Device**: D01 Pro
- **Vendor ID**: 0x05AC (Apple)
- **Product ID**: 0x022C (556)
- **Bluetooth Address**: 58:5E:42:B3:2C:66

## Button Behavior (User Confirmed)

### Primary Button (Bottom/Main Button)
- **Long Press**: Hold down mic button and record (WisprFlow recording)
- **Short Press**: Enter key
- **Same physical button** with different press durations

## Technical Notes
- Device appears as multiple HID interfaces (4 instances detected)
- May use iOS-style gesture protocols instead of standard HID buttons
- Bluetooth connection established but button presses not detected via standard HID monitoring
- Requires specialized gesture/touch event monitoring

## Implementation Strategy
1. Map long press → Start/hold WisprFlow recording
2. Map short press → Enter key action
3. Need to detect press duration to differentiate between long/short
4. May require iOS gesture framework integration

## Status
- ✅ Device detected and connected
- ✅ Button behavior confirmed by user
- ⏸️ Event capture method still being determined
- ⏸️ Implementation pending gesture detection solution