/*
<ai_context>
Edit question page - TipTap editor for modifying existing question items.
Loads existing question data and allows updates.
</ai_context>
*/

"use client"

import { useParams } from "next/navigation"

export default function EditQuestionPage() {
  const params = useParams()
  const questionId = params.questionId as string

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Editing Question #{questionId}
        </p>
        <h1 className="text-3xl font-bold tracking-tight">Edit Question</h1>
      </div>

      {/* TODO: Question metadata form - pre-populated */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Subject</label>
          <select
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            disabled
          >
            <option>Loading...</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Level</label>
          <select
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            disabled
          >
            <option>Loading...</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Max Marks</label>
          <input
            type="number"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Loading..."
            disabled
          />
        </div>
      </div>

      {/* TODO: TipTap editor - pre-populated with existing content */}
      <div className="rounded-lg border bg-card">
        <div className="border-b bg-muted/50 px-4 py-2">
          <div className="flex gap-2">
            <span className="rounded bg-muted px-2 py-1 text-xs">Bold</span>
            <span className="rounded bg-muted px-2 py-1 text-xs">Italic</span>
            <span className="rounded bg-muted px-2 py-1 text-xs">
              Add Part
            </span>
            <span className="rounded bg-muted px-2 py-1 text-xs">
              Add Diagram
            </span>
          </div>
        </div>
        <div className="min-h-[400px] p-4">
          <p className="text-muted-foreground">
            [TipTap Editor - Loading existing question content...]
          </p>
        </div>
      </div>

      {/* TODO: Rubric/Model Answer section - pre-populated */}
      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-4 font-semibold">Grading Guidelines</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Model Answer</label>
            <textarea
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows={3}
              placeholder="Loading..."
              disabled
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Rubric</label>
            <textarea
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows={3}
              placeholder="Loading..."
              disabled
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium">
          Cancel
        </button>
        <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Save Changes
        </button>
      </div>
    </div>
  )
}

