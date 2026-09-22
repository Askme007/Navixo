import { verifyToken } from "../lib/jwt.js";

export default function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Missing Authorization header",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);

    req.user = {
      id: decoded.id || decoded.userId || decoded.sub,
      email: decoded.email,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      error: "Invalid token",
    });
  }
}

export function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    req.user = {
      id: decoded.id || decoded.userId || decoded.sub,
      email: decoded.email,
    };
  } catch {
    req.user = null;
  }

  next();
}
