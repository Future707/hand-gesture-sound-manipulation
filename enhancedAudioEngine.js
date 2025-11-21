class EnhancedAudioEngine {
    constructor() {
        this.audioContext = null;
        this.isPlaying = false;
        this.soundType = 'synth';
        this.currentEffect = 'normal';
        this.isVoiceMode = false;
        this.isRecording = false;

        this.microphone = null;
        this.micStream = null;
        this.mediaRecorder = null;
        this.recordedChunks = [];

        this.oscillators = [];
        this.lfos = [];

        this.inputNode = null;
        this.gainNode = null;
        this.masterGain = null;

        this.pitchShifter = null;
        this.distortionNode = null;
        this.filterNode = null;
        this.vibratoLFO = null;
        this.vibratoGain = null;
        this.reverbNode = null;
        this.delayNode = null;
        this.feedbackNode = null;
        this.dryGainNode = null;
        this.wetGainNode = null;

        this.analyser = null;
        this.dataArray = null;

        this.currentFrequency = 440;
        this.baseFrequency = 440;

        this.adjustableParams = {
            pitchShift: 0,
            distortion: 0,
            reverbSize: 50,
            vibratoSpeed: 5,
            vibratoDepth: 0,
            harmonics: 2
        };

        this.parameters = {
            volume: 0,
            pitch: 0,
            filter: 0,
            effectMix: 0
        };
    }

    async initialize() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 0;

        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = 0;

        this.filterNode = this.audioContext.createBiquadFilter();
        this.filterNode.type = 'lowpass';
        this.filterNode.frequency.value = 2000;
        this.filterNode.Q.value = 1;

        this.distortionNode = this.audioContext.createWaveShaper();
        this.updateDistortion(0);

        this.vibratoLFO = this.audioContext.createOscillator();
        this.vibratoLFO.frequency.value = 5;
        this.vibratoGain = this.audioContext.createGain();
        this.vibratoGain.gain.value = 0;
        this.vibratoLFO.connect(this.vibratoGain);
        this.vibratoLFO.start();

        this.dryGainNode = this.audioContext.createGain();
        this.dryGainNode.gain.value = 1;

        this.wetGainNode = this.audioContext.createGain();
        this.wetGainNode.gain.value = 0;

        this.delayNode = this.audioContext.createDelay(2.0);
        this.delayNode.delayTime.value = 0.3;

        this.feedbackNode = this.audioContext.createGain();
        this.feedbackNode.gain.value = 0.4;

        this.reverbNode = this.createReverb(this.adjustableParams.reverbSize / 100);

        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

        this.setupAudioGraph();
    }

    setupAudioGraph() {
        this.gainNode.connect(this.distortionNode);
        this.distortionNode.connect(this.filterNode);

        this.filterNode.connect(this.dryGainNode);
        this.dryGainNode.connect(this.analyser);

        this.filterNode.connect(this.delayNode);
        this.delayNode.connect(this.feedbackNode);
        this.feedbackNode.connect(this.delayNode);
        this.delayNode.connect(this.reverbNode);
        this.reverbNode.connect(this.wetGainNode);
        this.wetGainNode.connect(this.analyser);

        this.analyser.connect(this.masterGain);
        this.masterGain.connect(this.audioContext.destination);
    }

    createReverb(size = 0.5) {
        const convolver = this.audioContext.createConvolver();
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * (0.5 + size * 3);
        const impulse = this.audioContext.createBuffer(2, length, sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                const decay = Math.pow(1 - i / length, 2);
                channelData[i] = (Math.random() * 2 - 1) * decay;
            }
        }

        convolver.buffer = impulse;
        return convolver;
    }

    updateDistortion(amount) {
        const samples = 44100;
        const curve = new Float32Array(samples);
        const deg = Math.PI / 180;
        const intensity = amount / 100;

        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            if (intensity === 0) {
                curve[i] = x;
            } else {
                curve[i] = ((3 + intensity) * x * 20 * deg) / (Math.PI + intensity * Math.abs(x));
            }
        }
        this.distortionNode.curve = curve;
    }

    async startVoiceMode() {
        try {
            this.micStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false
                }
            });

            this.microphone = this.audioContext.createMediaStreamSource(this.micStream);

            this.disconnectSynthSources();

            this.microphone.connect(this.gainNode);
            this.isVoiceMode = true;
            this.isPlaying = true;

            return true;
        } catch (error) {
            console.error('Microphone access denied:', error);
            return false;
        }
    }

    stopVoiceMode() {
        if (this.microphone) {
            this.microphone.disconnect();
            this.microphone = null;
        }
        if (this.micStream) {
            this.micStream.getTracks().forEach(track => track.stop());
            this.micStream = null;
        }
        this.isVoiceMode = false;
    }

    async startRecording() {
        if (!this.audioContext) return false;

        try {
            const dest = this.audioContext.createMediaStreamDestination();
            this.masterGain.connect(dest);

            this.mediaRecorder = new MediaRecorder(dest.stream);
            this.recordedChunks = [];

            this.mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    this.recordedChunks.push(e.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `gesture-sound-${Date.now()}.webm`;
                a.click();
            };

            this.mediaRecorder.start();
            this.isRecording = true;
            return true;
        } catch (error) {
            console.error('Recording failed:', error);
            return false;
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
        }
    }

    applyVoiceEffect(effectName) {
        this.currentEffect = effectName;

        switch (effectName) {
            case 'normal':
                this.resetEffectParams();
                break;
            case 'robot':
                this.adjustableParams.pitchShift = -2;
                this.adjustableParams.distortion = 40;
                this.adjustableParams.vibratoSpeed = 0;
                this.filterNode.type = 'bandpass';
                this.filterNode.frequency.value = 800;
                this.filterNode.Q.value = 10;
                break;
            case 'chipmunk':
                this.adjustableParams.pitchShift = 12;
                this.adjustableParams.distortion = 0;
                this.filterNode.type = 'highpass';
                this.filterNode.frequency.value = 500;
                break;
            case 'monster':
                this.adjustableParams.pitchShift = -12;
                this.adjustableParams.distortion = 60;
                this.adjustableParams.vibratoSpeed = 3;
                this.adjustableParams.vibratoDepth = 50;
                this.filterNode.type = 'lowpass';
                this.filterNode.frequency.value = 300;
                break;
            case 'alien':
                this.adjustableParams.pitchShift = 7;
                this.adjustableParams.distortion = 30;
                this.adjustableParams.vibratoSpeed = 15;
                this.adjustableParams.vibratoDepth = 80;
                this.filterNode.type = 'bandpass';
                this.filterNode.frequency.value = 1500;
                break;
            case 'echo':
                this.delayNode.delayTime.value = 0.5;
                this.feedbackNode.gain.value = 0.7;
                this.wetGainNode.gain.value = 0.8;
                this.dryGainNode.gain.value = 0.5;
                break;
            case 'underwater':
                this.filterNode.type = 'lowpass';
                this.filterNode.frequency.value = 400;
                this.filterNode.Q.value = 5;
                this.adjustableParams.reverbSize = 80;
                this.updateReverbSize(80);
                this.wetGainNode.gain.value = 0.7;
                break;
            case 'telephone':
                this.filterNode.type = 'bandpass';
                this.filterNode.frequency.value = 1000;
                this.filterNode.Q.value = 2;
                this.adjustableParams.distortion = 20;
                this.updateDistortion(20);
                break;
        }

        this.updateDistortion(this.adjustableParams.distortion);
        this.updateVibrato();
    }

    resetEffectParams() {
        this.filterNode.type = 'lowpass';
        this.filterNode.frequency.value = 2000;
        this.filterNode.Q.value = 1;
        this.adjustableParams.pitchShift = 0;
        this.adjustableParams.distortion = 0;
        this.adjustableParams.vibratoSpeed = 5;
        this.adjustableParams.vibratoDepth = 0;
        this.updateDistortion(0);
        this.updateVibrato();
    }

    start(soundType = 'synth') {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        this.soundType = soundType;
        this.isPlaying = true;

        this.stopAllOscillators();

        if (!this.isVoiceMode) {
            switch (soundType) {
                case 'synth':
                    this.startSynthSound();
                    break;
                case 'ambient':
                    this.startAmbientSound();
                    break;
                case 'percussion':
                    this.startPercussionSound();
                    break;
                case 'theremin':
                    this.startThereminSound();
                    break;
                case 'choir':
                    this.startChoirSound();
                    break;
            }
        }
    }

    startSynthSound() {
        const harmCount = Math.floor(this.adjustableParams.harmonics);

        for (let i = 0; i < harmCount; i++) {
            const osc = this.audioContext.createOscillator();
            osc.type = i === 0 ? 'sawtooth' : 'sine';
            osc.frequency.value = this.currentFrequency * (i + 1);

            const oscGain = this.audioContext.createGain();
            oscGain.gain.value = (1 / (i + 1)) * 0.3;

            this.vibratoGain.connect(osc.frequency);

            osc.connect(oscGain);
            oscGain.connect(this.gainNode);
            osc.start();

            this.oscillators.push(osc);
        }
    }

    startAmbientSound() {
        const frequencies = [1, 1.5, 2, 2.5, 3, 4];

        frequencies.forEach((mult, index) => {
            const osc = this.audioContext.createOscillator();
            osc.type = ['sine', 'triangle', 'sine', 'triangle', 'sine', 'triangle'][index];
            osc.frequency.value = this.currentFrequency * mult;

            const oscGain = this.audioContext.createGain();
            oscGain.gain.value = 0.1 / (index + 1);

            const lfo = this.audioContext.createOscillator();
            lfo.type = 'sine';
            lfo.frequency.value = 0.1 + (index * 0.05);

            const lfoGain = this.audioContext.createGain();
            lfoGain.gain.value = 15;

            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);

            osc.connect(oscGain);
            oscGain.connect(this.gainNode);

            osc.start();
            lfo.start();

            this.oscillators.push(osc);
            this.lfos.push(lfo);
        });
    }

    startThereminSound() {
        const osc = this.audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = this.currentFrequency;

        this.vibratoGain.connect(osc.frequency);

        osc.connect(this.gainNode);
        osc.start();

        this.oscillators.push(osc);
    }

    startChoirSound() {
        const voices = 8;
        for (let i = 0; i < voices; i++) {
            const detune = (Math.random() - 0.5) * 20;
            const osc = this.audioContext.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = this.currentFrequency;
            osc.detune.value = detune;

            const oscGain = this.audioContext.createGain();
            oscGain.gain.value = 0.1;

            const lfo = this.audioContext.createOscillator();
            lfo.type = 'sine';
            lfo.frequency.value = 0.5 + Math.random() * 0.5;

            const lfoGain = this.audioContext.createGain();
            lfoGain.gain.value = 5;

            lfo.connect(lfoGain);
            lfoGain.connect(oscGain.gain);

            osc.connect(oscGain);
            oscGain.connect(this.gainNode);

            osc.start();
            lfo.start();

            this.oscillators.push(osc);
            this.lfos.push(lfo);
        }
    }

    startPercussionSound() {
        this.baseFrequency = 100;
        this.updateFrequency(this.parameters.pitch);
    }

    triggerPercussionHit() {
        if (!this.isPlaying || this.soundType !== 'percussion') return;

        const now = this.audioContext.currentTime;

        const osc = this.audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(this.currentFrequency * 4, now);
        osc.frequency.exponentialRampToValueAtTime(this.currentFrequency, now + 0.1);

        const noise = this.createNoiseBuffer();

        const percGain = this.audioContext.createGain();
        percGain.gain.setValueAtTime(0.8, now);
        percGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        osc.connect(percGain);
        noise.connect(percGain);
        percGain.connect(this.gainNode);

        osc.start(now);
        noise.start(now);
        osc.stop(now + 0.3);
        noise.stop(now + 0.1);
    }

    createNoiseBuffer() {
        const bufferSize = this.audioContext.sampleRate * 0.1;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;

        const noiseFilter = this.audioContext.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 2000;

        noise.connect(noiseFilter);

        return noiseFilter;
    }

    updateVolume(value) {
        this.parameters.volume = value;
        const volume = Math.pow(value, 2);
        this.gainNode.gain.linearRampToValueAtTime(
            volume,
            this.audioContext.currentTime + 0.05
        );
        this.masterGain.gain.linearRampToValueAtTime(
            volume * 0.6,
            this.audioContext.currentTime + 0.05
        );
    }

    updatePitch(value) {
        this.parameters.pitch = value;
        this.updateFrequency(value);
    }

    updateFrequency(pitchValue) {
        const minFreq = this.soundType === 'percussion' ? 60 : 220;
        const maxFreq = this.soundType === 'percussion' ? 400 : 880;

        let targetFreq = minFreq + (pitchValue * (maxFreq - minFreq));

        const pitchShiftMult = Math.pow(2, this.adjustableParams.pitchShift / 12);
        targetFreq *= pitchShiftMult;

        this.currentFrequency = targetFreq;

        if (this.soundType !== 'percussion' && !this.isVoiceMode) {
            this.oscillators.forEach((osc, index) => {
                if (osc.frequency) {
                    let multiplier = 1;

                    switch (this.soundType) {
                        case 'ambient':
                            multiplier = [1, 1.5, 2, 2.5, 3, 4][index] || 1;
                            break;
                        case 'synth':
                            multiplier = index + 1;
                            break;
                        case 'theremin':
                            multiplier = 1;
                            break;
                        case 'choir':
                            multiplier = 1;
                            break;
                    }

                    osc.frequency.linearRampToValueAtTime(
                        this.currentFrequency * multiplier,
                        this.audioContext.currentTime + 0.05
                    );
                }
            });
        }
    }

    updateFilter(value) {
        this.parameters.filter = value;

        if (this.currentEffect !== 'normal') return;

        const minFreq = 200;
        const maxFreq = 8000;

        const frequency = minFreq + (value * (maxFreq - minFreq));
        this.filterNode.frequency.linearRampToValueAtTime(
            frequency,
            this.audioContext.currentTime + 0.05
        );

        this.filterNode.Q.value = 1 + (value * 10);
    }

    updateEffectMix(value) {
        this.parameters.effectMix = value;

        this.dryGainNode.gain.linearRampToValueAtTime(
            1 - value,
            this.audioContext.currentTime + 0.1
        );

        this.wetGainNode.gain.linearRampToValueAtTime(
            value,
            this.audioContext.currentTime + 0.1
        );

        this.delayNode.delayTime.value = 0.1 + (value * 0.4);
        this.feedbackNode.gain.value = 0.2 + (value * 0.5);
    }

    updatePitchShift(value) {
        this.adjustableParams.pitchShift = value;
        this.updateFrequency(this.parameters.pitch);
    }

    updateDistortionAmount(value) {
        this.adjustableParams.distortion = value;
        this.updateDistortion(value);
    }

    updateReverbSize(value) {
        this.adjustableParams.reverbSize = value;

        this.reverbNode.disconnect();
        this.reverbNode = this.createReverb(value / 100);
        this.delayNode.connect(this.reverbNode);
        this.reverbNode.connect(this.wetGainNode);
    }

    updateVibratoSpeed(value) {
        this.adjustableParams.vibratoSpeed = value;
        this.vibratoLFO.frequency.value = value;
    }

    updateVibratoDepth(value) {
        this.adjustableParams.vibratoDepth = value;
        this.vibratoGain.gain.value = value / 10;
    }

    updateVibrato() {
        this.vibratoLFO.frequency.value = this.adjustableParams.vibratoSpeed;
        this.vibratoGain.gain.value = this.adjustableParams.vibratoDepth / 10;
    }

    updateHarmonics(value) {
        this.adjustableParams.harmonics = value;
        if (this.soundType === 'synth' && !this.isVoiceMode) {
            this.stopAllOscillators();
            this.startSynthSound();
        }
    }

    disconnectSynthSources() {
        this.stopAllOscillators();
    }

    stopAllOscillators() {
        this.oscillators.forEach(osc => {
            try {
                osc.disconnect();
                osc.stop();
            } catch (e) {}
        });
        this.lfos.forEach(lfo => {
            try {
                lfo.disconnect();
                lfo.stop();
            } catch (e) {}
        });
        this.oscillators = [];
        this.lfos = [];
    }

    stop() {
        this.isPlaying = false;

        if (this.isVoiceMode) {
            this.stopVoiceMode();
        }

        this.stopAllOscillators();

        this.gainNode.gain.linearRampToValueAtTime(
            0,
            this.audioContext.currentTime + 0.1
        );
        this.masterGain.gain.linearRampToValueAtTime(
            0,
            this.audioContext.currentTime + 0.1
        );
    }

    getAnalyserData() {
        if (this.analyser) {
            this.analyser.getByteTimeDomainData(this.dataArray);
            return this.dataArray;
        }
        return null;
    }

    getParameters() {
        return this.parameters;
    }

    getAdjustableParams() {
        return this.adjustableParams;
    }
}
