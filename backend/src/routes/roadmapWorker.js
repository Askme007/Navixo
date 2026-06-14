import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "../config/prisma.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

export async function processRoadmap(roadmapId) {
  console.log(`⚙️ Processing roadmap ${roadmapId}`);

  try {
    //-------------------------------------------------------
    // Mark roadmap as processing
    //-------------------------------------------------------

    await prisma.userRoadmap.update({
      where: {
        id: roadmapId,
      },
      data: {
        generationStatus: "processing",
        generationStartedAt: new Date(),
        generationError: null,
      },
    });

    //-------------------------------------------------------
    // Fetch roadmap
    //-------------------------------------------------------

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

    //-------------------------------------------------------
    // Gemini
    //-------------------------------------------------------

    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite",
    });

    const prompt = `
Return STRICT JSON only.

{
  "steps": [
    {
      "title": "",
      "description": "",
      "level": "beginner | intermediate | advanced",
      "duration": "4 weeks",
      "mentor_tip": "",
      "resources": [
        {
          "type":"youtube",
          "title":"",
          "provider":"",
          "url":""
        }
      ]
    }
  ]
}

Career: "${roadmap.careerGoal}"
`;

    let result = null;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Gemini Attempt ${attempt}`);

        result = await model.generateContent(prompt);

        break;
      } catch (err) {
        if (err.status === 503 && attempt < 3) {
          console.log("Gemini busy. Retrying...");

          await new Promise((resolve) =>
            setTimeout(resolve, 3000 * attempt)
          );

          continue;
        }

        throw err;
      }
    }

    if (!result) {
      throw new Error("Gemini failed after multiple retries.");
    }

    //-------------------------------------------------------
    // Parse response
    //-------------------------------------------------------

    const responseText = result.response.text();

    let parsed;

    try {
      parsed = extractJson(responseText);
    } catch (err) {
      console.error(responseText);
      throw new Error("Gemini returned invalid JSON.");
    }

    if (!parsed.steps || !Array.isArray(parsed.steps)) {
      throw new Error("Invalid roadmap format.");
    }

    //-------------------------------------------------------
    // Remove old roadmap (if retry)
    //-------------------------------------------------------

    await prisma.stepResource.deleteMany({
      where: {
        step: {
          roadmapId,
        },
      },
    });

    await prisma.roadmapStep.deleteMany({
      where: {
        roadmapId,
      },
    });

    //-------------------------------------------------------
    // Insert roadmap
    //-------------------------------------------------------

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

            mentorTip: step.mentor_tip ?? "",

            status: "not-started",
          },
        });

        if (
          Array.isArray(step.resources) &&
          step.resources.length > 0
        ) {
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
        where: {
          id: roadmapId,
        },
        data: {
          generationStatus: "completed",
          generationFinishedAt: new Date(),
        },
      });
    });

    console.log(`✅ Roadmap completed ${roadmapId}`);
  } catch (err) {
    console.error("ROADMAP WORKER ERROR");

    console.error(err);

    await prisma.userRoadmap.update({
      where: {
        id: roadmapId,
      },
      data: {
        generationStatus: "failed",

        generationFinishedAt: new Date(),

        generationError:
          err?.message ||
          "Roadmap generation failed.",
      },
    });
  }
}