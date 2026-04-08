"use client"

import { DocsPage } from "../components/doc-page"
import { CodeBlock } from "../components/code-block"
import { Section, Heading, Paragraph, Step } from "../components/typography"
import { ResourceCard } from "../components/resource-card"
import type { TOCItem } from "../components/table-of-contents"
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  Download04Icon, 
  CodeIcon, 
  Share01Icon,
  ColorsIcon,
  Layers01Icon,
  ZapIcon,
  GithubIcon,
  CommandLineIcon,
  HelpCircleIcon
} from "@hugeicons/core-free-icons"

function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode
  title: string
  description: string 
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
        {icon}
      </div>
      <h3 className="mb-2 font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

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
      description="Learn how to discover, install, and use design skills with your AI agents. TokenUI provides a curated collection of UI components and patterns."
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
          code="npx tokenui.sh add <skill-name>"
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
        
        <div className="grid gap-4 sm:grid-cols-2">
          <FeatureCard
            icon={<HugeiconsIcon icon={Layers01Icon} className="size-5" />}
            title="UI Components"
            description="Ready-to-use React components with styling, animations, and accessibility built-in."
          />
          <FeatureCard
            icon={<HugeiconsIcon icon={ColorsIcon} className="size-5" />}
            title="Design Tokens"
            description="Colors, typography, and spacing scales that ensure visual consistency."
          />
          <FeatureCard
            icon={<HugeiconsIcon icon={CodeIcon} className="size-5" />}
            title="Code Patterns"
            description="Best practices and conventions for writing maintainable React code."
          />
          <FeatureCard
            icon={<HugeiconsIcon icon={ZapIcon} className="size-5" />}
            title="AI-Optimized"
            description="Structured for AI agents to understand and implement correctly."
          />
        </div>
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
              <CodeBlock code="npx tokenui.sh add button" />
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
        
        <div className="grid gap-4 sm:grid-cols-2">
          <FeatureCard
            icon={<HugeiconsIcon icon={Share01Icon} className="size-5" />}
            title="Share Your Work"
            description="Upload screenshots, code, and documentation for your design."
          />
          <FeatureCard
            icon={<HugeiconsIcon icon={Download04Icon} className="size-5" />}
            title="Track Usage"
            description="See how many developers are using your skills via analytics."
          />
        </div>

        <Paragraph className="mt-4">
          Click the <strong>Publish</strong> button in the navigation to submit your design. 
          Fill out the form with your design details, upload a preview screenshot, and submit. 
          All submissions are reviewed before appearing in the gallery.
        </Paragraph>
      </Section>

      <Section id="resources">
        <Heading id="resources">Resources</Heading>
        <div className="grid gap-3 sm:grid-cols-2">
          <ResourceCard 
            title="GitHub Repository"
            description="Source code, issues, and contributions"
            href="https://github.com/abboskhonov/tokenui"
            icon={<HugeiconsIcon icon={GithubIcon} className="size-4" />}
          />
          <ResourceCard 
            title="CLI Reference"
            description="Complete command documentation"
            href="/docs/cli"
            icon={<HugeiconsIcon icon={CommandLineIcon} className="size-4" />}
          />
          <ResourceCard 
            title="Platform"
            description="Understanding the TokenUI architecture"
            href="/docs/platform"
            icon={<HugeiconsIcon icon={Layers01Icon} className="size-4" />}
          />
          <ResourceCard 
            title="FAQ"
            description="Common questions and answers"
            href="/docs/faq"
            icon={<HugeiconsIcon icon={HelpCircleIcon} className="size-4" />}
          />
        </div>
      </Section>
    </DocsPage>
  )
}
