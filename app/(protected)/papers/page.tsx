/*
<ai_context>
Papers list page - displays all papers/worksheets.
Teachers can browse, create, and manage paper collections.
</ai_context>
*/

"use server"

export default async function PapersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Papers</h1>
          <p className="text-muted-foreground">
            Create and manage papers by grouping questions together.
          </p>
        </div>
        {/* TODO: Link to /papers/new */}
        <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Create Paper
        </button>
      </div>

      {/* TODO: Filters and search */}
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search papers..."
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
          <option>All Years</option>
        </select>
      </div>

      {/* TODO: Papers grid/list */}
      <div className="rounded-lg border bg-card">
        <div className="p-8 text-center text-muted-foreground">
          <p>No papers yet. Create your first paper to get started.</p>
        </div>
      </div>
    </div>
  )
}

