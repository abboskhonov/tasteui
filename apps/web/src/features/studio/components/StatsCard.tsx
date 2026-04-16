"use client"

import { lazy, Suspense } from "react"
import type { StatsCardProps, StatsCardSkeletonProps } from "./StatsCardBase"
import { StatsCardBase, StatsCardSkeleton as BaseSkeleton } from "./StatsCardBase"

// Lazy load the chart component - this creates a separate chunk
const LazySimpleBarChart = lazy(() => import("./SimpleBarChart"))

// Loading fallback for the chart
function ChartLoadingFallback() {
  return (
    <div className="mt-3 flex gap-2 h-24 animate-pulse">
      <div className="flex-1 flex items-end justify-between gap-1.5">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="w-full rounded-t-sm bg-primary/20"
            style={{
              height: `${20 + Math.random() * 30}%`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export function StatsCardSkeleton({ icon }: StatsCardSkeletonProps) {
  return <BaseSkeleton icon={icon} />
}

export function StatsCard({ label, value, icon, chartData }: StatsCardProps) {
  return (
    <StatsCardBase
      label={label}
      value={value}
      icon={icon}
      chartContent={
        chartData ? (
          <Suspense fallback={<ChartLoadingFallback />}>
            <LazySimpleBarChart data={chartData} />
          </Suspense>
        ) : null
      }
    />
  )
}
