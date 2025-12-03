/*
<ai_context>
Seed script for Singapore MOE curriculum taxonomy.
Populates curriculum_frameworks, framework_subjects, subject_levels, subject_topics, and subject_subtopics.
Run with: pnpm tsx db/seed-moe-taxonomy.ts
</ai_context>
*/

import { db } from "./db"
import {
  curriculumFrameworksTable,
  frameworkSubjectsTable,
  subjectLevelsTable,
  subjectTopicsTable,
  subjectSubtopicsTable
} from "./schema"

async function seedMOETaxonomy() {
  console.log("🌱 Seeding Singapore MOE taxonomy...")

  // 1. Create Singapore MOE framework
  const [framework] = await db
    .insert(curriculumFrameworksTable)
    .values({
      name: "Singapore Ministry of Education",
      region: "Singapore",
      version: "sg_moe_2024",
      gradeBands: {
        primary: {
          label: "Primary",
          levels: ["P1", "P2", "P3", "P4", "P5", "P6"]
        },
        lower_secondary: {
          label: "Lower Secondary",
          levels: ["Sec1", "Sec2"],
          streams: ["Express", "Normal Academic", "Normal Technical"]
        },
        upper_secondary: {
          label: "Upper Secondary",
          levels: ["Sec3", "Sec4", "Sec5"],
          streams: ["Express", "Normal Academic", "Normal Technical"]
        }
      },
      description:
        "Singapore Ministry of Education curriculum framework for Primary and Secondary education",
      isActive: true
    })
    .returning()

  console.log("✓ Created framework:", framework.name)

  // 2. Create subjects
  const subjects = [
    {
      subjectKey: "mathematics",
      displayName: "Mathematics",
      description:
        "Foundation and advanced mathematical concepts including algebra, geometry, and statistics",
      sequence: 1
    },
    {
      subjectKey: "additional_mathematics",
      displayName: "Additional Mathematics",
      description: "Advanced mathematics for upper secondary students",
      sequence: 2
    },
    {
      subjectKey: "science",
      displayName: "Science",
      description: "General science covering physics, chemistry, and biology concepts",
      sequence: 3
    },
    {
      subjectKey: "physics",
      displayName: "Physics",
      description: "Study of matter, energy, and their interactions",
      sequence: 4
    },
    {
      subjectKey: "chemistry",
      displayName: "Chemistry",
      description: "Study of substances, their properties, and reactions",
      sequence: 5
    },
    {
      subjectKey: "biology",
      displayName: "Biology",
      description: "Study of living organisms and life processes",
      sequence: 6
    },
    {
      subjectKey: "english",
      displayName: "English Language",
      description: "Reading, writing, speaking, and listening skills",
      sequence: 7
    },
    {
      subjectKey: "mother_tongue",
      displayName: "Mother Tongue",
      description: "Chinese, Malay, or Tamil language",
      sequence: 8
    }
  ]

  const createdSubjects = await db
    .insert(frameworkSubjectsTable)
    .values(
      subjects.map(s => ({
        frameworkId: framework.id,
        ...s
      }))
    )
    .returning()

  console.log("✓ Created", createdSubjects.length, "subjects")

  // 3. Create levels for each subject
  const mathSubject = createdSubjects.find(s => s.subjectKey === "mathematics")!
  const scienceSubject = createdSubjects.find(s => s.subjectKey === "science")!
  const physicsSubject = createdSubjects.find(s => s.subjectKey === "physics")!
  const chemistrySubject = createdSubjects.find(
    s => s.subjectKey === "chemistry"
  )!
  const biologySubject = createdSubjects.find(s => s.subjectKey === "biology")!
  const englishSubject = createdSubjects.find(s => s.subjectKey === "english")!

  // Primary levels (P1-P6) for Mathematics, Science, English
  const primaryLevels = []
  for (const subject of [mathSubject, scienceSubject, englishSubject]) {
    for (let i = 1; i <= 6; i++) {
      primaryLevels.push({
        frameworkSubjectId: subject.id,
        levelKey: `primary_p${i}`,
        displayName: `Primary ${i}`,
        stream: null,
        sequence: i
      })
    }
  }

  // Secondary levels with streams
  const secondaryLevels = []
  const streams = [
    { key: "express", name: "Express" },
    { key: "normal_academic", name: "Normal Academic" },
    { key: "normal_technical", name: "Normal Technical" }
  ]

  // Mathematics: Sec1-5 with streams
  for (let i = 1; i <= 5; i++) {
    for (const stream of streams) {
      secondaryLevels.push({
        frameworkSubjectId: mathSubject.id,
        levelKey: `sec${i}_${stream.key}`,
        displayName: `Secondary ${i}`,
        stream: stream.name,
        sequence: 6 + (i - 1) * 3 + streams.indexOf(stream)
      })
    }
  }

  // Science subjects: Sec1-5 with streams
  for (const subject of [scienceSubject, physicsSubject, chemistrySubject, biologySubject]) {
    for (let i = 1; i <= 5; i++) {
      for (const stream of streams) {
        secondaryLevels.push({
          frameworkSubjectId: subject.id,
          levelKey: `sec${i}_${stream.key}`,
          displayName: `Secondary ${i}`,
          stream: stream.name,
          sequence: 6 + (i - 1) * 3 + streams.indexOf(stream)
        })
      }
    }
  }

  const createdLevels = await db
    .insert(subjectLevelsTable)
    .values([...primaryLevels, ...secondaryLevels])
    .returning()

  console.log("✓ Created", createdLevels.length, "levels")

  // 4. Create sample topics for Mathematics Primary 5
  const mathP5 = createdLevels.find(
    l =>
      l.frameworkSubjectId === mathSubject.id && l.levelKey === "primary_p5"
  )!

  const mathP5Topics = [
    {
      subjectLevelId: mathP5.id,
      code: "MA-P5-01",
      name: "Whole Numbers",
      strand: "Number & Algebra",
      description: "Operations with whole numbers up to 10 million",
      sequence: 1
    },
    {
      subjectLevelId: mathP5.id,
      code: "MA-P5-02",
      name: "Fractions",
      strand: "Number & Algebra",
      description: "Adding, subtracting, multiplying, and dividing fractions",
      sequence: 2
    },
    {
      subjectLevelId: mathP5.id,
      code: "MA-P5-03",
      name: "Decimals",
      strand: "Number & Algebra",
      description: "Operations with decimals up to 3 decimal places",
      sequence: 3
    },
    {
      subjectLevelId: mathP5.id,
      code: "MA-P5-04",
      name: "Percentage",
      strand: "Number & Algebra",
      description: "Expressing fractions and decimals as percentages",
      sequence: 4
    },
    {
      subjectLevelId: mathP5.id,
      code: "MA-P5-05",
      name: "Ratio",
      strand: "Number & Algebra",
      description: "Finding ratio and equivalent ratios",
      sequence: 5
    },
    {
      subjectLevelId: mathP5.id,
      code: "MA-P5-06",
      name: "Area and Perimeter",
      strand: "Measurement & Geometry",
      description: "Finding area and perimeter of composite figures",
      sequence: 6
    },
    {
      subjectLevelId: mathP5.id,
      code: "MA-P5-07",
      name: "Volume",
      strand: "Measurement & Geometry",
      description: "Finding volume of cubes and cuboids",
      sequence: 7
    },
    {
      subjectLevelId: mathP5.id,
      code: "MA-P5-08",
      name: "Angles",
      strand: "Measurement & Geometry",
      description: "Properties of angles in geometric figures",
      sequence: 8
    }
  ]

  const createdMathTopics = await db
    .insert(subjectTopicsTable)
    .values(mathP5Topics)
    .returning()

  console.log("✓ Created", createdMathTopics.length, "Mathematics P5 topics")

  // 5. Create sample subtopics for Fractions topic
  const fractionsTopicId = createdMathTopics.find(t => t.code === "MA-P5-02")!.id

  const fractionSubtopics = [
    {
      topicId: fractionsTopicId,
      code: "MA-P5-02-01",
      name: "Adding and Subtracting Unlike Fractions",
      learningObjectives: [
        "Add up to 3 unlike fractions",
        "Subtract unlike fractions from whole numbers and mixed numbers"
      ],
      sequence: 1
    },
    {
      topicId: fractionsTopicId,
      code: "MA-P5-02-02",
      name: "Multiplying Fractions",
      learningObjectives: [
        "Multiply a proper fraction by a whole number",
        "Multiply a fraction by a fraction"
      ],
      sequence: 2
    },
    {
      topicId: fractionsTopicId,
      code: "MA-P5-02-03",
      name: "Dividing Fractions",
      learningObjectives: [
        "Divide a proper fraction by a whole number",
        "Find the fractional part of a set"
      ],
      sequence: 3
    },
    {
      topicId: fractionsTopicId,
      code: "MA-P5-02-04",
      name: "Word Problems Involving Fractions",
      learningObjectives: [
        "Solve up to 2-step word problems involving fractions",
        "Use bar models to represent fraction word problems"
      ],
      sequence: 4
    }
  ]

  const createdSubtopics = await db
    .insert(subjectSubtopicsTable)
    .values(fractionSubtopics)
    .returning()

  console.log("✓ Created", createdSubtopics.length, "subtopics for Fractions")

  // 6. Create sample topics for Science Secondary 2 Express
  const scienceSec2Express = createdLevels.find(
    l =>
      l.frameworkSubjectId === scienceSubject.id &&
      l.levelKey === "sec2_express"
  )!

  const scienceSec2Topics = [
    {
      subjectLevelId: scienceSec2Express.id,
      code: "SC-S2-01",
      name: "Electricity",
      strand: "Physics",
      description: "Electric current, potential difference, and resistance",
      sequence: 1
    },
    {
      subjectLevelId: scienceSec2Express.id,
      code: "SC-S2-02",
      name: "Magnetism",
      strand: "Physics",
      description: "Magnetic fields and electromagnetic induction",
      sequence: 2
    },
    {
      subjectLevelId: scienceSec2Express.id,
      code: "SC-S2-03",
      name: "Chemical Reactions",
      strand: "Chemistry",
      description: "Types of chemical reactions and their properties",
      sequence: 3
    },
    {
      subjectLevelId: scienceSec2Express.id,
      code: "SC-S2-04",
      name: "Cells and Organization",
      strand: "Biology",
      description: "Cell structure and organization in living things",
      sequence: 4
    },
    {
      subjectLevelId: scienceSec2Express.id,
      code: "SC-S2-05",
      name: "Human Digestive System",
      strand: "Biology",
      description: "Structure and function of the digestive system",
      sequence: 5
    }
  ]

  await db.insert(subjectTopicsTable).values(scienceSec2Topics)

  console.log("✓ Created", scienceSec2Topics.length, "Science Sec2 topics")

  console.log("🎉 Seeding complete!")
}

// Run the seed function
seedMOETaxonomy()
  .then(() => {
    console.log("✅ Done")
    process.exit(0)
  })
  .catch(error => {
    console.error("❌ Error seeding taxonomy:", error)
    process.exit(1)
  })
