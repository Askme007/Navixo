import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "../lib/prisma.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export class EmbeddingService {
  /**
   * Generates a 3072-dimensional vector embedding using Gemini gemini-embedding-001
   */
  static async generateEmbedding(text) {
    if (!text || typeof text !== "string" || !text.trim()) {
      return null;
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
      const result = await model.embedContent(text.slice(0, 8000));
      return result?.embedding?.values || null;
    } catch (err) {
      console.error("Embedding generation error:", err.message);
      return null;
    }
  }

  /**
   * Stores or replaces an embedding record for a user in PostgreSQL pgvector user_embeddings table
   */
  static async storeUserEmbedding(userId, docId, textSnippet) {
    if (!userId || !textSnippet) return false;

    try {
      const vector = await this.generateEmbedding(textSnippet);
      if (!vector || vector.length === 0) return false;

      // Delete existing record for this docId if updating
      await prisma.$executeRawUnsafe(
        `DELETE FROM "user_embeddings" WHERE "user_id" = $1::uuid AND "doc_id" = $2`,
        userId,
        docId
      ).catch(() => {});

      // Insert vector using pgvector syntax
      await prisma.$executeRawUnsafe(
        `INSERT INTO "user_embeddings" ("id", "user_id", "doc_id", "embedding", "text_snippet", "created_at")
         VALUES (gen_random_uuid(), $1::uuid, $2, $3::vector, $4, NOW())`,
        userId,
        docId,
        JSON.stringify(vector),
        textSnippet
      );

      return true;
    } catch (err) {
      console.error("Store embedding error:", err.message);
      return false;
    }
  }

  /**
   * Performs semantic vector search on user_embeddings using cosine distance (<=>)
   */
  static async searchUserContext(userId, queryText, limit = 3) {
    if (!userId || !queryText || !queryText.trim()) return [];

    try {
      const vector = await this.generateEmbedding(queryText);
      if (!vector || vector.length === 0) return [];

      const rows = await prisma.$queryRawUnsafe(
        `SELECT "doc_id", "text_snippet", 1 - ("embedding" <=> $1::vector) AS similarity
         FROM "user_embeddings"
         WHERE "user_id" = $2::uuid AND "embedding" IS NOT NULL
         ORDER BY similarity DESC
         LIMIT $3`,
        JSON.stringify(vector),
        userId,
        limit
      );

      return rows || [];
    } catch (err) {
      console.error("Vector search error:", err.message);
      return [];
    }
  }

  /**
   * Serializes the student's complete onboarding profile & career trajectory into an embedding
   */
  static async embedUserProfile(userId, profileData) {
    if (!userId || !profileData) return false;

    const onboarding = profileData.onboarding || profileData;
    const targetRole = onboarding.careerPath || onboarding.target_role || onboarding.domain || "Software Development Engineer (SDE)";
    const targetCompanies = onboarding.targetCompanies || onboarding.target_companies || "Tier 1 Product Companies, High-Growth Tech Startups";
    const primaryLanguage = onboarding.primaryLanguage || onboarding.primary_language || "C++ / Java / Python";
    const dailyTime = onboarding.dailyTime || onboarding.daily_time || "2-3 hours/day";
    const skillLevel = onboarding.skillLevel || onboarding.skill_level || "5";
    const shortTermGoal = onboarding.shortTermGoal || onboarding.short_term_goal || "Crack technical placement interviews";
    const weakTopics = Array.isArray(onboarding.weakTopics) ? onboarding.weakTopics.join(", ") : (onboarding.weakTopics || "None specified");

    const textSnippet = `Learner Placement Profile:
- Target Role: ${targetRole}
- Target Companies: ${targetCompanies}
- Primary Programming Language: ${primaryLanguage}
- Daily Study Commitment: ${dailyTime}
- Self-Assessed Skill Level: ${skillLevel}/10
- Immediate Placement Goal: ${shortTermGoal}
- Priority Focus & Weak Topics: ${weakTopics}`;

    return await this.storeUserEmbedding(userId, "profile-main", textSnippet);
  }

  /**
   * Returns count of indexed memory embeddings for a user
   */
  static async getEmbeddingCount(userId) {
    if (!userId) return 0;
    try {
      const rows = await prisma.$queryRawUnsafe(
        `SELECT COUNT(*)::int AS count FROM "user_embeddings" WHERE "user_id" = $1::uuid`,
        userId
      );
      return rows?.[0]?.count || 0;
    } catch {
      return 0;
    }
  }
}

export default EmbeddingService;
