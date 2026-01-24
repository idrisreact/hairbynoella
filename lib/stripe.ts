/**
 * Server-side Stripe client
 *
 * This module initializes and exports the Stripe instance for server-side use.
 * Use this in API routes and server components.
 */

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error(
    'STRIPE_SECRET_KEY is not defined in environment variables. ' +
    'Please add it to your .env file.'
  );
}

// Initialize Stripe with secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
});
