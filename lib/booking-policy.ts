/**
 * Customer self-service cancellation policy.
 *
 * Customers may cancel their own booking up to SELF_CANCEL_CUTOFF_HOURS
 * before the appointment; closer than that they must contact the salon.
 * The deposit is auto-refunded only when cancelling at least
 * AUTO_REFUND_CUTOFF_HOURS ahead — between the two cutoffs the slot is
 * freed but the deposit is kept.
 */
export const SELF_CANCEL_CUTOFF_HOURS = 24;
export const AUTO_REFUND_CUTOFF_HOURS = 48;

/**
 * Unguessable URL-safe token used as the manage-booking credential.
 * Web Crypto (not node:crypto) so this module stays importable from
 * client components that need the policy constants.
 */
export function generateManageToken(): string {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function hoursUntil(appointment: Date, now: Date = new Date()): number {
    return (appointment.getTime() - now.getTime()) / 3_600_000;
}
