// Version is hardcoded here because package.json won't be available after npm install
// Update this when publishing new versions
export const VERSION = '1.0.0';

export function getVersion(): string {
  return VERSION;
}
