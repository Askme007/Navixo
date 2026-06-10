import express from "express";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
import { generateToken } from "../lib/jwt.js";
import { supabase } from "../supabaseClient.js";
const router = express.Router();

/*
REGISTER
*/
router.post("/register", async (req, res) => {
  console.log("BODY =", req.body);

  try {
    const { name, email, password } = req.body;

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return res.status(400).json({
        error: "Email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    const { error: profileError } = await supabase
    .from("profiles")
    .insert({
        id: user.id,
        user_id: user.id,
        full_name: user.name,
        onboarding_completed: false,
    });

    if (profileError) {
    console.error("Profile creation failed:", profileError);
    }

    const token = generateToken(user);

    res.json({
    token,
    user: {
        id: user.id,
        name: user.name,
        email: user.email,
        provider: user.provider,
    },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Registration failed",
    });
  }
});

/*
LOGIN
*/
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    const valid = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!valid) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    const token = generateToken(user);

    res.json({
  token,
  user: {
    id: user.id,
    name: user.name,
    email: user.email,
    provider: user.provider,
  },
});
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Login failed",
    });
  }
});

export default router;