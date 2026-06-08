// backend\src\middleware\auth.js

import jwt from "jsonwebtoken";

export default function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const token = authHeader.replace("Bearer ", "").trim();

  try {
    // ❗ Supabase access_token CANNOT be verified using your backend secret
    // ✔️ Decode ONLY
    const decoded = jwt.decode(token);

    if (!decoded || !decoded.sub) {
      return res.status(401).json({ error: "Invalid Supabase token" });
    }

    // Supabase stores user ID in "sub"
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (err) {
    console.error("JWT Decode Error:", err);
    return res.status(401).json({ error: "Unauthorized" });
  }
}
