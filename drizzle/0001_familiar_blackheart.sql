CREATE TABLE "webhook_events" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"processed" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "hair_photo_url" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "stripe_payment_intent_id" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "payment_status" text DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "deposit_amount" integer;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "full_service_price" integer;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "amount_paid" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "amount_refunded" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "currency" text DEFAULT 'gbp';--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "refund_reason" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "payment_date" timestamp;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "refund_date" timestamp;