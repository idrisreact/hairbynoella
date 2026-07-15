import { defineConfig } from "drizzle-kit";
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
    dialect: "postgresql",
    schema: "./lib/schema.ts",
    out: "./drizzle",
    dbCredentials: {
        url: process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL!,
    },
});
