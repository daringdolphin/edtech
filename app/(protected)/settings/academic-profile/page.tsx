/*
<ai_context>
Academic profile settings page (server component).
Loads the user's academic profile and taxonomy data, then passes to client component.
</ai_context>
*/

"use server"

import { redirect } from "next/navigation"
import { getCurrentUserAction } from "@/actions/auth-actions"
import {
  getAcademicProfileAction,
  getTaxonomySummaryAction
} from "@/actions/db/academic-profile-actions"
import { AcademicProfileSettings } from "./_components/academic-profile-settings"

export default async function AcademicProfilePage() {
  // Verify authentication
  const user = await getCurrentUserAction()
  if (!user) {
    redirect("/auth/login")
  }

  // Load profile and taxonomy
  const [profileResult, taxonomyResult] = await Promise.all([
    getAcademicProfileAction(),
    getTaxonomySummaryAction()
  ])

  if (!profileResult.isSuccess) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          <p className="font-semibold">Error loading profile</p>
          <p className="text-sm">{profileResult.message}</p>
        </div>
      </div>
    )
  }

  if (!taxonomyResult.isSuccess) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          <p className="font-semibold">Error loading taxonomy</p>
          <p className="text-sm">{taxonomyResult.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Academic Profile Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Set your subjects, levels, and topics to personalize your experience
        </p>
      </div>

      <AcademicProfileSettings
        profile={profileResult.data}
        taxonomy={taxonomyResult.data}
      />
    </div>
  )
}
