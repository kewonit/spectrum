import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
    }

    // Get team details with leader info
    const { data: team } = await supabase
      .from('teams')
      .select(`
        *,
        leader:profiles!teams_leader_id_fkey(
          id,
          is_pccoe_student
        ),
        team_members!inner(
          id,
          invitation_status
        )
      `)
      .eq('id', teamId)
      .eq('team_members.invitation_status', 'accepted')
      .single();

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // If leader is PCCOE student, no payment required
    if (team.leader.is_pccoe_student) {
      return NextResponse.json({ required: false });
    }

    // Calculate required amount
    const memberCount = team.team_members.length;
    const requiredAmount = memberCount * 5;

    // Check for successful payment
    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('team_id', teamId)
      .eq('status', 'success')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!payment) {
      return NextResponse.json({
        error: "Payment required",
        required: true,
        requiredAmount,
        message: `Payment of ₹${requiredAmount} required for team registration`
      }, { status: 400 });
    }

    // Verify payment amount matches team size
    if (payment.amount < requiredAmount) {
      return NextResponse.json({
        error: "Insufficient payment",
        required: true,
        requiredAmount,
        paidAmount: payment.amount,
        message: `Additional payment of ₹${requiredAmount - payment.amount} required`
      }, { status: 400 });
    }

    return NextResponse.json({
      required: false,
      status: 'success',
      payment: {
        id: payment.id,
        amount: payment.amount,
        status: payment.status
      }
    });

  } catch (error: any) {
    console.error("Payment check error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check payment status" },
      { status: 500 }
    );
  }
}
