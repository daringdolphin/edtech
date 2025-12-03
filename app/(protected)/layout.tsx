/*
<ai_context>
Protected layout that wraps all authenticated routes.
Handles auth checks and provides navigation.
</ai_context>
*/

"use server"

import { ProtectedNav } from "./_components/protected-nav"

export default async function ProtectedLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <ProtectedNav />
      <main className="p-6">{children}</main>
    </div>
  )
}
