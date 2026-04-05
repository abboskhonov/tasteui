import * as p from '@clack/prompts';
import c from 'picocolors';
import { saveConfig, getConfig, DEFAULT_API_URL, type Config } from '../utils/config.js';

export async function configCommand() {
  const currentConfig = await getConfig();

  p.note(
    currentConfig.apiUrl 
      ? `Current API: ${currentConfig.apiUrl}` 
      : 'Using default API: http://localhost:3001',
    'Current Config'
  );

  const apiUrl = await p.text({
    message: 'API URL (optional):',
    placeholder: 'http://localhost:3001',
    initialValue: currentConfig.apiUrl || '',
    validate: (value) => {
      if (value && !value.startsWith('http')) {
        return 'URL must start with http:// or https://';
      }
    },
  });

  if (p.isCancel(apiUrl)) {
    p.outro(c.gray('Configuration cancelled'));
    return;
  }

  const needsAuth = await p.confirm({
    message: 'Do you need to configure authentication token?',
    initialValue: false,
  });

  let token: string | undefined;
  
  if (!p.isCancel(needsAuth) && needsAuth) {
    const tokenInput = await p.password({
      message: 'API Token (optional):',
      mask: '*',
    });
    
    if (!p.isCancel(tokenInput)) {
      token = tokenInput.trim() || undefined;
    }
  }

  const newConfig: Config = {
    apiUrl: apiUrl.trim() || DEFAULT_API_URL,
    token: token || currentConfig.token,
  };

  await saveConfig(newConfig);
  p.outro(c.green('Configuration saved successfully!'));
  console.log();
  console.log(c.gray('Config location:'), c.cyan('~/.config/tokenui/config.yaml'));
}
