import c from 'picocolors';

export const banner = `${c.cyan(`
████████╗ ██████╗ ██╗  ██╗███████╗███╗   ██╗██╗   ██╗██╗██╗
╚══██╔══╝██╔═══██╗██║ ██╔╝██╔════╝████╗  ██║██║   ██║██║██║
   ██║   ██║   ██║█████╔╝ █████╗  ██╔██╗ ██║██║   ██║██║██║
   ██║   ██║   ██║██╔═██╗ ██╔══╝  ██║╚██╗██║██║   ██║██║██║
   ██║   ╚██████╔╝██║  ██╗███████╗██║ ╚████║╚██████╔╝██║██║
   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝╚═╝
`)}
${c.gray('Design system skills for coding agents')}
`;

export function printHelp(): void {
  console.log(banner);
  console.log();
  console.log(c.bold('Commands:'));
  console.log();
  console.log(`  ${c.cyan('$')} tokenui ${c.yellow('list')}              List available design skills`);
  console.log(`  ${c.cyan('$')} tokenui ${c.yellow('add <owner>/<slug>')}  Install a skill to ./.agents/skills/`);
  console.log(`  ${c.cyan('$')} tokenui ${c.yellow('config')}            Configure API endpoint (optional)`);
  console.log(`  ${c.cyan('$')} tokenui ${c.yellow('--help')}            Show this help message`);
  console.log(`  ${c.cyan('$')} tokenui ${c.yellow('--version')}         Show version number`);
  console.log();
  console.log(c.bold('Installation:'));
  console.log(`  • Primary: ./.agents/skills/ (always installed)`);
  console.log(`  • Optional: Claude Code, Cursor, Cline, Windsurf, etc.`);
  console.log();
  console.log(c.bold('Examples:'));
  console.log(`  ${c.cyan('$')} tokenui list`);
  console.log(`  ${c.cyan('$')} tokenui add abboskhonov/claude-design-system`);
  console.log(`  ${c.cyan('$')} tokenui add bergside/typeui`);
  console.log();
  console.log(c.gray('Tip: Run "tokenui list" to see available skill slugs'));
  console.log();
  console.log(`Learn more at ${c.cyan('https://tokenui.dev')}`);
  console.log();
}
