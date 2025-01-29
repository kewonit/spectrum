import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // First get user's email from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single();

    // Get all invites with team and event details (including history)
    const { data: invites, error } = await supabase
      .from('team_members')
      .select(`
        id,
        team_id,
        invitation_status,
        created_at,
        updated_at,
        member_email,
        teams (
          team_name,
          events (
            id,
            name,
            event_type,
            min_team_size,
            max_team_size
          )
        ),
        profiles:invited_by (
          full_name,
          email
        )
      `)
      .or(`member_email.eq.${profile?.email?.toLowerCase()},member_email.eq.${user.email?.toLowerCase()}`)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error("Error fetching invites:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Filter out any null teams (in case team was deleted)
    const validInvites = invites?.filter(invite => invite.teams) || [];

    return NextResponse.json({ 
      invites: validInvites,
      count: validInvites.length
    });

  } catch (error) {
    console.error("Failed to fetch invites:", error);
    return NextResponse.json(
      { error: "Failed to fetch team invites" },
      { status: 500 }
    );
  }
}