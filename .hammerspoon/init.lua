-- ~/.hammerspoon/init.lua

-- ---------- Cross-platform mappings ----------
-- Works on both macOS and iOS (when running via SSH/remote)
local function isMobile()
  -- Could detect iOS context if running remotely
  return false -- For now, assume macOS
end

-- ---------- WisprFlow Voice Dictation Actions ----------
local function startWisprFlow()
  -- Trigger WisprFlow start recording
  -- Common shortcuts are Cmd+Shift+Space or customize in WisprFlow settings
  hs.eventtap.keyStroke({"cmd", "shift"}, "space", 0)
end

local function stopWisprFlow()
  -- Trigger WisprFlow stop recording (usually same shortcut or Escape)
  hs.eventtap.keyStroke({"cmd", "shift"}, "space", 0)
end

local function toggleWisprFlow()
  -- Toggle WisprFlow recording on/off
  hs.eventtap.keyStroke({"cmd", "shift"}, "space", 0)
end

-- Additional WisprFlow shortcuts (customize based on your settings)
local function wisprFlowCancel()
  -- Cancel current dictation
  hs.eventtap.keyStroke({}, "escape", 0)
end

local function wisprFlowConfirm()
  -- Confirm/accept dictation
  hs.eventtap.keyStroke({}, "return", 0)
end

local function wisprFlowControl()
  -- WisprFlow control button (up chevron) - typically Ctrl+Up or custom shortcut
  hs.eventtap.keyStroke({"ctrl"}, "up", 0)
end

local function cycleTermiusTabs()
  -- Cycle through Termius tabs using Cmd+Shift+] (next tab)
  -- Alternative: Cmd+Option+Right or Ctrl+Tab depending on Termius settings
  hs.eventtap.keyStroke({"cmd", "shift"}, "]", 0)
end

-- Legacy functions for compatibility
local function doCtrlCaret()
  startWisprFlow()
end
local function doEnter()
  stopWisprFlow()
end

-- =========================================================
-- A) PHYSICAL BUTTON REMAPPING FOR WISPRFLOW
--    Bottom button (volume down) => Start/Hold WisprFlow recording
--    Top button (volume up) => Stop WisprFlow recording
--    Middle button => Toggle WisprFlow or Confirm dictation
-- =========================================================
local isRecording = false

local function startWisprFlowRecording()
  if not isRecording then
    startWisprFlow()
    isRecording = true
    hs.alert.show("🎤 WisprFlow Recording Started")
  end
end

local function stopWisprFlowRecording()
  if isRecording then
    stopWisprFlow()
    isRecording = false
    hs.alert.show("⏹️ WisprFlow Recording Stopped")
  end
end

-- Capture system volume and other key events for WisprFlow
local keyTap = hs.eventtap.new({
  hs.eventtap.event.types.systemDefined,
  hs.eventtap.event.types.keyDown,
  hs.eventtap.event.types.keyUp
}, function(e)
  local eventType = e:getType()
  
  -- Handle regular key events for custom HID codes from D01 remapper
  if eventType == hs.eventtap.event.types.keyDown then
    local keyCode = e:getKeyCode()
    
    -- Custom HID codes from D01 remapper
    -- 0x10 = 16 (bottom button pressed) - Start WisprFlow recording
    if keyCode == 16 then
      startWisprFlowRecording()
      return true
    end
    
    -- 0x20 = 32 (short press release OR top button) - Stop WisprFlow
    if keyCode == 32 then
      stopWisprFlowRecording()
      return true
    end
    
    -- 0x40 = 64 (middle button) - Cycle Termius tabs or WisprFlow confirm
    if keyCode == 64 then
      if isRecording then
        wisprFlowConfirm()
        hs.alert.show("✅ WisprFlow Confirmed")
      else
        -- Check if Termius is the active application
        local app = hs.application.frontmostApplication()
        if app and app:name() == "Termius" then
          cycleTermiusTabs()
          hs.alert.show("📱 Termius Tab →")
        else
          toggleWisprFlow()
          hs.alert.show("🎤 WisprFlow Toggled")
        end
      end
      return true
    end
    
    -- 0x80 = 128 (long press release) - Stop and process WisprFlow
    if keyCode == 128 then
      if isRecording then
        stopWisprFlowRecording()
        -- Add a small delay then trigger the control/process action
        hs.timer.doAfter(0.1, function()
          wisprFlowControl()
          hs.alert.show("🔼 WisprFlow Processed")
        end)
      end
      return true
    end
  end
  
  -- Handle system events (volume keys, media keys) - fallback for direct ring input
  if eventType == hs.eventtap.event.types.systemDefined then
    local systemKey = e:systemKey()
    if not systemKey then return false end
    
    local keyCode = systemKey.key
    local isDown = systemKey.down
    
    -- Volume Down = Bottom Button (keyCode typically 1) - Start WisprFlow
    if keyCode == 1 and isDown then
      startWisprFlowRecording()
      return true -- consume the event
    end
    
    -- Volume Up = Top Button (keyCode typically 0) - Stop WisprFlow
    if keyCode == 0 and isDown then
      stopWisprFlowRecording()
      return true -- consume the event
    end
    
    -- Media keys might be middle button - Toggle or Confirm
    if (keyCode == 16 or keyCode == 20) and isDown then -- Play/Pause or other media
      if isRecording then
        wisprFlowConfirm()
        hs.alert.show("✅ WisprFlow Confirmed")
      else
        toggleWisprFlow()
        hs.alert.show("🎤 WisprFlow Toggled")
      end
      return true -- consume the event
    end
  end
  
  return false -- let other events pass through
end):start()

-- =========================================================
-- B) DIAGONAL POINTER "BUMP" → Enter   [for your middle button]
--    Looks for a brief burst of mouse movement where |dx|≈|dy|.
--    Fires once, then cools down to avoid repeats.
-- =========================================================
local buf = {}
local WINDOW_MS      = 100   -- look at last 100ms of movement
local MIN_SAMPLES    = 3     -- need at least N moves in the window
local MIN_TOTAL_LEN  = 30    -- total motion magnitude needed
local DIAG_RATIO_MIN = 0.70  -- |sum_dx| / |sum_dy| within [min, max] is "diagonal"
local DIAG_RATIO_MAX = 1.40
local COOLDOWN_MS    = 300   -- after firing, ignore for a bit
local lastFiredAt    = 0

local moveTap = hs.eventtap.new({hs.eventtap.event.types.mouseMoved}, function(e)

  local now = hs.timer.absoluteTime() / 1e6
  local dx = e:getProperty(hs.eventtap.event.properties.mouseEventDeltaX) or 0
  local dy = e:getProperty(hs.eventtap.event.properties.mouseEventDeltaY) or 0
  if dx == 0 and dy == 0 then return false end

  -- Keep only recent samples
  table.insert(buf, {t=now, dx=dx, dy=dy})
  local cutoff = now - WINDOW_MS
  while #buf > 0 and buf[1].t < cutoff do table.remove(buf, 1) end

  -- Enough data?
  if #buf < MIN_SAMPLES then return false end

  -- Sum recent movement
  local sx, sy = 0, 0
  for _, s in ipairs(buf) do sx = sx + s.dx; sy = sy + s.dy end
  local ax, ay = math.abs(sx), math.abs(sy)
  local total  = ax + ay

  -- Diagonal? (|dx| ≈ |dy|)
  local ratio = (ay == 0) and 999 or (ax / ay)
  local diagonal = (ratio >= DIAG_RATIO_MIN and ratio <= DIAG_RATIO_MAX)

  -- Check cooldown and magnitude
  if diagonal and total >= MIN_TOTAL_LEN and (now - lastFiredAt) > COOLDOWN_MS then
    doEnter()
    lastFiredAt = now
    buf = {}  -- reset buffer so it doesn't keep firing
    -- Consume this movement so the cursor doesn't jump when Enter fires
    return true
  end

  -- Otherwise, pass movement through
  return false
end):start()

-- ---------- Quick toggle (Cmd+Ctrl+R) ----------
hs.hotkey.bind({"cmd","ctrl"}, "R", function()
  local on = keyTap:isEnabled() and moveTap:isEnabled()
  if on then 
    keyTap:stop()
    moveTap:stop()
    isRecording = false
    hs.alert.show("🎤 WisprFlow Ring Control: OFF")
  else 
    keyTap:start()
    moveTap:start()
    hs.alert.show("🎤 WisprFlow Ring Control: ON") 
  end
end)

hs.alert.show("Ring remap loaded")