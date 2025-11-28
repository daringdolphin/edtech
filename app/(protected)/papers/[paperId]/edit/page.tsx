/*
<ai_context>
Edit paper page - TipTap worksheet editor.
Full-screen editor with auto-save functionality.
</ai_context>
*/

"use server"

import { notFound } from "next/navigation"
import { getPaperAction } from "@/actions/db/papers-actions"
import { PaperEditor } from "./_components/paper-editor"

interface EditPaperPageProps {
  params: Promise<{ paperId: string }>
}

export default async function EditPaperPage({ params }: EditPaperPageProps) {
  const { paperId } = await params
  const id = parseInt(paperId, 10)

  if (isNaN(id)) {
    notFound()
  }

  const { data: paper, isSuccess } = await getPaperAction(id)

  if (!isSuccess || !paper) {
    notFound()
  }

  return <PaperEditor paper={paper} />
}
