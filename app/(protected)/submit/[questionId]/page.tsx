/*
<ai_context>
Submit answer page for a single question.
Students view the question and upload their answer artifacts.
</ai_context>
*/

"use client"

import { useParams } from "next/navigation"

export default function SubmitAnswerPage() {
  const params = useParams()
  const questionId = params.questionId as string

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Question #{questionId}
        </p>
        <h1 className="text-3xl font-bold tracking-tight">Submit Answer</h1>
      </div>

      {/* Question display */}
      <div className="rounded-lg border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Question</h3>
          <span className="text-sm text-muted-foreground">[Max Marks] marks</span>
        </div>
        <div className="prose prose-sm max-w-none">
          <p className="text-muted-foreground">
            [Question content will be rendered here]
          </p>
        </div>
      </div>

      {/* Answer submission area */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 font-semibold">Your Answer</h3>

        {/* Upload section */}
        <div className="mb-6">
          <p className="mb-2 text-sm text-muted-foreground">
            Upload your work (photos, scans, or documents)
          </p>
          <div className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-8 transition-colors hover:border-muted-foreground/50">
            <div className="text-center">
              <p className="mb-2 text-sm font-medium">
                Drag and drop files here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Supports: JPG, PNG, PDF (max 10MB each)
              </p>
            </div>
          </div>
        </div>

        {/* Uploaded files preview */}
        <div className="mb-6">
          <p className="mb-2 text-sm text-muted-foreground">
            Uploaded Files (0)
          </p>
          <div className="rounded-md bg-muted/50 p-4 text-center text-sm text-muted-foreground">
            No files uploaded yet
          </div>
        </div>

        {/* Optional text answer */}
        <div>
          <p className="mb-2 text-sm text-muted-foreground">
            Or type your answer (optional)
          </p>
          <textarea
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            rows={4}
            placeholder="Type your answer here..."
            disabled
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <button className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium">
          Save Draft
        </button>
        <div className="flex gap-2">
          <button className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium">
            Cancel
          </button>
          <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Submit for Grading
          </button>
        </div>
      </div>
    </div>
  )
}

