/*
<ai_context>
New paper page - paper builder for creating papers/worksheets.
Teachers select and order questions from the question bank.
</ai_context>
*/

"use client"

export default function NewPaperPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Paper</h1>
        <p className="text-muted-foreground">
          Build a new paper by selecting and ordering questions.
        </p>
      </div>

      {/* TODO: Paper metadata form */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Paper Title</label>
          <input
            type="text"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="e.g., Math Paper 1 - 2024"
            disabled
          />
        </div>
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
          <label className="text-sm font-medium">Year</label>
          <input
            type="number"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="2024"
            disabled
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <textarea
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          rows={2}
          placeholder="Enter paper description..."
          disabled
        />
      </div>

      {/* TODO: Paper builder - drag and drop question ordering */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Question bank */}
        <div className="rounded-lg border bg-card">
          <div className="border-b p-4">
            <h3 className="font-semibold">Question Bank</h3>
            <p className="text-sm text-muted-foreground">
              Select questions to add to this paper
            </p>
          </div>
          <div className="p-4">
            <input
              type="text"
              placeholder="Search questions..."
              className="mb-4 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled
            />
            <div className="text-center text-sm text-muted-foreground">
              [Question bank will appear here]
            </div>
          </div>
        </div>

        {/* Selected questions */}
        <div className="rounded-lg border bg-card">
          <div className="border-b p-4">
            <h3 className="font-semibold">Paper Questions</h3>
            <p className="text-sm text-muted-foreground">
              Drag to reorder questions
            </p>
          </div>
          <div className="min-h-[300px] p-4">
            <div className="text-center text-sm text-muted-foreground">
              [Selected questions will appear here - drag to reorder]
            </div>
          </div>
          <div className="border-t p-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Questions: 0</span>
              <span className="text-muted-foreground">Total Marks: 0</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium">
          Cancel
        </button>
        <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Create Paper
        </button>
      </div>
    </div>
  )
}

