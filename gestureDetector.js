class GestureDetector {
    constructor() {
        this.hands = null;
        this.camera = null;
        this.onResultsCallback = null;
        this.videoElement = null;
        this.canvasElement = null;
        this.canvasCtx = null;
        this.previousHandData = null;
        this.gestureState = {
            handCount: 0,
            handHeight: 0,
            pinchDistance: 0,
            rotation: 0,
            twoHandsDistance: 0,
            palmOpenness: 0,
            movementSpeed: 0
        };
    }

    async initialize(videoElement, canvasElement) {
        this.videoElement = videoElement;
        this.canvasElement = canvasElement;
        this.canvasCtx = canvasElement.getContext('2d');

        this.hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });

        this.hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7
        });

        this.hands.onResults((results) => this.processResults(results));

        this.camera = new Camera(videoElement, {
            onFrame: async () => {
                await this.hands.send({ image: videoElement });
            },
            width: 1280,
            height: 720
        });

        await this.camera.start();
    }

    processResults(results) {
        this.canvasCtx.save();
        this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

        // Video'nun gerçek render boyutunu hesapla (object-fit: contain nedeniyle)
        const videoWidth = this.videoElement.videoWidth;
        const videoHeight = this.videoElement.videoHeight;
        const containerWidth = this.videoElement.clientWidth;
        const containerHeight = this.videoElement.clientHeight;

        const videoAspect = videoWidth / videoHeight;
        const containerAspect = containerWidth / containerHeight;

        let renderWidth, renderHeight, offsetX, offsetY;

        if (containerAspect > videoAspect) {
            // Container daha geniş - yanlarda siyah bantlar
            renderHeight = containerHeight;
            renderWidth = containerHeight * videoAspect;
            offsetX = (containerWidth - renderWidth) / 2;
            offsetY = 0;
        } else {
            // Container daha dar - üst-altta siyah bantlar
            renderWidth = containerWidth;
            renderHeight = containerWidth / videoAspect;
            offsetX = 0;
            offsetY = (containerHeight - renderHeight) / 2;
        }

        if (this.canvasElement.width !== containerWidth || this.canvasElement.height !== containerHeight) {
            this.canvasElement.width = containerWidth;
            this.canvasElement.height = containerHeight;
        }

        // Offset ve scale'i kaydet
        this.renderOffset = { x: offsetX, y: offsetY };
        this.renderScale = { width: renderWidth, height: renderHeight };

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            this.gestureState.handCount = results.multiHandLandmarks.length;

            for (let i = 0; i < results.multiHandLandmarks.length; i++) {
                const landmarks = results.multiHandLandmarks[i];

                this.drawHand(landmarks);

                if (i === 0) {
                    this.calculateGestureParameters(landmarks, results.multiHandLandmarks);
                }
            }

            this.drawGestureVisuals();
        } else {
            this.gestureState.handCount = 0;
        }

        this.canvasCtx.restore();

        if (this.onResultsCallback) {
            this.onResultsCallback(this.gestureState);
        }

        this.previousHandData = results.multiHandLandmarks;
    }

    calculateGestureParameters(primaryHand, allHands) {
        const wrist = primaryHand[0];
        const thumbTip = primaryHand[4];
        const indexTip = primaryHand[8];
        const middleTip = primaryHand[12];
        const ringTip = primaryHand[16];
        const pinkyTip = primaryHand[20];
        const indexBase = primaryHand[5];
        const pinkyBase = primaryHand[17];

        this.gestureState.handHeight = 1 - wrist.y;

        const pinchDist = this.calculateDistance(thumbTip, indexTip);
        this.gestureState.pinchDistance = Math.max(0, Math.min(1, 1 - (pinchDist * 5)));

        const handVector = {
            x: indexBase.x - pinkyBase.x,
            y: indexBase.y - pinkyBase.y
        };
        let rotation = Math.atan2(handVector.y, handVector.x);
        rotation = (rotation + Math.PI) / (2 * Math.PI);
        this.gestureState.rotation = rotation;

        const fingerDistances = [
            this.calculateDistance(thumbTip, primaryHand[2]),
            this.calculateDistance(indexTip, primaryHand[6]),
            this.calculateDistance(middleTip, primaryHand[10]),
            this.calculateDistance(ringTip, primaryHand[14]),
            this.calculateDistance(pinkyTip, primaryHand[18])
        ];
        const avgFingerExtension = fingerDistances.reduce((a, b) => a + b, 0) / fingerDistances.length;
        this.gestureState.palmOpenness = Math.min(1, avgFingerExtension * 3);

        if (allHands.length === 2) {
            const hand1Center = this.getHandCenter(allHands[0]);
            const hand2Center = this.getHandCenter(allHands[1]);
            const distance = this.calculateDistance(hand1Center, hand2Center);
            this.gestureState.twoHandsDistance = Math.min(1, distance * 2);
        } else {
            this.gestureState.twoHandsDistance = 0;
        }

        if (this.previousHandData && this.previousHandData.length > 0) {
            const prevWrist = this.previousHandData[0][0];
            const movement = this.calculateDistance(wrist, prevWrist);
            this.gestureState.movementSpeed = Math.min(1, movement * 20);
        }
    }

    calculateDistance(point1, point2) {
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        const dz = (point1.z || 0) - (point2.z || 0);
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    getHandCenter(landmarks) {
        const wrist = landmarks[0];
        const middle = landmarks[9];
        return {
            x: (wrist.x + middle.x) / 2,
            y: (wrist.y + middle.y) / 2,
            z: ((wrist.z || 0) + (middle.z || 0)) / 2
        };
    }

    drawHand(landmarks) {
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4],
            [0, 5], [5, 6], [6, 7], [7, 8],
            [5, 9], [9, 10], [10, 11], [11, 12],
            [0, 13], [13, 14], [14, 15], [15, 16],
            [0, 17], [17, 18], [18, 19], [19, 20],
            [9, 13], [13, 17]
        ];

        this.canvasCtx.lineWidth = 3;
        this.canvasCtx.strokeStyle = 'rgba(102, 126, 234, 0.8)';

        const offsetX = this.renderOffset?.x || 0;
        const offsetY = this.renderOffset?.y || 0;
        const scaleWidth = this.renderScale?.width || this.canvasElement.width;
        const scaleHeight = this.renderScale?.height || this.canvasElement.height;

        for (const [start, end] of connections) {
            const startPoint = landmarks[start];
            const endPoint = landmarks[end];

            this.canvasCtx.beginPath();
            this.canvasCtx.moveTo(
                offsetX + ((1 - startPoint.x) * scaleWidth),
                offsetY + (startPoint.y * scaleHeight)
            );
            this.canvasCtx.lineTo(
                offsetX + ((1 - endPoint.x) * scaleWidth),
                offsetY + (endPoint.y * scaleHeight)
            );
            this.canvasCtx.stroke();
        }

        for (const landmark of landmarks) {
            this.canvasCtx.beginPath();
            this.canvasCtx.arc(
                offsetX + ((1 - landmark.x) * scaleWidth),
                offsetY + (landmark.y * scaleHeight),
                5,
                0,
                2 * Math.PI
            );
            this.canvasCtx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            this.canvasCtx.fill();
            this.canvasCtx.strokeStyle = 'rgba(102, 126, 234, 1)';
            this.canvasCtx.lineWidth = 2;
            this.canvasCtx.stroke();
        }
    }

    drawGestureVisuals() {
        const width = this.canvasElement.width;
        const height = this.canvasElement.height;

        this.canvasCtx.fillStyle = 'rgba(102, 126, 234, 0.3)';
        this.canvasCtx.fillRect(
            width - 60,
            height - (this.gestureState.handHeight * height),
            40,
            this.gestureState.handHeight * height
        );

        if (this.gestureState.pinchDistance > 0.5) {
            this.canvasCtx.strokeStyle = 'rgba(118, 75, 162, 0.8)';
            this.canvasCtx.lineWidth = 4;
            this.canvasCtx.beginPath();
            this.canvasCtx.arc(width / 2, height / 2, 50 + (this.gestureState.pinchDistance * 100), 0, 2 * Math.PI);
            this.canvasCtx.stroke();
        }
    }

    setOnResultsCallback(callback) {
        this.onResultsCallback = callback;
    }

    getGestureState() {
        return this.gestureState;
    }

    stop() {
        if (this.camera) {
            this.camera.stop();
        }
    }
}
