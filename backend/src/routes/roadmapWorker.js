import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "../supabaseClient.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function processRoadmap(roadmapId) {
  console.log("⚙️ Processing roadmap:", roadmapId);

  try {
    await supabase
      .from("user_roadmaps")
      .update({
        generation_status: "processing",
        generation_started_at: new Date().toISOString(),
        generation_error: null,
      })
      .eq("id", roadmapId);

    const { data: roadmap, error: roadmapErr } = await supabase
      .from("user_roadmaps")
      .select("career_goal")
      .eq("id", roadmapId)
      .single();

    if (roadmapErr || !roadmap) throw new Error("Roadmap not found");

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
        { "type": "youtube", "title": "", "provider": "", "url": "" }
      ]
    }
  ]
}

Career: "${roadmap.career_goal}"
`;

    const result = await model.generateContent(prompt);

    let text = result.response.text();
    text = text.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      console.error("❌ JSON PARSE FAILED:", text);
      throw e;
    }

    for (let i = 0; i < parsed.steps.length; i++) {
      const step = parsed.steps[i];

      const { data: stepRow, error: stepErr } = await supabase
        .from("roadmap_steps")
        .insert({
          roadmap_id: roadmapId,
          step_order: i + 1,
          title: step.title,
          description: step.description,
          level: step.level,
          duration: step.duration,
          mentor_tip: step.mentor_tip,
          status: "not-started",
        })
        .select()
        .single();

      if (stepErr) throw stepErr;

      if (step.resources?.length) {
        const rows = step.resources.map((r) => ({
          step_id: stepRow.id,
          type: r.type,
          title: r.title,
          provider: r.provider,
          url: r.url,
        }));

        await supabase.from("step_resources").insert(rows);
      }
    }

    await supabase
      .from("user_roadmaps")
      .update({
        generation_status: "completed",
        generation_finished_at: new Date().toISOString(),
      })
      .eq("id", roadmapId);

    console.log("✅ Roadmap completed:", roadmapId);
  } catch (err) {
    await supabase
      .from("user_roadmaps")
      .update({
        generation_status: "failed",
        generation_finished_at: new Date().toISOString(),
        generation_error: err.message || "Unknown worker failure",
      })
      .eq("id", roadmapId);

    console.error("ROADMAP WORKER FAILED:", err);
  }
}
