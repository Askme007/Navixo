// backend/src/middleware/auth.middleware.ts
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const token = authHeader.replace("Bearer ", "").trim();

  try {
    // Ensure SUPABASE_JWT_SECRET is in your backend/.env
    const secret = process.env.SUPABASE_JWT_SECRET;

    if (!secret) {
      console.error("Missing SUPABASE_JWT_SECRET in environment variables.");
      return res.status(500).json({ error: "Server configuration error" });
    }

    // Cryptographically verify the token
    const decoded = jwt.verify(token, secret) as any;

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (err) {
    console.error("JWT Verification Error:", err);
    return res.status(401).json({ error: "Unauthorized or invalid token" });
  }
};
