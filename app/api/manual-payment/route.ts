import { createClient } from "@/app/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  
  try {
    const { eventId, transactionNumber, amountPaid, screenshotUrl, teamId } = await request.json();

    if (!eventId || !transactionNumber || !amountPaid || !screenshotUrl) {
      return NextResponse.json(
        { error: "Missing required fields" }, 
        { status: 400 }
      );
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Begin transaction
    let registration;
    
    if (teamId) {
      // Team registration
      const { data: reg, error: regError } = await supabase
        .from('registrations')
        .insert({
          event_id: eventId,
          team_id: teamId,
          registration_status: 'confirmed',
          payment_status: 'success'
        })
        .select()
        .single();

      if (regError) throw regError;
      registration = reg;

      // Auto-accept all pending invitations
      const { error: updateError } = await supabase
        .from('team_members')
        .update({ invitation_status: 'accepted' })
        .eq('team_id', teamId)
        .eq('invitation_status', 'pending');

      if (updateError) throw updateError;

      // Lock the team for further registrations
      const { error: teamError } = await supabase
        .from('teams')
        .update({ registration_locked: true })
        .eq('id', teamId);

      if (teamError) throw teamError;
    } else {
      // Individual registration
      const { data: reg, error: regError } = await supabase
        .from('registrations')
        .insert({
          event_id: eventId,
          individual_id: user.id,
          registration_status: 'confirmed',
          payment_status: 'success'
        })
        .select()
        .single();

      if (regError) throw regError;
      registration = reg;
    }

    // Insert manual payment record
    const { error: paymentError } = await supabase
      .from('manual_payments')
      .insert({
        user_id: user.id,
        event_id: eventId,
        team_id: teamId,
        registration_id: registration.id,
        transaction_number: transactionNumber,
        amount_paid: amountPaid,
        screenshot_url: screenshotUrl
      });

    if (paymentError) throw paymentError;

    return NextResponse.json({ 
      success: true,
      message: "Registration completed successfully",
      registration_id: registration.id
    });

  } catch (error: any) {
    console.error("Manual payment error:", error);

    // If error occurs, attempt to rollback
    if (error.registration_id) {
      await supabase
        .from('registrations')
        .delete()
        .eq('id', error.registration_id);
    }

    return NextResponse.json(
      { error: error.message || "Manual payment processing failed" },
      { status: 500 }
    );
  }
}
