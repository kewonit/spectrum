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

    // Get user's email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single();

    // Get the event ID for this team
    const { data: team } = await supabase
      .from('teams')
      .select('event_id')
      .eq('id', teamId)
      .single();

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Check if user already has a team for this event
    if (action === 'accept') {
      const { data: existingTeam, error: queryError } = await supabase
        .from('team_members')
        .select(`
          teams!inner (
            event_id,
            team_name
          )
        `)
        .eq('member_id', user.id)
        .eq('invitation_status', 'accepted')
        .eq('teams.event_id', team.event_id)
        .single() as { data: TeamQueryResult | null, error: any };

      if (queryError && queryError.code !== 'PGRST116') { // PGRST116 is "not found" error
        throw new Error('existing_team_check_failed');
      }

      if (existingTeam) {
        return NextResponse.json({
          error: "existing_team",
          message: `You are already a member of team "${existingTeam.teams.team_name}" for this event`
        }, { status: 400 });
      }
    }

    // Convert action to proper enum value
    const newStatus = action === 'accept' ? 'accepted' : 'rejected';

    // Update the invitation status
    const { error: updateError } = await supabase
      .from('team_members')
      .update({
        invitation_status: newStatus,
        member_id: action === 'accept' ? user.id : null,
        updated_at: new Date().toISOString()
      })
      .eq('team_id', teamId)
      .eq('invitation_status', 'pending')
      .or(`member_email.eq.${profile?.email?.toLowerCase()},member_email.eq.${user.email?.toLowerCase()}`);

    if (updateError) {
      if (updateError.code === '23505') {
        return NextResponse.json({
          error: "existing_team",
          message: "You are already a member of a team for this event"
        }, { status: 400 });
      }
      throw updateError;
    }

    return NextResponse.json({ 
      success: true,
      message: `Invitation ${action}ed successfully` 
    });

  } catch (error: any) {
    console.error("Member update error:", error);
    if (error.message === 'existing_team_check_failed') {
      return NextResponse.json({
        error: "existing_team",
        message: "Could not verify team membership. Please try again."
      }, { status: 400 });
    }
    return NextResponse.json(
      { 
        error: "server_error",
        message: "An unexpected error occurred. Please try again."
      },
      { status: 500 }
    );
  }
}
