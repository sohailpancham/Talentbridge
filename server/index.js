import express from "express";
import helmet from "helmet";
import pool from "./db.js";
import studentAuthRouter from "./student-auth.js";
import sessionMiddleware from "./session.js";
import loginRouter from "./login.js";
import createStudentProfileRouter from "./student-profile.js";

const app = express();
const port = Number(process.env.PORT || 3001);

app.disable("x-powered-by");
app.use(helmet());
// Profile projects can be larger than an authentication request.
app.use(
  "/api/student",
  sessionMiddleware,
  express.json({ limit: "128kb" }),
  createStudentProfileRouter(pool),
);
app.use(express.json({ limit: "16kb" }));

app.use("/api/auth", sessionMiddleware);
app.use("/api/auth", studentAuthRouter);
app.use("/api/auth", loginRouter);

// Health route
app.get("/api/health", async (request, response) => {
  try {
    await pool.query("SELECT 1");

    response.json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    console.error("Database health check failed:", error.code);

    response.status(503).json({
      status: "error",
      message: "Database unavailable.",
    });
  }
});

// The error handler goes here, after the routes.
app.use((error, request, response, next) => {
  if (response.headersSent) {
    return next(error);
  }

  console.error("API request failed:", error.code || error.name);

  if (error.type === "entity.parse.failed") {
    return response.status(400).json({
      message: "Invalid JSON request.",
    });
  }

  if (error.type === "entity.too.large") {
    return response.status(413).json({
      message: "Request is too large.",
    });
  }

  response.status(500).json({
    message: "Something went wrong. Please try again.",
  });
});

// Start the server last.
app.listen(port, "127.0.0.1", () => {
  console.log(`TalentBridge API: http://127.0.0.1:${port}`);
});
