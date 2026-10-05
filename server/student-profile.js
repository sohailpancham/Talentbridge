import { Router } from "express";
import { z } from "zod";

const text = (max) => z.string().trim().max(max);
const projectSchema = z
  .object({
    id: z.string().uuid(),
    title: text(120).min(1),
    description: text(2000).min(1),
    link: text(2048).refine((value) => {
      if (!value) return true;
      try {
        const url = new URL(value);
        return (
          ["http:", "https:"].includes(url.protocol) &&
          !url.username &&
          !url.password
        );
      } catch {
        return false;
      }
    }, "Use an http:// or https:// project URL without embedded credentials."),
  })
  .strict();

export const profileSchema = z
  .object({
    version: z.number().int().min(0).max(2147483646),
    profile: z
      .object({
        name: text(120).min(2),
        headline: text(160),
        college: text(200).min(2),
        course: text(120).min(2),
        year: z.enum(["1", "2", "3", "4", "5+"]),
        location: text(120),
        availability: text(160),
        bio: text(4000),
        skills: text(1000),
      })
      .strict(),
    projects: z
      .array(projectSchema)
      .max(10)
      .refine(
        (projects) =>
          new Set(projects.map((project) => project.id)).size ===
          projects.length,
        "Project IDs must be unique.",
      ),
  })
  .strict();

const profileSelect = `SELECT u.id, u.full_name, u.role, p.college, p.course,
  p.study_year, p.headline, p.location, p.availability, p.bio, p.skills,
  p.projects_json, p.profile_version
  FROM users u JOIN student_profiles p ON p.user_id = u.id
  WHERE u.id = ?`;

function serialize(row) {
  const projects =
    typeof row.projects_json === "string"
      ? JSON.parse(row.projects_json)
      : row.projects_json;
  return {
    userId: row.id,
    version: row.profile_version,
    profile: {
      name: row.full_name,
      headline: row.headline,
      college: row.college,
      course: row.course,
      year: row.study_year,
      location: row.location,
      availability: row.availability,
      bio: row.bio ?? "",
      skills: row.skills,
    },
    projects: projects ?? [],
  };
}

// The pool is supplied by index.js; tests can supply a separate test pool.
export default function createStudentProfileRouter(pool) {
  const router = Router();

  router.use((request, response, next) => {
    response.set("Cache-Control", "no-store");
    if (!request.session?.userId) {
      return response
        .status(401)
        .json({ message: "Your session expired. Please log in again." });
    }
    // This header is only a consistency check. The session chooses the owner.
    if (
      request.get("X-TalentBridge-Account") !== String(request.session.userId)
    ) {
      return response
        .status(409)
        .json({
          message: "Your signed-in account changed. Refresh this page.",
        });
    }
    if (
      request.method !== "GET" &&
      request.get("X-TalentBridge-Request") !== "1"
    ) {
      return response.status(403).json({ message: "Invalid request." });
    }
    next();
  });

  router.get("/profile", async (request, response, next) => {
    try {
      const [rows] = await pool.execute(profileSelect, [
        request.session.userId,
      ]);
      if (!rows[0] || rows[0].role !== "student") {
        return response
          .status(403)
          .json({ message: "A student account with a profile is required." });
      }
      response.json(serialize(rows[0]));
    } catch (error) {
      next(error);
    }
  });

  router.put("/profile", async (request, response, next) => {
    if (!request.is("application/json")) {
      return response
        .status(415)
        .json({ message: "Send profile data as JSON." });
    }
    const validation = profileSchema.safeParse(request.body);
    if (!validation.success) {
      const issue = validation.error.issues[0];
      return response.status(400).json({
        message: `${issue.path.join(".") || "Profile"}: ${issue.message}`,
      });
    }
    const { profile, projects, version } = validation.data;
    let connection;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();
      const [rows] = await connection.execute(`${profileSelect} FOR UPDATE`, [
        request.session.userId,
      ]);
      if (!rows[0] || rows[0].role !== "student") {
        await connection.rollback();
        return response
          .status(403)
          .json({ message: "A student account with a profile is required." });
      }
      if (rows[0].profile_version !== version) {
        await connection.rollback();
        return response.status(409).json({
          message:
            "Your profile changed in another tab or device. Copy any edits you want to keep, then load the latest saved profile.",
        });
      }
      await connection.execute(
        `UPDATE student_profiles SET college = ?, course = ?, study_year = ?,
         headline = ?, location = ?, availability = ?, bio = ?, skills = ?,
         projects_json = ?, profile_version = profile_version + 1 WHERE user_id = ?`,
        [
          profile.college,
          profile.course,
          profile.year,
          profile.headline,
          profile.location,
          profile.availability,
          profile.bio,
          profile.skills,
          JSON.stringify(projects),
          request.session.userId,
        ],
      );
      await connection.execute("UPDATE users SET full_name = ? WHERE id = ?", [
        profile.name,
        request.session.userId,
      ]);
      await connection.commit();
      response.json({
        userId: request.session.userId,
        version: version + 1,
        profile,
        projects,
      });
    } catch (error) {
      if (connection) await connection.rollback().catch(() => {});
      next(error);
    } finally {
      connection?.release();
    }
  });
  return router;
}
