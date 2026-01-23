# Stripe Payment Integration - Testing Guide

## ✅ Completed Implementation

You've successfully implemented:
- **Payment Intent Creation** - Creates deposits (30% or £20 minimum)
- **Stripe Elements UI** - Secure card payment form
- **Webhook Handler** - Processes payment events
- **Booking with Payment** - Verifies payment before confirming bookings
- **Admin Dashboard** - Payment status, refunds, and revenue tracking
- **Success Page** - Payment confirmation with next steps

## 🧪 Testing Steps

### 1. Set Up Webhook Secret

In a separate terminal, run:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This will output a webhook secret like `whsec_xxxxx`. Copy it and update your `.env`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # Replace the URL with this
```

Restart your dev server after updating `.env`.

### 2. Test Complete Booking Flow

Start your dev server:
```bash
npm run dev
```

#### Test Case 1: Successful Payment
1. Go to http://localhost:3000/book
2. Select a service (e.g., "Balayage - £150")
3. Select a date and time slot
4. Fill in customer details:
   - Name: Test User
   - Email: test@example.com
   - Phone: 07123456789
5. Click "Proceed to Payment"
6. On the payment form, verify:
   - Deposit amount shows (£45 for £150 service)
   - Remaining balance shows (£105)
7. Enter test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
   - Postal code: Any valid code
8. Click "Pay Deposit"
9. Should redirect to success page with:
   - ✓ "Payment Successful!" message
   - ✓ Deposit received confirmation
   - ✓ Next steps displayed

#### Test Case 2: Payment Decline
1. Follow steps 1-5 above
2. Use declining test card: `4000 0000 0000 0002`
3. Should show error message
4. Booking should NOT be created
5. Slot should remain available

#### Test Case 3: 3D Secure
1. Follow steps 1-5 above
2. Use 3D Secure test card: `4000 0025 0000 3155`
3. Complete 3D Secure authentication
4. Should succeed and create booking

### 3. Verify Database

Check that payment data is stored correctly:
```bash
docker exec hairbynoella-db psql -U postgres -d hairbynoella -c "SELECT customer_name, payment_status, deposit_amount, amount_paid FROM bookings ORDER BY created_at DESC LIMIT 5;"
```

Should show:
- `payment_status` = 'succeeded'
- `deposit_amount` = amount in pence (e.g., 4500 for £45)
- `amount_paid` = same as deposit_amount

### 4. Test Webhook Processing

With the Stripe CLI running, trigger a test event:
```bash
stripe trigger payment_intent.succeeded
```

Check the terminal running `stripe listen` - you should see the event being forwarded.

### 5. Test Admin Features

#### View Payment Information
1. Login to admin panel: http://localhost:3000/admin/bookings
2. Verify the payment column shows:
   - ✓ Payment status badge (green = succeeded)
   - ✓ Amount paid
3. Click on "Revenue" in sidebar
4. Verify revenue dashboard shows:
   - ✓ Total revenue
   - ✓ Monthly revenue
   - ✓ Paid bookings count
   - ✓ Recent transactions table

#### Test Refund Flow
1. In admin bookings page, find a booking with "succeeded" payment status
2. Click the refund button (purple rotate icon)
3. A modal should open asking for confirmation
4. Optionally add a refund reason
5. Click "Refund £XX.XX"
6. Should show success message
7. Verify:
   - Payment status changes to "refunded"
   - Amount refunded is displayed
   - Booking status changes to "cancelled"
   - Slot becomes available again

Check refund in Stripe:
```bash
stripe refunds list --limit 3
```

### 6. Test Edge Cases

#### Concurrent Bookings
1. Open two browser windows
2. Try to book the same slot simultaneously
3. Only one should succeed (slot booking is atomic)

#### Minimum Deposit Calculation
Test with different service prices:
- £150 service → £45 deposit (30%)
- £45 service → £20 deposit (minimum floor)
- £200 service → £60 deposit (30%)

#### Invalid Payment Intent
Try to create a booking with a fake payment intent ID:
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "xxx",
    "date": "2026-02-01",
    "slotId": "xxx",
    "customerName": "Test",
    "customerEmail": "test@example.com",
    "customerPhone": "07123456789",
    "stripePaymentIntentId": "pi_fake123"
  }'
```
Should return error: "Invalid payment intent"

## 🐛 Common Issues & Fixes

### Issue: "STRIPE_SECRET_KEY is not defined"
**Fix:** Ensure your `.env` file has the correct keys and restart dev server

### Issue: Webhook signature verification failed
**Fix:** Make sure `STRIPE_WEBHOOK_SECRET` matches the output from `stripe listen`

### Issue: Payment succeeds but booking not created
**Fix:** Check webhook is running and processing events. Look at server logs.

### Issue: Slot not marked as booked
**Fix:** Check that webhook handler is updating the slot correctly

## 📊 Test Card Numbers

| Card Number | Description |
|------------|-------------|
| 4242 4242 4242 4242 | Successful payment |
| 4000 0000 0000 0002 | Card declined |
| 4000 0025 0000 3155 | 3D Secure authentication |
| 4000 0000 0000 9995 | Insufficient funds |

All test cards:
- Use any future expiry date
- Use any 3-digit CVC
- Use any postal code

## ✅ Success Criteria

Before going to production, verify:
- [ ] Successful booking flow works end-to-end
- [ ] Payment decline is handled gracefully
- [ ] Webhooks process correctly
- [ ] Admin can see payment status
- [ ] Admin can process refunds
- [ ] Revenue dashboard shows accurate data
- [ ] Slots are properly marked as booked/unbooked
- [ ] Database stores all payment metadata
- [ ] Success page displays correctly

## 🚀 Next Steps (After Testing)

Once all tests pass:
1. Set up production webhook in Stripe Dashboard
2. Update `.env` with live Stripe keys
3. Test with small real transaction
4. Configure email receipts in Stripe Dashboard
5. Set up error monitoring (Sentry/LogRocket)

## 📚 Documentation

- Stripe Testing: https://stripe.com/docs/testing
- Webhook Testing: https://stripe.com/docs/webhooks/test
- Payment Intents: https://stripe.com/docs/payments/payment-intents
