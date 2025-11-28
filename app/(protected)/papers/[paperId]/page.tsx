/*
<ai_context>
Paper view page - redirects to edit page for now.
Could be expanded to show read-only view in the future.
</ai_context>
*/

"use server"

import { redirect } from "next/navigation"

interface PaperViewPageProps {
  params: Promise<{ paperId: string }>
}

export default async function PaperViewPage({ params }: PaperViewPageProps) {
  const { paperId } = await params

  // For now, redirect to edit page
  // Could be expanded to show a read-only view
  redirect(`/papers/${paperId}/edit`)
}
