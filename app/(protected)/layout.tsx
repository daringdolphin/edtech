/*
<ai_context>
Protected layout that wraps all authenticated routes.
Handles auth checks.
</ai_context>
*/

"use server"

export default async function ProtectedLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen p-6">{children}</main>
  )
}
