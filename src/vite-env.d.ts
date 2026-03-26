/// <reference types="vite/client" />

/** Shape API (Chrome/Edge); optional in TypeScript DOM lib */
interface DetectedBarcode {
  rawValue: string;
  format?: string;
}

declare class BarcodeDetector {
  constructor(barcodeDetectorOptions?: { formats?: string[] });
  detect(image: ImageBitmapSource): Promise<DetectedBarcode[]>;
  static getSupportedFormats(): Promise<string[]>;
}

interface Window {
  BarcodeDetector?: typeof BarcodeDetector;
}

export {};
