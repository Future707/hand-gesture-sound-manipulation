# Enhanced Features Guide

## 🎭 New Voice Effects System

Transform your voice (or generated sounds) with 8 creative voice effects:

### Available Effects

1. **🤖 Robot** - Robotic, mechanical voice
   - Lowered pitch with heavy distortion
   - Bandpass filter for metallic tone
   - Perfect for sci-fi sounds

2. **🐿️ Chipmunk** - High-pitched, squeaky voice
   - +12 semitones pitch shift
   - Highpass filter
   - Classic cartoon character effect

3. **👹 Monster** - Deep, menacing voice
   - -12 semitones pitch shift
   - Heavy distortion
   - Low vibrato for growling effect
   - Lowpass filter for darkness

4. **👽 Alien** - Otherworldly, weird voice
   - +7 semitones pitch shift
   - Fast vibrato for warbling effect
   - Bandpass filter for strange harmonics

5. **🔊 Echo Cave** - Spacious echo effect
   - Extended delay time (500ms)
   - High feedback for multiple echoes
   - Great for dramatic effects

6. **🌊 Underwater** - Muffled, submerged sound
   - Heavy lowpass filtering
   - Extended reverb
   - Sounds like you're underwater

7. **📞 Telephone** - Classic phone line sound
   - Bandpass filter around 1kHz
   - Moderate distortion
   - Realistic telephone quality

8. **Normal** - Bypass all effects
   - Clean, unprocessed sound
   - Full frequency range

### How to Use Voice Effects

1. Click **"Start System"**
2. Click **"🎤 Voice Mode"** to enable your microphone
3. Select any voice effect from the Voice Effects panel
4. Speak and use hand gestures to modulate your voice!

## 🎙️ Voice Mode

The system now supports **real-time voice manipulation**:

- Use your microphone as the audio source
- Apply any voice effect
- Control parameters with hand gestures
- Volume, pitch shift, filtering all controllable via gestures

### Gesture Controls in Voice Mode

- **Hand Height** → Volume (louder/quieter)
- **Pinch Distance** → Pitch bend (higher/lower)
- **Hand Rotation** → Filter sweep
- **Two Hands Distance** → Effect intensity (reverb/delay)

## 🎹 New Sound Generators

Two additional synthesis modes have been added:

### Theremin
- Pure sine wave oscillator
- Smooth, ethereal tones
- Perfect for expressive melodic playing
- Inspired by the classic electronic instrument

### Choir
- 8 layered voices with slight detuning
- LFO modulation for natural vibrato
- Rich, ensemble sound
- Creates pad-like textures

## ⚙️ Adjustable Parameters

Six new real-time adjustable parameters with sliders:

### 1. Pitch Shift (-12 to +12 semitones)
- Transpose the entire sound up or down
- Independent of gesture-based pitch control
- Combines with hand gestures for extended range
- Great for matching different musical keys

### 2. Distortion (0-100)
- Add harmonic saturation
- From subtle warmth to heavy fuzz
- Works on both synthesized and voice input
- Creates aggressive, edgy tones

### 3. Reverb Size (0-100)
- Controls the reverb decay time
- 0 = small room (0.5 seconds)
- 100 = huge cathedral (3.5 seconds)
- Adjustable in real-time

### 4. Vibrato Speed (0-20 Hz)
- Frequency of pitch oscillation
- Slow (0-3 Hz) = gentle, musical vibrato
- Fast (10-20 Hz) = alien, robotic warble
- Works with all sound modes

### 5. Vibrato Depth (0-100)
- Intensity of pitch modulation
- 0 = no vibrato
- 100 = extreme pitch wobble
- Adds expressiveness to sustained notes

### 6. Harmonics (0-10)
- Number of harmonic overtones (Synth mode)
- More harmonics = richer, fuller sound
- Each harmonic is progressively quieter
- Changes timbral character dramatically

## 📊 Live Waveform Visualizer

A stunning real-time audio visualizer displays:

- **Waveform Display** - Shows the audio signal shape
- **Frequency Bars** - Visual representation of different frequencies
- **Particle Effects** - Dynamic particles that react to audio peaks
- **Color-coded** - Different frequencies shown in different colors

The visualizer appears at the bottom of the video feed and animates in sync with your audio.

## ⏺️ Recording Functionality

Record your gesture-controlled performances:

1. Start the system and create sounds
2. Click **"⏺️ Record"** to start recording
3. Perform with your gestures
4. Click **"⏹️ Stop Recording"** when finished
5. The audio automatically downloads as a WebM file

**Note:** Recording captures everything - your voice (if in voice mode), effects, gestures, and modulations!

## 🎮 Enhanced Gesture Recognition

New gestures added:

### Fist Gesture
- Close your hand into a fist
- Instantly mutes the audio
- Quick way to silence output

### Wave Gesture
- Wave your hand (fast horizontal movement)
- Triggers special events in percussion mode
- Can be used for dramatic effect changes

## 💫 Visual Enhancements

### Particle System
- Particles spawn from frequency peaks
- Float upward with physics simulation
- Fade out gradually
- Color-matched to frequency spectrum

### Smooth Scrollbar
- Custom-styled scrollbar in control panel
- Gradient colors matching the theme
- Smooth scrolling experience

### Animated Buttons
- Microphone button pulses when active
- Record button blinks during recording
- Effect buttons slide on hover
- Visual feedback for all interactions

## 🎯 Usage Tips

### For Voice Manipulation
1. Enable Voice Mode
2. Start with "Normal" effect to hear your raw voice
3. Try "Chipmunk" or "Monster" for dramatic changes
4. Use hand height to control volume dynamically
5. Pinch fingers to pitch-bend your voice up/down

### For Sound Generation
1. Choose a sound type (Synth, Theremin, Choir, etc.)
2. Adjust Harmonics slider for richer tones
3. Add Vibrato for expressive quality
4. Use hand gestures for real-time control
5. Enable effects with two-hand gestures

### For Recording Performances
1. Plan your sound design first
2. Start recording
3. Perform smoothly (visualizer helps timing)
4. Use transitions between effects
5. Stop and download your creation

## 🔧 Advanced Techniques

### Combining Effects
- Start with a voice effect (e.g., Robot)
- Add distortion for edge
- Increase reverb size for space
- Use vibrato for movement
- Control everything with gestures

### Creating Textures
1. Use Ambient or Choir mode
2. Set high reverb size (80+)
3. Add subtle vibrato (depth: 20-40)
4. Use slow hand movements
5. Create evolving soundscapes

### Percussive Sounds
1. Enable Percussion mode
2. Increase distortion for impact
3. Use palm-open gesture to trigger
4. Vary pitch with pinch gesture
5. Layer with echo effects

## 📊 Performance Specifications

- **Latency**: ~50ms (real-time performance)
- **Visualizer FPS**: 60 FPS
- **Max Particles**: 100 simultaneous
- **Audio Quality**: 48kHz sample rate
- **Effect Processing**: Zero-latency parameter changes

## 🎨 Customization Examples

### Creating Your Own Effect Preset

Edit `enhancedAudioEngine.js` to add custom effects:

```javascript
case 'youreffect':
    this.adjustableParams.pitchShift = 5;
    this.adjustableParams.distortion = 25;
    this.filterNode.frequency.value = 1200;
    // Add your parameters here
    break;
```

Then add a button in `index.html`:
```html
<button class="btn btn-effect" data-effect="youreffect">Your Effect</button>
```

## 🌟 Creative Ideas

- **Live Performance**: Use with a projector to create visual+audio shows
- **Sound Design**: Record unique sounds for music production
- **Education**: Teach audio synthesis and signal processing
- **Accessibility**: Control audio without touching anything
- **Gaming**: Create interactive sound effects
- **Meditation**: Generate evolving ambient soundscapes

## 🐛 Troubleshooting New Features

### Voice Mode Not Working
- Grant microphone permissions in browser
- Check system microphone settings
- Try refreshing the page
- Ensure no other app is using the microphone

### Visualizer Not Showing
- Visualizer appears at bottom of video
- Requires audio to be playing
- Check browser hardware acceleration
- Reduce other CPU-intensive tasks

### Effects Sound Distorted
- Lower the Distortion slider
- Reduce overall volume
- Check effect combinations
- Try resetting to "Normal" effect

### Recording Failed
- Ensure system is playing audio
- Check browser recording permissions
- Try a different browser (Chrome recommended)
- Ensure enough disk space

---

**Have fun experimenting with these powerful new features!** 🎵✨

The enhanced system gives you unprecedented control over sound manipulation through intuitive hand gestures combined with professional-grade audio effects.
