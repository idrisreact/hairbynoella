import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./schema";

const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:3000";

export const auth = betterAuth({
    baseURL,
    emailAndPassword: {
        enabled: true,
        // Auth is admin-only: customers book as guests, so public
        // registration is closed. Admin accounts are created manually.
        disableSignUp: true,
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "user",
                input: false,
            },
        },
    },
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            ...schema,
            user: schema.user,
            session: schema.session,
            account: schema.account,
            verification: schema.verification,
        }
    }),
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            // Existing admins sign in with Google; new Google accounts
            // must not be auto-created now that registration is closed.
            disableSignUp: true,
        },
    },
    trustedOrigins: [baseURL],
    advanced: {
        cookiePrefix: "better-auth",
        // Secure cookies require HTTPS, so key off the deployment URL:
        // false on http://localhost:3000, true in production.
        useSecureCookies: baseURL.startsWith("https://"),
    },
});
