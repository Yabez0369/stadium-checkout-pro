import { useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType, type Result } from '@zxing/library';
import { Camera } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { formatCameraAccessError } from '@/lib/cameraSecureContext';
import { hasNativeBarcodeDetector, startNativeBarcodeDetectionLoop } from '@/lib/nativeBarcodeDetector';

interface CameraBarcodeScanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (barcode: string) => void;
}

const decodeHints = new Map<DecodeHintType, unknown>();
decodeHints.set(DecodeHintType.POSSIBLE_FORMATS, [
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.CODE_128,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
  BarcodeFormat.ITF,
]);
/** Improves decode on glare / motion blur (ZXing default scan cadence is tuned separately below). */
decodeHints.set(DecodeHintType.TRY_HARDER, true);

/** @zxing/browser defaults delayBetweenScanAttempts to 500ms — far too slow for live camera scanning. */
const zxingScanOptions = {
  delayBetweenScanAttempts: 75,
  delayBetweenScanSuccess: 150,
} as const;

function pickPreferredDeviceId(devices: MediaDeviceInfo[]): string | undefined {
  const withId = devices.filter((d) => d.deviceId?.length);
  if (withId.length === 0) return undefined;
  const byLabel = withId.find((d) =>
    /back|rear|environment|wide|facing back|camera 0|camera2/i.test(d.label),
  );
  if (byLabel) return byLabel.deviceId;
  return withId[withId.length - 1]?.deviceId;
}

/** Chrome often hides deviceId until after a successful getUserMedia — unlock enumeration. */
async function ensureVideoInputIds(): Promise<void> {
  let devices: MediaDeviceInfo[] = [];
  try {
    devices = await BrowserMultiFormatReader.listVideoInputDevices();
  } catch {
    return;
  }
  if (devices.some((d) => d.deviceId?.length)) return;
  try {
    const s = await navigator.mediaDevices.getUserMedia({ video: true });
    s.getTracks().forEach((t) => t.stop());
  } catch {
    /* permission denied or no camera — caller will surface error */
  }
}

type ScanControls = { stop: () => void };

/**
 * ZXing's decodeFromVideoDevice(undefined) uses facingMode:environment only — that fails on most laptops
 * (no rear camera). Prefer explicit deviceId or generic / user-facing constraints.
 */
async function startContinuousDecode(
  reader: BrowserMultiFormatReader,
  video: HTMLVideoElement,
  onDecode: (result: Result | undefined, err: unknown, scanControls: ScanControls) => void,
): Promise<ScanControls | null> {
  const handheld = isHandheldDevice();

  if (handheld) {
    try {
      return await reader.decodeFromConstraints(
        {
          audio: false,
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        },
        video,
        onDecode,
      );
    } catch {
      /* try simpler */
    }
    try {
      return await reader.decodeFromConstraints(
        { audio: false, video: { facingMode: { ideal: 'environment' } } },
        video,
        onDecode,
      );
    } catch {
      /* fall through to shared fallbacks */
    }
  }

  await ensureVideoInputIds();

  let devices: MediaDeviceInfo[] = [];
  try {
    devices = await BrowserMultiFormatReader.listVideoInputDevices();
  } catch {
    /* ignore */
  }
  const withId = devices.filter((d) => d.deviceId?.length);
  const deviceId = pickPreferredDeviceId(withId) ?? withId[0]?.deviceId;

  if (deviceId) {
    try {
      return await reader.decodeFromVideoDevice(deviceId, video, onDecode);
    } catch {
      /* fall through */
    }
  }

  const fallbacks: MediaStreamConstraints[] = [
    { audio: false, video: { width: { ideal: 1920 }, height: { ideal: 1080 } } },
    { audio: false, video: { width: { ideal: 1280 }, height: { ideal: 720 } } },
    { audio: false, video: { facingMode: { ideal: 'user' } } },
    { audio: false, video: true },
  ];

  for (const constraints of fallbacks) {
    try {
      return await reader.decodeFromConstraints(constraints, video, onDecode);
    } catch {
      /* next */
    }
  }

  return null;
}

/** Phone / tablet — we want rear camera like a handheld scanner */
function isHandheldDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  if (/Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)) return true;
  if (typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1) {
    return /Mobile|Tablet|Android/i.test(ua) || window.matchMedia('(max-width: 1024px)').matches;
  }
  return false;
}

export function CameraBarcodeScanDialog({ open, onOpenChange, onScan }: CameraBarcodeScanDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const nativeStopRef = useRef<(() => void) | null>(null);
  const handledRef = useRef(false);

  useEffect(() => {
    if (!open) {
      handledRef.current = false;
      return;
    }

    handledRef.current = false;

    const stopStream = () => {
      nativeStopRef.current?.();
      nativeStopRef.current = null;
      const c = controlsRef.current;
      controlsRef.current = null;
      if (c) {
        try {
          c.stop();
        } catch {
          /* ignore */
        }
      }
    };

    let cancelled = false;

    const run = async () => {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
      if (cancelled) return;

      let video = videoRef.current;
      if (!video) {
        await new Promise((r) => setTimeout(r, 150));
        video = videoRef.current;
      }
      if (cancelled || !video) {
        toast.error('Camera preview not ready. Close and try again.');
        onOpenChange(false);
        return;
      }

      const reader = new BrowserMultiFormatReader(decodeHints, zxingScanOptions);

      const onDecode = (result: Result | undefined, _err: unknown, scanControls: { stop: () => void }) => {
        if (handledRef.current || !result) return;
        handledRef.current = true;
        nativeStopRef.current?.();
        nativeStopRef.current = null;
        try {
          scanControls.stop();
        } catch {
          /* ignore */
        }
        controlsRef.current = null;
        onScan(result.getText().trim());
        onOpenChange(false);
      };

      try {
        const controls = await startContinuousDecode(reader, video, onDecode);
        if (!controls) {
          throw new Error('No camera constraints matched');
        }
        controlsRef.current = controls;

        /* Chrome/Edge: native BarcodeDetector (fast ML path) — runs on same video stream; ZXing still decodes in parallel */
        if (hasNativeBarcodeDetector()) {
          nativeStopRef.current = startNativeBarcodeDetectionLoop(video, (raw) => {
            if (handledRef.current) return;
            handledRef.current = true;
            nativeStopRef.current?.();
            nativeStopRef.current = null;
            try {
              controlsRef.current?.stop();
            } catch {
              /* ignore */
            }
            controlsRef.current = null;
            onScan(raw.trim());
            onOpenChange(false);
          });
        }
      } catch (err) {
        toast.error(formatCameraAccessError(err));
        onOpenChange(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
      stopStream();
    };
  }, [open, onScan, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-border/40 px-5 py-4 text-left">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Camera className="h-5 w-5 text-primary" />
            Scan with camera
          </DialogTitle>
          <DialogDescription className="text-sm">
            <span className="block sm:inline">
              On your <strong>phone</strong>, the <strong>rear camera</strong> opens for scanning (retail-style).
            </span>{' '}
            <span className="block sm:inline">On a laptop, your built-in webcam is used.</span>
          </DialogDescription>
        </DialogHeader>
        <div className="bg-black px-2 pb-4 pt-2">
          <video
            ref={videoRef}
            className="mx-auto aspect-[4/3] min-h-[200px] w-full rounded-lg bg-black object-cover"
            playsInline
            muted
            autoPlay
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
