/*
<ai_context>
Dashboard page - main landing for authenticated users.
Shows overview of questions, papers, recent activity.
</ai_context>
*/

"use server"

export default async function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to MathCraft. Manage your questions, papers, and student
          submissions.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* TODO: Stats cards */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Questions
          </h3>
          <p className="mt-2 text-3xl font-bold">--</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Papers
          </h3>
          <p className="mt-2 text-3xl font-bold">--</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Pending Submissions
          </h3>
          <p className="mt-2 text-3xl font-bold">--</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Graded Today
          </h3>
          <p className="mt-2 text-3xl font-bold">--</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* TODO: Recent activity */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 font-semibold">Recent Questions</h3>
          <p className="text-sm text-muted-foreground">
            No recent questions yet.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 font-semibold">Recent Submissions</h3>
          <p className="text-sm text-muted-foreground">
            No recent submissions yet.
          </p>
        </div>
      </div>
    </div>
  )
}

