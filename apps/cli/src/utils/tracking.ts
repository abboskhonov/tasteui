import { getConfig, DEFAULT_API_URL } from './config.js';

// Simple anonymous tracking - just a counter, no machine ID, no personal data
export async function trackRun(version: string, command?: string): Promise<void> {
  const config = await getConfig();

  try {
    const apiUrl = config.apiUrl || DEFAULT_API_URL;

    await fetch(`${apiUrl}/api/cli/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version,
        command: command || null,
      }),
    });
    // Fire and forget - no error handling needed
  } catch {
    // Silently fail - tracking should never break the CLI
  }
}

// Track when a specific design is installed via CLI
export async function trackInstall(designId: string): Promise<void> {
  const config = await getConfig();

  try {
    const apiUrl = config.apiUrl || DEFAULT_API_URL;

    await fetch(`${apiUrl}/api/cli/install`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        designId,
      }),
    });
    // Fire and forget - no error handling needed
  } catch {
    // Silently fail - tracking should never break the CLI
  }
}
