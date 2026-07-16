"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";
import { formatPrice } from "@/lib/pricing";
import { AUTO_REFUND_CUTOFF_HOURS } from "@/lib/booking-policy";

interface CancelBookingSectionProps {
    token: string;
    refundEligible: boolean;
    depositPaid: number;
}

export const CancelBookingSection = ({
    token,
    refundEligible,
    depositPaid,
}: CancelBookingSectionProps) => {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    // Inline error state — the public pages have no toast provider.
    const [error, setError] = useState<string | null>(null);

    const hasDeposit = depositPaid > 0;

    const handleCancel = async () => {
        setIsCancelling(true);
        setError(null);
        try {
            const res = await fetch("/api/bookings/cancel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error ?? "Something went wrong — please try again.");
                return;
            }
            setOpen(false);
            router.refresh();
        } catch {
            setError("Something went wrong — please check your connection and try again.");
        } finally {
            setIsCancelling(false);
        }
    };

    return (
        <div className="mb-8">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <p className="text-sm text-gray-700 mb-4">
                    {refundEligible
                        ? hasDeposit
                            ? `Need to cancel? Your ${formatPrice(depositPaid)} deposit will be refunded in full.`
                            : "Need to cancel? You can cancel this booking online."
                        : hasDeposit
                        ? `You can still cancel online, but as your appointment is within ${AUTO_REFUND_CUTOFF_HOURS} hours, your ${formatPrice(depositPaid)} deposit is non-refundable.`
                        : "You can cancel this booking online."}
                </p>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <button
                            type="button"
                            className="px-8 py-3 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                        >
                            Cancel booking
                        </button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Cancel this booking?</DialogTitle>
                            <DialogDescription>
                                {refundEligible
                                    ? hasDeposit
                                        ? `Your ${formatPrice(depositPaid)} deposit will be refunded to your original payment method. This cannot be undone.`
                                        : "Your appointment will be cancelled. This cannot be undone."
                                    : hasDeposit
                                    ? `Cancelling now means your ${formatPrice(depositPaid)} deposit will not be refunded. This cannot be undone — continue?`
                                    : "Your appointment will be cancelled. This cannot be undone."}
                            </DialogDescription>
                        </DialogHeader>
                        {error && (
                            <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                                {error}
                            </p>
                        )}
                        <DialogFooter>
                            <DialogClose asChild>
                                <button
                                    type="button"
                                    disabled={isCancelling}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    Keep booking
                                </button>
                            </DialogClose>
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={isCancelling}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {isCancelling && (
                                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                                )}
                                {isCancelling ? "Cancelling…" : "Yes, cancel booking"}
                            </button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};
