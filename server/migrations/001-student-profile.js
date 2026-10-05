import pool from "../db.js";

// Additive and rerunnable. Existing signup details and phone numbers are retained.
// MySQL DDL commits independently, so each column is checked before it is added.
const columns = {
  headline: "VARCHAR(160) NOT NULL DEFAULT ''",
  location: "VARCHAR(120) NOT NULL DEFAULT ''",
  availability: "VARCHAR(160) NOT NULL DEFAULT ''",
  bio: "TEXT NULL",
  skills: "VARCHAR(1000) NOT NULL DEFAULT ''",
  projects_json: "JSON NULL",
  profile_version: "INT UNSIGNED NOT NULL DEFAULT 0",
};

try {
  const [tables] = await pool.execute(
    "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'student_profiles'",
  );
  if (!tables.length)
    throw new Error(
      "student_profiles is missing. Create the signup tables first.",
    );
  for (const [name, definition] of Object.entries(columns)) {
    const [existing] = await pool.execute(
      "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'student_profiles' AND COLUMN_NAME = ?",
      [name],
    );
    if (!existing.length) {
      // Identifiers and definitions come only from the fixed list above.
      await pool.query(
        `ALTER TABLE student_profiles ADD COLUMN ${name} ${definition}`,
      );
      console.log(`Added ${name}`);
    } else {
      console.log(`Already present: ${name}`);
    }
  }
  console.log("Student profile migration complete.");
} catch (error) {
  console.error("Profile migration failed:", error.code || error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
