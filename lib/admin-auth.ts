import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

type Session = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

function isAdmin(session: Session | null): session is Session {
    if (!session) return false;
    return (session.user as { role?: string | null }).role === "admin";
}

/**
 * Primitive: returns the session if the caller is a signed-in admin, else null.
 * Use inside server actions, which should return a result object rather than throw.
 */
export async function getAdminSession(): Promise<Session | null> {
    const session = await auth.api.getSession({ headers: await headers() });
    return isAdmin(session) ? session : null;
}

/**
 * For layouts/pages: redirects non-admins away and returns the session otherwise.
 */
export async function requireAdminPage(): Promise<Session> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!isAdmin(session)) redirect("/");
    return session;
}

/**
 * For API routes: discriminated result carrying a ready-to-return 401/403 response.
 */
export async function requireAdminApi(): Promise<
    { ok: true; session: Session } | { ok: false; response: NextResponse }
> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        return {
            ok: false,
            response: NextResponse.json({ error: "Authentication required" }, { status: 401 }),
        };
    }
    if (!isAdmin(session)) {
        return {
            ok: false,
            response: NextResponse.json({ error: "Admin access required" }, { status: 403 }),
        };
    }
    return { ok: true, session };
}
