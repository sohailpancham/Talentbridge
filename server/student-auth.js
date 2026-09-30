import { Router } from "express";
import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import pool from "./db.js";

const router = Router();
const scryptAsync = promisify(scrypt);

const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many signup attempts. Please try again in 15 minutes.",
  },
});

const signupSchema = z
  .object({
    fullName: z.string().trim().min(2).max(120),
    email: z.string().trim().toLowerCase().email().max(254),
    phone: z
      .string()
      .trim()
      .regex(/^$|^[0-9]{10}$/, "Enter a 10-digit mobile number.")
      .optional(),
    college: z.string().trim().min(2).max(200),
    course: z.string().trim().min(2).max(120),
    year: z.enum(["1", "2", "3", "4", "5+"]),
    password: z
      .string()
      .min(12, "Use at least 12 characters for your password.")
      .max(128, "Use no more than 128 characters for your password."),
    confirmPassword: z.string().max(128),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Your passwords do not match.",
    path: ["confirmPassword"],
  });

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");

  const derivedKey = await scryptAsync(password, salt, 64, {
    N: 131072,
    r: 8,
    p: 1,
    maxmem: 256 * 1024 * 1024,
  });

  return [
    "scrypt",
    "131072",
    "8",
    "1",
    salt,
    derivedKey.toString("hex"),
  ].join("$");
}

router.post("/student/signup", signupLimiter, async (request, response) => {
  if (!request.is("application/json")) {
    return response.status(415).json({
      message: "Send the signup details as JSON.",
    });
  }

  const validation = signupSchema.safeParse(request.body);

  if (!validation.success) {
    return response.status(400).json({
      message: validation.error.issues[0].message,
      field: validation.error.issues[0].path[0],
    });
  }

  const data = validation.data;
  let connection;

  try {
    const passwordHash = await hashPassword(data.password);

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [result] = await connection.execute(
      `INSERT INTO users (
        full_name,
        email,
        password_hash,
        role
      ) VALUES (?, ?, ?, ?)`,
      [
        data.fullName,
        data.email,
        passwordHash,
        "student",
      ]
    );

    await connection.execute(
      `INSERT INTO student_profiles (
        user_id,
        phone,
        college,
        course,
        study_year
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        result.insertId,
        data.phone || null,
        data.college,
        data.course,
        data.year,
      ]
    );

    await connection.commit();

    return response.status(201).json({
      message: "Student account created successfully.",
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Signup rollback failed:", rollbackError.code);
      }
    }

    if (error.code === "ER_DUP_ENTRY") {
      return response.status(409).json({
        message: "An account already exists with this email.",
      });
    }

    console.error("Student signup failed:", error.code || error.name);

    return response.status(500).json({
      message: "Unable to create your account. Please try again.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

export default router;