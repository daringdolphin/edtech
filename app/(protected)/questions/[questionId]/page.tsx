/*
<ai_context>
Individual question view page - displays a single question item.
Shows the rendered question content, metadata, and action buttons.
</ai_context>
*/

"use server"

export default async function QuestionDetailPage({
  params
}: {
  params: Promise<{ questionId: string }>
}) {
  const { questionId } = await params

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Question #{questionId}</p>
          <h1 className="text-3xl font-bold tracking-tight">
            [Question Title Placeholder]
          </h1>
        </div>
        <div className="flex gap-2">
          {/* TODO: Link to /questions/[questionId]/edit */}
          <button className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium">
            Edit
          </button>
          <button className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground">
            Delete
          </button>
        </div>
      </div>

      {/* Question metadata */}
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
          [Subject]
        </span>
        <span className="rounded-full bg-secondary px-3 py-1 text-sm">
          [Level]
        </span>
        <span className="rounded-full bg-muted px-3 py-1 text-sm">
          [Max Marks] marks
        </span>
      </div>

      {/* Rendered question content */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 font-semibold">Question Content</h3>
        <div className="prose prose-sm max-w-none">
          <p className="text-muted-foreground">
            [Rendered TipTap content will appear here - HTML snapshot]
          </p>
        </div>
      </div>

      {/* Model answer and rubric */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 font-semibold">Model Answer</h3>
          <p className="text-sm text-muted-foreground">
            [Model answer placeholder]
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 font-semibold">Rubric</h3>
          <p className="text-sm text-muted-foreground">[Rubric placeholder]</p>
        </div>
      </div>

      {/* Usage info */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 font-semibold">Usage</h3>
        <p className="text-sm text-muted-foreground">
          This question appears in 0 papers and has 0 student submissions.
        </p>
      </div>
    </div>
  )
}

