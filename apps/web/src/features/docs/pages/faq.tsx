"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { DocsPage } from "../components/doc-page"
import { Section, Heading } from "../components/typography"
import type { TOCItem } from "../components/table-of-contents"

interface FAQItemProps {
  question: string
  children: React.ReactNode
  defaultOpen?: boolean
}

function FAQItem({ question, children, defaultOpen = false }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <h3 className="font-medium pr-4">{question}</h3>
        <span className={cn(
          "text-muted-foreground transition-transform",
          isOpen && "rotate-180"
        )}>
          ↓
        </span>
      </button>
      <div className={cn(
        "overflow-hidden transition-all",
        isOpen ? "max-h-[500px] pb-4" : "max-h-0"
      )}>
        <div className="text-muted-foreground leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  )
}

function CodeBlock({ command }: { command: string }) {
  return (
    <div className="my-3 rounded-lg bg-muted p-3">
      <code className="text-sm font-mono">{command}</code>
    </div>
  )
}

const tocItems: TOCItem[] = [
  { id: "general", text: "General", level: 2 },
  { id: "getting-started", text: "Getting Started", level: 2 },
  { id: "skills-components", text: "Skills & Components", level: 2 },
  { id: "publishing", text: "Publishing", level: 2 },
  { id: "ai-agents", text: "AI & Agents", level: 2 },
  { id: "troubleshooting", text: "Troubleshooting", level: 2 }
]

export function DocsFAQPage() {
  return (
    <DocsPage
      title="FAQ"
      description="Frequently asked questions about TasteUI. Can't find what you're looking for? Reach out to us on Discord or GitHub."
      breadcrumbItems={[
        { label: "Docs", href: "/docs" },
        { label: "FAQ" }
      ]}
      tocItems={tocItems}
    >
      {/* General */}
      <Section id="general">
        <Heading>General</Heading>
        
        <FAQItem question="What is TasteUI?" defaultOpen={true}>
          <p>
            TasteUI is a platform for discovering and sharing UI components and design patterns. 
            It provides a curated collection of "skills" — reusable code snippets, components, 
            and design tokens that help developers and AI agents build consistent interfaces.
          </p>
        </FAQItem>

        <FAQItem question="Who is TasteUI for?">
          <p>
            TasteUI is designed for both developers and AI agents. Whether you're building 
            a prototype, a production app, or using an AI coding assistant, TasteUI provides 
            ready-to-use components that follow best practices.
          </p>
        </FAQItem>

        <FAQItem question="Is TasteUI free to use?">
          <p>
            Yes, all skills on TasteUI are free to use. The platform is open-source and 
            community-driven. Some skills may have specific licenses (MIT, Apache 2.0, etc.) 
            which are displayed on their detail pages.
          </p>
        </FAQItem>
      </Section>

      {/* Getting Started */}
      <Section id="getting-started">
        <Heading>Getting Started</Heading>
        
        <FAQItem question="Do I need to install anything?">
          <p>
            No installation required for basic usage. You can use npx to run the CLI directly:
          </p>
          <CodeBlock command="npx tasteui.dev add <skill-name>" />
          <p>
            If you prefer, you can install the CLI globally with npm install -g tasteui.
          </p>
        </FAQItem>

        <FAQItem question="What frameworks are supported?">
          <p>
            TasteUI is built primarily for React applications using TypeScript and Tailwind CSS. 
            Many skills will work with other setups, but the best experience is with:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>React 18+ with TypeScript</li>
            <li>Tailwind CSS for styling</li>
            <li>Any build tool (Vite, Next.js, Remix, etc.)</li>
          </ul>
        </FAQItem>

        <FAQItem question="How do I add my first skill?">
          <p>
            Browse the gallery, find a skill you like, and run:
          </p>
          <CodeBlock command="npx tasteui.dev add <skill-name>" />
          <p>
            The CLI will install the skill and all its dependencies to your project.
          </p>
        </FAQItem>
      </Section>

      {/* Skills & Components */}
      <Section id="skills-components">
        <Heading>Skills & Components</Heading>
        
        <FAQItem question="What is a skill?">
          <p>
            A skill is a self-contained package that can include:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>React components with TypeScript</li>
            <li>Styling (Tailwind classes or CSS)</li>
            <li>Design tokens (colors, spacing, typography)</li>
            <li>Documentation and usage examples</li>
            <li>Required dependencies</li>
          </ul>
        </FAQItem>

        <FAQItem question="Can I customize the components?">
          <p>
            Absolutely! Once installed, skills are just code in your project. You can modify 
            them however you like. Most components use Tailwind classes for styling, making 
            customization straightforward.
          </p>
        </FAQItem>

        <FAQItem question="Do skills work with my existing design system?">
          <p>
            Yes. Skills can be adapted to match your design system. You can either:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Customize the installed components directly</li>
            <li>Use CSS variables to override default styles</li>
            <li>Create wrapper components that match your system</li>
          </ul>
        </FAQItem>

        <FAQItem question="How do I update a skill?">
          <p>
            Use the update command to get the latest version:
          </p>
          <CodeBlock command="npx tasteui.dev update <skill-name>" />
          <p>
            Or update all skills at once:
          </p>
          <CodeBlock command="npx tasteui.dev update --all" />
        </FAQItem>
      </Section>

      {/* Publishing */}
      <Section id="publishing">
        <Heading>Publishing</Heading>
        
        <FAQItem question="How do I publish a skill?">
          <p>
            Click the "Publish" button in the navigation, or run:
          </p>
          <CodeBlock command="npx tasteui.dev publish" />
          <p>
            Fill out the form with your skill details, upload a preview screenshot, 
            and submit. All submissions are reviewed before appearing in the gallery.
          </p>
        </FAQItem>

        <FAQItem question="What makes a good skill?">
          <p>
            A great skill is:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Focused</strong> — Does one thing well</li>
            <li><strong>Documented</strong> — Clear usage instructions</li>
            <li><strong>Accessible</strong> — Works with keyboard and screen readers</li>
            <li><strong>Flexible</strong> — Easy to customize via props</li>
            <li><strong>Tested</strong> — Works in common scenarios</li>
          </ul>
        </FAQItem>

        <FAQItem question="Can I publish work-in-progress skills?">
          <p>
            Yes, you can save skills as drafts. They won't appear in the public gallery 
            until you explicitly publish them. This is useful for iterating on your designs 
            before sharing.
          </p>
        </FAQItem>

        <FAQItem question="Who owns the skills I publish?">
          <p>
            You retain ownership of your work. By publishing, you grant TasteUI users a 
            license to use your skill according to the license you specify (MIT recommended). 
            You can remove your skills from the gallery at any time.
          </p>
        </FAQItem>
      </Section>

      {/* AI & Agents */}
      <Section id="ai-agents">
        <Heading>AI & Agents</Heading>
        
        <FAQItem question="Can AI agents use TasteUI?">
          <p>
            Yes! TasteUI is designed with AI agents in mind. The CLI provides structured 
            output that agents can parse, and the skill format is designed to be machine-readable 
            with clear dependencies and usage patterns.
          </p>
        </FAQItem>

        <FAQItem question="How do I use TasteUI with AI coding assistants?">
          <p>
            When working with AI agents, you can reference TasteUI skills in your prompts:
          </p>
          <div className="my-3 rounded-lg bg-muted/50 p-3 border-l-2 border-border">
            <p className="text-sm italic">
              "Create a login form using the tasteui form and button skills"
            </p>
          </div>
          <p>
            The agent can then use the CLI to install the appropriate skills.
          </p>
        </FAQItem>

        <FAQItem question="Does TasteUI work with specific AI tools?">
          <p>
            TasteUI is platform-agnostic. It works with any AI coding assistant that can:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Run terminal commands (Claude, GPT-4, Copilot, etc.)</li>
            <li>Read and write files</li>
            <li>Understand component-based architectures</li>
          </ul>
        </FAQItem>
      </Section>

      {/* Troubleshooting */}
      <Section id="troubleshooting">
        <Heading>Troubleshooting</Heading>
        
        <FAQItem question="The CLI command isn't working">
          <p>
            First, ensure you have Node.js 18+ installed:
          </p>
          <CodeBlock command="node --version" />
          <p>
            If npx isn't working, try installing the CLI globally:
          </p>
          <CodeBlock command="npm install -g tasteui" />
          <p>
            Then use tasteui directly without npx.
          </p>
        </FAQItem>

        <FAQItem question="A skill won't install">
          <p>
            Common issues and solutions:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Check your internet connection</li>
            <li>Verify the skill name is correct</li>
            <li>Use --verbose flag to see detailed error messages</li>
            <li>Try with --force to overwrite existing files</li>
          </ul>
        </FAQItem>

        <FAQItem question="Styles aren't applying correctly">
          <p>
            Ensure Tailwind CSS is properly configured in your project. Skills assume 
            standard Tailwind utility classes are available. Check that your tailwind.config.js 
            includes the paths to your component files.
          </p>
        </FAQItem>

        <FAQItem question="How do I report a bug?">
          <p>
            For CLI bugs, open an issue on the TasteUI GitHub repository with:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Your Node.js version</li>
            <li>The exact command you ran</li>
            <li>The error message (use --verbose)</li>
            <li>Your operating system</li>
          </ul>
          <p className="mt-2">
            For skill-specific bugs, leave a comment on the skill's detail page.
          </p>
        </FAQItem>
      </Section>

      {/* Still have questions */}
      <section className="rounded-lg bg-muted p-6">
        <h3 className="font-semibold mb-2">Still have questions?</h3>
        <p className="text-muted-foreground mb-4">
          Join our community or reach out directly.
        </p>
        <div className="flex flex-col gap-2">
          <a 
            href="https://discord.gg/tasteui" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-foreground hover:underline"
          >
            Join our Discord →
          </a>
          <a 
            href="https://github.com/tasteui/tasteui/issues" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-foreground hover:underline"
          >
            GitHub Issues →
          </a>
          <a 
            href="mailto:support@tasteui.dev" 
            className="text-sm text-foreground hover:underline"
          >
            Email support →
          </a>
        </div>
      </section>
    </DocsPage>
  )
}
