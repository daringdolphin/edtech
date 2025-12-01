/*
<ai_context>
Edit paper page - TipTap worksheet editor.
Full-screen editor with auto-save functionality.
Loads paper and question blocks together for efficient editing.
</ai_context>
*/

"use server"

import { notFound } from "next/navigation"
import { getPaperWithBlocksAction } from "@/actions/db/paper-blocks-actions"
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

  const result = await getPaperWithBlocksAction(id)

  if (!result.isSuccess || !result.data) {
    notFound()
  }

  const { paper, blocks } = result.data

  return <PaperEditor paper={paper} initialBlocks={blocks} />
}
