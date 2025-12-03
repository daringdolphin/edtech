/*
<ai_context>
Contains types for the academic profile feature.
Includes types for user profiles, taxonomy summaries, and update payloads.
</ai_context>
*/

import {
  SelectCurriculumFramework,
  SelectFrameworkSubject,
  SelectSubjectLevel,
  SelectSubjectTopic,
  SelectSubjectSubtopic,
  SelectUserAcademicProfile
} from "@/db/schema"

// User's academic profile with related data
export interface AcademicProfile {
  profile: SelectUserAcademicProfile
  framework: SelectCurriculumFramework
  subjectLevels: Array<{
    id: string
    subjectKey: string
    subjectName: string
    levelKey: string
    levelName: string
    stream: string | null
  }>
  topics: Array<{
    id: string
    code: string
    name: string
    strand: string | null
    subjectLevelId: string
  }>
  subtopics: Array<{
    id: string
    code: string
    name: string
    topicId: string
  }>
}

// Framework summary for dropdowns (subjects + levels, no topics)
export interface FrameworkSummary {
  framework: SelectCurriculumFramework
  subjects: Array<{
    id: string
    subjectKey: string
    displayName: string
    description: string | null
    sequence: number
    levels: Array<{
      id: string
      levelKey: string
      displayName: string
      stream: string | null
      sequence: number
    }>
  }>
}

// Topic tree for a specific subject-level
export interface TopicTree {
  subjectLevel: {
    id: string
    levelKey: string
    displayName: string
    subjectKey: string
    subjectName: string
  }
  topics: Array<{
    id: string
    code: string
    name: string
    strand: string | null
    sequence: number
    subtopics: Array<{
      id: string
      code: string
      name: string
      learningObjectives: any[]
      sequence: number
    }>
  }>
}

// Payload for updating academic profile
export interface UpdateAcademicProfilePayload {
  frameworkId: string
  subjectLevelIds: string[] // Selected subject-level combinations
  topicIds: string[] // Selected topics
  subtopicIds: string[] // Selected subtopics
  preferredSubjectLevelId: string | null // Default subject-level
  currentTopicId: string | null // Current focus topic
}
