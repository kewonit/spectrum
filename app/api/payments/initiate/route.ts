import { NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";
import { generateOrderId } from "@/app/lib/payment";
import { Cashfree } from '@/app/lib/cashfree';

// Add interface for team member
interface TeamMember {
  id: string;
  invitation_status: 'pending' | 'accepted' | 'rejected';
}

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
      // Get team details including ALL members (both accepted and pending)
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
        .single();

      if (!team) {
        return NextResponse.json({ error: "Team not found" }, { status: 404 });
      }

      // Verify user is team leader
      if (team.leader_id !== user.id) {
        return NextResponse.json({ error: "Only team leader can make payment" }, { status: 403 });
      }

      // Count both accepted and pending members
      const totalMembers = team.team_members.length;
      const requiredAmount = totalMembers * 100; // ₹100 per member (including pending)

      if (amount !== requiredAmount) {
        const acceptedCount = (team.team_members as TeamMember[])
          .filter((m: TeamMember) => m.invitation_status === 'accepted').length;
        const pendingCount = (team.team_members as TeamMember[])
          .filter((m: TeamMember) => m.invitation_status === 'pending').length;
        
        return NextResponse.json({ 
          error: "Invalid payment amount",
          requiredAmount,
          details: {
            acceptedMembers: acceptedCount,
            pendingMembers: pendingCount,
            totalMembers,
            perMemberAmount: 100
          },
          message: `Payment must cover all team members (₹100 × ${totalMembers} members = ₹${requiredAmount})`
        }, { status: 400 });
      }

      // Lock the team to prevent new invitations during payment
      const { error: lockError } = await supabase
        .from('teams')
        .update({ registration_locked: true })
        .eq('id', teamId);

      if (lockError) {
        console.error("Failed to lock team:", lockError);
        // Continue anyway, not critical
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

    // Initialize Cashfree with enhanced logging
    const isProduction = process.env.NODE_ENV === 'production';
    const appId = isProduction 
      ? process.env.CASHFREE_APP_ID_PROD 
      : process.env.CASHFREE_APP_ID_DEV;
    const secretKey = isProduction 
      ? process.env.CASHFREE_SECRET_KEY_PROD 
      : process.env.CASHFREE_SECRET_KEY_DEV;

    // Log credential state before validation
    console.log('Cashfree initialization:', {
      environment: process.env.NODE_ENV,
      hasAppId: !!appId,
      hasSecretKey: !!secretKey,
      appIdPrefix: appId?.substring(0, 4),
      timestamp: new Date().toISOString()
    });

    if (!appId || !secretKey) {
      throw new Error("Missing or invalid Cashfree credentials.");
    }

    const cashfree = new Cashfree(appId, secretKey);
    console.log('Initializing Cashfree payment:', {
      environment: isProduction ? 'production' : 'development',
      orderId,
      hasCredentials: !!appId && !!secretKey
    });

    // Ensure HTTPS for return URL
    const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const safeAppUrl = rawAppUrl.startsWith('https://')
      ? rawAppUrl
      : rawAppUrl.replace('http://', 'https://');

    // Add order ID to return URL for tracking
    const returnUrl = `${safeAppUrl}/dashboard/events/registrations?order_id=${orderId}`;

    // Add error handling for payment session
    const paymentSession = await cashfree.createPaymentSession({
      orderId,
      amount,
      currency: "INR",
      customerDetails: {
        customerId: user.id,  // Ensure this is always set
        customerEmail: profile.email || user.email || '',
        customerPhone: profile.phone?.replace(/\D/g, '') || '0000000000', // Remove non-digits
        customerName: profile.full_name || user.email?.split('@')[0] || 'Guest'
      },
      returnUrl
    });

    // Update database with session details
    await supabase
      .from('payments')
      .update({
        payment_session_id: paymentSession.payment_session_id,
        metadata: {
          ...payment.metadata,
          session_details: paymentSession.data
        }
      })
      .eq('id', payment.id);

    return NextResponse.json({
      orderId,
      paymentSessionId: paymentSession.payment_session_id,
      amount,
      environment: process.env.NODE_ENV,
      sessionData: paymentSession.data
    });

  } catch (error: any) {
    // Enhanced error logging
    console.error("Payment initiation error:", {
      message: error.message,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      hasDevCreds: !!process.env.CASHFREE_APP_ID_DEV && !!process.env.CASHFREE_SECRET_KEY_DEV,
      hasProdCreds: !!process.env.CASHFREE_APP_ID_PROD && !!process.env.CASHFREE_SECRET_KEY_PROD,
      credentialCheck: {
        appIdDev: process.env.CASHFREE_APP_ID_DEV?.substring(0, 4),
        appIdProd: process.env.CASHFREE_APP_ID_PROD?.substring(0, 4)
      }
    });

    return NextResponse.json(
      {
        error: error.message || "Failed to initiate payment",
        code: error.code || 'UNKNOWN_ERROR',
        timestamp: new Date().toISOString()
      },
      { status: error.status || 500 }
    );
  }
}
