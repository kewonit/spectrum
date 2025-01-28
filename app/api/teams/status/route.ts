import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('eventId');

  if (!eventId) {
    return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has a team for this event
    const { data: team } = await supabase
      .from('teams')
      .select('*, team_members!inner(*)')
      .eq('event_id', eventId)
      .eq('team_members.member_id', user.id)
      .eq('team_members.invitation_status', 'accepted')
      .single();

    if (!team) {
      return NextResponse.json({ hasTeam: false });
    }

    return NextResponse.json({
      hasTeam: true,
      teamId: team.id,
      teamName: team.team_name,
      isLeader: team.leader_id === user.id,
      isComplete: team.is_complete
    });

  } catch (error) {
    console.error("Error checking team status:", error);
    return NextResponse.json(
      { error: "Failed to check team status" },
      { status: 500 }
    );
  }
}
