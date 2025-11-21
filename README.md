# Hand Gesture Sound Manipulation

An interactive audio manipulation system where hand gestures control sound parameters in real-time, creating an immersive and magical sound experience.

![System Demo](demo-preview.png)

## Features

- **Real-time Hand Tracking**: Uses MediaPipe Hands for accurate hand landmark detection
- **Dynamic Audio Synthesis**: Web Audio API-powered sound engine with multiple synthesis modes
- **Intuitive Gesture Mapping**: Natural hand movements control audio parameters
- **Visual Feedback**: Live video feed with hand tracking visualization
- **Multiple Sound Modes**: Synthesizer, Ambient, and Percussion modes
- **Advanced Audio Effects**: Built-in reverb, delay, and filtering

## Gesture Controls

### Single Hand
- **Hand Height** (Y-axis) → **Volume**: Raise your hand to increase volume, lower to decrease
- **Pinch Distance** (Thumb-Index) → **Pitch**: Pinch fingers together for lower pitch, spread apart for higher pitch
- **Hand Rotation** (Tilt) → **Filter Frequency**: Rotate your hand to control filter cutoff
- **Palm Openness** → **Percussion Trigger**: Open palm quickly to trigger percussion hits (percussion mode only)

### Two Hands
- **Hand Distance** → **Effect Mix**: Move hands apart to increase reverb/delay effects, bring together to decrease
- All single-hand controls remain active on the primary hand

## Installation

### Prerequisites
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Webcam
- Local web server (for security/CORS requirements)

### Quick Start

1. **Clone or download this repository**

2. **Start a local web server**

   Using Python 3:
   ```bash
   python -m http.server 8000
   ```

   Using Python 2:
   ```bash
   python -m SimpleHTTPServer 8000
   ```

   Using Node.js (install `http-server` first):
   ```bash
   npx http-server -p 8000
   ```

   Using PHP:
   ```bash
   php -S localhost:8000
   ```

3. **Open your browser**

   Navigate to: `http://localhost:8000`

4. **Grant camera permissions** when prompted

5. **Click "Start System"** and begin controlling sound with your hands!

## Usage Guide

### Getting Started

1. **Position yourself**: Sit or stand 2-3 feet from your webcam
2. **Lighting**: Ensure good lighting for better hand tracking
3. **Start the system**: Click the "Start System" button
4. **Choose a sound mode**: Select Synthesizer, Ambient, or Percussion
5. **Start making gestures**: Move your hands to control the sound!

### Sound Modes

#### Synthesizer Mode
- Classic synthesizer with dual oscillators
- Rich, harmonic sound
- Great for melodic exploration
- Frequency range: 220-880 Hz

#### Ambient Mode
- Multiple layered tones with LFO modulation
- Ethereal, atmospheric soundscapes
- Perfect for meditative experiences
- Multiple harmonic frequencies

#### Percussion Mode
- Trigger-based sound generation
- Open your palm to create percussion hits
- Pitch controls the tone of hits
- Great for rhythmic patterns

### Tips for Best Results

- **Start with one hand** to get familiar with the controls
- **Make slow, deliberate movements** for precise control
- **Experiment with hand rotation** for interesting filter effects
- **Use two hands** to add depth with reverb and delay
- **Try different sound modes** to discover unique sonic possibilities
- **Adjust your distance** from the camera if tracking feels imprecise

## Technical Architecture

### Components

1. **gestureDetector.js**
   - MediaPipe Hands integration
   - Hand landmark detection and tracking
   - Gesture parameter calculation
   - Visual overlay rendering

2. **audioEngine.js**
   - Web Audio API synthesis
   - Multi-oscillator sound generation
   - Audio effects chain (filter, delay, reverb)
   - Real-time parameter modulation

3. **app.js**
   - Main application controller
   - Gesture-to-audio parameter mapping
   - UI updates and state management
   - Smoothing and interpolation

4. **index.html** & **styles.css**
   - User interface
   - Real-time parameter visualization
   - Responsive design

### Audio Signal Flow

```
Oscillators → Gain → Filter → [Dry/Wet Split]
                                    ↓
                          [Dry] → Master Gain → Output
                                    ↑
                          [Wet] → Delay → Reverb
                                    ↑
                                Feedback
```

### Gesture Processing Pipeline

```
Webcam → MediaPipe → Hand Landmarks → Gesture Calculations
                                            ↓
                                    Smoothing & Mapping
                                            ↓
                                    Audio Parameters
                                            ↓
                                    Web Audio API
```

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 14.5+)
- Opera: Full support

**Note**: HTTPS or localhost is required for webcam access.

## Troubleshooting

### Camera not working
- Check browser permissions for camera access
- Ensure you're running on localhost or HTTPS
- Try a different browser
- Check if another application is using the webcam

### No sound
- Check system volume and browser audio permissions
- Click anywhere on the page to activate audio context (browser security requirement)
- Try refreshing the page and clicking "Start System" again

### Laggy hand tracking
- Close other applications to free up CPU/GPU
- Reduce browser window size
- Ensure good lighting conditions
- Try reducing hand detection complexity in gestureDetector.js

### Hand tracking not accurate
- Improve lighting conditions
- Ensure plain background
- Keep hands within camera frame
- Avoid fast movements initially

## Customization

### Adjust Gesture Sensitivity

Edit the smoothing factors in [app.js:17-22](app.js#L17-L22):

```javascript
this.smoothingFactors = {
    volume: 0.15,   // Lower = more responsive, higher = smoother
    pitch: 0.2,
    filter: 0.15,
    effect: 0.1
};
```

### Modify Frequency Ranges

Edit pitch ranges in [audioEngine.js:218-219](audioEngine.js#L218-L219):

```javascript
const minFreq = this.soundType === 'percussion' ? 60 : 220;
const maxFreq = this.soundType === 'percussion' ? 400 : 880;
```

### Change Effect Parameters

Adjust delay/reverb in [audioEngine.js:256-259](audioEngine.js#L256-L259):

```javascript
this.delayNode.delayTime.value = 0.1 + (value * 0.4);
this.feedbackNode.gain.value = 0.2 + (value * 0.5);
```

## Performance Optimization

- The system uses requestAnimationFrame for smooth rendering
- Audio parameters are smoothed to prevent audio artifacts
- Hand tracking runs at ~30 FPS for optimal performance
- Oscillators are reused when possible to reduce CPU load

## Privacy & Security

- All processing happens locally in your browser
- No video or audio data is transmitted or stored
- Camera feed is used only for hand detection
- No external APIs are called except for MediaPipe model loading

## Future Enhancements

Potential features for future development:
- MIDI output support
- Audio recording/export
- Preset save/load system
- Additional gesture types (swipe, circle, etc.)
- Multi-user support
- VR/AR integration
- Machine learning for custom gesture recognition

## Credits

**Technologies Used:**
- [MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands) by Google
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- Canvas API for visualization

## License

MIT License - Feel free to use, modify, and distribute this project.

## Contributing

Contributions are welcome! Areas for improvement:
- Additional sound synthesis modes
- Custom gesture definitions
- Performance optimizations
- Mobile device support
- Accessibility features

## Support

For issues or questions:
- Check the Troubleshooting section above
- Review browser console for error messages
- Ensure all prerequisites are met

---

**Enjoy creating magical soundscapes with your hands!** ✨🎵
