// Contract tests use an in-memory database double; they do not connect to MySQL.
import assert from "node:assert/strict";
import express from "express";
import createRouter, { profileSchema } from "../student-profile.js";
const original = {
  id: 11,
  full_name: "Student A",
  role: "student",
  college: "Goa College",
  course: "BCA",
  study_year: "3",
  headline: "",
  location: "",
  availability: "",
  bio: null,
  skills: "React",
  projects_json: null,
  profile_version: 0,
};
const data = {
  version: 0,
  profile: {
    name: "Updated Student",
    college: "Goa College",
    course: "BCA",
    year: "3",
    headline: "Developer",
    location: "Goa",
    availability: "10 hours",
    bio: "Hello",
    skills: "React, CSS",
  },
  projects: [
    {
      id: "dc6e9923-8b80-4b55-8a27-b054f6f1a39d",
      title: "Site",
      description: "Built a website",
      link: "https://example.com",
    },
  ],
};
let rows = {
    11: structuredClone(original),
    22: { ...original, id: 22, full_name: "Student B" },
  },
  failName = false,
  queries = 0;
const pool = {
  async execute(sql, args) {
    queries++;
    return [[rows[args[0]]].filter(Boolean)];
  },
  async getConnection() {
    let snapshot;
    return {
      async beginTransaction() {
        snapshot = structuredClone(rows);
      },
      async execute(sql, args) {
        if (sql.startsWith("SELECT")) return [[rows[args[0]]].filter(Boolean)];
        if (sql.startsWith("UPDATE student_profiles")) {
          const [
            college,
            course,
            study_year,
            headline,
            location,
            availability,
            bio,
            skills,
            projects_json,
            id,
          ] = args;
          Object.assign(rows[id], {
            college,
            course,
            study_year,
            headline,
            location,
            availability,
            bio,
            skills,
            projects_json,
          });
          rows[id].profile_version++;
          return [{ affectedRows: 1 }];
        }
        if (sql.startsWith("UPDATE users")) {
          if (failName) throw Error("simulated database failure");
          rows[args[1]].full_name = args[0];
          return [{ affectedRows: 1 }];
        }
        throw Error(sql);
      },
      async commit() {},
      async rollback() {
        rows = snapshot;
      },
      release() {},
    };
  },
};
const app = express();
app.use(express.json({ limit: "128kb" }));
// Test-only session injection: production uses express-session from index.js.
app.use((req, res, next) => {
  req.session = req.get("Test-Session")
    ? { userId: Number(req.get("Test-Session")) }
    : {};
  next();
});
app.use("/api/student", createRouter(pool));
app.use((e, req, res, next) =>
  res.status(500).json({ message: "Database failure" }),
);
const server = app.listen(0, "127.0.0.1");
await new Promise((resolve) => server.once("listening", resolve));
const baseUrl = `http://127.0.0.1:${server.address().port}`;
const api = (method, session = 11, account = session) => {
  const headers = {};
  let body;
  if (session) headers["Test-Session"] = String(session);
  if (account) headers["X-TalentBridge-Account"] = String(account);
  return {
    set(key, value) {
      headers[key] = value;
      return this;
    },
    send(value) {
      body = JSON.stringify(value);
      headers["Content-Type"] = "application/json";
      return this;
    },
    async expect(status) {
      const response = await fetch(`${baseUrl}/api/student/profile`, {
        method: method.toUpperCase(),
        headers,
        body,
      });
      const result = await response.json();
      assert.equal(response.status, status, JSON.stringify(result));
      return { body: result, headers: Object.fromEntries(response.headers) };
    },
  };
};
(async () => {
  await api("get", null).expect(401);
  assert.equal(queries, 0);
  await api("get", 11, 22).expect(409);
  assert.equal(queries, 0);
  let res = await api("get").expect(200);
  assert.equal(res.body.profile.bio, "");
  assert.deepEqual(res.body.projects, []);
  assert.equal(res.body.profile.year, "3");
  assert.equal(res.headers["cache-control"], "no-store");
  res = await api("get", 22).expect(200);
  assert.equal(res.body.profile.name, "Student B");
  rows[22].role = "company";
  await api("get", 22).expect(403);
  rows[22].role = "student";
  await api("put").send(data).expect(403);
  await api("put")
    .set("X-TalentBridge-Request", "1")
    .send({ ...data, userId: 22 })
    .expect(400);
  await api("put")
    .set("X-TalentBridge-Request", "1")
    .send({ ...data, profile: { ...data.profile, year: "Third year" } })
    .expect(400);
  assert.equal(
    profileSchema.safeParse({
      ...data,
      projects: [{ ...data.projects[0], link: "javascript:alert(1)" }],
    }).success,
    false,
  );
  assert.equal(
    profileSchema.safeParse({
      ...data,
      projects: [data.projects[0], data.projects[0]],
    }).success,
    false,
  );
  assert.equal(
    profileSchema.safeParse({
      ...data,
      profile: { ...data.profile, bio: "x".repeat(4001) },
    }).success,
    false,
  );
  res = await api("put")
    .set("X-TalentBridge-Request", "1")
    .send(data)
    .expect(200);
  assert.equal(res.body.version, 1);
  assert.equal(rows[11].full_name, "Updated Student");
  assert.equal(rows[22].full_name, "Student B");
  await api("put").set("X-TalentBridge-Request", "1").send(data).expect(409);
  assert.equal(rows[11].profile_version, 1);
  const before = structuredClone(rows);
  failName = true;
  await api("put")
    .set("X-TalentBridge-Request", "1")
    .send({ ...data, version: 1 })
    .expect(500);
  assert.deepEqual(rows, before);
  console.log(
    "PASS API session/owner/role checks, schema and URL validation, account isolation, version conflict, transactional rollback",
  );
})()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => server.close());
