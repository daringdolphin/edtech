/*
<ai_context>
This client component provides a header bar for the protected area.
Includes mobile sidebar trigger and theme switcher.
</ai_context>
*/

"use client"

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ThemeSwitcher } from "@/components/utilities/theme-switcher"

interface AppHeaderProps {
  title?: string
  children?: React.ReactNode
}

export function AppHeader({ title, children }: AppHeaderProps) {
  const { isMobile } = useSidebar()

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {isMobile && (
        <>
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
        </>
      )}

      <div className="flex flex-1 items-center gap-2">
        {title && (
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        )}
        {children}
      </div>

      <div className="flex items-center gap-2">
        <ThemeSwitcher />
      </div>
    </header>
  )
}

