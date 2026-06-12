// frontend/src/utils/deviceFingerprint.js
/**
 * Generates a stable, unique Device ID for this browser/device.
 * Stored in localStorage so it stays consistent across sessions.
 *
 * Built from: User-Agent + screen resolution + timezone + a random seed
 */

const STORAGE_KEY = 'kasirin_device_id';

function generateFingerprint() {
  const components = [
    navigator.userAgent,
    `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.language,
    navigator.platform || '',
    // Random component to differentiate multiple browsers on the same machine
    Math.random().toString(36).substring(2, 10),
  ];

  // Simple hash of the combined string
  const raw = components.join('|');
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }

  // Return as hex string, combined with timestamp for extra uniqueness
  const hexHash = Math.abs(hash).toString(16).padStart(8, '0');
  const timestamp = Date.now().toString(36);
  return `dev-${hexHash}-${timestamp}`;
}

/**
 * Get the Device ID for the current browser.
 * Creates one if it doesn't exist yet.
 */
export function getDeviceId() {
  let deviceId = localStorage.getItem(STORAGE_KEY);

  if (!deviceId) {
    deviceId = generateFingerprint();
    localStorage.setItem(STORAGE_KEY, deviceId);
  }

  return deviceId;
}

/**
 * Get a short, readable version of the Device ID for display purposes.
 */
export function getShortDeviceId() {
  const full = getDeviceId();
  return full.slice(0, 16) + '...';
}
