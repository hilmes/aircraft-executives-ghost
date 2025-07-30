-- D01 Simple Input Capture
-- Save this as a Hammerspoon config to capture D01 ring input

local D01Capture = {}

-- Initialize capture
function D01Capture.init()
    print("🔬 D01 Ring Input Capture Started")
    print("Press buttons on your D01 ring to see events")
    print("Press Cmd+Ctrl+D to stop")
    
    -- Create event tap for all input events
    D01Capture.eventTap = hs.eventtap.new({
        hs.eventtap.event.types.keyDown,
        hs.eventtap.event.types.keyUp,
        hs.eventtap.event.types.systemDefined,
        hs.eventtap.event.types.leftMouseDown,
        hs.eventtap.event.types.leftMouseUp,
        hs.eventtap.event.types.rightMouseDown,
        hs.eventtap.event.types.rightMouseUp,
        hs.eventtap.event.types.mouseMoved
    }, D01Capture.handleEvent)
    
    -- Start capturing
    D01Capture.eventTap:start()
    
    -- Add hotkey to stop
    hs.hotkey.bind({"cmd", "ctrl"}, "d", function()
        D01Capture.stop()
    end)
    
    -- Show alert
    hs.alert.show("D01 Capture Active - Press buttons on ring!", 3)
end

-- Handle captured events
function D01Capture.handleEvent(event)
    local eventType = event:getType()
    local timestamp = os.date("%H:%M:%S")
    
    if eventType == hs.eventtap.event.types.keyDown then
        local keyCode = event:getKeyCode()
        local flags = event:getFlags()
        print(string.format("[%s] 🔴 KEY DOWN: Code=%d, Flags=%s", 
              timestamp, keyCode, hs.inspect(flags)))
        D01Capture.logEvent("KEY_DOWN", keyCode, flags)
        
    elseif eventType == hs.eventtap.event.types.keyUp then
        local keyCode = event:getKeyCode()
        local flags = event:getFlags()
        print(string.format("[%s] 🔵 KEY UP: Code=%d, Flags=%s", 
              timestamp, keyCode, hs.inspect(flags)))
        D01Capture.logEvent("KEY_UP", keyCode, flags)
        
    elseif eventType == hs.eventtap.event.types.systemDefined then
        local systemKey = event:systemKey()
        if systemKey then
            print(string.format("[%s] ⚙️  SYSTEM KEY: Key=%d, Down=%s, Repeat=%s", 
                  timestamp, systemKey.key, tostring(systemKey.down), tostring(systemKey.repeat)))
            D01Capture.logEvent("SYSTEM_KEY", systemKey.key, {down=systemKey.down, repeat=systemKey.repeat})
        end
        
    elseif eventType == hs.eventtap.event.types.leftMouseDown then
        local pos = event:location()
        print(string.format("[%s] 🖱️  LEFT MOUSE DOWN: x=%d, y=%d", 
              timestamp, pos.x, pos.y))
        D01Capture.logEvent("MOUSE_LEFT_DOWN", nil, pos)
        
    elseif eventType == hs.eventtap.event.types.rightMouseDown then
        local pos = event:location()
        print(string.format("[%s] 🖱️  RIGHT MOUSE DOWN: x=%d, y=%d", 
              timestamp, pos.x, pos.y))
        D01Capture.logEvent("MOUSE_RIGHT_DOWN", nil, pos)
        
    elseif eventType == hs.eventtap.event.types.mouseMoved then
        local pos = event:location()
        local deltaX = event:getProperty(hs.eventtap.event.properties.mouseEventDeltaX) or 0
        local deltaY = event:getProperty(hs.eventtap.event.properties.mouseEventDeltaY) or 0
        
        -- Only log if there's significant movement
        if math.abs(deltaX) > 5 or math.abs(deltaY) > 5 then
            print(string.format("[%s] 🖱️  MOUSE MOVE: dx=%d, dy=%d, pos=(%d,%d)", 
                  timestamp, deltaX, deltaY, pos.x, pos.y))
            D01Capture.logEvent("MOUSE_MOVE", nil, {deltaX=deltaX, deltaY=deltaY, pos=pos})
        end
    end
    
    -- Don't consume the event - let it pass through
    return false
end

-- Log events to file
function D01Capture.logEvent(eventType, keyCode, data)
    local logEntry = {
        timestamp = os.time(),
        eventType = eventType,
        keyCode = keyCode,
        data = data
    }
    
    -- Append to log file
    local logFile = io.open(os.getenv("HOME") .. "/d01_capture.log", "a")
    if logFile then
        logFile:write(hs.json.encode(logEntry) .. "\n")
        logFile:close()
    end
end

-- Stop capture
function D01Capture.stop()
    if D01Capture.eventTap then
        D01Capture.eventTap:stop()
        D01Capture.eventTap = nil
    end
    
    print("🛑 D01 Capture Stopped")
    hs.alert.show("D01 Capture Stopped", 2)
    
    -- Show summary
    D01Capture.showSummary()
end

-- Show capture summary
function D01Capture.showSummary()
    local logPath = os.getenv("HOME") .. "/d01_capture.log"
    local logFile = io.open(logPath, "r")
    
    if logFile then
        local eventCount = 0
        local eventTypes = {}
        
        for line in logFile:lines() do
            local success, event = pcall(hs.json.decode, line)
            if success and event then
                eventCount = eventCount + 1
                eventTypes[event.eventType] = (eventTypes[event.eventType] or 0) + 1
            end
        end
        
        logFile:close()
        
        print(string.format("\n📊 CAPTURE SUMMARY:"))
        print(string.format("Total events: %d", eventCount))
        print("Event breakdown:")
        
        for eventType, count in pairs(eventTypes) do
            print(string.format("  %s: %d", eventType, count))
        end
        
        print(string.format("\nLog saved to: %s", logPath))
    end
end

-- Initialize when loaded
D01Capture.init()

return D01Capture