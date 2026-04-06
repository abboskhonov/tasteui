import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { homedir, platform, release } from 'os';
import { join } from 'path';
import { createHash } from 'crypto';
import { getConfig, DEFAULT_API_URL } from './config.js';

const CONFIG_DIR = join(homedir(), '.config', 'tokenui');
const TRACKING_FILE = join(CONFIG_DIR, 'tracking.json');

interface TrackingData {
  installId: string;
  firstRunAt: string;
  lastTrackedVersion?: string;
}

// Generate a unique install ID based on machine fingerprint
function generateInstallId(): string {
  // Create a hash based on platform, release, and a random component
  const machineInfo = `${platform()}-${release()}-${process.env.USER || process.env.USERNAME || 'unknown'}`;
  const randomComponent = Math.random().toString(36).substring(2, 15);
  const hash = createHash('sha256')
    .update(`${machineInfo}-${randomComponent}-${Date.now()}`)
    .digest('hex')
    .slice(0, 16);
  return hash;
}

// Get platform hash for analytics
function getPlatformHash(): string {
  const platformInfo = `${platform()}-${release()}-${process.version}`;
  return createHash('sha256')
    .update(platformInfo)
    .digest('hex')
    .slice(0, 16);
}

// Load or create tracking data
function getTrackingData(): TrackingData {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }

  if (existsSync(TRACKING_FILE)) {
    try {
      const content = readFileSync(TRACKING_FILE, 'utf-8');
      return JSON.parse(content) as TrackingData;
    } catch {
      // File exists but is corrupted, create new
    }
  }

  // Create new tracking data
  const data: TrackingData = {
    installId: generateInstallId(),
    firstRunAt: new Date().toISOString(),
  };

  writeFileSync(TRACKING_FILE, JSON.stringify(data, null, 2), 'utf-8');
  return data;
}

// Save tracking data
function saveTrackingData(data: TrackingData): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
  writeFileSync(TRACKING_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Track CLI install - called on every CLI run
export async function trackInstall(version: string): Promise<void> {
  const trackingData = getTrackingData();
  const config = await getConfig();

  // Only track if version changed or first run
  if (trackingData.lastTrackedVersion === version) {
    return;
  }

  try {
    const apiUrl = config.apiUrl || DEFAULT_API_URL;
    const response = await fetch(`${apiUrl}/api/cli/install`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        installId: trackingData.installId,
        version,
        platformHash: getPlatformHash(),
      }),
    });

    if (response.ok) {
      // Update last tracked version
      trackingData.lastTrackedVersion = version;
      saveTrackingData(trackingData);
    }
  } catch {
    // Silently fail - tracking should never break the CLI
  }
}
