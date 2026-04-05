import * as p from '@clack/prompts';
import c from 'picocolors';
import { getConfig, DEFAULT_API_URL } from '../utils/config.js';
import { makeApiRequest } from '../utils/api.js';
import { banner } from '../utils/banner.js';

interface Skill {
  id: string;
  name: string;
  description: string;
  slug: string;
  author: string;
}

export async function listCommand() {
  // Print banner first
  console.log(banner);

  const config = await getConfig();
  
  // Use default API URL if not configured
  const apiUrl = config.apiUrl || DEFAULT_API_URL;

  const spinner = p.spinner();
  spinner.start('Fetching design skills...');

  try {
    // Public endpoint - no auth required, but pass token if available
    const response = await makeApiRequest(`${apiUrl}/api/skills`, config.token);
    spinner.stop(c.green('Skills fetched successfully!'));
    
    // API returns { skills: [...] }
    const skills = (response as { skills?: Skill[] }).skills || [];
    
    if (skills.length === 0) {
      console.log();
      console.log(c.gray('No skills found. Create some designs and publish them!'));
      console.log();
      return;
    }

    // Create options for the select prompt - show owner/slug format
    const options = skills.map((skill) => ({
      value: skill.id,
      label: `${skill.author}/${skill.slug}`,
      hint: `${skill.name} — ${skill.description.slice(0, 35)}${skill.description.length > 35 ? '...' : ''}`,
    }));

    console.log();

    // Let user select a skill
    const selectedSkillId = await p.select({
      message: `Select a skill to view details (${skills.length} available):`,
      options,
    });

    if (p.isCancel(selectedSkillId)) {
      p.outro(c.gray('Cancelled'));
      return;
    }

    // Find the selected skill
    const selectedSkill = skills.find(s => s.id === selectedSkillId);
    
    if (selectedSkill) {
      console.log();
      p.note(
        `${c.bold(selectedSkill.name)}\n` +
        `${c.gray('Author:')} ${selectedSkill.author}\n` +
        `${c.gray('Slug:')} ${selectedSkill.slug}\n` +
        `${c.gray('Install:')} tokenui add ${selectedSkill.author}/${selectedSkill.slug}\n\n` +
        `${selectedSkill.description}`,
        'Selected Skill'
      );
    }
    
  } catch (error) {
    spinner.stop(c.red(`Failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
    console.log();
    console.log(c.gray('Make sure your API is running at:'), c.cyan(apiUrl));
    console.log(c.gray('Run'), c.cyan('tokenui config'), c.gray('to change the API URL.'));
  }
}
