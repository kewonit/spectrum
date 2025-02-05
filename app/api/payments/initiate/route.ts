import { NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";
import { generateOrderId } from "@/app/lib/payment";
import { Cashfree } from '@/app/lib/cashfree';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, teamId, type, amount } = await request.json();

    // First create registration record
    const { data: registration, error: registrationError } = await supabase
      .from('registrations')
      .insert({
        event_id: eventId,
        team_id: type === 'team' ? teamId : null,
        individual_id: type === 'solo' ? user.id : null,
        registration_status: 'pending',
        payment_status: 'pending'
      })
      .select()
      .single();

    if (registrationError) {
      throw new Error(`Failed to create registration: ${registrationError.message}`);
    }

    // Validate payment amount for team
    if (type === 'team' && teamId) {
      // Get team details
      const { data: team } = await supabase
        .from('teams')
        .select(`
          *,
          leader:profiles!teams_leader_id_fkey(*),
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

      // Verify user is team leader
      if (team.leader_id !== user.id) {
        return NextResponse.json({ error: "Only team leader can make payment" }, { status: 403 });
      }

      // Calculate required amount
      const memberCount = team.team_members.length;
      const requiredAmount = memberCount * 100; // ₹100 per member

      if (amount !== requiredAmount) {
        return NextResponse.json({ 
          error: "Invalid payment amount",
          requiredAmount,
          message: `Payment amount must be ₹${requiredAmount}`
        }, { status: 400 });
      }
    }

    // Get user profile for payment details
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Generate order ID
    const orderId = await generateOrderId();

    // Create payment record with registration_id
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        order_id: orderId,
        user_id: user.id,
        team_id: teamId,
        event_id: eventId,
        amount: amount,
        status: 'pending',
        registration_id: registration.id // Link to registration
      })
      .select()
      .single();

    if (paymentError || !payment) {
      // Cleanup registration if payment creation fails
      await supabase
        .from('registrations')
        .delete()
        .eq('id', registration.id);
      
      throw paymentError || new Error('Failed to create payment record');
    }

    // Format profile data for Cashfree
    const sanitizedProfile = {
      email: profile.email?.toLowerCase() || user.email?.toLowerCase(),
      phone: (profile.phone || '')?.replace(/\D/g, ''),
      name: (profile.full_name || 'User')
        .trim()
        .replace(/[^A-Za-z\s]/g, '')
        .replace(/\s+/g, ' ')
        .slice(0, 50)
    };

    // Validate required fields
    if (!sanitizedProfile.email || !sanitizedProfile.phone) {
      return NextResponse.json({ 
        error: "Incomplete profile", 
        message: "Please update your profile with valid email and phone number"
      }, { status: 400 });
    }

    if (sanitizedProfile.phone.length !== 10) {
      return NextResponse.json({ 
        error: "Invalid phone number", 
        message: "Please provide a valid 10-digit phone number" 
      }, { status: 400 });
    }

    // Initialize Cashfree payment session with sanitized data
    const cashfree = new Cashfree(process.env.CASHFREE_APP_ID!, process.env.CASHFREE_SECRET_KEY!);
    const paymentSession = await cashfree.createPaymentSession({
      orderId: orderId,
      amount: amount,
      currency: "INR",
      customerDetails: {
        customerId: user.id,
        customerEmail: sanitizedProfile.email,
        customerPhone: sanitizedProfile.phone,
        customerName: sanitizedProfile.name
      },
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/events/registrations`
    });

    return NextResponse.json({
      orderId: orderId,
      paymentSessionId: paymentSession.payment_session_id,
      amount: amount
    });

  } catch (error: any) {
    console.error("Payment initiation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initiate payment" },
      { status: 500 }
    );
  }
}
