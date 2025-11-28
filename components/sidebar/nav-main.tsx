/*
<ai_context>
This client component provides the main navigation for the sidebar.
Groups navigation items by category (Content, Student) with active state tracking.
</ai_context>
*/

"use client"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { type LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface NavItem {
  title: string
  url: string
  icon?: LucideIcon
  action?: {
    icon: LucideIcon
    url: string
    label: string
    text?: string
  }
}

interface NavGroup {
  label: string
  items: NavItem[]
}

interface NavMainProps {
  groups: NavGroup[]
}

export function NavMain({ groups }: NavMainProps) {
  const pathname = usePathname()

  return (
    <TooltipProvider>
      {groups.map(group => (
        <SidebarGroup key={group.label}>
          <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
            {group.label}
          </SidebarGroupLabel>
          <SidebarMenu>
            {group.items.map(item => {
              const isActive =
                pathname === item.url || pathname.startsWith(`${item.url}/`)

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isActive}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <Link
                        href={item.url}
                        className="flex flex-1 items-center gap-2"
                      >
                        {item.icon && (
                          <item.icon className="size-4 shrink-0" />
                        )}
                        <span className="truncate">{item.title}</span>
                      </Link>

                      {item.action && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              href={item.action.url}
                              className="flex items-center gap-1 rounded-md border border-border bg-background px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors"
                              onClick={e => e.stopPropagation()}
                            >
                              <item.action.icon className="size-3" />
                              {item.action.text && (
                                <span className="hidden group-data-[collapsible=icon]:hidden md:inline">
                                  {item.action.text}
                                </span>
                              )}
                              <span className="sr-only">{item.action.label}</span>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>{item.action.label}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </TooltipProvider>
  )
}
