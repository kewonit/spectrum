"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { load } from "@cashfreepayments/cashfree-js";
import { useRouter } from 'next/navigation';

interface PaymentButtonProps {
  eventId: string;
  teamId?: string;
  type: 'solo' | 'team';
  amount: number;
  onSuccess?: () => void;
  disabled?: boolean;
}

export default function PaymentButton({
  eventId,
  teamId,
  type,
  amount,
  onSuccess,
  disabled
}: PaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePayment = async () => {
    if (amount <= 0) {
      toast.error("Invalid payment amount");
      return;
    }

    try {
      setIsLoading(true);
      const toastId = toast.loading("Initializing payment...");
      
      const response = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          eventId, 
          teamId, 
          type,
          amount
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to initiate payment");
      }

      const { paymentSessionId } = await response.json();
      toast.dismiss(toastId);

      const cashfree = await load({
        mode: process.env.NODE_ENV === "production" ? "production" : "production"
      });

      await cashfree.checkout({
        paymentSessionId,
        returnUrl: window.location.origin + "/dashboard/events/registrations",
        redirectTarget: "_self",
        onPaymentSuccess: (data) => {
          console.log("Payment success", data);
          if (onSuccess) onSuccess();
        },
        onPaymentFailure: (data) => {
          console.error("Payment failed", data);
          toast.error("Payment failed", {
            description: "Please try again"
          });
        },
        onError: (error) => {
          console.error("Payment error", error);
          toast.error("Payment failed", {
            description: "An error occurred"
          });
        },
        onPaymentCancel: () => {
          toast.error("Payment cancelled");
        }
      });

      // After successful payment
      if (onSuccess) {
        await onSuccess();
      }
      
      // Redirect to registrations page
      router.push('/dashboard/events/registrations');

    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error("Payment failed", {
        description: error.message || "Please try again"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || isLoading || amount <= 0}
      className="w-full"
      variant="secondary"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        `Pay ₹${amount.toFixed(2)} to Complete Registration`
      )}
    </Button>
  );
}
