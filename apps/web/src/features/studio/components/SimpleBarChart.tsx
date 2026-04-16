"use client"

import { Bar, BarChart, XAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const days = ["M", "T", "W", "T", "F", "S", "S"]

const chartConfig = {
  value: {
    label: "Count",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

interface SimpleBarChartProps {
  data: number[]
}

export default function SimpleBarChart({ data }: SimpleBarChartProps) {
  // Ensure we have exactly 7 data points
  const normalizedData = data.slice(0, 7)
  while (normalizedData.length < 7) {
    normalizedData.push(0)
  }

  // Transform data for the chart
  const chartData = days.map((day, i) => ({
    day,
    value: normalizedData[i] ?? 0,
  }))

  return (
    <div className="mt-3 h-24">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <BarChart data={chartData} accessibilityLayer margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tickMargin={4}
            className="text-[10px]"
          />
          <ChartTooltip
            cursor={{ fill: "var(--muted)", opacity: 0.3 }}
            content={<ChartTooltipContent hideLabel />}
          />
          <Bar
            dataKey="value"
            fill="var(--color-value)"
            radius={[2, 2, 0, 0]}
            maxBarSize={24}
          />
        </BarChart>
      </ChartContainer>
    </div>
  )
}
