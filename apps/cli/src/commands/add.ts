import * as p from '@clack/prompts';
import c from 'picocolors';
import { getConfig, DEFAULT_API_URL } from '../utils/config.js';
import { makeApiRequest } from '../utils/api.js';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { banner } from '../utils/banner.js';

// File node type matching the web app
interface FileNode {
  id: string;
  name: string;
  path: string;
  content: string;
  type: "file" | "folder";
  isOpen?: boolean;
  children?: FileNode[];
}

interface SkillDetail {
  id: string;
  name: string;
  description: string;
  slug: string;
  content: string;
  files: FileNode[] | null;
  demoUrl: string | null;
  thumbnailUrl: string | null;
  category: string;
  author: string | { name: string; username: string; image?: string };
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

// Additional agent configurations (optional installs)
const ADDITIONAL_AGENTS = [
  { id: 'claude-code', name: 'Claude Code', localPath: '.claude/skills' },
  { id: 'cursor', name: 'Cursor', localPath: '.cursor/skills' },
  { id: 'cline', name: 'Cline', localPath: '.cline/skills' },
  { id: 'windsurf', name: 'Windsurf', localPath: '.windsurf/skills' },
  { id: 'continue', name: 'Continue', localPath: '.continue/skills' },
  { id: 'github-copilot', name: 'GitHub Copilot', localPath: '.copilot/skills' },
];

// Sanitize skill name for safe file system usage
function sanitizeSkillName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')   // Replace non-alphanumeric chars with hyphens
    .replace(/-+/g, '-')            // Collapse multiple hyphens
    .replace(/^-|-$/g, '');         // Trim leading/trailing hyphens
}

// Recursively write files and folders from file tree
function writeFileTree(
  baseDir: string,
  files: FileNode[],
  installedPaths: string[]
): void {
  for (const node of files) {
    const nodePath = join(baseDir, node.path);

    if (node.type === "folder") {
      // Create folder
      if (!existsSync(nodePath)) {
        mkdirSync(nodePath, { recursive: true });
      }
      installedPaths.push(nodePath);

      // Recursively process children
      if (node.children && node.children.length > 0) {
        writeFileTree(baseDir, node.children, installedPaths);
      }
    } else {
      // Create parent directories if needed
      const parentDir = dirname(nodePath);
      if (!existsSync(parentDir)) {
        mkdirSync(parentDir, { recursive: true });
      }

      // Write file
      writeFileSync(nodePath, node.content, 'utf-8');
      installedPaths.push(nodePath);
    }
  }
}

// Get all files count from file tree
function countFiles(files: FileNode[]): number {
  let count = 0;
  for (const node of files) {
    if (node.type === "file") {
      count++;
    }
    if (node.children) {
      count += countFiles(node.children);
    }
  }
  return count;
}

export async function addCommand(identifier: string) {
  // Print banner first
  console.log(banner);

  if (!identifier) {
    console.log(c.red('Error: Skill identifier is required'));
    console.log();
    console.log(c.gray('Usage: tokenui add <owner>/<slug>'));
    console.log(c.gray('       tokenui add <slug>'));
    console.log();
    console.log(c.gray('Examples:'));
    console.log(c.gray('  tokenui add abboskhonov/sasa'));
    console.log(c.gray('  tokenui add claude-design-system'));
    console.log();
    console.log(c.gray('Run "tokenui list" to see available skills'));
    return;
  }

  // Parse identifier: can be "owner/slug" or just "slug"
  let owner: string | undefined;
  let slug: string;

  if (identifier.includes('/')) {
    const parts = identifier.split('/');
    owner = parts[0];
    slug = parts[1];
  } else {
    slug = identifier;
  }

  const config = await getConfig();
  const apiUrl = config.apiUrl || DEFAULT_API_URL;

  const spinner = p.spinner();
  
  if (owner) {
    spinner.start(`Fetching skill "${owner}/${slug}"...`);
  } else {
    spinner.start(`Fetching skill "${slug}"...`);
  }

  try {
    // Build API URL based on format
    // Note: The API uses /api/designs/:owner/:slug not /api/skills/:owner/:slug
    const apiUrlPath = owner 
      ? `${apiUrl}/api/designs/${owner}/${slug}`
      : `${apiUrl}/api/skills/${slug}`;

    // Fetch the skill from API (pass token if available)
    const response = await makeApiRequest(apiUrlPath, config.token);
    // API returns { skill: ... } for /skills and { design: ... } for /designs
    const skill = (response as { skill?: SkillDetail; design?: SkillDetail }).skill 
      || (response as { skill?: SkillDetail; design?: SkillDetail }).design;

    if (!skill) {
      spinner.stop(c.red(`Skill "${owner ? owner + '/' : ''}${slug}" not found`));
      console.log();
      if (owner) {
        console.log(c.gray(`Tip: Make sure "${owner}" is the correct username and "${slug}" is the skill slug`));
      }
      console.log(c.gray('Run "tokenui list" to see available skills and their owners'));
      return;
    }

    // Extract author info (could be string or object from different endpoints)
    const authorDisplay = typeof skill.author === 'string' 
      ? skill.author 
      : skill.author?.username || skill.author?.name || 'Anonymous';

    spinner.stop(c.green(`Found: ${skill.name} by ${authorDisplay}`));
    console.log();

    // Show skill details
    console.log(c.bold('Skill Details:'));
    console.log(`  ${c.gray('Name:')} ${skill.name}`);
    console.log(`  ${c.gray('Author:')} ${authorDisplay}`);
    console.log(`  ${c.gray('Category:')} ${skill.category}`);
    console.log(`  ${c.gray('Description:')} ${skill.description || 'No description'}`);
    console.log();

    // Always install to .agents/skills first (default)
    console.log(c.gray('✓ Will install to:'), c.cyan('./.agents/skills/'));
    console.log();

    // Ask for additional agents (optional)
    const additionalAgentsResult = await p.multiselect({
      message: 'Also install to additional agents (optional):',
      options: ADDITIONAL_AGENTS.map(agent => ({
        value: agent.id,
        label: agent.name,
        hint: `./${agent.localPath}`,
      })),
      required: false,
    });

    if (p.isCancel(additionalAgentsResult)) {
      p.outro(c.gray('Installation cancelled'));
      return;
    }

    // Handle empty array (no additional agents selected)
    const additionalAgents = Array.isArray(additionalAgentsResult) ? additionalAgentsResult : [];
    const additionalCount = additionalAgents.length;
    const totalLocations = 1 + additionalCount;
    
    console.log();
    console.log(c.bold('Installation Summary:'));
    console.log(`  ${c.gray('Skill:')} ${skill.name}`);
    console.log(`  ${c.gray('Files:')} ${skill.files && skill.files.length > 0 ? countFiles(skill.files) + 1 : 1} file(s)`);
    console.log(`  ${c.gray('Primary:')} ./.agents/skills/`);
    if (additionalCount > 0) {
      console.log(`  ${c.gray('Additional:')} ${additionalAgents.map(id => 
        ADDITIONAL_AGENTS.find(a => a.id === id)?.name
      ).join(', ')}`);
    }
    console.log();

    const shouldInstall = await p.confirm({
      message: `Install to ${totalLocations} location(s)?`,
      initialValue: true,
    });

    if (p.isCancel(shouldInstall) || !shouldInstall) {
      p.outro(c.gray('Installation cancelled'));
      return;
    }

    // Install the skill
    const installSpinner = p.spinner();
    installSpinner.start('Installing skill...');

    const skillName = sanitizeSkillName(skill.name);
    const installedPaths: string[] = [];

    // Always install to .agents/skills (primary)
    const primaryDir = join(process.cwd(), '.agents', 'skills', skillName);
    if (!existsSync(primaryDir)) {
      mkdirSync(primaryDir, { recursive: true });
    }

    // Write the main SKILL.md
    writeFileSync(join(primaryDir, 'SKILL.md'), skill.content, 'utf-8');
    installedPaths.push(join(primaryDir, 'SKILL.md'));

    // Write additional files from the file tree
    if (skill.files && skill.files.length > 0) {
      writeFileTree(primaryDir, skill.files, installedPaths);
    }

    // Install to additional selected agents
    if (additionalAgents.length > 0) {
      for (const agentId of additionalAgents) {
        const agent = ADDITIONAL_AGENTS.find(a => a.id === agentId);
        if (!agent) continue;

        const agentDir = join(process.cwd(), agent.localPath, skillName);

        if (!existsSync(agentDir)) {
          mkdirSync(agentDir, { recursive: true });
        }

        // Write the SKILL.md file
        writeFileSync(join(agentDir, 'SKILL.md'), skill.content, 'utf-8');

        // Write additional files
        if (skill.files && skill.files.length > 0) {
          writeFileTree(agentDir, skill.files, installedPaths);
        }
      }
    }

    const fileCount = skill.files ? countFiles(skill.files) : 0;
    installSpinner.stop(c.green(`Installed ${fileCount + 1} file(s) to ${1 + additionalAgents.length} location(s)!`));
    console.log();
    
    // Show installed locations (not every file)
    console.log(c.bold('Installed to:'));
    console.log(`  ${c.cyan('✓')} ./.agents/skills/${skillName}/`);
    for (const agentId of additionalAgents) {
      const agent = ADDITIONAL_AGENTS.find(a => a.id === agentId);
      if (agent) {
        console.log(`  ${c.cyan('✓')} ./${agent.localPath}/${skillName}/`);
      }
    }
    console.log();
    
    p.note(`The skill is now available in your coding agents!`, 'Success');

  } catch (error) {
    spinner.stop(c.red(`Failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
    console.log();
    console.log(c.gray('Make sure your API is running at:'), c.cyan(apiUrl));
  }
}
