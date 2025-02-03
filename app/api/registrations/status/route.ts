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

interface TeamInvite {
  teams: {
    id: string;
    team_name: string;
    event_id: string;
    leader_id?: string;
  };
}

interface TeamStatus {
  teams: {
    id: string;
    team_name: string;
    event_id: string;
    leader_id: string;
    registrations: Array<{
      id: string;
      registration_status: string;
    }>;
  };
}

export const revalidate = 0; // Disable cache

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // First check for individual registration
    const { data: soloRegistration } = await supabase
      .from('registrations')
      .select(`
        *,
        payment:payments (
          status,
          amount,
          payment_time
        )
      `)
      .eq('event_id', eventId)
      .eq('individual_id', user.id)
      .not('registration_status', 'eq', 'cancelled')
      .maybeSingle();

    // If found solo registration, return it
    if (soloRegistration) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return NextResponse.json({
        isRegistered: true,
        type: 'solo',
        teamId: null,
        teamName: null,
        isLeader: false,
        registrationStatus: soloRegistration.registration_status,
        paymentStatus: soloRegistration.payment_status,
        profile: {
          is_pccoe_student: profile?.is_pccoe_student || false,
        },
        payment: {
          required: !profile?.is_pccoe_student,
          status: soloRegistration.payment?.status || 'pending',
          amount: soloRegistration.payment?.amount || null,
          timestamp: soloRegistration.payment?.payment_time || null
        }
      });
    }

    // Comprehensive status check for both solo and team
    const { data: registration } = await supabase
      .from('registrations')
      .select(`
        *,
        teams (
          id,
          team_name,
          leader_id,
          team_members (
            member_id,
            invitation_status
          )
        ),
        payment:payments (
          status,
          amount,
          payment_time
        )
      `)
      .or(
        `individual_id.eq.${user.id},` +
        `team_id.neq.null,teams.team_members.member_id.eq.${user.id}`
      )
      .eq('event_id', eventId)
      .not('registration_status', 'eq', 'cancelled')
      .single();

    // Check for active team membership or pending invites
    const { data: teamStatus } = await supabase
      .from('team_members')
      .select(`
        teams!inner(
          id,
          team_name,
          event_id,
          leader_id,
          registrations(*)
        )
      `)
      .eq('member_id', user.id)
      .eq('teams.event_id', eventId)
      .not('invitation_status', 'eq', 'rejected')
      .single() as { data: TeamStatus | null };

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Determine registration status
    const isRegistered = !!(
      registration || 
      (teamStatus?.teams?.registrations && teamStatus.teams.registrations.length > 0)
    );

    // Prepare response
    const response = {
      isRegistered,
      type: registration?.team_id ? 'team' : (registration?.individual_id ? 'solo' : null),
      teamId: registration?.teams?.id || teamStatus?.teams?.id || null,
      teamName: registration?.teams?.team_name || teamStatus?.teams?.team_name || null,
      isLeader: registration?.teams?.leader_id === user.id || teamStatus?.teams?.leader_id === user.id,
      registrationStatus: registration?.registration_status || null,
      paymentStatus: registration?.payment_status || null,
      profile: {
        is_pccoe_student: profile?.is_pccoe_student || false,
      },
      payment: {
        required: !profile?.is_pccoe_student,
        status: registration?.payment?.status || 'pending',
        amount: registration?.payment?.amount || null,
        timestamp: registration?.payment?.payment_time || null
      }
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error("Error checking registration status:", error);
    return NextResponse.json(
      { error: "Failed to check registration status" },
      { status: 500 }
    );
  }
}
