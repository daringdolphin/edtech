/*
<ai_context>
Individual answer view page - displays a single answer submission.
Shows the original question, student's artifacts, and evaluation results.
</ai_context>
*/

"use server"

export default async function AnswerDetailPage({
  params
}: {
  params: Promise<{ answerId: string }>
}) {
  const { answerId } = await params

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Answer #{answerId}</p>
          <h1 className="text-3xl font-bold tracking-tight">Answer Details</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* TODO: Status badge */}
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-800">
            [Status]
          </span>
        </div>
      </div>

      {/* Question info */}
      <div className="rounded-lg border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Original Question</h3>
          <span className="text-sm text-muted-foreground">[Max Marks] marks</span>
        </div>
        <div className="prose prose-sm max-w-none">
          <p className="text-muted-foreground">
            [Question content will be rendered here]
          </p>
        </div>
      </div>

      {/* Student's submission */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 font-semibold">Your Submission</h3>

        {/* Artifacts */}
        <div className="mb-4">
          <p className="mb-2 text-sm text-muted-foreground">Uploaded Artifacts</p>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex aspect-video items-center justify-center rounded-lg border-2 border-dashed bg-muted">
              <p className="text-sm text-muted-foreground">
                [Artifact preview]
              </p>
            </div>
          </div>
        </div>

        {/* Extracted/canonical text */}
        <div>
          <p className="mb-2 text-sm text-muted-foreground">
            Extracted Text (OCR)
          </p>
          <div className="rounded-md bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              [Extracted text will appear here]
            </p>
          </div>
        </div>
      </div>

      {/* Evaluation */}
      <div className="rounded-lg border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Evaluation</h3>
          <span className="text-2xl font-bold">--/--</span>
        </div>

        {/* TODO: Conditional rendering based on grading status */}
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium">Feedback</p>
            <div className="rounded-md bg-muted p-4">
              <p className="text-sm text-muted-foreground">
                [AI/teacher feedback will appear here when graded]
              </p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Rubric Breakdown</p>
            <div className="rounded-md bg-muted p-4">
              <p className="text-sm text-muted-foreground">
                [Rubric breakdown will appear here when graded]
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 font-semibold">Submission Info</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">Attempt Number</p>
            <p className="font-medium">--</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Submitted At</p>
            <p className="font-medium">--</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Graded At</p>
            <p className="font-medium">--</p>
          </div>
        </div>
      </div>
    </div>
  )
}

