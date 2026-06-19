import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "../config/prisma.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function extractJson(text) {
  if (!text) throw new Error("Gemini returned an empty response.");
  let cleaned = text.replace(/```json|```/gi, "").trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return JSON.parse(cleaned);
}

export async function processRoadmap(roadmapId) {
  // console.log(`\n========================================`);
  // console.log(`⚙️ PROCESSING ROADMAP ID: ${roadmapId}`);
  // console.log(`========================================`);

  try {
    await prisma.userRoadmap.update({
      where: { id: roadmapId },
      data: {
        generationStatus: "processing",
        generationStartedAt: new Date(),
        generationError: null,
      },
    });

    const roadmap = await prisma.userRoadmap.findUnique({
      where: { id: roadmapId },
      select: { id: true, careerGoal: true },
    });

    if (!roadmap) throw new Error("Roadmap not found.");

    // EXPLICIT CONFIG: Force Gemini into strict JSON mode
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = `
You are an elite Tech Career Mentor. Create a highly detailed, execution-focused learning roadmap for: "${roadmap.careerGoal}".

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
    },
    {
      "title": "Phase 2: [Next Topic]",
      "description": "[Detailed 3-4 sentence execution plan]",
      "level": "intermediate",
      "duration": "[e.g., 4 weeks]",
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
        // console.log(`-> Gemini API Attempt ${attempt}...`);
        result = await model.generateContent(prompt);
        break;
      } catch (err) {
        if (err.status === 503 && attempt < 3) {
          // console.log("Gemini busy. Retrying...");
          await new Promise((resolve) => setTimeout(resolve, 3000 * attempt));
          continue;
        }
        throw err;
      }
    }

    if (!result) throw new Error("Gemini failed after multiple retries.");

    const responseText = result.response.text();

    // --- X-RAY LOGGING ---
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
      throw new Error("Invalid roadmap format. Missing 'steps' array.");
    }

    // --- X-RAY LOGGING ---
    // console.log(`✅ SUCCESS: Parsed ${parsed.steps.length} steps from Gemini.`);
    parsed.steps.forEach((s, idx) => {
      console.log(
        `   Step ${idx + 1}: ${s.title} | Resources: ${s.resources?.length || 0}`,
      );
    });

    await prisma.stepResource.deleteMany({
      where: { step: { roadmapId } },
    });

    await prisma.roadmapStep.deleteMany({
      where: { roadmapId },
    });

    await prisma.$transaction(async (tx) => {
      for (let index = 0; index < parsed.steps.length; index++) {
        const step = parsed.steps[index];

        const createdStep = await tx.roadmapStep.create({
          data: {
            roadmapId,
            stepOrder: index + 1,
            title: step.title ?? "",
            description: step.description ?? "",
            level: step.level ?? "beginner",
            duration: step.duration ?? "",
            mentorTip: step.mentor_tip ?? step.mentorTip ?? "",
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

      await tx.userRoadmap.update({
        where: { id: roadmapId },
        data: {
          generationStatus: "completed",
          generationFinishedAt: new Date(),
        },
      });
    });

    // console.log(`✅ Roadmap fully saved to database: ${roadmapId}`);
    // console.log(`========================================\n`);
  } catch (err) {
    console.error("❌ ROADMAP WORKER FATAL ERROR:");
    console.error(err);

    await prisma.userRoadmap.update({
      where: { id: roadmapId },
      data: {
        generationStatus: "failed",
        generationFinishedAt: new Date(),
        generationError: err?.message || "Roadmap generation failed.",
      },
    });
  }
}
