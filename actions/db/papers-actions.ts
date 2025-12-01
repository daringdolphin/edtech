/*
<ai_context>
Server actions for papers CRUD operations.
Handles creating, reading, updating, and deleting papers/worksheets.
</ai_context>
*/

"use server"

import { db } from "@/db/db"
import {
  InsertPaper,
  SelectPaper,
  papersTable,
  paperBlocksTable
} from "@/db/schema"
import { ActionState } from "@/types"
import { eq, desc, or } from "drizzle-orm"
import { getCurrentUserAction } from "@/actions/auth-actions"

export async function createPaperAction(
  paper: InsertPaper
): Promise<ActionState<SelectPaper>> {
  try {
    // Verify user is authenticated
    const user = await getCurrentUserAction()
    if (!user) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Ensure createdBy is set to current user
    const paperData = {
      ...paper,
      createdBy: user.id
    }

    const [newPaper] = await db.insert(papersTable).values(paperData).returning()
    return {
      isSuccess: true,
      message: "Paper created successfully",
      data: newPaper
    }
  } catch (error) {
    console.error("Error creating paper:", error)
    return { isSuccess: false, message: "Failed to create paper" }
  }
}

export async function getPaperAction(
  id: number
): Promise<ActionState<SelectPaper>> {
  try {
    // Get current user (may be null if not authenticated)
    const user = await getCurrentUserAction()

    const paper = await db.query.papers.findFirst({
      where: eq(papersTable.id, id)
    })

    if (!paper) {
      return { isSuccess: false, message: "Paper not found" }
    }

    // Check access permission: must be owner or paper must be public
    const isOwner = user && paper.createdBy === user.id
    const isPublic = paper.visibility === "public"

    if (!isOwner && !isPublic) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    return {
      isSuccess: true,
      message: "Paper retrieved successfully",
      data: paper
    }
  } catch (error) {
    console.error("Error getting paper:", error)
    return { isSuccess: false, message: "Failed to get paper" }
  }
}

export async function getPapersAction(
  userId?: string
): Promise<ActionState<SelectPaper[]>> {
  try {
    // Verify user is authenticated
    const user = await getCurrentUserAction()
    if (!user) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Use authenticated user's ID (ignore userId parameter for security)
    const papers = await db.query.papers.findMany({
      where: eq(papersTable.createdBy, user.id),
      orderBy: [desc(papersTable.updatedAt)]
    })

    return {
      isSuccess: true,
      message: "Papers retrieved successfully",
      data: papers
    }
  } catch (error) {
    console.error("Error getting papers:", error)
    return { isSuccess: false, message: "Failed to get papers" }
  }
}

export async function updatePaperAction(
  id: number,
  data: Partial<InsertPaper>
): Promise<ActionState<SelectPaper>> {
  try {
    // Verify user is authenticated
    const user = await getCurrentUserAction()
    if (!user) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Check if paper exists and user owns it
    const paper = await db.query.papers.findFirst({
      where: eq(papersTable.id, id)
    })

    if (!paper) {
      return { isSuccess: false, message: "Paper not found" }
    }

    if (paper.createdBy !== user.id) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Prevent changing the owner
    const updateData = { ...data }
    delete updateData.createdBy

    const [updatedPaper] = await db
      .update(papersTable)
      .set(updateData)
      .where(eq(papersTable.id, id))
      .returning()

    if (!updatedPaper) {
      return { isSuccess: false, message: "Paper not found" }
    }

    return {
      isSuccess: true,
      message: "Paper updated successfully",
      data: updatedPaper
    }
  } catch (error) {
    console.error("Error updating paper:", error)
    return { isSuccess: false, message: "Failed to update paper" }
  }
}

export async function deletePaperAction(
  id: number
): Promise<ActionState<undefined>> {
  try {
    // Verify user is authenticated
    const user = await getCurrentUserAction()
    if (!user) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Check if paper exists and user owns it
    const paper = await db.query.papers.findFirst({
      where: eq(papersTable.id, id)
    })

    if (!paper) {
      return { isSuccess: false, message: "Paper not found" }
    }

    if (paper.createdBy !== user.id) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Safe to delete - user owns the paper
    await db.delete(papersTable).where(eq(papersTable.id, id))
    return {
      isSuccess: true,
      message: "Paper deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting paper:", error)
    return { isSuccess: false, message: "Failed to delete paper" }
  }
}

