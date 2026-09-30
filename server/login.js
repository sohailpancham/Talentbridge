import { Router } from "express";
import { scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import pool from "./db.js";
import {
  sessionCookieName,
  sessionCookieOptions,
} from "./session.js";

const router = Router();
const scryptAsync = promisify(scrypt);

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(128),
  role: z.literal("student"),
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many login attempts. Try again in 15 minutes.",
  },
});

// Require a custom header on requests that change the session.
// Our frontend will send this header. Do not enable permissive CORS.
router.use((request, response, next) => {
  response.set("Cache-Control", "no-store");

  if (
    request.method !== "GET" &&
    request.get("X-TalentBridge-Request") !== "1"
  ) {
    return response.status(403).json({
      message: "Invalid request.",
    });
  }

  next();
});

async function verifyPassword(password, storedHash) {
  // Use the same hashing work even when an email is not registered.
  const fallback = [
    "scrypt",
    "131072",
    "8",
    "1",
    "0".repeat(32),
    "0".repeat(128),
  ].join("$");

  const parts = (storedHash || fallback).split("$");
  const [algorithm, cost, blockSize, parallelism, salt, hash] = parts;

  if (
    parts.length !== 6 ||
    algorithm !== "scrypt" ||
    cost !== "131072" ||
    blockSize !== "8" ||
    parallelism !== "1" ||
    !/^[a-f0-9]{32}$/.test(salt) ||
    !/^[a-f0-9]{128}$/.test(hash)
  ) {
    return false;
  }

  const actual = await scryptAsync(password, salt, 64, {
    N: 131072,
    r: 8,
    p: 1,
    maxmem: 256 * 1024 * 1024,
  });

  return timingSafeEqual(actual, Buffer.from(hash, "hex"));
}

router.post("/login", loginLimiter, async (request, response, next) => {
  const validation = loginSchema.safeParse(request.body);

  if (!validation.success) {
    return response.status(400).json({
      message: "Enter a valid email and password, and select Student.",
    });
  }

  const { email, password } = validation.data;

  try {
    const [rows] = await pool.execute(
      `SELECT id, full_name, email, password_hash, role
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [email]
    );

    const user = rows[0];
    const passwordMatches = await verifyPassword(
      password,
      user?.password_hash
    );

    if (!user || !passwordMatches || user.role !== "student") {
      return response.status(401).json({
        message: "Incorrect email or password.",
      });
    }

    await new Promise((resolve, reject) => {
      request.session.regenerate((error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    request.session.userId = user.id;

    await new Promise((resolve, reject) => {
      request.session.save((error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    return response.json({
      message: "Login successful.",
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/me", async (request, response, next) => {
  if (!request.session.userId) {
    return response.json({ user: null });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT id, full_name, email, role
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [request.session.userId]
    );

    const user = rows[0];

    return response.json({
      user: user
        ? {
            id: user.id,
            fullName: user.full_name,
            email: user.email,
            role: user.role,
          }
        : null,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", (request, response, next) => {
  request.session.destroy((error) => {
    if (error) return next(error);

    response.clearCookie(sessionCookieName, sessionCookieOptions);
    response.json({ message: "Logged out successfully." });
  });
});

export default router;