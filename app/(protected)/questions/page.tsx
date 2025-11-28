/*
<ai_context>
Questions list page - displays all question items.
Teachers can browse, search, and filter their question bank.
</ai_context>
*/

"use server"

export default async function QuestionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Questions</h1>
          <p className="text-muted-foreground">
            Manage your question bank. Create and organize reusable question
            items.
          </p>
        </div>
        {/* TODO: Link to /questions/new */}
        <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Create Question
        </button>
      </div>

      {/* TODO: Filters and search */}
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search questions..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            disabled
          />
        </div>
        <select
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          disabled
        >
          <option>All Subjects</option>
        </select>
        <select
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          disabled
        >
          <option>All Levels</option>
        </select>
      </div>

      {/* TODO: Questions table/grid */}
      <div className="rounded-lg border bg-card">
        <div className="p-8 text-center text-muted-foreground">
          <p>No questions yet. Create your first question to get started.</p>
        </div>
      </div>
    </div>
  )
}

