import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";
import { slugify } from "@/app/utils/slugify";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventSlug = searchParams.get("name");

    if (!eventSlug) {
      return NextResponse.json({ error: "Event name is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: events, error } = await supabase
      .from("events")
      .select("*");

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Find the event by comparing slugified names
    const event = events.find(e => slugify(e.name) === eventSlug);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { eventId, type, teamId } = await request.json();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Comprehensive registration check specific to type
    if (type === 'solo') {
      // Check for existing registration first
      const { data: existingSolo } = await supabase
        .from('registrations')
        .select('registration_status')
        .eq('event_id', eventId)
        .eq('individual_id', user.id)
        .not('registration_status', 'eq', 'cancelled')
        .maybeSingle();

      if (existingSolo) {
        return NextResponse.json({
          success: true,
          message: "You're registered!\n\nRegistration successful. Good luck!\n\nView your registrations at /dashboard/events/registrations"
        });
      }

      // Get user profile for PCCOE status check
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_pccoe_student')
        .eq('id', user.id)
        .single();

      // For non-PCCOE students, verify payment
      if (!profile?.is_pccoe_student) {
        const { data: payment } = await supabase
          .from('payments')
          .select('status')
          .eq('user_id', user.id)
          .eq('event_id', eventId)
          .eq('status', 'success')
          .maybeSingle();

        if (!payment) {
          return NextResponse.json({
            error: "Payment required",
            message: "Payment of ₹100 required for registration"
          }, { status: 400 });
        }
      }

      // Create the registration
      const { error: regError } = await supabase
        .from('registrations')
        .insert({
          event_id: eventId,
          individual_id: user.id,
          registration_status: 'confirmed',
          payment_status: profile?.is_pccoe_student ? 'pccoe_coupon' : 'success'
        });

      if (regError) throw regError;

      return NextResponse.json({
        success: true,
        message: "You're registered!\n\nRegistration successful. Good luck!\n\nView your registrations at /dashboard/events/registrations"
      });
    } else {
      // Team registration checks
      const { data: existingRegistrations } = await supabase
        .from('registrations')
        .select(`
          *,
          teams!left (
            id,
            team_members!team_members_team_id_fkey (
              member_id,
              invitation_status
            )
          )
        `)
        .or(`individual_id.eq.${user.id},teams.team_members.member_id.eq.${user.id}`)
        .eq('event_id', eventId)
        .in('registration_status', ['pending', 'confirmed']);

      if (existingRegistrations && existingRegistrations.length > 0) {
        return NextResponse.json({
          error: "Already registered",
          message: "You already have a registration (pending or confirmed) for this event",
          registration: existingRegistrations[0]
        }, { status: 400 });
      }

      // Additional check for team memberships
      const { data: teamMembership } = await supabase
        .from('team_members')
        .select('teams!inner(event_id)')
        .eq('member_id', user.id)
        .eq('teams.event_id', eventId)
        .eq('invitation_status', 'accepted')
        .single();

      if (teamMembership) {
        return NextResponse.json({
          error: "Already in team",
          message: "You are already part of a team for this event"
        }, { status: 400 });
      }
    }

    // Get user profile for PCCOE status check
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Set payment status based on PCCOE student status
    const paymentStatus = profile?.is_pccoe_student ? 'pccoe_coupon' : 'success';

    // For solo registrations, do an additional specific check
    if (type === 'solo') {
      const { data: soloCheck } = await supabase
        .from('registrations')
        .select('registration_status')
        .eq('event_id', eventId)
        .eq('individual_id', user.id)
        .not('registration_status', 'eq', 'cancelled')
        .single();

      if (soloCheck) {
        return NextResponse.json({
          success: true,
          message: "You're registered!\n\nRegistration successful. Good luck!\n\nView your registrations at /dashboard/events/registrations"
        }, { status: 200 });
      }

      // For solo registrations, verify payment for non-PCCOE students
      if (!profile?.is_pccoe_student) {
        const { data: payment } = await supabase
          .from('payments')
          .select('*')
          .eq('user_id', user.id)
          .eq('event_id', eventId)
          .eq('status', 'success')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!payment) {
          return NextResponse.json({
            error: "Payment required",
            message: "Payment of ₹100 required for registration"
          }, { status: 400 });
        }
      }

      // Handle solo registration
      const registration = {
        event_id: eventId,
        registration_status: 'confirmed',
        payment_status: paymentStatus,
        individual_id: user.id
      };

      const { error: regError } = await supabase
        .from('registrations')
        .insert(registration);

      if (regError) throw regError;

      return NextResponse.json({ success: true });
    }

    // For team registrations
    if (type === 'team' && teamId) {
      // First get the team with leader and payment details
      const { data: team } = await supabase
        .from('teams')
        .select(`
          *,
          leader:profiles!teams_leader_id_fkey(
            id,
            is_pccoe_student
          ),
          payments(
            id,
            amount,
            status
          )
        `)
        .eq('id', teamId)
        .single();

      if (!team) {
        return NextResponse.json({ error: "Team not found" }, { status: 404 });
      }

      // Get accepted team members count
      const { count: memberCount } = await supabase
        .from('team_members')
        .select('*', { count: 'exact' })
        .eq('team_id', teamId)
        .eq('invitation_status', 'accepted');

      if (!memberCount) {
        return NextResponse.json({ 
          error: "No team members found" 
        }, { status: 400 });
      }

      // If leader is non-PCCOE, verify payment
      if (!team.leader.is_pccoe_student) {
        const requiredAmount = memberCount * 100; // ₹100 per member

        // Get latest successful payment
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
            requiredAmount,
            message: `Payment of ₹${requiredAmount} required for team registration`
          }, { status: 400 });
        }

        if (payment.amount < requiredAmount) {
          return NextResponse.json({ 
            error: "Insufficient payment",
            requiredAmount,
            paidAmount: payment.amount,
            message: `Additional payment of ₹${requiredAmount - payment.amount} required`
          }, { status: 400 });
        }
      }

      // Create registration with appropriate payment status
      const registration = {
        event_id: eventId,
        team_id: teamId,
        registration_status: 'confirmed',
        payment_status: team.leader.is_pccoe_student ? 'pccoe_coupon' : 'success'
      };

      const { error: regError } = await supabase
        .from('registrations')
        .insert(registration);

      if (regError) throw regError;

      return NextResponse.json({ success: true });
    }

  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to register" },
      { status: 500 }
    );
  }
}