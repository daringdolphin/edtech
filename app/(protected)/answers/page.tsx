/*
<ai_context>
Answers list page - displays student's answer submissions.
Students can view their submission history and grading results.
</ai_context>
*/

"use server"

export default async function AnswersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Answers</h1>
        <p className="text-muted-foreground">
          View your submitted answers and grading results.
        </p>
      </div>

      {/* TODO: Filters */}
      <div className="flex gap-4">
        <select
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          disabled
        >
          <option>All Statuses</option>
          <option>Draft</option>
          <option>Submitted</option>
          <option>Graded</option>
        </select>
        <select
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          disabled
        >
          <option>All Subjects</option>
        </select>
      </div>

      {/* TODO: Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-2xl font-bold">--</p>
          <p className="text-sm text-muted-foreground">Total Submissions</p>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-2xl font-bold">--</p>
          <p className="text-sm text-muted-foreground">Pending Grading</p>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-2xl font-bold">--</p>
          <p className="text-sm text-muted-foreground">Graded</p>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-2xl font-bold">--%</p>
          <p className="text-sm text-muted-foreground">Avg Score</p>
        </div>
      </div>

      {/* TODO: Answers list */}
      <div className="rounded-lg border bg-card">
        <div className="border-b px-4 py-3">
          <div className="grid grid-cols-5 gap-4 text-sm font-medium text-muted-foreground">
            <div>Question</div>
            <div>Paper</div>
            <div>Status</div>
            <div>Score</div>
            <div>Submitted</div>
          </div>
        </div>
        <div className="p-8 text-center text-muted-foreground">
          <p>No answers yet. Start by answering a question!</p>
        </div>
      </div>
    </div>
  )
}

