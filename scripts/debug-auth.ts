
import { db } from "../lib/db";
import { user, session, account } from "../lib/schema";

async function main() {
    console.log("Checking Users...");
    const users = await db.select().from(user);
    console.log("Users found:", users.length);
    console.log(JSON.stringify(users, null, 2));

    console.log("\nChecking Sessions...");
    const sessions = await db.select().from(session);
    console.log("Sessions found:", sessions.length);
    console.log(JSON.stringify(sessions, null, 2));

    console.log("\nChecking Accounts...");
    const accounts = await db.select().from(account);
    console.log("Accounts found:", accounts.length);
    console.log(JSON.stringify(accounts, null, 2));
}

main().catch(console.error).finally(() => process.exit(0));
