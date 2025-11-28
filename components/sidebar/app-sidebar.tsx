/*
<ai_context>
This client component provides the main sidebar for the MathCraft app.
Contains navigation for teachers (Questions, Papers) and students (Answers, Submit).
</ai_context>
*/

"use client"

import {
  FileText,
  HelpCircle,
  Home,
  MessageSquareText,
  Pencil,
  Plus
} from "lucide-react"
import * as React from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar
} from "@/components/ui/sidebar"
import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import { TeamSwitcher } from "./team-switcher"

const navGroups = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home
      }
    ]
  },
  {
    label: "Content",
    items: [
      {
        title: "Questions",
        url: "/questions",
        icon: HelpCircle,
        action: {
          icon: Plus,
          url: "/questions/new",
          label: "Create new question",
          text: "New"
        }
      },
      {
        title: "Papers",
        url: "/papers",
        icon: FileText,
        action: {
          icon: Plus,
          url: "/papers/new",
          label: "Create new paper",
          text: "New"
        }
      }
    ]
  },
  {
    label: "Student",
    items: [
      {
        title: "My Answers",
        url: "/answers",
        icon: MessageSquareText
      },
      {
        title: "Submit Work",
        url: "/submit",
        icon: Pencil
      }
    ]
  }
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state, setOpen } = useSidebar()
  const isCollapsed = state === "collapsed"

  const handleSidebarClick = () => {
    if (isCollapsed) {
      setOpen(true)
    }
  }

  return (
    <Sidebar
      collapsible="icon"
      {...props}
      className="group/sidebar"
      onClick={handleSidebarClick}
    >
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>

      <SidebarContent>
        <NavMain groups={navGroups} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
