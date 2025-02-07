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
  const supabase = await createClient();

  try {
    const { eventId, teamName } = await request.json();

    if (!eventId || !teamName) {
      return NextResponse.json({ 
        error: "Event ID and team name are required" 
      }, { status: 400 });
    }

    // Get current user and their profile
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is already registered for this event
    const { data: existingRegistration } = await supabase
      .from('registrations')
      .select(`
        *,
        teams!inner(
          id,
          team_name
        )
      `)
      .eq('event_id', eventId)
      .or(`individual_id.eq.${user.id},teams.leader_id.eq.${user.id}`)
      .single();

    if (existingRegistration) {
      return NextResponse.json({
        error: "Already registered",
        message: "You are already registered for this event"
      }, { status: 400 });
    }

    // Get user's profile ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id) // Note: Using id instead of user_id since profiles uses auth.id
      .single();

    if (!profile) {
      return NextResponse.json({ 
        error: "User profile not found" 
      }, { status: 404 });
    }

    // First check if user is already a leader of a team for this event
    const { data: existingTeam } = await supabase
      .from('teams')
      .select()
      .eq('event_id', eventId)
      .eq('leader_id', profile.id)
      .single();

    if (existingTeam) {
      return NextResponse.json({
        success: true,
        teamId: existingTeam.id,
        message: "You are already leading a team"
      });
    }

    // Then check if user is a member of another team
    const { data: existingMembership } = await supabase
      .from('team_members')
      .select('teams!inner(event_id)')
      .eq('member_id', profile.id)
      .eq('teams.event_id', eventId)
      .not('invitation_status', 'eq', 'rejected')
      .single();

    if (existingMembership) {
      return NextResponse.json({
        error: "You are already a member of another team"
      }, { status: 400 });
    }

    // Create team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert({
        event_id: eventId,
        team_name: teamName,
        leader_id: profile.id,
        is_complete: false
      })
      .select()
      .single();

    if (teamError) {
      if (teamError.code === '23505') {
        return NextResponse.json({
          error: "Team name already exists for this event"
        }, {
          status: 409
        });
      }
      throw teamError;
    }

    // Add leader as accepted member
    const { error: memberError } = await supabase
      .from('team_members')
      .insert({
        team_id: team.id,
        member_id: profile.id,
        invitation_status: 'accepted',
        invited_by: profile.id
      });

    if (memberError) {
      // Rollback team creation
      await supabase.from('teams').delete().eq('id', team.id);
      throw memberError;
    }

    return NextResponse.json({
      success: true,
      teamId: team.id,
      message: "Team created successfully"
    });

  } catch (error: any) {
    console.error("Team creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create team" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  // Removes team or a member from a team.
  // ...removal logic...
  return NextResponse.json({ message: "Member or team removed." });
}