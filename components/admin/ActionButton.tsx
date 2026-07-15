"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export type ActionResult = { success: boolean; message: string };

interface ActionButtonProps {
  /** Bound server action or client async function returning an ActionResult. */
  action: () => Promise<ActionResult>;
  /** When provided, an accessible confirmation dialog gates the action. */
  confirm?: { title: string; description: string; actionLabel: string };
  className?: string;
  "aria-label": string;
  title?: string;
  children: React.ReactNode;
}

export default function ActionButton({
  action,
  confirm,
  className,
  children,
  ...rest
}: ActionButtonProps) {
  const [isPending, startTransition] = useTransition();

  const run = () =>
    startTransition(async () => {
      try {
        const result = await action();
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });

  const button = (
    <button
      type="button"
      disabled={isPending}
      onClick={confirm ? undefined : run}
      className={className}
      {...rest}
    >
      {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> : children}
    </button>
  );

  if (!confirm) return button;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{button}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{confirm.title}</AlertDialogTitle>
          <AlertDialogDescription>{confirm.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={run}>{confirm.actionLabel}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
