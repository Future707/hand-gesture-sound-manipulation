# Quick Start Guide 🚀

Get up and running with the enhanced Hand Gesture Sound Manipulation system in 5 minutes!

## Prerequisites

✅ Modern web browser (Chrome, Firefox, Edge)
✅ Webcam
✅ Microphone (for voice mode)
✅ Local web server

## Installation

### Step 1: Start a Web Server

Choose your preferred method:

**Using Python 3:**
```bash
cd "Hand Gesture Sound Manipulation"
python -m http.server 8000
```

**Using Python 2:**
```bash
cd "Hand Gesture Sound Manipulation"
python -m SimpleHTTPServer 8000
```

**Using Node.js:**
```bash
cd "Hand Gesture Sound Manipulation"
npx http-server -p 8000
```

**Using PHP:**
```bash
cd "Hand Gesture Sound Manipulation"
php -S localhost:8000
```

### Step 2: Open Browser

Navigate to: `http://localhost:8000`

### Step 3: Grant Permissions

- Allow camera access when prompted
- (Optional) Allow microphone access for voice mode

## First Use - Sound Generator Mode

1. **Click "Start System"**
   - Wait for camera to initialize
   - Status should show "System Active" (green)

2. **Raise Your Hand**
   - Higher = Louder volume
   - Lower = Quieter volume

3. **Pinch Your Fingers**
   - Fingers together = Lower pitch
   - Fingers apart = Higher pitch

4. **Rotate Your Hand**
   - Changes the filter frequency
   - Creates different tonal colors

5. **Try Different Sounds**
   - Click "Synthesizer", "Ambient", "Theremin", etc.
   - Each has a unique character

## First Use - Voice Mode 🎤

1. **Click "Start System"**

2. **Click "🎤 Voice Mode"**
   - Grant microphone permission
   - Button will turn pink

3. **Speak Into Microphone**
   - Your voice is now the audio source

4. **Try Voice Effects**
   - Click "🤖 Robot" for robotic voice
   - Click "🐿️ Chipmunk" for high-pitched voice
   - Click "👹 Monster" for deep, scary voice
   - Try all 8 effects!

5. **Control Your Voice**
   - Hand height = Volume
   - Pinch = Pitch bend
   - Rotation = Filter
   - Two hands = Reverb/echo

## Adjusting Parameters

Use the sliders for fine control:

- **Pitch Shift**: Change the key (-12 to +12 semitones)
- **Distortion**: Add grit and edge (0-100)
- **Reverb Size**: Control room size (0-100)
- **Vibrato Speed**: How fast the pitch wobbles (0-20 Hz)
- **Vibrato Depth**: How much the pitch wobbles (0-100)
- **Harmonics**: Richness of tone (0-10)

## Recording Your Performance

1. Start making sounds
2. Click "⏺️ Record"
3. Perform your gesture-controlled piece
4. Click "⏹️ Stop Recording"
5. File downloads automatically!

## Fun Things to Try

### 1. Create a Robot Voice
- Enable Voice Mode
- Select "🤖 Robot" effect
- Speak normally
- Rotate hand for extra weirdness

### 2. Make Space Sounds
- Choose "Ambient" or "Theremin"
- Set Reverb Size to 100
- Add Vibrato (Speed: 5, Depth: 50)
- Move hands slowly

### 3. Percussive Rhythms
- Select "Percussion"
- Open your palm quickly to trigger hits
- Use pinch to change pitch
- Create rhythmic patterns

### 4. Underwater Speech
- Voice Mode ON
- Select "🌊 Underwater"
- Speak and gesture
- Sounds like you're submerged!

### 5. Alien Language
- Voice Mode ON
- Select "👽 Alien"
- Speak slowly
- Add two-hand distance for echo

## Common Questions

**Q: Camera not working?**
A: Check browser permissions and ensure no other app is using the webcam.

**Q: No sound?**
A: Click anywhere on the page first (browser security), check system volume.

**Q: Laggy performance?**
A: Close other applications, use Chrome for best performance.

**Q: Microphone not working?**
A: Grant microphone permission, check system settings, try refreshing page.

**Q: How do I save my recordings?**
A: They auto-download as WebM files when you stop recording.

## Gesture Cheat Sheet

| Gesture | Control |
|---------|---------|
| 🖐️ Hand Height | Volume |
| 🤏 Pinch Distance | Pitch |
| 🔄 Hand Rotation | Filter |
| 👐 Two Hands Apart | Effects |
| ✊ Fist | Mute |
| 👋 Wave | Trigger |

## Next Steps

- Read [ENHANCED_FEATURES.md](ENHANCED_FEATURES.md) for detailed feature explanations
- Read [TECHNICAL_DETAILS.md](TECHNICAL_DETAILS.md) for advanced customization
- Experiment with combining effects
- Record and share your creations!

## Tips for Best Results

✨ **Good lighting** improves hand tracking
✨ **Plain background** helps detection
✨ **2-3 feet from camera** is optimal distance
✨ **Start with one hand** to learn basics
✨ **Make slow movements** initially
✨ **Experiment freely** - you can't break anything!

---

**Ready to create amazing sounds with your hands? Let's go!** 🎵✨

For issues or questions, check the main [README.md](README.md)
