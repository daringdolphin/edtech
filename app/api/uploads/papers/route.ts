/*
<ai_context>
Route handler for uploading paper-specific images (clipboard screenshots).
Validates ownership, file type/size, and streams data into Supabase Storage.
</ai_context>
*/

import { NextResponse, type NextRequest } from "next/server"
import { randomUUID } from "node:crypto"
import { Buffer } from "node:buffer"
import { eq } from "drizzle-orm"

import { createClient as createServerSupabaseClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { db } from "@/db/db"
import { papersTable } from "@/db/schema"
import {
  PAPER_IMAGE_MAX_BYTES,
  validatePaperImageFile
} from "@/lib/uploads"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse("Unauthorized", 401)
    }

    const formData = await request.formData()
    const rawPaperId = formData.get("paperId")
    const file = formData.get("file")

    if (!rawPaperId) {
      return errorResponse("paperId is required", 400)
    }

    const paperId = Number(rawPaperId)
    if (!Number.isFinite(paperId)) {
      return errorResponse("paperId must be a number", 400)
    }

    if (!(file instanceof File)) {
      return errorResponse("Missing image file", 400)
    }

    const validationMessage = validatePaperImageFile(file)
    if (validationMessage) {
      const status = file.size > PAPER_IMAGE_MAX_BYTES ? 413 : 415
      return errorResponse(validationMessage, status)
    }

    const paper = await db.query.papers.findFirst({
      where: eq(papersTable.id, paperId)
    })

    if (!paper) {
      return errorResponse("Paper not found", 404)
    }

    if (!paper.createdBy || paper.createdBy !== user.id) {
      return errorResponse("You do not have access to this paper", 403)
    }

    const bucket = process.env.SUPABASE_PAPER_ASSETS_BUCKET
    if (!bucket) {
      return errorResponse("Missing SUPABASE_PAPER_ASSETS_BUCKET", 500)
    }

    const filePath = buildStoragePath(paperId, user.id, file.name)
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    const adminClient = await createAdminClient()
    const { error: uploadError } = await adminClient.storage.from(bucket).upload(filePath, fileBuffer, {
      contentType: file.type || "application/octet-stream",
      cacheControl: "3600",
      upsert: false
    })

    if (uploadError) {
      console.error("Supabase upload error:", uploadError)
      return errorResponse("Failed to upload image", 500)
    }

    const {
      data: { publicUrl }
    } = adminClient.storage.from(bucket).getPublicUrl(filePath)

    if (!publicUrl) {
      return errorResponse("Unable to generate public URL", 500)
    }

    return NextResponse.json({
      url: publicUrl,
      path: filePath
    })
  } catch (error) {
    console.error("Paper image upload failed:", error)
    return errorResponse("Unexpected error while uploading image", 500)
  }
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ message }, { status })
}

function buildStoragePath(paperId: number, userId: string, fileName: string) {
  const extension = getFileExtension(fileName) ?? "png"
  const normalizedName = sanitizeFilename(fileName) || "screenshot"
  return `${userId}/papers/${paperId}/${Date.now()}-${randomUUID()}-${normalizedName}.${extension}`
}

function getFileExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase()?.replace(/[^a-z0-9]/g, "")
}

function sanitizeFilename(fileName: string) {
  return fileName
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .slice(0, 48)
    .toLowerCase()
}

