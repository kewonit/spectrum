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

    // Get user profile for PCCOE status check - declare once at the top
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (type === 'team' && teamId) {
      // Check if team exists and get team details
      const { data: team } = await supabase
        .from('teams')
        .select(`
          *,
          leader:profiles!teams_leader_id_fkey(
            id,
            is_pccoe_student
          ),
          registrations(*)
        `)
        .eq('id', teamId)
        .single();

      if (!team) {
        return NextResponse.json({ error: "Team not found" }, { status: 404 });
      }

      // Check if team is already registered
      if (team.registrations && team.registrations.length > 0) {
        const activeRegistration = team.registrations.find((r: { registration_status: string }) => 
          r.registration_status !== 'cancelled'
        );
        if (activeRegistration) {
          return NextResponse.json({ 
            success: true,
            message: "Team is already registered for this event"
          });
        }
      }

      // Get accepted team members
      const { data: teamMembers } = await supabase
        .from('team_members')
        .select('member_id, invitation_status')
        .eq('team_id', teamId)
        .eq('invitation_status', 'accepted');

      if (!teamMembers || teamMembers.length === 0) {
        return NextResponse.json({ 
          error: "No accepted team members found"
        }, { status: 400 });
      }

      // If leader is non-PCCOE, verify payment
      if (!team.leader.is_pccoe_student) {
        const requiredAmount = teamMembers.length * 5; // ₹100 per member

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
      const { error: regError } = await supabase
        .from('registrations')
        .insert({
          event_id: eventId,
          team_id: teamId,
          registration_status: 'confirmed',
          payment_status: team.leader.is_pccoe_student ? 'pccoe_coupon' : 'success'
        });

      if (regError) throw regError;

      return NextResponse.json({ 
        success: true,
        message: "Team registration completed successfully"
      });
    }

    // Set payment status based on PCCOE student status
    const paymentStatus = profile?.is_pccoe_student ? 'pccoe_coupon' : 'success';

    // For solo registrations
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

    // For team registrations
    if (type === 'team' && teamId) {
      // First get the team with leader and members
      const { data: team } = await supabase
        .from('teams')
        .select(`
          *,
          leader:profiles!teams_leader_id_fkey(
            id,
            is_pccoe_student
          ),
          team_members!inner(
            member_id,
            invitation_status
          )
        `)
        .eq('id', teamId)
        .single();

      if (!team) {
        return NextResponse.json({ error: "Team not found" }, { status: 404 });
      }

      // Get only accepted members count with proper type checking
      const acceptedMembers = (team.team_members as TeamMember[]).filter(
        (m: TeamMember) => m.invitation_status === 'accepted'
      );
      const memberCount = acceptedMembers.length;

      if (!memberCount) {
        return NextResponse.json({ 
          error: "No accepted team members found" 
        }, { status: 400 });
      }

      // If leader is non-PCCOE, verify payment
      if (!team.leader.is_pccoe_student) {
        const requiredAmount = memberCount * 5; // ₹100 per member

        // Check for successful payment
        const { data: payment } = await supabase
          .from('payments')
          .select('*')
          .eq('team_id', teamId)
          .eq('event_id', eventId)
          .eq('status', 'success')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!payment || payment.amount < requiredAmount) {
          return NextResponse.json({ 
            error: "Payment required",
            required: true,
            requiredAmount,
            message: `Payment of ₹${requiredAmount} required for team registration`
          }, { status: 402 }); // Using 402 Payment Required status
        }
      }

      // If we get here, either payment is verified or not required (PCCOE)
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

      return NextResponse.json({ 
        success: true,
        message: "Team registration completed successfully"
      });
    }

  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to register" },
      { status: 500 }
    );
  }
}

interface TeamMember {
  member_id: string;
  invitation_status: string;
}