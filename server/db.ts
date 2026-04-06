import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "../drizzle/schema";
import dotenv from "dotenv";

dotenv.config();

const connection = await mysql.createConnection({
  uri: process.env.DATABASE_URL!,
});

export const db = drizzle(connection, { schema });
