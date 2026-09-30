import "dotenv/config";
import mysql from "mysql2/promise";

let connection;

try {
  connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectTimeout: 10000,
  });

  const [rows] = await connection.query(
    "SELECT DATABASE() AS databaseName"
  );

  console.log(`Database connected: ${rows[0].databaseName}`);
} catch (error) {
  console.error("Database connection failed:", error.code);
  process.exitCode = 1;
} finally {
  if (connection) {
    await connection.end();
  }
}