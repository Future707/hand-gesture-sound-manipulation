class AudioVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.audioEngine = null;
        this.particles = [];
        this.waveHistory = [];
        this.animationId = null;
        this.isRunning = false;
    }

    initialize(audioEngine) {
        this.audioEngine = audioEngine;
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    start() {
        this.isRunning = true;
        this.animate();
    }

    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    animate() {
        if (!this.isRunning) return;

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.audioEngine && this.audioEngine.analyser) {
            this.drawWaveform();
            this.drawFrequencyBars();
            this.updateParticles();
        }

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    drawWaveform() {
        const dataArray = this.audioEngine.getAnalyserData();
        if (!dataArray) return;

        const width = this.canvas.width;
        const height = this.canvas.height;
        const bufferLength = dataArray.length;
        const sliceWidth = width / bufferLength;

        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = 'rgba(102, 126, 234, 0.8)';
        this.ctx.beginPath();

        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * height) / 2;

            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        this.ctx.lineTo(width, height / 2);
        this.ctx.stroke();

        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = 'rgba(240, 147, 251, 0.6)';
        this.ctx.beginPath();

        x = 0;
        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * height) / 2 + 10;

            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        this.ctx.lineTo(width, height / 2);
        this.ctx.stroke();
    }

    drawFrequencyBars() {
        if (!this.audioEngine || !this.audioEngine.analyser) return;

        const analyser = this.audioEngine.analyser;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        const width = this.canvas.width;
        const height = this.canvas.height;
        const barCount = 64;
        const barWidth = width / barCount;

        for (let i = 0; i < barCount; i++) {
            const barHeight = (dataArray[i * Math.floor(bufferLength / barCount)] / 255) * (height * 0.4);

            const hue = (i / barCount) * 300 + 200;
            this.ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.6)`;

            this.ctx.fillRect(
                i * barWidth,
                height - barHeight,
                barWidth - 2,
                barHeight
            );

            if (barHeight > height * 0.2) {
                this.createParticle(i * barWidth + barWidth / 2, height - barHeight, hue);
            }
        }
    }

    createParticle(x, y, hue) {
        if (Math.random() > 0.7 && this.particles.length < 100) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 2,
                vy: -Math.random() * 3 - 1,
                life: 1,
                hue: hue,
                size: Math.random() * 3 + 2
            });
        }
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1;
            p.life -= 0.02;

            if (p.life > 0) {
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                this.ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${p.life})`;
                this.ctx.fill();
            } else {
                this.particles.splice(i, 1);
            }
        }
    }

    drawCircularVisualizer(centerX, centerY, radius) {
        const dataArray = this.audioEngine.getAnalyserData();
        if (!dataArray) return;

        const bufferLength = dataArray.length;
        const barCount = 128;
        const angleStep = (Math.PI * 2) / barCount;

        for (let i = 0; i < barCount; i++) {
            const dataIndex = Math.floor((i / barCount) * bufferLength);
            const barHeight = (dataArray[dataIndex] / 255) * radius * 0.5;

            const angle = i * angleStep;
            const x1 = centerX + Math.cos(angle) * radius;
            const y1 = centerY + Math.sin(angle) * radius;
            const x2 = centerX + Math.cos(angle) * (radius + barHeight);
            const y2 = centerY + Math.sin(angle) * (radius + barHeight);

            const hue = (i / barCount) * 360;
            this.ctx.strokeStyle = `hsla(${hue}, 80%, 60%, 0.8)`;
            this.ctx.lineWidth = 3;

            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
        }
    }
}
