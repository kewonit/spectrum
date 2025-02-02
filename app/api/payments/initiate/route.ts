import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";
import { getUserProfile } from "@/app/lib/payment";

interface TeamMemberResponse {
  profiles: {
    is_pccoe_student: boolean;
  };
}

export async function POST(request: Request) {
  const supabase = await createClient();
  
  try {
    const { eventId, teamId, type } = await request.json();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user profile
    const profile = await getUserProfile(supabase, user.id);
    if (!profile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 400 });
    }

    // Calculate amount
    let amount = 0;
    if (type === 'team' && teamId) {
      const { data: members } = await supabase
        .from('team_members')
        .select(`
          profiles (
            is_pccoe_student
          )
        `)
        .eq('team_id', teamId)
        .eq('invitation_status', 'accepted')
        .returns<TeamMemberResponse[]>();

      if (!members) throw new Error("Failed to fetch team members");
      
      const nonPccoeCount = members.filter(
        m => !m.profiles.is_pccoe_student
      ).length;
      
      amount = nonPccoeCount * 100;
    } else {
      amount = 100; // For solo registration
    }

    if (amount === 0) {
      throw new Error("Invalid payment amount");
    }

    const orderId = `ORD_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Create Cashfree order with proper customer details
    const response = await fetch("https://sandbox.cashfree.com/pg/orders", {
      method: "POST",
      headers: {
        "x-client-id": process.env.CASHFREE_APP_ID!,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY!,
        "x-api-version": "2023-08-01",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: amount,
        order_currency: "INR",
        customer_details: {
          customer_id: user.id,
          customer_name: profile.full_name || undefined,
          customer_email: profile.email || user.email,
          customer_phone: profile.phone || undefined
        },
        order_meta: {
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/events/payment?order_id={order_id}`
        }
      })
    });

    if (!response.ok) {
      throw new Error("Failed to create payment order");
    }

    const paymentData = await response.json();

    // Store payment record
    await supabase
      .from('payments')
      .insert({
        order_id: orderId,
        user_id: user.id,
        team_id: teamId,
        event_id: eventId,
        amount: amount,
        cf_order_id: paymentData.cf_order_id,
        status: 'pending'
      });

    return NextResponse.json({
      paymentSessionId: paymentData.payment_session_id,
      orderId,
      amount
    });

  } catch (error: any) {
    console.error("Payment initiation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initiate payment" },
      { status: 500 }
    );
  }
}
