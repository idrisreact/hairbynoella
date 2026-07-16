import { Resend } from "resend";
import { formatPrice } from "./pricing";
import {
    AUTO_REFUND_CUTOFF_HOURS,
    SELF_CANCEL_CUTOFF_HOURS,
} from "./booking-policy";

/**
 * Booking emails, sent via Resend.
 *
 * Email is deliberately non-critical: a paid booking must never fail because
 * an email couldn't be sent, so every send here logs errors instead of
 * throwing. If RESEND_API_KEY is not set, sends are skipped with a warning.
 */

const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

// Resend's shared onboarding address works without domain verification,
// but only delivers to the Resend account owner's inbox — fine for dev.
const FROM_ADDRESS =
    process.env.EMAIL_FROM ?? "Hair by Noella <onboarding@resend.dev>";

// Customer replies go here (e.g. the salon's Outlook inbox). Sending *from*
// a mailbox provider address like @outlook.com is impossible — the domain
// can't be DNS-verified — so reply-to is how that inbox stays in the loop.
const REPLY_TO = process.env.EMAIL_REPLY_TO;

const BASE_URL =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.BETTER_AUTH_URL ??
    "http://localhost:3000";

function manageUrl(token: string): string {
    return `${BASE_URL}/booking/manage/${token}`;
}

export interface BookingEmailData {
    bookingId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string | null;
    serviceName: string;
    /** Actual appointment start time (the slot's startTime). */
    appointmentTime: Date;
    /** All amounts in pence. */
    fullServicePrice: number;
    depositPaid: number;
    notes?: string | null;
    hairPhotoUrl?: string | null;
    manageToken?: string | null;
}

/** Like formatPrice, but charset-safe for email clients (£ → &pound;). */
function formatPriceHtml(pence: number): string {
    return formatPrice(pence).replace("£", "&pound;");
}

/** Salon-local time, regardless of server timezone. */
function formatAppointmentTime(date: Date): string {
    return new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/London",
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    }).format(date);
}

function bookingReference(bookingId: string): string {
    return bookingId.slice(0, 8).toUpperCase();
}

function detailRow(label: string, value: string): string {
    return `
        <tr>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">${label}</td>
            <td style="padding: 8px 0; color: #1F2937; font-size: 14px; font-weight: 600; text-align: right;">${value}</td>
        </tr>`;
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function confirmationHtml(data: BookingEmailData): string {
    const balanceDue = data.fullServicePrice - data.depositPaid;
    const customerName = escapeHtml(data.customerName);
    const serviceName = escapeHtml(data.serviceName);
    const notes = data.notes ? escapeHtml(data.notes) : null;

    return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F9FAFB; padding: 24px 0; font-family: Arial, Helvetica, sans-serif;">
    <tr>
        <td align="center">
            <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border-radius: 8px; overflow: hidden; border: 1px solid #E5E7EB;">
                <tr>
                    <td style="background-color: #1F2937; padding: 32px; text-align: center;">
                        <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 26px; color: #EAB308;">Hair by Noella</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 32px;">
                        <h1 style="margin: 0 0 8px; font-family: Georgia, 'Times New Roman', serif; font-size: 22px; color: #1F2937;">Your booking is confirmed</h1>
                        <p style="margin: 0 0 24px; color: #4B5563; font-size: 14px; line-height: 1.6;">
                            Hi ${customerName}, thank you for booking with Hair by Noella!
                            We've received your deposit and your appointment is confirmed.
                        </p>

                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FEFCE8; border: 1px solid #FDE68A; border-radius: 8px;">
                            <tr>
                                <td style="padding: 20px 24px;">
                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                        ${detailRow("Booking reference", bookingReference(data.bookingId))}
                                        ${detailRow("Service", serviceName)}
                                        ${detailRow("Date &amp; time", formatAppointmentTime(data.appointmentTime))}
                                        ${notes ? detailRow("Your notes", notes) : ""}
                                    </table>
                                </td>
                            </tr>
                        </table>

                        <h2 style="margin: 28px 0 4px; font-family: Georgia, 'Times New Roman', serif; font-size: 16px; color: #1F2937;">Payment summary</h2>
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-bottom: 1px solid #E5E7EB;">
                            ${detailRow("Service price", formatPriceHtml(data.fullServicePrice))}
                            ${detailRow("Deposit paid", `&minus;${formatPriceHtml(data.depositPaid)}`)}
                        </table>
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                                <td style="padding: 12px 0; color: #1F2937; font-size: 14px; font-weight: 700;">Balance due at your appointment</td>
                                <td style="padding: 12px 0; color: #B45309; font-size: 16px; font-weight: 700; text-align: right;">${formatPriceHtml(balanceDue)}</td>
                            </tr>
                        </table>

                        ${data.manageToken ? `
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
                            <tr>
                                <td align="center" style="padding: 4px 0 16px;">
                                    <a href="${manageUrl(data.manageToken)}" style="display: inline-block; background-color: #EAB308; color: #1F2937; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 6px;">Manage your booking</a>
                                </td>
                            </tr>
                        </table>
                        <p style="margin: 0; padding: 16px; background-color: #F9FAFB; border-radius: 8px; color: #6B7280; font-size: 13px; line-height: 1.6;">
                            <strong style="color: #4B5563;">Need to cancel?</strong>
                            Use the button above to cancel free of charge up to ${AUTO_REFUND_CUTOFF_HOURS} hours before your appointment
                            &mdash; your deposit will be refunded. Cancellations made ${SELF_CANCEL_CUTOFF_HOURS}&ndash;${AUTO_REFUND_CUTOFF_HOURS} hours before keep
                            the slot free for others, but the deposit is non-refundable. Within ${SELF_CANCEL_CUTOFF_HOURS} hours of your
                            appointment, please contact us directly.
                        </p>` : `
                        <p style="margin: 24px 0 0; padding: 16px; background-color: #F9FAFB; border-radius: 8px; color: #6B7280; font-size: 13px; line-height: 1.6;">
                            <strong style="color: #4B5563;">Need to make a change?</strong>
                            If you need to reschedule or cancel, please contact us at least 24 hours before your appointment.
                        </p>`}
                    </td>
                </tr>
                <tr>
                    <td style="padding: 20px 32px; background-color: #F9FAFB; border-top: 1px solid #E5E7EB; text-align: center;">
                        <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                            This is an automated confirmation from Hair by Noella. Please don't reply to this email.
                        </p>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>`;
}

function adminNotificationHtml(data: BookingEmailData): string {
    const rows = [
        ["Booking reference", bookingReference(data.bookingId)],
        ["Customer", escapeHtml(data.customerName)],
        ["Email", escapeHtml(data.customerEmail)],
        ["Phone", data.customerPhone ? escapeHtml(data.customerPhone) : "Not provided"],
        ["Service", escapeHtml(data.serviceName)],
        ["Date & time", formatAppointmentTime(data.appointmentTime)],
        ["Deposit paid", formatPriceHtml(data.depositPaid)],
        ["Balance due", formatPriceHtml(data.fullServicePrice - data.depositPaid)],
        ...(data.notes ? [["Notes", escapeHtml(data.notes)]] : []),
    ];

    const photoLink = data.hairPhotoUrl
        ? `<p style="margin: 16px 0 0;"><a href="${escapeHtml(data.hairPhotoUrl)}" style="color: #B45309;">View customer's hair photo</a></p>`
        : "";

    return `
<div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px;">
    <h1 style="font-size: 18px; color: #1F2937;">New booking received</h1>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
        ${rows.map(([label, value]) => detailRow(label, value)).join("")}
    </table>
    ${photoLink}
</div>`;
}

/**
 * Sends the customer confirmation (and, if ADMIN_NOTIFICATION_EMAIL is set,
 * a new-booking alert to the salon). Never throws.
 */
export async function sendBookingEmails(data: BookingEmailData): Promise<void> {
    if (!resend) {
        console.warn(
            `RESEND_API_KEY not set — skipping confirmation email for booking ${data.bookingId}`
        );
        return;
    }

    try {
        const { error } = await resend.emails.send({
            from: FROM_ADDRESS,
            to: data.customerEmail,
            replyTo: REPLY_TO,
            subject: `Booking confirmed — ${data.serviceName} on ${formatAppointmentTime(data.appointmentTime)}`,
            html: confirmationHtml(data),
        });
        if (error) throw error;
        console.log(`Confirmation email sent for booking ${data.bookingId}`);
    } catch (error) {
        console.error(
            `Failed to send confirmation email for booking ${data.bookingId}:`,
            error
        );
    }

    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (!adminEmail) return;

    try {
        const { error } = await resend.emails.send({
            from: FROM_ADDRESS,
            to: adminEmail,
            // Replying to the alert emails the customer directly.
            replyTo: data.customerEmail,
            subject: `New booking: ${data.customerName} — ${data.serviceName}`,
            html: adminNotificationHtml(data),
        });
        if (error) throw error;
    } catch (error) {
        console.error(
            `Failed to send admin notification for booking ${data.bookingId}:`,
            error
        );
    }
}

export interface CancellationEmailData {
    bookingId: string;
    customerName: string;
    customerEmail: string;
    serviceName: string;
    /** Actual appointment start time (the slot's startTime). */
    appointmentTime: Date;
    /** In pence. */
    depositPaid: number;
    refundOutcome: "refunded" | "deposit_kept" | "refund_failed";
    /** In pence; set when refundOutcome is "refunded". */
    refundAmount?: number;
}

function refundMessage(data: CancellationEmailData): string {
    switch (data.refundOutcome) {
        case "refunded":
            return `Your ${formatPriceHtml(data.refundAmount ?? data.depositPaid)} deposit has been refunded to your original payment method. It usually appears within 5&ndash;10 business days.`;
        case "deposit_kept":
            return `As this cancellation was made within ${AUTO_REFUND_CUTOFF_HOURS} hours of the appointment, the deposit of ${formatPriceHtml(data.depositPaid)} is non-refundable.`;
        case "refund_failed":
            return `We're processing your ${formatPriceHtml(data.depositPaid)} deposit refund &mdash; if it hasn't reached you within 10 business days, please get in touch.`;
    }
}

function cancellationHtml(data: CancellationEmailData): string {
    const customerName = escapeHtml(data.customerName);
    const serviceName = escapeHtml(data.serviceName);

    return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F9FAFB; padding: 24px 0; font-family: Arial, Helvetica, sans-serif;">
    <tr>
        <td align="center">
            <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border-radius: 8px; overflow: hidden; border: 1px solid #E5E7EB;">
                <tr>
                    <td style="background-color: #1F2937; padding: 32px; text-align: center;">
                        <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 26px; color: #EAB308;">Hair by Noella</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 32px;">
                        <h1 style="margin: 0 0 8px; font-family: Georgia, 'Times New Roman', serif; font-size: 22px; color: #1F2937;">Your booking has been cancelled</h1>
                        <p style="margin: 0 0 24px; color: #4B5563; font-size: 14px; line-height: 1.6;">
                            Hi ${customerName}, this confirms that your appointment has been cancelled.
                        </p>

                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px;">
                            <tr>
                                <td style="padding: 20px 24px;">
                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                        ${detailRow("Booking reference", bookingReference(data.bookingId))}
                                        ${detailRow("Service", serviceName)}
                                        ${detailRow("Date &amp; time", formatAppointmentTime(data.appointmentTime))}
                                    </table>
                                </td>
                            </tr>
                        </table>

                        <p style="margin: 24px 0 0; padding: 16px; background-color: #F9FAFB; border-radius: 8px; color: #6B7280; font-size: 13px; line-height: 1.6;">
                            ${refundMessage(data)}
                        </p>

                        <p style="margin: 24px 0 0; color: #4B5563; font-size: 14px; line-height: 1.6;">
                            We'd love to see you another time &mdash; you can book a new appointment on our website whenever you're ready.
                        </p>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 20px 32px; background-color: #F9FAFB; border-top: 1px solid #E5E7EB; text-align: center;">
                        <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                            This is an automated message from Hair by Noella. Please don't reply to this email.
                        </p>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>`;
}

function adminCancellationHtml(data: CancellationEmailData): string {
    const rows = [
        ["Booking reference", bookingReference(data.bookingId)],
        ["Customer", escapeHtml(data.customerName)],
        ["Email", escapeHtml(data.customerEmail)],
        ["Service", escapeHtml(data.serviceName)],
        ["Date & time", formatAppointmentTime(data.appointmentTime)],
        ["Deposit paid", formatPriceHtml(data.depositPaid)],
        [
            "Refund",
            data.refundOutcome === "refunded"
                ? `Refunded ${formatPriceHtml(data.refundAmount ?? data.depositPaid)} automatically`
                : data.refundOutcome === "deposit_kept"
                ? "Deposit kept (cancelled within the refund cutoff)"
                : "REFUND FAILED",
        ],
    ];

    const refundWarning =
        data.refundOutcome === "refund_failed"
            ? `<p style="margin: 16px 0 0; padding: 12px; background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; color: #B91C1C; font-size: 14px; font-weight: 700;">
                The automatic Stripe refund failed &mdash; the customer was told their refund is being processed.
                Please refund ${formatPriceHtml(data.depositPaid)} manually from the Stripe dashboard.
               </p>`
            : "";

    return `
<div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px;">
    <h1 style="font-size: 18px; color: #1F2937;">Booking cancelled by customer</h1>
    <p style="font-size: 14px; color: #4B5563;">The slot has been freed and is bookable again.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
        ${rows.map(([label, value]) => detailRow(label, value)).join("")}
    </table>
    ${refundWarning}
</div>`;
}

/**
 * Sends the customer a cancellation confirmation (and, if
 * ADMIN_NOTIFICATION_EMAIL is set, an alert to the salon). Never throws.
 */
export async function sendCancellationEmails(
    data: CancellationEmailData
): Promise<void> {
    if (!resend) {
        console.warn(
            `RESEND_API_KEY not set — skipping cancellation email for booking ${data.bookingId}`
        );
        return;
    }

    try {
        const { error } = await resend.emails.send({
            from: FROM_ADDRESS,
            to: data.customerEmail,
            replyTo: REPLY_TO,
            subject: `Booking cancelled — ${data.serviceName} on ${formatAppointmentTime(data.appointmentTime)}`,
            html: cancellationHtml(data),
        });
        if (error) throw error;
        console.log(`Cancellation email sent for booking ${data.bookingId}`);
    } catch (error) {
        console.error(
            `Failed to send cancellation email for booking ${data.bookingId}:`,
            error
        );
    }

    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (!adminEmail) return;

    try {
        const { error } = await resend.emails.send({
            from: FROM_ADDRESS,
            to: adminEmail,
            // Replying to the alert emails the customer directly.
            replyTo: data.customerEmail,
            subject: `Booking cancelled by customer: ${data.customerName} — ${data.serviceName}`,
            html: adminCancellationHtml(data),
        });
        if (error) throw error;
    } catch (error) {
        console.error(
            `Failed to send admin cancellation alert for booking ${data.bookingId}:`,
            error
        );
    }
}
