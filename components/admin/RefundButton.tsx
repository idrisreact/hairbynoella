'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/pricing';
import { Loader2, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

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

  const handleOpenChange = (open: boolean) => {
    if (isProcessing) return;
    setIsOpen(open);
    if (!open) {
      setError(null);
      setReason('');
    }
  };

  const handleRefund = async () => {
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

      toast.success(`Refund successful — ${formatPrice(data.refund.amount)} refunded.`);
      setIsOpen(false);
      router.refresh();
    } catch (err) {
      console.error('Refund error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process refund');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="Process refund"
          title="Process Refund"
          className="group relative text-purple-600 hover:text-purple-700 p-2 rounded-lg hover:bg-purple-50 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
        >
          <RotateCcw
            className="w-5 h-5 transition-transform group-hover:rotate-180 duration-500"
            aria-hidden="true"
          />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <RotateCcw className="w-6 h-6 text-purple-600" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl mb-1">Process Refund</DialogTitle>
              <DialogDescription>Refund payment and cancel the booking</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5">
          {/* Warning Banner */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 overflow-hidden">
            <div className="flex gap-3 items-start">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold" aria-hidden="true">!</span>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  This action cannot be undone
                </p>
                <p className="text-sm text-gray-700 break-words">
                  {formatPrice(amountPaid)} will be refunded to the customer and the booking will be cancelled.
                </p>
              </div>
            </div>
          </div>

          {/* Reason Input */}
          <div>
            <label
              htmlFor="refund-reason"
              className="block text-sm font-semibold text-gray-900 mb-2"
            >
              Refund Reason <span className="text-gray-600 font-normal">(optional)</span>
            </label>
            <textarea
              id="refund-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm bg-white text-gray-900 placeholder:text-gray-400 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none"
              rows={3}
              placeholder="e.g., Customer requested cancellation, Service unavailable..."
              disabled={isProcessing}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div role="alert" className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          <DialogFooter>
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              disabled={isProcessing}
              className="flex-1 px-5 py-3 text-sm font-semibold border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRefund}
              disabled={isProcessing}
              className="flex-1 px-5 py-3 text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg shadow-purple-500/25 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                  <span>Refund {formatPrice(amountPaid)}</span>
                </>
              )}
            </button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
