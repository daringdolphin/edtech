/*
<ai_context>
Individual paper view page - displays a single paper/worksheet.
Shows paper metadata, questions in order, and action buttons.
</ai_context>
*/

"use server"

export default async function PaperDetailPage({
  params
}: {
  params: Promise<{ paperId: string }>
}) {
  const { paperId } = await params

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Paper #{paperId}</p>
          <h1 className="text-3xl font-bold tracking-tight">
            [Paper Title Placeholder]
          </h1>
        </div>
        <div className="flex gap-2">
          {/* TODO: Link to /papers/[paperId]/edit */}
          <button className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium">
            Edit
          </button>
          <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Assign to Students
          </button>
        </div>
      </div>

      {/* Paper metadata */}
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
          [Subject]
        </span>
        <span className="rounded-full bg-secondary px-3 py-1 text-sm">
          [Level]
        </span>
        <span className="rounded-full bg-muted px-3 py-1 text-sm">
          [Year]
        </span>
      </div>

      {/* Paper stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-2xl font-bold">--</p>
          <p className="text-sm text-muted-foreground">Questions</p>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-2xl font-bold">--</p>
          <p className="text-sm text-muted-foreground">Total Marks</p>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-2xl font-bold">--</p>
          <p className="text-sm text-muted-foreground">Submissions</p>
        </div>
      </div>

      {/* Questions list */}
      <div className="rounded-lg border bg-card">
        <div className="border-b p-4">
          <h3 className="font-semibold">Questions</h3>
        </div>
        <div className="p-4">
          <div className="text-center text-muted-foreground">
            [Paper questions will appear here in order]
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 font-semibold">Description</h3>
        <p className="text-sm text-muted-foreground">
          [Paper description placeholder]
        </p>
      </div>
    </div>
  )
}

