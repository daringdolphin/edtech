/*
<ai_context>
Submit answers page for an entire paper/worksheet.
Students work through all questions in the paper and submit their answers.
</ai_context>
*/

"use client"

import { useParams } from "next/navigation"

export default function SubmitPaperAnswersPage() {
  const params = useParams()
  const paperId = params.paperId as string

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Paper #{paperId}</p>
        <h1 className="text-3xl font-bold tracking-tight">
          [Paper Title Placeholder]
        </h1>
        <p className="text-muted-foreground">
          Answer all questions and submit when ready.
        </p>
      </div>

      {/* Paper progress */}
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">0 / -- questions answered</span>
        </div>
        <div className="h-2 rounded-full bg-muted">
          <div className="h-2 w-0 rounded-full bg-primary transition-all" />
        </div>
      </div>

      {/* Questions list - accordion style */}
      <div className="space-y-4">
        {/* Placeholder question items */}
        {[1, 2, 3].map((num) => (
          <div key={num} className="rounded-lg border bg-card">
            <div className="flex items-center justify-between border-b p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                  {num}
                </span>
                <div>
                  <p className="font-medium">Question {num}</p>
                  <p className="text-sm text-muted-foreground">-- marks</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-muted px-2 py-1 text-xs">
                  Not started
                </span>
                <button className="text-sm text-primary">Expand</button>
              </div>
            </div>

            {/* Collapsed by default - show question and upload area when expanded */}
            <div className="hidden p-4">
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  [Question content]
                </p>
              </div>
              <div className="flex min-h-[100px] cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  Click to upload your answer
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Paper totals */}
      <div className="rounded-lg border bg-card p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">--</p>
            <p className="text-sm text-muted-foreground">Questions</p>
          </div>
          <div>
            <p className="text-2xl font-bold">--</p>
            <p className="text-sm text-muted-foreground">Total Marks</p>
          </div>
          <div>
            <p className="text-2xl font-bold">--</p>
            <p className="text-sm text-muted-foreground">Answered</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <button className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium">
          Save Progress
        </button>
        <div className="flex gap-2">
          <button className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium">
            Exit Paper
          </button>
          <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Submit All Answers
          </button>
        </div>
      </div>
    </div>
  )
}

