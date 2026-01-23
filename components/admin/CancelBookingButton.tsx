'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/pricing';
import { Loader2, X, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CancelBookingButtonProps {
  bookingId: string;
  paymentIntentId: string | null;
  amountPaid: number | null;
  paymentStatus: string | null;
}

export default function CancelBookingButton({
  bookingId,
  paymentIntentId,
  amountPaid,
  paymentStatus,
}: CancelBookingButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const hasPayment = paymentStatus === 'succeeded' && paymentIntentId && amountPaid && amountPaid > 0;

  const handleCancel = async (withRefund: boolean) => {
    setIsProcessing(true);
    setError(null);

    try {
      // If there's a payment and user wants to refund, process refund first
      if (hasPayment && withRefund) {
        const refundResponse = await fetch('/api/admin/refunds', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId,
            paymentIntentId,
            reason: refundReason || 'Booking cancelled by admin',
          }),
        });

        const refundData = await refundResponse.json();

        if (!refundResponse.ok) {
          throw new Error(refundData.error || 'Refund failed');
        }

        alert(`Refund successful! ${formatPrice(refundData.refund.amount)} has been refunded and booking cancelled.`);
      } else {
        // Just cancel without refund
        const cancelResponse = await fetch('/api/admin/bookings/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId }),
        });

        const cancelData = await cancelResponse.json();

        if (!cancelResponse.ok) {
          throw new Error(cancelData.error || 'Cancellation failed');
        }

        alert('Booking cancelled successfully.');
      }

      router.refresh();
      setIsOpen(false);
    } catch (err) {
      console.error('Cancel error:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isOpen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Cancel Booking
          </h3>

          <div className="space-y-4">
            {hasPayment ? (
              <>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Warning:</strong> This booking has a payment of{' '}
                    <strong>{formatPrice(amountPaid!)}</strong>.
                  </p>
                  <p className="text-sm text-yellow-800 mt-2">
                    Do you want to refund the customer and cancel the booking?
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cancellation reason (optional)
                  </label>
                  <textarea
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    rows={3}
                    placeholder="e.g., Customer requested cancellation"
                    disabled={isProcessing}
                  />
                </div>
              </>
            ) : (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm text-orange-800">
                  Are you sure you want to cancel this booking?
                  {paymentStatus === 'pending' && ' (No payment has been made yet)'}
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isProcessing}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Keep Booking
              </button>

              {hasPayment ? (
                <>
                  <button
                    onClick={() => handleCancel(false)}
                    disabled={isProcessing}
                    className="px-4 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
                  >
                    Cancel Without Refund
                  </button>
                  <button
                    onClick={() => handleCancel(true)}
                    disabled={isProcessing}
                    className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Cancel & Refund {formatPrice(amountPaid!)}
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleCancel(false)}
                  disabled={isProcessing}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    'Cancel Booking'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="text-red-600 hover:text-red-900 p-1"
      title="Cancel Booking"
    >
      <X className="w-5 h-5" />
    </button>
  );
}
