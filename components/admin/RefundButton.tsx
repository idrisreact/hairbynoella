'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/pricing';
import { Loader2, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RefundButtonProps {
  bookingId: string;
  paymentIntentId: string;
  amountPaid: number; // In pence
}

export default function RefundButton({
  bookingId,
  paymentIntentId,
  amountPaid,
}: RefundButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleRefund = async () => {
    if (!confirm(`Are you sure you want to refund ${formatPrice(amountPaid)}?`)) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/refunds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          paymentIntentId,
          reason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Refund failed');
      }

      // Success - refresh the page
      alert(`Refund successful! ${formatPrice(data.refund.amount)} has been refunded.`);
      router.refresh();
      setIsOpen(false);
    } catch (err) {
      console.error('Refund error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process refund');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isOpen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-semibold mb-4">Process Refund</h3>

          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> This will refund {formatPrice(amountPaid)} to the customer
                and cancel the booking.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for refund (optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
                rows={3}
                placeholder="e.g., Customer requested cancellation"
                disabled={isProcessing}
              />
            </div>

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
                Cancel
              </button>
              <button
                onClick={handleRefund}
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
                    <RotateCcw className="w-4 h-4" />
                    Refund {formatPrice(amountPaid)}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="text-purple-600 hover:text-purple-900 p-1"
      title="Process Refund"
    >
      <RotateCcw className="w-5 h-5" />
    </button>
  );
}
