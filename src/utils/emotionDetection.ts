import * as faceapi from 'face-api.js';

export class EmotionDetector {
  private static instance: EmotionDetector;
  private initialized = false;
  private modelLoaded: boolean = false;

  private constructor() {}

  static getInstance(): EmotionDetector {
    if (!EmotionDetector.instance) {
      EmotionDetector.instance = new EmotionDetector();
    }
    return EmotionDetector.instance;
  }

  async init() {
    if (this.initialized) return;

    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models')
      ]);
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing emotion detection:', error);
    }
  }

  async detectEmotion(inputData: any) {
    if (!inputData || inputData.length !== 432) {
      console.error('Invalid input data shape. Expected 432 values.');
      return;
    }

    if (!this.initialized) await this.init();

    try {
      const detection = await faceapi
        .detectSingleFace(inputData, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (detection) {
        const expressions = detection.expressions;
        const emotion = Object.entries(expressions).reduce((a, b) => 
          expressions[a] > expressions[b[0]] ? a : b[0]
        );
        return this.getEmotionQuote(emotion);
      }
    } catch (error) {
      console.error('Error detecting emotion:', error);
    }
    
    return "Couldn't detect emotion";
  }

  private getEmotionQuote(emotion: string): string {
    const quotes = {
      happy: "Happiness is contagious! Keep smiling!",
      sad: "Every cloud has a silver lining.",
      angry: "Take a deep breath, this too shall pass.",
      neutral: "Steady as she goes!",
      surprised: "Life is full of wonderful surprises!",
      fearful: "Courage is being scared but doing it anyway.",
      disgusted: "Beauty is in the eye of the beholder."
    };

    return quotes[emotion as keyof typeof quotes] || "Beautiful moment captured!";
  }

  async loadModel() {
    // Load your model here
    // Set modelLoaded to true once the model is successfully loaded
    this.modelLoaded = true; // Example flag
  }

  async forwardInput(input: Tensor) {
    if (!this.modelLoaded) {
        throw new Error('TinyYolov2 - load model before inference');
    }
    // ... existing inference code ...
  }
}

export const emotionDetector = EmotionDetector.getInstance();