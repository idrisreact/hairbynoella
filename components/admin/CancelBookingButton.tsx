'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/pricing';
import { Loader2, X, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

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

  const handleOpenChange = (open: boolean) => {
    if (isProcessing) return;
    setIsOpen(open);
    if (!open) {
      setError(null);
      setRefundReason('');
    }
  };

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

        toast.success(
          `Refund successful — ${formatPrice(refundData.refund.amount)} refunded and booking cancelled.`
        );
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

        toast.success('Booking cancelled.');
      }

      setIsOpen(false);
      router.refresh();
    } catch (err) {
      console.error('Cancel error:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="Cancel booking"
          title="Cancel Booking"
          className="text-red-600 hover:text-red-900 p-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" aria-hidden="true" />
            Cancel Booking
          </DialogTitle>
        </DialogHeader>

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
                <label
                  htmlFor="cancellation-reason"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Cancellation reason (optional)
                </label>
                <textarea
                  id="cancellation-reason"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
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
            <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <DialogFooter>
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              disabled={isProcessing}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
            >
              Keep Booking
            </button>

            {hasPayment ? (
              <>
                <button
                  type="button"
                  onClick={() => handleCancel(false)}
                  disabled={isProcessing}
                  className="px-4 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
                >
                  Cancel Without Refund
                </button>
                <button
                  type="button"
                  onClick={() => handleCancel(true)}
                  disabled={isProcessing}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      Processing...
                    </>
                  ) : (
                    <>Cancel &amp; Refund {formatPrice(amountPaid!)}</>
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => handleCancel(false)}
                disabled={isProcessing}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    Cancelling...
                  </>
                ) : (
                  'Cancel Booking'
                )}
              </button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
