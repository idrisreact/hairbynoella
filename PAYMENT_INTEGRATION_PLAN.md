# Stripe Payment Integration Plan for Hair by Noella

> Implementation plan for adding deposit-based payments to the booking system using WooPayments/Stripe

## Progress Tracker

### Phase 1: Setup ✅
- [x] Install Stripe dependencies (`npm install stripe @stripe/stripe-js @stripe/react-stripe-js`)
- [ ] Get Stripe API keys from WooPayments settings (TODO: Add your keys to .env)
- [x] Add environment variables to `.env` (placeholders added)
- [x] Create `lib/stripe.ts` (server-side Stripe client)
- [x] Create `lib/stripe-client.ts` (client-side Stripe loader)
- [x] Create `lib/pricing.ts` (price parsing and deposit calculation)
- [ ] Test pricing logic with existing service prices (TODO: After adding API keys)

### Phase 2: Database ✅
- [x] Update `lib/schema.ts` with payment fields in bookings table
- [x] Add `webhookEvents` table to `lib/schema.ts`
- [x] Run `npx drizzle-kit generate` to create migration
- [x] Review generated SQL in `drizzle/` directory
- [x] Apply migration manually (migration file: 0001_familiar_blackheart.sql)
- [x] Verify schema in database (payment columns and webhook_events table confirmed)

### Phase 3: Backend APIs ✅
- [x] Create `app/api/payments/create-intent/route.ts`
- [ ] Test Payment Intent creation endpoint (TODO: After adding API keys)
- [x] Create `app/api/webhooks/stripe/route.ts`
- [x] Update `app/api/bookings/route.ts` to accept payment intent ID
- [ ] Install Stripe CLI (`brew install stripe/stripe-cli/stripe`) (TODO)
- [ ] Set up local webhook forwarding (`stripe listen --forward-to localhost:3000/api/webhooks/stripe`) (TODO)
- [ ] Test webhook events (payment_intent.succeeded, failed, refunded) (TODO)

### Phase 4: Frontend Payment ✅
- [x] Create `components/PaymentForm.tsx` with Stripe Elements
- [x] Update `components/BookingForm.tsx` to add payment step
- [x] Add payment step state management (details → payment → processing)
- [x] Integrate payment success handler
- [ ] Test end-to-end booking flow (TODO: After adding API keys)
- [x] Add loading states and error handling

### Phase 5: Success Page ✅
- [x] Update `app/book/success/page.tsx` with payment confirmation
- [x] Add "Deposit Received" messaging
- [x] Display next steps (email confirmation, remaining balance)

### Phase 6: Admin Features ✅
- [x] Update `app/admin/bookings/page.tsx` to show payment status column
- [x] Display amount paid and amount refunded
- [x] Create `components/admin/RefundButton.tsx`
- [x] Create `app/api/admin/refunds/route.ts`
- [ ] Test refund flow end-to-end (TODO: Need to test with real Stripe webhooks)
- [x] Create `app/admin/revenue/page.tsx` (revenue dashboard)
- [x] Update `app/admin/layout.tsx` to add revenue link to navigation

### Phase 7: Testing & Polish ✅ / ❌
- [ ] Test complete booking flow with test cards
- [ ] Test payment decline handling
- [ ] Test refund processing
- [ ] Test webhook idempotency
- [ ] Test service price parsing (£80, From £45, ranges)
- [ ] Test concurrent bookings for same slot
- [ ] Security review (webhook signatures, admin auth)
- [ ] Performance testing

### Phase 8: Deployment ✅ / ❌
- [ ] Configure webhook endpoint in Stripe Dashboard
- [ ] Add production environment variables
- [ ] Test with Stripe test mode in production
- [ ] Switch to live keys
- [ ] Customize email receipts in Stripe Dashboard
- [ ] Set up error monitoring (Sentry/LogRocket)
- [ ] Test with small live transaction
- [ ] Monitor first transactions

---

## Overview

Integrate Stripe payment processing with **deposit-only payments** (30% or £20 minimum) into the booking flow. Users will pay a deposit when booking, and the remainder is due at the salon.

**Why Stripe over PayPal:**
- Superior developer experience with excellent TypeScript support (your priority)
- Lower fees for UK cards: 1.5% + £0.20 (vs PayPal's 2.9% + £0.30)
- Better suited for deposit flows with Payment Intents
- Built-in refund handling and webhook system
- Embedded checkout for seamless UX (no redirect)

**Using WooPayments:**
WooPayments is built on Stripe infrastructure, so we'll use the Stripe API keys from your existing WooPayments account. All payments will appear in both your Stripe Dashboard and WooPayments dashboard.

## Current Booking Flow

1. Service selection → 2. Date selection → 3. Time slot selection → 4. Customer details → 5. Confirm booking
- Form: `/components/BookingForm.tsx` (306 lines)
- API: `POST /api/bookings` (creates booking + marks slot as booked)
- Success: `/app/book/success/page.tsx`

**New flow will add payment step between customer details and confirmation.**

## Implementation Summary

### Phase 1: Database Schema (Critical File: `lib/schema.ts`)

Add payment fields to `bookings` table:

```typescript
// New fields to add
stripePaymentIntentId: text('stripe_payment_intent_id'),
paymentStatus: text('payment_status').default('pending'), // 'pending', 'succeeded', 'failed', 'refunded'
depositAmount: integer('deposit_amount'), // In pence (e.g., 2000 = £20.00)
fullServicePrice: integer('full_service_price'),
amountPaid: integer('amount_paid').default(0),
amountRefunded: integer('amount_refunded').default(0),
currency: text('currency').default('gbp'),
refundReason: text('refund_reason'),
paymentDate: timestamp('payment_date'),
refundDate: timestamp('refund_date'),
```

Add new `webhookEvents` table for idempotency:

```typescript
export const webhookEvents = pgTable('webhook_events', {
    id: text('id').primaryKey(), // Stripe event ID
    type: text('type').notNull(),
    processed: boolean('processed').default(true),
    createdAt: timestamp('created_at').defaultNow(),
});
```

**Migration steps:**
1. Update `lib/schema.ts`
2. Run `npx drizzle-kit generate`
3. Review generated SQL in `drizzle/` directory
4. Run `npx drizzle-kit migrate`

### Phase 2: Stripe Setup

**Note:** WooPayments is built on Stripe infrastructure, so we'll use the Stripe API keys from your existing WooPayments account. This means no new payment processor setup is needed!

**How to get Stripe keys from WooPayments:**
1. Log into WordPress admin
2. Go to **WooCommerce → Settings → Payments → WooPayments**
3. Look for "Advanced settings" or "Developer settings"
4. Find the Stripe API keys (test and live mode) or link to Stripe Dashboard
5. Copy the keys for the environment variables below

**Dependencies to install:**
```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

**Environment variables (add to `.env`):**
```bash
STRIPE_SECRET_KEY=sk_test_... # From WooPayments settings
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # From WooPayments settings
STRIPE_WEBHOOK_SECRET=whsec_... # From Stripe CLI or Stripe Dashboard (linked from WooPayments)
```

**Create new files:**

1. `lib/stripe.ts` - Server-side Stripe client
2. `lib/stripe-client.ts` - Client-side Stripe.js loader
3. `lib/pricing.ts` - Price parsing and deposit calculation utilities

### Phase 3: Deposit Calculation Logic (`lib/pricing.ts`)

**Strategy: 30% with £20 minimum floor**

Key functions:
- `parseServicePrice(priceString)` - Handles "£80", "From £45", "£120-£150"
- `calculateDeposit(servicePriceInPence)` - 30% of price, minimum £20
- `formatPrice(pence)` - Format as "£20.00"

**Examples:**
- Service at £150 → Deposit £45 (30%)
- Service "From £45" → Deposit £20 (30% = £13.50, but min is £20)
- Free consultation → Deposit £20 (default)

### Phase 4: API Routes

**Create 3 new API routes:**

#### 4A. `/app/api/payments/create-intent/route.ts`

**Purpose:** Create Stripe Payment Intent before collecting payment

- Accepts: `serviceId`, `customerEmail`, `customerName`
- Fetches service price from database
- Calculates deposit using pricing utility
- Creates Payment Intent with Stripe
- Returns: `clientSecret`, `depositAmount`, `fullServicePrice`

#### 4B. `/app/api/webhooks/stripe/route.ts`

**Purpose:** Handle asynchronous payment events

**Events to handle:**
- `payment_intent.succeeded` → Update booking payment status, mark slot as booked
- `payment_intent.payment_failed` → Update booking status to failed
- `charge.refunded` → Update booking with refund amount and status

**Security:** Always verify webhook signature using `stripe.webhooks.constructEvent()`

**Idempotency:** Check `webhookEvents` table before processing to prevent duplicate handling

#### 4C. Modify `/app/api/bookings/route.ts`

**Changes:**
- Add `stripePaymentIntentId` to `bookingSchema` (required)
- Verify payment intent status is 'succeeded' before creating booking
- Store payment metadata in booking record
- Import stripe client to retrieve payment intent

### Phase 5: Frontend Payment Flow

#### 5A. Create `/components/PaymentForm.tsx`

**Features:**
- Uses `@stripe/react-stripe-js` Elements
- Shows deposit amount and full service price
- Embedded card payment with gold/dark theme styling
- Loading states and error handling
- Secure payment confirmation

#### 5B. Modify `/components/BookingForm.tsx`

**Changes:**
- Add payment step state: `'details' | 'payment' | 'processing'`
- After customer details submission, call `/api/payments/create-intent`
- Wrap PaymentForm in `<Elements>` provider from Stripe
- Handle payment success → create booking with payment intent ID
- Show processing state while booking is created

**New flow:**
1. Service/Date/Slot/Details (existing)
2. **Payment** (new) - Show deposit amount, collect card details
3. **Processing** (new) - Submit booking with payment intent ID
4. Success page

#### 5C. Update `/app/book/success/page.tsx`

**Enhancements:**
- Show "Payment Successful - Deposit Received" confirmation
- Display next steps (check email, remaining balance due at appointment)
- Show that receipt was sent to email

### Phase 6: Admin Features

#### 6A. Update `/app/admin/bookings/page.tsx`

**Add payment status column:**
- Show payment status badge (succeeded/pending/failed/refunded)
- Display amount paid and amount refunded
- Add refund button for bookings with 'succeeded' status

**Database query changes:**
- Include `paymentStatus`, `depositAmount`, `amountPaid`, `amountRefunded` in select

#### 6B. Create `/components/admin/RefundButton.tsx`

**Features:**
- Confirmation dialog with optional reason field
- Calls refund API
- Shows loading state during processing
- Refreshes bookings list on success

#### 6C. Create `/app/api/admin/refunds/route.ts`

**Flow:**
1. Check admin authentication (role === 'admin')
2. Validate booking exists and has payment
3. Process refund with Stripe
4. Update booking: set status to 'cancelled', payment status to 'refunded'
5. Return refund confirmation

#### 6D. Create `/hooks/useRefund.ts`

React Query mutation for refund processing with automatic cache invalidation.

#### 6E. Create `/app/admin/revenue/page.tsx`

**Revenue Dashboard with:**
- Total revenue (all time)
- Monthly revenue (current month)
- Total paid bookings count
- Total refunds amount
- Recent transactions table (last 10)

**Database queries:**
- Aggregate SUM of `amountPaid` where `paymentStatus = 'succeeded'`
- Aggregate SUM of `amountRefunded`
- Date-filtered queries for monthly stats

#### 6F. Update `/app/admin/layout.tsx`

Add "Revenue" link to admin sidebar navigation.

### Phase 7: Error Handling & Edge Cases

**Critical scenarios handled:**

1. **Payment fails but slot booked** → Slot only marked as booked AFTER payment succeeds (in webhook)
2. **Duplicate payment attempts** → Disable button while processing, use idempotency keys
3. **Webhook reliability** → Store processed event IDs in `webhookEvents` table
4. **Concurrent bookings** → Database transaction for slot booking (atomic operation)

### Phase 8: Testing Strategy

**Local testing with Stripe CLI:**
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe account
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy webhook secret to .env
# Test trigger events
stripe trigger payment_intent.succeeded
```

**Test cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

**Test scenarios:**
1. Complete booking with successful payment
2. Payment decline handling
3. Refund processing
4. Webhook idempotency (send same event twice)
5. Service price parsing ("£80", "From £45", ranges)
6. Concurrent bookings for same slot
7. Admin revenue dashboard accuracy

## Critical Files Reference

### New Files to Create
- `lib/stripe.ts` - Server-side Stripe initialization
- `lib/stripe-client.ts` - Client-side Stripe.js loader
- `lib/pricing.ts` - Price parsing and deposit calculation
- `app/api/payments/create-intent/route.ts` - Payment Intent creation
- `app/api/webhooks/stripe/route.ts` - Webhook handler
- `app/api/admin/refunds/route.ts` - Refund processing
- `components/PaymentForm.tsx` - Stripe Elements payment UI
- `components/admin/RefundButton.tsx` - Refund interface
- `hooks/useRefund.ts` - Refund mutation hook
- `app/admin/revenue/page.tsx` - Revenue analytics

### Files to Modify
- `lib/schema.ts` - Add payment fields to bookings, create webhookEvents table
- `components/BookingForm.tsx` - Add payment step to booking flow
- `app/api/bookings/route.ts` - Accept and verify payment intent ID
- `app/book/success/page.tsx` - Show payment confirmation
- `app/admin/bookings/page.tsx` - Add payment status column and refund button
- `app/admin/layout.tsx` - Add revenue page to navigation
- `hooks/useBooking.ts` - Update type to include stripePaymentIntentId
- `package.json` - Add Stripe dependencies
- `.env` - Add Stripe environment variables

## Verification Steps (End-to-End Testing)

After implementation, verify the complete flow:

1. **Booking with Payment:**
   - Select service with price "£80"
   - Select date and time slot
   - Enter customer details
   - See payment form showing £24 deposit (30% of £80)
   - Enter test card `4242 4242 4242 4242`
   - Submit payment
   - Verify redirect to success page with payment confirmation
   - Check database: booking has `paymentStatus = 'succeeded'`, `depositAmount = 2400`
   - Check slot is marked as `isBooked = true`

2. **Webhook Processing:**
   - Trigger `payment_intent.succeeded` event with Stripe CLI
   - Verify booking updated correctly
   - Trigger same event again, verify idempotency (not processed twice)

3. **Admin Dashboard:**
   - Login to `/admin/bookings`
   - Verify payment status column shows green "succeeded" badge
   - Verify amount paid is displayed
   - Click refund button
   - Verify refund processes and status updates to "refunded"

4. **Revenue Dashboard:**
   - Visit `/admin/revenue`
   - Verify total revenue includes test booking deposit
   - Verify monthly revenue shows current month's deposits
   - Verify transaction history shows recent booking

5. **Edge Cases:**
   - Try booking with "From £45" service → Deposit should be £20 (minimum)
   - Try declining card `4000 0000 0000 0002` → Verify error handling
   - Try concurrent bookings for same slot → Only one should succeed

## Security Checklist

- [ ] Webhook signature verification implemented
- [ ] Admin endpoints protected with role check
- [ ] Payment intent status verified before creating booking
- [ ] Environment variables not committed to git
- [ ] HTTPS configured for production webhooks
- [ ] Idempotency implemented for webhooks
- [ ] Server-side deposit calculation (not client-side)
- [ ] SQL injection protection (using Drizzle ORM)

## Production Deployment Notes

**Before going live:**
1. Access Stripe Dashboard via WooPayments (or directly at dashboard.stripe.com)
2. Configure webhook endpoint in Stripe Dashboard: `https://yourdomain.com/api/webhooks/stripe`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
4. Copy webhook signing secret to production `.env`
5. Update Stripe keys from test to live mode (get live keys from WooPayments settings)
6. Customize email receipts in Stripe Dashboard → Settings → Emails
7. Set up error monitoring (Sentry/LogRocket) for payment failures
8. Test with small live transaction before announcing

**Important:** All payments will appear in both:
- Your Stripe Dashboard (accessed via WooPayments or directly)
- WooPayments dashboard in WordPress (if WooCommerce site exists)

**Stripe Dashboard Configuration:**
- Business name: Hair by Noella
- Customer email receipts: Enabled
- Statement descriptor: "HAIRBYNOELLA" (appears on bank statements)
- Refund policy: Add to Dashboard settings

## Future Enhancements (Post-MVP)

- Automated email notifications via Resend/SendGrid
- Allow customers to pay remaining balance online before appointment
- Subscription packages with recurring payments
- Gift card functionality
- Advanced analytics (revenue trends, popular services)
- Multi-currency support for international bookings
