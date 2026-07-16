import { randomBytes, randomUUID } from 'crypto';
import { hashPassword } from 'better-auth/crypto';
import { db } from '../lib/db';
import { user, account } from '../lib/schema';

// Direct insert rather than the Better Auth `admin` plugin: that plugin
// requires banned/banReason/banExpires columns on `user` that this schema
// doesn't have. Using Better Auth's own `hashPassword` keeps the credential
// compatible with normal email/password sign-in without touching lib/auth.ts
// or the DB schema.

const email = 'hairbynoella123@outlook.com';
const name = 'Noella';
const password = randomBytes(16).toString('base64url');

async function createAdmin() {
  const hashed = await hashPassword(password);
  const now = new Date();
  const userId = randomUUID();

  await db.insert(user).values({
    id: userId,
    name,
    email,
    emailVerified: true,
    role: 'admin',
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(account).values({
    id: randomUUID(),
    accountId: userId,
    providerId: 'credential',
    userId,
    password: hashed,
    createdAt: now,
    updatedAt: now,
  });

  console.log('Created admin user:', email);
  console.log('Password (save this now, it will not be shown again):', password);
}

createAdmin()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error creating admin user:', err);
    process.exit(1);
  });
