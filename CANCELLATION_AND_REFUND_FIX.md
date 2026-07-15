# Cancellation & Refund System - Fixed

## 🐛 Issues Fixed

### Issue 1: Refunds Not Working
**Problem:** Refund button wasn't processing refunds correctly
**Root Cause:**
- Session role checking issue (`session.user.role` vs `(session.user as any).role`)
- Missing error logging made debugging difficult

**Fix:**
- ✅ Updated authentication check in refund API
- ✅ Added comprehensive error logging
- ✅ Added detailed console logs for debugging

### Issue 2: Cancel Booking Doesn't Handle Payments
**Problem:** When cancelling a booking, it didn't:
- Refund the payment if one was made
- Release the slot
- Ask admin if they want to refund

**Fix:**
- ✅ Created smart `CancelBookingButton` that:
  - Detects if booking has a payment
  - Prompts admin to choose: "Cancel & Refund" or "Cancel Without Refund"
  - Automatically releases the slot
  - Processes refund through Stripe if chosen
- ✅ Created `/api/admin/bookings/cancel` endpoint
- ✅ Updated delete functionality to release slots

## 📁 New/Modified Files

### New Files:
1. `components/admin/CancelBookingButton.tsx` - Smart cancel with refund option
2. `app/api/admin/bookings/cancel/route.ts` - Cancel endpoint (releases slot)

### Modified Files:
1. `app/admin/bookings/page.tsx` - Uses new CancelBookingButton
2. `app/api/admin/refunds/route.ts` - Better error handling & logging
3. `app/api/admin/bookings/cancel/route.ts` - Authentication fix

## 🎯 How It Works Now

### Scenario 1: Cancel Booking with Payment
1. Admin clicks cancel button (X icon) on a booking
2. Modal opens showing:
   - ⚠️ "This booking has a payment of £XX.XX"
   - "Do you want to refund the customer?"
3. Admin has 3 options:
   - **Keep Booking** - Do nothing, close modal
   - **Cancel Without Refund** - Mark as cancelled, release slot, keep payment
   - **Cancel & Refund £XX.XX** - Process full refund + cancel + release slot

### Scenario 2: Cancel Booking Without Payment
1. Admin clicks cancel button
2. Modal shows: "Are you sure you want to cancel?"
3. Admin confirms
4. Booking cancelled, slot released

### Scenario 3: Direct Refund (Without Cancelling)
1. Admin clicks refund button (purple rotate icon)
2. Modal opens with refund confirmation
3. Admin enters optional reason
4. Clicks "Refund £XX.XX"
5. Processes refund, updates status to 'refunded', marks as 'cancelled', releases slot

## 🧪 Testing Instructions

### Test 1: Cancel Booking with Payment

**Setup:**
1. Create a test booking with payment
2. Complete payment using test card `4242 4242 4242 4242`
3. Verify booking shows "succeeded" payment status

**Test:**
1. Go to `/admin/bookings`
2. Find the booking with payment
3. Click the cancel (X) button
4. Verify modal shows:
   - Warning about payment
   - Amount to refund
   - Two buttons: "Cancel Without Refund" and "Cancel & Refund"

**Test 4a: Cancel with Refund**
1. Click "Cancel & Refund £XX.XX"
2. Wait for processing
3. Verify:
   - ✓ Alert shows "Refund successful!"
   - ✓ Booking status changes to "cancelled"
   - ✓ Payment status changes to "refunded"
   - ✓ Amount refunded is displayed
   - ✓ Slot becomes available again

Check Stripe:
```bash
stripe refunds list --limit 3
```

**Test 4b: Cancel without Refund**
1. Click the cancel button again on a different paid booking
2. Click "Cancel Without Refund"
3. Verify:
   - ✓ Booking status changes to "cancelled"
   - ✓ Payment status stays "succeeded" (no refund)
   - ✓ Slot is released
   - ✓ Amount paid still shows

### Test 2: Cancel Booking Without Payment

**Setup:**
1. Create a booking but don't complete payment
2. Booking should have payment status "pending"

**Test:**
1. Go to `/admin/bookings`
2. Click cancel (X) button
3. Verify modal shows simple confirmation (no refund option)
4. Click "Cancel Booking"
5. Verify:
   - ✓ Booking cancelled
   - ✓ Slot released
   - ✓ No refund processed

### Test 3: Direct Refund Button

**Setup:**
1. Use a booking with "succeeded" payment

**Test:**
1. Click the refund button (purple rotate icon)
2. Verify modal opens
3. Add optional reason: "Customer requested cancellation"
4. Click "Refund £XX.XX"
5. Verify:
   - ✓ Refund processed
   - ✓ Status updates to "refunded"
   - ✓ Booking marked as "cancelled"
   - ✓ Slot released

### Test 4: Debugging Refund Issues

If refunds still don't work, check browser console and server logs:

**Browser Console (F12):**
- Look for network errors
- Check API response

**Server Logs (Terminal running npm run dev):**
You should see logs like:
```
Refund API - Session: { id: '...', email: '...', role: 'admin' }
Refund API - Request body: { bookingId: '...', paymentIntentId: 'pi_...' }
Refund API - Processing refund for booking: xxx
Refund API - Creating Stripe refund for payment intent: pi_xxx
```

**Common Issues:**

1. **"Unauthorized" Error:**
   - Check admin user has `role = 'admin'` in database:
   ```bash
   psql "$DATABASE_URL" -c "SELECT id, email, role FROM \"user\";"
   ```
   - If role is NULL, update it:
   ```bash
   psql "$DATABASE_URL" -c "UPDATE \"user\" SET role = 'admin' WHERE email = 'your-email@example.com';"
   ```

2. **"Payment intent mismatch" Error:**
   - This means the payment intent ID doesn't match
   - Check the booking in database:
   ```bash
   psql "$DATABASE_URL" -c "SELECT id, customer_name, stripe_payment_intent_id, payment_status FROM bookings LIMIT 5;"
   ```

3. **Stripe API Error:**
   - Verify your `.env` has correct `STRIPE_SECRET_KEY`
   - Check Stripe CLI is running if testing webhooks

## 🔄 Flow Diagram

```
┌─────────────────────┐
│  Admin Clicks       │
│  Cancel Button      │
└──────────┬──────────┘
           │
           v
    Has Payment? ───No──> Simple Cancel
           │              ├─ Mark cancelled
          Yes             ├─ Release slot
           │              └─ Done
           v
┌──────────────────────┐
│  Show Refund Modal   │
│  ┌──────────────┐    │
│  │ Keep Booking │    │
│  ├──────────────┤    │
│  │ Cancel Only  │────┼──> Cancel without refund
│  ├──────────────┤    │    ├─ Mark cancelled
│  │ Cancel +     │    │    ├─ Release slot
│  │ Refund       │────┼──> └─ Keep payment
│  └──────────────┘    │
└──────────────────────┘
                       │
                       v
                ┌──────────────┐
                │ Process:     │
                │ 1. Stripe    │
                │    refund    │
                │ 2. Update DB │
                │ 3. Release   │
                │    slot      │
                └──────────────┘
```

## ✅ Verification Checklist

After testing, verify:
- [ ] Paid bookings can be cancelled with refund
- [ ] Paid bookings can be cancelled without refund
- [ ] Unpaid bookings can be cancelled
- [ ] Direct refund button works
- [ ] Slots are released after cancellation
- [ ] Database shows correct status updates
- [ ] Stripe dashboard shows refunds
- [ ] Admin sees success/error messages
- [ ] Revenue dashboard updates correctly

## 📊 Database Verification

Check booking status after actions:
```bash
# View recent bookings with payment info
psql "$DATABASE_URL" -c "
SELECT
  customer_name,
  status,
  payment_status,
  amount_paid,
  amount_refunded,
  refund_reason
FROM bookings
ORDER BY created_at DESC
LIMIT 5;"
```

Check if slots were released:
```bash
# View slot booking status
psql "$DATABASE_URL" -c "
SELECT id, start_time, is_booked
FROM availability_slots
WHERE DATE(start_time) >= CURRENT_DATE
ORDER BY start_time
LIMIT 10;"
```

## 🎉 Success!

You now have a complete cancellation and refund system that:
- ✅ Handles payments intelligently
- ✅ Gives admins control over refunds
- ✅ Automatically releases slots
- ✅ Provides clear feedback
- ✅ Logs errors for debugging
