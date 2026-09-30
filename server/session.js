import "dotenv/config";
import session from "express-session";
import createMySQLStore from "express-mysql-session";
import pool from "./db.js";

if (!process.env.SESSION_SECRET ||
    process.env.SESSION_SECRET.length < 32) {
  throw new Error("Add a valid SESSION_SECRET to server/.env.");
}

const MySQLStore = createMySQLStore(session);

const sessionStore = new MySQLStore(
  {
    createDatabaseTable: true,
    expiration: 24 * 60 * 60 * 1000,
    endConnectionOnClose: false,
  },
  pool
);

await sessionStore.onReady();

export const sessionCookieName = "talentbridge.sid";

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

export default session({
  name: sessionCookieName,
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    ...sessionCookieOptions,
    maxAge: 24 * 60 * 60 * 1000,
  },
});