import { db } from '../lib/db';
import { bookings, availabilitySlots } from '../lib/schema';

async function resetBookings() {
  // bookings.slot_id has an FK to availability_slots.id (ON DELETE no action),
  // so bookings must be deleted first or the slot deletes will violate the FK.
  const deletedBookings = await db.delete(bookings).returning({ id: bookings.id });
  const deletedSlots = await db.delete(availabilitySlots).returning({ id: availabilitySlots.id });

  console.log(`Deleted ${deletedBookings.length} booking(s)`);
  console.log(`Deleted ${deletedSlots.length} availability slot(s)`);
}

resetBookings()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error resetting bookings/availability:', err);
    process.exit(1);
  });
