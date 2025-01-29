import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";

interface TeamRegistration {
  teams: {
    id: string;
    registrations: Array<{
      id: string;
      registration_status: string;
    }> | null;
  };
}

export const revalidate = 0; // Disable cache

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a team leader first
    const { data: leaderTeam } = await supabase
      .from('teams')
      .select(`
        id,
        registrations!inner (
          id,
          registration_status
        )
      `)
      .eq('event_id', eventId)
      .eq('leader_id', user.id)
      .single();

    if (leaderTeam?.id) {
      return NextResponse.json({
        isRegistered: true,
        type: 'team',
        teamId: leaderTeam.id,
        isLeader: true
      });
    }

    // Check for solo registration
    const { data: soloReg } = await supabase
      .from('registrations')
      .select('*')
      .eq('event_id', eventId)
      .eq('individual_id', user.id)
      .single();

    if (soloReg) {
      return NextResponse.json({
        isRegistered: true,
        type: 'solo'
      });
    }

    // Check for team registration
    const { data: teamMember } = await supabase
      .from('team_members')
      .select(`
        teams!inner(
          id,
          registrations(
            id,
            registration_status
          )
        )
      `)
      .eq('member_id', user.id)
      .eq('invitation_status', 'accepted')
      .eq('teams.event_id', eventId)
      .single() as { data: TeamRegistration | null };

    if (teamMember?.teams?.registrations && teamMember.teams.registrations.length > 0) {
      return NextResponse.json({
        isRegistered: true,
        type: 'team',
        teamId: teamMember.teams.id
      });
    }

    return NextResponse.json({
      isRegistered: false,
      type: null
    });
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json(
      { error: "Failed to check registration status" },
      { status: 500 }
    );
  }
}
