/*
<ai_context>
Navigation component for protected/authenticated routes.
Provides links to Papers and Settings.
</ai_context>
*/

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, Settings, Rocket } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeSwitcher } from "@/components/utilities/theme-switcher"

const navItems = [
  {
    href: "/papers",
    label: "Papers",
    icon: FileText
  },
  {
    href: "/settings/academic-profile",
    label: "Settings",
    icon: Settings
  }
]

export function ProtectedNav() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-6">
        <div className="mr-8 flex items-center space-x-2">
          <Rocket className="h-5 w-5" />
          <Link href="/" className="text-lg font-bold">
            Ikigai LMS
          </Link>
        </div>

        <nav className="flex flex-1 items-center space-x-1">
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "gap-2",
                    isActive && "bg-secondary font-medium"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto">
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  )
}
