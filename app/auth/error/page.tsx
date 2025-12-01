/*
<ai_context>
Error page displayed when auth operations fail.
</ai_context>
*/

"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="size-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Authentication Error</CardTitle>
          <CardDescription>
            Something went wrong during authentication. This could be due to an
            expired or invalid link.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <Button asChild>
            <Link href="/auth/login">Try Again</Link>
          </Button>

          <Button variant="outline" asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}





