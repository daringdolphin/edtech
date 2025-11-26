/*
<ai_context>
This client component provides a user placeholder for the sidebar.
</ai_context>
*/

"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar"
import { User } from "lucide-react"

export function NavUser() {
  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex items-center gap-2 font-medium">
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        Guest User
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
