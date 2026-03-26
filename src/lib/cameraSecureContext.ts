/**
 * Mobile browsers block getUserMedia on http://LAN-IP. HTTPS or localhost loopback only.
 */
export function needsHttpsForCamera(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.isSecureContext) return false;
  const h = window.location.hostname;
  if (h === 'localhost' || h === '127.0.0.1' || h === '[::1]') return false;
  return true;
}

export function hasGetUserMedia(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
}

/**
 * Call directly from a click/tap handler before opening the scanner dialog.
 * Many browsers only show the permission prompt (or allow access) when getUserMedia runs
 * in the same user-gesture chain — starting the camera in useEffect after a timeout breaks that.
 */
export async function preflightCameraPermission(): Promise<void> {
  if (!hasGetUserMedia()) {
    throw new Error('NO_GETUSERMEDIA');
  }
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  stream.getTracks().forEach((t) => t.stop());
}

export function formatCameraAccessError(err: unknown): string {
  if (needsHttpsForCamera()) {
    return 'Camera needs a secure page. Use http://localhost:5173 on this PC, or npm run dev:share and open the https://… link (not http://192.168…).';
  }
  if (err instanceof Error && err.message === 'NO_GETUSERMEDIA') {
    return 'Camera API unavailable. Use Chrome or Edge on a secure page (HTTPS or localhost).';
  }
  if (err instanceof DOMException) {
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      return 'Camera permission denied. Click the lock or camera icon in the address bar, allow Camera for this site, then try again.';
    }
    if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      return 'No camera detected. Plug in a webcam or enable the built-in camera in Device Manager.';
    }
    if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
      return 'Camera is busy or blocked. Close Teams/Zoom/Camera app, then check Windows Settings → Privacy & security → Camera → allow for Desktop apps and your browser.';
    }
    if (err.name === 'OverconstrainedError') {
      return 'Camera could not start with these settings. Close other apps using the camera and try again.';
    }
  }
  return 'Could not open the camera. Check Windows camera privacy settings and that no other app is using it.';
}
