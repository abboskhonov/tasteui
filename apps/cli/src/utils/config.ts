import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import yaml from 'yaml';
import c from 'picocolors';

export interface Config {
  apiUrl: string;
  token?: string;  // Optional - only needed for authenticated operations
}

// Default API URL - production
export const DEFAULT_API_URL = 'https://api.tasteui.dev';

const CONFIG_DIR = join(homedir(), '.config', 'tasteui');
const CONFIG_FILE = join(CONFIG_DIR, 'config.yaml');

export async function getConfig(): Promise<Config> {
  if (!existsSync(CONFIG_FILE)) {
    return { apiUrl: DEFAULT_API_URL };
  }

  try {
    const content = readFileSync(CONFIG_FILE, 'utf-8');
    const parsed = yaml.parse(content) || {};
    const apiUrl = parsed.apiUrl || DEFAULT_API_URL;
    
    // Warn about HTTP usage (except for localhost)
    if (apiUrl.startsWith('http://') && !apiUrl.includes('localhost')) {
      console.log(c.yellow('⚠️  Warning: Using HTTP instead of HTTPS for API connection'));
    }
    
    return {
      apiUrl,
      token: parsed.token,
    };
  } catch {
    return { apiUrl: DEFAULT_API_URL };
  }
}

export async function saveConfig(config: Config): Promise<void> {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }

  // Validate URL
  if (config.apiUrl && !config.apiUrl.startsWith('http')) {
    throw new Error('API URL must start with http:// or https://');
  }

  // Warn about HTTP usage (except for localhost)
  if (config.apiUrl && config.apiUrl.startsWith('http://') && !config.apiUrl.includes('localhost')) {
    console.log(c.yellow('⚠️  Warning: Using HTTP instead of HTTPS is not recommended for production'));
  }

  const yamlContent = yaml.stringify(config);
  writeFileSync(CONFIG_FILE, yamlContent, 'utf-8');
}
