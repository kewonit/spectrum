"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { load } from "@cashfreepayments/cashfree-js";

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

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      
      // 1. Initialize Cashfree
      const cashfree = await load({
        mode: "sandbox" // Change to production in prod
      });

      // 2. Create payment order
      const response = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, teamId, type })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to initiate payment");
      }

      const { paymentSessionId } = await response.json();

      // 3. Open Cashfree checkout
      await cashfree.checkout({
        paymentSessionId,
        returnUrl: `${window.location.origin}/dashboard/events/payment`,
        redirectTarget: "_self",
      });

    } catch (error: any) {
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
      disabled={disabled || isLoading}
      className="w-full bg-green-600 hover:bg-green-700"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing Payment...
        </>
      ) : (
        `Pay ₹${amount.toFixed(2)}`
      )}
    </Button>
  );
}
