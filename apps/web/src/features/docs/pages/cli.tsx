"use client"

import { DocsPage } from "../components/doc-page"
import { CodeBlock } from "../components/code-block"
import { Section, Heading, SubHeading, Paragraph } from "../components/typography"
import type { TOCItem } from "../components/table-of-contents"

const tocItems: TOCItem[] = [
  { id: "installation", text: "Installation", level: 2 },
  { id: "commands", text: "Commands", level: 2 },
  { id: "global-options", text: "Global Options", level: 2 },
  { id: "configuration", text: "Configuration", level: 2 },
  { id: "workflows", text: "Common Workflows", level: 2 }
]

function CommandSection({
  title,
  description,
  command,
  example,
  options
}: {
  title: string
  description: string
  command: string
  example?: string
  options?: { flag: string; description: string }[]
}) {
  return (
    <section className="space-y-4">
      <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
      <Paragraph>{description}</Paragraph>
      
      <CodeBlock code={command} />
      
      {example && (
        <div className="mt-2 space-y-2">
          <p className="text-sm text-muted-foreground">Example:</p>
          <CodeBlock code={example} />
        </div>
      )}
      
      {options && options.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium">Options:</p>
          <div className="space-y-1.5">
            {options.map((opt) => (
              <div key={opt.flag} className="flex gap-4 text-sm">
                <code className="text-foreground font-mono min-w-[120px] text-muted-foreground">{opt.flag}</code>
                <span className="text-muted-foreground">{opt.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

export function DocsCLIPage() {
  return (
    <DocsPage
      title="CLI Reference"
      description="Complete reference for the TokenUI command-line interface. Install and manage design skills directly from your terminal."
      breadcrumbItems={[
        { label: "Docs", href: "/docs" },
        { label: "CLI Reference" }
      ]}
      tocItems={tocItems}
    >
      <Section>
        <Heading id="installation">Installation</Heading>
        <Paragraph>
          No installation required. Use npx to run the CLI directly. 
          If you prefer, you can install it globally for faster execution.
        </Paragraph>
        
        <div className="space-y-3">
          <CodeBlock 
            code="npx tokenui.sh <command>"
            filename="Recommended"
          />
          <CodeBlock 
            code="npm install -g tokenui"
            filename="Global Install (optional)"
          />
        </div>
      </Section>

      <Section>
        <Heading id="commands">Commands</Heading>

        <CommandSection
          title="add"
          description="Add a skill to your project. Installs the skill and all its dependencies."
          command="npx tokenui.sh add <skill-name>"
          example="npx tokenui.sh add button"
          options={[
            { flag: "--path, -p", description: "Custom installation path" },
            { flag: "--force, -f", description: "Overwrite existing files" },
            { flag: "--dry-run", description: "Preview changes without applying" },
          ]}
        />

        <CommandSection
          title="list"
          description="List all available skills in the gallery. Filter by category or search term."
          command="npx tokenui.sh list"
          example="npx tokenui.sh list --category forms"
          options={[
            { flag: "--category, -c", description: "Filter by category" },
            { flag: "--search, -s", description: "Search by keyword" },
            { flag: "--limit, -l", description: "Limit results (default: 20)" },
          ]}
        />

        <CommandSection
          title="info"
          description="Show detailed information about a specific skill."
          command="npx tokenui.sh info <skill-name>"
          example="npx tokenui.sh info modal"
        />

        <CommandSection
          title="remove"
          description="Remove a skill from your project."
          command="npx tokenui.sh remove <skill-name>"
          example="npx tokenui.sh remove button"
          options={[
            { flag: "--force, -f", description: "Skip confirmation prompt" },
          ]}
        />

        <CommandSection
          title="update"
          description="Update skills to their latest versions."
          command="npx tokenui.sh update"
          example="npx tokenui.sh update button"
          options={[
            { flag: "--all, -a", description: "Update all skills" },
          ]}
        />

        <CommandSection
          title="publish"
          description="Publish a skill to the TokenUI gallery. Opens the publish page in your browser."
          command="npx tokenui.sh publish"
          options={[
            { flag: "--draft", description: "Save as draft instead of publishing" },
          ]}
        />

        <CommandSection
          title="init"
          description="Initialize a new TokenUI-compatible project. Sets up the directory structure and configuration."
          command="npx tokenui.sh init"
          example="npx tokenui.sh init my-app"
          options={[
            { flag: "--template, -t", description: "Use a starter template" },
            { flag: "--yes, -y", description: "Skip prompts with defaults" },
          ]}
        />
      </Section>

      <Section>
        <Heading id="global-options">Global Options</Heading>
        <Paragraph>
          These options work with any command:
        </Paragraph>
        
        <div className="space-y-1.5">
          <div className="flex gap-4 text-sm">
            <code className="text-foreground font-mono min-w-[120px] text-muted-foreground">--help, -h</code>
            <span className="text-muted-foreground">Show help for a command</span>
          </div>
          <div className="flex gap-4 text-sm">
            <code className="text-foreground font-mono min-w-[120px] text-muted-foreground">--version, -v</code>
            <span className="text-muted-foreground">Show CLI version</span>
          </div>
          <div className="flex gap-4 text-sm">
            <code className="text-foreground font-mono min-w-[120px] text-muted-foreground">--verbose</code>
            <span className="text-muted-foreground">Enable verbose logging</span>
          </div>
          <div className="flex gap-4 text-sm">
            <code className="text-foreground font-mono min-w-[120px] text-muted-foreground">--silent</code>
            <span className="text-muted-foreground">Suppress all output except errors</span>
          </div>
        </div>
      </Section>

      <Section>
        <Heading id="configuration">Configuration</Heading>
        <Paragraph>
          Create a tokenui.json file in your project root to customize behavior:
        </Paragraph>
        
        <CodeBlock 
          filename="tokenui.json"
          code={`{
  "path": "./src/components",
  "typescript": true,
  "tailwind": true,
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}`}
        />

        <SubHeading id="configuration-options">Configuration Options</SubHeading>
        <div className="space-y-1.5">
          <div className="flex gap-4 text-sm">
            <code className="text-foreground font-mono min-w-[140px] text-muted-foreground">path</code>
            <span className="text-muted-foreground">Default installation directory for skills</span>
          </div>
          <div className="flex gap-4 text-sm">
            <code className="text-foreground font-mono min-w-[140px] text-muted-foreground">typescript</code>
            <span className="text-muted-foreground">Use TypeScript by default</span>
          </div>
          <div className="flex gap-4 text-sm">
            <code className="text-foreground font-mono min-w-[140px] text-muted-foreground">tailwind</code>
            <span className="text-muted-foreground">Enable Tailwind CSS integration</span>
          </div>
          <div className="flex gap-4 text-sm">
            <code className="text-foreground font-mono min-w-[140px] text-muted-foreground">aliases</code>
            <span className="text-muted-foreground">Import path aliases for your project</span>
          </div>
        </div>
      </Section>

      <Section>
        <Heading id="workflows">Common Workflows</Heading>

        <SubHeading id="workflows-multiple">Add multiple skills at once</SubHeading>
        <CodeBlock code="npx tokenui.sh add button card modal input" />

        <SubHeading id="workflows-search">Search and add skills interactively</SubHeading>
        <CodeBlock code="npx tokenui.sh list --search form | npx tokenui.sh add" />

        <SubHeading id="workflows-update-all">Update all skills in your project</SubHeading>
        <CodeBlock code="npx tokenui.sh update --all" />

        <SubHeading id="workflows-custom-path">Install to a custom directory</SubHeading>
        <CodeBlock code="npx tokenui.sh add button --path ./app/ui" />
      </Section>
    </DocsPage>
  )
}
