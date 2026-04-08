"use client"

import { DocsPage } from "../components/doc-page"
import { CodeBlock } from "../components/code-block"
import { Section, Heading, SubHeading, Paragraph, List } from "../components/typography"
import type { TOCItem } from "../components/table-of-contents"

const tocItems: TOCItem[] = [
  { id: "overview", text: "Overview", level: 2 },
  { id: "file-structure", text: "File Structure", level: 2 },
  { id: "frontmatter-fields", text: "Frontmatter Fields", level: 2 },
  { id: "content-sections", text: "Content Sections", level: 2 },
  { id: "multi-file-skills", text: "Multi-File Skills", level: 2 },
  { id: "design-tokens", text: "Design Tokens", level: 2 },
  { id: "ai-optimized-writing", text: "AI-Optimized Writing Tips", level: 2 },
  { id: "validation", text: "Validation", level: 2 },
  { id: "examples", text: "Examples", level: 2 }
]

export function DocsFormatPage() {
  return (
    <DocsPage
      title="Skill Format"
      description="The SKILL.md format specification for creating agent-readable documentation."
      breadcrumbItems={[
        { label: "Docs", href: "/docs" },
        { label: "Skill Format" }
      ]}
      tocItems={tocItems}
    >
      <Section>
        <Heading id="overview">Overview</Heading>
        <Paragraph>
          Skills are documented using SKILL.md files — a markdown-based format with YAML 
          frontmatter that both humans and AI agents can read and understand. This format 
          is inspired by skill systems used by AI coding agents like Claude Code.
        </Paragraph>
        <Paragraph>
          The format is intentionally simple: frontmatter for metadata, markdown for content. 
          This makes skills easy to write, version control, and distribute.
        </Paragraph>
      </Section>

      <Section>
        <Heading id="file-structure">File Structure</Heading>
        <Paragraph>
          A minimal skill contains just one file:
        </Paragraph>
        <CodeBlock 
          filename="SKILL.md"
          code={`---
name: my-skill
description: What this skill does
---

# My Skill

Instructions for using this skill...`}
        />
        <Paragraph>
          More complex skills can include additional files:
        </Paragraph>
        <CodeBlock 
          filename="File Structure"
          code={`my-skill/
├── SKILL.md          # Main documentation
├── component.tsx     # Component code
├── styles.css        # Styling
└── example.tsx       # Usage example`}
        />
      </Section>

      <Section>
        <Heading id="frontmatter-fields">Frontmatter Fields</Heading>
        <Paragraph>
          The frontmatter section (between the triple dashes) contains metadata about the skill:
        </Paragraph>

        <SubHeading id="frontmatter-required">Required Fields</SubHeading>
        <List items={[
          <><strong>name</strong> — The skill name (kebab-case recommended)</>,
          <><strong>description</strong> — A brief description of what the skill does</>
        ]} />

        <SubHeading id="frontmatter-optional">Optional Fields</SubHeading>
        <List items={[
          <><strong>user-invocable</strong> — Whether users can directly invoke this skill (default: true)</>,
          <><strong>allowed-tools</strong> — List of tools this skill can use</>,
          <><strong>version</strong> — Semantic version of the skill</>,
          <><strong>author</strong> — Author name or username</>,
          <><strong>license</strong> — License type (MIT, Apache-2.0, etc.)</>
        ]} />

        <SubHeading id="frontmatter-example">Example Frontmatter</SubHeading>
        <CodeBlock 
          filename="SKILL.md"
          code={`---
name: button-component
description: Guidelines for creating accessible, consistent buttons
user-invocable: true
allowed-tools: Bash(npm install *), Edit, Write
version: 1.0.0
author: johndoe
license: MIT
---`}
        />
      </Section>

      <Section>
        <Heading id="content-sections">Content Sections</Heading>
        <Paragraph>
          The markdown content after the frontmatter should include these standard sections:
        </Paragraph>

        <SubHeading id="content-title-desc">1. Title and Description</SubHeading>
        <CodeBlock 
          filename="SKILL.md"
          code={`# Button Component

Guidelines for creating consistent, accessible buttons across your application.`}
        />

        <SubHeading id="content-usage">2. Usage</SubHeading>
        <Paragraph>
          Explain how users (or AI agents) should invoke this skill:
        </Paragraph>
        <CodeBlock 
          filename="SKILL.md"
          code={`## Usage

When creating buttons, tell the AI:

> "Use the button-component skill to create a primary submit button"

The skill will ensure:
- Proper semantic HTML (<button> not <div>)
- Accessible focus states
- Consistent sizing and spacing
- Theme-aware colors`}
        />

        <SubHeading id="content-examples">3. Examples</SubHeading>
        <Paragraph>
          Provide concrete examples showing the skill in action:
        </Paragraph>
        <CodeBlock 
          filename="SKILL.md"
          code={`## Examples

### Primary Button

\`\`\`tsx
<Button variant="primary" size="md">
  Submit
</Button>
\`\`\`

### With Icon

\`\`\`tsx
<Button variant="secondary" size="sm">
  <DownloadIcon />
  Download
</Button>
\`\`\``}
        />

        <SubHeading id="content-api">4. API Reference</SubHeading>
        <Paragraph>
          Document props, options, or configuration:
        </Paragraph>
        <CodeBlock 
          filename="SKILL.md"
          code={`## API Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'primary' \\| 'secondary' \\| 'ghost' | 'primary' | Visual style |
| size | 'sm' \\| 'md' \\| 'lg' | 'md' | Button size |
| disabled | boolean | false | Disabled state |`}
        />

        <SubHeading id="content-best-practices">5. Best Practices</SubHeading>
        <Paragraph>
          Include guidelines for using the skill correctly:
        </Paragraph>
        <CodeBlock 
          filename="SKILL.md"
          code={`## Best Practices

- Always use \`type="button"\` unless it's a submit
- Include loading states for async actions
- Ensure 44×44dp minimum touch target
- Don't override colors directly — use CSS variables`}
        />
      </Section>

      <Section>
        <Heading id="multi-file-skills">Multi-File Skills</Heading>
        <Paragraph>
          For complex skills with multiple components or files, organize them in a logical 
          structure. The SKILL.md should serve as the entry point and reference other files 
          as needed.
        </Paragraph>

        <SubHeading id="multi-file-referencing">Referencing Other Files</SubHeading>
        <CodeBlock 
          filename="SKILL.md"
          code={`# Form System

This skill includes multiple components for building forms.

## Files

- \`form.tsx\` — Main form component with validation
- \`field.tsx\` — Individual field wrapper
- \`validation.ts\` — Validation utilities

See the individual files for implementation details.`}
        />
      </Section>

      <Section>
        <Heading id="design-tokens">Design Tokens</Heading>
        <Paragraph>
          If your skill defines design tokens (colors, spacing, typography), document them 
          in a clear, referenceable format:
        </Paragraph>
        <CodeBlock 
          filename="SKILL.md"
          code={`## Design Tokens

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| --color-primary | #3b82f6 | Primary actions |
| --color-secondary | #64748b | Secondary actions |

### Spacing

| Token | Value |
|-------|-------|
| --space-1 | 0.25rem (4px) |
| --space-2 | 0.5rem (8px) |
| --space-3 | 0.75rem (12px) |
| --space-4 | 1rem (16px) |`}
        />
      </Section>

      <Section>
        <Heading id="ai-optimized-writing">AI-Optimized Writing Tips</Heading>
        
        <SubHeading id="ai-optimized-explicit">Be Explicit</SubHeading>
        <Paragraph>
          Don't assume the AI will infer what you mean. Be explicit about:
        </Paragraph>
        <List items={[
          <>What problem the skill solves</>,
          <>When to use it vs. alternatives</>,
          <>What files to create/modify</>,
          <>What dependencies are needed</>
        ]} />

        <SubHeading id="ai-optimized-imperative">Use Imperative Voice</SubHeading>
        <Paragraph>
          Write instructions as commands:
        </Paragraph>
        <CodeBlock 
          filename="SKILL.md"
          code={`## Usage

1. Import the Button component from @/components/ui/button
2. Use the 'variant' prop to set the visual style
3. Always include an aria-label for icon-only buttons`}
        />

        <SubHeading id="ai-optimized-context">Provide Context</SubHeading>
        <Paragraph>
          Explain why patterns are used, not just what to do:
        </Paragraph>
        <CodeBlock 
          filename="SKILL.md"
          code={`## Why These Patterns?

Buttons use CSS Grid for layout instead of Flexbox because:
- Grid handles misaligned content better
- Easier to implement the loading state spinner
- Consistent alignment regardless of content length`}
        />
      </Section>

      <Section>
        <Heading id="validation">Validation</Heading>
        <Paragraph>
          To validate your SKILL.md format:
        </Paragraph>
        <List items={[
          <>Ensure frontmatter is valid YAML</>,
          <>Check that name and description fields exist</>,
          <>Verify markdown renders correctly</>,
          <>Test the skill with an AI agent</>
        ]} />
      </Section>

      <Section>
        <Heading id="examples">Examples</Heading>
        <Paragraph>
          Here are some real-world skill examples from the TokenUI registry:
        </Paragraph>
        
        <SubHeading id="examples-simple">Simple Component Skill</SubHeading>
        <CodeBlock 
          filename="Example: Button Skill"
          code={`---
name: button
description: Accessible button component with variants
---

# Button Component

Create consistent, accessible buttons.

## Usage

"Use the button skill to create a primary CTA button"

## Variants

- primary: Main actions, solid background
- secondary: Alternative actions, outlined
- ghost: Low emphasis, no background`}
        />

        <SubHeading id="examples-complex">Complex System Skill</SubHeading>
        <CodeBlock 
          filename="Example: Design System Skill"
          code={`---
name: design-system
description: Complete design system for React applications
---

# Design System

Comprehensive tokens and components.

## Tokens

See tokens.css for:
- Colors (primary, secondary, semantic)
- Typography (font, sizes, weights)
- Spacing (4px base grid)
- Shadows and elevations

## Components

- Button — All variants documented
- Card — With proper elevation
- Input — With validation states

## Usage

Reference specific component:
"Use the button from design-system skill"`}
        />
      </Section>
    </DocsPage>
  )
}
