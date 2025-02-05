import { createClient } from "@/app/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { TeamMember } from "@/app/types/events";

type InvitationStatus = 'pending' | 'accepted' | 'rejected';

interface TeamMemberData {
  id: string;
  invitation_status: InvitationStatus;
  member_email: string;
  profiles?: {
    id: string;
    email: string;
    full_name: string | null;
  } | null;
}

interface TeamQueryResult {
  teams: {
    event_id: string;
    team_name: string;
  }
}

interface TeamData {
  event_id: string;
  leader_id: string;
  profiles: {
    is_pccoe_student: boolean;
  } | null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const supabase = await createClient();
  const { teamId } = await params;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: team } = await supabase
      .from('teams')
      .select('*, events(max_team_size), leader_id')
      .eq('id', teamId)
      .single();

    const { data: members } = await supabase
      .from('team_members')
      .select(`
        id,
        invitation_status,
        member_email,
        profiles:member_id (
          id,
          email,
          full_name
        )
      `)
      .eq('team_id', teamId)
      .order('created_at', { ascending: true }) as { data: TeamMemberData[] | null };

    if (!members) {
      return NextResponse.json({ 
        members: [],
        pendingCount: 0,
        maxTeamSize: team?.events?.max_team_size
      });
    }

    const formattedMembers: TeamMember[] = members.map(m => ({
      id: m.id,
      email: m.profiles?.email || m.member_email,
      name: m.profiles?.full_name || null,
      status: m.invitation_status as InvitationStatus,
      isRegistered: !!m.profiles,
      isLeader: team?.leader_id === m.profiles?.id
    }));

    return NextResponse.json({
      members: formattedMembers,
      pendingCount: formattedMembers.filter(m => m.status === 'pending').length,
      maxTeamSize: team?.events?.max_team_size
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const supabase = await createClient();
  const { teamId } = await params;

  try {
    const { action } = await req.json();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's complete profile
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('*, email')
      .eq('id', user.id)
      .single();

    // Get team details including event info, leader profile, and current members
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .select(`
        *,
        events!inner (*),
        profiles!leader_id (
          id,
          email,
          is_pccoe_student,
          full_name
        ),
        team_members!inner (
          invitation_status
        ),
        registrations!left (
          registration_status,
          payment_status
        )
      `)
      .eq('id', teamId)
      .single();

    if (teamError) {
      console.error("Team fetch error:", teamError);
      return NextResponse.json({ 
        error: "team_not_found",
        message: "The team you're trying to join doesn't exist or was deleted" 
      }, { status: 404 });
    }

    // Validate team membership rules
    if (action === 'accept') {
      // Check if team has already registered
      const hasConfirmedRegistration = teamData.registrations?.some(
        (reg: { registration_status: string; payment_status: string }) => 
          reg.registration_status === 'confirmed' || 
          ['success', 'pccoe_coupon'].includes(reg.payment_status)
      );

      if (hasConfirmedRegistration) {
        return NextResponse.json({
          error: "team_registered",
          message: "This team has already completed their registration and cannot accept new members"
        }, { status: 400 });
      }

      // Count only accepted members
      const acceptedMemberCount = teamData.team_members.filter(
        (member: { invitation_status: string }) => member.invitation_status === 'accepted'
      ).length;

      console.log('Debug team capacity:', {
        acceptedMembers: acceptedMemberCount,
        maxSize: teamData.events.max_team_size,
        eventId: teamData.events.id,
        teamId
      });

      // Check if adding one more member would exceed the limit
      if (acceptedMemberCount >= teamData.events.max_team_size) {
        return NextResponse.json({
          error: "team_full",
          message: "This team has reached its maximum capacity and cannot accept more members"
        }, { status: 400 });
      }

      // Rest of your existing validation checks...
      // Check if registration is still open
      const now = new Date();
      const regStart = new Date(teamData.events.registration_start);
      const regEnd = new Date(teamData.events.registration_end);
      
      if (now < regStart || now > regEnd) {
        return NextResponse.json({
          error: "registration_closed",
          message: "Registration period for this event has ended or not started yet"
        }, { status: 400 });
      }

      // Check category compatibility both ways
      if (userProfile?.is_pccoe_student && !teamData.profiles.is_pccoe_student) {
        return NextResponse.json({
          error: "category_mismatch",
          message: "Due to competition rules, PCCOE students can only join teams created by other PCCOE students."
        }, { status: 400 });
      }

      if (!userProfile?.is_pccoe_student && teamData.profiles.is_pccoe_student) {
        return NextResponse.json({
          error: "category_mismatch",
          message: "Due to competition rules, you can only join teams created by other non-PCCOE participants."
        }, { status: 400 });
      }

      // Check if user already has accepted invitation for this event
      const { data: existingMembership } = await supabase
        .from('team_members')
        .select('teams!inner(event_id, team_name)')
        .eq('member_id', user.id)
        .eq('invitation_status', 'accepted')
        .eq('teams.event_id', teamData.events.id)
        .single();

      if (existingMembership) {
        return NextResponse.json({
          error: "existing_team",
          message: `You are already a member of a team for this event`
        }, { status: 400 });
      }
    }

    // Update member status
    const { error: updateError } = await supabase
      .from('team_members')
      .update({
        invitation_status: action === 'accept' ? 'accepted' : 'rejected',
        member_id: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('team_id', teamId)
      .eq('invitation_status', 'pending')
      .or(`member_email.eq.${userProfile?.email?.toLowerCase()},member_email.eq.${user.email?.toLowerCase()}`);

    if (updateError) {
      console.error("Member update error:", updateError);
      throw updateError;
    }

    // If successfully accepted, update team completion status if needed
    if (action === 'accept') {
      // Recheck member count after successful addition
      const { data: updatedMembers } = await supabase
        .from('team_members')
        .select('invitation_status')
        .eq('team_id', teamId)
        .eq('invitation_status', 'accepted');

      const newMemberCount = updatedMembers?.length || 0;
      
      // Update team status if it's now full
      if (newMemberCount === teamData.events.max_team_size) {
        await supabase
          .from('teams')
          .update({ is_complete: true })
          .eq('id', teamId);
      }
    }

    return NextResponse.json({ 
      success: true,
      message: `Invitation ${action}ed successfully` 
    });

  } catch (error: any) {
    console.error("Member update error:", error);
    return NextResponse.json(
      { 
        error: "server_error",
        message: "An unexpected error occurred. Please try again."
      },
      { status: 500 }
    );
  }
}
