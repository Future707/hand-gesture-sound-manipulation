# Technical Documentation

## System Architecture Overview

This document provides in-depth technical details about the Hand Gesture Sound Manipulation system.

## Core Components

### 1. Gesture Detection System (gestureDetector.js)

#### MediaPipe Integration

The system uses MediaPipe Hands, which provides 21 3D hand landmarks per detected hand:

```
Landmark indices:
0: Wrist
1-4: Thumb (base to tip)
5-8: Index finger
9-12: Middle finger
13-16: Ring finger
17-20: Pinky finger
```

#### Gesture Parameters Calculation

**Hand Height**
```javascript
gestureState.handHeight = 1 - wrist.y
```
- Normalized Y-coordinate of wrist (inverted)
- Range: 0 (bottom) to 1 (top)
- Used for: Volume control

**Pinch Distance**
```javascript
const pinchDist = calculateDistance(thumbTip, indexTip)
gestureState.pinchDistance = Math.max(0, Math.min(1, 1 - (pinchDist * 5)))
```
- Euclidean distance between thumb tip and index finger tip
- Scaled and inverted for intuitive control
- Range: 0 (fingers apart) to 1 (fingers pinched)
- Used for: Pitch control

**Hand Rotation**
```javascript
const handVector = { x: indexBase.x - pinkyBase.x, y: indexBase.y - pinkyBase.y }
rotation = (Math.atan2(handVector.y, handVector.x) + Math.PI) / (2 * Math.PI)
```
- Calculates angle between index finger base and pinky base
- Normalized to 0-1 range
- Used for: Filter frequency control

**Palm Openness**
```javascript
const fingerDistances = [/* distances from fingertips to bases */]
const avgFingerExtension = sum(fingerDistances) / fingerDistances.length
gestureState.palmOpenness = Math.min(1, avgFingerExtension * 3)
```
- Average extension of all fingers
- Range: 0 (fist) to 1 (open palm)
- Used for: Percussion triggering

**Two-Hand Distance**
```javascript
const hand1Center = getHandCenter(allHands[0])
const hand2Center = getHandCenter(allHands[1])
gestureState.twoHandsDistance = Math.min(1, distance * 2)
```
- Distance between centers of both hands
- Range: 0 (close together) to 1 (far apart)
- Used for: Effect mix control

#### Performance Optimization

- Uses `requestAnimationFrame` for rendering
- Processes at ~30 FPS for optimal performance
- Caches previous hand data for movement calculations
- Efficient canvas clearing and redrawing

### 2. Audio Engine (audioEngine.js)

#### Web Audio API Architecture

**Audio Context**
- Sample rate: Device default (typically 44.1kHz or 48kHz)
- Latency: Low-latency mode enabled
- State management: Handles suspended/running states

**Node Graph Structure**

```
Sound Sources (Oscillators)
    ↓
Gain Node (Volume)
    ↓
Biquad Filter (Tone shaping)
    ↓
    ├─→ Dry Gain → Master Gain → Output
    └─→ Delay Node ⟲ Feedback
           ↓
        Convolver (Reverb)
           ↓
        Wet Gain → Master Gain
```

#### Sound Synthesis Modes

**Synthesizer Mode**
```javascript
// Oscillator 1: Pure sine wave
osc1.type = 'sine'
osc1.frequency = baseFrequency

// Oscillator 2: Rich harmonics
osc2.type = 'sawtooth'
osc2.frequency = baseFrequency * 2
osc2.gain = 0.3
```

**Ambient Mode**
```javascript
// Multiple layered oscillators
frequencies = [f, f*1.5, f*2, f*3]

// LFO modulation for each oscillator
lfo.frequency = 0.2 + (index * 0.1)
lfoGain.gain = 10 // Hz deviation
```

**Percussion Mode**
- Triggered synthesis (not continuous)
- Frequency sweep: `4 * freq → freq` over 0.1s
- Noise component with highpass filter
- Exponential amplitude envelope

#### Effects Processing

**Biquad Filter**
```javascript
filterNode.type = 'lowpass'
frequency = 200 + (value * 7800) // 200Hz - 8kHz
Q = 1 + (value * 10) // Resonance
```

**Delay Effect**
```javascript
delayTime = 0.1 + (effectMix * 0.4) // 100-500ms
feedback = 0.2 + (effectMix * 0.5) // 20-70%
```

**Convolution Reverb**
```javascript
// Creates impulse response
length = sampleRate * 2 // 2 seconds
impulse[i] = (random * 2 - 1) * pow(1 - i/length, 2)
```

#### Parameter Smoothing

All audio parameter changes use ramping to prevent audio artifacts:

```javascript
parameter.linearRampToValueAtTime(targetValue, audioContext.currentTime + 0.05)
```

### 3. Application Controller (app.js)

#### State Management

**Smoothing Algorithm**
```javascript
smooth(target, current, factor) {
    return current + (target - current) * factor
}
```
- Exponential smoothing for gesture values
- Different factors for different parameters:
  - Volume: 0.15 (fast response)
  - Pitch: 0.2 (moderate)
  - Filter: 0.15 (fast)
  - Effects: 0.1 (slow, smooth transitions)

#### Gesture-to-Audio Mapping

**Volume Mapping**
```javascript
targetVolume = handHeight // Direct 1:1 mapping
volume = pow(targetVolume, 2) // Square for perceptual linearity
```

**Pitch Mapping**
```javascript
frequency = minFreq + (pinchDistance * (maxFreq - minFreq))
// Synth: 220-880 Hz (2 octaves)
// Percussion: 60-400 Hz
```

**Filter Mapping**
```javascript
filterFreq = 200 + (rotation * 7800) // 200Hz - 8kHz
Q = 1 + (rotation * 10) // Resonance increases with rotation
```

**Effect Mix Mapping**
```javascript
dryGain = 1 - twoHandsDistance
wetGain = twoHandsDistance
delayTime = 0.1 + (twoHandsDistance * 0.4)
```

#### Update Loop

```javascript
gestureDetector.onResults → handleGestureUpdate
    ↓
Calculate target values
    ↓
Apply smoothing
    ↓
Update audio engine
    ↓
Update UI
    ↓
Display feedback
```

Frame timing: Synchronized with camera frame rate (~30 FPS)

## Performance Characteristics

### CPU Usage
- Hand tracking: 15-25% (single core)
- Audio synthesis: 5-10% (audio thread)
- Canvas rendering: 5-10%
- Total: ~30-40% of single core

### Memory Usage
- MediaPipe model: ~20MB
- Audio buffers: ~5MB
- Canvas buffers: ~10MB
- Total: ~35-40MB

### Latency
- Camera to gesture detection: ~33ms (30 FPS)
- Gesture to audio parameter: ~5ms (smoothing)
- Audio processing: ~5-10ms (buffer size dependent)
- **Total latency: ~50ms** (imperceptible for musical interaction)

## Coordinate Systems

### MediaPipe Coordinates
- Origin: Top-left corner
- X-axis: 0 (left) to 1 (right)
- Y-axis: 0 (top) to 1 (bottom)
- Z-axis: Depth (negative values = closer to camera)

### Canvas Coordinates
- Origin: Top-left corner
- X-axis: 0 to canvas.width (pixels)
- Y-axis: 0 to canvas.height (pixels)
- Mirrored horizontally for natural interaction

### Audio Frequency Space
- Logarithmic perception (exponential mapping)
- A4 = 440 Hz reference
- Range: 60-8000 Hz (typical usable range)

## Browser Compatibility Details

### Web Audio API Support
- Chrome 34+: Full support
- Firefox 25+: Full support
- Safari 14.1+: Full support
- Edge 79+: Full support

### MediaPipe Requirements
- WebAssembly support required
- WebGL support required
- getUserMedia API for camera access

### CORS and Security
- Requires HTTPS or localhost
- Camera permissions required
- No cookies or external storage used

## Optimization Techniques

### 1. Object Pooling
```javascript
// Reuse oscillators when possible
stopAllOscillators() // Cleanup
// Create new oscillators only when needed
```

### 2. Throttling
```javascript
// Percussion cooldown prevents excessive triggering
percussionCooldown = 200ms
```

### 3. Lazy Initialization
```javascript
// Audio context created only when user clicks start
// Prevents autoplay issues
```

### 4. Parameter Clamping
```javascript
Math.max(0, Math.min(1, value)) // Ensures valid range
```

### 5. Efficient Canvas Updates
```javascript
// Clear only necessary regions
// Draw only when hands detected
```

## Extension Possibilities

### Adding New Gestures

1. Calculate gesture parameters in `gestureDetector.js`:
```javascript
calculateNewGesture(landmarks) {
    // Your calculation logic
    this.gestureState.newParameter = value
}
```

2. Map to audio in `app.js`:
```javascript
handleGestureUpdate(gestureState) {
    const newParam = gestureState.newParameter
    this.audioEngine.updateNewParameter(newParam)
}
```

3. Implement audio control in `audioEngine.js`:
```javascript
updateNewParameter(value) {
    // Modify audio graph
}
```

### Adding Sound Sources

Example: Adding white noise
```javascript
// In audioEngine.js
createNoiseSource() {
    const bufferSize = this.audioContext.sampleRate * 2
    const buffer = this.audioContext.createBuffer(1, bufferSize, sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1
    }
    const noise = this.audioContext.createBufferSource()
    noise.buffer = buffer
    noise.loop = true
    return noise
}
```

### MIDI Integration

Potential implementation:
```javascript
// Use Web MIDI API
if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess().then(midiAccess => {
        // Map gesture parameters to MIDI CC messages
        // Send frequency as MIDI note
        // Send other params as CC
    })
}
```

## Debugging Tips

### Enable Console Logging
```javascript
// In gestureDetector.js
console.log('Gesture State:', this.gestureState)

// In audioEngine.js
console.log('Audio Params:', this.parameters)
```

### Visual Debugging
```javascript
// Draw debug info on canvas
this.canvasCtx.fillText(`Height: ${gestureState.handHeight}`, 10, 30)
```

### Performance Monitoring
```javascript
// Measure frame time
const start = performance.now()
// ... processing ...
const elapsed = performance.now() - start
console.log(`Frame time: ${elapsed}ms`)
```

## Security Considerations

1. **No data transmission**: All processing is local
2. **Camera permissions**: Explicitly requested, user-controlled
3. **No persistent storage**: No localStorage or cookies used
4. **CSP compatible**: No inline scripts or eval()
5. **XSS prevention**: No user-generated content rendered

## Accessibility Notes

Current limitations:
- Requires camera and hand mobility
- Visual-only feedback
- No screen reader support

Potential improvements:
- Audio feedback for gesture recognition
- Keyboard alternative controls
- Voice command integration
- Alternative input methods (MIDI, gamepad)

---

This technical documentation should provide developers with deep understanding of the system architecture and implementation details for customization and extension.
