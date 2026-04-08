interface ResourceCardProps {
  title: string
  description: string
  href: string
  icon?: React.ReactNode
}

export function ResourceCard({ title, description, href, icon }: ResourceCardProps) {
  return (
    <a 
      href={href}
      className="group block rounded-lg border border-border bg-card p-4 hover:border-foreground/20 transition-colors"
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium group-hover:text-foreground transition-colors">
            {title}
          </h4>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        <span className="text-muted-foreground group-hover:text-foreground transition-colors">→</span>
      </div>
    </a>
  )
}
