/**
 * Client-side Stripe.js loader
 *
 * This module loads and exports the Stripe.js library for use in client components.
 * The promise is cached to avoid loading Stripe multiple times.
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error(
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined in environment variables. ' +
    'Please add it to your .env file.'
  );
}

// Cache the Stripe promise to avoid loading multiple times
let stripePromise: Promise<Stripe | null>;

/**
 * Get the Stripe.js instance
 *
 * Returns a promise that resolves to the Stripe instance.
 * The instance is cached after the first load.
 */
export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }

  return stripePromise;
};
