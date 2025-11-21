class EnhancedApp {
    constructor() {
        this.gestureDetector = new GestureDetector();
        this.audioEngine = new EnhancedAudioEngine();
        this.visualizer = null;
        this.isRunning = false;
        this.currentSoundType = 'synth';
        this.currentEffect = 'normal';
        this.isVoiceMode = false;
        this.lastPercussionTime = 0;
        this.percussionCooldown = 200;

        this.smoothingFactors = {
            volume: 0.15,
            pitch: 0.2,
            filter: 0.15,
            effect: 0.1
        };

        this.smoothedValues = {
            volume: 0,
            pitch: 0,
            filter: 0,
            effect: 0
        };

        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.videoElement = document.getElementById('webcam');
        this.canvasElement = document.getElementById('canvas');
        this.statusElement = document.getElementById('status');
        this.statusText = document.getElementById('statusText');
        this.gestureFeedback = document.getElementById('gestureFeedback');

        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.micBtn = document.getElementById('micBtn');
        this.recordBtn = document.getElementById('recordBtn');

        this.volumeBar = document.getElementById('volumeBar');
        this.volumeValue = document.getElementById('volumeValue');
        this.pitchBar = document.getElementById('pitchBar');
        this.pitchValue = document.getElementById('pitchValue');
        this.filterBar = document.getElementById('filterBar');
        this.filterValue = document.getElementById('filterValue');
        this.effectBar = document.getElementById('effectBar');
        this.effectValue = document.getElementById('effectValue');

        this.soundButtons = document.querySelectorAll('.btn-sound');
        this.effectButtons = document.querySelectorAll('.btn-effect');

        this.pitchShiftSlider = document.getElementById('pitchShift');
        this.pitchShiftValue = document.getElementById('pitchShiftValue');
        this.distortionSlider = document.getElementById('distortion');
        this.distortionValue = document.getElementById('distortionValue');
        this.reverbSizeSlider = document.getElementById('reverbSize');
        this.reverbSizeValue = document.getElementById('reverbSizeValue');
        this.vibratoSpeedSlider = document.getElementById('vibratoSpeed');
        this.vibratoSpeedValue = document.getElementById('vibratoSpeedValue');
        this.vibratoDepthSlider = document.getElementById('vibratoDepth');
        this.vibratoDepthValue = document.getElementById('vibratoDepthValue');
        this.harmonicsSlider = document.getElementById('harmonics');
        this.harmonicsValue = document.getElementById('harmonicsValue');
    }

    attachEventListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        this.stopBtn.addEventListener('click', () => this.stop());
        this.micBtn.addEventListener('click', () => this.toggleVoiceMode());
        this.recordBtn.addEventListener('click', () => this.toggleRecording());

        this.soundButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.soundButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentSoundType = e.target.dataset.sound;

                if (this.isRunning && !this.isVoiceMode) {
                    this.audioEngine.stop();
                    setTimeout(() => {
                        this.audioEngine.start(this.currentSoundType);
                    }, 100);
                }
            });
        });

        this.effectButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.effectButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentEffect = e.target.dataset.effect;
                this.audioEngine.applyVoiceEffect(this.currentEffect);
                this.showGestureFeedback(`Effect: ${this.currentEffect}`);
            });
        });

        this.pitchShiftSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.pitchShiftValue.textContent = value.toFixed(1);
            this.audioEngine.updatePitchShift(value);
        });

        this.distortionSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.distortionValue.textContent = value;
            this.audioEngine.updateDistortionAmount(value);
        });

        this.reverbSizeSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.reverbSizeValue.textContent = value;
            this.audioEngine.updateReverbSize(value);
        });

        this.vibratoSpeedSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.vibratoSpeedValue.textContent = value.toFixed(1);
            this.audioEngine.updateVibratoSpeed(value);
        });

        this.vibratoDepthSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.vibratoDepthValue.textContent = value;
            this.audioEngine.updateVibratoDepth(value);
        });

        this.harmonicsSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.harmonicsValue.textContent = value;
            this.audioEngine.updateHarmonics(value);
        });
    }

    async start() {
        try {
            this.updateStatus('Initializing camera...', false);
            this.startBtn.disabled = true;

            await this.gestureDetector.initialize(this.videoElement, this.canvasElement);

            this.updateStatus('Initializing audio...', false);
            await this.audioEngine.initialize();

            this.visualizer = new AudioVisualizer('visualizer');
            this.visualizer.initialize(this.audioEngine);
            this.visualizer.start();

            this.gestureDetector.setOnResultsCallback((gestureState) => {
                this.handleGestureUpdate(gestureState);
            });

            this.audioEngine.start(this.currentSoundType);

            this.isRunning = true;
            this.stopBtn.disabled = false;
            this.micBtn.disabled = false;
            this.recordBtn.disabled = false;
            this.updateStatus('System Active', true);

            this.showGestureFeedback('Move your hands to control the sound!');
        } catch (error) {
            console.error('Error starting system:', error);
            this.updateStatus('Error: ' + error.message, false);
            this.startBtn.disabled = false;
        }
    }

    async toggleVoiceMode() {
        if (!this.isVoiceMode) {
            this.updateStatus('Requesting microphone access...', false);

            const success = await this.audioEngine.startVoiceMode();

            if (success) {
                this.isVoiceMode = true;
                this.micBtn.classList.add('active');
                this.updateStatus('Voice Mode Active', true);
                this.showGestureFeedback('Speak and use gestures to manipulate your voice!');

                this.soundButtons.forEach(btn => btn.disabled = true);
            } else {
                this.updateStatus('Microphone access denied', false);
                alert('Please allow microphone access to use voice mode');
            }
        } else {
            this.audioEngine.stopVoiceMode();
            this.isVoiceMode = false;
            this.micBtn.classList.remove('active');
            this.updateStatus('System Active', true);

            this.soundButtons.forEach(btn => btn.disabled = false);
            this.audioEngine.start(this.currentSoundType);
        }
    }

    toggleRecording() {
        if (!this.audioEngine.isRecording) {
            this.audioEngine.startRecording();
            this.recordBtn.classList.add('recording');
            this.recordBtn.textContent = '⏹️ Stop Recording';
            this.showGestureFeedback('Recording started...');
        } else {
            this.audioEngine.stopRecording();
            this.recordBtn.classList.remove('recording');
            this.recordBtn.textContent = '⏺️ Record';
            this.showGestureFeedback('Recording saved!');
        }
    }

    stop() {
        this.isRunning = false;
        this.audioEngine.stop();
        this.gestureDetector.stop();

        if (this.visualizer) {
            this.visualizer.stop();
        }

        this.stopBtn.disabled = true;
        this.micBtn.disabled = true;
        this.recordBtn.disabled = true;
        this.startBtn.disabled = false;

        this.micBtn.classList.remove('active');
        this.recordBtn.classList.remove('recording');
        this.recordBtn.textContent = '⏺️ Record';

        this.isVoiceMode = false;
        this.updateStatus('System Stopped', false);
        this.showGestureFeedback('');

        this.resetUI();
    }

    handleGestureUpdate(gestureState) {
        if (!this.isRunning) return;

        let feedbackText = '';

        if (gestureState.handCount === 0) {
            this.smoothedValues.volume = this.smooth(0, this.smoothedValues.volume, this.smoothingFactors.volume);
            this.audioEngine.updateVolume(this.smoothedValues.volume);
            feedbackText = this.isVoiceMode ? 'No hands detected - Speak!' : 'No hands detected';
        } else if (gestureState.handCount === 1) {
            const targetVolume = this.mapGestureToParameter(gestureState.handHeight, 0, 1);
            this.smoothedValues.volume = this.smooth(targetVolume, this.smoothedValues.volume, this.smoothingFactors.volume);
            this.audioEngine.updateVolume(this.smoothedValues.volume);

            const targetPitch = this.mapGestureToParameter(gestureState.pinchDistance, 0, 1);
            this.smoothedValues.pitch = this.smooth(targetPitch, this.smoothedValues.pitch, this.smoothingFactors.pitch);
            this.audioEngine.updatePitch(this.smoothedValues.pitch);

            const targetFilter = this.mapGestureToParameter(gestureState.rotation, 0, 1);
            this.smoothedValues.filter = this.smooth(targetFilter, this.smoothedValues.filter, this.smoothingFactors.filter);
            this.audioEngine.updateFilter(this.smoothedValues.filter);

            if (this.currentSoundType === 'percussion' && gestureState.palmOpenness > 0.7) {
                const now = Date.now();
                if (now - this.lastPercussionTime > this.percussionCooldown) {
                    this.audioEngine.triggerPercussionHit();
                    this.lastPercussionTime = now;
                }
            }

            feedbackText = `
                <div><strong>Hands:</strong> 1 ${this.isVoiceMode ? '🎤' : '🎵'}</div>
                <div><strong>Volume:</strong> ${Math.round(this.smoothedValues.volume * 100)}%</div>
                <div><strong>Pitch:</strong> ${Math.round(this.smoothedValues.pitch * 100)}%</div>
                <div><strong>Filter:</strong> ${Math.round(this.smoothedValues.filter * 100)}%</div>
                ${this.isVoiceMode ? '<div><strong>Effect:</strong> ' + this.currentEffect + '</div>' : ''}
            `;
        } else if (gestureState.handCount === 2) {
            const targetVolume = this.mapGestureToParameter(gestureState.handHeight, 0, 1);
            this.smoothedValues.volume = this.smooth(targetVolume, this.smoothedValues.volume, this.smoothingFactors.volume);
            this.audioEngine.updateVolume(this.smoothedValues.volume);

            const targetPitch = this.mapGestureToParameter(gestureState.pinchDistance, 0, 1);
            this.smoothedValues.pitch = this.smooth(targetPitch, this.smoothedValues.pitch, this.smoothingFactors.pitch);
            this.audioEngine.updatePitch(this.smoothedValues.pitch);

            const targetFilter = this.mapGestureToParameter(gestureState.rotation, 0, 1);
            this.smoothedValues.filter = this.smooth(targetFilter, this.smoothedValues.filter, this.smoothingFactors.filter);
            this.audioEngine.updateFilter(this.smoothedValues.filter);

            const targetEffect = this.mapGestureToParameter(gestureState.twoHandsDistance, 0, 1);
            this.smoothedValues.effect = this.smooth(targetEffect, this.smoothedValues.effect, this.smoothingFactors.effect);
            this.audioEngine.updateEffectMix(this.smoothedValues.effect);

            feedbackText = `
                <div><strong>Hands:</strong> 2 ${this.isVoiceMode ? '🎤' : '🎵'}</div>
                <div><strong>Volume:</strong> ${Math.round(this.smoothedValues.volume * 100)}%</div>
                <div><strong>Pitch:</strong> ${Math.round(this.smoothedValues.pitch * 100)}%</div>
                <div><strong>Filter:</strong> ${Math.round(this.smoothedValues.filter * 100)}%</div>
                <div><strong>Effects:</strong> ${Math.round(this.smoothedValues.effect * 100)}%</div>
                ${this.isVoiceMode ? '<div><strong>Voice Effect:</strong> ' + this.currentEffect + '</div>' : ''}
            `;
        }

        this.updateUI();
        this.showGestureFeedback(feedbackText);
    }

    mapGestureToParameter(value, min, max) {
        const normalized = Math.max(0, Math.min(1, value));
        return min + (normalized * (max - min));
    }

    smooth(target, current, factor) {
        return current + (target - current) * factor;
    }

    updateUI() {
        const params = this.audioEngine.getParameters();

        this.volumeBar.style.width = `${params.volume * 100}%`;
        this.volumeValue.textContent = `${Math.round(params.volume * 100)}%`;

        this.applyShakeEffect(params.volume);

        const minFreq = this.currentSoundType === 'percussion' ? 60 : 220;
        const maxFreq = this.currentSoundType === 'percussion' ? 400 : 880;
        const frequency = minFreq + (params.pitch * (maxFreq - minFreq));

        this.pitchBar.style.width = `${params.pitch * 100}%`;
        this.pitchValue.textContent = `${Math.round(frequency)} Hz`;

        const minFilterFreq = 200;
        const maxFilterFreq = 8000;
        const filterFreq = minFilterFreq + (params.filter * (maxFilterFreq - minFilterFreq));

        this.filterBar.style.width = `${params.filter * 100}%`;
        this.filterValue.textContent = `${Math.round(filterFreq)} Hz`;

        this.effectBar.style.width = `${params.effectMix * 100}%`;
        this.effectValue.textContent = `${Math.round(params.effectMix * 100)}%`;
    }

    applyShakeEffect(volume) {
        document.body.classList.remove('shake-1', 'shake-2', 'shake-3');

        if (volume < 0.6) {
            return;
        }

        if (volume >= 0.85) {
            document.body.classList.add('shake-3');
        } else if (volume >= 0.72) {
            document.body.classList.add('shake-2');
        } else {
            document.body.classList.add('shake-1');
        }
    }

    resetUI() {
        this.volumeBar.style.width = '0%';
        this.volumeValue.textContent = '0%';
        this.pitchBar.style.width = '0%';
        this.pitchValue.textContent = '0 Hz';
        this.filterBar.style.width = '0%';
        this.filterValue.textContent = '0 Hz';
        this.effectBar.style.width = '0%';
        this.effectValue.textContent = '0%';
    }

    updateStatus(text, isActive) {
        this.statusText.textContent = text;
        if (isActive) {
            this.statusElement.classList.add('active');
        } else {
            this.statusElement.classList.remove('active');
        }
    }

    showGestureFeedback(text) {
        this.gestureFeedback.innerHTML = text;
    }
}

let app;

window.addEventListener('load', () => {
    app = new EnhancedApp();
});

window.addEventListener('beforeunload', () => {
    if (app && app.isRunning) {
        app.stop();
    }
});
