"use client"

import { DocsPage } from "../components/doc-page"
import { CodeBlock } from "../components/code-block"
import { Section, Heading, SubHeading, Paragraph, List, Step } from "../components/typography"
import type { TOCItem } from "../components/table-of-contents"

const tocItems: TOCItem[] = [
  { id: "what-is-a-skill", text: "What is a Skill?", level: 2 },
  { id: "getting-started", text: "Getting Started", level: 2 },
  { id: "skill-lifecycle", text: "Skill Lifecycle", level: 2 },
  { id: "writing-good-documentation", text: "Writing Good Documentation", level: 2 },
  { id: "creating-a-demo-preview", text: "Creating a Demo Preview", level: 2 },
  { id: "studio-dashboard", text: "Studio Dashboard", level: 2 },
  { id: "best-practices", text: "Best Practices", level: 2 },
  { id: "ownership-licensing", text: "Ownership & Licensing", level: 2 }
]

export function DocsPublishingPage() {
  return (
    <DocsPage
      title="Publishing Skills"
      description="Create, document, and share your design skills with the TokenUI community."
      breadcrumbItems={[
        { label: "Docs", href: "/docs" },
        { label: "Publishing Skills" }
      ]}
      tocItems={tocItems}
    >
      <Section>
        <Heading id="what-is-a-skill">What is a Skill?</Heading>
        <Paragraph>
          A skill is a self-contained package of design knowledge. It can include UI components, 
          design patterns, coding conventions, or any reusable pattern that helps developers 
          build consistent interfaces.
        </Paragraph>
        <Paragraph>
          Skills are stored as SKILL.md files with YAML frontmatter describing the skill's 
          metadata, followed by markdown documentation explaining how to use it.
        </Paragraph>
      </Section>

      <Section>
        <Heading id="getting-started">Getting Started</Heading>
        
        <Step number={1} title="Create Your Skill">
          Start by navigating to the <a href="/publish" className="text-foreground underline">Publish page</a> 
          or run the CLI command:
          <div className="mt-3">
            <CodeBlock code="npx tokenui.sh publish" />
          </div>
        </Step>

        <Step number={2} title="Write Documentation">
          Write your skill documentation in the code editor. The main file is always 
          <code className="mx-1 px-1.5 py-0.5 rounded bg-muted text-sm font-mono">SKILL.md</code>, 
          which contains the YAML frontmatter and markdown content.
        </Step>

        <Step number={3} title="Add Code Files">
          You can add additional files to your skill — examples, component code, styles, etc. 
          Organize them in a folder structure that makes sense for your skill.
        </Step>

        <Step number={4} title="Add Metadata">
          Fill in your skill's metadata: name, slug, description, category, and upload a 
          preview thumbnail. This information helps others find and understand your skill.
        </Step>

        <Step number={5} title="Submit">
          Submit your skill for review. You can save it as a draft to keep working on it, 
          or submit it for approval to appear in the public gallery.
        </Step>
      </Section>

      <Section>
        <Heading id="skill-lifecycle">Skill Lifecycle</Heading>
        
        <SubHeading id="skill-lifecycle-draft">Draft</SubHeading>
        <Paragraph>
          When you first create a skill, it starts as a draft. Drafts are private — only you 
          can see them. Use this stage to iterate on your design, documentation, and examples 
          until you're ready to share.
        </Paragraph>

        <SubHeading>Pending</SubHeading>
        <Paragraph>
          When you submit your skill, it enters the pending state. An admin will review 
          your submission to ensure it meets quality standards and doesn't contain inappropriate 
          content. This usually takes 1-2 business days.
        </Paragraph>

        <SubHeading>Approved</SubHeading>
        <Paragraph>
          Once approved, your skill appears in the public gallery. Other users can discover 
          it, install it, and use it in their projects. You'll be able to see analytics like 
          views, stars, and downloads in your Studio dashboard.
        </Paragraph>

        <SubHeading>Rejected</SubHeading>
        <Paragraph>
          If your skill doesn't meet the guidelines, it will be rejected with feedback 
          on what needs to be changed. You can edit your skill and resubmit it.
        </Paragraph>
      </Section>

      <Section>
        <Heading id="writing-good-documentation">Writing Good Documentation</Heading>
        
        <SubHeading id="writing-good-documentation-frontmatter">Frontmatter</SubHeading>
        <Paragraph>
          Every SKILL.md file starts with YAML frontmatter between triple dashes:
        </Paragraph>
        <CodeBlock 
          filename="SKILL.md"
          code={`---
name: my-skill
description: A brief description of what this skill does
---`}
        />

        <SubHeading id="writing-good-documentation-content-structure">Content Structure</SubHeading>
        <Paragraph>
          Good skill documentation includes:
        </Paragraph>
        <List items={[
          <><strong>Description</strong> — What the skill does and when to use it</>,
          <><strong>Usage</strong> — How to tell AI agents to use this skill</>,
          <><strong>Examples</strong> — Code examples showing the skill in action</>,
          <><strong>API Reference</strong> — If applicable, document props/options</>,
          <><strong>Best Practices</strong> — Guidelines for using the skill correctly</>
        ]} />

        <SubHeading id="writing-good-documentation-tips">Tips for AI-Optimized Skills</SubHeading>
        <List items={[
          <>Be specific and clear in your instructions</>,
          <>Include example prompts that users can copy</>,
          <>Document common mistakes and how to avoid them</>,
          <>Provide context on when NOT to use the skill</>
        ]} />
      </Section>

      <Section>
        <Heading id="creating-a-demo-preview">Creating a Demo Preview</Heading>
        <Paragraph>
          A good preview helps users understand what your skill does before installing it. 
          In the publish flow, you can:
        </Paragraph>
        <List items={[
          <>Upload a screenshot or image showing the skill in action</>,
          <>Write HTML demo code that renders an interactive preview</>,
          <>Toggle between desktop and mobile views to show responsiveness</>
        ]} />
        
        <Paragraph className="mt-4">
          The demo HTML can include Tailwind CSS classes — they'll be rendered in the preview 
          using the Tailwind CDN.
        </Paragraph>
      </Section>

      <Section>
        <Heading id="studio-dashboard">Studio Dashboard</Heading>
        <Paragraph>
          Your <a href="/studio" className="text-foreground underline">Studio</a> is where 
          you manage all your skills. From here you can:
        </Paragraph>
        <List items={[
          <>View all your skills organized by status (draft, pending, approved, rejected)</>,
          <>See analytics: views, stars, and CLI downloads</>,
          <>Edit existing skills</>,
          <>Delete skills you no longer want to share</>
        ]} />
      </Section>

      <Section>
        <Heading id="best-practices">Best Practices</Heading>
        
        <SubHeading id="best-practices-focus">Focus</SubHeading>
        <Paragraph>
          A great skill does one thing well. Don't try to pack too many unrelated patterns 
          into a single skill. If you have multiple related patterns, consider creating a 
          skill for each or a comprehensive design system skill.
        </Paragraph>

        <SubHeading id="best-practices-accessibility">Accessibility</SubHeading>
        <Paragraph>
          Document accessibility considerations. If your skill includes UI components, 
          mention keyboard navigation, screen reader support, and ARIA attributes.
        </Paragraph>

        <SubHeading id="best-practices-flexibility">Flexibility</SubHeading>
        <Paragraph>
          Make your skill adaptable. Document how users can customize the patterns to match 
          their own design systems.
        </Paragraph>

        <SubHeading id="best-practices-testing">Testing</SubHeading>
        <Paragraph>
          Test your skill documentation with actual AI agents. Make sure the instructions 
          are clear enough for an AI to follow correctly.
        </Paragraph>
      </Section>

      <Section>
        <Heading id="ownership-licensing">Ownership & Licensing</Heading>
        <Paragraph>
          You retain ownership of your skills. By publishing, you grant TokenUI users a license 
          to use your skill according to the license you specify. We recommend using MIT license 
          for maximum compatibility, but you can choose any license you prefer.
        </Paragraph>
        <Paragraph>
          You can remove your skills from the gallery at any time. However, users who have 
          already installed the skill will retain their copy.
        </Paragraph>
      </Section>
    </DocsPage>
  )
}
