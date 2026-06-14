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
    console.log("TOKEN RECEIVED =", token.substring(0, 40));

    const decoded = verifyToken(token);

    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  } catch (err) {
    console.log("AUTH FAILED");
    console.log("FULL TOKEN =", token);
    console.log(err);

    return res.status(401).json({
      error: "Invalid token",
    });
  }
}