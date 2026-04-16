export interface StatsCardProps {
  label: string
  value: number
  icon: React.ReactNode
  chartData?: number[]
}

export interface StatsCardSkeletonProps {
  icon: React.ReactNode
}

interface StatsCardBaseProps {
  label: string
  value: number
  icon: React.ReactNode
  chartContent?: React.ReactNode
}

export function StatsCardBase({ label, value, icon, chartContent }: StatsCardBaseProps) {
  return (
    <div className="rounded-xl bg-card/50 p-4 ring-1 ring-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          {icon}
          <span className="text-sm">{label}</span>
        </div>
        <span className="text-2xl font-semibold">{value.toLocaleString()}</span>
      </div>
      {chartContent}
    </div>
  )
}

export function StatsCardSkeleton({ icon }: StatsCardSkeletonProps) {
  return (
    <div className="rounded-xl bg-card/50 p-4 ring-1 ring-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground/50">
          {icon}
          <span className="text-sm bg-muted rounded w-16 h-4 animate-pulse" />
        </div>
        <div className="h-7 w-12 bg-muted rounded animate-pulse" />
      </div>
      {/* Skeleton chart */}
      <div className="mt-3 flex gap-2 h-24">
        <div className="flex flex-col justify-between text-[9px] text-muted-foreground/30 w-5 text-right pr-1 py-1">
          <span>—</span>
          <span>—</span>
          <span>—</span>
          <span>—</span>
        </div>
        <div className="flex-1 flex items-end justify-between gap-1.5 relative py-1">
          {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-1 flex-1 h-full justify-end">
              <div
                className="w-full rounded-t-sm bg-primary/20 animate-pulse"
                style={{
                  height: `${20 + Math.random() * 30}%`,
                  animationDelay: `${i * 100}ms`,
                }}
              />
              <span className="text-[10px] font-medium text-muted-foreground/40">
                {day}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
