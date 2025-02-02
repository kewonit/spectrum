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

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Check registration status
    const { data: registration } = await supabase
      .from('registrations')
      .select('*, teams(*)')
      .or(`individual_id.eq.${user.id},teams.team_members.cs.{member_id: ${user.id}}`)
      .eq('event_id', eventId)
      .single();

    if (!registration) {
      return NextResponse.json({
        isRegistered: false,
        type: null,
        profile
      });
    }

    return NextResponse.json({
      isRegistered: true,
      type: registration.individual_id ? 'solo' : 'team',
      teamId: registration.team_id,
      isLeader: registration.teams?.leader_id === user.id,
      profile
    });

  } catch (error) {
    console.error("Error checking registration status:", error);
    return NextResponse.json(
      { error: "Failed to check registration status" },
      { status: 500 }
    );
  }
}
