import { db } from '../lib/db';
import { user } from '../lib/schema';
import { eq } from 'drizzle-orm';

async function makeAdmin() {
  try {
    const email = 'idrist2013@gmail.com';

    console.log(`Updating user ${email} to admin...`);

    const result = await db
      .update(user)
      .set({ role: 'admin' })
      .where(eq(user.email, email))
      .returning();

    if (result.length === 0) {
      console.error(`User with email ${email} not found`);
      process.exit(1);
    }

    console.log('✓ User updated successfully:', result[0]);
    console.log(`✓ ${email} is now an admin`);

    process.exit(0);
  } catch (error) {
    console.error('Error updating user:', error);
    process.exit(1);
  }
}

makeAdmin();
