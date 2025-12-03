/*
<ai_context>
Server actions for paper_blocks CRUD operations.
Handles adding, updating, deleting question blocks on papers.
Uses the snapshot model - copies question content into the paper.
</ai_context>
*/

"use server"

import { db } from "@/db/db"
import {
  InsertPaperBlock,
  SelectPaperBlock,
  paperBlocksTable,
  papersTable,
  questionItemsTable
} from "@/db/schema"
import { ActionState } from "@/types"
import {
  QuestionType,
  QuestionBlockDoc,
  QuestionBlockOverrides,
  QuestionBlockMeta,
  createBlankQuestionBlockDoc,
  createDefaultOverrides,
  createDefaultMeta
} from "@/types/question-block-types"
import { eq, and, max, asc } from "drizzle-orm"
import { getCurrentUserAction } from "@/actions/auth-actions"

/**
 * Helper to verify user owns a paper
 */
async function verifyPaperOwnership(
  paperId: number,
  userId: string
): Promise<{ owned: boolean; paper?: typeof papersTable.$inferSelect }> {
  const paper = await db.query.papers.findFirst({
    where: eq(papersTable.id, paperId)
  })

  if (!paper) {
    return { owned: false }
  }

  return {
    owned: paper.createdBy === userId,
    paper
  }
}

/**
 * Helper to verify user owns a block (via paper ownership)
 */
async function verifyBlockOwnership(
  blockId: number,
  userId: string
): Promise<{ owned: boolean; block?: SelectPaperBlock }> {
  const block = await db.query.paperBlocks.findFirst({
    where: eq(paperBlocksTable.id, blockId)
  })

  if (!block) {
    return { owned: false }
  }

  const { owned } = await verifyPaperOwnership(block.paperId, userId)
  return { owned, block }
}

/**
 * Get the next position for a new block in a paper
 */
async function getNextPosition(paperId: number): Promise<number> {
  const result = await db
    .select({ maxPos: max(paperBlocksTable.position) })
    .from(paperBlocksTable)
    .where(eq(paperBlocksTable.paperId, paperId))

  return (result[0]?.maxPos ?? -1) + 1
}

/**
 * Add a question block to a paper
 * If questionItemId is provided, copies content from that question
 * Otherwise creates a blank question of the specified type
 */
export async function addQuestionToPaperAction(params: {
  paperId: number
  questionItemId?: number
  questionType?: QuestionType
  position?: number
}): Promise<ActionState<SelectPaperBlock>> {
  try {
    const user = await getCurrentUserAction()
    if (!user) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    const { paperId, questionItemId, questionType = "short_answer", position } = params

    // Verify user owns the paper
    const { owned, paper } = await verifyPaperOwnership(paperId, user.id)
    if (!owned || !paper) {
      return { isSuccess: false, message: "Paper not found or unauthorized" }
    }

    let blockDoc: QuestionBlockDoc
    let overrides: QuestionBlockOverrides
    let meta: QuestionBlockMeta = createDefaultMeta()

    if (questionItemId) {
      // Copy from existing question item
      const questionItem = await db.query.questionItems.findFirst({
        where: eq(questionItemsTable.id, questionItemId)
      })

      if (!questionItem) {
        return { isSuccess: false, message: "Question item not found" }
      }

      // Convert question item content to our block format
      // The questionItem.contentDoc may be in a different format, so we adapt it
      const qType = questionItem.qType as QuestionType
      blockDoc = {
        type: "questionBlock",
        questionType: qType,
        stem: questionItem.contentDoc as any || { type: "doc", content: [] },
        // Additional fields would be populated based on qType
        ...(qType === "short_answer" && { answerLines: 3 }),
        ...(qType === "essay" && { answerSpace: "large" as const }),
        ...(qType === "mcq" && { options: [] }), // Would need to parse from contentDoc
        ...(qType === "structured" && { parts: [] }) // Would need to parse from contentDoc
      }

      overrides = createDefaultOverrides(questionItem.maxMarks)
    } else {
      // Create blank question of specified type
      blockDoc = createBlankQuestionBlockDoc(questionType)
      overrides = createDefaultOverrides(1)
    }

    // Determine position
    const blockPosition = position ?? await getNextPosition(paperId)

    // Insert the block
    const [newBlock] = await db
      .insert(paperBlocksTable)
      .values({
        paperId,
        blockType: "question",
        position: blockPosition,
        questionItemId: questionItemId ?? null,
        blockDoc,
        overrides,
        meta
      })
      .returning()

    return {
      isSuccess: true,
      message: "Question added to paper",
      data: newBlock
    }
  } catch (error) {
    console.error("Error adding question to paper:", error)
    return { isSuccess: false, message: "Failed to add question to paper" }
  }
}

/**
 * Update a paper block's content, overrides, or meta
 */
export async function updatePaperBlockAction(params: {
  blockId: number
  blockDoc?: QuestionBlockDoc
  overrides?: Partial<QuestionBlockOverrides>
  meta?: Partial<QuestionBlockMeta>
}): Promise<ActionState<SelectPaperBlock>> {
  try {
    const user = await getCurrentUserAction()
    if (!user) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    const { blockId, blockDoc, overrides, meta } = params

    // Verify ownership
    const { owned, block } = await verifyBlockOwnership(blockId, user.id)
    if (!owned || !block) {
      return { isSuccess: false, message: "Block not found or unauthorized" }
    }

    // Build update object
    const updates: Partial<InsertPaperBlock> = {}

    if (blockDoc !== undefined) {
      updates.blockDoc = blockDoc
    }

    if (overrides !== undefined) {
      // Merge with existing overrides
      const mergedOverrides = {
        ...(block.overrides as QuestionBlockOverrides),
        ...overrides
      }
      
      // Remove properties set to null (to clear overrides)
      Object.keys(mergedOverrides).forEach(key => {
        if (mergedOverrides[key as keyof typeof mergedOverrides] === null) {
          delete mergedOverrides[key as keyof typeof mergedOverrides]
        }
      })
      
      updates.overrides = mergedOverrides
    }

    if (meta !== undefined) {
      // Merge with existing meta
      updates.meta = {
        ...(block.meta as QuestionBlockMeta),
        ...meta,
        lastEditedAt: new Date().toISOString()
      }
    }

    if (Object.keys(updates).length === 0) {
      return {
        isSuccess: true,
        message: "No changes to save",
        data: block
      }
    }

    const [updatedBlock] = await db
      .update(paperBlocksTable)
      .set(updates)
      .where(eq(paperBlocksTable.id, blockId))
      .returning()

    return {
      isSuccess: true,
      message: "Block updated successfully",
      data: updatedBlock
    }
  } catch (error) {
    console.error("Error updating paper block:", error)
    return { isSuccess: false, message: "Failed to update block" }
  }
}

/**
 * Delete a paper block
 */
export async function deletePaperBlockAction(
  blockId: number
): Promise<ActionState<undefined>> {
  try {
    const user = await getCurrentUserAction()
    if (!user) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Verify ownership
    const { owned, block } = await verifyBlockOwnership(blockId, user.id)
    if (!owned || !block) {
      return { isSuccess: false, message: "Block not found or unauthorized" }
    }

    await db.delete(paperBlocksTable).where(eq(paperBlocksTable.id, blockId))

    return {
      isSuccess: true,
      message: "Block deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting paper block:", error)
    return { isSuccess: false, message: "Failed to delete block" }
  }
}

/**
 * Get all blocks for a paper, sorted by position
 */
export async function getPaperBlocksAction(
  paperId: number
): Promise<ActionState<SelectPaperBlock[]>> {
  try {
    const user = await getCurrentUserAction()

    // Get paper to check access
    const paper = await db.query.papers.findFirst({
      where: eq(papersTable.id, paperId)
    })

    if (!paper) {
      return { isSuccess: false, message: "Paper not found" }
    }

    // Check access permission
    const isOwner = user && paper.createdBy === user.id
    const isPublic = paper.visibility === "public"

    if (!isOwner && !isPublic) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    const blocks = await db.query.paperBlocks.findMany({
      where: eq(paperBlocksTable.paperId, paperId),
      orderBy: [asc(paperBlocksTable.position)]
    })

    return {
      isSuccess: true,
      message: "Blocks retrieved successfully",
      data: blocks
    }
  } catch (error) {
    console.error("Error getting paper blocks:", error)
    return { isSuccess: false, message: "Failed to get blocks" }
  }
}

/**
 * Get a paper with all its blocks in one call
 * Useful for the editor to load everything at once
 */
export async function getPaperWithBlocksAction(paperId: number): Promise<
  ActionState<{
    paper: typeof papersTable.$inferSelect
    blocks: SelectPaperBlock[]
  }>
> {
  try {
    const user = await getCurrentUserAction()

    const paper = await db.query.papers.findFirst({
      where: eq(papersTable.id, paperId)
    })

    if (!paper) {
      return { isSuccess: false, message: "Paper not found" }
    }

    // Check access permission
    const isOwner = user && paper.createdBy === user.id
    const isPublic = paper.visibility === "public"

    if (!isOwner && !isPublic) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    const blocks = await db.query.paperBlocks.findMany({
      where: eq(paperBlocksTable.paperId, paperId),
      orderBy: [asc(paperBlocksTable.position)]
    })

    return {
      isSuccess: true,
      message: "Paper and blocks retrieved successfully",
      data: { paper, blocks }
    }
  } catch (error) {
    console.error("Error getting paper with blocks:", error)
    return { isSuccess: false, message: "Failed to get paper with blocks" }
  }
}

