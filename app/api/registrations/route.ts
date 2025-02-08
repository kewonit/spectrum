import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";
import { slugify } from "@/app/utils/slugify";

// Add this utility function after the imports
async function removePendingInvites(supabase: any, teamId: string) {
  try {
    // Get all pending invites for the team
    const { data: pendingInvites } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', teamId)
      .eq('invitation_status', 'pending');

    if (pendingInvites && pendingInvites.length > 0) {
      // Delete all pending invites
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('invitation_status', 'pending');

      if (error) throw error;
    }
  } catch (error) {
    console.error("Error removing pending invites:", error);
    // Don't throw error, just log it to prevent blocking registration
  }
}

// Add this utility function alongside removePendingInvites
async function preventNewRegistrations(supabase: any, teamId: string) {
  try {
    // Update team status to prevent new registrations
    const { error } = await supabase
      .from('teams')
      .update({ registration_locked: true })
      .eq('id', teamId);

    if (error) throw error;
  } catch (error) {
    console.error("Error locking team registrations:", error);
  }
}

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

    // Get event details at the beginning
    const { data: eventDetails } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (!eventDetails) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

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
        const requiredAmount = teamMembers.length * 100; // ₹100 per member

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

    // For team registrations, check total member count (accepted + pending)
    if (type === 'team' && teamId) {
      // Get both accepted and pending members
      const { data: allMembers } = await supabase
        .from('team_members')
        .select('invitation_status')
        .eq('team_id', teamId);

      const totalMembers = allMembers?.length || 0;
      
      // For non-PCCOE teams, verify payment for total members
      if (!profile?.is_pccoe_student) {
        const totalAmount = totalMembers * 100; // ₹100 per member

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
            requiredAmount: totalAmount,
            message: `Payment of ₹${totalAmount} required for team registration (includes pending invitations)`
          }, { status: 402 });
        }

        if (payment.amount < totalAmount) {
          return NextResponse.json({ 
            error: "Insufficient payment",
            requiredAmount: totalAmount,
            paidAmount: payment.amount,
            message: `Additional payment of ₹${totalAmount - payment.amount} required`
          }, { status: 402 });
        }

        // If payment is verified, approve all pending members
        if (payment.status === 'success') {
          await supabase
            .from('team_members')
            .update({ invitation_status: 'accepted' })
            .eq('team_id', teamId)
            .eq('invitation_status', 'pending');
        }
      }

      if (totalMembers < eventDetails.min_team_size) {
        return NextResponse.json({
          error: "Not enough team members",
          message: `Team needs at least ${eventDetails.min_team_size} members (including pending invitations)`
        }, { status: 400 });
      }

      // For non-PCCOE teams, prepare registration data
      if (!profile?.is_pccoe_student) {
        const totalAmount = totalMembers * 100; // ₹100 per member
        return NextResponse.json({
          error: "Payment required",
          required: true,
          requiredAmount: totalAmount,
          message: `Payment of ₹${totalAmount} required for team registration`
        }, { status: 402 });
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
          ),
          registration_locked
        `)
        .eq('id', teamId)
        .single();

      if (!team) {
        return NextResponse.json({ error: "Team not found" }, { status: 404 });
      }

      // Check if team is locked for registration
      if (team.registration_locked) {
        return NextResponse.json({ 
          error: "Team registration locked",
          message: "This team is no longer accepting new members as payment has been initiated"
        }, { status: 400 });
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
        // Get ALL team members (accepted + pending)
        const { data: allMembers } = await supabase
          .from('team_members')
          .select('invitation_status')
          .eq('team_id', teamId);

        const totalMembers = allMembers?.length || 0;
        const requiredAmount = totalMembers * 100; // ₹100 per member

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
          const acceptedCount = allMembers?.filter(m => m.invitation_status === 'accepted').length || 0;
          const pendingCount = allMembers?.filter(m => m.invitation_status === 'pending').length || 0;
          
          return NextResponse.json({ 
            error: "Payment required",
            requiredAmount,
            details: {
              acceptedMembers: acceptedCount,
              pendingMembers: pendingCount,
              totalMembers,
              perMemberAmount: 100,
              totalAmount: requiredAmount
            },
            message: `Payment of ₹${requiredAmount} required for team registration (includes ${pendingCount} pending invitations)`
          }, { status: 402 });
        }

        if (payment.amount < requiredAmount) {
          return NextResponse.json({ 
            error: "Insufficient payment",
            requiredAmount,
            paidAmount: payment.amount,
            message: `Additional payment of ₹${requiredAmount - payment.amount} required`
          }, { status: 402 });
        }

        // If payment is successful, automatically accept all pending invitations
        if (payment.status === 'success') {
          const { error: updateError } = await supabase
            .from('team_members')
            .update({ invitation_status: 'accepted' })
            .eq('team_id', teamId)
            .eq('invitation_status', 'pending');

          if (updateError) {
            console.error("Failed to update pending members:", updateError);
          }
        }
      } else {
        // For PCCOE teams, also remove pending invites before registration
        await removePendingInvites(supabase, teamId);
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