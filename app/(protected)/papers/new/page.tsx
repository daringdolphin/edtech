/*
<ai_context>
New paper page - creates a paper and redirects to the editor.
</ai_context>
*/

"use server"

import { redirect } from "next/navigation"
import { createPaperAction } from "@/actions/db/papers-actions"

export default async function NewPaperPage() {
  const { data: paper, isSuccess } = await createPaperAction({
    title: "Untitled Paper",
    contentDoc: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Untitled Paper" }]
        },
        {
          type: "paragraph"
        }
      ]
    },
    contentHtml: "<h1>Untitled Paper</h1><p></p>",
    contentPlain: "Untitled Paper"
  })

  if (isSuccess && paper) {
    redirect(`/papers/${paper.id}/edit`)
  }

  // Fallback if creation fails
  redirect("/papers")
}
