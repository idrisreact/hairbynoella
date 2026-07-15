import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { services } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { calculateDeposit, parseServicePrice } from '@/lib/pricing';

// Request schema
const createPaymentIntentSchema = z.object({
  serviceId: z.string().min(1, 'Service ID is required'),
  customerEmail: z.string().email('Valid email is required'),
  customerName: z.string().min(1, 'Customer name is required'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = createPaymentIntentSchema.parse(body);

    const { serviceId, customerEmail, customerName } = validatedData;

    // Fetch service from database
    const service = await db
      .select()
      .from(services)
      .where(eq(services.id, serviceId))
      .limit(1);

    if (!service || service.length === 0) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    const serviceData = service[0];

    // Parse service price and calculate deposit
    const servicePriceInPence = parseServicePrice(serviceData.price);
    const depositInPence = calculateDeposit(servicePriceInPence);

    // Create Payment Intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: depositInPence,
      currency: 'gbp',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        serviceId: serviceData.id,
        serviceName: serviceData.name,
        customerEmail,
        customerName,
        fullServicePrice: servicePriceInPence.toString(),
        depositAmount: depositInPence.toString(),
      },
      description: `Deposit for ${serviceData.name} - ${customerName}`,
      receipt_email: customerEmail,
    });

    // Return client secret and payment details
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      depositAmount: depositInPence,
      fullServicePrice: servicePriceInPence,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    // Handle Stripe errors
    if (error instanceof Stripe.errors.StripeError) {
      console.error('Payment intent - Stripe error:', error.type, error.code);
      return NextResponse.json(
        { error: 'Payment processing error' },
        { status: 400 }
      );
    }

    // Generic error
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
