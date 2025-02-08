import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const { orderId, paymentStatus, teamId } = await request.json();

    if (!orderId || !paymentStatus || !teamId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Start transaction for payment processing and member approval
    const { error: processingError } = await supabase.rpc('process_team_payment_and_approve', {
      p_order_id: orderId,
      p_team_id: teamId,
      p_payment_status: paymentStatus
    });

    if (processingError) {
      console.error('Payment processing error:', processingError);
      return NextResponse.json(
        { error: "Failed to process payment" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified and all pending members approved"
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
