/**
 * Browser native BarcodeDetector (Chrome/Edge — built-in ML for barcodes).
 * Camera access is still via getUserMedia on the <video> element; this only reads frames.
 * YOLO-style models are not used here (wrong tool + huge bundle for POS barcodes).
 */

export function hasNativeBarcodeDetector(): boolean {
  return typeof window !== 'undefined' && 'BarcodeDetector' in window;
}

export function startNativeBarcodeDetectionLoop(
  video: HTMLVideoElement,
  onHit: (rawValue: string) => void,
  options?: { intervalMs?: number },
): () => void {
  if (!hasNativeBarcodeDetector() || !window.BarcodeDetector) {
    return () => {};
  }

  /** Default ~12 Hz; BarcodeDetector is relatively cheap on Chromium. */
  const intervalMs = options?.intervalMs ?? 80;
  let stopped = false;

  let detector: BarcodeDetector;
  try {
    /* Omit qr_code — POS scans retail barcodes; QR in the scene often steals the first detection. */
    detector = new window.BarcodeDetector({
      formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e', 'itf'],
    });
  } catch {
    return () => {};
  }

  const id = window.setInterval(() => {
    if (stopped) return;
    if (video.readyState < 2 || video.videoWidth === 0) return;

    void detector
      .detect(video)
      .then((codes) => {
        if (stopped || codes.length === 0) return;
        const raw = codes[0]?.rawValue;
        if (!raw) return;
        stopped = true;
        window.clearInterval(id);
        onHit(raw);
      })
      .catch(() => {
        /* ignore bad frames */
      });
  }, intervalMs);

  return () => {
    stopped = true;
    window.clearInterval(id);
  };
}
