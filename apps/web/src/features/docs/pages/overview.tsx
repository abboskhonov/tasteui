"use client"

import { DocsPage } from "../components/doc-page"
import { CodeBlock } from "../components/code-block"
import { Section, Heading, Paragraph, Step, List } from "../components/typography"
import type { TOCItem } from "../components/table-of-contents"

const tocItems: TOCItem[] = [
  { id: "quick-start", text: "Quick Start", level: 2 },
  { id: "what-are-skills", text: "What are Skills?", level: 2 },
  { id: "how-it-works", text: "How It Works", level: 2 },
  { id: "publishing", text: "Publishing Skills", level: 2 },
  { id: "resources", text: "Resources", level: 2 },
]

export function DocsOverviewPage() {
  return (
    <DocsPage
      title="Documentation"
      description="Learn how to discover, install, and use design skills with your AI agents. TasteUI provides a curated collection of UI components and patterns."
      breadcrumbItems={[
        { label: "Docs", href: "/docs" },
        { label: "Overview" }
      ]}
      tocItems={tocItems}
    >
      <Section id="quick-start">
        <Heading id="quick-start">Quick Start</Heading>
        <Paragraph>
          Get started in seconds. No installation required—just use npx to run the CLI directly.
        </Paragraph>
        
        <CodeBlock 
          code="npx tasteui.dev add <skill-name>"
          filename="Install any skill instantly"
        />
        
        <Paragraph>
          Browse all available skills on the homepage, or search for specific components 
          like "button", "card", "modal", or "form".
        </Paragraph>
      </Section>

      <Section id="what-are-skills">
        <Heading id="what-are-skills">What are Skills?</Heading>
        <Paragraph>
          Skills are self-contained UI components, design patterns, and coding conventions 
          that help you build consistent interfaces. Each skill includes:
        </Paragraph>
        
        <List items={[
          <><strong>UI Components</strong> — Ready-to-use React components with styling, animations, and accessibility built-in.</>,
          <><strong>Design Tokens</strong> — Colors, typography, and spacing scales that ensure visual consistency.</>,
          <><strong>Code Patterns</strong> — Best practices and conventions for writing maintainable React code.</>,
          <><strong>AI-Optimized</strong> — Structured for AI agents to understand and implement correctly.</>
        ]} />
      </Section>

      <Section id="how-it-works">
        <Heading id="how-it-works">How It Works</Heading>
        
        <div className="space-y-6">
          <Step number={1} title="Browse the Gallery">
            Explore skills by category or search for specific components. 
            Preview live examples before installing.
          </Step>

          <Step number={2} title="Install with CLI">
            Use the CLI to add skills to your project. The CLI handles dependencies, 
            file structure, and configuration automatically.
            <div className="mt-3">
              <CodeBlock code="npx tasteui.dev add button" />
            </div>
          </Step>

          <Step number={3} title="Use in Your Project">
            Import and use components like any other React component. 
            Customize styling using Tailwind classes or CSS variables.
          </Step>
        </div>
      </Section>

      <Section id="publishing">
        <Heading id="publishing">Publishing Skills</Heading>
        <Paragraph>
          Have a design system or component you want to share? Publish it to the TokenUI gallery 
          so others can discover and use it.
        </Paragraph>
        
        <List items={[
          <><strong>Share Your Work</strong> — Upload screenshots, code, and documentation for your design.</>,
          <><strong>Track Usage</strong> — See how many developers are using your skills via analytics.</>
        ]} />

        <Paragraph className="mt-4">
          Click the <strong>Publish</strong> button in the navigation to submit your design. 
          Fill out the form with your design details, upload a preview screenshot, and submit. 
          All submissions are reviewed before appearing in the gallery.
        </Paragraph>
      </Section>

      <Section id="resources">
        <Heading id="resources">Resources</Heading>
        <List items={[
          <><a href="https://github.com/abboskhonov/tasteui" className="text-foreground underline hover:no-underline">GitHub Repository</a> — Source code, issues, and contributions</>,
          <><a href="/docs/cli" className="text-foreground underline hover:no-underline">CLI Reference</a> — Complete command documentation</>,
          <><a href="/docs/platform" className="text-foreground underline hover:no-underline">Platform</a> — Understanding the TasteUI platform</>,
          <><a href="/docs/faq" className="text-foreground underline hover:no-underline">FAQ</a> — Common questions and answers</>
        ]} />
      </Section>
    </DocsPage>
  )
}
