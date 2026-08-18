import { randomBytes } from 'crypto';
import { hashPassword } from 'better-auth/crypto';
import { eq, and } from 'drizzle-orm';
import { db } from '../lib/db';
import { user, account, session } from '../lib/schema';

// Admin password reset. There is no self-serve forgot-password flow (auth is
// admin-only and public sign-up is disabled), so a lost admin password is
// recovered here. Mirrors scripts/create-admin.ts: Better Auth's own
// `hashPassword` keeps the credential compatible with normal sign-in.
//
// Usage:
//   npx tsx --env-file=.env scripts/reset-admin-password.ts <username-or-email> [new-password]
//
// Omit the password to have a strong one generated and printed.

async function main() {
  const identifier = process.argv[2];
  if (!identifier) {
    console.error(
      'Usage: npx tsx --env-file=.env scripts/reset-admin-password.ts <username-or-email> [new-password]'
    );
    process.exit(1);
  }

  const newPassword = process.argv[3] || randomBytes(12).toString('base64url');
  if (newPassword.length < 8) {
    console.error('Password must be at least 8 characters.');
    process.exit(1);
  }

  const needle = identifier.toLowerCase();
  const users = await db.select().from(user);
  const target = users.find(
    (u) =>
      u.email?.toLowerCase() === needle ||
      (u as { username?: string | null }).username?.toLowerCase() === needle
  );

  if (!target) {
    console.error(`No user found matching "${identifier}".`);
    process.exit(1);
  }

  const hashed = await hashPassword(newPassword);
  const now = new Date();

  const updated = await db
    .update(account)
    .set({ password: hashed, updatedAt: now })
    .where(and(eq(account.userId, target.id), eq(account.providerId, 'credential')))
    .returning({ id: account.id });

  if (updated.length === 0) {
    // Google sign-in was removed, so a user with no credential account can
    // never sign in until one exists. Create it rather than fail.
    const { randomUUID } = await import('crypto');
    await db.insert(account).values({
      id: randomUUID(),
      accountId: target.id,
      providerId: 'credential',
      userId: target.id,
      password: hashed,
      createdAt: now,
      updatedAt: now,
    });
    console.log('No credential account existed — created one.');
  }

  // Any session opened with the old password is revoked, so a stolen or
  // shared login cannot outlive the reset.
  const killed = await db
    .delete(session)
    .where(eq(session.userId, target.id))
    .returning({ id: session.id });

  console.log('Password reset for:');
  console.log('  name:     ', target.name);
  console.log('  email:    ', target.email);
  console.log('  username: ', (target as { username?: string | null }).username ?? '(none)');
  console.log('  role:     ', target.role);
  console.log('  sessions revoked:', killed.length);
  console.log('');
  console.log('  NEW PASSWORD:', newPassword);
  console.log('');
  console.log('Send this over a secure channel and have her change it after signing in.');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error resetting password:', err);
    process.exit(1);
  });
