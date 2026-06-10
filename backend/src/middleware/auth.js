import { verifyToken } from "../lib/jwt.js";

export default function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Missing Authorization header",
    });
  }

  try {
    const token = authHeader.split(" ")[1];

    const decoded = verifyToken(token);

    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({
      error: "Invalid token",
    });
  }
}