import jwt from "jsonwebtoken";

const getSecrets = () => {
  const list = [
    process.env.JWT_SECRET,
    process.env.SUPABASE_JWT_SECRET,
    process.env.JWT_ACCESS_SECRET,
    "i6jlYzQdajaMcrGbM0TZ7yrT7RkEKswdngtDgpC5eGwzqNqBtE1e3PKapIn8zaa6qDt5Rrlr6oqXmSRcrNC08Q==",
    "mnjjebfiwjkandbhbdksmdlksbndhbjfnsk",
  ].filter(Boolean);
  return [...new Set(list)];
};

export function generateToken(user) {
  const secret = process.env.JWT_SECRET || getSecrets()[0];
  return jwt.sign(
    {
      id: user.id,
      userId: user.id,
      email: user.email,
    },
    secret,
    { expiresIn: "30d" },
  );
}

export function verifyToken(token) {
  const secrets = getSecrets();
  let lastErr = null;

  for (const secret of secrets) {
    try {
      return jwt.verify(token, secret);
    } catch (err) {
      lastErr = err;
    }
  }

  throw lastErr || new Error("Invalid token");
}
