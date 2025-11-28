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
import { eq, desc } from "drizzle-orm"

export async function createPaperAction(
  paper: InsertPaper
): Promise<ActionState<SelectPaper>> {
  try {
    const [newPaper] = await db.insert(papersTable).values(paper).returning()
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
    const paper = await db.query.papers.findFirst({
      where: eq(papersTable.id, id)
    })

    if (!paper) {
      return { isSuccess: false, message: "Paper not found" }
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
    const papers = await db.query.papers.findMany({
      where: userId ? eq(papersTable.createdBy, userId) : undefined,
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
    const [updatedPaper] = await db
      .update(papersTable)
      .set(data)
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

