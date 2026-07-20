import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";
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
    // Admins sign in with a username + password only. Google sign-in was
    // removed deliberately: the google-only admin account
    // (hairbynoella88@gmail.com) is superseded by the credential account
    // that owns the "noella" username.
    plugins: [username()],
    trustedOrigins: [baseURL],
    advanced: {
        cookiePrefix: "better-auth",
        // Secure cookies require HTTPS, so key off the deployment URL:
        // false on http://localhost:3000, true in production.
        useSecureCookies: baseURL.startsWith("https://"),
    },
});
