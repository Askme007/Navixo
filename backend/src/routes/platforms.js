import express from "express";
import prisma from "../lib/prisma.js";
import authenticate from "../middleware/auth.js";
import { LeetcodeService } from "../services/platform/leetcode.service.js";
import { CodeforcesService, sanitizeCfUrl } from "../services/platform/codeforces.service.js";

const router = express.Router();

/* ---------------- Public Image Proxy for Codeforces Avatars ---------------- */
router.get("/codeforces/avatar-proxy", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url || typeof url !== "string") {
      return res.status(400).send("URL parameter is required");
    }

    const cleanUrl = sanitizeCfUrl(url);
    if (
      !cleanUrl ||
      (!cleanUrl.includes("codeforces.com") && !cleanUrl.includes("codeforces.org"))
    ) {
      return res.status(400).send("Invalid avatar source domain");
    }

    const upstream = await fetch(cleanUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "image/*,*/*;q=0.8",
      },
    });

    if (!upstream.ok) {
      return res.status(upstream.status).send("Upstream image unavailable");
    }

    const contentType = upstream.headers.get("content-type") || "image/jpeg";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400");

    const arrayBuffer = await upstream.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error("Avatar proxy error:", error);
    return res.status(500).send("Failed to proxy image");
  }
});

// Apply authentication middleware globally to all platform routes
router.use(authenticate);

/* ==========================================================================
   LEETCODE ROUTES
   ========================================================================== */

/* ---------------- GET LeetCode Profile ---------------- */
router.get("/leetcode", async (req, res) => {
  try {
    const profile = await prisma.leetcodeProfile.findUnique({
      where: {
        userId: req.user.id,
      },
    });

    res.json(
      JSON.parse(
        JSON.stringify(profile, (_, value) =>
          typeof value === "bigint" ? Number(value) : value
        )
      )
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch LeetCode profile" });
  }
});

/* ---------------- POST LeetCode Sync ---------------- */
router.post("/leetcode/sync", async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.json({ success: false, error: "Username is required" });
    }

    const profile = await LeetcodeService.syncProfile(req.user.id, username);

    res.json({
      success: true,
      ...JSON.parse(
        JSON.stringify(profile, (_, value) =>
          typeof value === "bigint" ? Number(value) : value
        )
      ),
    });
  } catch (err) {
    console.warn("LeetCode sync notice:", err.message);
    res.json({ success: false, error: err.message || "Failed to sync LeetCode profile" });
  }
});


/* ==========================================================================
   CODEFORCES ROUTES
   ========================================================================== */

/* ---------------- GET Codeforces Profile ---------------- */
// Supports both initial load layout variations: /codeforces OR /codeforces/profile
router.get(["/codeforces", "/codeforces/profile"], async (req, res) => {
  try {
    const profile = await CodeforcesService.getProfile(req.user.id);
    return res.json(profile || null);
  } catch (error) {
    console.warn("Failed to retrieve Codeforces data:", error.message);
    return res.json(null);
  }
});

/* ---------------- POST Codeforces Sync/Connect ---------------- */
// Supports both action submission variants: /codeforces OR /codeforces/sync
router.post(["/codeforces", "/codeforces/sync"], async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.json({ success: false, error: "Codeforces handle is required" });
    }

    // Delegate execution to our robust service layer
    const profile = await CodeforcesService.syncProfile(req.user.id, username);

    return res.json({ success: true, ...profile });
  } catch (err) {
    console.warn("Codeforces sync notice:", err.message);
    return res.json({ success: false, error: err.message || "Failed to sync Codeforces profile" });
  }
});

export default router;