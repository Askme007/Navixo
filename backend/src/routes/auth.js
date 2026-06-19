import express from "express";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
import { generateToken } from "../lib/jwt.js";
const router = express.Router();

/* ==========================
   REGISTER
========================== */

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // INTERACTIVE TRANSACTION: Creates User, waits for ID, then creates Profile
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { name, email, passwordHash },
      });

      await tx.profiles.create({
        data: {
          id: newUser.id, // Successfully linking the exact ID
          email: newUser.email,
          full_name: newUser.name,
          onboarding_completed: false,
        },
      });

      return newUser;
    });

    const token = generateToken(user);

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Registration Error:", err);
    return res.status(500).json({ error: "Registration failed" });
  }
});

/* ==========================
   LOGIN
========================== */

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) return res.status(401).json({ error: "Invalid credentials" });

    const token = generateToken(user);

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Login failed" });
  }
});

/* ==========================
   GOOGLE AUTH
========================== */

router.post('/google', async (req, res) => {
  try {
    const { accessToken } = req.body;
    const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    if (!googleRes.ok) return res.status(401).json({ error: 'Failed to verify Google token' });

    const googleUser = await googleRes.json();
    const email = googleUser.email;
    const name = googleUser.name;

    // INTERACTIVE TRANSACTION: Return BOTH the user and the profile
    const { user, profile } = await prisma.$transaction(async (tx) => {
      let existingUser = await tx.user.findUnique({ where: { email } });
      let existingProfile = await tx.profiles.findUnique({ where: { email } });

      // 1. Core User Creation
      if (!existingUser) {
        existingUser = await tx.user.create({
          data: { email, name, passwordHash: "" }
        });
      }

      // 2. Profile Creation / Healing
      if (!existingProfile) {
        existingProfile = await tx.profiles.create({
          data: {
            id: existingUser.id,
            email,
            full_name: name,
            onboarding_completed: false
          }
        });
      } else if (existingProfile.id !== existingUser.id) {
        await tx.profiles.delete({ where: { email } });
        existingProfile = await tx.profiles.create({
          data: {
            id: existingUser.id,
            email,
            full_name: name,
            onboarding_completed: false
          }
        });
      }

      // 📍 RETURN BOTH OBJECTS OUT OF THE TRANSACTION
      return { user: existingUser, profile: existingProfile };
    });

    const token = generateToken(user);

    // 📍 SEND THE COMPLETE DATA TO THE FRONTEND
    res.json({ 
      success: true, 
      token, 
      user: {
        id: user.id,
        email: user.email,
        name: profile.full_name || user.name, 
        onboardingCompleted: profile.onboarding_completed // This triggers the frontend redirect!
      } 
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ error: 'Internal Server Error during Google Auth' });
  }
});

export default router;