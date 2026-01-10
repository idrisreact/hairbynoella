import { db } from "../lib/db";
import { sql } from "drizzle-orm";

async function main() {
    try {
        console.log("Testing database connection...");
        const result = await db.execute(sql`SELECT NOW()`);
        console.log("Database connected:", result.rows[0]);

        console.log("Checking for auth tables...");
        const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('user', 'session', 'account', 'verification');
    `);

        console.log("Found tables:", tables.rows.map(r => r.table_name));

        if (tables.rows.length !== 4) {
            console.error("MISSING TABLES! Found:", tables.rows.length, "/ 4");
        } else {
            console.log("All auth tables present.");
        }
    } catch (error) {
        console.error("Database Error:", error);
    }
    process.exit(0);
}

main();
