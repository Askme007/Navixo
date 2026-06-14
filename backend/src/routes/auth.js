import express from "express";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
import { generateToken } from "../lib/jwt.js";
import jwt from 'jsonwebtoken';
const router = express.Router();

/* ==========================
   REGISTER
========================== */

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "All fields are required",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
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

    const token = generateToken(user);

    return res.json({
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

    return res.status(500).json({
      error: "Registration failed",
    });
  }
});

/* ==========================
   LOGIN
========================== */

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!validPassword) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    const token = generateToken(user);

    return res.json({
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

    return res.status(500).json({
      error: "Login failed",
    });
  }
});

// POST /api/auth/google
router.post('/google', async (req, res) => {
  try {
    const { accessToken } = req.body;

    // 1. Ask Google to verify the token and return the user's profile
    const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    if (!googleRes.ok) {
      return res.status(401).json({ error: 'Failed to verify Google token' });
    }

    const googleUser = await googleRes.json();
    const email = googleUser.email;

    // 2. Find the user in your database, or create them if they are new
    let user = await prisma.profiles.findUnique({
      where: { email: email }
    });

    if (!user) {
      user = await prisma.profiles.create({
        data: {
          email: email,
          // Add default fields if required by your database schema
        }
      });
    }

    // 3. Issue your custom Navixo JWT
    const token = jwt.sign(
      { id: user.id, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({ success: true, token, user });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ error: 'Internal Server Error during Google Auth' });
  }
});

export default router;