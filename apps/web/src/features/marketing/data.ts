import {
  CommandLineIcon,
  Clock01Icon,
  StarIcon,
} from "@hugeicons/core-free-icons"

export interface NavItem {
  id: string
  label: string
  icon?: typeof StarIcon
  hasArrow?: boolean
  href?: string
}

export interface NavSection {
  title?: string
  items: NavItem[]
}

export interface Skill {
  id: string
  name: string
  owner: string
  repo: string
  installs: string
  variant: "audit" | "layout" | "skills" | "search" | "command" | "pattern"
  description: string
}

export interface Category {
  name: string
  count: number
}

export interface SidebarItem {
  icon: typeof StarIcon
  label: string
  active: boolean
}

export const sidebarItems: SidebarItem[] = [
  { icon: StarIcon, label: "Featured", active: true },
  { icon: Clock01Icon, label: "Newest", active: false },
  { icon: StarIcon, label: "Best of the Week", active: false },
  { icon: CommandLineIcon, label: "Themes", active: false },
]

export const categories: Category[] = [
  { name: "SaaS", count: 0 },
  { name: "Business", count: 0 },
  { name: "E-commerce", count: 0 },
  { name: "Portfolio", count: 0 },
  { name: "Marketing", count: 0 },
  { name: "Fitness", count: 0 },
  { name: "Education", count: 0 },
  { name: "Events", count: 0 },
  { name: "Food", count: 0 },
  { name: "Home", count: 0 },
  { name: "Lifestyle", count: 0 },
  { name: "Travel", count: 0 },
  { name: "Utility", count: 0 },
  { name: "Services", count: 0 },
  { name: "Agency", count: 0 },
  { name: "Other", count: 0 },
]

// Export for type checking against backend
export const VALID_CATEGORIES = categories.map(c => c.name)

export const skills: Skill[] = [
  {
    id: "1",
    name: "background-paths",
    owner: "vercel-labs",
    repo: "skills",
    installs: "753.1K",
    variant: "pattern",
    description: "Animated flowing line backgrounds",
  },
  {
    id: "2",
    name: "ai-command-palette",
    owner: "vercel-labs",
    repo: "agent-skills",
    installs: "256.6K",
    variant: "command",
    description: "Command palette with AI integration",
  },
  {
    id: "3",
    name: "falling-pattern",
    owner: "anthropics",
    repo: "skills",
    installs: "211.9K",
    variant: "pattern",
    description: "Dotted matrix falling animation",
  },
  {
    id: "4",
    name: "spotlight-search",
    owner: "stripe",
    repo: "agent-skills",
    installs: "189.2K",
    variant: "search",
    description: "Spotlight-style search interface",
  },
  {
    id: "5",
    name: "hero-morph",
    owner: "github",
    repo: "skills",
    installs: "167.8K",
    variant: "layout",
    description: "Morphing hero section transitions",
  },
  {
    id: "6",
    name: "gradient-mesh",
    owner: "prisma",
    repo: "skills",
    installs: "143.5K",
    variant: "audit",
    description: "Animated gradient mesh backgrounds",
  },
]

