/*
<ai_context>
New question page - TipTap editor for creating question items.
Teachers author rich math/science questions with diagrams, parts, and rubrics.
</ai_context>
*/

"use client"

export default function NewQuestionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Question</h1>
        <p className="text-muted-foreground">
          Use the editor to create a new question item with rich content.
        </p>
      </div>

      {/* TODO: Question metadata form */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Subject</label>
          <select
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            disabled
          >
            <option>Select subject...</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Level</label>
          <select
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            disabled
          >
            <option>Select level...</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Max Marks</label>
          <input
            type="number"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="0"
            disabled
          />
        </div>
      </div>

      {/* TODO: TipTap editor placeholder */}
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
            [TipTap Editor Placeholder - Will support question/part hierarchy,
            diagrams, chemistry stencils, etc.]
          </p>
        </div>
      </div>

      {/* TODO: Rubric/Model Answer section */}
      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-4 font-semibold">Grading Guidelines</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Model Answer</label>
            <textarea
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows={3}
              placeholder="Enter the model answer..."
              disabled
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Rubric</label>
            <textarea
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows={3}
              placeholder="Enter rubric criteria..."
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
          Save Question
        </button>
      </div>
    </div>
  )
}

