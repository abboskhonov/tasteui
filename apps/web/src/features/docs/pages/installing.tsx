"use client"

import { DocsPage } from "../components/doc-page"
import { CodeBlock } from "../components/code-block"
import { Section, Heading, SubHeading, Paragraph, List, Step } from "../components/typography"
import type { TOCItem } from "../components/table-of-contents"

const tocItems: TOCItem[] = [
  { id: "quick-start", text: "Quick Start", level: 2 },
  { id: "finding-skills", text: "Finding Skills", level: 2 },
  { id: "browse-gallery", text: "Browse the Gallery", level: 3 },
  { id: "search-name", text: "Search by Name", level: 3 },
  { id: "filter-category", text: "Filter by Category", level: 3 },
  { id: "installation-methods", text: "Installation Methods", level: 2 },
  { id: "installation-options", text: "Installation Options", level: 2 },
  { id: "custom-path", text: "Custom Path", level: 3 },
  { id: "force-overwrite", text: "Force Overwrite", level: 3 },
  { id: "dry-run", text: "Dry Run", level: 3 },
  { id: "what-gets-installed", text: "What Gets Installed", level: 2 },
  { id: "using-skills", text: "Using Installed Skills", level: 2 },
  { id: "updating", text: "Updating Skills", level: 2 },
  { id: "removing", text: "Removing Skills", level: 2 },
]

export function DocsInstallingPage() {
  return (
    <DocsPage
      title="Installing Skills"
      description="Learn how to find, install, and use skills in your projects."
      breadcrumbItems={[
        { label: "Docs", href: "/docs" },
        { label: "Installing Skills" }
      ]}
      tocItems={tocItems}
    >
      <Section id="quick-start">
        <Heading id="quick-start">Quick Start</Heading>
        <Paragraph>
          The fastest way to install a skill is using npx. No installation required — 
          just run the command and the skill will be added to your project.
        </Paragraph>
        
        <CodeBlock 
          code="npx tasteui.dev add <skill-name>"
          filename="Install a skill"
        />
      </Section>

      <Section id="finding-skills">
        <Heading id="finding-skills">Finding Skills</Heading>
        
        <SubHeading id="browse-gallery">Browse the Gallery</SubHeading>
        <Paragraph>
          Visit the <a href="/" className="text-foreground underline">TasteUI gallery</a> to browse 
          available skills. Each skill card shows:
        </Paragraph>
        <List items={[
          <>Preview thumbnail of the skill</>,
          <>Author information</>,
          <>View count and star count</>,
          <>Category and description</>
        ]} />

        <SubHeading id="search-name">Search by Name</SubHeading>
        <Paragraph>
          You can search for specific skills using the CLI:
        </Paragraph>
        <CodeBlock 
          code="npx tasteui.dev list --search button"
          filename="Search for button-related skills"
        />

        <SubHeading id="filter-category">Filter by Category</SubHeading>
        <Paragraph>
          Skills are organized by category. Use the category filter to narrow down results:
        </Paragraph>
        <CodeBlock 
          code="npx tasteui.dev list --category forms"
          filename="List all form-related skills"
        />
      </Section>

      <Section id="installation-methods">
        <Heading id="installation-methods">Installation Methods</Heading>

        <Step number={1} title="Install by Name">
          Install a specific skill by its name:
          <div className="mt-3">
            <CodeBlock code="npx tasteui.dev add button" />
          </div>
        </Step>

        <Step number={2} title="Install by Author/Skill">
          For skills with specific authors, use the full path:
          <div className="mt-3">
            <CodeBlock code="npx tasteui.dev add username/skill-name" />
          </div>
        </Step>

        <Step number={3} title="Install Multiple">
          Install multiple skills at once:
          <div className="mt-3">
            <CodeBlock code="npx tasteui.dev add button card modal input" />
          </div>
        </Step>
      </Section>

      <Section id="installation-options">
        <Heading id="installation-options">Installation Options</Heading>
        
        <SubHeading id="custom-path">Custom Path</SubHeading>
        <Paragraph>
          Install skills to a custom directory in your project:
        </Paragraph>
        <CodeBlock 
          code="npx tasteui.dev add button --path ./app/components"
          filename="Install to custom directory"
        />

        <SubHeading id="force-overwrite">Force Overwrite</SubHeading>
        <Paragraph>
          Overwrite existing files if they already exist:
        </Paragraph>
        <CodeBlock 
          code="npx tasteui.dev add button --force"
          filename="Force overwrite existing files"
        />

        <SubHeading id="dry-run">Dry Run</SubHeading>
        <Paragraph>
          Preview what would be installed without making changes:
        </Paragraph>
        <CodeBlock 
          code="npx tasteui.dev add button --dry-run"
          filename="Preview installation changes"
        />
      </Section>

      <Section id="what-gets-installed">
        <Heading id="what-gets-installed">What Gets Installed</Heading>
        <Paragraph>
          When you install a skill, the following files are added to your project:
        </Paragraph>
        <List items={[
          <><strong>SKILL.md</strong> — The main documentation file with usage instructions</>,
          <><strong>Component files</strong> — Any code files included with the skill</>,
          <><strong>Dependencies</strong> — Required packages are detected and suggested</>
        ]} />
        
        <Paragraph className="mt-4">
          By default, skills are installed to the <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">./.agents/skills/</code> directory. 
          You can customize this in your <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">tasteui.json</code> configuration file.
        </Paragraph>
      </Section>

      <Section id="using-skills">
        <Heading id="using-skills">Using Installed Skills</Heading>
        
        <SubHeading id="for-ai-agents">For AI Agents</SubHeading>
        <Paragraph>
          Once installed, AI agents can read the SKILL.md file and follow the instructions 
          to implement the patterns. Reference skills in your prompts:
        </Paragraph>
        <CodeBlock 
          code="# Example prompt
Create a login form using the button and input skills from tasteui.dev."
          filename="Example AI prompt"
        />

        <SubHeading id="for-developers">For Developers</SubHeading>
        <Paragraph>
          You can also read the SKILL.md files directly to understand the patterns and 
          copy code examples into your project. Skills are just documentation — you have 
          full control over how you use them.
        </Paragraph>
      </Section>

      <Section id="updating">
        <Heading id="updating">Updating Skills</Heading>
        <Paragraph>
          To update a skill to its latest version:
        </Paragraph>
        <CodeBlock 
          code="npx tasteui.dev update button"
          filename="Update a specific skill"
        />
        
        <Paragraph className="mt-4">
          To update all installed skills at once:
        </Paragraph>
        <CodeBlock 
          code="npx tasteui.dev update --all"
          filename="Update all skills"
        />
      </Section>

      <Section id="removing">
        <Heading id="removing">Removing Skills</Heading>
        <Paragraph>
          To remove a skill from your project:
        </Paragraph>
        <CodeBlock 
          code="npx tasteui.dev remove button"
          filename="Remove a skill"
        />
        
        <Paragraph className="mt-4">
          Use the <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">--force</code> flag to skip the confirmation prompt:
        </Paragraph>
        <CodeBlock 
          code="npx tasteui.dev remove button --force"
          filename="Remove without confirmation"
        />
      </Section>
    </DocsPage>
  )
}
