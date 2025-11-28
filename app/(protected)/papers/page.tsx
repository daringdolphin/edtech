/*
<ai_context>
Papers list page - displays all papers/worksheets.
Teachers can browse, create, and manage paper collections.
</ai_context>
*/

"use server"

import { Suspense } from "react"
import Link from "next/link"
import { Plus, FileText, Calendar } from "lucide-react"

import { getPapersAction } from "@/actions/db/papers-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default async function PapersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Papers</h1>
          <p className="text-muted-foreground">
            Create and manage your worksheets
          </p>
        </div>
        <Link href="/papers/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Paper
          </Button>
        </Link>
      </div>

      <Suspense fallback={<PapersGridSkeleton />}>
        <PapersGrid />
      </Suspense>
    </div>
  )
}

async function PapersGrid() {
  const { data: papers, isSuccess } = await getPapersAction()

  if (!isSuccess || !papers || papers.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No papers yet</h3>
          <p className="mb-4 text-center text-sm text-muted-foreground">
            Create your first worksheet to get started.
          </p>
          <Link href="/papers/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Paper
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {papers.map(paper => (
        <Link key={paper.id} href={`/papers/${paper.id}/edit`}>
          <Card className="transition-colors hover:border-primary/50 hover:bg-muted/50">
            <CardHeader className="pb-3">
              <CardTitle className="line-clamp-1 text-lg">
                {paper.title}
              </CardTitle>
              {(paper.subject || paper.level) && (
                <div className="flex gap-2 text-sm text-muted-foreground">
                  {paper.subject && <span>{paper.subject}</span>}
                  {paper.subject && paper.level && <span>•</span>}
                  {paper.level && <span>{paper.level}</span>}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="mr-1 h-3 w-3" />
                <span>
                  Updated{" "}
                  {new Date(paper.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                </span>
              </div>
              {paper.totalMarks && (
                <div className="mt-2 text-sm">
                  <span className="font-medium">{paper.totalMarks}</span>{" "}
                  <span className="text-muted-foreground">marks</span>
                </div>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

function PapersGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-3 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
