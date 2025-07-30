# D01 TikTok Ring Setup Process

## Device Information
- **Device**: D01 Pro (No manufacturer name)  
- **Vendor ID**: 1452 (0x05ac) - Reports as Apple device
- **Product ID**: 556 (0x022c)
- **Issue**: Reports Apple Vendor ID, causing compatibility issues with some tools

## Attempted Solutions

### 1. Karabiner-Elements
- **Status**: Attempted installation via Homebrew
- **Result**: Installation failed due to admin password requirement
- **Issue**: Apple pointing devices not supported (due to false Apple Vendor ID)

### 2. BetterTouchTool  
- **Status**: Successfully installed via Homebrew
- **Command**: `brew install --cask bettertouchtool`
- **Result**: Device detected but blocked due to Apple Vendor ID
- **Error**: "Apple pointing devices are not supported"

### 3. USB Overdrive (Current Solution)
- **Status**: In progress
- **Reason**: Less restrictive about vendor IDs
- **Website**: www.usboverdrive.com
- **Next Steps**: 
  1. Download and install .dmg
  2. Grant Input Monitoring permissions  
  3. Restart Mac
  4. Configure button mappings

## Technical Notes
- D01 ring uses cloned/generic chips with Apple's Vendor ID
- This causes legitimate remapping tools to reject it as "Apple hardware"
- USB Overdrive is older and less strict about vendor ID filtering
- Device should function normally once proper tool is used

## Alternative Options (if USB Overdrive fails)
- Try Karabiner-Elements again (might work despite vendor ID)
- SteerMouse
- Manual HID device handling