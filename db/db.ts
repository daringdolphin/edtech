/*
<ai_context>
Initializes the database connection for the app.
</ai_context>
*/

import { config } from "dotenv"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import {
  questionItemsTable,
  papersTable,
  paperBlocksTable,
  answerArtifactsTable,
  answersTable,
  answerArtifactLinksTable,
  evaluationsTable
} from "@/db/schema"

config({ path: ".env.local" })

const schema = {
  questionItems: questionItemsTable,
  papers: papersTable,
  paperBlocks: paperBlocksTable,
  answerArtifacts: answerArtifactsTable,
  answers: answersTable,
  answerArtifactLinks: answerArtifactLinksTable,
  evaluations: evaluationsTable
}

const client = postgres(process.env.DATABASE_URL!)

export const db = drizzle(client, { schema })
