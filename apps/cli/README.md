# TokenUI CLI

Command-line interface for installing design system skills to your coding agents.

## Installation

```bash
npx tokenui
```

## Usage

```bash
# Show help with beautiful banner
npx tokenui

# List available design skills
npx tokenui list

# Install a skill (always to ./.agents/skills/)
npx tokenui add abboskhonov/claude-design-system

# Configure API endpoint (optional)
npx tokenui config
```

## No Authentication Required

The CLI works out of the box without any configuration:

- **`tokenui list`** - Browse public design skills (no auth needed)
- **`tokenui add <owner>/<slug>`** - Install skills (no auth needed)

## How Installation Works

When you run `tokenui add <owner>/<slug>`, the CLI will:

1. **Fetch** the skill from the TokenUI API
2. **Install** to `./.agents/skills/<skill-name>/` (always)
3. **Optionally** install to additional agent directories

### Installation Flow

```bash
$ tokenui add abboskhonov/claude-design-system

✓ Found: Claude Design System by abboskhonov

Skill Details:
  Name: Claude Design System
  Author: abboskhonov
  Category: design-system
  Description: The design system of Claude

✓ Will install to: ./.agents/skills/

◆ Also install to additional agents (optional):
│ ☑ Claude Code     → ./.claude/skills/
│ ☑ Cursor          → ./.cursor/skills/
│ ☐ Cline           → ./.cline/skills/
│ ☐ Windsurf        → ./.windsurf/skills/
│ ☐ Continue        → ./.continue/skills/
│ ☐ GitHub Copilot  → ./.copilot/skills/

Installation Summary:
  Skill: Claude Design System
  Primary: ./.agents/skills/
  Additional: Claude Code, Cursor

◆ Install to 3 location(s)?
│ ● Yes / ○ No

✓ Installed to 3 location(s)!

Installed to:
  ✓ ./.agents/skills/claude-design-system/
  ✓ ./.claude/skills/claude-design-system/
  ✓ ./.cursor/skills/claude-design-system/
```

## Installation Directory Structure

Skills are always installed **per-project** (no global installation):

```
your-project/
├── .agents/
│   └── skills/
│       └── claude-design-system/
│           └── SKILL.md          # ← Always installed here
├── .claude/
│   └── skills/
│       └── claude-design-system/
│           └── SKILL.md          # ← Optional (if selected)
├── .cursor/
│   └── skills/
│       └── claude-design-system/
│           └── SKILL.md          # ← Optional (if selected)
└── ...
```

### Primary Location (Always)
- **`.agents/skills/<skill-name>/SKILL.md`**

### Optional Locations (User Selects)
- `.claude/skills/<skill-name>/SKILL.md` - Claude Code
- `.cursor/skills/<skill-name>/SKILL.md` - Cursor
- `.cline/skills/<skill-name>/SKILL.md` - Cline
- `.windsurf/skills/<skill-name>/SKILL.md` - Windsurf
- `.continue/skills/<skill-name>/SKILL.md` - Continue
- `.copilot/skills/<skill-name>/SKILL.md` - GitHub Copilot

## Configuration (Optional)

The CLI stores optional configuration in `~/.config/tokenui/config.yaml`:

```yaml
apiUrl: https://api.tokenui.dev
```

Run `tokenui config` to customize the API URL.

## API Integration

The CLI connects to your Hono API backend. Required public endpoints:

- `GET /api/skills` - Returns an array of design skills
- `GET /api/skills/:owner/:slug` - Returns a single skill by owner username and slug
- `GET /api/skills/:slug` - Returns a single skill by slug (fallback)

## Development

```bash
cd apps/cli
bun install
bun run dev        # Run in development mode
bun run build      # Build for distribution
bun run typecheck  # Type check
```

## Commands Reference

| Command | Description |
|---------|-------------|
| `list` | Browse public design skills with interactive selection |
| `add <owner>/<slug>` | Install a skill to `.agents/skills/` + optional agents |
| `config` | Configure API endpoint and optional settings |
| `--help` | Show help message |
| `--version` | Show version number |

## Key Features

- ✅ **Always project-only** - No global installation
- ✅ **Primary to `.agents/skills/`** - Default location for OpenCode
- ✅ **Multi-agent support** - Optional install to Claude, Cursor, Cline, Windsurf, etc.
- ✅ **GitHub-style format** - `owner/slug` identifier
- ✅ **No auth required** - Works out of the box
- ✅ **Interactive prompts** - Beautiful CLI with `@clack/prompts`

## Inspired By

- [skills.sh](https://skills.sh) - The open agent skills ecosystem
- [vercel-labs/skills](https://github.com/vercel-labs/skills) - Vercel's skills CLI
- [typeui.sh](https://typeui.sh) - Design system skills for agentic tools

## License

MIT
