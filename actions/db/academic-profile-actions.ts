/*
<ai_context>
Server actions for academic profile operations.
Handles getting, updating, and resetting user academic profiles and taxonomy data.
All actions scope to the authenticated user's ID to prevent cross-account leaks.
</ai_context>
*/

"use server"

import { db } from "@/db/db"
import {
  userAcademicProfilesTable,
  userSubjectLevelsTable,
  userTopicsTable,
  userSubtopicsTable,
  curriculumFrameworksTable,
  frameworkSubjectsTable,
  subjectLevelsTable,
  subjectTopicsTable,
  subjectSubtopicsTable
} from "@/db/schema"
import {
  ActionState,
  AcademicProfile,
  FrameworkSummary,
  TopicTree,
  UpdateAcademicProfilePayload
} from "@/types"
import { eq, and, inArray, asc } from "drizzle-orm"
import { getCurrentUserAction } from "@/actions/auth-actions"

/**
 * Get the user's academic profile. If it doesn't exist, create a default profile
 * with Singapore MOE framework and Mathematics → Primary 5 as the default.
 */
export async function getAcademicProfileAction(): Promise<
  ActionState<AcademicProfile>
> {
  try {
    const user = await getCurrentUserAction()
    if (!user) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Check if profile exists
    let profile = await db.query.userAcademicProfiles.findFirst({
      where: eq(userAcademicProfilesTable.userId, user.id)
    })

    // If no profile exists, create default with Mathematics → Primary 5
    if (!profile) {
      // Get Singapore MOE framework
      const framework = await db.query.curriculumFrameworks.findFirst({
        where: eq(curriculumFrameworksTable.version, "sg_moe_2024")
      })

      if (!framework) {
        return {
          isSuccess: false,
          message: "Default framework not found. Please contact support."
        }
      }

      // Get Mathematics subject
      const mathSubject = await db.query.frameworkSubjects.findFirst({
        where: and(
          eq(frameworkSubjectsTable.frameworkId, framework.id),
          eq(frameworkSubjectsTable.subjectKey, "mathematics")
        )
      })

      if (!mathSubject) {
        return {
          isSuccess: false,
          message: "Default subject not found. Please contact support."
        }
      }

      // Get Primary 5 level
      const primaryFiveLevel = await db.query.subjectLevels.findFirst({
        where: and(
          eq(subjectLevelsTable.frameworkSubjectId, mathSubject.id),
          eq(subjectLevelsTable.levelKey, "primary_p5")
        )
      })

      if (!primaryFiveLevel) {
        return {
          isSuccess: false,
          message: "Default level not found. Please contact support."
        }
      }

      // Create profile
      const [newProfile] = await db
        .insert(userAcademicProfilesTable)
        .values({
          userId: user.id,
          frameworkId: framework.id,
          preferredSubjectLevelId: primaryFiveLevel.id,
          currentTopicId: null,
          metadata: {}
        })
        .returning()

      // Create default subject-level association
      await db.insert(userSubjectLevelsTable).values({
        userId: user.id,
        subjectLevelId: primaryFiveLevel.id
      })

      profile = newProfile
    }

    // Load framework
    const framework = await db.query.curriculumFrameworks.findFirst({
      where: eq(curriculumFrameworksTable.id, profile.frameworkId)
    })

    if (!framework) {
      return {
        isSuccess: false,
        message: "Framework not found"
      }
    }

    // Load user's subject-levels with full details
    const userSubjectLevels = await db
      .select({
        id: subjectLevelsTable.id,
        levelKey: subjectLevelsTable.levelKey,
        levelName: subjectLevelsTable.displayName,
        stream: subjectLevelsTable.stream,
        subjectKey: frameworkSubjectsTable.subjectKey,
        subjectName: frameworkSubjectsTable.displayName
      })
      .from(userSubjectLevelsTable)
      .innerJoin(
        subjectLevelsTable,
        eq(userSubjectLevelsTable.subjectLevelId, subjectLevelsTable.id)
      )
      .innerJoin(
        frameworkSubjectsTable,
        eq(subjectLevelsTable.frameworkSubjectId, frameworkSubjectsTable.id)
      )
      .where(eq(userSubjectLevelsTable.userId, user.id))

    // Load user's topics
    const userTopics = await db
      .select({
        id: subjectTopicsTable.id,
        code: subjectTopicsTable.code,
        name: subjectTopicsTable.name,
        strand: subjectTopicsTable.strand,
        subjectLevelId: subjectTopicsTable.subjectLevelId
      })
      .from(userTopicsTable)
      .innerJoin(
        subjectTopicsTable,
        eq(userTopicsTable.topicId, subjectTopicsTable.id)
      )
      .where(eq(userTopicsTable.userId, user.id))

    // Load user's subtopics
    const userSubtopics = await db
      .select({
        id: subjectSubtopicsTable.id,
        code: subjectSubtopicsTable.code,
        name: subjectSubtopicsTable.name,
        topicId: subjectSubtopicsTable.topicId
      })
      .from(userSubtopicsTable)
      .innerJoin(
        subjectSubtopicsTable,
        eq(userSubtopicsTable.subtopicId, subjectSubtopicsTable.id)
      )
      .where(eq(userSubtopicsTable.userId, user.id))

    return {
      isSuccess: true,
      message: "Profile loaded successfully",
      data: {
        profile,
        framework,
        subjectLevels: userSubjectLevels,
        topics: userTopics,
        subtopics: userSubtopics
      }
    }
  } catch (error) {
    console.error("Error getting academic profile:", error)
    return { isSuccess: false, message: "Failed to load academic profile" }
  }
}

/**
 * Get the taxonomy summary (framework + subjects + levels) for initial UI dropdowns.
 * Does not include topics/subtopics to keep the response lightweight.
 */
export async function getTaxonomySummaryAction(): Promise<
  ActionState<FrameworkSummary>
> {
  try {
    // Get Singapore MOE framework
    const framework = await db.query.curriculumFrameworks.findFirst({
      where: and(
        eq(curriculumFrameworksTable.version, "sg_moe_2024"),
        eq(curriculumFrameworksTable.isActive, true)
      )
    })

    if (!framework) {
      return {
        isSuccess: false,
        message: "Framework not found"
      }
    }

    // Load all subjects with their levels
    const subjects = await db
      .select({
        id: frameworkSubjectsTable.id,
        subjectKey: frameworkSubjectsTable.subjectKey,
        displayName: frameworkSubjectsTable.displayName,
        description: frameworkSubjectsTable.description,
        sequence: frameworkSubjectsTable.sequence
      })
      .from(frameworkSubjectsTable)
      .where(eq(frameworkSubjectsTable.frameworkId, framework.id))
      .orderBy(asc(frameworkSubjectsTable.sequence))

    // Load all levels for these subjects
    const subjectIds = subjects.map(s => s.id)
    const levels = await db
      .select({
        id: subjectLevelsTable.id,
        frameworkSubjectId: subjectLevelsTable.frameworkSubjectId,
        levelKey: subjectLevelsTable.levelKey,
        displayName: subjectLevelsTable.displayName,
        stream: subjectLevelsTable.stream,
        sequence: subjectLevelsTable.sequence
      })
      .from(subjectLevelsTable)
      .where(inArray(subjectLevelsTable.frameworkSubjectId, subjectIds))
      .orderBy(asc(subjectLevelsTable.sequence))

    // Group levels by subject
    const subjectsWithLevels = subjects.map(subject => ({
      ...subject,
      levels: levels.filter(l => l.frameworkSubjectId === subject.id)
    }))

    return {
      isSuccess: true,
      message: "Taxonomy loaded successfully",
      data: {
        framework,
        subjects: subjectsWithLevels
      }
    }
  } catch (error) {
    console.error("Error getting taxonomy summary:", error)
    return { isSuccess: false, message: "Failed to load taxonomy" }
  }
}

/**
 * Get topics and subtopics for a specific subject-level.
 * Used for lazy-loading when the user expands a subject-level accordion.
 */
export async function getTopicsForSubjectLevelAction(
  subjectLevelId: string
): Promise<ActionState<TopicTree>> {
  try {
    // Get the subject-level details
    const subjectLevel = await db.query.subjectLevels.findFirst({
      where: eq(subjectLevelsTable.id, subjectLevelId),
      with: {
        frameworkSubject: true
      }
    })

    if (!subjectLevel) {
      return {
        isSuccess: false,
        message: "Subject level not found"
      }
    }

    // Load topics with subtopics
    const topics = await db
      .select()
      .from(subjectTopicsTable)
      .where(eq(subjectTopicsTable.subjectLevelId, subjectLevelId))
      .orderBy(asc(subjectTopicsTable.sequence))

    const topicIds = topics.map(t => t.id)
    const subtopics = topicIds.length
      ? await db
          .select()
          .from(subjectSubtopicsTable)
          .where(inArray(subjectSubtopicsTable.topicId, topicIds))
          .orderBy(asc(subjectSubtopicsTable.sequence))
      : []

    // Group subtopics by topic
    const topicsWithSubtopics = topics.map(topic => ({
      id: topic.id,
      code: topic.code,
      name: topic.name,
      strand: topic.strand,
      sequence: topic.sequence,
      subtopics: subtopics
        .filter(st => st.topicId === topic.id)
        .map(st => ({
          id: st.id,
          code: st.code,
          name: st.name,
          learningObjectives: st.learningObjectives as any[],
          sequence: st.sequence
        }))
    }))

    return {
      isSuccess: true,
      message: "Topics loaded successfully",
      data: {
        subjectLevel: {
          id: subjectLevel.id,
          levelKey: subjectLevel.levelKey,
          displayName: subjectLevel.displayName,
          subjectKey: (subjectLevel as any).frameworkSubject.subjectKey,
          subjectName: (subjectLevel as any).frameworkSubject.displayName
        },
        topics: topicsWithSubtopics
      }
    }
  } catch (error) {
    console.error("Error getting topics:", error)
    return { isSuccess: false, message: "Failed to load topics" }
  }
}

/**
 * Update the user's academic profile with new selections.
 * Validates that defaults exist in submitted lists and deduplicates selections.
 */
export async function updateAcademicProfileAction(
  payload: UpdateAcademicProfilePayload
): Promise<ActionState<AcademicProfile>> {
  try {
    const user = await getCurrentUserAction()
    if (!user) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Validate that preferred subject-level exists in selections
    if (
      payload.preferredSubjectLevelId &&
      !payload.subjectLevelIds.includes(payload.preferredSubjectLevelId)
    ) {
      return {
        isSuccess: false,
        message: "Preferred subject-level must be in your selected subjects"
      }
    }

    // Validate that current topic exists in selections
    if (
      payload.currentTopicId &&
      !payload.topicIds.includes(payload.currentTopicId)
    ) {
      return {
        isSuccess: false,
        message: "Current topic must be in your selected topics"
      }
    }

    // Update or create profile
    await db
      .insert(userAcademicProfilesTable)
      .values({
        userId: user.id,
        frameworkId: payload.frameworkId,
        preferredSubjectLevelId: payload.preferredSubjectLevelId,
        currentTopicId: payload.currentTopicId,
        metadata: {}
      })
      .onConflictDoUpdate({
        target: userAcademicProfilesTable.userId,
        set: {
          frameworkId: payload.frameworkId,
          preferredSubjectLevelId: payload.preferredSubjectLevelId,
          currentTopicId: payload.currentTopicId,
          updatedAt: new Date()
        }
      })

    // Delete existing associations
    await db
      .delete(userSubjectLevelsTable)
      .where(eq(userSubjectLevelsTable.userId, user.id))
    await db.delete(userTopicsTable).where(eq(userTopicsTable.userId, user.id))
    await db
      .delete(userSubtopicsTable)
      .where(eq(userSubtopicsTable.userId, user.id))

    // Insert new subject-level associations (deduplicated)
    const uniqueSubjectLevelIds = [...new Set(payload.subjectLevelIds)]
    if (uniqueSubjectLevelIds.length > 0) {
      await db.insert(userSubjectLevelsTable).values(
        uniqueSubjectLevelIds.map(id => ({
          userId: user.id,
          subjectLevelId: id
        }))
      )
    }

    // Insert new topic associations (deduplicated)
    const uniqueTopicIds = [...new Set(payload.topicIds)]
    if (uniqueTopicIds.length > 0) {
      await db.insert(userTopicsTable).values(
        uniqueTopicIds.map(id => ({
          userId: user.id,
          topicId: id
        }))
      )
    }

    // Insert new subtopic associations (deduplicated)
    const uniqueSubtopicIds = [...new Set(payload.subtopicIds)]
    if (uniqueSubtopicIds.length > 0) {
      await db.insert(userSubtopicsTable).values(
        uniqueSubtopicIds.map(id => ({
          userId: user.id,
          subtopicId: id
        }))
      )
    }

    // Reload and return the updated profile
    const result = await getAcademicProfileAction()
    if (!result.isSuccess) {
      return result
    }

    return {
      isSuccess: true,
      message: "Profile updated successfully",
      data: result.data
    }
  } catch (error) {
    console.error("Error updating academic profile:", error)
    return { isSuccess: false, message: "Failed to update profile" }
  }
}

/**
 * Reset the user's academic profile by deleting all selections.
 * The profile row itself remains with null defaults.
 */
export async function resetAcademicProfileAction(): Promise<
  ActionState<void>
> {
  try {
    const user = await getCurrentUserAction()
    if (!user) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Delete all user associations
    await db
      .delete(userSubjectLevelsTable)
      .where(eq(userSubjectLevelsTable.userId, user.id))
    await db.delete(userTopicsTable).where(eq(userTopicsTable.userId, user.id))
    await db
      .delete(userSubtopicsTable)
      .where(eq(userSubtopicsTable.userId, user.id))

    // Update profile to clear defaults
    await db
      .update(userAcademicProfilesTable)
      .set({
        preferredSubjectLevelId: null,
        currentTopicId: null,
        updatedAt: new Date()
      })
      .where(eq(userAcademicProfilesTable.userId, user.id))

    return {
      isSuccess: true,
      message: "Profile reset successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error resetting academic profile:", error)
    return { isSuccess: false, message: "Failed to reset profile" }
  }
}
