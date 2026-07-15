'use client';

import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { formatPrice } from '@/lib/pricing';

interface PaymentFormProps {
  depositAmount: number; // In pence
  fullServicePrice: number; // In pence
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  customerName: string;
}

export function PaymentForm({
  depositAmount,
  fullServicePrice,
  onSuccess,
  onError,
  customerName,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const remainingBalance = fullServicePrice - depositAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/book/success`,
        },
        redirect: 'if_required', // Don't redirect if not needed
      });

      if (error) {
        setErrorMessage(error.message || 'Payment failed');
        onError(error.message || 'Payment failed');
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment successful
        onSuccess(paymentIntent.id);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setErrorMessage(message);
      onError(message);
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Summary */}
      <div className="bg-dark-800 border border-gold-400/20 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gold-400">
          Payment Summary
        </h3>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Service Price:</span>
            <span className="text-white font-medium">
              {formatPrice(fullServicePrice)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Deposit (Due Now):</span>
            <span className="text-gold-400 font-bold text-lg">
              {formatPrice(depositAmount)}
            </span>
          </div>

          <div className="flex justify-between pt-2 border-t border-gray-700">
            <span className="text-gray-400">Remaining Balance:</span>
            <span className="text-white">
              {formatPrice(remainingBalance)}
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-500">
          The remaining balance of {formatPrice(remainingBalance)} is due at your
          appointment.
        </p>
      </div>

      {/* Payment Element */}
      <div className="bg-white rounded-lg p-4">
        <PaymentElement
          options={{
            layout: 'tabs',
            defaultValues: {
              billingDetails: {
                name: customerName,
              },
            },
          }}
        />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4">
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-gold-500 hover:bg-gold-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </span>
        ) : (
          `Pay Deposit ${formatPrice(depositAmount)}`
        )}
      </button>

      {/* Security Note */}
      <p className="text-center text-xs text-gray-500">
        🔒 Payments are securely processed by Stripe
      </p>
    </form>
  );
}
