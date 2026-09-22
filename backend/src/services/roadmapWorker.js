import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { prisma } from "../config/prisma.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const roadmapResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    steps: {
      type: SchemaType.ARRAY,
      description: "List of learning roadmap steps in chronological order.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: {
            type: SchemaType.STRING,
            description: "Step title, e.g., 'Phase 1: Foundations'",
          },
          description: {
            type: SchemaType.STRING,
            description: "Detailed 3-4 sentence execution plan for this step.",
          },
          level: {
            type: SchemaType.STRING,
            description: "Level: beginner, intermediate, or advanced",
          },
          duration: {
            type: SchemaType.STRING,
            description: "Estimated duration, e.g., '3 weeks'.",
          },
          mentor_tip: {
            type: SchemaType.STRING,
            description: "Insider industry advice or actionable mentor recommendation.",
          },
          resources: {
            type: SchemaType.ARRAY,
            description: "Curated learning resources for this step.",
            items: {
              type: SchemaType.OBJECT,
              properties: {
                type: {
                  type: SchemaType.STRING,
                  description: "Resource type: youtube, course, docs, or project.",
                },
                title: {
                  type: SchemaType.STRING,
                  description: "Title of the resource.",
                },
                provider: {
                  type: SchemaType.STRING,
                  description: "Platform or publisher, e.g., 'FreeCodeCamp', 'MDN', 'Coursera'.",
                },
                url: {
                  type: SchemaType.STRING,
                  description: "Searchable query or link.",
                },
              },
              required: ["type", "title", "provider"],
            },
          },
        },
        required: [
          "title",
          "description",
          "level",
          "duration",
          "mentor_tip",
          "resources",
        ],
      },
    },
  },
  required: ["steps"],
};

function extractJson(text) {
  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  let cleaned = text.replace(/```json|```/gi, "").trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  return JSON.parse(cleaned);
}

async function updateRoadmapStatus(roadmapId, status, errorMessage = null) {
  const data = {
    generationStatus: status,
  };

  if (status === "processing") {
    data.generationStartedAt = new Date();
    data.generationError = null;
  }

  if (status === "completed") {
    data.generationFinishedAt = new Date();
    data.generationError = null;
  }

  if (status === "failed") {
    data.generationFinishedAt = new Date();
    data.generationError = errorMessage || "Roadmap generation failed.";
  }

  await prisma.userRoadmap.update({
    where: {
      id: roadmapId,
    },
    data,
  });
}

async function generateRoadmap(careerGoal) {
  // 1. STRICT JSON ENFORCEMENT VIA RESPONSE SCHEMA
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: roadmapResponseSchema,
    },
  });

  // 2. EXPLICIT MULTI-RESOURCE PROMPT
  const prompt = `
You are an elite Tech Career Mentor. Create a highly detailed, execution-focused learning roadmap for: "${careerGoal}".

CRITICAL REQUIREMENTS:
1. You MUST generate EXACTLY 6 sequential phases/steps. 
2. Every step MUST contain EXACTLY 3 distinct resources.
3. "description" MUST be a detailed, actionable paragraph (3-4 sentences).
4. "mentor_tip" MUST be insider industry advice.

Respond ONLY with a valid JSON object matching this exact structure:

{
  "steps": [
    {
      "title": "Phase 1: [Specific Topic]",
      "description": "[Detailed 3-4 sentence execution plan]",
      "level": "beginner",
      "duration": "[e.g., 3 weeks]",
      "mentor_tip": "[Insider advice]",
      "resources": [
        { "type": "youtube", "title": "Resource 1", "provider": "Provider 1", "url": "Link" },
        { "type": "docs", "title": "Resource 2", "provider": "Provider 2", "url": "Link" },
        { "type": "project", "title": "Resource 3", "provider": "Provider 3", "url": "Link" }
      ]
    }
  ]
}
`;

  let result = null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      // console.log(`Gemini Attempt ${attempt}...`);
      result = await model.generateContent(prompt);
      break;
    } catch (err) {
      if (err?.status === 503 && attempt < 3) {
        // console.log("Gemini busy. Retrying...");
        await new Promise((resolve) => setTimeout(resolve, attempt * 3000));
        continue;
      }
      throw err;
    }
  }

  if (!result) {
    throw new Error("Gemini failed after multiple retries.");
  }

  const responseText = result.response.text();

  // 3. X-RAY LOGGING FOR DEBUGGING
  // console.log(`\n--- RAW GEMINI OUTPUT START ---`);
  // console.log(responseText);
  // console.log(`--- RAW GEMINI OUTPUT END ---\n`);

  let parsed;

  try {
    parsed = extractJson(responseText);
  } catch (err) {
    console.error("JSON PARSE FAILED. Raw text was:", responseText);
    throw new Error("Gemini returned invalid JSON.");
  }

  if (!parsed.steps || !Array.isArray(parsed.steps)) {
    throw new Error("Invalid roadmap format.");
  }

  // console.log(`✅ SUCCESS: Parsed ${parsed.steps.length} steps from Gemini.`);
  return parsed.steps;
}
async function replaceRoadmapSteps(tx, roadmapId, steps) {
  await tx.stepResource.deleteMany({
    where: {
      step: {
        roadmapId,
      },
    },
  });

  await tx.roadmapStep.deleteMany({
    where: {
      roadmapId,
    },
  });

  for (let index = 0; index < steps.length; index++) {
    const step = steps[index];

    const createdStep = await tx.roadmapStep.create({
      data: {
        roadmapId,

        stepOrder: index + 1,

        title: step.title ?? "",

        description: step.description ?? "",

        level: step.level ?? "beginner",

        duration: step.duration ?? "",

        mentorTip: step.mentor_tip ?? "",

        status: "not-started",
      },
    });

    if (Array.isArray(step.resources) && step.resources.length > 0) {
      await tx.stepResource.createMany({
        data: step.resources.map((resource) => ({
          stepId: createdStep.id,

          type: resource.type ?? "docs",

          title: resource.title ?? "",

          provider: resource.provider ?? "",

          url: resource.url ?? "",
        })),
      });
    }
  }
}

export async function processRoadmap(roadmapId) {
  // console.log(`⚙️ Processing roadmap ${roadmapId}`);

  try {
    await updateRoadmapStatus(roadmapId, "processing");

    const roadmap = await prisma.userRoadmap.findUnique({
      where: {
        id: roadmapId,
      },
      select: {
        id: true,
        careerGoal: true,
      },
    });

    if (!roadmap) {
      throw new Error("Roadmap not found.");
    }

    const steps = await generateRoadmap(roadmap.careerGoal ?? roadmap.title);

    await prisma.$transaction(
      async (tx) => {
        await replaceRoadmapSteps(tx, roadmapId, steps);

        await tx.userRoadmap.update({
          where: {
            id: roadmapId,
          },
          data: {
            generationStatus: "completed",
            generationFinishedAt: new Date(),
            generationError: null,
          },
        });
      },
      {
        maxWait: 5000, // time to wait to acquire the transaction lock
        timeout: 30000, // INCREASED: Allow up to 30 seconds for the transaction to complete
      },
    );

    // console.log(`✅ Roadmap completed ${roadmapId}`);
  } catch (err) {
    console.error("ROADMAP WORKER ERROR");
    console.error(err);

    await updateRoadmapStatus(roadmapId, "failed", err?.message);
  }
}
