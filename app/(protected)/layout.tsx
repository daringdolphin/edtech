/*
<ai_context>
Protected layout that wraps all authenticated routes.
Provides the sidebar shell and handles auth checks.
</ai_context>
*/

"use server"

import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { AppHeader } from "@/components/sidebar/app-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { cookies } from "next/headers"

export default async function ProtectedLayout({
  children
}: {
  children: React.ReactNode
}) {
  // Get sidebar state from cookie for SSR
  const cookieStore = await cookies()
  const sidebarState = cookieStore.get("sidebar:state")?.value
  const defaultOpen = sidebarState !== "false"

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
