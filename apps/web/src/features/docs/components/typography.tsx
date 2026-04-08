import { cn } from "@/lib/utils"

interface SectionProps {
  children: React.ReactNode
  className?: string
  id?: string
}

export function Section({ children, className, id }: SectionProps) {
  return (
    <section id={id} className={cn("space-y-4", className)}>
      {children}
    </section>
  )
}

interface HeadingProps {
  children: React.ReactNode
  className?: string
  id?: string
}

export function Heading({ children, className, id }: HeadingProps) {
  return (
    <h2 id={id} className={cn("text-2xl font-semibold tracking-tight mt-10 mb-4 scroll-mt-24", className)}>
      {children}
    </h2>
  )
}

export function SubHeading({ children, className, id }: HeadingProps) {
  return (
    <h3 id={id} className={cn("text-lg font-medium mt-8 mb-3 scroll-mt-24", className)}>
      {children}
    </h3>
  )
}

interface ParagraphProps {
  children: React.ReactNode
  className?: string
}

export function Paragraph({ children, className }: ParagraphProps) {
  return (
    <p className={cn("text-muted-foreground leading-relaxed", className)}>
      {children}
    </p>
  )
}

interface ListProps {
  items: React.ReactNode[]
  className?: string
}

export function List({ items, className }: ListProps) {
  return (
    <ul className={cn("list-disc pl-5 space-y-1.5 text-muted-foreground", className)}>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  )
}

interface StepProps {
  number: number
  title: string
  children: React.ReactNode
}

export function Step({ number, title, children }: StepProps) {
  return (
    <div className="flex gap-4">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-medium">
        {number}
      </div>
      <div className="space-y-2">
        <h4 className="font-medium">{title}</h4>
        <div className="text-sm text-muted-foreground">{children}</div>
      </div>
    </div>
  )
}
