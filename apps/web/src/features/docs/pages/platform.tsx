"use client"

import { DocsPage } from "../components/doc-page"
import { CodeBlock } from "../components/code-block"
import { Section, Heading, SubHeading, Paragraph, List, Step } from "../components/typography"
import type { TOCItem } from "../components/table-of-contents"

const tocItems: TOCItem[] = [
  { id: "what-is-tasteui", text: "What is TasteUI?", level: 2 },
  { id: "how-it-works", text: "How It Works", level: 2 },
  { id: "core-features", text: "Core Features", level: 2 },
  { id: "skill-lifecycle", text: "Skill Lifecycle", level: 2 },
  { id: "resources", text: "Resources", level: 2 },
]

export function DocsPlatformPage() {
  return (
    <DocsPage
      title="Platform"
      description="Understanding the TasteUI platform architecture, features, and how skills work."
      breadcrumbItems={[
        { label: "Docs", href: "/docs" },
        { label: "Platform" }
      ]}
      tocItems={tocItems}
    >
      <Section id="what-is-tasteui">
        <Heading id="what-is-tasteui">What is TasteUI?</Heading>
        <Paragraph>
          TasteUI is an open-source platform for discovering, sharing, and using design skills. 
          It bridges the gap between AI coding agents and consistent UI implementation by providing 
          a standardized format for design systems, components, and coding patterns.
        </Paragraph>
        <Paragraph>
          Think of it as a registry for design intelligence — each skill is a self-contained 
          package that includes documentation, code patterns, and implementation guidelines that 
          both humans and AI agents can understand and use.
        </Paragraph>
      </Section>

      <Section id="how-it-works">
        <Heading id="how-it-works">How It Works</Heading>
        <div className="space-y-6">
          <Step number={1} title="Create">
            Developers create skills by writing SKILL.md files with YAML frontmatter. 
            These files contain instructions, code examples, and design tokens that 
            define how to implement specific UI patterns.
          </Step>
          <Step number={2} title="Publish">
            Skills are published to the TasteUI gallery through the web interface or CLI. 
            Each submission includes a demo preview, documentation, and optionally 
            multiple code files organized in a file tree.
          </Step>
          <Step number={3} title="Discover">
            Users browse the gallery to find skills matching their needs. Skills can be 
            filtered by category, searched by keyword, or sorted by popularity and recency.
          </Step>
          <Step number={4} title="Install">
            Once a skill is found, it can be installed using the CLI command 
            <code className="mx-1 px-1.5 py-0.5 rounded bg-muted text-sm font-mono">npx tasteui.dev add {'<skill>'}</code>. 
            The CLI fetches the skill content and makes it available in your project.
          </Step>
          <Step number={5} title="Use">
            AI agents read the installed SKILL.md files and follow the instructions to 
            implement consistent UI patterns across your projects.
          </Step>
        </div>
      </Section>

      <Section id="core-features">
        <Heading id="core-features">Core Features</Heading>
        
        <SubHeading id="skills-gallery">Skills Gallery</SubHeading>
        <Paragraph>
          The gallery is the central hub for discovering skills. Each skill card shows 
          a preview thumbnail, author information, view count, and star count. Skills 
          can be sorted by newest, trending, or top rated.
        </Paragraph>

        <SubHeading id="skill-detail">Skill Detail Pages</SubHeading>
        <Paragraph>
          Every skill has its own page showing:
        </Paragraph>
        <List items={[
          <>Live demo preview in desktop/mobile modes</>,
          <>Full code view with file browser</>,
          <>Author profile and skill statistics</>,
          <>One-click install command</>
        ]} />

        <SubHeading id="studio">Studio</SubHeading>
        <Paragraph>
          The Studio is your personal dashboard for managing skills. It shows analytics 
          including views, stars, and CLI downloads. Skills can be in different states: 
          draft (private work-in-progress), pending (awaiting review), approved (public), 
          or rejected (needs changes).
        </Paragraph>

        <SubHeading id="publish-flow">Publish Flow</SubHeading>
        <Paragraph>
          Publishing happens in two steps: first, write your skill documentation and code 
          files in the code editor; second, add metadata including name, description, 
          category, and thumbnail. Skills can be saved as drafts and submitted when ready.
        </Paragraph>
      </Section>

      <Section id="skill-lifecycle">
        <Heading id="skill-lifecycle">Skill Lifecycle</Heading>
        <CodeBlock 
          filename="Status Flow"
          code={`draft → pending → approved
         ↓
      rejected`} 
        />
        <Paragraph>
          Skills move through a simple lifecycle. Drafts are private and editable. 
          Pending skills await admin review. Approved skills appear in the public gallery. 
          Rejected skills need modifications before resubmission.
        </Paragraph>
      </Section>

      <Section id="resources">
        <Heading id="resources">Resources</Heading>
        <List items={[
          <><a href="https://github.com/abboskhonov/tasteui" className="text-foreground underline hover:no-underline">GitHub Repository</a> — Source code, issues, and contributions</>,
          <><a href="/docs/cli" className="text-foreground underline hover:no-underline">CLI Reference</a> — Complete command documentation</>,
          <><a href="/docs/installing" className="text-foreground underline hover:no-underline">Installing Skills</a> — How to find and install skills</>,
          <><a href="/docs/publishing" className="text-foreground underline hover:no-underline">Publishing Skills</a> — Create and share your own skills</>
        ]} />
      </Section>
    </DocsPage>
  )
}
